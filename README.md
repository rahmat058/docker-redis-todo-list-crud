<div align="center">

# ✅ TaskFlow

**An advanced, full-stack to-do list — NestJS · Prisma · PostgreSQL · Redis · React · Vite · Docker**

</div>

A production-style CRUD app with a smooth, polished UI, Redis-backed caching,
Prisma migrations and a one-command Docker Compose setup.

```
┌──────────────┐      /api/*       ┌──────────────┐   Prisma   ┌──────────────┐
│   Frontend   │ ────────────────▶ │   Backend    │ ─────────▶ │  PostgreSQL  │
│ React + Vite │   (Nginx proxy)   │   NestJS     │            │      16      │
│   Nginx :80  │                   │    :3000     │ ─────────▶ ┌──────────────┐
└──────────────┘                   └──────────────┘   cache    │   Redis 7    │
                                                               └──────────────┘
```

---

## 🚀 Quick start (Docker — recommended)

Everything (database, cache, API, UI) starts with a single command.

```bash
# 1. (optional) copy env defaults
cp .env.example .env

# 2. build & start the whole stack
docker compose up --build
```

Then open:

- **UI** → <http://localhost:5173>
- **API** → <http://localhost:3000/api>
- **Health** → <http://localhost:3000/api/health>

Stop it with `Ctrl+C`, or run detached with `docker compose up --build -d` and
stop with `docker compose down` (add `-v` to also remove the data volumes).

On first boot the backend container applies the Prisma migration automatically,
so the `todos` table is created for you.

---

## 🧩 Services & ports

| Service    | Image / Build        | Host port | Container port | Notes                         |
| ---------- | -------------------- | --------- | -------------- | ----------------------------- |
| `frontend` | `./frontend` (Nginx) | `5173`    | `80`           | React SPA + `/api` proxy      |
| `backend`  | `./backend` (NestJS) | `3000`    | `3000`         | REST API                      |
| `postgres` | `postgres:16-alpine` | `5432`    | `5432`         | Data in `todo_postgres_data`  |
| `redis`    | `redis:7-alpine`     | `6379`    | `6379`         | AOF persistence enabled       |

Override any host port in `.env` (see `.env.example`).

---

## 🛠️ Useful Docker commands

```bash
# Redis on its own (the command from the brief)
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Bring the whole stack up / down
docker compose up --build
docker compose down
docker compose down -v            # also delete data volumes

# Rebuild a single service
docker compose up --build backend

# Tail logs
docker compose logs -f backend

# Open a psql shell inside the database container
docker compose exec postgres psql -U todo -d todo_db

# Open a redis-cli shell
docker compose exec redis redis-cli

# Build images individually (without compose)
docker build -t todo-backend ./backend
docker build -t todo-frontend --build-arg VITE_API_URL=/api ./frontend
```

---

## 💻 Run without Docker (development)

You will need Node.js 20+ and Docker (for Postgres/Redis only).

```bash
# 1. Start the datastores
docker run -d --name redis    -p 6379:6379 redis:7-alpine
docker run -d --name postgres -p 5432:5432 \
  -e POSTGRES_USER=todo -e POSTGRES_PASSWORD=todo_password -e POSTGRES_DB=todo_db \
  postgres:16-alpine

# 2. Backend  (terminal 1)
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run start:dev            # http://localhost:3000/api

# 3. Frontend (terminal 2)
cd frontend
npm install
npm run dev                  # http://localhost:5173
```

---

## 📚 API overview

Base URL: `http://localhost:3000/api`

| Method   | Endpoint              | Description                        |
| -------- | --------------------- | ---------------------------------- |
| `GET`    | `/health`             | Health check (pings Redis)         |
| `POST`   | `/todos`              | Create a task                      |
| `GET`    | `/todos`              | List/filter/search/sort tasks      |
| `GET`    | `/todos/stats`        | Aggregated statistics              |
| `GET`    | `/todos/:id`          | Get one task                       |
| `PATCH`  | `/todos/:id`          | Update a task                      |
| `PATCH`  | `/todos/:id/toggle`   | Toggle done / not-done             |
| `DELETE` | `/todos/:id`          | Delete a task                      |
| `DELETE` | `/todos/completed`    | Delete all completed tasks         |

`GET /todos` query params: `status`, `priority`, `search`, `sortBy`, `order`.

Full details live in [`backend/README.md`](./backend/README.md).

---

## 🗂️ Repository structure

```
docker-redis-crud/
├── backend/                 # NestJS API (Prisma + PostgreSQL + Redis)
│   ├── prisma/              # schema, migrations, seed
│   ├── src/
│   │   ├── prisma/          # PrismaModule / PrismaService
│   │   ├── redis/           # RedisModule / RedisService (cache helper)
│   │   └── todos/           # controller, service, DTOs, tests
│   ├── Dockerfile
│   ├── docker-entrypoint.sh
│   └── README.md
├── frontend/                # React + Vite + TypeScript UI
│   ├── src/
│   │   ├── api/ components/ context/ hooks/ types/ utils/
│   │   ├── App.tsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── nginx.conf
│   └── README.md
├── docker-compose.yml       # Orchestrates all four services
├── .env.example
└── README.md
```

---

## 🧰 Tech stack

| Layer     | Technology                                              |
| --------- | ------------------------------------------------------- |
| Frontend  | React 18, Vite 6, TypeScript, Framer Motion, Nginx      |
| Backend   | NestJS 11, Prisma 6, class-validator, ioredis           |
| Database  | PostgreSQL 16                                           |
| Cache     | Redis 7                                                 |
| Tooling   | Docker, Docker Compose, Jest                            |

---

## 🩺 Troubleshooting

- **Ports already in use** — change the host ports in `.env`
  (`FRONTEND_PORT`, `BACKEND_PORT`, `POSTGRES_PORT`, `REDIS_PORT`).
- **Backend keeps restarting** — it waits for Postgres/Redis health first; check
  `docker compose logs backend` and `docker compose logs postgres`.
- **UI shows "Request failed"** — make sure the backend is up:
  `curl http://localhost:3000/api/health`.
- **Reset everything** — `docker compose down -v` removes the Postgres/Redis
  volumes so the next start is clean.

---

## 📄 License

MIT — use it however you like.
