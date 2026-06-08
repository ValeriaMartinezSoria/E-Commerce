const express = require('express')
const Product = require('../models/Product')

const router = express.Router()

// Price summary per brand for a category (or all)
// GET /api/reports/price-summary?category=apparel
router.get('/price-summary', async (req, res, next) => {
  try {
    const { category } = req.query
    const match = !category || category === 'all' ? {} : { category: String(category).toLowerCase() }

    const agg = await Product.aggregate([
      { $match: match },
      {
        $group: {
          _id: { brand: '$brand' },
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      { $sort: { count: -1 } },
    ])

    return res.json(agg)
  } catch (error) {
    return next(error)
  }
})

// Compare multiple brands statistics within a category
// GET /api/reports/compare-brands?category=footwear&brands=FastKick,ControlMax
router.get('/compare-brands', async (req, res, next) => {
  try {
    const { category, brands } = req.query
    const match = { }
    if (category && category !== 'all') match.category = String(category).toLowerCase()
    if (brands) {
      const brandList = String(brands).split(',').map((b) => b.trim())
      match.brand = { $in: brandList }
    }

    const agg = await Product.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$brand',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          tags: { $push: '$tags' },
        },
      },
      { $sort: { avgPrice: -1 } },
    ])

    // Flatten tags arrays and return
    const result = agg.map((r) => ({
      brand: r._id,
      count: r.count,
      avgPrice: r.avgPrice,
      minPrice: r.minPrice,
      maxPrice: r.maxPrice,
      tags: Array.from(new Set(r.tags.flat().filter(Boolean))),
    }))

    return res.json(result)
  } catch (error) {
    return next(error)
  }
})

// Price distribution (buckets) for a category
// GET /api/reports/price-distribution?category=all&buckets=5
router.get('/price-distribution', async (req, res, next) => {
  try {
    const { category, buckets } = req.query
    const match = {}
    if (category && category !== 'all') match.category = String(category).toLowerCase()
    const bucketCount = Math.max(2, Number(buckets) || 5)

    const agg = await Product.aggregate([
      { $match: match },
      { $bucketAuto: { groupBy: '$price', buckets: bucketCount } },
    ])

    return res.json(agg)
  } catch (error) {
    return next(error)
  }
})

module.exports = router
