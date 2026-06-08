const mongoose = require('mongoose')

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, required: true },
  quantity: { type: Number, required: true, default: 1 },
  price: { type: Number },
  name: { type: String },
  brand: { type: String },
})

const cartSchema = new mongoose.Schema(
  {
    customerId: { type: String, required: true, index: true },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true, versionKey: false },
)

module.exports = mongoose.model('Cart', cartSchema)
