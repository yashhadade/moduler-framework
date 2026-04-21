import type { Types } from 'mongoose';
import crypto from 'crypto';
import refreshTokenRepo from './refreshToken.repo.js';
import { RefreshTokenStatus } from './refreshToken.schema.js';
import dotenv from 'dotenv';
dotenv.config();

const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || 7;

const createToken = async (userId: string | Types.ObjectId, role: string) => {
  const token = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + Number(REFRESH_TOKEN_EXPIRY) * 24 * 60 * 60 * 1000);

  const doc = await refreshTokenRepo.create({
    userId,
    role,
    token,
    status: RefreshTokenStatus.ACTIVE,
    expiresAt,
  });

  return { token, expiresAt, _id: doc._id };
};

const findByToken = async (token: string) => {
  return refreshTokenRepo.findOne({ token }) as Promise<{
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    role: string;
    token: string;
    status: string;
    expiresAt: Date;
  } | null>;
};

const revoke = (tokenId: string | Types.ObjectId) =>
  refreshTokenRepo.update({ _id: tokenId }, { status: RefreshTokenStatus.REVOKED });

const revokeByTokenString = (token: string) =>
  refreshTokenRepo.update({ token }, { status: RefreshTokenStatus.REVOKED });

const revokeAllForUser = (userId: string | Types.ObjectId) =>
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
