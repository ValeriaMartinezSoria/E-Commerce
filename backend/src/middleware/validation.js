const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const CARD_DIGITS_REGEX = /^\d{13,19}$/

function createValidationError(message) {
  const error = new Error(message)
  error.status = 400
  return error
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function validateUuidParam(paramName) {
  return (req, _res, next) => {
    if (!UUID_REGEX.test(String(req.params[paramName] || ''))) {
      return next(createValidationError(`Invalid ${paramName}`))
    }

    return next()
  }
}

function normalizeCardNumber(value) {
  return String(value || '').replace(/[\s-]/g, '')
}

function luhnCheck(cardNumber) {
  let sum = 0
  let shouldDouble = false

  for (let index = cardNumber.length - 1; index >= 0; index -= 1) {
    let digit = Number.parseInt(cardNumber[index], 10)

    if (Number.isNaN(digit)) {
      return false
    }

    if (shouldDouble) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    shouldDouble = !shouldDouble
  }

  return sum % 10 === 0
}

function validateCustomerPayload(req, _res, next) {
  const { name, email, card } = req.body || {}

  if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
    return next(createValidationError('name must be a non-empty string'))
  }

  if (email !== undefined && (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim()))) {
    return next(createValidationError('email must be a valid email address'))
  }

  if (card !== undefined && card !== null && String(card).trim()) {
    const normalizedCard = normalizeCardNumber(card)
    if (!CARD_DIGITS_REGEX.test(normalizedCard) || !luhnCheck(normalizedCard)) {
      return next(createValidationError('card must be a valid card number'))
    }

    req.validatedBody = {
      name: typeof name === 'string' ? name.trim() : null,
      email: typeof email === 'string' ? email.trim().toLowerCase() : null,
      card: normalizedCard,
    }

    return next()
  }

  req.validatedBody = {
    name: typeof name === 'string' ? name.trim() : null,
    email: typeof email === 'string' ? email.trim().toLowerCase() : null,
    card: '',
  }

  return next()
}

function validateCartPayload(req, _res, next) {
  const { items } = req.body || {}

  if (!Array.isArray(items)) {
    return next(createValidationError('items must be an array'))
  }

  const normalizedItems = []

  for (const item of items) {
    if (!isPlainObject(item)) {
      return next(createValidationError('each item must be an object'))
    }

    const productId = String(item.productId || '').trim()
    const quantity = Number.parseInt(item.quantity, 10)

    if (!UUID_REGEX.test(productId) && !/^[0-9a-f]{24}$/i.test(productId)) {
      return next(createValidationError('productId must be a valid identifier'))
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return next(createValidationError('quantity must be an integer between 1 and 99'))
    }

    normalizedItems.push({
      productId,
      quantity,
      price: item.price,
      name: item.name,
      brand: item.brand,
    })
  }

  req.validatedBody = { items: normalizedItems }
  return next()
}

function validatePreferencePayload(req, _res, next) {
  const { favorites, preferredCategories, metadata } = req.body || {}

  const normalizeStringArray = (value, fieldName) => {
    if (value === undefined) {
      return []
    }

    if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string' || !entry.trim())) {
      throw createValidationError(`${fieldName} must be an array of non-empty strings`)
    }

    return value.map((entry) => entry.trim())
  }

  try {
    req.validatedBody = {
      favorites: normalizeStringArray(favorites, 'favorites'),
      preferredCategories: normalizeStringArray(preferredCategories, 'preferredCategories'),
      metadata: metadata === undefined ? {} : isPlainObject(metadata) ? metadata : null,
    }
  } catch (error) {
    return next(error)
  }

  if (req.validatedBody.metadata === null) {
    return next(createValidationError('metadata must be an object'))
  }

  return next()
}

function validateReportQuery(req, _res, next) {
  const { category, brands, buckets } = req.query

  if (category !== undefined && category !== 'all' && typeof category !== 'string') {
    return next(createValidationError('category must be a string'))
  }

  if (brands !== undefined && (typeof brands !== 'string' || !brands.trim())) {
    return next(createValidationError('brands must be a comma-separated string'))
  }

  if (buckets !== undefined) {
    const parsedBuckets = Number.parseInt(buckets, 10)
    if (!Number.isInteger(parsedBuckets) || parsedBuckets < 2 || parsedBuckets > 20) {
      return next(createValidationError('buckets must be an integer between 2 and 20'))
    }
  }

  return next()
}

module.exports = {
  validateUuidParam,
  validateCustomerPayload,
  validateCartPayload,
  validatePreferencePayload,
  validateReportQuery,
  normalizeCardNumber,
  luhnCheck,
  createValidationError,
}