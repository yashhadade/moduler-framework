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

// export interface Admin extends CreateAdminData {
//   id: string;
//   password: string | null;
// }

export interface IAggregateResult {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface IAdminInfo {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  password?: string | null | undefined;
}

export interface IAdmin {
  name: string;
  email: string;
  role?: string | undefined;
  isActive?: boolean | undefined;
  password?: string | null | undefined;
}
