const dotenv = require('dotenv')
const { Pool } = require('pg')
const { customers, orders } = require('./seed-data')

dotenv.config()

async function seedPostgresOrders() {
  const connectionString = process.env.POSTGRES_URI || 'postgresql://postgres:postgres@localhost:5432/football_store'
  const pool = new Pool({ connectionString })

  try {
    const customerIds = customers.map((customer) => customer.id)
    const { rows: existingCustomers } = await pool.query('SELECT id FROM customers WHERE id = ANY($1::uuid[])', [customerIds])

    if (existingCustomers.length !== customerIds.length) {
      throw new Error('Customers must be seeded before orders')
    }

    for (const order of orders) {
      await pool.query(
        `INSERT INTO orders (id, customer_id, total)
         VALUES ($1, $2, $3)
         ON CONFLICT (id) DO UPDATE
         SET customer_id = EXCLUDED.customer_id,
             total = EXCLUDED.total`,
        [order.id, order.customerId, order.total],
      )

      await pool.query('DELETE FROM order_items WHERE order_id = $1', [order.id])

      for (const item of order.items) {
        await pool.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
          [order.id, item.productId, item.quantity, item.price],
        )
      }
    }

    console.log('Postgres orders seeded successfully')
  } finally {
    await pool.end()
  }
}

if (require.main === module) {
  seedPostgresOrders().catch((error) => {
    console.error('Failed to seed Postgres orders', error)
    process.exit(1)
  })
}

module.exports = seedPostgresOrders