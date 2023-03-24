
require('dotenv');
const express = require('express');
const html = require('./routes/html');

const app = express();

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});

app.use('/get/html', (req, res) => {
  res.send('test');
})