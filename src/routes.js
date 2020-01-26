import { Router } from 'express';
import multer from 'multer';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FIleController';

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
// FILE API
routes.post(
  '/files',
  authMiddleware,
  upload.single('file'),
  FileController.create
);
export default routes;
