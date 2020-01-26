require('dotenv/config');

module.exports = {
  dialect: process.env.DIALECT,
  host: process.env.SQL_HOST_URL,
  username: process.env.SQL_USERNAME,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DB_NAME,
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};
