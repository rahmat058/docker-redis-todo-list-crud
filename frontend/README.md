# TaskFlow — Frontend (React + Vite + TypeScript)

A polished, animated to-do list UI. Built with **React 18**, **Vite 6**,
**TypeScript** and **Framer Motion**.

---

## ✨ UI highlights

- Clean, modern design with **light / dark theme** (remembers your choice)
- **Live stat cards** — total, active, completed and overdue
- Create tasks with description, **priority**, **due date** and **tags**
- Inline **status cycling** (To do → In progress → Done) straight from the card
- **Search**, status tabs, priority filter, sort-by and sort direction
- **Optimistic updates** — edits, toggles and deletes feel instant
- Smooth enter/exit animations, loading **skeletons**, empty state and **toast** notifications
- Delete confirmation and an accessible edit **modal**
- Fully responsive down to small phones, honours `prefers-reduced-motion`

---

## 🚀 Getting started (local dev)

### 1. Prerequisites

- Node.js 20+
- The backend running on `http://localhost:3000` (see `../backend/README.md`)

### 2. Install dependencies

```bash
npm install
```

### 3. (Optional) Configure the API URL

The dev server proxies `/api` to the backend automatically, so no config is
needed. To point somewhere else, copy the env file:

```bash
cp .env.example .env
```

### 4. Start the dev server

```bash
npm run dev            # -> http://localhost:5173
```

The Vite dev server proxies `/api/*` to `http://localhost:3000`, so there are
no CORS issues during development.

---

## 🐳 Running with Docker

The production image is a **multi-stage build**: Vite builds the static bundle,
then **Nginx** serves it and proxies `/api/*` to the `backend` service.

### Build the image

```bash
docker build -t todo-frontend --build-arg VITE_API_URL=/api .
```

### Run the container

```bash
docker run -d --name todo_frontend -p 5173:80 todo-frontend
# -> http://localhost:5173
```

> 💡 The `nginx.conf` proxies `/api/` to `http://backend:3000`, which is the
> service name used by Docker Compose. Run everything from the project root
> with `docker compose up --build` for the full stack.

---

## 🔧 Environment variables

| Variable       | Default | Description                                                        |
| -------------- | ------- | ------------------------------------------------------------------ |
| `VITE_API_URL` | `/api`  | Base URL for API requests. `/api` works with the dev proxy & Nginx.|

> `VITE_*` variables are inlined at **build time**, so pass
> `--build-arg VITE_API_URL=...` when building the Docker image.

---

## 🧪 Scripts

| Script            | Purpose                                     |
| ----------------- | ------------------------------------------- |
| `npm run dev`     | Start Vite dev server (`:5173`)             |
| `npm run build`   | Type-check + build for production (`dist/`) |
| `npm run preview` | Preview the production build locally        |

---

## 📁 Project structure

```
frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── api/            # Fetch wrapper + typed todos API client
│   ├── components/     # Header, StatsCards, TodoForm, TodoList, TodoItem, modals…
│   ├── context/        # ToastProvider / useToast
│   ├── hooks/          # useTodos (state + CRUD), useTheme
│   ├── types/          # Shared TypeScript types
│   ├── utils/          # Date helpers
│   ├── App.tsx
│   ├── constants.ts
│   ├── index.css       # Design tokens + all component styles
│   └── main.tsx
├── Dockerfile
├── nginx.conf
├── vite.config.ts
├── index.html
└── package.json
```
