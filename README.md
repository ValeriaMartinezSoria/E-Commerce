# E-Commerce de Fútbol

Proyecto base de e-commerce local para productos de fútbol: camisetas, guantes, botines, pelotas y material de entrenamiento.

## Estructura

```text
.
|-- backend/
|   |-- src/
|   |   |-- data/products.js
|   |   |-- routes/products.routes.js
|   |   `-- server.js
|   `-- .env.example
|-- frontend/
|   `-- src/
|       |-- App.jsx
|       `-- index.css
`-- docker-compose.yml
```

## Tecnologías

- Frontend: React + Vite
- Backend: Node.js + Express
- Base de datos (para conectar después): MongoDB en Docker

## Ejecutar en local

1. Backend

```bash
cd backend
copy .env.example .env
npm run dev
```

2. Frontend (nueva terminal)

```bash
cd frontend
npm run dev
```

3. MongoDB con Docker

```bash
docker compose up -d
```

Servicios de Docker:
- MongoDB: http://localhost:27017
- Mongo Express: http://localhost:8081

La primera vez que arranca MongoDB, crea la base de datos `football_store` y carga una colección `products` desde `docker/mongo-init.js`.

## API disponible

- GET /api/health
- GET /api/products
- GET /api/products?category=footwear

Categorías actuales:
- footwear
- equipment
- apparel
- training

## Nota sobre MongoDB

MongoDB ya está inicializada en Docker y conectada al backend. Al arrancar el servidor, se sincroniza el catálogo base desde `backend/src/data/products.js` para mantener la colección `products` lista y completa.