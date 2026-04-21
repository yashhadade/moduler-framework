import { Router } from 'express';
import { ResponseHandler } from '../../utility/response.handler.js';
import authServices from './auth.services.js';
import { Route } from '../../routes/routes.types.js';
import { validateBody } from '../../middleware/validateRequest.js';
import type { IAdminLoginData } from './auth.interface.js';
import { adminLoginSchema, refreshTokenSchema } from './auth.validate.js';
const router = Router();



router.post('/admin/login', validateBody(adminLoginSchema), async (req, res, next) => {
  try {
    const { usernameOrEmail, password } = req.body as IAdminLoginData;
    const result = await authServices.AdminLogin(usernameOrEmail, password);
    res.send(new ResponseHandler(result));
  } catch (error: unknown) {
    next(error);
  }
});

router.post('/refresh', validateBody(refreshTokenSchema), async (req, res, next) => {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    const result = await authServices.refresh(refreshToken);
    res.send(new ResponseHandler(result));
  } catch (error) {
    next(error);
  }
});

export default new Route('/auth', router);
