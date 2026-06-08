const express = require('express')
const Preference = require('../models/Preference')

const router = express.Router()

router.post('/:customerId', async (req, res, next) => {
  const { customerId } = req.params
  const { favorites, preferredCategories, metadata } = req.body
  try {
    const updated = await Preference.findOneAndUpdate(
      { customerId },
      { $set: { favorites: favorites || [], preferredCategories: preferredCategories || [], metadata: metadata || {} } },
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
    const prefs = await Preference.findOne({ customerId })
    if (!prefs) return res.status(404).json({ message: 'Preferences not found' })
    return res.json(prefs)
  } catch (error) {
    return next(error)
  }
})

module.exports = router
