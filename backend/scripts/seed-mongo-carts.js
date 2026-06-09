const dotenv = require('dotenv')
const connectDatabase = require('../src/config/db')
const Cart = require('../src/models/Cart')
const Product = require('../src/models/Product')
const { carts } = require('./seed-data')
const mongoose = require('mongoose')

dotenv.config()

async function seedMongoCarts() {
  await connectDatabase()

  try {
    const productSlugs = [...new Set(carts.flatMap((cart) => cart.items.map((item) => item.productSlug)))]
    const products = await Product.find({ slug: { $in: productSlugs } }).select('_id slug name brand price').lean()
    const productMap = new Map(products.map((product) => [product.slug, product]))

    for (const cart of carts) {
      const items = cart.items.map((item) => {
        const product = productMap.get(item.productSlug)

        if (!product) {
          throw new Error(`Product with slug ${item.productSlug} not found for cart seed`)
        }

        return {
          productId: product._id,
          quantity: item.quantity,
          price: product.price,
          name: product.name,
          brand: product.brand,
        }
      })

      await Cart.findOneAndUpdate(
        { customerId: cart.customerId },
        { $set: { items } },
        { upsert: true, returnDocument: 'after' },
      )
    }

    console.log('MongoDB carts seeded successfully')
  } finally {
    await mongoose.disconnect()
  }
}

if (require.main === module) {
  seedMongoCarts().catch((error) => {
    console.error('Failed to seed MongoDB carts', error)
    process.exit(1)
  })
}

module.exports = seedMongoCarts