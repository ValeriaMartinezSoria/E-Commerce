const express = require('express')
const products = require('../data/products')

const router = express.Router()

router.get('/', (req, res) => {
  const { category } = req.query

  if (!category || category === 'all') {
    return res.json(products)
  }

  const filtered = products.filter(
    (product) => product.category.toLowerCase() === String(category).toLowerCase(),
  )

  return res.json(filtered)
})

module.exports = router