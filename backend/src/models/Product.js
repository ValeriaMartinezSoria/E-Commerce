const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    currency: {
      type: String,
      default: 'BOB',
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    searchKeywords: {
      type: [String],
      default: [],
      index: true,
    },
    gallery: {
      type: [String],
      default: [],
    },
    specs: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Flexible attributes to support dynamic category-specific fields
    attributes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Common arrays for tags, variants, brands, etc.
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    variants: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    brand: {
      type: String,
      index: true,
    },
    industry: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString()
        delete ret._id
      },
    },
  },
)

module.exports = mongoose.model('Product', productSchema)