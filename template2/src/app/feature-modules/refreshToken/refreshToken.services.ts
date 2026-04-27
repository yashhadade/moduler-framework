import crypto from 'crypto';
import dotenv from 'dotenv';
import refreshTokenRepo from './refreshToken.repo.js';
import { RefreshTokenStatus } from '../../utility/constant.js';

dotenv.config();

const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || 7;

const createToken = async (userId: string, role: string) => {
  const token = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + Number(REFRESH_TOKEN_EXPIRY) * 24 * 60 * 60 * 1000);
  await refreshTokenRepo.updateMany(
    { userId, status: RefreshTokenStatus.ACTIVE },
    { isDeleted: true }
  );
  const doc = await refreshTokenRepo.create({
    userId,
    role,
    token,
    status: RefreshTokenStatus.ACTIVE,
    expiresAt,
  });

  return { token, expiresAt, id: doc.id };
};

const findByToken = (token: string) => refreshTokenRepo.findOne({ token });

const revoke = (tokenId: string) =>
  refreshTokenRepo.update(tokenId, { status: RefreshTokenStatus.REVOKED });

const revokeByTokenString = (token: string) =>
  refreshTokenRepo.updateMany({ token }, { status: RefreshTokenStatus.REVOKED });

const revokeAllForUser = (userId: string) =>
  refreshTokenRepo.updateMany(
    { userId, status: RefreshTokenStatus.ACTIVE },
    { status: RefreshTokenStatus.REVOKED }
  );

export default {
  createToken,
  findByToken,
  revoke,
  revokeByTokenString,
  revokeAllForUser,
};
