import { isBefore, startOfHour, parseISO, format, subHours } from 'date-fns';
import pt_br from 'date-fns/locale/pt-BR';
import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
import Notification from '../schemas/Notification';
import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      limit: 20,
      offset: (page - 1) * 20,
      order: ['date'],
      attributes: ['id', 'date', 'past', 'cancelable'],
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

    // Check if the given ID corresponds to a Provider
    const isProvider = await User.findOne({ where: { id: provider_id } });
    if (!isProvider)
      return res
        .status(401)
        .json({ error: 'The Provider with the given ID was not found.' });

    // Check if the user is trying to make appointment to himself.
    if (req.userId === provider_id)
      return res
        .status(400)
        .json({ error: 'You cannot make appointments to yourself.' });

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
    const { id, user_id } = appointment;

    const user = await User.findByPk(req.userId);
    const formatedDate = format(hourStart, "'dia' dd 'de' MMMM', às' H:mm'h'", {
      locale: pt_br,
    });

    // Notify Provider for new Appointments
    await Notification.create({
      content: `Novo agendamento de ${user.name} para ${formatedDate}`,
      user: provider_id,
    });

    return res.json({ id, user_id, provider_id, date });
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });

    // Check the appointment property
    if (appointment.user_id !== req.userId)
      return res.status(401).json({
        error: "You don't have permission to cancel this appointment.",
      });

    // Check appointment limit hour for appointment cancelation
    const subDate = subHours(appointment.date, 2);
    if (isBefore(subDate, new Date()))
      return res.status(401).json({
        error:
          'Appointments can only be canceled with a range of 2 hours at least.',
      });

    appointment.canceled_at = new Date();

    await appointment.save();

    const { id, user_id, provider_id, date, canceled_at } = appointment;

    // Add a new cancellation mail to jobs pipeline.
    await Queue.add(CancellationMail.key, {
      appointment,
    });

    return res.json({ id, user_id, provider_id, date, canceled_at });
  }
}

export default new AppointmentController();
