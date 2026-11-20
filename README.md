# SerivceOps — Full-Stack Monorepo

A modern ITIL Service Management Platform (ITSM) built as a full-stack monorepo: a
React + Vite frontend, an Express + Prisma backend, shared TypeScript interfaces,
and multi-tenant support.

[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-green.svg)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.4-purple.svg)](https://www.prisma.io/)
[![MUI](https://img.shields.io/badge/MUI-7.3-blue.svg)](https://mui.com/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF.svg)](https://vitejs.dev/)
[![NX](https://img.shields.io/badge/NX-22-143055.svg)](https://nx.dev/)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Docker Setup](#docker-setup)
- [Environment Variables](#environment-variables)
- [Role-Based Access Control](#role-based-access-control)
- [Authentication & Security](#authentication--security)
- [Core Modules](#core-modules)
- [Shared Interfaces](#shared-interfaces)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Database Migration Strategy](#database-migration-strategy)
- [Testing](#testing)
- [Development Commands](#development-commands)
- [API Endpoints](#api-endpoints)
- [Path Aliases](#path-aliases)
- [Technology Stack](#technology-stack)
- [Troubleshooting](#troubleshooting)

---

## Overview

SerivceOps is an ITIL Service Management Platform built with clean-architecture
principles:

- **ITSM features** — ticket/incident management, change & problem management,
  dashboards, CAB requests, knowledge base, reports, timesheets, leave, and
  approval workflows.
- **Unified ticket model** — a single `tickets` router handles every ticket type
  (incident, service request, advisory, …); types and their custom fields are
  driven by the Configuration module, so new ticket types need no new routes.
- **Timesheets & leave** — week-based timesheets with per-day lines, billable
  tracking and submission/approval, plus per-user leave balances and time-off
  requests.
- **Shared interfaces** — the same TypeScript types are consumed by both the
  frontend and the backend.
- **Repository/Service/Controller pattern** — HTTP handlers stay thin;
  business logic lives in services and repositories (Prisma) behind dependency
  injection.
- **Use-case classes** — cross-cutting business operations (draft cleanup,
  ticket management, configuration, ticket types) are encapsulated in
  single-responsibility classes under `libs/core/use-cases`.
- **Dumb UI components** — components render props and receive no business
  logic; styles live in separate `useStyles` files, not inline.
- **Role-based access** — Admin, User, and Consultant roles with an approval
  workflow.
- **Single-database stack** — PostgreSQL is the only backend dependency: it
  stores data, the cache (`CacheEntry`), and server-side sessions
  (`UserSession`). There is no Redis.

### Key principles

| Principle | Description |
|-----------|-------------|
| **Separation of concerns** | UI renders; the backend owns logic and data access |
| **Shared types** | One interface set for frontend and backend |
| **External styles** | No inline styles — styles are co-located `useStyles` files |
| **Dependency injection** | Controllers receive services, services receive repositories |
| **Single responsibility** | One use case / service / repository per concern |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       FRONTEND (React 19 + Vite)                │
│  ┌──────────────┐   ┌──────────────────────────┐   ┌─────────┐  │
│  │ Pages        │   │  Redux Toolkit + RTK     │   │ MUI 7  │  │
│  │ (libs/ui)    │   │  Query (libs/services)   │   │ theme  │  │
│  └──────┬───────┘   └────────────┬─────────────┘   └────────┘  │
│         │                         │ fetch (cookie credentials)  │
│         ▼                         ▼                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │     @serviceops/interfaces (shared TS types + Yup)          ││
│  │   ITicket, ITicketType, ITimesheet, ILeaveBalance, ...     ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                             │  REST + session cookie
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND (Express)                          │
│  ┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐  │
│  │ Controllers │──▶│     Services     │──▶│  Repositories   │  │
│  │  (HTTP)     │    │    (logic)      │    │    (Prisma)     │  │
│  └─────────────┘    └─────────────────┘    └────────┬────────┘  │
│                                                       │          │
│                ┌─────────────────────────────────────┼────────┐ │
│                │  Use cases · Gateways · Middleware   │ Cache  │ │
│                │  (libs/core)  ── PASETO · PgSession  │ Store  │ │
│                └──────────────────────────────────────┘        │ │
│                                                       │          │
│                                                       ▼          │
│                                            ┌──────────────────┐  │
│                                            │  PostgreSQL      │  │
│                                            │  (data + cache + │  │
│                                            │   sessions)        │  │
│                                            └──────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
SerivceOps/
├── gateways/                        # BACKEND (Express API)
│   ├── api/
│   │   ├── auth/                    # Session auth (single action endpoint)
│   │   │   ├── Auth.controller.ts
│   │   │   ├── Auth.routes.ts
│   │   │   └── user.mapper.ts
│   │   ├── admin/                   # Admin API (requireAuth; admin role for mutations)
│   │   │   ├── Ticket/              # Unified, type-agnostic ticket CRUD + sub-resources
│   │   │   ├── TicketType/          # Ticket types (drives the dynamic ticket router)
│   │   │   ├── CustomField/         # Per-type custom fields
│   │   │   ├── Configuration/       # System configuration sections
│   │   │   ├── AdminControls/       # Admin control flags
│   │   │   └── routes.ts            # buildAdminRouter(ticketRouter)
│   │   ├── user/                    # User API (requireAuth)
│   │   │   ├── Timesheet/           # Week sheets, lines, save/submit, approvals
│   │   │   ├── Leave/               # Leave balances + time-off requests
│   │   │   ├── Dashboard/
│   │   │   └── routes.ts
│   │   ├── consultant/              # Consultant API (requireAuth)
│   │   └── (NotFound stubs per scope)
│   ├── prisma/
│   │   ├── schema.prisma            # Full schema (admin, user, timesheet, leave, sessions)
│   │   ├── prisma.config.ts
│   │   ├── seed.ts                  # Test users, ticket types, leave balances, dashboard data
│   │   ├── scripts/
│   │   │   ├── sync-schema.ts
│   │   │   └── regenerate-migration.ts
│   │   └── migrations/              # Incremental migrations (init → timesheet → leave → dashboard)
│   └── src/
│       ├── app.ts                   # createApp(): middleware + route mounting
│       ├── server.ts                # Boot: DB check, dynamic ticket router, listen
│       └── index.ts                 # Entry point
│
├── libs/
│   ├── entities/                    # SHARED interfaces (FE + BE)
│   │   ├── interfaces/
│   │   │   ├── admin/             (ticket, ticketType, configuration, incident, ...)
│   │   │   ├── user/              (timesheet, leave, dashboard, header, sidenav)
│   │   │   └── base/              (fieldConfiguration, ...)
│   │   ├── dtos/
│   │   ├── validations/            # Yup schemas
│   │   └── config/
│   │
│   ├── core/                        # BACKEND core
│   │   ├── use-cases/admin/       (configuration, customField, ticket, ticketType)
│   │   ├── gateways/              # Gateway interfaces
│   │   ├── infrastructure/        # Prisma gateways, PASETO key, Prisma cache
│   │   ├── repository/  service/  # Base repository / service abstractions
│   │   ├── middleware/            # auth (requireAuth/requireAdmin), error handler
│   │   ├── database/              # Prisma client, PgSessionStore, session cookie settings
│   │   ├── config/                # winston logger, email, app config
│   │   └── validation/
│   │
│   ├── services/                    # FRONTEND data layer
│   │   ├── api/                   # RTK Query endpoints (auth, admin, user timesheet/leave)
│   │   ├── store/                 # Redux store (auth + ui)
│   │   └── slices/                # notificationSlice
│   │
│   ├── ui/
│   │   ├── components/            # ~60 dumb MUI-wrapped components (DataTable, GenericPanel, ...)
│   │   ├── pages/
│   │   │   ├── base/            # Role-shared feature pages (27 pages)
│   │   │   └── shared/          # SignIn, SignUp, ForgotPassword, NotFound
│   │   ├── hooks/               # useAuth, useNotification, useAppNavigation, ...
│   │   ├── utils/  test-utils/
│   │   └── index.ts
│   │
│   ├── theme/                       # Theme + role context + createAppStyles
│   ├── shared/constants/            # ADMIN_PATHS / USER_PATHS / CONSULTANT_PATHS, enums
│   └── utils/                       # dateFormatters, validators
│
├── web/                             # FRONTEND applications (Vite)
│   ├── apps/administration/         # Administration app  (port 1600)
│   └── tenants/generale-partner/   # Partner tenant       (port 1700)
│
├── env/src/                         # Per-app default env (merged under process.env)
│   ├── env.administration.json
│   ├── env.gateway.json
│   └── env.generale-partner.json
│
├── tools/vite/                      # partner-vite-plugin.ts, env-loader.ts
│
├── docker-compose.yml               # PostgreSQL 18
├── Dockerfile
├── nodemon.json                     # dev:backend config
├── nx.json                          # NX workspace
├── tsconfig.base.json               # Path aliases (@serviceops/*)
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js 24+** and **npm 9+**
- **PostgreSQL 18+** (or Docker)

> Postgres is the only backend dependency — it stores application data, the
> cache, and the server-side session store. There is no Redis.

### Installation

```bash
git clone <repository-url>
cd SerivceOps

npm install

# Configure the environment (see .env.example)
cp .env.example .env

# Prisma
npm run prisma:generate      # generate the Prisma client
npm run prisma:migrate       # push schema to the DB (development)
npm run prisma:seed          # seed test users, ticket types, leave balances, dashboard data
```

### Running the Application

```bash
# Backend (Express API) — http://localhost:3001
npm run dev:backend          # nodemon, hot reload
# ...or
npm run start:backend        # tsx, no reload

# Frontend apps (Vite)
npm run serve:administration        # http://localhost:1600
npm run serve:generale-partner      # http://localhost:1700
```

In development the Vite dev server proxies `/api`, `/uploads`, and `/health` to
`http://localhost:3001`, so the session cookie stays same-site (no CORS, no
cross-site cookie requirements). Set `API_URL` to point a frontend at a
separately-hosted API instead, or `BACKEND_PROXY_TARGET` to change the proxy
target port.

### Ports

| App | Command | Port |
|-----|---------|------|
| **Administration** | `serve:administration` | 1600 |
| **Generale Partner** | `serve:generale-partner` | 1700 |
| **Backend API** | `dev:backend` / `start:backend` | 3001 |

---

## Docker Setup

Docker Compose provides the PostgreSQL database:

```bash
docker-compose up -d        # start PostgreSQL
docker-compose ps           # check status
docker-compose logs -f      # tail logs
docker-compose down         # stop
```

### Docker services

| Service | Container | Port | Description |
|---------|-----------|------|-------------|
| PostgreSQL | `SerivceOps-postgres` | 5432 | Data + cache + session store |

The compose file also ships (commented-out) `admin` and `user` service
definitions for running the web apps in containers.

---

## Environment Variables

Copy `.env.example` to `.env`. Values in `env/src/env.*.json` are merged into
`process.env` at boot, but only for keys not already set — `.env` and the
system environment win.

```env
# Server
NODE_ENV=development
PORT=3001
HOST=0.0.0.0

# Database (special characters in the password must be URL-encoded: & → %26)
DATABASE_URL=postgresql://postgres:password@localhost:5432/SerivceOps_db?schema=public

# Server-side cookie sessions (persisted in PostgreSQL)
SESSION_SECRET=your-super-secret-session-key-change-this-in-production-min-32-chars
SESSION_TTL_DAYS=7
# PASETO_SECRET=            # signing key for short-lived tokens; derived from SESSION_SECRET when unset
# SESSION_COOKIE_SECURE=    # force the Secure flag (true/false); otherwise it follows the connection scheme

# Rate limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# Logging
LOG_LEVEL=debug
LOG_FILE_PATH=./logs
ENABLE_CONSOLE_LOGS=true

# CORS — comma-separated list of browser origins allowed to send the session cookie
CORS_ORIGIN=http://localhost:1600,http://localhost:1700

# Email / SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-here
SMTP_FROM=SerivceOps App <noreply@serviceops.tech>
```

#### Gmail SMTP

Use a **Gmail App Password** (not your account password): enable 2FA on the
Google account, generate an App Password at
<https://myaccount.google.com/apppasswords>, and use the 16-character value as
`SMTP_PASS`. In `NODE_ENV=development`, OTPs are logged to the console, so SMTP
is not required for local testing.

---

## Role-Based Access Control

SerivceOps ships three roles. All three sign into the **same** administration
frontend; the role controls which features are visible and which API mutations
are permitted.

| Role | Access level |
|------|--------------|
| **Admin** | Full access — user & role management, system configuration, all ITSM features |
| **User** | Day-to-day ITSM — dashboards, tickets, timesheets, leave |
| **Consultant** | Scoped access — change/problem work, ticket creation, access requests |

### Sign-up & role request flow

1. Sign up at `/signup`.
2. Every account starts with the **User** role. If the requester picks
   Consultant or Admin, that choice is filed as a **role request** pending
   approval.
3. An admin approves or rejects the request in **Role Requests**
   (`/api/auth` admin actions).

Mutating the admin-management sub-routers (admin controls, configuration,
ticket types, custom fields, and the admin user/role actions) additionally
requires the **admin** role — that guard lives inside those route files. The
ticket sub-router is used by **every** authenticated role to create and manage
tickets, so it is only gated by session auth, not role.

---

## Authentication & Security

### Server-side cookie sessions (no JWT)

- Secure, revocable sessions: an `httpOnly` cookie named `serviceops.sid`
  references a session row in the PostgreSQL `UserSession` table, managed by a
  Prisma-backed `PgSessionStore`.
- Passwords are hashed with **bcryptjs** (10 salt rounds).
- Session lifetime: `SESSION_TTL_DAYS` (default 7). Expired sessions are pruned
  on boot.
- Sessions are re-validated against the DB on every protected request, so
  logout, deactivation, or a password change revokes access immediately.
- Short-lived signed tokens (e.g. the 15-minute password-reset token) use
  **PASETO** — the safer successor to JWT. PASETO is never used for sessions,
  and JWT is not used at all.

**Cookie & CORS in production**

The session cookie's `Secure`/`SameSite` flags follow the *actual* connection
scheme (`req.secure`), not the `NODE_ENV` label. `trust proxy` is set so the
immediate proxy hop determines the scheme.

- **Same-site** (frontend + API on one origin, or a reverse proxy in front):
  plain `http` dev → `SameSite=Lax`. No extra config.
- **Cross-site** (app on `app.serviceops.tech`, API on `api.serviceops.tech`):
  both must be HTTPS; over TLS the API is `Secure; SameSite=None`, and you
  **must** list every calling origin in `CORS_ORIGIN` or the browser drops the
  credentialed requests. The server logs a startup warning if `CORS_ORIGIN` is
  empty.
- `SESSION_COOKIE_SECURE=true|false` forces the flag either way if a setup needs
  it.

> A sign-in that "succeeds then immediately logs out" is almost always a cookie
> the browser rejected: a `Secure` cookie set over plain http, or a
> `SameSite=None` cookie whose origin wasn't in `CORS_ORIGIN`. Inspect the
> cookie flags and response headers first.

### Account security

- **Lockout**: 5 failed logins trigger a 30-minute lockout.
- **Password reset**: OTP-based, sent by email; OTPs are valid for 10 minutes.
- **Rate limiting**: repeated OTP requests are throttled while an OTP is valid.
- **Audit**: `UserChangeLog` and `LoginLog` track admin changes and sign-ins.

### Default test credentials (after `prisma:seed`)

```
admin@serviceops.tech       / admin123
user@serviceops.tech        / user123
consultant@serviceops.tech  / consultant123
```

---

## Core Modules

### Tickets (unified)

A single `/api/admin/tickets` router serves every ticket type. The set of
active ticket types and their custom fields comes from the Configuration module,
so adding a ticket type requires no new route. Each ticket supports the full
ITSM lifecycle plus sub-resources: comments, time entries, resolutions, and an
activity audit log. Drafts can carry an optional expiry.

Priority is derived from **Impact × Urgency**:

| | High Urgency | Medium Urgency | Low Urgency |
|---|---|---|---|
| **High Impact** | Critical | High | Medium |
| **Medium Impact** | High | Medium | Low |
| **Low Impact** | Medium | Low | Low |

The **Ticket Detail** page is one unified component used by both the
`/incidents/:number` and `/tickets/:id` routes — every ticket type is maintained
by the same page.

### Timesheets

Week-based sheets, one per user per `weekStart`. Each sheet holds **lines**
(client / project / task, billable flag, external & internal notes,
attachments, and per-day decimal hours from Monday to Sunday). A sheet can be
saved as a draft or **submitted** for approval.

- Sheet statuses: `open`, `draft`, `pending`, `submitted`, `approved`,
  `rejected`.
- Computed totals feed the dashboard KPI cards: all / billable / non-billable
  hours per day, the billable ratio, and leave/holiday hours.
- `GET /api/user/timesheet/approvals` returns the approver's history.

### Leave

Per-user balances across the standard leave types — **Privilege Leave, Casual
Leave, Sick Leave, Optional Holiday, and Absent** — plus submitted time-off
requests that feed the leave dashboard's request table and the approval queue.
Request statuses: `submitted`, `approved`, `rejected`. The backend only stores
the types that have a balance row; the frontend renders the full canonical set
(`0/0` when a type has no stored allocation).

### Approvals

The Timesheet Approval page is a manager review queue with pending and history
tables, a searchable per-row action field, bulk approve/reject, and a read-only
timesheet preview dialog.

---

## Shared Interfaces

Interfaces in `libs/entities/interfaces/` are shared by the frontend and
backend, so a wire shape is defined once:

```typescript
// libs/entities/interfaces/admin/ticket.interface.ts
export interface ITicket { /* ticket type, status, priority, custom fields, ... */ }

// Frontend
import { ITicket, ITicketStatus } from '@serviceops/interfaces';

// Backend
import { ITicket, ICreateTicketInput } from '@serviceops/interfaces';
```

Yup validation schemas live in `libs/entities/validations/` and are shared the
same way.

---

## Backend Architecture

### Controller → Service → Repository

HTTP handlers are thin and receive their dependencies by injection:

```typescript
// gateways/api/user/Leave/Leave.routes.ts
const repository = new LeaveRepository();
const service    = new LeaveService(repository);
const controller = new LeaveController(service);

router.get('/balance',   controller.balance);
router.post('/requests', controller.submit);
```

Controllers validate input (Yup), map DTOs, and delegate to a service; the
service owns business rules and talks to a repository that wraps Prisma. The
`gateways/api/*` tree is where the concrete modules live.

### Use cases & gateways (libs/core)

Cross-cutting, reusable operations live in `libs/core/use-cases` behind
interface-based gateways:

- **Ticket management** — create/list/update/delete, sub-resources, drafts.
- **Configuration** — read and update sections.
- **Ticket types & custom fields** — the data that drives the dynamic ticket
  router.
- **Cleanup of expired drafts** — a scheduled housekeeping use case.

Prisma implementations of these gateways are in
`libs/core/infrastructure/admin`; a Prisma-backed cache gateway
(`PrismaCacheGateway`) powers the PostgreSQL cache.

### Dynamic ticket router

At boot, `server.ts` reads the active ticket types from the DB and builds the
ticket router (`createTicketRouter`), then hands it to `createApp`. This is what
lets ticket types be data rather than code. The server also verifies a DB
connection before listening and prunes expired sessions.

### Middleware

`libs/core/middleware` provides `requireAuth` (validates the session cookie
against `UserSession`) and `requireAdmin` (role check), plus a global error
handler and 404 handler. The whole `/api/admin` and `/api/user` trees sit behind
`requireAuth`.

---

## Frontend Architecture

### Dumb UI components

`libs/ui/components` are presentational MUI wrappers. They take props and
render — no data fetching or business logic. `GenericPanel`, `GenericToolbar`,
`DataTable`, and the Configuration section primitives are the workhorses shared
across the feature pages.

The `DataTable` supports two width strategies: `fitContent` (size to content) and
`fixedLayout` (proportional distribution — every column takes a share of the
panel width in proportion to its declared `minWidth`, so wide tables fill the
panel edge-to-edge without gaps between headers).

### State & data (RTK Query)

The data layer lives in `libs/services`:

- `libs/services/store` — Redux Toolkit store (`authStore` + `uiStore`).
- `libs/services/api` — RTK Query `createApi` endpoints grouped by domain
  (auth, admin, user timesheet, user leave). A shared `baseApi` uses
  `credentials: 'include'` (cookie sessions, no token in localStorage) and, on an
  unexpected 401, bounces to `/signin` so session hydration re-runs.
- `libs/services/slices` — the notification slice and its actions.

The 27 base pages and the shared auth pages are wired up as lazy routes in
`web/apps/administration/src/app/routes.ts`.

### Styling

Components use a co-located `useStyles` hook built on `createAppStyles`, which
accepts **per-role overrides** (`admin` / `user` / `consultant`). There are no
inline styles — all styling is theme-aware and role-aware.

---

## Database Migration Strategy

The schema in `gateways/prisma/schema.prisma` is applied through incremental
migrations. Development uses a fast push; production uses applied migration
files.

```
gateways/prisma/
├── schema.prisma
├── prisma.config.ts
├── seed.ts
├── scripts/
│   ├── sync-schema.ts          # quick dev sync
│   └── regenerate-migration.ts # rebuild the init migration
└── migrations/
    ├── migration_lock.toml
    ├── 20260105000000_init/
    ├── 20260808000000_add_custom_fields/
    ├── 20260808010000_add_last_updated_by/
    ├── 20260814000000_add_is_email_to_comment/
    ├── 20260821084513_add_pinned_saved_to_comments/
    ├── 20261115000000_add_timesheet/
    ├── 20261120000000_add_sessions_and_cache/
    ├── 20261121000000_add_leave/
    └── 20261122000000_add_dashboard_data/
```

| Command | When | Effect |
|---------|------|--------|
| `prisma:generate` | After schema change | Regenerate the Prisma client |
| `prisma:migrate` | Development | `prisma db push` — apply schema directly (no migration file) |
| `prisma:regenerate` | Before release | Rebuild the init migration from the schema |
| `prisma:deploy` | Production | `prisma migrate deploy` |
| `prisma:reset` | Reset | Drop and recreate the DB |
| `prisma:studio` | Debug | Open the Prisma Studio GUI |
| `prisma:seed` | Initial setup | Seed users, ticket types, leave balances, dashboard data |

---

## Testing

Jest 30 is wired through `@nx/jest` (`npm test`, `npm run test:watch`,
`npm run test:coverage`). There are currently no committed test files in the
repository — the harness is in place for adding them. The backend is written to
be testable: services take a repository dependency, and repositories are the
only seam that touches Prisma, so a fake repository can be injected in unit
tests.

- **Backend** — instantiate a use case or service with an in-memory repository
  stand-in and assert on the result; no database required.
- **Frontend** — components are dumb and prop-driven, so they are easy to
  render in isolation with the theme provider and a Redux store.

---

## Development Commands

### Backend

```bash
npm run dev:backend              # nodemon hot-reload
npm run start:backend            # tsx, no reload
```

### Frontend

```bash
npm run serve:administration     # Vite dev server, http://localhost:1600
npm run serve:generale-partner   # Vite dev server, http://localhost:1700
npm run build:administration     # build the administration app
npm run build:generale-partner   # build the partner tenant
npm run build                    # build all apps via nx
```

### Database (Prisma)

```bash
npm run prisma:generate         # generate the Prisma client
npm run prisma:migrate          # push schema (development)
npm run prisma:deploy          # apply migrations (production)
npm run prisma:reset           # drop & recreate
npm run prisma:studio          # Prisma Studio GUI
npm run prisma:seed            # seed data
npm run prisma:sync            # quick schema sync script
npm run prisma:regenerate      # rebuild the init migration
```

### Quality

```bash
npm run test                    # run all Jest tests
npm run test:watch
npm run test:coverage
npm run type-check              # tsc --noEmit
npm run lint                    # eslint
npm run lint:fix
npm run format                  # prettier write
npm run format:check
npm run fix:all                 # lint:fix + format
npm run validate                # format:check + lint + type-check
```

### Docker

```bash
docker-compose up -d
docker-compose down
docker-compose logs -f
```

---

## API Endpoints

Base URL: `http://localhost:3001`. Protected endpoints require the session
cookie (`serviceops.sid`), sent automatically with `credentials: 'include'`.
There is no bearer `Authorization` header — the server holds the session.

### Health check

**GET** `/health` — public.

```json
{ "status": "OK", "timestamp": "2026-02-12T10:00:00.000Z" }
```

### Auth

All actions are a single **POST** `/api/auth` with an `action` field. A
**GET** `/api/auth` mirrors `get-session` for plain status probes.

| Action | Scope | Description |
|--------|-------|-------------|
| `signin` | public | Sign in (sets the session cookie) |
| `signup` | public | Create account (User role; optional pending role request) |
| `forgot-password` | public | Email a reset OTP |
| `verify-otp` | public | Verify the OTP, returns a PASETO reset token |
| `reset-password` | public | Set a new password with the reset token |
| `change-password` | session | Change own password |
| `get-my-profile` / `update-my-profile` | session | Read / update own profile |
| `get-session` | session | Current session status |
| `logout` | session | Destroy the session |
| `get-all-users`, `get-user`, `update-user`, `delete-user`, `unlock-user`, `create-user`, `create-pending-user`, `generate-temp-password`, `reset-user-password`, `activate-user`, `deactivate-user`, `get-change-log`, `get-login-logs` | admin | User administration |
| `get-role-requests`, `get-pending-role-requests`, `approve-role-request`, `reject-role-request` | admin | Role request workflow |

**Sign in** — `POST /api/auth`

```json
{ "action": "signin", "email": "admin@serviceops.tech", "password": "admin123" }
```

On success the response sets the `serviceops.sid` cookie and returns the
profile (there is no JWT/token to store).

### Admin

Base path `/api/admin` — session required; mutations on the management
sub-routers also require the admin role.

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Admin controls** | | |
| GET | `/admin/controls` | Get admin control flags |
| PUT | `/admin/controls` | Update admin control flags |
| **Configuration** | | |
| GET | `/admin/configuration` | Get system configuration |
| PUT | `/admin/configuration` | Update full configuration |
| PATCH | `/admin/configuration/:section` | Update one section |
| **Ticket types** | | |
| GET | `/admin/ticket-type` | List ticket types |
| GET | `/admin/ticket-type/:id` | Get by id |
| POST/PUT/DELETE | `/admin/ticket-type[/:id]` | Create / update / delete |
| PATCH | `/admin/ticket-type/reorder` | Reorder |
| **Custom fields** | | |
| GET/POST | `/admin/custom-field` | List / create |
| GET/PUT/DELETE | `/admin/custom-field/:id` | Get / update / delete |
| **Tickets (dynamic)** | | |
| GET | `/admin/tickets` | List (filter with `?ticketType=`) |
| GET | `/admin/tickets/drafts` | List drafts (optional `?ticketType=`) |
| GET | `/admin/tickets/number/:number` | Get by number |
| GET | `/admin/tickets/id/:id` | Get by id |
| POST | `/admin/tickets` | Create (`ticketType` required) |
| PUT / PATCH / DELETE | `/admin/tickets/id/:id` | Update / patch / delete |
| GET/POST | `/admin/tickets/:ticketId/comments` | List / add comment |
| GET/POST | `/admin/tickets/:ticketId/time-entries` | List / add time entry |
| GET/POST | `/admin/tickets/:ticketId/resolutions` | List / add resolution |
| GET | `/admin/tickets/:ticketId/activities` | Read-only activity log |
| POST | `/admin/tickets/attachments/upload` | Upload attachments (multer, ≤10 files, 10 MB each) |

Uploaded files are served statically from `/uploads/attachments`.

### User

Base path `/api/user` — session required.

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Timesheet** | | |
| GET | `/user/timesheet` | Current week's sheet (auto-created on first save) |
| GET | `/user/timesheet/approvals` | Approver's decision history |
| POST | `/user/timesheet/lines` | Add a line |
| POST | `/user/timesheet/save` | Save the sheet as a draft |
| POST | `/user/timesheet/submit` | Submit for approval |
| PATCH | `/user/timesheet/lines/:id` | Update a line |
| DELETE | `/user/timesheet/lines/:id` | Remove a line |
| **Leave** | | |
| GET | `/user/leave/balance` | Leave balances per type |
| GET | `/user/leave/requests` | Leave requests |
| POST | `/user/leave/requests` | Submit a time-off request |

### Consultant

Base path `/api/consultant` — session required (placeholder `not-found` route).

---

### Enum reference

| Field | Values |
|-------|--------|
| **Impact / Urgency** | `high`, `medium`, `low` |
| **Priority** | `Critical`, `High`, `Medium`, `Low` |
| **Ticket status** | `draft`, `new`, `in_progress`, `on_hold`, `assigned`, `resolved`, `closed`, `cancelled` |
| **Timesheet status** | `open`, `draft`, `pending`, `submitted`, `approved`, `rejected` |
| **Leave status** | `submitted`, `approved`, `rejected` |
| **Activity types** | `status_change`, `priority_change`, `assignment_change`, `comment_added`, `time_entry_added`, `resolution_added`, `attachment_added`, `field_update`, `escalation` |

### Error responses

| Status | Meaning | Example |
|--------|---------|---------|
| 400 | Validation / bad input | `{ "message": "ticketType is required" }` |
| 401 | No valid session | `{ "message": "Authentication required" }` |
| 403 | Missing role | `{ "message": "Admin access required" }` |
| 404 | Not found | `{ "message": "Ticket not found" }` |
| 409 | Conflict | `{ "message": "Email already registered" }` |
| 423 | Locked | `{ "message": "Account locked. Try again after 30 minutes." }` |
| 429 | Rate limited | `{ "message": "OTP already sent. Wait X minutes." }` |

---

## Path Aliases

Defined in `tsconfig.base.json` and resolved by `vite-tsconfig-paths` / tsc.
The main ones:

```typescript
// Shared types & validation
import { ITicket, ITimesheet, ILeaveBalance } from '@serviceops/interfaces';

// Backend core
import { requireAuth, requireAdmin } from '@serviceops/middleware';
import { prisma } from '@serviceops/database';
import { TicketManagementUseCase } from '@serviceops/core/use-cases';

// Frontend data layer (Redux + RTK Query)
import { baseApi, useGetLeaveBalanceQuery, store } from '@serviceops/services';

// Components & pages
import { DataTable, GenericPanel } from '@serviceops/component';
import BaseTimesheetPage from '@serviceops/pages/base/Timesheet';
import SignInPage from '@serviceops/pages/shared/SignIn';

// Theme, hooks, constants, utils
import { createAppStyles, useAppRole } from '@serviceops/theme';
import { useAuth, useNotification, useAppNavigation } from '@serviceops/hooks';
import { ADMIN_PATHS, USER_PATHS } from '@serviceops/constants';
import { formatDate } from '@serviceops/utils';
```

The Configuration module additionally exposes focused aliases such as
`@serviceops/genericpanel`, `@serviceops/configdialogs`, `@serviceops/richtexteditor`,
`@serviceops/configsection`, and the ticket-type / priority / status form
dialogs.

---

## Technology Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Backend** | Express 4.18 | REST API server |
| **Database** | PostgreSQL 18 | Data + cache + session store |
| **ORM** | Prisma 7 | Data access |
| **Frontend** | React 19 | UI framework |
| **UI library** | MUI 7 | Components |
| **State** | Redux Toolkit 2 + RTK Query | State + data fetching |
| **Forms** | Formik + Yup | Form handling & validation |
| **Styling** | Emotion + tss-react | CSS-in-JS, role-aware `useStyles` |
| **Charts** | ApexCharts | Data visualization |
| **Router** | React Router 6 | Client-side routing |
| **Auth** | express-session + PgSessionStore + PASETO + bcryptjs | Cookie sessions & password hashing |
| **Email** | Nodemailer | OTP & transactional mail |
| **Logging** | Winston | Structured logging |
| **Build** | Vite 6 + NX 22 | Dev servers & builds |
| **Testing** | Jest 30 | Unit testing |
| **Language** | TypeScript 5.9 | Type safety |

---

## Troubleshooting

### Sign-in succeeds then immediately logs out

The browser rejected the session cookie.

1. Check the `serviceops.sid` cookie flags in the devtools **Application** tab.
2. A `Secure` cookie over plain `http` is dropped — run dev over http with
   `SameSite=Lax`, or serve everything over HTTPS.
3. For cross-site setups, confirm every calling origin is in `CORS_ORIGIN`.

### Email / OTP not sending

1. In `NODE_ENV=development` the OTP is printed to the console — no SMTP needed.
2. For real mail, verify `SMTP_*` in `.env`; Gmail requires an **App Password**.

### Database connection (`P1001`)

```bash
docker-compose ps && docker-compose up -d   # Postgres running?
npm run prisma:migrate && npm run prisma:generate
npm run prisma:studio                      # inspect manually
```

### Build errors / stale cache

```bash
rm -rf node_modules .nx dist
npm install
npm run prisma:generate
npx nx reset
```

### Port already in use

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# macOS / Linux
lsof -ti:3001 | xargs kill -9
```

### Role request not appearing

```bash
npm run prisma:studio   # inspect the User table: requestedRole + status
```

Confirm the sign-up payload carries the requested role and the backend filed it
as a pending role request.

---

## License

MIT

---

**Last Updated:** November 2026
