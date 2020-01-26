import { Router } from 'express';
import User from './app/models/User';

const routes = new Router();

routes.get('/', async (req, res) => {
  const user = await User.create({
    name: 'User 1',
    email: 'user.1@email.com',
    password_hash: '123456',
  });

  return res.json(user);
});

export default routes;
