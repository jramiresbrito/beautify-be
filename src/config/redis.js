require('dotenv/config');

export default {
  host: process.env.QUEUE_HOST,
  port: JSON.parse(process.env.QUEUE_PORT),
};
