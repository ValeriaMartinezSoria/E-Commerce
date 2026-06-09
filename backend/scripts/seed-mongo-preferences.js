const dotenv = require('dotenv')
const connectDatabase = require('../src/config/db')
const Preference = require('../src/models/Preference')
const { preferences } = require('./seed-data')
const mongoose = require('mongoose')

dotenv.config()

async function seedMongoPreferences() {
  await connectDatabase()

  try {
    for (const preference of preferences) {
      await Preference.findOneAndUpdate(
        { customerId: preference.customerId },
        {
          $set: {
            favorites: preference.favorites,
            preferredCategories: preference.preferredCategories,
            metadata: preference.metadata,
          },
        },
        { upsert: true, returnDocument: 'after' },
      )
    }

    console.log('MongoDB preferences seeded successfully')
  } finally {
    await mongoose.disconnect()
  }
}

if (require.main === module) {
  seedMongoPreferences().catch((error) => {
    console.error('Failed to seed MongoDB preferences', error)
    process.exit(1)
  })
}

module.exports = seedMongoPreferences