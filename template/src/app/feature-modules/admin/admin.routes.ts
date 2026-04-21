import express from 'express';
import adminServices from './admin.services.js';
import { ResponseHandler } from '../../utility/response.handler.js';
import { ADMIN_RESPONSES } from './admin.responces.js';
import { Route } from '../../routes/routes.types.js';
import type { ICreateAdmin,ISetAdminPassword } from './admin.interface.js';
import { validateBody } from '../../middleware/validateRequest.js';
import { adminCreateSchema, adminSetPasswordSchema } from './admin.validate.js';
import { Types } from 'mongoose';
const router = express.Router();

// Get all WhiteBox admins
router.get('/', async (_req, res, next) => {
  try {
    const admins = await adminServices.findLean();
    res.send(new ResponseHandler(admins));
  } catch (error) {
    next(error);
  }
});



// Create a single admin
router.post('/create', validateBody(adminCreateSchema), async (req, res, next) => {
  try {
    const { name, email, isActive, password } = req.body as ICreateAdmin;

    const existing = await adminServices.findOneLean({ email: email.toLowerCase() });
    if (existing) throw ADMIN_RESPONSES.ADMIN_ALREADY_EXISTS_WITH_EMAIL;

    const admin = await adminServices.create({
      name,
      email: email.toLowerCase(),
      isActive,
      password,
    });

    res.send(new ResponseHandler(admin));
  } catch (error) {
    next(error);
  }
});

router.post('/setAdminPassword', validateBody(adminSetPasswordSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body as ISetAdminPassword;

    await adminServices.setAdminPassword(email, password);
    res.send(new ResponseHandler('Password set successfully'));
  } catch (error) {
    next(error);
  }
});

router.get('/getCurrentUser', async (req, res, next) => {
  try {
    const user = await adminServices.findOneLean({ _id: new Types.ObjectId(res.locals.userId) });
    if (!user) throw ADMIN_RESPONSES.ADMIN_NOT_FOUND;
    res.send(new ResponseHandler(user));
  } catch (error) {
    next(error);
  }
});

export default new Route('/admin', router);
