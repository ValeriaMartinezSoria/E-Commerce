const express = require('express')
const { pool } = require('../config/pg')
const cryptoUtil = require('../utils/crypto')
const { v4: uuidv4 } = require('uuid')
const Cart = require('../models/Cart')
const Preference = require('../models/Preference')
const { validateCustomerPayload, validateUuidParam } = require('../middleware/validation')
const { requiredRole } = require('../middleware/rbac')

const router = express.Router()

router.post('/', validateCustomerPayload, async (req, res, next) => {
  const { name, email, card } = req.validatedBody
  try {
    const id = uuidv4()
    const encryptedCard = cryptoUtil.encrypt(card || '')
    const cardLast4 = card ? card.slice(-4) : null
    await pool.query(
      'INSERT INTO customers(id, name, email, encrypted_card, card_last4) VALUES($1,$2,$3,$4,$5)',
      [id, name || null, email || null, encryptedCard, cardLast4],
    )
    return res.status(201).json({ id })
  } catch (error) {
    return next(error)
  }
})

router.get('/:id', validateUuidParam('id'), async (req, res, next) => {
  const { id } = req.params
  try {
    const { rows } = await pool.query('SELECT id, name, email, encrypted_card, card_last4, created_at FROM customers WHERE id = $1', [id])
    if (!rows.length) return res.status(404).json({ message: 'Customer not found' })
    const customer = rows[0]
    // Do not return decrypted card by default
    delete customer.encrypted_card
    return res.json(customer)
  } catch (error) {
    return next(error)
  }
})

// Combined view: Postgres customer + Mongo cart + preferences
router.get('/:id/full', validateUuidParam('id'), requiredRole('admin'), async (req, res, next) => {
  const { id } = req.params
  try {
    const { rows } = await pool.query('SELECT id, name, email, created_at FROM customers WHERE id = $1', [id])
    if (!rows.length) return res.status(404).json({ message: 'Customer not found' })
    const customer = rows[0]

    const [cart, prefs] = await Promise.all([Cart.findOne({ customerId: id }), Preference.findOne({ customerId: id })])

    return res.json({ customer, cart: cart || null, preferences: prefs || null })
  } catch (error) {
    return next(error)
  }
})

module.exports = router
