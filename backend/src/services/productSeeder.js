const Product = require('../models/Product')
const seedProducts = require('../data/products')

async function seedProductsInDatabase() {
  await Promise.all(
    seedProducts.map((product) =>
      Product.updateOne(
        { name: product.name, category: product.category },
        { $set: product },
        { upsert: true },
      ),
    ),
  )
}

module.exports = seedProductsInDatabase