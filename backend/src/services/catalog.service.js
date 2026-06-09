const Product = require('../models/Product')

const SORT_PRESETS = {
  latest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  'price-asc': { price: 1, name: 1 },
  'price-desc': { price: -1, name: 1 },
  featured: { featured: -1, rating: -1, createdAt: -1 },
}

function getSortPreset(sortKey) {
  return SORT_PRESETS[sortKey] || SORT_PRESETS.latest
}

function normalizeProductDocument(product) {
  if (!product) {
    return product
  }

  const normalized = { ...product }

  if (!normalized.id && normalized._id) {
    normalized.id = normalized._id.toString()
  }

  delete normalized._id
  return normalized
}

function normalizePagination(page, limit) {
  const safePage = Number.isFinite(page) && page > 0 ? page : 1
  const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 12

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  }
}

async function listProducts({ filter = {}, page = 1, limit = 12, sort = 'latest' } = {}) {
  const pagination = normalizePagination(page, limit)
  const query = Product.find(filter).sort(getSortPreset(sort)).skip(pagination.skip).limit(pagination.limit)

  const [items, total] = await Promise.all([query.lean(), Product.countDocuments(filter)])

  return {
    items: items.map(normalizeProductDocument),
    meta: {
      total,
      page: pagination.page,
      limit: pagination.limit,
      pages: total === 0 ? 0 : Math.ceil(total / pagination.limit),
    },
  }
}

async function searchProducts(filter = {}, { limit = 48, sort = 'latest' } = {}) {
  const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 48

  const items = await Product.find(filter).sort(getSortPreset(sort)).limit(safeLimit).lean()
  return items.map(normalizeProductDocument)
}

async function getCatalogFacets() {
  const [categoryStats, brandStats, featuredCount, stockStats] = await Promise.all([
    Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ]),
    Product.aggregate([
      { $match: { brand: { $type: 'string', $ne: '' } } },
      { $group: { _id: '$brand', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 12 },
    ]),
    Product.countDocuments({ featured: true }),
    Product.aggregate([
      {
        $group: {
          _id: null,
          inStock: {
            $sum: {
              $cond: [{ $gt: ['$stock', 0] }, 1, 0],
            },
          },
          lowStock: {
            $sum: {
              $cond: [{ $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', 5] }] }, 1, 0],
            },
          },
          totalStock: { $sum: '$stock' },
        },
      },
    ]),
  ])

  return {
    categories: categoryStats.map((item) => ({ category: item._id, count: item.count })),
    brands: brandStats.map((item) => ({ brand: item._id, count: item.count })),
    featuredCount,
    stock: stockStats[0]
      ? {
          inStock: stockStats[0].inStock,
          lowStock: stockStats[0].lowStock,
          totalStock: stockStats[0].totalStock,
        }
      : { inStock: 0, lowStock: 0, totalStock: 0 },
  }
}

module.exports = {
  listProducts,
  searchProducts,
  getCatalogFacets,
  getSortPreset,
  SORT_PRESETS,
}