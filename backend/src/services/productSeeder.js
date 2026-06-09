const Product = require('../models/Product')
const seedProducts = require('../data/products')

async function seedProductsInDatabase() {
  await Product.deleteMany({ slug: { $exists: false } })

  const operations = seedProducts.map((product) => ({
    updateOne: {
      filter: { slug: product.slug },
      update: { $set: product },
      upsert: true,
    },
  }))

  if (operations.length > 0) {
    await Product.bulkWrite(operations, { ordered: false })
  }
}

module.exports = seedProductsInDatabase