export const Role = {
  ADMIN: 'ADMIN',
  CLIENT: 'CLIENT',
} as const;

export const RefreshTokenStatus = {
  ACTIVE: 'ACTIVE',
  REVOKED: 'REVOKED',
} as const;

export type RefreshTokenStatusValue = (typeof RefreshTokenStatus)[keyof typeof RefreshTokenStatus];
