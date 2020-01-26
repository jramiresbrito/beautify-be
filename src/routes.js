import { Router } from 'express';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

const routes = new Router();

// USERS API
routes.post('/users', UserController.create);

// SESSIONS API
routes.post('/sessions', SessionController.create);

export default routes;
