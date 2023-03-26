const dbConnection = require('../db/connection');

const initDB = () => {
  return new Promise(async (resolve, reject) => {
    try {
      await dbConnection();
      resolve();
    } catch(error) {
      console.log(error);
      reject(error)
    }
  })
}

module.exports = initDB;
