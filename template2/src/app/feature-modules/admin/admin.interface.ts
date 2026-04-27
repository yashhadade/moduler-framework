import type { ObjectId } from 'typeorm';

export interface ICreateAdmin {
  name: string;
  email: string;
  isActive?: boolean | undefined;
  password: string;
  role?: string | undefined;
}

export interface ISetAdminPassword {
  email: string;
  password: string;
}

export interface IUpdateAdmin {
  name?: string | undefined;
  email?: string | undefined;
  isActive?: boolean | undefined;
  password?: string | undefined;
  role?: string | undefined;
}

export interface IAggregateResult {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}


export interface IAdmin {
  name: string;
  email: string;
  role?: string | undefined;
  isActive?: boolean | undefined;
  password?: string | null | undefined;
}

export interface IAdminInfo extends IAdmin {
  id: string;
}

