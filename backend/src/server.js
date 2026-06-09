const cors = require('cors')
const dotenv = require('dotenv')
const express = require('express')
const connectDatabase = require('./config/db')
const { connectPostgres } = require('./config/pg')
const seedProductsInDatabase = require('./services/productSeeder')
const { attachRequestUser } = require('./middleware/rbac')
const productsRouter = require('./routes/products.routes')
const customersRouter = require('./routes/customers.routes')
const ordersRouter = require('./routes/orders.routes')
const reportsRouter = require('./routes/reports.routes')
const cartRouter = require('./routes/cart.routes')
const preferencesRouter = require('./routes/preferences.routes')

dotenv.config()

const app = express()
const port = Number(process.env.PORT) || 4000

app.use(cors())
app.use(express.json())
app.use(attachRequestUser)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'football-ecommerce-api' })
})

app.use('/api/products', productsRouter)
app.use('/api/customers', customersRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/reports', reportsRouter)
app.use('/api/cart', cartRouter)
app.use('/api/preferences', preferencesRouter)

app.use((error, _req, res, _next) => {
  console.error(error)
  const status = error.status || error.statusCode || 500
  res.status(status).json({ message: error.message || 'Internal server error' })
})

async function startServer() {
  await Promise.all([connectDatabase(), connectPostgres()])
  try {
    await seedProductsInDatabase()
  } catch (err) {
    // If seeding fails due to MongoDB auth or other reasons, log and continue
    console.warn('Warning: product seeding skipped or failed:', err.message)
    console.warn('If this is an authentication issue, set MONGODB_URI with credentials or recreate the Mongo volume.')
  }

  app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`)
    console.log('MongoDB connected and seeded successfully')
  })
}

startServer().catch((error) => {
  console.error('Unable to start server', error)
  process.exit(1)
})