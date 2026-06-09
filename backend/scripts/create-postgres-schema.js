const dotenv = require('dotenv')
const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

dotenv.config()

async function createPostgresSchema() {
  const connectionString = process.env.POSTGRES_URI || 'postgresql://postgres:postgres@localhost:5432/football_store'
  const pool = new Pool({ connectionString })
  const initPath = path.join(__dirname, '..', 'db', 'init.sql')

  if (!fs.existsSync(initPath)) {
    throw new Error('Postgres init.sql not found')
  }

  const sql = fs.readFileSync(initPath, 'utf8')
  const client = await pool.connect()

  try {
    await client.query(sql)
    console.log('Postgres schema created from db/init.sql')
  } finally {
    client.release()
    await pool.end()
  }
}

if (require.main === module) {
  createPostgresSchema().catch((error) => {
    console.error('Failed to create Postgres schema', error)
    process.exit(1)
  })
}

module.exports = createPostgresSchema