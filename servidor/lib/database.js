const mysql = require("mysql");
const {
  APP_MYSQL_LOCALHOST,
  APP_MYSQL_PORT,
  APP_MYSQL_USER,
  APP_MYSQL_PASSWORD,
  APP_MYSQL_DATABASE
} = process.env;

const connection = mysql.createConnection({
  host: APP_MYSQL_LOCALHOST,
  port: APP_MYSQL_PORT,
  user: APP_MYSQL_USER,
  password: APP_MYSQL_PASSWORD,
  database: APP_MYSQL_DATABASE
});

module.exports = connection;
