import User from '../models/User';
import File from '../models/File';

class ProviderController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const providers = await User.findAll({
      where: { provider: true },
      order: ['name'],
      limit: 5,
      offset: (page - 1) * 5,
      attributes: ['id', 'name', 'email'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'name', 'path', 'url'],
        },
      ],
    });
    return res.json(providers);
  }
}

export default new ProviderController();
