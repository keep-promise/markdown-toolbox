
require('dotenv').config({path: '.env'});
const express = require('express');
const initDB = require('./init/initDB');
const initServer = require('./init/initServer')
// const html = require('./routes/html');

const app = express();

const main = async () => {
  // await initDB();
  await initServer(app);
}

main();

app.use('/get/html', (req, res) => {
  res.send('test');
})
