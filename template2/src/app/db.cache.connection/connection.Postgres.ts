import 'reflect-metadata';
import { DataSource } from 'typeorm';
import logger from '../../logger.js';
import { Admin } from '../feature-modules/admin/admin.schema.js';
import { RefreshToken } from '../feature-modules/refreshToken/refreshToken.schema.js';

let _dataSource: DataSource | null = null;

const buildDataSource = () => {
  const url = process.env.POSTGRES_CONNECTION_URL;
  if (!url) {
    throw new Error('POSTGRES_CONNECTION_URL is not set');
  }
  return new DataSource({
    type: 'postgres',
    url,
    entities: [Admin, RefreshToken],
    synchronize: true, // dev only — auto-creates tables
    migrations: [],
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
