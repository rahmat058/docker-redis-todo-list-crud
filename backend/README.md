# TaskFlow — Backend (NestJS + Prisma + PostgreSQL + Redis)

REST API for the TaskFlow to-do app. Built with **NestJS 11**, **Prisma ORM**
(PostgreSQL), **Redis** caching and **class-validator** request validation.

---

## ✨ Features

- Full **CRUD** for tasks (`create`, `list`, `read`, `update`, `toggle`, `delete`)
- Rich task model: `status` (TODO / IN_PROGRESS / DONE), `priority` (LOW / MEDIUM / HIGH), `dueDate`, `tags`, `completedAt`
- **Filtering, search & sorting** (`status`, `priority`, `search`, `sortBy`, `order`)
- **Redis caching** for list queries, single items and aggregate stats, with automatic cache invalidation on every mutation
- **Stats endpoint** (total / active / completed / overdue / by-priority) powered by Prisma aggregations and cached in Redis
- **Health endpoint** that also pings Redis
- Global `ValidationPipe` (whitelist + forbid unknown props) and typed DTOs
- Prisma **migration** applied automatically on container start
- Unit tests with Jest

---

## 🧱 Tech stack

| Concern       | Choice                     |
| ------------- | -------------------------- |
| Framework     | NestJS 11 (Express 5)      |
| ORM           | Prisma 6                   |
| Database      | PostgreSQL 16              |
| Cache         | Redis 7 (via `ioredis`)    |
| Validation    | class-validator / class-transformer |

---

## 🚀 Getting started (local, no Docker for the app)

### 1. Prerequisites

- Node.js 20+ (developed on Node 22/24)
- Docker (to run PostgreSQL and Redis)

### 2. Start PostgreSQL and Redis

```bash
# Redis (the command from the project brief)
docker run -d --name redis -p 6379:6379 redis:7-alpine

# PostgreSQL
docker run -d --name postgres \
  -e POSTGRES_USER=todo \
  -e POSTGRES_PASSWORD=todo_password \
  -e POSTGRES_DB=todo_db \
  -p 5432:5432 \
  postgres:16-alpine
```

> `redis:7-alpine` is recommended. Use `redis:<version>` to pin any version you like.

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment

```bash
cp .env.example .env
# then edit .env if your credentials differ
```

### 5. Apply migrations & (optionally) seed

```bash
npm run prisma:generate      # generate the Prisma client
npm run prisma:migrate       # apply migrations (dev)
npm run db:seed              # insert sample tasks (optional)
```

### 6. Run the API

```bash
npm run start:dev            # watch mode -> http://localhost:3000/api
```

Verify it is alive:

```bash
curl http://localhost:3000/api/health
```

---

## 🐳 Running with Docker

### Build the image

```bash
docker build -t todo-backend .
```

### Run the container

```bash
docker run -d --name todo_backend \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://todo:todo_password@host.docker.internal:5432/todo_db?schema=public" \
  -e REDIS_URL="redis://host.docker.internal:6379" \
  todo-backend
```

The container **applies Prisma migrations on boot** (`prisma migrate deploy`)
and retries until the database is reachable, then starts the server.

> 💡 The easiest way to run everything together is from the project root:
> `docker compose up --build` (see the root `README.md`).

---

## 🐳 Running with Docker (development — hot reload)

Run **only the API** in a container (using `Dockerfile.dev`) while PostgreSQL and
Redis run as separate containers. The source is bind-mounted and the container
runs `nest start --watch`, so the server reloads whenever you save a file.

> Run all commands from the `backend/` folder.

### 0. Create a shared network (once)

```bash
docker network create todo_dev_net
```

### 1. Start PostgreSQL and Redis

```bash
docker run -d --name todo_postgres_dev \
  --network todo_dev_net \
  -p 5432:5432 \
  -e POSTGRES_USER=todo \
  -e POSTGRES_PASSWORD=todo_password \
  -e POSTGRES_DB=todo_db \
  -v todo_dev_pgdata:/var/lib/postgresql/data \
  postgres:16-alpine

docker run -d --name todo_redis_dev \
  --network todo_dev_net \
  -p 6379:6379 \
  redis:7-alpine
```

Because each `docker run` publishes its own port, Docker Desktop lists
`todo_postgres_dev` (`5432`) and `todo_redis_dev` (`6379`) as separate
containers — unlike `docker compose`, which groups every service under one
project row (expand the chevron to see the ports).

### 2. Build the development image

```bash
docker build -f Dockerfile.dev -t todo-backend-dev .
```

### 3. Run the API (hot reload)

```bash
# PowerShell
docker run -d --name todo_backend_dev \
  --network todo_dev_net \
  -p 3000:3000 \
  -v "${PWD}:/app" \
  -v /app/node_modules \
  -e DATABASE_URL="postgresql://todo:todo_password@todo_postgres_dev:5432/todo_db?schema=public" \
  -e REDIS_URL="redis://todo_redis_dev:6379" \
  todo-backend-dev
```

> **cmd.exe** users: replace `"${PWD}:/app"` with `"%cd%:/app"`.

The `-v /app/node_modules` line keeps the container's own `node_modules` (built
into the image) instead of your host's, which would be binary-incompatible.

### 4. Apply migrations and (optionally) seed

```bash
docker exec -it todo_backend_dev npx prisma migrate deploy
docker exec -it todo_backend_dev npm run db:seed   # optional
```

### 5. Verify

```bash
curl http://localhost:3000/api/health
docker logs -f todo_backend_dev                    # tail the logs
```

After you change `prisma/schema.prisma`, regenerate and migrate inside the
container:

```bash
docker exec -it todo_backend_dev npx prisma generate
docker exec -it todo_backend_dev npx prisma migrate dev
```

### Stop & clean up

```bash
docker rm -f todo_backend_dev todo_postgres_dev todo_redis_dev
docker network rm todo_dev_net     # optional
docker volume rm todo_dev_pgdata   # removes the dev database data
```

---

## 🔧 Environment variables

| Variable       | Default                                                          | Description                              |
| -------------- | ---------------------------------------------------------------- | ---------------------------------------- |
| `PORT`         | `3000`                                                           | HTTP port                                |
| `DATABASE_URL` | `postgresql://todo:todo_password@localhost:5432/todo_db?schema=public` | Prisma connection string           |
| `REDIS_URL`    | `redis://localhost:6379`                                         | Redis connection string                  |
| `CORS_ORIGIN`  | `*`                                                              | `*` or a comma-separated list of origins |
| `CACHE_TTL`    | `60`                                                             | Default cache TTL (seconds)              |

---

## 📚 API reference

Base URL: `http://localhost:3000/api`

| Method   | Path                   | Description                       |
| -------- | ---------------------- | --------------------------------- |
| `GET`    | `/health`              | Health check (pings Redis)        |
| `POST`   | `/todos`               | Create a task                     |
| `GET`    | `/todos`               | List tasks (supports query params)|
| `GET`    | `/todos/stats`         | Aggregated statistics             |
| `GET`    | `/todos/:id`           | Get a single task                 |
| `PATCH`  | `/todos/:id`           | Update a task                     |
| `PATCH`  | `/todos/:id/toggle`    | Toggle done / not-done            |
| `DELETE` | `/todos/:id`           | Delete a task                     |
| `DELETE` | `/todos/completed`     | Delete all completed tasks        |

### Query parameters for `GET /todos`

| Param      | Values                                            |
| ---------- | ------------------------------------------------- |
| `status`   | `TODO` \| `IN_PROGRESS` \| `DONE`                 |
| `priority` | `LOW` \| `MEDIUM` \| `HIGH`                       |
| `search`   | free text (matches title & description)           |
| `sortBy`   | `createdAt` \| `updatedAt` \| `dueDate` \| `priority` \| `title` |
| `order`    | `asc` \| `desc`                                   |

### Example: create a task

```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ship the release",
    "description": "Tag and publish v1.0.0",
    "priority": "HIGH",
    "dueDate": "2026-01-31",
    "tags": ["release", "backend"]
  }'
```

---

## 🔥 How Redis is used

- **List cache** — `GET /todos` results are cached under `todos:list:<query-hash>` for `CACHE_TTL` seconds.
- **Item cache** — `GET /todos/:id` results are cached under `todos:item:<id>`.
- **Stats cache** — `GET /todos/stats` is cached under `todos:stats` for 30 seconds.
- **Invalidation** — every `POST` / `PATCH` / `DELETE` clears `todos:list:*`, `todos:stats` and (when relevant) the affected item key using a non-blocking `SCAN`.

---

## 🧪 Scripts

| Script                  | Purpose                                |
| ----------------------- | -------------------------------------- |
| `npm run start:dev`     | Run in watch mode                      |
| `npm run build`         | Compile to `dist/`                     |
| `npm run start:prod`    | Run the compiled app                   |
| `npm test`              | Unit tests (Jest)                      |
| `npm run prisma:migrate`| Create/apply a dev migration           |
| `npm run prisma:deploy` | Apply migrations (production)          |
| `npm run prisma:studio` | Open Prisma Studio                     |
| `npm run db:seed`       | Seed sample data                       |

---

## 📁 Project structure

```
backend/
├── prisma/
│   ├── migrations/            # SQL migrations
│   ├── schema.prisma          # Data model
│   └── seed.ts                # Sample data
├── src/
│   ├── prisma/                # PrismaModule + PrismaService (global)
│   ├── redis/                 # RedisModule + RedisService (global cache helper)
│   ├── todos/
│   │   ├── dto/               # create / update / query DTOs
│   │   ├── todos.controller.ts
│   │   ├── todos.service.ts
│   │   └── todos.service.spec.ts
│   ├── app.controller.ts      # /health
│   ├── app.module.ts
│   └── main.ts
├── Dockerfile
├── docker-entrypoint.sh
├── .env.example
└── package.json
```
