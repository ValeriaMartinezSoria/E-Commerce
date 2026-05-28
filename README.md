# Football E-Commerce

Local e-commerce starter project for football products: jerseys, gloves, boots, balls, and training gear.

## Structure

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

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database (to connect later): MongoDB in Docker

## Run Locally

1. Backend

```bash
cd backend
copy .env.example .env
npm run dev
```

2. Frontend (new terminal)

```bash
cd frontend
npm run dev
```

3. MongoDB with Docker (optional for now)

```bash
docker compose up -d
```

Docker services:
- MongoDB: http://localhost:27017
- Mongo Express: http://localhost:8081

## Available API

- GET /api/health
- GET /api/products
- GET /api/products?category=footwear

Current categories:
- footwear
- equipment
- apparel
- training

## MongoDB Note

Real MongoDB integration is prepared for a next iteration. For now, the API responds with mock data from backend/src/data/products.js.

## Git Author Configuration

If you want to set author identity for this repository:

```bash
git config user.name "ponkez9300"
git config user.email "pinkipandarojo@gmail.com"
```

For push authentication, use Git Credential Manager or a personal access token (recommended) instead of plain-text passwords.
