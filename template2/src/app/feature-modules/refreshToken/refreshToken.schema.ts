// import { BaseSchema } from '../../utility/base.schema.js';
// import { model, Types } from 'mongoose';
// import { RefreshTokenStatus } from '../../utility/constant.js';
// const refreshTokenSchema = new BaseSchema({
//   userId: {
//     type: Types.ObjectId,
//     required: true,
//     index: true,
//   },
//   role: {
//     type: String,
//     required: true,
//   },
//   token: {
//     type: String,
//     required: true,
//     unique: true,
//     index: true,
//   },
//   status: {
//     type: String,
//     enum: Object.values(RefreshTokenStatus),
//     default: RefreshTokenStatus.ACTIVE,
//   },
//   expiresAt: {
//     type: Date,
//     required: true,
//     index: true,
//   },
// });

// export const refreshTokenModel = model('RefreshToken', refreshTokenSchema);
// export { RefreshTokenStatus };

import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../utility/base.entity.js';
import { RefreshTokenStatus, Role, type RefreshTokenStatusValue } from '../../utility/constant.js';

@Entity('refresh_tokens')
export class RefreshToken extends BaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  userId!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 512 })
  token!: string;

  @Column({ type: 'varchar', default: Role.ADMIN })
  role!: string;

  @Column({
    type: 'enum',
    enum: Object.values(RefreshTokenStatus),
    default: RefreshTokenStatus.ACTIVE,
  })
  status!: RefreshTokenStatusValue;

  @Index()
  @Column({ type: 'timestamp' })
  expiresAt!: Date;
}
