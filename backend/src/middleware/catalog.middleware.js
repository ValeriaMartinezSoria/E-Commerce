const DEFAULT_LIMIT = 12
const MAX_LIMIT = 48

function normalizeText(value) {
  if (typeof value !== 'string') {
    return ''
  }

  return value.trim().toLowerCase()
}

function parsePositiveInteger(value, fallback, maximum = Number.POSITIVE_INFINITY) {
  const parsed = Number.parseInt(value, 10)

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback
  }

  return Math.min(parsed, maximum)
}

function sanitizeFilter(value) {
  const allowedOperators = new Set(['$gt', '$gte', '$lt', '$lte', '$eq', '$in', '$and', '$or', '$regex', '$options'])

  if (Array.isArray(value)) {
    return value.map(sanitizeFilter)
  }

  if (value && typeof value === 'object') {
    const sanitized = {}

    for (const [key, childValue] of Object.entries(value)) {
      if (key.startsWith('$')) {
        if (!allowedOperators.has(key)) {
          continue
        }

        sanitized[key] = sanitizeFilter(childValue)
        continue
      }

      sanitized[key] = sanitizeFilter(childValue)
    }

    return sanitized
  }

  return value
}

function buildCatalogContext(req, _res, next) {
  const category = normalizeText(req.query.category)
  const brand = normalizeText(req.query.brand)
  const search = normalizeText(req.query.q || req.query.search)
  const sort = normalizeText(req.query.sort) || 'latest'
  const page = parsePositiveInteger(req.query.page, 1)
  const limit = parsePositiveInteger(req.query.limit, DEFAULT_LIMIT, MAX_LIMIT)
  const featured = req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined

  const filter = {}

  if (category && category !== 'all') {
    filter.category = category
  }

  if (brand) {
    filter.brand = brand
  }

  if (typeof featured === 'boolean') {
    filter.featured = featured
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [search] } },
      { searchKeywords: { $in: [search] } },
    ]
  }

  req.catalog = {
    category,
    brand,
    search,
    sort,
    page,
    limit,
    filter,
  }

  next()
}

function buildAdvancedFilter(req, _res, next) {
  const rawFilter = req.body && typeof req.body.filter === 'object' ? req.body.filter : {}
  const sanitizedFilter = sanitizeFilter(rawFilter)

  req.catalog = {
    ...(req.catalog || {}),
    filter: sanitizedFilter,
    limit: req.catalog?.limit ?? DEFAULT_LIMIT,
    page: req.catalog?.page ?? 1,
    sort: req.catalog?.sort ?? 'latest',
  }

  next()
}

module.exports = {
  buildCatalogContext,
  buildAdvancedFilter,
  sanitizeFilter,
  parsePositiveInteger,
  normalizeText,
  DEFAULT_LIMIT,
  MAX_LIMIT,
}