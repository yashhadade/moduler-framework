import type { DeepPartial, FindOptionsWhere } from 'typeorm';
import AppDataSource from '../../db.cache.connection/connection.Postgres.js';
import { Admin } from './admin.schema.js';
import type { ICreateAdmin, IUpdateAdmin } from './admin.interface.js';

type AdminWhere = FindOptionsWhere<Admin> | FindOptionsWhere<Admin>[];

const repo = () => AppDataSource.getRepository(Admin);

/**
 * Injects `isDeleted: false` into every branch of a where clause.
 * Pass `{ withDeleted: true }` on a query to opt out.
 */
const withNotDeleted = (where: AdminWhere): AdminWhere =>
  Array.isArray(where)
    ? where.map((w) => ({ ...w, isDeleted: false }))
    : { ...where, isDeleted: false };

const create = (data: ICreateAdmin) => repo().save(repo().create(data as DeepPartial<Admin>));

const find = (where: AdminWhere = {}, opts?: { withDeleted?: boolean }) =>
  repo().find({ where: opts?.withDeleted ? where : withNotDeleted(where) });

const findOne = (where: AdminWhere, opts?: { withDeleted?: boolean }) =>
  repo().findOne({ where: opts?.withDeleted ? where : withNotDeleted(where) });

const update = (id: string, data: IUpdateAdmin) => repo().update(id, data as DeepPartial<Admin>);
const remove = (id: string) => repo().update(id, { isDeleted: true } as DeepPartial<Admin>);

export default { create, find, findOne, update, remove };
