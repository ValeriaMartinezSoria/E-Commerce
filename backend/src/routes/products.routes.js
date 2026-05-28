const express = require('express')
const Product = require('../models/Product')

const router = express.Router()

router.get('/', async (req, res, next) => {
  const { category } = req.query

  try {
    const query = !category || category === 'all' ? {} : { category: String(category).toLowerCase() }
    const products = await Product.find(query).sort({ createdAt: -1 })

    return res.json(products)
  } catch (error) {
    return next(error)
  }
})

router.post('/refresh', async (_req, res, next) => {
  try {
    const count = await Product.countDocuments()
    return res.json({ ok: true, count })
  } catch (error) {
    return next(error)
  }
})

module.exports = router