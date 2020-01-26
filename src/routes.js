import { Router } from 'express';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

// USERS API
routes.post('/users', UserController.create);
routes.put('/users/:id', authMiddleware, UserController.update);
routes.delete('/users/:id', UserController.delete);
// SESSIONS API
routes.post('/sessions', SessionController.create);

export default routes;
