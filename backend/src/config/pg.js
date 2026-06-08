const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

const connectionString = process.env.POSTGRES_URI || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/football_store'

const pool = new Pool({ connectionString })

async function connectPostgres() {
  // Try a simple query to ensure connection and run initialization SQL
  const client = await pool.connect()
  try {
    const initPath = path.join(__dirname, '..', '..', 'db', 'init.sql')
    if (fs.existsSync(initPath)) {
      const sql = fs.readFileSync(initPath, 'utf8')
      await client.query(sql)
      console.log('Postgres initialized from init.sql')
    } else {
      console.log('No Postgres init.sql found, skipping DB initialization')
    }
  } finally {
    client.release()
  }
}

module.exports = { pool, connectPostgres }
