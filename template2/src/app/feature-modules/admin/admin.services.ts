import type { FindOptionsWhere } from 'typeorm';
import bcrypt from 'bcrypt';
import adminRepo from './admin.repo.js';
import { Admin } from './admin.schema.js';
import type { IAdmin, IAdminInfo, ICreateAdmin, IUpdateAdmin } from './admin.interface.js';
import { ADMIN_RESPONSES } from './admin.responces.js';

type AdminWhere = FindOptionsWhere<Admin> | FindOptionsWhere<Admin>[];

const create = async (adminData: ICreateAdmin) => {
  const admin = await adminRepo.create({
    name: adminData.name,
    email: adminData.email.toLowerCase(),
    isActive: adminData.isActive,
    password: await bcrypt.hash(adminData.password, 10),
  });
  return admin as IAdmin | null;
};

type QueryOpts = { withDeleted?: boolean };

const find = async (filter: AdminWhere = {}, opts?: QueryOpts) => {
  const admin = await adminRepo.find(filter, opts);
  return admin as unknown as IAdminInfo[];
};

const findLean = async (filter: AdminWhere = {}, opts?: QueryOpts) => {
  const admin = await adminRepo.find(filter, opts);
  return admin as unknown as IAdminInfo[];
};

const findOne = async (filter: AdminWhere = {}, opts?: QueryOpts) => {
  const admin = await adminRepo.findOne(filter, opts);
  return admin as unknown as IAdminInfo | null;
};

const findOneLean = async (filter: AdminWhere = {}, opts?: QueryOpts) => {
  const admin = await adminRepo.findOne(filter, opts);
  return admin as unknown as IAdminInfo | null;
};

const update = async (id: string, updateData: IUpdateAdmin) => {
  await adminRepo.update(id as string, updateData);
  const admin = await adminRepo.findOne({ id: id as string });
  return admin as IAdmin | null;
};

const remove = async (id: string) => {
  await adminRepo.remove(id);
  const admin = await adminRepo.findOne({ id });
  return admin as IAdmin | null;
};

const setAdminPassword = async (email: string, password: string) => {
  const admin = await findOneLean({ email: email.toLowerCase() });
  if (!admin) throw ADMIN_RESPONSES.ADMIN_NOT_FOUND;
  if (admin.password) throw ADMIN_RESPONSES.PASSWORD_ALREADY_SET;

  const hashedPassword = await bcrypt.hash(password, 10);
  const updatedAdmin = await update(String(admin.id), { password: hashedPassword });
  return updatedAdmin as IAdmin;
};

export default {
  create,
  find,
  findLean,
  findOne,
  findOneLean,
  update,
  remove,
  setAdminPassword,
};
