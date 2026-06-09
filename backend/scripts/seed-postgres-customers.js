const dotenv = require('dotenv')
const { Pool } = require('pg')
const cryptoUtil = require('../src/utils/crypto')
const { customers } = require('./seed-data')

dotenv.config()

async function seedPostgresCustomers() {
  const connectionString = process.env.POSTGRES_URI || 'postgresql://postgres:postgres@localhost:5432/football_store'
  const pool = new Pool({ connectionString })

  try {
    for (const customer of customers) {
      const encryptedCard = cryptoUtil.encrypt(customer.card)
      const cardLast4 = customer.card.slice(-4)

      await pool.query(
        `INSERT INTO customers (id, name, email, encrypted_card, card_last4)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE
         SET name = EXCLUDED.name,
             email = EXCLUDED.email,
             encrypted_card = EXCLUDED.encrypted_card,
             card_last4 = EXCLUDED.card_last4`,
        [customer.id, customer.name, customer.email, encryptedCard, cardLast4],
      )
    }

    console.log('Postgres customers seeded successfully')
  } finally {
    await pool.end()
  }
}

if (require.main === module) {
  seedPostgresCustomers().catch((error) => {
    console.error('Failed to seed Postgres customers', error)
    process.exit(1)
  })
}

module.exports = seedPostgresCustomers