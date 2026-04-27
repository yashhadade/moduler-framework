export interface IClient {
  _id: string;
  email: string;
  password: string;
  username: string;
  role: string;
}

export interface IAdminLoginData {
  usernameOrEmail: string;
  password: string;
}
