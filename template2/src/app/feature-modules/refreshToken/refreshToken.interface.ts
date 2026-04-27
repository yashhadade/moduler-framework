import type { RefreshTokenStatusValue } from '../../utility/constant.js';

export interface ICreateRefreshToken {
  userId: string;
  token: string;
  role: string;
  status: RefreshTokenStatusValue;
  expiresAt: Date;
}

export interface IUpdateRefreshToken {
  userId?: string;
  token?: string;
  role?: string;
  status?: RefreshTokenStatusValue;
  expiresAt?: Date;
  isDeleted?: boolean;
}
