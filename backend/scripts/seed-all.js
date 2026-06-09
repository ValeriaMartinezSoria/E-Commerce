const dotenv = require('dotenv')
const seedPostgresCustomers = require('./seed-postgres-customers')
const seedPostgresOrders = require('./seed-postgres-orders')
const seedMongoProducts = require('./seed-mongo-products')
const seedMongoPreferences = require('./seed-mongo-preferences')
const seedMongoCarts = require('./seed-mongo-carts')

dotenv.config()

async function seedAll() {
  await seedPostgresCustomers()
  await seedPostgresOrders()
  await seedMongoProducts()
  await seedMongoPreferences()
  await seedMongoCarts()
  console.log('All databases seeded successfully')
}

if (require.main === module) {
  seedAll().catch((error) => {
    console.error('Failed to seed databases', error)
    process.exit(1)
  })
}

module.exports = seedAll