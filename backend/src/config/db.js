const mongoose = require('mongoose')

async function connectDatabase() {
  const connectionString =
    process.env.MONGODB_URI ||
    'mongodb://ecom_admin:holamundo@localhost:27018/football_store?authSource=admin'

  await mongoose.connect(connectionString)
}

module.exports = connectDatabase