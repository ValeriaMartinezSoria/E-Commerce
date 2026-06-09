const dotenv = require('dotenv')
const { pool } = require('../src/config/pg')

dotenv.config()

async function verifySqlParameters() {
  const suspiciousEmail = "anything' OR '1'='1"
  const { rows } = await pool.query('SELECT id FROM customers WHERE email = $1', [suspiciousEmail])

  if (rows.length !== 0) {
    throw new Error('Parameterized query returned rows for a malicious value')
  }

  const { rows: countRows } = await pool.query('SELECT COUNT(*)::int AS total FROM customers')
  console.log(`Parameterized query check passed. Customers in table: ${countRows[0].total}`)
  await pool.end()
}

if (require.main === module) {
  verifySqlParameters().catch((error) => {
    console.error('Failed SQL parameterization check', error)
    process.exit(1)
  })
}

module.exports = verifySqlParameters