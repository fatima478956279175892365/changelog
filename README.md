# Changelog OS Pro

Developer-focused SaaS for publishing product changelogs with automatic multi-audience views.

## Features

- **Projects** — create and manage changelog projects
- **Updates** — add manually or paste conventional commit messages
- **Auto-transform** — generates Developer, Customer, and Internal views
- **Public changelog** — shareable `/c/[slug]` page with SEO metadata
- **Email subscriptions** — collect subscribers per project
- **RSS feed** — `/feed/[slug].xml`
- **Embed widget** — `/widget/[slug].js`

## Stack

| Layer    | Tech                                      |
|----------|-------------------------------------------|
| Backend  | FastAPI, SQLModel, async SQLAlchemy       |
| Database | SQLite (dev) / PostgreSQL via Supabase    |
| Frontend | Next.js 15, TypeScript, Tailwind, SWR     |

## Quick start

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
copy .env.example .env        # or cp on Unix
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
copy .env.local.example .env.local
npm run dev
```

App: http://localhost:3000

## Environment variables

### Backend (`backend/.env`)

| Variable       | Description                          |
|----------------|--------------------------------------|
| `DATABASE_URL` | Async DB URL (sqlite or postgresql)  |
| `CORS_ORIGINS` | Comma-separated allowed origins      |
| `FRONTEND_URL` | Used in RSS links and widget         |

### Frontend (`frontend/.env.local`)

| Variable               | Description        |
|------------------------|--------------------|
| `NEXT_PUBLIC_API_URL`  | FastAPI base URL   |

## API overview

```
POST   /projects
GET    /projects
GET    /projects/{id}
GET    /projects/slug/{slug}

POST   /updates
POST   /updates/from-commit
GET    /updates?project_id=

GET    /public/{slug}
GET    /feed/{slug}.xml
GET    /widget/{slug}.js

POST   /subscribe
GET    /health
```

## Testing

```bash
cd backend
pytest -v
```

## Deployment notes

### Backend (Railway / Render / Fly.io)

1. Set `DATABASE_URL` to Supabase connection string:
   `postgresql+asyncpg://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`
2. Set `CORS_ORIGINS` to your frontend domain.
3. Set `FRONTEND_URL` to your frontend domain.
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel)

1. Set `NEXT_PUBLIC_API_URL` to your deployed API URL.
2. Deploy the `frontend` directory.

### Widget embed

```html
<div id="changelog"></div>
<script src="https://api.yourdomain.com/widget/my-project.js" async></script>
```

## Architecture

```
frontend/          Next.js App Router UI
  app/             Pages: /, /project/[slug], /c/[slug], /subscribe
  lib/api.ts       Typed API client (real fetch, no mocks)
  components/      UI components

backend/
  app/
    routers/       FastAPI route handlers
    services/      transform.py, git_parser.py, email_service.py
    models/        SQLModel tables
    schemas/       Pydantic request/response models
```
