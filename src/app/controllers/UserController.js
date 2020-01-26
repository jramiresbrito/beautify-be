import User from '../models/User';

class UserController {
  async show(req, res) {
    return res.json({ show: true });
  }

  async index(req, res) {
    return res.json({ index: true });
  }

  async create(req, res) {
    if (!(await User.validateUserCreation(req.body)))
      return res.status(400).json({ error: 'Validation failed.' });

    const { name, email, provider } = req.body;
    const userExists = await User.findOne({ where: { email } });
    if (userExists) return res.status(400).json({ error: 'E-mail in use.' });

    const user = await User.create(req.body);
    const { id } = user;

    return res.json({ id, name, email, provider });
  }

  async update(req, res) {
    if (!(await User.validateUserUpdate(req.body)))
      return res.status(400).json({ error: 'Validation Failed.' });

    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(400).json({ error: 'Invalid User ID.' });

    return res.json({ update: true });
  }

  async delete(req, res) {
    return res.json({ delete: true });
  }
}

export default new UserController();
