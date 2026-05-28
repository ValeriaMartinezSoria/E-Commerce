const cors = require('cors')
const dotenv = require('dotenv')
const express = require('express')
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

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`)
})