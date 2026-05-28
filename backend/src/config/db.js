const mongoose = require('mongoose')

async function connectDatabase() {
  const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/football_store'

  await mongoose.connect(connectionString)
}

module.exports = connectDatabase