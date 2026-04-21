#!/usr/bin/env node

const { program } = require("commander");
const fs = require("fs-extra");
const path = require("path");
const inquirer = require("inquirer");
const crypto = require('crypto');

program.version("1.0.0").description("My Custom Node.js Framework CLI");

// --- COMMAND: CREATE NEW PROJECT ---
program
  .argument('[project-name]', 'Name of the project to create')
  .action(async (projectName) => {
    if (!projectName) {
      const answers = await inquirer.prompt([{
        type: 'input', name: 'name', message: 'Project name?', default: 'my-api'
      }]);
      projectName = answers.name;
    }

    const targetDir = path.join(process.cwd(), projectName);
    const templateDir = path.resolve(__dirname, '../template');

    try {
      // 1. Copy everything from your template folder
      await fs.copy(templateDir, targetDir);
      
      // 2. Define the path where keys SHOULD live
      const keysDir = path.join(targetDir, 'src', 'app', 'utility', 'keys');

      // 3. Ensure the folder exists (just in case the template was empty)
      await fs.ensureDir(keysDir);

      console.log('🔐 Generating unique RSA keys for this project...');

      // 4. Generate the actual Key Pair
      const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      });

      // 5. Write them into the specific folder
      fs.writeFileSync(path.join(keysDir, 'private.pem'), privateKey);
      fs.writeFileSync(path.join(keysDir, 'public.pem'), publicKey);

      console.log(`🚀 Project ${projectName} created with unique security keys!`);
      
    } catch (err) {
      console.error('❌ Error during project creation:', err);
    }
  });

// --- COMMAND: GENERATE MODULE (g) ---
program
  .command("g <name>")
  .alias("generate")
  .action(async (moduleName) => {
    const featureDir = path.join(
      process.cwd(),
      "src",
      "app",
      "feature-modules",
    );

    if (!fs.existsSync(featureDir)) {
      console.error(
        "❌ Error: You must be in the root of your project to generate a module.",
      );
      return;
    }
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
    const newModulePath = path.join(featureDir, moduleName);
    const CapName = capitalize(moduleName); // e.g., 'user' -> 'User'

    await fs.ensureDir(newModulePath);

    const files = [
      "interface.ts",
      "repo.ts",
      "responses.ts",
      "routes.ts",
      "schema.ts",
      "services.ts",
      "validate.ts",
    ];

    files.forEach((file) => {
      const fileName = `${moduleName}.${file}`;
      const filePath = path.join(newModulePath, fileName);

      let content = `// Generated ${moduleName} ${file}\nexport {};`;

      // SPECIFIC LOGIC FOR INTERFACE FILE
      if (file === "interface.ts") {
        content =
          `export interface ICreate${CapName} {\n\n}\n\n` +
          `export interface IUpdate${CapName} {\n\n}\n\n` +
          `export interface I${CapName} {\n\n}`;
      }
      if (file === "schema.ts") {
        content = `import { BaseSchema } from "../../utility/base.schema.js";
import type { I${CapName} } from "./${moduleName}.interface.js";
import { model } from "mongoose";

const ${moduleName}_schema = new BaseSchema({

});

export const ${moduleName}Model = model<I${CapName}>('${moduleName}', ${moduleName}_schema);
`;
      }

      if (file === "repo.ts") {
        content = `import type { ClientSession, PipelineStage, Types } from 'mongoose';
import { ${moduleName}Model } from './${moduleName}.schema.js';
import type { I${CapName}, ICreate${CapName}, IUpdate${CapName} } from './${moduleName}.interface.js';

type MongoFilter = Record<string, unknown>;
type UpdateOpts = NonNullable<Parameters<typeof ${moduleName}Model.updateOne>[2]>;

const create = (data: ICreate${CapName}, session?: ClientSession) =>
  ${moduleName}Model.create([data as ICreate${CapName}], session ? { session } : {}).then((docs) => docs[0]);

const find = (filter: MongoFilter = {}) =>
  ${moduleName}Model.find(filter as I${CapName});

const findLean = (filter: MongoFilter = {}) =>
  ${moduleName}Model.find(filter as I${CapName}).lean();

const findOne = (filter: MongoFilter = {}) =>
  ${moduleName}Model.findOne(filter as I${CapName});

const findOneLean = (filter: MongoFilter = {}) =>
  ${moduleName}Model.findOne(filter as I${CapName}).lean();

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

      if (file === "services.ts") {
        content = `import type { Types } from 'mongoose';
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
  return ${moduleName} as I${CapName} | null;
};

const remove = async (id: string | Types.ObjectId) => {
  const ${moduleName} = await ${moduleName}Repo.remove(id);
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
      if(file === "validate.ts"){
        content = `
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
`
      }
      if(file === "routes.ts"){
        content = `import express from 'express';
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
    res.send(new ResponseHandler(developers));
  } catch (error) {
    next(error);
  }
});

// Create a ${moduleName}
router.post('/', validateBody(${moduleName}Create), async (req, res, next) => {
    try {
        const {}=req.body as ICreate${CapName};
      const ${moduleName} = await ${moduleName}Services.create({});
      res.send(new ResponseHandler(${moduleName}));
    } catch (error) {
      next(error);
    }
});

// Update a ${moduleName}
router.patch('/:id', validateBody(${moduleName}Update), async (req, res, next) => {
    try {
        const {}=req.body as IUpdate${CapName};
      const ${moduleName} = await ${moduleName}Services.update(req.params.id as string | Types.ObjectId, {});
      res.send(new ResponseHandler(developer));
    } catch (error) {
      next(error);
    }
});

// Get a ${moduleName} by id
router.get('/:id', async (req, res, next) => {
    try {
      const ${moduleName} = await ${moduleName}Services.findOneLean({ _id: new Types.ObjectId(req.params.id) });
      res.send(new ResponseHandler(developer));
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
`
      }

      fs.writeFileSync(filePath, content);
    });

    console.log(`✅ Module "${moduleName}" generated with Interfaces.`);
  });

program.parse(process.argv);
