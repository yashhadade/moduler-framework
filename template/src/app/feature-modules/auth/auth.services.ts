import { AUTH_RESPONSES } from './auth.responses.js';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { getPrivateKey } from '../../utility/key.generate.js';
import bcrpt from 'bcrypt';
import adminServices from '../admin/admin.services.js';
import refreshTokenServices from '../refreshToken/refreshToken.services.js';
import { RefreshTokenStatus } from '../refreshToken/refreshToken.schema.js';
import { Role } from '../../utility/constant.js';

const accessTokenOptions: SignOptions = {
  algorithm: 'RS256',
  expiresIn: (process.env.TOKEN_EXPIRES_IN || '1h') as Exclude<SignOptions['expiresIn'], undefined>,
};

const generateAccessToken = (payload: { id: string; role: string }) =>
  jwt.sign(payload, getPrivateKey(), accessTokenOptions);

const AdminLogin = async (usernameOrEmail: string, password: string) => {
  const admin = await adminServices.findOneLean({
    $or: [{ email: usernameOrEmail.toLowerCase() }, { name: usernameOrEmail }],
  });
  
  if (!admin) throw AUTH_RESPONSES.INVALID_CREDENTIALS;
  const isPasswordValid = await bcrpt.compare(password, admin.password as string);
  if (!isPasswordValid) throw AUTH_RESPONSES.INVALID_CREDENTIALS;
  const accessToken = generateAccessToken({
    id: admin._id as string,
    role: Role.ADMIN,
  });
  const refreshToken = await refreshTokenServices.createToken(
    admin._id as string,
    Role.ADMIN
  );;
  return { 
    accessToken, 
    refreshToken: refreshToken.token, 
    admin: { ...admin, password: undefined } 
  };
};
const refresh = async (refreshToken: string) => {
  const storedToken = await refreshTokenServices.findByToken(refreshToken);

  if (!storedToken) throw AUTH_RESPONSES.REFRESH_TOKEN_INVALID;
  if (storedToken.status === RefreshTokenStatus.REVOKED) throw AUTH_RESPONSES.REFRESH_TOKEN_REVOKED;
  if (storedToken.expiresAt < new Date()) {
    await refreshTokenServices.revoke(storedToken._id);
    throw AUTH_RESPONSES.REFRESH_TOKEN_EXPIRED;
  }

  // Revoke the old refresh token (rotation)
  await refreshTokenServices.revoke(storedToken._id);

  const newAccessToken = generateAccessToken({
    id: String(storedToken.userId),
    role: storedToken.role,
  });
  const newRefreshToken = await refreshTokenServices.createToken(
    storedToken.userId,
    storedToken.role
  );

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken.token,
  };
};


export default {
  AdminLogin,
  refresh,
};
