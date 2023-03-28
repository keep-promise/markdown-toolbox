
require('dotenv').config({path: '.env'});
const path = require('path');
const cors = require('cors');
const express = require('express');
const initDB = require('./init/initDB');
const initServer = require('./init/initServer')
const html = require('./routes/html');

const app = express();

const main = async () => {
  // await initDB();
  await initServer(app);
}

main();

app.use(cors({credentials: false, origin: true}))

app.use('/gethtml', html);

// app.get('*', (req, res) => {
//   res.sendFile(path.join(`${__dirname}/../client/public/index.html`));
// })
