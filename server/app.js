
require('dotenv').config({path: '.env'});
const express = require('express');
const { Sequelize } = require('sequelize');

// const html = require('./routes/html');

const app = express();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  dialect: process.env.DB_DIALECT,
  host: process.env.DB_HOST,
  logging: false,
  port: process.env.DB_PORT
});

const dbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(`mysql connect success on ${process.env.DB_PORT}`)
  } catch (error) {
    console.error('mysql connect fail', error)
  }
}

// mysql
dbConnection()

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});

app.use('/get/html', (req, res) => {
  res.send('test');
})