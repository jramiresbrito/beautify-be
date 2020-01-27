import { Router } from 'express';
import multer from 'multer';
import UserController from './app/controllers/UserController';
import ProviderController from './app/controllers/ProviderController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FIleController';
import AppointmentController from './app/controllers/AppointmentController';
import ScheduleController from './app/controllers/ScheduleController';
import NotificationController from './app/controllers/NotificationController';

import authMiddleware from './app/middlewares/auth';
import multerConfig from './config/multer';

const routes = new Router();
const upload = multer(multerConfig);

// USERS API
routes.get('/users/:id', UserController.show);
routes.get('/users', UserController.index);
routes.post('/users', UserController.create);
routes.put('/users', authMiddleware, UserController.update);
// SESSIONS API
routes.post('/sessions', SessionController.create);
// PROVIDERS API
routes.get('/providers', authMiddleware, ProviderController.index);
// APPOINTMENT API
routes.get('/appointments', authMiddleware, AppointmentController.index);
routes.post('/appointments', authMiddleware, AppointmentController.create);
// SCHEDULE API
routes.get('/schedule', authMiddleware, ScheduleController.index);
// NOTIFICATION API
routes.get('/notifications', authMiddleware, NotificationController.index);
// FILE API
routes.post(
  '/files',
  authMiddleware,
  upload.single('file'),
  FileController.create
);

export default routes;
