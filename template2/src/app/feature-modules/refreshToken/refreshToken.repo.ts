// import { RefreshToken } from './refreshToken.schema.js';

// type MongoFilter = Record<string, unknown>;

// const create = (data: Record<string, unknown>) => RefreshToken.create(data);

// const findOne = (filter: MongoFilter = {}) => RefreshToken.findOne(filter);

// const update = (filter: MongoFilter, data: Record<string, unknown>) =>
//   RefreshToken.updateOne(filter, data);

// const updateMany = (filter: MongoFilter, data: Record<string, unknown>) =>
//   RefreshToken.updateMany(filter, data);

// const deleteOne = (filter: MongoFilter) => RefreshToken.deleteOne(filter);

// export default { create, findOne, update, updateMany, deleteOne };

import { RefreshToken } from './refreshToken.schema.js';
import type { ICreateRefreshToken, IUpdateRefreshToken } from './refreshToken.interface.js';
import AppDataSource from '../../db.cache.connection/connection.Postgres.js';
import type { DeepPartial, FindOptionsWhere } from 'typeorm';

const repo = () => AppDataSource.getRepository(RefreshToken);
type RefreshTokenWhere = FindOptionsWhere<RefreshToken> | FindOptionsWhere<RefreshToken>[];
const withNotDeleted = (where: RefreshTokenWhere): RefreshTokenWhere =>
  Array.isArray(where)
    ? where.map((w) => ({ ...w, isDeleted: false }))
    : { ...where, isDeleted: false };

const create = (data: ICreateRefreshToken) =>
  repo().save(repo().create(data as DeepPartial<RefreshToken>));
const find = (where: RefreshTokenWhere = {}, opts?: { withDeleted?: boolean }) =>
  repo().find({ where: opts?.withDeleted ? where : withNotDeleted(where) });
const findOne = (where: RefreshTokenWhere, opts?: { withDeleted?: boolean }) =>
  repo().findOne({ where: opts?.withDeleted ? where : withNotDeleted(where) });
const update = (id: string, data: IUpdateRefreshToken) =>
  repo().update(id, data as DeepPartial<RefreshToken>);
const updateMany = (where: FindOptionsWhere<RefreshToken>, data: IUpdateRefreshToken) =>
  repo().update(where, data as DeepPartial<RefreshToken>);
const remove = (id: string) => repo().update(id, { isDeleted: true } as DeepPartial<RefreshToken>);

export default { create, find, findOne, update, updateMany, remove };
