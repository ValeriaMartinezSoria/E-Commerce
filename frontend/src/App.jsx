import { useEffect, useMemo, useState } from 'react'

const categoryTabs = [
  { key: 'all', label: 'Todos' },
  { key: 'footwear', label: 'Calzado' },
  { key: 'equipment', label: 'Equipamiento' },
  { key: 'apparel', label: 'Ropa' },
  { key: 'training', label: 'Entrenamiento' },
  { key: 'electronics', label: 'Electrónica' },
  { key: 'furniture', label: 'Muebles' },
  { key: 'kitchen', label: 'Cocina' },
  { key: 'decor', label: 'Decoración' },
]

const categoryLabels = {
  footwear: 'Calzado',
  equipment: 'Equipamiento',
  apparel: 'Ropa',
  training: 'Entrenamiento',
  electronics: 'Electrónica',
  furniture: 'Muebles',
  kitchen: 'Cocina',
  decor: 'Decoración',
}

const ROLE_STORAGE_KEY = 'pitch.dev.role'
const roleOptions = [
  { value: 'user', label: 'Usuario' },
  { value: 'admin', label: 'Admin' },
]

const fallbackProducts = [
  {
    id: 'ball-pro-001',
    name: 'Training Ball Pro',
    category: 'equipment',
    price: 49.99,
    image: '/products/ball.svg',
  },
  {
    id: 'cleat-speed-002',
    name: 'Speed Cleats',
    category: 'footwear',
    price: 279.99,
    image: '/products/boots.svg',
  },
  {
    id: 'cleat-control-003',
    name: 'Performance Boots',
    category: 'footwear',
    price: 249.99,
    image: '/products/boots.svg',
  },
  {
    id: 'jersey-away-004',
    name: 'Away Jersey Pro',
    category: 'apparel',
    price: 94.99,
    image: '/products/jersey.svg',
  },
  {
    id: 'gloves-keeper-005',
    name: 'Keeper Gloves Elite',
    category: 'equipment',
    price: 79.99,
    image: '/products/gloves.svg',
  },
  {
    id: 'cone-kit-006',
    name: 'Training Cone Kit',
    category: 'training',
    price: 34.99,
    image: '/products/training.svg',
  },
  {
    id: 'vest-pack-007',
    name: 'Bib Vest Pack',
    category: 'training',
    price: 29.99,
    image: '/products/training.svg',
  },
  {
    id: 'sock-pro-008',
    name: 'Match Socks Pro',
    category: 'apparel',
    price: 19.99,
    image: '/products/socks.svg',
  },
]

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)

function readStoredRole() {
  if (typeof window === 'undefined') {
    return 'user'
  }

  const storedRole = window.localStorage.getItem(ROLE_STORAGE_KEY)
  return storedRole === 'admin' ? 'admin' : 'user'
}

async function fetchWithRole(url, role, options = {}) {
  const headers = new Headers(options.headers || {})
  headers.set('x-user-roles', role)

  const response = await fetch(url, {
    ...options,
    headers,
  })

  return response
}

function App() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [products, setProducts] = useState(fallbackProducts)
  const [currentRole, setCurrentRole] = useState(readStoredRole)
  const [reportState, setReportState] = useState({ status: 'idle', data: null, error: '' })
  const [cart, setCart] = useState({
    'cleat-speed-002': 1,
    'cleat-control-003': 1,
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ROLE_STORAGE_KEY, currentRole)
    }
  }, [currentRole])

  useEffect(() => {
    const controller = new AbortController()

    const fetchProducts = async () => {
      try {
        const response = await fetchWithRole('/api/products', currentRole, { signal: controller.signal })
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
  }, [currentRole])

  useEffect(() => {
    const controller = new AbortController()

    const fetchAdminReport = async () => {
      if (currentRole !== 'admin') {
        setReportState({ status: 'idle', data: null, error: '' })
        return
      }

      setReportState({ status: 'loading', data: null, error: '' })

      try {
        const response = await fetchWithRole('/api/reports/price-summary?category=apparel', currentRole, {
          signal: controller.signal,
        })

        if (!response.ok) {
          const payload = await response.json().catch(() => null)
          setReportState({
            status: 'error',
            data: null,
            error: payload?.message || 'No se pudo cargar el reporte admin',
          })
          return
        }

        const result = await response.json()
        setReportState({ status: 'ready', data: result, error: '' })
      } catch (error) {
        if (controller.signal.aborted) {
          return
        }

        setReportState({
          status: 'error',
          data: null,
          error: error instanceof Error ? error.message : 'No se pudo cargar el reporte admin',
        })
      }
    }

    fetchAdminReport()

    return () => controller.abort()
  }, [currentRole])

  const visibleProducts = useMemo(() => {
    if (activeCategory === 'all') {
      return products
    }

    return products.filter((item) => item.category === activeCategory)
  }, [activeCategory, products])

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, quantity]) => {
        const product = products.find((item) => item.id === id)
        return product ? { ...product, quantity } : null
      })
      .filter(Boolean)
  }, [cart, products])

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

  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)
  const [orderConfirmation, setOrderConfirmation] = useState(null)

  const handleCheckout = async () => {
    if (!cartItems || cartItems.length === 0) return

    const customerId =
      (typeof window !== 'undefined' && window.localStorage.getItem('pitch.dev.customerId')) ||
      '11111111-1111-4111-8111-111111111111'

    const payloadItems = cartItems.map((it) => ({
      productId: it.id,
      quantity: it.quantity,
      price: it.price,
    }))

    try {
      setIsCheckoutLoading(true)

      // Persist cart to backend (upsert)
      const cartRes = await fetchWithRole(`/api/cart/${customerId}`, currentRole, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: payloadItems }),
      })

      if (!cartRes.ok) {
        const payload = await cartRes.json().catch(() => null)
        throw new Error(payload?.message || 'No se pudo guardar el carrito')
      }

      // Call checkout endpoint
      const checkoutRes = await fetchWithRole(`/api/orders/checkout/${customerId}`, currentRole, {
        method: 'POST',
      })

      if (!checkoutRes.ok) {
        const payload = await checkoutRes.json().catch(() => null)
        throw new Error(payload?.message || 'Error en el proceso de pago')
      }

      const result = await checkoutRes.json()
      setOrderConfirmation(result.order)
      setCart({})
      setIsCartOpen(false)
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Error al procesar el pago')
    } finally {
      setIsCheckoutLoading(false)
    }
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
          <div className="role-switcher" aria-label="Modo de prueba">
            {roleOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={option.value === currentRole ? 'role-pill active' : 'role-pill'}
                onClick={() => setCurrentRole(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
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
          <h1>Multitienda con catálogo híbrido</h1>
          <p>
            Explora una tienda híbrida con catálogo dinámico, clientes transaccionales y
            reportes comparativos sobre múltiples categorías de productos.
          </p>
          <div className="dev-banner">
            <span>Rol activo:</span>
            <strong>{currentRole}</strong>
            <small>Las requests a la API envían la cabecera `x-user-roles`.</small>
          </div>
        </section>

        {orderConfirmation && (
          <section className="order-confirmation" aria-live="polite">
            <div className="order-confirmation-inner">
              <strong>¡Compra realizada!</strong>
              <p>Orden: {orderConfirmation.id}</p>
              <p>Total: {formatCurrency(Number(orderConfirmation.total))}</p>
              <div>
                <button type="button" onClick={() => setOrderConfirmation(null)}>
                  Cerrar
                </button>
              </div>
            </div>
          </section>
        )}

        {currentRole === 'admin' && (
          <section className="admin-panel" aria-label="Reporte administrativo">
            <div className="admin-panel-header">
              <div>
                <span>Prueba RBAC</span>
                <h2>Reporte admin de precios</h2>
              </div>
              <button type="button" className="refresh-link" onClick={() => setCurrentRole('admin')}>
                Recargar
              </button>
            </div>

            {reportState.status === 'loading' && <p className="helper-text">Cargando reporte...</p>}
            {reportState.status === 'error' && <p className="helper-text error">{reportState.error}</p>}
            {reportState.status === 'ready' && reportState.data && (
              <div className="admin-report-grid">
                {reportState.data.map((item) => (
                  <article key={item._id.brand} className="report-card">
                    <span>{item._id.brand}</span>
                    <strong>{formatCurrency(item.avgPrice)}</strong>
                    <small>{item.count} productos</small>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

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
          <button
            type="button"
            className="checkout-btn"
            onClick={handleCheckout}
            disabled={isCheckoutLoading}
          >
            {isCheckoutLoading ? 'Procesando...' : 'Pagar'}
          </button>
        </footer>
      </aside>
    </div>
  )
}

export default App
