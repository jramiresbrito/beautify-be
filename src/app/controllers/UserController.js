import User from '../models/User';
import File from '../models/File';

class UserController {
  async show(req, res) {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user)
      return res
        .status(400)
        .json({ error: 'The User with the given ID was not found.' });

    const { name, email, provider } = user;

    return res.json({ id, name, email, provider });
  }

  async index(req, res) {
    const { page = 1 } = req.query;
    const users = await User.findAll({
      limit: 5,
      offset: (page - 1) * 5,
      attributes: ['id', 'name', 'email', 'provider'],
    });

    return res.json(users);
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

    const user = await User.findByPk(req.userId);
    if (!user) return res.status(400).json({ error: 'Invalid User ID.' });

    const { email, oldPassword, password, avatar_id } = req.body;
    if (email && email !== user.email) {
      const emailInUse = await User.findOne({ where: { email } });
      if (emailInUse) return res.status(400).json({ error: 'E-mail in use.' });
    }

    if (password && !oldPassword)
      return res.status(400).json({ error: 'Old Password is required.' });

    if (oldPassword && !(await user.checkPassword(oldPassword)))
      return res.status(401).json({ error: 'Old Password does not match.' });

    if (avatar_id) {
      const fileExists = await File.findByPk(avatar_id);

      if (!fileExists)
        return res
          .status(400)
          .json({ error: 'The File with the given ID was not found.' });
    }

    const { id, name, provider } = await user.update(req.body);

    return res.json({ id, name, email, provider, avatar_id });
  }
}

export default new UserController();
