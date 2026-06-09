const customers = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Valeria Martinez',
    email: 'valeria@example.com',
    card: '4111111111111111',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'Carlos Perez',
    email: 'carlos.perez@example.com',
    card: '5555555555554444',
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    name: 'Ana Lopez',
    email: 'ana.lopez@example.com',
    card: '4012888888881881',
  },
]

const orders = [
  {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    customerId: customers[0].id,
    total: 329.98,
    items: [
      { productId: 'cleat-speed-002', quantity: 1, price: 279.99 },
      { productId: 'sock-pro-008', quantity: 1, price: 19.99 },
    ],
  },
  {
    id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    customerId: customers[1].id,
    total: 84.98,
    items: [
      { productId: 'ball-pro-001', quantity: 1, price: 49.99 },
      { productId: 'cone-kit-006', quantity: 1, price: 34.99 },
    ],
  },
  {
    id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    customerId: customers[2].id,
    total: 279.99,
    items: [
      { productId: 'gloves-keeper-005', quantity: 1, price: 79.99 },
      { productId: 'jersey-away-004', quantity: 1, price: 94.99 },
      { productId: 'training-cone-kit', quantity: 3, price: 34.99 },
    ],
  },
]

const preferences = [
  {
    customerId: customers[0].id,
    favorites: ['training-ball-pro', 'away-jersey-pro', 'match-socks-pro'],
    preferredCategories: ['equipment', 'apparel'],
    metadata: { language: 'es', notifications: true },
  },
  {
    customerId: customers[1].id,
    favorites: ['speed-cleats', 'keeper-gloves-elite'],
    preferredCategories: ['footwear', 'equipment'],
    metadata: { language: 'es', notifications: false },
  },
  {
    customerId: customers[2].id,
    favorites: ['training-cone-kit', 'bib-vest-pack'],
    preferredCategories: ['training'],
    metadata: { language: 'es', notifications: true },
  },
]

const carts = [
  {
    customerId: customers[0].id,
    items: [
      { productSlug: 'speed-cleats', quantity: 1 },
      { productSlug: 'match-socks-pro', quantity: 2 },
    ],
  },
  {
    customerId: customers[1].id,
    items: [
      { productSlug: 'training-ball-pro', quantity: 1 },
      { productSlug: 'training-cone-kit', quantity: 2 },
    ],
  },
  {
    customerId: customers[2].id,
    items: [
      { productSlug: 'keeper-gloves-elite', quantity: 1 },
      { productSlug: 'away-jersey-pro', quantity: 1 },
    ],
  },
]

module.exports = {
  customers,
  orders,
  preferences,
  carts,
}