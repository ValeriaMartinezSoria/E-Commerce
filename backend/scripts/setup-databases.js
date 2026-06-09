const dotenv = require('dotenv')
const createPostgresSchema = require('./create-postgres-schema')
const seedAll = require('./seed-all')

dotenv.config()

async function setupDatabases() {
  await createPostgresSchema()
  await seedAll()
  console.log('Databases created and seeded successfully')
}

if (require.main === module) {
  setupDatabases().catch((error) => {
    console.error('Failed to setup databases', error)
    process.exit(1)
  })
}

module.exports = setupDatabases