import express from 'express';
import routes, { excludedPaths } from './routes.data.js';
import { errorHandler } from '../middleware/errorHandler.js';
import { tokenValidator } from '../middleware/token.validate.js';
import { registerAppMiddleware } from '../middleware/app.middleware.js';

export const registerRoutes = (app: express.Application) => {
  registerAppMiddleware(app);

  for (const route of routes.routes) {
    app.use(route.path, tokenValidator(excludedPaths), route.router);
  }



  app.use(errorHandler);
};
