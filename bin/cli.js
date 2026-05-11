#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');
const crypto = require('crypto');

program.version('1.1.2').description('My Custom Node.js Framework CLI');

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

/** e.g. my-feature -> myFeatureRoutes */
const moduleNameToRoutesKey = (name) =>
  name.replace(/-([a-z])/g, (_, c) => c.toUpperCase()) + 'Routes';

/** Append feature router to routes.index.ts and routes.data.ts (idempotent). */
const wireModuleRoutes = (featureDir, moduleName) => {
  const routesKey = moduleNameToRoutesKey(moduleName);
  const importPath = `./${moduleName}/${moduleName}.routes.js`;
  const importLine = `import ${routesKey} from '${importPath}';`;
  const routesIndexPath = path.join(featureDir, 'routes.index.ts');

  if (fs.existsSync(routesIndexPath)) {
    let content = fs.readFileSync(routesIndexPath, 'utf8');
    const before = content;

    if (!content.includes(importPath)) {
      const lines = content.split(/\r?\n/);
      let insertAt = 0;
      for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].trim().startsWith('import ')) {
          insertAt = i + 1;
          break;
        }
      }
      lines.splice(insertAt, 0, importLine);
      content = lines.join('\n');
    }

    if (!content.includes(`${routesKey},`)) {
      content = content.replace(/export default \{/, `export default {\n  ${routesKey},`);
    }

    if (content !== before) {
      fs.writeFileSync(routesIndexPath, content);
    }
  }

  const routesDataPath = path.join(process.cwd(), 'src', 'app', 'routes', 'routes.data.ts');
  if (fs.existsSync(routesDataPath)) {
    let content = fs.readFileSync(routesDataPath, 'utf8');
    const needle = `Routers.${routesKey}`;
    if (!content.includes(needle)) {
      content = content.replace(/const routes = \[([^\]]*)\];/, (m, inner) => {
        const t = inner.trim();
        return `const routes = [${t}, ${needle}];`;
      });
      fs.writeFileSync(routesDataPath, content);
    }
  }
};

// ---------- DB TYPE DETECTION ----------
const DB_TYPES = { MONGO: 'mongodb', POSTGRES: 'postgres' };

const writeModulerConfig = (projectDir, dbType) => {
  const configPath = path.join(projectDir, '.moduler.json');
  fs.writeFileSync(configPath, JSON.stringify({ db: dbType }, null, 2));
};

const detectDbType = (cwd) => {
  // 1. Check marker file .moduler.json
  const configPath = path.join(cwd, '.moduler.json');
  if (fs.existsSync(configPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (cfg && cfg.db) return cfg.db;
    } catch (_) {
      // ignore and fall through to heuristics
    }
  }

  // 2. Heuristic based on connection files
  const connDir = path.join(cwd, 'src', 'app', 'db.cache.connection');
  if (fs.existsSync(path.join(connDir, 'connection.Postgres.ts'))) return DB_TYPES.POSTGRES;
  if (fs.existsSync(path.join(connDir, 'connection.mongo.ts'))) return DB_TYPES.MONGO;

  return null;
};

// ---------- COMMAND: CREATE NEW PROJECT ----------
program
  .argument('[project-name]', 'Name of the project to create')
  .option('--mongo', 'Use MongoDB template')
  .option('--postgres', 'Use PostgreSQL template')
  .action(async (projectName, options) => {
    if (!projectName) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Project name?',
          default: 'my-api',
        },
      ]);
      projectName = answers.name;
    }

    // Decide DB type: flag -> prompt
    let dbType = null;
    if (options && options.mongo) dbType = DB_TYPES.MONGO;
    else if (options && options.postgres) dbType = DB_TYPES.POSTGRES;

    if (!dbType) {
      const dbAnswer = await inquirer.prompt([
        {
          type: 'list',
          name: 'db',
          message: 'Which database do you want to use?',
          choices: [
            { name: 'MongoDB (Mongoose)', value: DB_TYPES.MONGO },
            { name: 'PostgreSQL (TypeORM)', value: DB_TYPES.POSTGRES },
          ],
          default: DB_TYPES.MONGO,
        },
      ]);
      dbType = dbAnswer.db;
    }

    const templateFolder = dbType === DB_TYPES.POSTGRES ? 'template2' : 'template';
    const targetDir = path.join(process.cwd(), projectName);
    const templateDir = path.resolve(__dirname, `../${templateFolder}`);

    try {
      await fs.copy(templateDir, targetDir);

      // Persist DB choice so that `g` can auto-detect later
      writeModulerConfig(targetDir, dbType);

      const keysDir = path.join(targetDir, 'src', 'app', 'utility', 'keys');
      await fs.ensureDir(keysDir);

      console.log('🔐 Generating unique RSA keys for this project...');

      const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      });

      fs.writeFileSync(path.join(keysDir, 'private.pem'), privateKey);
      fs.writeFileSync(path.join(keysDir, 'public.pem'), publicKey);

      const dbLabel = dbType === DB_TYPES.POSTGRES ? 'PostgreSQL (TypeORM)' : 'MongoDB (Mongoose)';
      console.log(
        `🚀 Project ${projectName} created with ${dbLabel} setup and unique security keys!`
      );
    } catch (err) {
      console.error('❌ Error during project creation:', err);
    }
  });

// ---------- MODULE FILE GENERATORS ----------

const MODULE_FILES = [
  'interface.ts',
  'repo.ts',
  'responses.ts',
  'routes.ts',
  'schema.ts',
  'services.ts',
  'validate.ts',
];

const buildMongoFileContent = (moduleName, CapName, file) => {
  if (file === 'interface.ts') {
    return (
      `export interface ICreate${CapName} {\n\n}\n\n` +
      `export interface IUpdate${CapName} {\n\n}\n\n` +
      `export interface I${CapName} {\n\n}`
    );
  }

  if (file === 'schema.ts') {
    return `import { BaseSchema } from "../../utility/base.schema.js";
import type { I${CapName} } from "./${moduleName}.interface.js";
import { model } from "mongoose";

const ${moduleName}_schema = new BaseSchema({

});

export const ${moduleName}Model = model<I${CapName}>('${moduleName}', ${moduleName}_schema);
`;
  }

  if (file === 'repo.ts') {
    return `import type { ClientSession, PipelineStage, Types,QueryFilter } from 'mongoose';
import { ${moduleName}Model } from './${moduleName}.schema.js';
import type { I${CapName}, ICreate${CapName}, IUpdate${CapName} } from './${moduleName}.interface.js';

type MongoFilter = QueryFilter<I${CapName}>;
type UpdateOpts = NonNullable<Parameters<typeof ${moduleName}Model.updateOne>[2]>;

const create = (data: ICreate${CapName}, session?: ClientSession) =>
  ${moduleName}Model.create([data as ICreate${CapName}], session ? { session } : {}).then((docs) => docs[0]);

const find = (filter: MongoFilter = {}) =>
  ${moduleName}Model.find(filter);

const findLean = (filter: MongoFilter = {}) =>
  ${moduleName}Model.find(filter).lean();

const findOne = (filter: MongoFilter = {}) =>
  ${moduleName}Model.findOne(filter);

const findOneLean = (filter: MongoFilter = {}) =>
  ${moduleName}Model.findOne(filter).lean();

const update = (id: string | Types.ObjectId, data: IUpdate${CapName}, options?: UpdateOpts) =>
  ${moduleName}Model.updateOne({ _id: id }, data, options);

const remove = (id: string | Types.ObjectId, options?: UpdateOpts) =>
  ${moduleName}Model.updateOne({ _id: id }, { isDeleted: true }, options);

const aggregate = <TResult = unknown>(pipeline: PipelineStage[]) =>
  ${moduleName}Model.aggregate<TResult>(pipeline);

export default {
  create,
  find,
  findLean,
  findOne,
  findOneLean,
  update,
  remove,
  aggregate,
};
`;
  }

  if (file === 'services.ts') {
    return `import type { Types } from 'mongoose';
import ${moduleName}Repo from './${moduleName}.repo.js';
import type { I${CapName}, ICreate${CapName}, IUpdate${CapName} } from './${moduleName}.interface.js';

type MongoFilter = Record<string, unknown>;

const create = async (${moduleName}Data: ICreate${CapName}) => {
  const ${moduleName} = await ${moduleName}Repo.create({

  });
  return ${moduleName} as I${CapName};
};

const find = async (filter: MongoFilter = {}) => {
  const ${moduleName} = await ${moduleName}Repo.find(filter);
  return ${moduleName} as I${CapName}[];
};

const findLean = async (filter: MongoFilter = {}) => {
  const ${moduleName} = await ${moduleName}Repo.findLean(filter);
  return ${moduleName} as I${CapName}[];
};

const findOne = async (filter: MongoFilter = {}) => {
  const ${moduleName} = await ${moduleName}Repo.findOne(filter);
  return ${moduleName} as I${CapName} | null;
};

const findOneLean = async (filter: MongoFilter = {}) => {
  const ${moduleName} = await ${moduleName}Repo.findOneLean(filter);
  return ${moduleName} as I${CapName} | null;
};

const update = async (id: string | Types.ObjectId, updateData: IUpdate${CapName}) => {
  const ${moduleName} = await ${moduleName}Repo.update(id, updateData);
  return ${moduleName} 
};

const remove = async (id: string | Types.ObjectId) => {
  const ${moduleName} = await ${moduleName}Repo.remove(id);
  return ${moduleName} 
};

export default {
  create,
  find,
  findLean,
  findOne,
  findOneLean,
  update,
  remove,
};
`;
  }

  if (file === 'validate.ts') {
    return `
import { z } from 'zod';

const stringRequired = (requiredMessage: string, typeMessage = 'Must be a string') =>
  z.string({
    error: (issue) =>
      (issue as { input?: unknown }).input === undefined ? requiredMessage : typeMessage,
  });

export const ${moduleName}Create = z.object({
 
});

export const ${moduleName}Update = z.object({
  
});
`;
  }

  if (file === 'routes.ts') {
    return `import express from 'express';
import ${moduleName}Services from './${moduleName}.services.js';
import { ResponseHandler } from '../../utility/response.handler.js';
import { Route } from '../../routes/routes.types.js';
import type { ICreate${CapName}, IUpdate${CapName} } from './${moduleName}.interface.js';
import { validateBody } from '../../middleware/validateRequest.js';
import { ${moduleName}Create, ${moduleName}Update } from './${moduleName}.validate.js';
import { Types } from 'mongoose';
const router = express.Router();

// Get all ${moduleName}s
router.get('/', async (_req, res, next) => {
  try {
    const ${moduleName}s = await ${moduleName}Services.findLean();
    res.send(new ResponseHandler(${moduleName}s));
  } catch (error) {
    next(error);
  }
});

// Create a ${moduleName}
router.post('/', validateBody(${moduleName}Create), async (req, res, next) => {
    try {
        const {} = req.body as ICreate${CapName};
      const ${moduleName} = await ${moduleName}Services.create({});
      res.send(new ResponseHandler(${moduleName}));
    } catch (error) {
      next(error);
    }
});

// Update a ${moduleName}
router.patch('/:id', validateBody(${moduleName}Update), async (req, res, next) => {
    try {
       const id = req.params.id;
        if (typeof id !== 'string' || !id) {
          throw new Error('${moduleName} ID is required');
        }
        const updateData = req.body as IUpdate${CapName};  
      const ${moduleName} = await ${moduleName}Services.update( 
        new Types.ObjectId(id),
        updateData as IUpdate${CapName}
      );
      res.send(new ResponseHandler(${moduleName}));
    } catch (error) {
      next(error);
    }
});

// Get a ${moduleName} by id
router.get('/:id', async (req, res, next) => {
    try {
      const ${moduleName} = await ${moduleName}Services.findOneLean({ _id: new Types.ObjectId(req.params.id) });
      res.send(new ResponseHandler(${moduleName}));
    } catch (error) {
      next(error);
    }
});

// Delete a ${moduleName}
router.delete('/:id', async (req, res, next) => {
    try {
      const ${moduleName} = await ${moduleName}Services.remove(req.params.id as string | Types.ObjectId);
      res.send(new ResponseHandler(${moduleName}));
    } catch (error) {
      next(error);
    }
});

export default new Route('/${moduleName}', router);
`;
  }

  if (file === 'responses.ts') {
    return `export const ${moduleName.toUpperCase()}_RESPONSES = {
  NOT_FOUND: {
    statusCode: 404,
    message: '${CapName} not found',
  },
  ALREADY_EXISTS: {
    statusCode: 409,
    message: '${CapName} already exists',
  },
};
`;
  }

  return `// Generated ${moduleName} ${file}\nexport {};`;
};

const buildPostgresFileContent = (moduleName, CapName, file) => {
  if (file === 'interface.ts') {
    return (
      `export interface ICreate${CapName} {\n\n}\n\n` +
      `export interface IUpdate${CapName} {\n\n}\n\n` +
      `export interface I${CapName} {\n  id: string;\n}\n\n` +
      `export interface I${CapName}Info extends I${CapName} {\n\n}`
    );
  }

  if (file === 'schema.ts') {
    return `import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../utility/base.entity.js';

@Entity('${moduleName}s')
export class ${CapName} extends BaseEntity {
  // Define your columns here
  // Example:
  // @Column()
  // name!: string;
}
`;
  }

  if (file === 'repo.ts') {
    return `import type { DeepPartial, FindOptionsWhere } from 'typeorm';
import AppDataSource from '../../db.cache.connection/connection.Postgres.js';
import { ${CapName} } from './${moduleName}.schema.js';
import type { ICreate${CapName}, IUpdate${CapName} } from './${moduleName}.interface.js';

type ${CapName}Where = FindOptionsWhere<${CapName}> | FindOptionsWhere<${CapName}>[];

const repo = () => AppDataSource.getRepository(${CapName});

/**
 * Injects \`isDeleted: false\` into every branch of a where clause.
 * Pass \`{ withDeleted: true }\` on a query to opt out.
 */
const withNotDeleted = (where: ${CapName}Where): ${CapName}Where =>
  Array.isArray(where)
    ? where.map((w) => ({ ...w, isDeleted: false }))
    : { ...where, isDeleted: false };

const create = (data: ICreate${CapName}) => repo().save(repo().create(data as DeepPartial<${CapName}>));

const find = (where: ${CapName}Where = {}, opts?: { withDeleted?: boolean }) =>
  repo().find({ where: opts?.withDeleted ? where : withNotDeleted(where) });

const findOne = (where: ${CapName}Where, opts?: { withDeleted?: boolean }) =>
  repo().findOne({ where: opts?.withDeleted ? where : withNotDeleted(where) });

const update = (id: string, data: IUpdate${CapName}) =>
  repo().update(id, data as DeepPartial<${CapName}>);

const remove = (id: string) =>
  repo().update(id, { isDeleted: true } as DeepPartial<${CapName}>);

export default { create, find, findOne, update, remove };
`;
  }

  if (file === 'services.ts') {
    return `import type { FindOptionsWhere } from 'typeorm';
import ${moduleName}Repo from './${moduleName}.repo.js';
import { ${CapName} } from './${moduleName}.schema.js';
import type { I${CapName}, I${CapName}Info, ICreate${CapName}, IUpdate${CapName} } from './${moduleName}.interface.js';

type ${CapName}Where = FindOptionsWhere<${CapName}> | FindOptionsWhere<${CapName}>[];
type QueryOpts = { withDeleted?: boolean };

const create = async (${moduleName}Data: ICreate${CapName}) => {
  const ${moduleName} = await ${moduleName}Repo.create({
    ...${moduleName}Data,
  });
  return ${moduleName} as I${CapName} | null;
};

const find = async (filter: ${CapName}Where = {}, opts?: QueryOpts) => {
  const ${moduleName} = await ${moduleName}Repo.find(filter, opts);
  return ${moduleName} as I${CapName}Info[];
};

const findLean = async (filter: ${CapName}Where = {}, opts?: QueryOpts) => {
  const ${moduleName} = await ${moduleName}Repo.find(filter, opts);
  return ${moduleName} as I${CapName}Info[];
};

const findOne = async (filter: ${CapName}Where = {}, opts?: QueryOpts) => {
  const ${moduleName} = await ${moduleName}Repo.findOne(filter, opts);
  return ${moduleName} as I${CapName}Info | null;
};

const findOneLean = async (filter: ${CapName}Where = {}, opts?: QueryOpts) => {
  const ${moduleName} = await ${moduleName}Repo.findOne(filter, opts);
  return ${moduleName} as I${CapName}Info | null;
};

const update = async (id: string, updateData: IUpdate${CapName}) => {
  await ${moduleName}Repo.update(id, updateData);
  const ${moduleName} = await ${moduleName}Repo.findOne({ id });
  return ${moduleName} as I${CapName} | null;
};

const remove = async (id: string) => {
  await ${moduleName}Repo.remove(id);
  const ${moduleName} = await ${moduleName}Repo.findOne({ id });
  return ${moduleName} as I${CapName} | null;
};

export default {
  create,
  find,
  findLean,
  findOne,
  findOneLean,
  update,
  remove,
};
`;
  }

  if (file === 'validate.ts') {
    return `import { z } from 'zod';

const stringRequired = (requiredMessage: string, typeMessage = 'Must be a string') =>
  z.string({
    error: (issue) =>
      (issue as { input?: unknown }).input === undefined ? requiredMessage : typeMessage,
  });

export const ${moduleName}Create = z.object({

});

export const ${moduleName}Update = z.object({

});
`;
  }

  if (file === 'routes.ts') {
    return `import express from 'express';
import ${moduleName}Services from './${moduleName}.services.js';
import { ResponseHandler } from '../../utility/response.handler.js';
import { Route } from '../../routes/routes.types.js';
import type { ICreate${CapName}, IUpdate${CapName} } from './${moduleName}.interface.js';
import { validateBody } from '../../middleware/validateRequest.js';
import { ${moduleName}Create, ${moduleName}Update } from './${moduleName}.validate.js';
const router = express.Router();

// Get all ${moduleName}s
router.get('/', async (_req, res, next) => {
  try {
    const ${moduleName}s = await ${moduleName}Services.findLean();
    res.send(new ResponseHandler(${moduleName}s));
  } catch (error) {
    next(error);
  }
});

// Create a ${moduleName}
router.post('/', validateBody(${moduleName}Create), async (req, res, next) => {
  try {
    const data = req.body as ICreate${CapName};
    const ${moduleName} = await ${moduleName}Services.create(data);
    res.send(new ResponseHandler(${moduleName}));
  } catch (error) {
    next(error);
  }
});

// Update a ${moduleName}
router.patch('/:id', validateBody(${moduleName}Update), async (req, res, next) => {
  try {
    const data = req.body as IUpdate${CapName};
    const ${moduleName} = await ${moduleName}Services.update(req.params.id as string, data);
    res.send(new ResponseHandler(${moduleName}));
  } catch (error) {
    next(error);
  }
});

// Get a ${moduleName} by id
router.get('/:id', async (req, res, next) => {
  try {
    const ${moduleName} = await ${moduleName}Services.findOneLean({ id: req.params.id as string });
    res.send(new ResponseHandler(${moduleName}));
  } catch (error) {
    next(error);
  }
});

// Delete a ${moduleName}
router.delete('/:id', async (req, res, next) => {
  try {
    const ${moduleName} = await ${moduleName}Services.remove(req.params.id as string);
    res.send(new ResponseHandler(${moduleName}));
  } catch (error) {
    next(error);
  }
});

export default new Route('/${moduleName}', router);
`;
  }

  if (file === 'responses.ts') {
    return `export const ${moduleName.toUpperCase()}_RESPONSES = {
  NOT_FOUND: {
    statusCode: 404,
    message: '${CapName} not found',
  },
  ALREADY_EXISTS: {
    statusCode: 409,
    message: '${CapName} already exists',
  },
};
`;
  }

  return `// Generated ${moduleName} ${file}\nexport {};`;
};

// ---------- MODULE GENERATION CORE ----------

const generateModule = (moduleName, dbType) => {
  const featureDir = path.join(process.cwd(), 'src', 'app', 'feature-modules');

  if (!fs.existsSync(featureDir)) {
    console.error('❌ Error: You must be in the root of your project to generate a module.');
    return;
  }

  const CapName = capitalize(moduleName);
  const newModulePath = path.join(featureDir, moduleName);
  fs.ensureDirSync(newModulePath);

  const builder = dbType === DB_TYPES.POSTGRES ? buildPostgresFileContent : buildMongoFileContent;

  MODULE_FILES.forEach((file) => {
    const fileName = `${moduleName}.${file}`;
    const filePath = path.join(newModulePath, fileName);
    const content = builder(moduleName, CapName, file);
    fs.writeFileSync(filePath, content);
  });

  wireModuleRoutes(featureDir, moduleName);

  const dbLabel = dbType === DB_TYPES.POSTGRES ? 'PostgreSQL (TypeORM)' : 'MongoDB (Mongoose)';
  console.log(`✅ Module "${moduleName}" generated for ${dbLabel}.`);
  if (fs.existsSync(path.join(featureDir, 'routes.index.ts'))) {
    console.log(
      '   Routes registered in feature-modules/routes.index.ts and app/routes/routes.data.ts.'
    );
  }
};

// ---------- COMMAND: GENERATE MODULE (m / p / g) ----------

program
  .command('m <name>')
  .description('Generate a MongoDB (Mongoose) feature module')
  .action((moduleName) => generateModule(moduleName, DB_TYPES.MONGO));

program
  .command('p <name>')
  .description('Generate a PostgreSQL (TypeORM) feature module')
  .action((moduleName) => generateModule(moduleName, DB_TYPES.POSTGRES));

program
  .command('g <name>')
  .alias('generate')
  .description('Auto-detect project DB and generate a feature module')
  .action((moduleName) => {
    const dbType = detectDbType(process.cwd());
    if (!dbType) {
      console.error(
        '❌ Could not auto-detect project DB type. ' +
          'Make sure you are at the project root, or use `m` (MongoDB) / `p` (PostgreSQL) explicitly.'
      );
      return;
    }
    generateModule(moduleName, dbType);
  });

program.parse(process.argv);
