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

// Advanced search endpoint that accepts a JSON filter in the request body.
// Supported operators: $gt, $gte, $lt, $lte, $eq, $in, $and, $or, $regex
function sanitizeFilter(obj) {
  const allowedOps = new Set(['$gt', '$gte', '$lt', '$lte', '$eq', '$in', '$and', '$or', '$regex'])
  if (Array.isArray(obj)) return obj.map(sanitizeFilter)
  if (obj && typeof obj === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(obj)) {
      if (k.startsWith('$')) {
        if (!allowedOps.has(k)) continue
        out[k] = sanitizeFilter(v)
      } else {
        out[k] = sanitizeFilter(v)
      }
    }
    return out
  }
  return obj
}

router.post('/search', async (req, res, next) => {
  try {
    const rawFilter = req.body.filter || {}
    const filter = sanitizeFilter(rawFilter)
    // Allow searching inside attributes and arrays
    const products = await Product.find(filter).sort({ createdAt: -1 }).limit(200)
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