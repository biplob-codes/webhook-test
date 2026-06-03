# Webhook Tester

A local-first tool to send and receive webhooks, built with Next.js 16, Prisma 7, and PostgreSQL.

---

## Features

- **Sender** — POST any JSON payload to any URL with a Monaco-powered editor (syntax highlighting + error detection)
- **Receiver** — A live endpoint that captures incoming webhooks and stores them in PostgreSQL
- **Event log** — Browse captured events with pretty-printed payload and collapsible headers
- **One-click copy** — Copy the receiver URL straight from the UI
- **Clear all** — Wipe the event log with one button

---

## Tech Stack

| Layer       | Library                             |
| ----------- | ----------------------------------- |
| Framework   | Next.js 16 (App Router, TypeScript) |
| Styling     | Tailwind CSS                        |
| JSON Editor | `@monaco-editor/react`              |
| ORM         | Prisma 7                            |
| Database    | PostgreSQL                          |
| DB Adapter  | `@prisma/adapter-pg`                |

---

## Prerequisites

- Node.js 20.19+
- pnpm
- PostgreSQL (local or remote)

> **No PostgreSQL locally?** Spin one up instantly with Docker:
>
> ```bash
> docker run --name pg \
>   -e POSTGRES_PASSWORD=pass \
>   -e POSTGRES_DB=webhook_tester \
>   -p 5432:5432 \
>   -d postgres
> ```

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/your-username/webhook-tester.git
cd webhook-tester
pnpm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://postgres:pass@localhost:5432/webhook_tester"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Generate Prisma client and run migrations

```bash
pnpm dlx prisma generate
pnpm dlx prisma migrate dev --name init
```

### 4. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Pages

### `/` — Sender

- Enter any destination URL
- Write or paste a JSON payload in the Monaco editor
- Click **Send Webhook** — the response status and body appear below

### `/receiver` — Receiver

- Displays the receiver endpoint URL (`/api/receive`) with a copy button
- Click **Refresh** to load the latest events from the database
- Each event card shows timestamp, payload, and collapsible headers
- **Clear All** deletes every event from the database

---

## API

| Method | Endpoint       | Description                                                 |
| ------ | -------------- | ----------------------------------------------------------- |
| `POST` | `/api/receive` | Accepts any JSON body, stores payload + headers + timestamp |

---

## Project Structure

```
webhook-tester/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Sender UI
│   ├── actions.ts            # Server actions (getEvents, clearEvents)
│   ├── receiver/
│   │   └── page.tsx          # Receiver UI
│   └── api/
│       └── receive/
│           └── route.ts      # POST endpoint
├── lib/
│   ├── prisma.ts             # Prisma client singleton
│   └── base-url.ts           # Dynamic base URL helper
├── prisma/
│   ├── schema.prisma
│   ├── prisma.config.ts
│   └── migrations/
└── .env
```

---

## Deploying to Vercel

### 1. Add environment variables in Vercel dashboard

```
DATABASE_URL       = postgresql://user:pass@host:5432/dbname
NEXT_PUBLIC_APP_URL = https://your-app.vercel.app
```

> You'll need a remote PostgreSQL. Free options: **Supabase**, **Neon**, or **Railway**.

### 2. Run migrations against your remote DB

```bash
DATABASE_URL="your-remote-url" pnpm dlx prisma migrate deploy
```

### 3. Deploy

```bash
vercel --prod
```

---

## License

MIT
