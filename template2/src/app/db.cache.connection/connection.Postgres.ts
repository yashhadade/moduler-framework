import 'reflect-metadata';
import { DataSource } from 'typeorm';
import logger from '../../logger.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let _dataSource: DataSource | null = null;

const buildDataSource = () => {
  const url = process.env.POSTGRES_CONNECTION_URL;
  if (!url) {
    throw new Error('POSTGRES_CONNECTION_URL is not set');
  }
  return new DataSource({
    type: 'postgres',
    url,
    entities: [__dirname + '/../feature-modules/**/*.schema.{ts,js}'],
    synchronize: false, // dev only — auto-creates tables
    migrations: [__dirname + "/migrations/*.ts"], // Where migrations will be saved
    migrationsRun: true,
    logging: false,
  });
};

export const AppDataSource = new Proxy({} as DataSource, {
  get(_target, prop) {
    if (!_dataSource) _dataSource = buildDataSource();
    return Reflect.get(_dataSource, prop, _dataSource);
  },
});

export const connectToPostgres = async () => {
  try {
    if (!_dataSource) _dataSource = buildDataSource();
    if (!_dataSource.isInitialized) await _dataSource.initialize();
    logger.info('Connected to Postgres (TypeORM) successfully');
    return true;
  } catch (error) {
    logger.error('Failed to Connect with Postgres', error);
    return false;
  }
};

export default AppDataSource;
