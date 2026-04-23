import Routers from '../feature-modules/routes.index.js';
import { ExcludedPath } from '../middleware/token.validate.js';
import authRoutes from '../feature-modules/auth/auth.routes.js';

const routes = [Routers.adminRoutes, authRoutes];

export default { routes };

export const excludedPaths = [
  new ExcludedPath('/admin/', 'POST'),
  new ExcludedPath('/auth/admin/login', 'POST'),
  new ExcludedPath('/auth/refresh', 'POST'),
];
