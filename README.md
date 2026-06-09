# E-Commerce de Fútbol

Proyecto local de e-commerce multitienda con frontend React + Vite, backend Node + Express y persistencia híbrida: MongoDB para catálogo/cartera de productos y PostgreSQL para clientes, pedidos y roles.

## Arquitectura

```mermaid
flowchart LR
	UI[Frontend React + Vite] -->|/api/*| API[Backend Express]
	API --> M[(MongoDB)]
	API --> P[(PostgreSQL)]
	API --> D[Docker Compose]
	D --> M
	D --> P
	M --> C[Catálogo avanzado]
	P --> R[Customers / Orders / Roles]
```

## Flujo De Integración

1. Docker levanta MongoDB y PostgreSQL con `docker compose up -d`.
2. `npm run db:create` crea el esquema relacional en PostgreSQL.
3. `npm run db:seed` o `npm run db:setup` carga customers, orders, products, carts y preferences.
4. El backend expone la API en `http://localhost:4000`.
5. El frontend consume la API en `http://localhost:5173` y usa proxy a `/api`.

## Scripts De Base De Datos

Desde `backend/`:

```bash
npm run db:create
npm run db:seed
npm run db:seed:postgres
npm run db:seed:mongo
npm run db:seed:prefs
npm run db:seed:carts
npm run db:setup
```

## Ejecutar En Local

1. Levanta la infraestructura.

```bash
docker compose up -d
```

2. Prepara las bases de datos.

```bash
cd backend
npm run db:setup
```

3. Inicia el backend.

```bash
npm run dev
```

4. Inicia el frontend en otra terminal.

```bash
cd frontend
npm run dev
```

## Variables De Entorno

Backend: copiar [backend/.env.example](backend/.env.example) a `.env` si quieres sobreescribir valores por defecto.

Variables importantes:

- `PORT=4000`
- `MONGODB_URI=mongodb://ecom_admin:holamundo@localhost:27018/football_store?authSource=admin`
- `POSTGRES_URI=postgresql://postgres:postgres@localhost:5432/football_store`
- `CARD_ENC_KEY=replace-with-32-byte-secret`

## API Principal

- `GET /api/health`
- `GET /api/products`
- `GET /api/products/catalog`
- `GET /api/products/facets`
- `POST /api/products/search`
- `POST /api/products/refresh`
- `POST /api/customers`
- `GET /api/customers/:id`
- `GET /api/customers/:id/full`
- `POST /api/orders/checkout/:customerId`
- `GET /api/reports/price-summary?category=apparel`

## Seguridad

- RBAC local por cabeceras de desarrollo: `x-user-roles` o `x-user-role`.
- Validación de payloads en customers, carts, preferences y reports.
- Tarjetas cifradas con AES-256-GCM en backend y `card_last4` para visualización parcial.

## Notas

- El catálogo se sincroniza desde `backend/src/data/products.js` y cubre varias categorías de multitienda.
- MongoDB inicializa índices y documentos base desde `docker/mongo-init.js`.
- PostgreSQL inicializa `roles`, `customers`, `orders` y `order_items` desde `backend/db/init.sql`.