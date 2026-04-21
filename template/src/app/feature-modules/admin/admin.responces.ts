export const ADMIN_RESPONSES = {
  DATA_INVALID: {
    statusCode: 400,
    message: 'Invalid data provided',
  },
  ADMIN_ALREADY_EXISTS_WITH_EMAIL: {
    statusCode: 409,
    message: 'Admin already exists with this email',
  },
  ADMIN_NOT_FOUND: {
    statusCode: 404,
    message: 'Admin not found',
  },
  PASSWORD_ALREADY_SET: {
    statusCode: 409,
    message: 'Password already set for this admin',
  },
  CLIENT_NOT_FOUND: {
    statusCode: 404,
    message: 'Client not found',
  },
  ASSET_NOT_FOUND: {
    statusCode: 404,
    message: 'Asset not found',
  },
  ASSET_ALREADY_HAS_THIS_STATUS: {
    statusCode: 400,
    message: 'Asset already has this status',
  },
};
