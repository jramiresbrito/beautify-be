require('dotenv/config');

export default {
  host: process.env.MAIL_HOST,
  port: JSON.parse(process.env.MAIL_PORT),
  secure: JSON.parse(process.env.MAIL_SECURE),
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  default: {
    from: process.env.MAIL_DEFAULT_FROM,
  },
};
