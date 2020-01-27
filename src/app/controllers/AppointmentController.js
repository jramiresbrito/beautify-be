import { isBefore, startOfHour, parseISO } from 'date-fns';
import Appointment from '../models/Appointment';
import User from '../models/User';

class AppointmentController {
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

    return res.json(appointment);
  }
}

export default new AppointmentController();
