import { refreshTokenModel } from './refreshToken.schema.js';

type MongoFilter = Record<string, unknown>;

const create = (data: Record<string, unknown>) => refreshTokenModel.create(data);

const findOne = (filter: MongoFilter = {}) => refreshTokenModel.findOne(filter);

const update = (filter: MongoFilter, data: Record<string, unknown>) =>
  refreshTokenModel.updateOne(filter, data);

const updateMany = (filter: MongoFilter, data: Record<string, unknown>) =>
  refreshTokenModel.updateMany(filter, data);

const deleteOne = (filter: MongoFilter) => refreshTokenModel.deleteOne(filter);

export default { create, findOne, update, updateMany, deleteOne };
