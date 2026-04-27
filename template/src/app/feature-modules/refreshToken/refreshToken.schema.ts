import { BaseSchema } from '../../utility/base.schema.js';
import { model, Types } from 'mongoose';
import { RefreshTokenStatus } from '../../utility/constant.js';
const refreshTokenSchema = new BaseSchema({
  userId: {
    type: Types.ObjectId,
    required: true,
    index: true,
  },
  role: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  status: {
    type: String,
    enum: Object.values(RefreshTokenStatus),
    default: RefreshTokenStatus.ACTIVE,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
});

export const refreshTokenModel = model('RefreshToken', refreshTokenSchema);
