const express = require('express')
const { pool } = require('../config/pg')
const Cart = require('../models/Cart')
const Product = require('../models/Product')
const { validateUuidParam } = require('../middleware/validation')

const router = express.Router()

router.post('/checkout/:customerId', validateUuidParam('customerId'), async (req, res, next) => {
  const { customerId } = req.params
  const client = await pool.connect()

  try {
    const { rows: customers } = await client.query(
      'SELECT id, name, email, card_last4 FROM customers WHERE id = $1',
      [customerId],
    )

    if (!customers.length) {
      return res.status(404).json({ message: 'Customer not found' })
    }

    const cart = await Cart.findOne({ customerId }).lean()
    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' })
    }

    const productIds = cart.items.map((item) => item.productId)
    const products = await Product.find({ _id: { $in: productIds } }).lean()
    const productMap = new Map(products.map((product) => [product._id.toString(), product]))

    const normalizedItems = cart.items.map((item) => {
      const product = productMap.get(String(item.productId))

      if (!product) {
        throw Object.assign(new Error(`Product not found for item ${item.productId}`), { status: 400 })
      }

      return {
        productId: product._id.toString(),
        quantity: Number(item.quantity) || 1,
        price: Number(product.price),
      }
    })

    const total = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    await client.query('BEGIN')

    const orderResult = await client.query(
      'INSERT INTO orders(customer_id, total) VALUES($1, $2) RETURNING id, customer_id, total, created_at',
      [customerId, total],
    )

    const order = orderResult.rows[0]

    for (const item of normalizedItems) {
      await client.query(
        'INSERT INTO order_items(order_id, product_id, quantity, price) VALUES($1, $2, $3, $4)',
        [order.id, item.productId, item.quantity, item.price],
      )
    }

    await client.query('COMMIT')

    await Cart.deleteOne({ customerId })

    return res.status(201).json({
      ok: true,
      order,
      customer: customers[0],
      items: normalizedItems,
      total,
    })
  } catch (error) {
    try {
      await client.query('ROLLBACK')
    } catch (_rollbackError) {
      // ignore rollback errors, original error is more useful
    }

    return next(error)
  } finally {
    client.release()
  }
})

module.exports = router