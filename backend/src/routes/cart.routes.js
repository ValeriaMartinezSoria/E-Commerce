const express = require('express')
const Cart = require('../models/Cart')
const Product = require('../models/Product')

const router = express.Router()

// Upsert cart for a customer. Body: { items: [{ productId, quantity }] }
router.post('/:customerId', async (req, res, next) => {
  const { customerId } = req.params
  const { items } = req.body
  try {
    const productIds = (items || []).map((i) => i.productId)
    const products = await Product.find({ _id: { $in: productIds } })
    const productMap = new Map(products.map((p) => [p._id.toString(), p]))

    const snapshot = (items || []).map((it) => {
      const p = productMap.get(String(it.productId))
      return {
        productId: it.productId,
        quantity: Number(it.quantity) || 1,
        price: p ? p.price : it.price || 0,
        name: p ? p.name : it.name || '',
        brand: p ? p.brand : it.brand || '',
      }
    })

    const updated = await Cart.findOneAndUpdate(
      { customerId },
      { $set: { items: snapshot } },
      { upsert: true, new: true },
    )

    return res.json(updated)
  } catch (error) {
    return next(error)
  }
})

router.get('/:customerId', async (req, res, next) => {
  const { customerId } = req.params
  try {
    const cart = await Cart.findOne({ customerId })
    if (!cart) return res.status(404).json({ message: 'Cart not found' })
    return res.json(cart)
  } catch (error) {
    return next(error)
  }
})

module.exports = router
