const { Sequelize } = require("sequelize")

const sequelize = new Sequelize({
  dialect: "mysql",
  host: process.env.MYSQL_HOST || "localhost",
  port: process.env.MYSQL_PORT || 3306,
  database: process.env.MYSQL_DB || "hw3",
  username: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "root"
})
module.exports = sequelize