const cors = require('cors')
const dotenv = require('dotenv')
const express = require('express')
const connectDatabase = require('./config/db')
const seedProductsInDatabase = require('./services/productSeeder')
const productsRouter = require('./routes/products.routes')

dotenv.config()

const app = express()
const port = Number(process.env.PORT) || 4000

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'football-ecommerce-api' })
})

app.use('/api/products', productsRouter)

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ message: 'Internal server error' })
})

async function startServer() {
  await connectDatabase()
  await seedProductsInDatabase()

  app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`)
    console.log('MongoDB connected and seeded successfully')
  })
}

startServer().catch((error) => {
  console.error('Unable to start server', error)
  process.exit(1)
})