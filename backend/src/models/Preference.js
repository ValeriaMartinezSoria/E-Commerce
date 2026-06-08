const mongoose = require('mongoose')

const preferenceSchema = new mongoose.Schema(
  {
    customerId: { type: String, required: true, index: true },
    favorites: { type: [String], default: [] },
    preferredCategories: { type: [String], default: [] },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, versionKey: false },
)

module.exports = mongoose.model('Preference', preferenceSchema)
