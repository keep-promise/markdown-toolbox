const initServer = async (app) => {
  return new Promise((resolve, reject) => {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`server is running on http://localhost:${PORT}`);
      resolve();
    }).on('error', (error) => {
      console.log(error);
      reject(error);
    });
  })
}

module.exports = initServer;