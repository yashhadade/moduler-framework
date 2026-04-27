export const AUTH_RESPONSES = {
  INVALID_CREDENTIALS: {
    message: 'Invalid credentials',
    statusCode: 401,
  },
  DATA_INVALID: {
    message: 'Data is invalid',
    statusCode: 400,
  },
  TOKEN_EXPIRED: {
    message: 'Token expired',
    statusCode: 401,
  },
  TOKEN_INVALID: {
    message: 'Token is invalid',
    statusCode: 401,
  },
  REFRESH_TOKEN_INVALID: {
    message: 'Refresh token is invalid',
    statusCode: 401,
  },
  REFRESH_TOKEN_REVOKED: {
    message: 'Refresh token is revoked',
    statusCode: 401,
  },
  REFRESH_TOKEN_EXPIRED: {
    message: 'Refresh token is expired',
    statusCode: 401,
  },
};
