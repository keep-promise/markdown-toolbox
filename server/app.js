
require('dotenv');
const express = require('express');

const app = express();

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});