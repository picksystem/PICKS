# SerivceOps - Full-Stack Monorepo

A modern, scalable ITIL Service Management Platform (ITSM) built as a full-stack monorepo with React frontend, Express backend, shared interfaces, and multi-tenant support.

[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-green.svg)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.2-purple.svg)](https://www.prisma.io/)
[![MUI](https://img.shields.io/badge/MUI-7.3-blue.svg)](https://mui.com/)
[![NX](https://img.shields.io/badge/NX-22.1-143055.svg)](https://nx.dev/)
[![Storybook](https://img.shields.io/badge/Storybook-10.1-FF4785.svg)](https://storybook.js.org/)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Docker Setup](#docker-setup)
- [Role-Based Access Control](#role-based-access-control)
- [Authentication & Security](#authentication--security)
- [Incident Management](#incident-management)
- [Shared Interfaces](#shared-interfaces)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Component Styling Pattern](#component-styling-pattern)
- [Database Migration Strategy](#database-migration-strategy)
- [Testing](#testing)
- [Development Commands](#development-commands)
- [API Endpoints](#api-endpoints)
  - [Base URL & Auth Header](#base-url--auth-header)
  - [Auth API](#auth-api)
  - [Incident API](#incident-api)
  - [Comment API](#comment-api)
  - [Time Entry API](#time-entry-api)
  - [Resolution API](#resolution-api)
  - [Activity API](#activity-api)
  - [Ticket Type API](#ticket-type-api)
  - [Enum Reference](#enum-reference)
  - [Error Responses](#error-responses)
  - [API Testing (Postman)](#api-testing-postman)
- [Path Aliases](#path-aliases)
- [Technology Stack](#technology-stack)
- [Troubleshooting](#troubleshooting)

---

## Overview

SerivceOps is an ITIL Service Management Platform built with clean architecture principles:

- **ITSM Features** — Incident management, change management, problem management, dashboards, CAB requests, knowledge base, reports, time management
- **Shared Interfaces** — Same TypeScript types used by both Frontend and Backend
- **Use Case Pattern** — Business logic encapsulated in single-responsibility classes
- **Gateway Pattern** — Dual implementations (Prisma for production, InMemory for tests)
- **Dumb UI Components** — Components just render props, no business logic
- **External Styles** — All component styles in separate files, no inline styles
- **Role-Based Access** — Admin, User, and Consultant roles with approval workflow
- **Mock Data** — Easy to test all UI variations in Storybook
- **Multi-Tenant Theming** — Support for different partner configurations
- **Docker Support** — Containerized PostgreSQL and Redis for local development

### Key Principles

| Principle | Description |
|-----------|-------------|
| **Separation of Concerns** | UI renders, Backend handles logic |
| **Shared Types** | Same interface for FE & BE |
| **External Styles** | No inline styles, all styles in `/styles` folder |
| **Testability** | InMemory gateways for unit tests |
| **Single Responsibility** | One use case = one business operation |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  Components │ ←─ │   Mocks     │ ←─ │  Storybook  │         │
│  │  (Dumb UI)  │    │  (Testing)  │    │  (Preview)  │         │
│  └──────┬──────┘    └─────────────┘    └─────────────┘         │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              @serviceops/interfaces (Shared Types)                ││
│  │   IHeader, IJob, ICreateHeaderInput, IHeaderResponse, etc.  ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND (Express)                        │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │ Controllers │ ──▶│  Use Cases  │ ──▶│  Gateways   │         │
│  │  (HTTP)     │    │  (Logic)    │    │  (Data)     │         │
│  └─────────────┘    └─────────────┘    └──────┬──────┘         │
│                                                │                 │
│                          ┌─────────────────────┼────────────┐   │
│                          │                     │            │   │
│                          ▼                     ▼            │   │
│                   ┌─────────────┐       ┌─────────────┐     │   │
│                   │   Prisma    │       │  InMemory   │     │   │
│                   │  (Real DB)  │       │  (Tests)    │     │   │
│                   └─────────────┘       └─────────────┘     │   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
SerivceOps/
├── gateways/                          # BACKEND (Express API)
│   ├── api/
│   │   ├── admin/                     # Admin API routes
│   │   │   ├── Incident/              # Incident management
│   │   │   │   ├── Incident.controller.ts
│   │   │   │   ├── Incident.dto.ts
│   │   │   │   └── Incident.routes.ts
│   │   │   ├── TicketType/
│   │   │   ├── ServiceRequest/
│   │   │   ├── AdvisoryRequest/
│   │   │   ├── Configuration/
│   │   │   ├── AdminControls/
│   │   │   └── routes.ts
│   │   ├── auth/                      # Authentication routes
│   │   ├── user/                      # User API routes
│   │   └── consultant/                # Consultant API routes
│   ├── prisma/
│   │   ├── schema.prisma              # Database schema
│   │   ├── prisma.config.ts           # Prisma configuration
│   │   ├── seed.ts                    # Database seeding
│   │   ├── scripts/
│   │   │   ├── sync-schema.ts         # Quick sync for development
│   │   │   └── regenerate-migration.ts
│   │   └── migrations/
│   │       ├── migration_lock.toml
│   │       ├── 20260105000000_init/
│   │       └── 20260306000000_add_missing_incident_columns/
│   └── src/
│       ├── app.ts                     # Express app setup
│       ├── server.ts                  # Server initialization
│       └── index.ts                   # Entry point
│
├── libs/                              # SHARED LIBRARIES
│   ├── entities/                      # Shared interfaces (FE + BE)
│   │   ├── interfaces/
│   │   │   ├── admin/
│   │   │   │   ├── incident.interface.ts
│   │   │   │   ├── ticketType.interface.ts
│   │   │   │   ├── serviceRequest.interface.ts
│   │   │   │   ├── advisoryRequest.interface.ts
│   │   │   │   ├── configuration.interface.ts
│   │   │   │   ├── header.interface.ts
│   │   │   │   ├── dashboard.interface.ts
│   │   │   │   ├── job.interface.ts
│   │   │   │   └── ...
│   │   │   └── user/
│   │   │       ├── dashboard.interface.ts
│   │   │       ├── sidenav.interface.ts
│   │   │       └── ...
│   │   ├── validations/               # Yup validation schemas
│   │   └── config/partner.ts          # Partner configurations
│   │
│   ├── core/                          # Backend core (BE only)
│   │   ├── use-cases/admin/           # Business logic
│   │   │   ├── incident/
│   │   │   ├── ticketType/
│   │   │   ├── serviceRequest/
│   │   │   ├── advisoryRequest/
│   │   │   ├── configuration/
│   │   │   └── header/
│   │   ├── infrastructure/admin/      # Gateway implementations
│   │   │   ├── PrismaIncidentGateway.ts
│   │   │   ├── InMemoryIncidentGateway.ts
│   │   │   └── ...
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   └── error-handler.middleware.ts
│   │   ├── database/
│   │   │   └── prisma.client.ts
│   │   ├── config/
│   │   │   ├── email.config.ts
│   │   │   ├── logger.config.ts
│   │   │   └── config.json
│   │   ├── repository/
│   │   ├── service/
│   │   └── validation/
│   │
│   ├── ui/                            # Frontend (FE only)
│   │   ├── components/                # 40+ shared UI components
│   │   │   ├── Button/
│   │   │   ├── DataTable/
│   │   │   ├── Modal/
│   │   │   ├── TextField/
│   │   │   ├── Select/
│   │   │   ├── Card/
│   │   │   ├── JobStatusCard/
│   │   │   └── ... (40+ components)
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard/
│   │   │   │   ├── CreateTicket/
│   │   │   │   ├── IncidentManagement/
│   │   │   │   ├── IncidentDetail/
│   │   │   │   ├── TicketDetail/
│   │   │   │   ├── ChangeManagement/
│   │   │   │   ├── ProblemManagement/
│   │   │   │   ├── CabRequest/
│   │   │   │   ├── Configuration/
│   │   │   │   ├── UserManagement/
│   │   │   │   ├── RoleRequests/
│   │   │   │   ├── ConsultantProfile/
│   │   │   │   ├── KnowledgeBase/
│   │   │   │   ├── TestScripts/
│   │   │   │   ├── TicketTemplates/
│   │   │   │   ├── SuggestedSolution/
│   │   │   │   ├── TimeManagement/
│   │   │   │   ├── Reports/
│   │   │   │   ├── Favourites/
│   │   │   │   ├── RecentItems/
│   │   │   │   ├── Profile/
│   │   │   │   ├── Header/
│   │   │   │   └── SideNav/
│   │   │   ├── user/
│   │   │   │   ├── Dashboard/
│   │   │   │   ├── IncidentManagement/
│   │   │   │   ├── ChangeManagement/
│   │   │   │   ├── ProblemManagement/
│   │   │   │   ├── Favourites/
│   │   │   │   ├── RecentItems/
│   │   │   │   ├── Header/
│   │   │   │   └── SideNav/
│   │   │   └── consultant/
│   │   │       ├── Dashboard/
│   │   │       ├── CreateTicket/
│   │   │       ├── ChangeManagement/
│   │   │       ├── ProblemManagement/
│   │   │       ├── Header/
│   │   │       └── SideNav/
│   │   ├── hooks/                     # Custom React hooks
│   │   ├── mocks/                     # Mock data for Storybook & testing
│   │   │   ├── admin/
│   │   │   │   ├── header.mock.ts
│   │   │   │   ├── incident.mock.ts
│   │   │   │   ├── jobStatus.mock.ts
│   │   │   │   └── ticketType.mock.ts
│   │   │   └── auth/
│   │   ├── slices/                    # Redux slices
│   │   ├── store/                     # Redux store
│   │   └── state/                     # State management
│   │
│   ├── theme/                         # Theming system
│   │   ├── createAppMetadata.ts
│   │   ├── palette.ts
│   │   ├── themePalettes.ts
│   │   └── theme.ts
│   ├── shared/                        # Shared constants & types
│   │   └── constants/
│   │       ├── admin.constants.ts
│   │       ├── user.constants.ts
│   │       └── consultant.constants.ts
│   └── services/                      # API service layer
│       ├── adminServices.ts
│       ├── authServices.ts
│       ├── userServices.ts
│       └── baseServices.ts
│
├── web/                               # FRONTEND APPLICATIONS
│   ├── apps/
│   │   └── administration/            # Administration web app (port 1600)
│   └── tenants/
│       └── generale-partner/          # Generale Partner tenant (port 1700)
│
├── env/src/                           # Environment configs per app
│   ├── env.administration.json        # Administration app config
│   ├── env.gateway.json               # Backend gateway config
│   └── env.generale-partner.json      # Generale Partner tenant config
│
├── docker-compose.yml                 # Docker services
├── Dockerfile                         # Docker build
├── nodemon.json                       # Nodemon config
├── nx.json                            # NX monorepo config
├── webpack.config.ts                  # Root webpack config
├── tsconfig.base.json
├── tsconfig.json
├── tsconfig.app.json
├── jest.config.ts
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ (or use Docker)
- Redis 7+ (optional, or use Docker)
- npm 9+

### Installation

```bash
# Clone repository
git clone <repository-url>
cd SerivceOps

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed database with test data
npm run prisma:seed
```

### Running the Application

```bash
# Start backend (Express API) — http://localhost:3001
npm run dev:backend

# Start frontend apps
npm run serve:administration        # http://localhost:1600
npm run serve:generale-partner      # http://localhost:1700

# Start Storybook (component library)
npm run storybook                   # http://localhost:6006
```

### Port Configuration

| App | Command | Port |
|-----|---------|------|
| **Administration** | `serve:administration` | 1600 |
| **Generale Partner** | `serve:generale-partner` | 1700 |
| **Backend API** | `dev:backend` | 3001 |
| **Storybook** | `storybook` | 6006 |

---

## Docker Setup

Use Docker Compose for local development with PostgreSQL and Redis:

```bash
# Start PostgreSQL and Redis containers
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f
```

### Docker Services

| Service | Container | Port | Description |
|---------|-----------|------|-------------|
| PostgreSQL | serivceops-postgres | 5432 | Primary database |
| Redis | serivceops-redis | 6379 | Caching layer |

### Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```env
# Server
NODE_ENV=development
PORT=3001
HOST=localhost

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/serivceops_db?schema=public

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=7d

# Redis (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# Logging
LOG_LEVEL=debug
LOG_FILE_PATH=./logs
ENABLE_CONSOLE_LOGS=true

# CORS
CORS_ORIGIN=http://localhost:1600,http://localhost:1700

# Email / SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-here
SMTP_FROM=serivceops App <noreply@serviceops.tech>
```

#### Gmail SMTP Setup

For Gmail, use an **App Password** (not your regular account password):

1. Enable 2-Factor Authentication on your Google account
2. Visit [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Generate a new App Password for "Mail"
4. Use the 16-character password as the `SMTP_PASS` value

> **Note**: In development mode (`NODE_ENV=development`), OTPs are logged to the console, so SMTP is not required for local testing.

---

## Role-Based Access Control

serivceops implements a comprehensive role-based access control system with three primary roles.

### User Roles

| Role | Access Level | Description |
|------|-------------|-------------|
| **Admin** | Full System Access | User management, role approvals, all ITSM features, system configuration |
| **Consultant** | Change & Problem Management | Change management, problem management, ticket creation, access requests |
| **User** | Basic ITSM Features | Incident management, dashboard, basic ticket operations |

### Sign-Up & Role Request Flow

1. **Sign-Up**: Navigate to `/signup`
2. **Role Selection**: Choose between:
   - **Consultant** (requires approval)
   - **Admin** (requires approval)
3. **Account Creation**:
   - All users start with **User** role by default
   - Selected role (Consultant/Admin) sent as an approval request
   - User redirected to the dashboard for profile setup
4. **Approval Process**:
   - Admin reviews role requests in the Role Requests section
   - Upon approval, user gains requested role access

### Role-Specific Features

**Admin Features:**
- Dashboard & Analytics
- Incident, Change, Problem Management
- CAB Requests & Ticket Templates
- Knowledge Base, Test Scripts, Suggested Solutions
- Time Management & Reports
- User Management & Role Approvals
- Consultant Profile Management
- System Configuration (SLAs, priorities, statuses, categories)
- Favourites & Recent Items

**Consultant Features:**
- Dashboard
- Create Ticket
- Change Management
- Problem Management

**User Features:**
- Dashboard
- Incident Management
- Change & Problem Management (read/limited)
- Favourites & Recent Items

---

## Authentication & Security

### JWT-Based Authentication

- Secure token-based authentication
- Password hashing with bcryptjs (salt rounds: 10)
- Token expiration: 7 days (configurable)

### Account Security

- **Account Lockout**: 5 failed login attempts trigger a 30-minute lockout
- **Password Reset**: OTP-based password reset via email
- **OTP Validity**: 10 minutes
- **Rate Limiting**: Prevents multiple OTP requests if an existing OTP is still valid

### Forgot Password Flow

1. User enters email on `/forgot-password` page
2. System generates a 6-digit OTP and sends via email
3. User verifies OTP on the verification page
4. User sets a new password
5. System updates the password and allows sign-in

> **Development Mode**: OTP is logged to console for testing without SMTP configuration.

### Default Test Credentials (after seeding)

```
admin@serviceops.tech       / admin123
user@serviceops.tech        / user123
consultant@serviceops.tech  / consultant123
```

---

## Incident Management

The Incident Management module provides full lifecycle management for IT incidents.

### Incident Statuses

| Status | Description |
|--------|-------------|
| **New** | Newly created incident |
| **In Progress** | Being actively worked on |
| **On Hold** | Paused, awaiting external action |
| **Resolved** | Fix applied, pending confirmation |
| **Closed** | Confirmed resolved |
| **Cancelled** | No longer needed |
| **Draft** | Saved as draft with optional expiry |

### Priority Matrix

Priority is calculated from **Impact × Urgency**:

| | High Urgency | Medium Urgency | Low Urgency |
|---|---|---|---|
| **High Impact** | Critical | High | Medium |
| **Medium Impact** | High | Medium | Low |
| **Low Impact** | Medium | Low | Low |

### Incident Detail Page

The detail page (`/admin/incidents/:number`) provides a full-featured view:

- **Header** — Incident number with copy, title with copy, page URL copy, prev/next navigation
- **Draft Expiry Banner** — Countdown timer for draft incidents with expiry dates
- **Info Strip** — Caller, Priority (clickable chip), Queue, Primary Resource, Due Date, SLA progress bar, ETA (editable)
- **Time Summary** — Collapsible section showing Approved/Billable/Non-Billable/Variance hours
- **Action Bar** — Edit, Accept, Assign, Comment, Resolve, More Tools actions
- **Work Timer** — Start/pause/stop timer for per-incident time tracking
- **Description Section** — Rich text incident description
- **Tabs Section** — Comments, Time Entries, Resolutions, Activities, Attachments
- **Sidebar** — Created info, Client, Assignment Group, Secondary Resource, checkboxes (Major/Recurring/Release), accordions (Contact & Billing, Reporting, Additional Fields)

---

## Shared Interfaces

Interfaces in `libs/entities/interfaces/` are shared between Frontend and Backend.

### Example: Job Interface

```typescript
// libs/entities/interfaces/admin/job.interface.ts

export type JobStatus = 'needs_attention' | 'in_progress' | 'completed' | 'failed' | 'pending';
export type JobPriority = 'critical' | 'high' | 'medium' | 'low';

export interface IJob {
  id: string;
  title: string;
  description: string;
  status: JobStatus;
  priority: JobPriority;
  assignee: string;
  progress?: number;
  dueDate?: string;
}
```

### Usage

```typescript
// Backend
import { IJob, JobStatus } from '@serviceops/interfaces';

// Frontend
import { IJob, JOB_STATUS_CONFIG, JOB_PRIORITY_COLORS } from '@serviceops/interfaces';
```

---

## Backend Architecture

### Controller Pattern

Each API endpoint has a controller with DTOs and routes. Validation uses Yup schemas.

```typescript
// gateways/api/admin/TicketType/TicketType.controller.ts
export class TicketTypeController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = await CreateTicketTypeSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      const result = await this.service.create(validatedData);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ValidationError) {
        next(new BadRequestException('Validation failed', error.inner));
      }
      next(error);
    }
  }
}
```

### Gateway Pattern

Two implementations of the same interface — one for production, one for tests:

**Prisma Gateway (Production)**
```typescript
export class PrismaHeaderGateway implements IHeaderGateway {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: ICreateHeaderInput): Promise<IHeader> {
    return this.prisma.adminHeader.create({ data });
  }
}
```

**InMemory Gateway (Testing)**
```typescript
export class InMemoryHeaderGateway implements IHeaderGateway {
  private headers: IHeader[] = [];

  async create(data: ICreateHeaderInput): Promise<IHeader> {
    const header = { id: this.nextId++, ...data };
    this.headers.push(header);
    return header;
  }
}
```

---

## Frontend Architecture

### Dumb UI Components

Components only receive props and render — no business logic inside components.

```typescript
// libs/ui/components/JobStatusCard/JobStatusCard.tsx
export const JobStatusCard: React.FC<JobStatusCardProps> = ({
  title,
  status,
  priority,
  assignee,
}) => {
  const { classes } = useStyles({
    statusColor: JOB_STATUS_CONFIG[status].color,
  });

  return (
    <Card className={classes.card}>
      <Typography className={classes.title}>{title}</Typography>
    </Card>
  );
};
```

---

## Component Styling Pattern

All components use external styles. **No inline styles allowed.**

### Style File Structure

```
ComponentName/
├── ComponentName.tsx
├── index.ts
└── styles/
    ├── ComponentName.styles.shared.ts   # Base styles
    ├── ComponentName.styles.ts          # useStyles hook (with tenant overrides)
    └── index.ts                         # Exports
```

### Example

**Shared Styles (Base)**
```typescript
// styles/ComponentName.styles.shared.ts
export const getBaseStyles = (
  theme: Theme,
  params: ComponentStyleParams
): Record<string, CSSObject> => ({
  root: {
    padding: theme.spacing(2),
    backgroundColor: params.color,
  },
});
```

**Styles Hook with Tenant Overrides**
```typescript
// styles/ComponentName.styles.ts
export const useStyles = createAppStyles(
  (theme: Theme, params: ComponentStyleParams) => getBaseStyles(theme, params),
  {
    admin: {},           // Admin tenant overrides
    user: {},            // User tenant overrides
    consultant: {},      // Consultant tenant overrides
  }
);
```

**Usage in Component**
```typescript
const { classes } = useStyles({ color, isActive });
return <Box className={classes.root}>...</Box>;
```

---

## Database Migration Strategy

This project uses an **incremental migration** approach managed by Prisma.

### Migration Structure

```
gateways/prisma/
├── schema.prisma                               # Database schema definition
├── prisma.config.ts                            # Prisma configuration
├── seed.ts                                     # Database seeding
├── scripts/
│   ├── sync-schema.ts                          # Quick sync for development
│   └── regenerate-migration.ts                 # Regenerate init migration
└── migrations/
    ├── migration_lock.toml
    ├── 20260105000000_init/                    # Initial schema
    │   └── migration.sql
    └── 20260306000000_add_missing_incident_columns/  # Schema additions
        └── migration.sql
```

### Development Workflow

```bash
# Step 1: Edit schema
# Edit gateways/prisma/schema.prisma

# Step 2: Sync to database (development only — no migration file created)
npm run prisma:migrate

# Step 3: (Optional) View data
npm run prisma:studio
```

### Production Workflow

```bash
# Step 1: Edit schema
# Edit gateways/prisma/schema.prisma

# Step 2: Regenerate the init migration
npm run prisma:regenerate

# Step 3: Commit the updated migration
git add gateways/prisma/migrations/
git commit -m "Update database schema"

# Step 4: Deploy to production
npm run prisma:deploy
```

### Commands Reference

| Command | When to Use | What It Does |
|---------|-------------|--------------|
| `prisma:migrate` | Development | Pushes schema changes directly to DB |
| `prisma:regenerate` | Before production | Regenerates init migration from schema |
| `prisma:deploy` | Production | Applies migration to production DB |
| `prisma:reset` | Reset needed | Drops all data and recreates DB |
| `prisma:studio` | Debug/View data | Opens Prisma Studio GUI |
| `prisma:seed` | Initial setup | Seeds DB with test users and data |

---

## Testing

### Backend Testing (Use Cases)

```typescript
import { CreateHeaderUseCase } from '../CreateHeader.usecase';
import { InMemoryHeaderGateway } from '@serviceops/core/infrastructure';

describe('CreateHeaderUseCase', () => {
  let useCase: CreateHeaderUseCase;
  let gateway: InMemoryHeaderGateway;

  beforeEach(() => {
    gateway = new InMemoryHeaderGateway(); // No DB needed!
    useCase = new CreateHeaderUseCase(gateway);
  });

  it('should create a header', async () => {
    const result = await useCase.execute({ name: 'Test', ... });
    expect(result.name).toBe('Test');
  });
});
```

### Frontend Testing (Storybook)

```bash
npm run storybook
```

- See components in all states (loading, error, success)
- Test different data scenarios with mocks
- Preview per tenant/theme

---

## Development Commands

### Backend

```bash
npm run dev:backend              # Start Express server with hot reload
npm run start:backend            # Start without hot reload
npm run build:backend            # Compile TypeScript
npm run build:backend:clean      # Clean dist and rebuild
```

### Frontend

```bash
# Serve apps
npm run serve:administration     # Administration app (http://localhost:1600)
npm run serve:generale-partner   # Generale Partner tenant (http://localhost:1700)

# Build apps
npm run build:administration     # Build Administration app
npm run build:generale-partner   # Build Generale Partner tenant
npm run build:shared             # Build shared libraries
npm run build                    # Build all apps
```

### Database (Prisma)

```bash
npm run prisma:generate          # Generate Prisma client
npm run prisma:migrate           # Sync schema to DB (development)
npm run prisma:deploy            # Apply migrations (production)
npm run prisma:reset             # Reset database completely
npm run prisma:studio            # Open Prisma Studio GUI
npm run prisma:seed              # Seed database with test data
npm run prisma:regenerate        # Regenerate init migration from schema
npm run prisma:sync              # Quick schema sync script
```

### Testing & Quality

```bash
npm test                         # Run all tests
npm run test:watch               # Watch mode
npm run test:coverage            # With coverage report
npm run test:shared              # Shared lib tests only
npm run test:administration      # Administration app tests only
npm run storybook                # Start Storybook
npm run build-storybook          # Build Storybook static files
npm run lint                     # Lint code
npm run lint:fix                 # Auto-fix lint issues
npm run format                   # Format with Prettier
npm run format:check             # Check formatting
npm run fix:all                  # Lint + Format in one step
npm run type-check               # TypeScript type check
npm run validate                 # Format check + Lint + Type check
```

### Docker

```bash
docker-compose up -d             # Start services (PostgreSQL + Redis)
docker-compose down              # Stop services
docker-compose logs -f           # View logs
```

---

## API Endpoints

### Base URL & Auth Header

```
http://localhost:3001
```

All protected endpoints require a JWT bearer token:

```
Authorization: Bearer <token>
```

### Health Check

**GET** `/health` — No auth required.

```json
{ "status": "OK", "timestamp": "2025-02-12T10:00:00.000Z" }
```

---

### Auth API

All auth actions use a single **POST** `/api/auth` with an `action` field.

#### Sign In

```json
{ "action": "signin", "email": "admin@serviceops.tech", "password": "admin123" }
```

**Response (201):**

```json
{
  "message": "Sign in successful",
  "data": {
    "user": { "userId": 1, "userName": "Admin User", "userEmail": "admin@serviceops.tech", "role": "admin", "isActive": true },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Seeded Test Users

| Email | Password | Role |
|-------|----------|------|
| `admin@serviceops.tech` | `admin123` | admin |
| `user@serviceops.tech` | `user123` | user |
| `consultant@serviceops.tech` | `consultant123` | consultant |

#### Sign Up

```json
{
  "action": "signup",
  "firstName": "John", "lastName": "Doe",
  "email": "john@serviceops.tech",
  "password": "password123", "confirmPassword": "password123",
  "phone": "+1-555-0000",
  "workLocation": "NYC", "department": "IT",
  "reasonForAccess": "Support ticket handling",
  "employeeId": "EMP123", "businessUnit": "Operations",
  "managerName": "Jane Smith", "role": "user"
}
```

**Response (201):** `{ "message": "Account created successfully. Your account is pending admin approval.", "data": { "roleRequestPending": true } }`

#### Forgot Password

```json
{ "action": "forgot-password", "email": "user@serviceops.tech" }
```

**Response (200):** `{ "message": "If the email exists, an OTP has been sent." }`

#### Verify OTP

```json
{ "action": "verify-otp", "email": "user@serviceops.tech", "otp": "123456" }
```

**Response (200):** `{ "message": "OTP verified successfully", "data": { "verified": true, "resetToken": "jwt-reset-token" } }`

#### Reset Password

```json
{
  "action": "reset-password",
  "email": "user@serviceops.tech",
  "resetToken": "jwt-reset-token",
  "newPassword": "newpassword123", "confirmPassword": "newpassword123"
}
```

**Response (200):** `{ "message": "Password reset successfully. You can now sign in with your new password." }`

#### Change Password _(requires auth)_

```json
{ "action": "change-password", "currentPassword": "old123", "newPassword": "new123" }
```

#### Admin User Actions _(admin only)_

| Action | Description |
|--------|-------------|
| `get-all-users` | List all users |
| `get-user` + `userId` | Get single user |
| `update-user` + `userId` + `data` | Update user fields |
| `delete-user` + `userId` | Delete user |
| `unlock-user` + `userId` | Unlock locked account |
| `create-user` | Create active user immediately |
| `create-pending-user` | Create user pending approval |
| `activate-user` + `userId` | Manually activate user |
| `deactivate-user` + `userId` | Deactivate user |
| `get-role-requests` | Get all role requests |
| `get-pending-role-requests` | Get pending role requests |
| `approve-role-request` + `userId` + `adminNotes` | Approve role request |
| `reject-role-request` + `userId` + `adminNotes` | Reject role request |
| `get-change-log` | Get user audit log |

---

### Incident API

Base path: `/api/admin/incidents` — all endpoints require auth.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/incidents` | Get all incidents |
| GET | `/api/admin/incidents/drafts` | Get draft incidents |
| GET | `/api/admin/incidents/:id` | Get incident by ID |
| GET | `/api/admin/incidents/number/:number` | Get by number (e.g. `INC0000001`) |
| POST | `/api/admin/incidents` | Create incident |
| PUT | `/api/admin/incidents/:id` | Update incident |
| DELETE | `/api/admin/incidents/:id` | Delete incident |

**Create Incident** — required fields: `caller`, `businessCategory`, `serviceLine`, `application`, `shortDescription`, `description`, `impact`, `urgency`, `channel`, `assignmentGroup`, `createdBy`

```json
{
  "caller": "John Doe", "businessCategory": "IT Support", "serviceLine": "Hardware",
  "application": "Windows", "shortDescription": "Printer not working",
  "description": "Network printer on floor 3 not responding",
  "impact": "medium", "urgency": "medium", "channel": "portal",
  "assignmentGroup": "IT Support Team", "createdBy": "admin@serviceops.tech",
  "status": "new", "client": "Acme Corp", "isRecurring": false, "isMajor": false
}
```

> For **drafts**, only `caller` and `createdBy` are required. Set `"status": "draft"`.

**Update Incident** — all fields optional:

```json
{ "status": "in_progress", "priority": "2-High", "assignmentGroup": "Escalation Team" }
```

---

### Comment API

Base path: `/api/admin/incidents/:id/comments`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/incidents/:id/comments` | Get comments |
| POST | `/api/admin/incidents/:id/comments` | Add comment |

**Create Comment** — required: `subject`, `message`

```json
{
  "subject": "Follow-up needed",
  "message": "User confirmed the issue persists",
  "isInternal": false, "isSelfNote": false, "notifyAssigneesOnly": false,
  "status": "in_progress", "createdBy": "admin@serviceops.tech"
}
```

---

### Time Entry API

Base path: `/api/admin/incidents/:id/time-entries`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/incidents/:id/time-entries` | Get time entries |
| POST | `/api/admin/incidents/:id/time-entries` | Add time entry |

**Create Time Entry** — required: `date`, `hours`, `minutes`

```json
{
  "date": "2025-02-12", "hours": 2, "minutes": 30,
  "billingCode": "PROJECT-001", "activityTask": "Troubleshooting printer drivers",
  "externalComment": "Investigated driver compatibility",
  "internalComment": "Need to escalate to vendor",
  "isNonBillable": false, "createdBy": "admin@serviceops.tech"
}
```

---

### Resolution API

Base path: `/api/admin/incidents/:id/resolutions`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/incidents/:id/resolutions` | Get resolutions |
| POST | `/api/admin/incidents/:id/resolutions` | Add resolution |

**Create Resolution** — required: `resolutionCode`, `resolution`

```json
{
  "resolutionCode": "permanent_fix",
  "resolution": "Updated printer drivers to latest version",
  "application": "Windows", "category": "Hardware Issue", "subCategory": "Printer",
  "customerConfirmation": true, "isRecurring": false,
  "rootCauseIdentified": true, "rootCause": "Outdated drivers caused compatibility issue",
  "internalNote": "Recommend updating all printers on floor 3",
  "createdBy": "admin@serviceops.tech"
}
```

**Resolution Code values:** `permanent_fix`, `workaround`, `known_error`, `duplicate`, `not_reproducible`, `user_error`, `configuration_change`, `software_update`, `hardware_replacement`, `third_party_fix`, `other`

---

### Activity API

**GET** `/api/admin/incidents/:id/activities` — read-only audit log for an incident.

```json
{
  "data": [{
    "id": 1, "incidentId": 1, "activityType": "status_change",
    "description": "Status changed from new to in_progress",
    "previousValue": "new", "newValue": "in_progress",
    "performedBy": "admin@serviceops.tech", "createdAt": "2025-02-12T10:00:00Z"
  }]
}
```

---

### Ticket Type API

Base path: `/api/admin/ticket-type`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/ticket-type` | Get all ticket types |
| GET | `/api/admin/ticket-type/:id` | Get by ID |
| POST | `/api/admin/ticket-type` | Create ticket type |
| PUT | `/api/admin/ticket-type/:id` | Update ticket type |
| DELETE | `/api/admin/ticket-type/:id` | Delete ticket type |

---

### Admin API Summary (`/api/admin/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Service Requests** | | |
| GET | `/service-request` | Get all service requests |
| GET | `/service-request/:number` | Get by number |
| POST | `/service-request` | Create service request |
| PUT | `/service-request/:id` | Update service request |
| DELETE | `/service-request/:id` | Delete service request |
| **Advisory Requests** | | |
| GET | `/advisory-request` | Get all advisory requests |
| GET | `/advisory-request/:number` | Get by number |
| POST | `/advisory-request` | Create advisory request |
| PUT | `/advisory-request/:id` | Update advisory request |
| DELETE | `/advisory-request/:id` | Delete advisory request |
| **Headers** | | |
| GET | `/header` | Get all headers |
| POST | `/header` | Create header |
| PUT | `/header/:id` | Update header |
| DELETE | `/header/:id` | Delete header |
| **Configuration** | | |
| GET | `/configuration` | Get system configuration |
| PUT | `/configuration` | Update full configuration |
| PUT | `/configuration/section` | Update a configuration section |
| **Admin Controls** | | |
| GET | `/admin-controls` | Get admin control settings |
| PUT | `/admin-controls` | Update admin control settings |

### User API (`/api/user/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Get user dashboard data |

---

### Enum Reference

| Field | Values |
|-------|--------|
| **Impact / Urgency** | `high`, `medium`, `low` |
| **Priority** | `1-Critical`, `2-High`, `3-Medium`, `4-Low`, `5-Planning` |
| **Channel** | `email`, `phone`, `portal`, `chat`, `walk_in` |
| **Status** | `draft`, `new`, `in_progress`, `on_hold`, `assigned`, `resolved`, `closed`, `cancelled` |
| **Activity Types** | `status_change`, `priority_change`, `assignment_change`, `comment_added`, `time_entry_added`, `resolution_added`, `attachment_added`, `field_update`, `follow_added`, `escalation` |

Priority is auto-calculated from **Impact × Urgency**:

| | High Urgency | Medium Urgency | Low Urgency |
|---|---|---|---|
| **High Impact** | 1-Critical | 2-High | 3-Medium |
| **Medium Impact** | 2-High | 3-Medium | 4-Low |
| **Low Impact** | 3-Medium | 4-Low | 5-Planning |

---

### Error Responses

| Status | Description | Example |
|--------|-------------|---------|
| 400 | Validation error | `{ "message": "Validation failed", "errors": [...] }` |
| 401 | Unauthorized | `{ "message": "Access token is required" }` |
| 403 | Forbidden | `{ "message": "Admin access required" }` |
| 404 | Not found | `{ "message": "Incident not found" }` |
| 409 | Conflict | `{ "message": "Email already registered" }` |
| 423 | Locked | `{ "message": "Account is locked. Try again after X minutes." }` |
| 429 | Rate limited | `{ "message": "OTP already sent. Wait X minutes." }` |

---

### API Testing (Postman)

1. **Create an environment** with variable `baseUrl` = `http://localhost:3001`
2. **Add a pre-request script** to the Sign In request to auto-save the token:
   ```javascript
   if (pm.response.code === 201) {
     const data = pm.response.json();
     pm.environment.set("token", data.data.token);
   }
   ```
3. **Set the Authorization header** on your collection to `Bearer {{token}}`
4. Use `{{baseUrl}}` in all request URLs

---

## Path Aliases

```typescript
// Shared interfaces (FE + BE)
import { IHeader, IJob } from '@serviceops/interfaces';

// Backend core
import { CreateHeaderUseCase } from '@serviceops/core/use-cases';
import { PrismaHeaderGateway } from '@serviceops/core/infrastructure';

// Frontend components
import { JobStatusCard, DataTable, Button } from '@serviceops/component';

// Mock data
import { mockJobInProgress } from '@serviceops/mocks';

// Theme & Styles
import { createAppStyles } from '@serviceops/theme';

// Hooks
import { useDebounce } from '@serviceops/hooks';

// Services
import { adminService } from '@serviceops/services';

// Constants
import { API_ROUTES } from '@serviceops/constants';

// Store & State
import { store } from '@serviceops/store';
import { useAppSelector } from '@serviceops/state';
```

---

## Technology Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Backend** | Express.js | 4.18 | REST API server |
| **Database** | PostgreSQL | 15 | Data persistence |
| **ORM** | Prisma | 7.2 | Database access |
| **Cache** | Redis | 7 | Caching layer (optional) |
| **Frontend** | React | 19.0 | UI framework |
| **UI Library** | MUI | 7.3 | Component library |
| **State** | Redux Toolkit | 2.10 | State management |
| **Forms** | Formik + Yup | 2.4 | Form handling & validation |
| **Styling** | Emotion + tss-react | 4.9 | CSS-in-JS |
| **Charts** | ApexCharts | 5.3 | Data visualization |
| **Testing** | Jest | 30 | Unit testing |
| **Docs** | Storybook | 10.1 | Component documentation |
| **Build** | Webpack + NX | 22.1 | Build tooling |
| **Validation** | Yup | 1.7 | Schema validation |
| **Auth** | bcryptjs + JWT | 3.0 / 9.0 | Authentication & password hashing |
| **Email** | Nodemailer | 7.0 | OTP & transactional emails |
| **Logging** | Winston | 3.19 | Structured logging |
| **Language** | TypeScript | 5.9 | Type safety |

---

## Troubleshooting

### Email/OTP Not Sending

**Symptoms:** Users not receiving OTP emails, email errors in backend logs.

1. **Development Mode** — OTP is printed to console:
   ```
   [DEV] OTP for user@example.com: 123456
   ```

2. **Verify SMTP config** in `.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password   # Must be App Password, not account password
   ```

3. **Gmail App Password** — Enable 2FA, then generate at [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)

---

### Database Connection Issues

**Symptoms:** `P1001: Can't reach database server`, connection timeout.

1. **Check Docker containers:**
   ```bash
   docker-compose ps
   docker-compose up -d
   ```

2. **Verify `DATABASE_URL`** format in `.env`:
   ```env
   DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/serivceops_db?schema=public
   # Special characters in password must be URL-encoded (& → %26)
   ```

3. **Run migrations:**
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   ```

4. **Test connection:**
   ```bash
   npm run prisma:studio
   ```

---

### Build Errors

**Symptoms:** `Module not found`, TypeScript errors, Prisma client errors.

1. **Clear cache and reinstall:**
   ```bash
   rm -rf node_modules .nx dist
   npm install
   ```

2. **Regenerate Prisma client:**
   ```bash
   npm run prisma:generate
   ```

3. **Clear NX cache:**
   ```bash
   npx nx reset
   ```

4. **Check Node version:**
   ```bash
   node -v   # Must be 20+
   npm -v    # Must be 9+
   ```

---

### Port Already in Use

**Symptoms:** `EADDRINUSE: address already in use :::3001`

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3001 | xargs kill -9
```

---

### Role Request Not Appearing

**Symptoms:** User signed up as Consultant/Admin but no request appears in Role Requests.

1. **Check database via Prisma Studio:**
   ```bash
   npm run prisma:studio
   # Inspect User table — check requestedRole and status fields
   ```

2. **Check signup flow** — ensure frontend sends the correct role value and backend sets `requestedRole`.

---

### Styles Not Applying in Consultant View

**Symptoms:** Components look unstyled or use wrong theme in consultant pages.

1. **Verify the component styles** include a `consultant:` override block:
   ```typescript
   export const useStyles = createAppStyles((theme: Theme) => getBaseStyles(theme), {
     admin: {},
     user: {},
     consultant: {},  // Must be present
   });
   ```

2. **Check theme context** — ensure consultant routes are wrapped with the correct theme provider.

3. **Hard refresh browser** — `Ctrl+Shift+R` / `Cmd+Shift+R`

---

## License

MIT

---

**Last Updated:** March 2026
