import { useEffect, useMemo, useState } from 'react'

const categoryTabs = [
  { key: 'all', label: 'Todos' },
  { key: 'footwear', label: 'Calzado' },
  { key: 'equipment', label: 'Equipamiento' },
  { key: 'apparel', label: 'Ropa' },
  { key: 'training', label: 'Entrenamiento' },
]

const categoryLabels = {
  footwear: 'Calzado',
  equipment: 'Equipamiento',
  apparel: 'Ropa',
  training: 'Entrenamiento',
}

const fallbackProducts = [
  {
    id: 'ball-pro-001',
    name: 'Training Ball Pro',
    category: 'equipment',
    price: 49.99,
    image:
      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'cleat-speed-002',
    name: 'Speed Cleats',
    category: 'footwear',
    price: 279.99,
    image:
      'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'cleat-control-003',
    name: 'Performance Boots',
    category: 'footwear',
    price: 249.99,
    image:
      'https://images.unsplash.com/photo-1550999280-7b3b6f2f2f58?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'jersey-away-004',
    name: 'Away Jersey Pro',
    category: 'apparel',
    price: 94.99,
    image:
      'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'gloves-keeper-005',
    name: 'Keeper Gloves Elite',
    category: 'equipment',
    price: 79.99,
    image:
      'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'cone-kit-006',
    name: 'Training Cone Kit',
    category: 'training',
    price: 34.99,
    image:
      'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'vest-pack-007',
    name: 'Bib Vest Pack',
    category: 'training',
    price: 29.99,
    image:
      'https://images.unsplash.com/photo-1522778034537-20a2486be803?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'sock-pro-008',
    name: 'Match Socks Pro',
    category: 'apparel',
    price: 19.99,
    image:
      'https://images.unsplash.com/photo-1508098682722-e99c643e7485?auto=format&fit=crop&w=900&q=80',
  },
]

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)

function App() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [products, setProducts] = useState(fallbackProducts)
  const [cart, setCart] = useState({
    'cleat-speed-002': 1,
    'cleat-control-003': 1,
  })

  useEffect(() => {
    const controller = new AbortController()

    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products', { signal: controller.signal })
        if (!response.ok) {
          return
        }

        const result = await response.json()
        if (Array.isArray(result) && result.length > 0) {
          setProducts(result)
        }
      } catch {
        // Keep fallback data when backend is not running.
      }
    }

    fetchProducts()

    return () => {
      controller.abort()
    }
  }, [])

  const visibleProducts = useMemo(() => {
    if (activeCategory === 'all') {
      return products
    }

    return products.filter((item) => item.category === activeCategory)
  }, [activeCategory])

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, quantity]) => {
        const product = products.find((item) => item.id === id)
        return product ? { ...product, quantity } : null
      })
      .filter(Boolean)
  }, [cart])

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)
  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)

  const handleAddToCart = (id) => {
    setCart((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }))
  }

  const updateQuantity = (id, nextQuantity) => {
    setCart((prev) => {
      if (nextQuantity <= 0) {
        const next = { ...prev }
        delete next[id]
        return next
      }

      return {
        ...prev,
        [id]: nextQuantity,
      }
    })
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand">PITCH</div>
        <nav className="main-nav" aria-label="Navegación principal">
          <a href="#">Tienda</a>
          <a href="#">Colecciones</a>
          <a href="#">Nosotros</a>
        </nav>
        <div className="top-actions">
          <button type="button" className="icon-btn" aria-label="Buscar">
            ⌕
          </button>
          <button
            type="button"
            className="icon-btn cart-trigger"
            aria-label="Abrir carrito"
            onClick={() => setIsCartOpen(true)}
          >
            🛒
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </button>
        </div>
      </header>

      <main>
        <section className="hero-block">
          <h1>Equipamiento premium de fútbol</h1>
          <p>
            Mejora tu juego con equipamiento de nivel profesional. Una colección
            seleccionada de botines, pelotas y ropa deportiva.
          </p>
        </section>

        <section className="filters" aria-label="Categorías de productos">
          {categoryTabs.map((tab) => (
            <button
              type="button"
              key={tab.key}
              className={tab.key === activeCategory ? 'chip active' : 'chip'}
              onClick={() => setActiveCategory(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </section>

        <section className="product-grid" aria-label="Productos">
          {visibleProducts.map((product) => (
            <article key={product.id} className="card">
              <img src={product.image} alt={product.name} loading="lazy" />
              <div className="card-info">
                <span>{categoryLabels[product.category] ?? product.category}</span>
                <h2>{product.name}</h2>
                <div className="card-bottom">
                  <strong>{formatCurrency(product.price)}</strong>
                  <button
                    type="button"
                    className="add-btn"
                    onClick={() => handleAddToCart(product.id)}
                    aria-label={`Agregar ${product.name} al carrito`}
                  >
                    +
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>

      <div
        className={isCartOpen ? 'overlay active' : 'overlay'}
        onClick={() => setIsCartOpen(false)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setIsCartOpen(false)
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Cerrar carrito"
      />

      <aside className={isCartOpen ? 'cart-drawer open' : 'cart-drawer'}>
        <div className="cart-header">
          <h3>Carrito</h3>
          <button
            type="button"
            className="icon-btn"
            aria-label="Cerrar carrito"
            onClick={() => setIsCartOpen(false)}
          >
            ×
          </button>
        </div>

        <div className="cart-content">
          {cartItems.length === 0 ? (
            <p className="empty">Tu carrito está vacío.</p>
          ) : (
            cartItems.map((item) => (
              <article key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} loading="lazy" />
                <div className="cart-item-info">
                  <div className="cart-item-top">
                    <strong>{item.name}</strong>
                    <strong>{formatCurrency(item.price * item.quantity)}</strong>
                  </div>
                  <span>{formatCurrency(item.price)}</span>
                  <div className="qty-controls">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        <footer className="cart-footer">
          <div>
            <span>Total</span>
            <strong>{formatCurrency(cartTotal)}</strong>
          </div>
          <button type="button" className="checkout-btn">
            Pagar
          </button>
        </footer>
      </aside>
    </div>
  )
}

export default App
