import type { PipelineStage, Types } from 'mongoose';
import bcrypt from 'bcrypt';
import adminRepo from './admin.repo.js';
import type { IAggregateResult, IAdmin, IAdminInfo, ICreateAdmin } from './admin.interface.js';
import { ADMIN_RESPONSES } from './admin.responces.js';

type MongoFilter = Record<string, unknown>;

const create = async (adminData: ICreateAdmin) => {
  const admin = await adminRepo.create({
    name: adminData.name,
    email: adminData.email.toLowerCase(),
    isActive: adminData.isActive,
    password: await bcrypt.hash(adminData.password, 10),
  });
  return admin as IAdmin | null;
};

const find = async (filter: MongoFilter = {}): Promise<IAdminInfo[]> => {
  const admin = await adminRepo.find(filter);
  return admin;
};

const findLean = async (filter: MongoFilter = {}): Promise<IAdminInfo[]> => {
  const admin = await adminRepo.findLean(filter);
  return admin;
};

const findOne = async (filter: MongoFilter = {}): Promise<IAdminInfo | null> => {
  const admin = await adminRepo.findOne(filter);
  return admin;
};

const findOneLean = async (filter: MongoFilter = {}): Promise<IAdminInfo | null> => {
  const admin = await adminRepo.findOneLean(filter);
  return admin;
};

const update = async (id: string | Types.ObjectId, updateData: Record<string, unknown>) => {
  await adminRepo.update(id, updateData);
  const admin = await adminRepo.findOne({ _id: id });
  return admin as IAdmin | null;
};

const remove = async (id: string | Types.ObjectId) => {
  await adminRepo.remove(id);
  const admin = await adminRepo.findOne({ _id: id });
  return admin as IAdmin | null;
};

const setAdminPassword = async (email: string, password: string) => {
  const admin = await findOneLean({ email: email.toLowerCase() });
  if (!admin) throw ADMIN_RESPONSES.ADMIN_NOT_FOUND;
  if (admin.password) throw ADMIN_RESPONSES.PASSWORD_ALREADY_SET;

  const hashedPassword = await bcrypt.hash(password, 10);
  const updatedAdmin = await update(String(admin._id), { password: hashedPassword });
  return updatedAdmin as IAdmin;
};

const aggregate = (pipeline: PipelineStage[]): Promise<IAggregateResult[]> =>
  adminRepo.aggregate<IAggregateResult>(pipeline).exec();

export default {
  create,
  find,
  findLean,
  findOne,
  findOneLean,
  update,
  remove,
  setAdminPassword,
  aggregate,
};
