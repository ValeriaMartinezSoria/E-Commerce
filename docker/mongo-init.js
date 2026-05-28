db = db.getSiblingDB('football_store')

if (!db.getCollectionNames().includes('products')) {
  db.createCollection('products')
}

const products = [
  {
    name: 'Training Ball Pro',
    category: 'equipment',
    price: 49.99,
    currency: 'BOB',
    createdAt: new Date(),
  },
  {
    name: 'Speed Cleats',
    category: 'footwear',
    price: 279.99,
    currency: 'BOB',
    createdAt: new Date(),
  },
  {
    name: 'Away Jersey Pro',
    category: 'apparel',
    price: 94.99,
    currency: 'BOB',
    createdAt: new Date(),
  },
  {
    name: 'Training Cone Kit',
    category: 'training',
    price: 34.99,
    currency: 'BOB',
    createdAt: new Date(),
  },
]

if (db.products.countDocuments() === 0) {
  db.products.insertMany(products)
}
