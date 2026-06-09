const dotenv = require('dotenv')
const connectDatabase = require('../src/config/db')
const seedProductsInDatabase = require('../src/services/productSeeder')
const mongoose = require('mongoose')

dotenv.config()

async function seedMongoProducts() {
  await connectDatabase()

  try {
    await seedProductsInDatabase()
    console.log('MongoDB products seeded successfully')
  } finally {
    await mongoose.disconnect()
  }
}

if (require.main === module) {
  seedMongoProducts().catch((error) => {
    console.error('Failed to seed MongoDB products', error)
    process.exit(1)
  })
}

module.exports = seedMongoProducts