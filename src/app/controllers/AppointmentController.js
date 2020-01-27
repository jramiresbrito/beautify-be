import { isBefore, startOfHour, parseISO, format } from 'date-fns';
import pt_br from 'date-fns/locale/pt-BR';
import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
import Notification from '../schemas/Notification';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      limit: 20,
      offset: (page - 1) * 20,
      order: ['date'],
      attributes: ['id', 'date'],
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'url', 'path'],
            },
          ],
        },
      ],
    });

    return res.json(appointments);
  }

  async create(req, res) {
    if (!(await Appointment.validateAppointment(req.body)))
      return res.status(400).json({ error: 'Validation Failed.' });

    const { provider_id, date } = req.body;

    const isProvider = await User.findOne({ where: { id: provider_id } });

    if (!isProvider)
      return res
        .status(401)
        .json({ error: 'The Provider with the given ID was not found.' });

    // Check for past dates
    const hourStart = startOfHour(parseISO(date));
    if (isBefore(hourStart, new Date()))
      return res.status(400).json({ error: 'Past dates are not permitted.' });

    // Check provider availability
    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });
    if (checkAvailability)
      return res.status(400).json({
        error: 'Appointment date for the given Provider is not available.',
      });

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date: hourStart,
    });

    const user = await User.findByPk(req.userId);
    const formatedDate = format(hourStart, "'dia' dd 'de' MMMM', às' H:mm'h'", {
      locale: pt_br,
    });

    // Notify Provider for new Appointments
    await Notification.create({
      content: `Novo agendamento de ${user.name} para ${formatedDate}`,
      user: provider_id,
    });

    return res.json(appointment);
  }
}

export default new AppointmentController();
