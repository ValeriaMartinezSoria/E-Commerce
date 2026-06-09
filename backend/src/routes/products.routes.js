const express = require('express')
const Product = require('../models/Product')
const { buildCatalogContext, buildAdvancedFilter } = require('../middleware/catalog.middleware')
const { listProducts, searchProducts, getCatalogFacets } = require('../services/catalog.service')
const { requiredRole } = require('../middleware/rbac')

const router = express.Router()

router.get('/', buildCatalogContext, async (req, res, next) => {
  try {
    const { items } = await listProducts(req.catalog)
    return res.json(items)
  } catch (error) {
    return next(error)
  }
})

router.get('/catalog', buildCatalogContext, async (req, res, next) => {
  try {
    const catalog = await listProducts(req.catalog)
    return res.json(catalog)
  } catch (error) {
    return next(error)
  }
})

router.get('/facets', async (_req, res, next) => {
  try {
    const facets = await getCatalogFacets()
    return res.json(facets)
  } catch (error) {
    return next(error)
  }
})

router.post('/search', buildAdvancedFilter, async (req, res, next) => {
  try {
    const products = await searchProducts(req.catalog.filter, {
      limit: req.catalog.limit,
      sort: req.catalog.sort,
    })
    return res.json(products)
  } catch (error) {
    return next(error)
  }
})

router.post('/refresh', requiredRole('admin'), async (_req, res, next) => {
  try {
    const count = await Product.countDocuments()
    return res.json({ ok: true, count })
  } catch (error) {
    return next(error)
  }
})

module.exports = router