import { Router } from 'express';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

// USERS API
routes.get('/users/:id', UserController.show);
routes.get('/users', UserController.index);
routes.post('/users', UserController.create);
routes.put('/users/:id', authMiddleware, UserController.update);
// SESSIONS API
routes.post('/sessions', SessionController.create);

export default routes;
