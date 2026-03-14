# PICKS - Full-Stack Monorepo

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
- [Shared Interfaces](#shared-interfaces)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Incident Management](#incident-management)
- [Component Styling Pattern](#component-styling-pattern)
- [Database Migration Strategy](#database-migration-strategy)
- [Testing](#testing)
- [Development Commands](#development-commands)
- [API Endpoints](#api-endpoints)
- [Path Aliases](#path-aliases)
- [Technology Stack](#technology-stack)

---

## Overview

PICKS is an ITIL Service Management Platform built with clean architecture principles:

- **ITSM Features** - Incident management, change management, problem management, dashboards
- **Shared Interfaces** - Same TypeScript types used by both Frontend and Backend
- **Use Case Pattern** - Business logic encapsulated in single-responsibility classes
- **Gateway Pattern** - Dual implementations (Prisma for production, InMemory for tests)
- **Dumb UI Components** - Components just render props, no business logic
- **External Styles** - All component styles in separate files, no inline styles
- **Role-Based Access** - Admin, User, and Consultant roles with approval workflow
- **Mock Data** - Easy to test all UI variations in Storybook
- **Multi-Tenant Theming** - Support for different partner configurations
- **Docker Support** - Containerized PostgreSQL and Redis for local development

### Key Principles

| Principle | Description |
|-----------|-------------|
| **Separation of Concerns** | UI renders, Backend handles logic |
| **Shared Types** | Same interface for FE & BE |
| **External Styles** | No inline styles, all styles in `/styles` folder |
| **Testability** | InMemory gateways for unit tests |
| **Single Responsibility** | One use case = one business operation |

---

## Role-Based Access Control

PICKS implements a comprehensive role-based access control system with three primary roles:

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
   - Selected role (Consultant/Admin) sent as approval request
   - User redirected to User dashboard for profile setup
4. **Approval Process**:
   - Admin reviews role requests in Access Requests section
   - Upon approval, user gains requested role access
   - User can then access role-specific features

### Role-Specific Features

**Admin Features:**
- Dashboard & Analytics
- User Management & Role Approvals
- All ITSM Modules (Incident, Change, Problem)
- Ticket Templates & CAB Requests
- Knowledge Base & Test Scripts
- Time Management & Reports

**Consultant Features:**
- Dashboard
- Change Management
- Problem Management
- Create Ticket
- Access Requests

**User Features:**
- Dashboard
- Incident Management
- Basic Change/Problem viewing
- Favorites & Recent Items

---

## Authentication & Security

### JWT-Based Authentication
- Secure token-based authentication
- Password hashing with bcryptjs (salt rounds: 10)
- Token expiration: 7 days (configurable)

### Account Security
- **Account Lockout**: 5 failed login attempts trigger 30-minute lockout
- **Password Reset**: OTP-based password reset via email
- **OTP Validity**: 10 minutes
- **Rate Limiting**: Prevents multiple OTP requests if existing OTP is valid

### Forgot Password Flow

1. User enters email on `/forgot-password` page
2. System generates 6-digit OTP and sends via email
3. User receives email with OTP (valid for 10 minutes)
4. User verifies OTP on verification page
5. User sets new password
6. System updates password and allows sign-in

> **Development Mode**: In development environment, OTP is logged to console for testing without SMTP configuration.

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
│  │              @picks/interfaces (Shared Types)                ││
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
picks/
├── gateways/                      # BACKEND (Express API)
│   ├── api/
│   │   ├── admin/                 # Admin API routes
│   │   │   ├── Incident/
│   │   │   │   ├── Incident.controller.ts
│   │   │   │   ├── Incident.dto.ts
│   │   │   │   └── Incident.routes.ts
│   │   │   ├── TicketType/
│   │   │   │   ├── TicketType.controller.ts
│   │   │   │   ├── TicketType.dto.ts
│   │   │   │   └── TicketType.routes.ts
│   │   │   └── routes.ts
│   │   └── user/                  # User API routes
│   │       ├── NotFound/
│   │       └── routes.ts
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   ├── prisma.config.ts       # Prisma configuration
│   │   ├── seed.ts                # Database seeding
│   │   └── migrations/            # Database migrations
│   ├── src/
│   │   ├── app.ts                 # Express app
│   │   ├── server.ts              # Server entry
│   │   └── index.ts               # Main entry point
│   └── utils/                     # Backend utilities
│
├── libs/                          # SHARED LIBRARIES
│   ├── entities/                  # Shared interfaces (FE + BE)
│   │   └── interfaces/
│   │       ├── admin/
│   │       │   ├── header.interface.ts
│   │       │   ├── dashboard.interface.ts
│   │       │   ├── job.interface.ts
│   │       │   └── ...
│   │       └── user/
│   │           ├── dashboard.interface.ts
│   │           ├── sidenav.interface.ts
│   │           └── ...
│   │
│   ├── core/                      # Backend core (BE only)
│   │   ├── gateways/              # Gateway interfaces
│   │   ├── infrastructure/        # Gateway implementations
│   │   ├── use-cases/             # Business logic
│   │   ├── middleware/            # Express middleware
│   │   ├── database/              # Prisma client
│   │   ├── config/                # Configuration
│   │   ├── repository/            # Repository layer
│   │   ├── service/               # Service layer
│   │   └── validation/            # Validation schemas
│   │
│   ├── ui/                        # Frontend (FE only)
│   │   ├── components/            # UI components
│   │   │   ├── JobStatusCard/
│   │   │   │   ├── JobStatusCard.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── styles/
│   │   │   │   │   ├── JobStatusCard.styles.shared.ts
│   │   │   │   │   ├── JobStatusCard.styles.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── __tests__/
│   │   │   │       └── JobStatusCard.stories.tsx
│   │   │   ├── DataTable/
│   │   │   ├── Button/
│   │   │   ├── Card/
│   │   │   ├── Modal/
│   │   │   ├── TextField/
│   │   │   ├── Select/
│   │   │   └── ... (40+ components)
│   │   ├── mocks/                 # Mock data for Storybook & testing
│   │   │   ├── admin/
│   │   │   │   ├── header.mock.ts
│   │   │   │   ├── incident.mock.ts   # Incident mocks (all statuses, draft)
│   │   │   │   └── jobStatus.mock.ts
│   │   │   └── auth/
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── pages/                 # Page components
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard/
│   │   │   │   ├── CreateTicket/
│   │   │   │   ├── IncidentManagement/
│   │   │   │   ├── IncidentDetail/
│   │   │   │   │   ├── components/     # Header, InfoRow, Sidebar, ActionBar, etc.
│   │   │   │   │   ├── modals/         # Assign, Priority, Attachment modals
│   │   │   │   │   ├── windows/        # Comment, Resolve, TimeEntry windows
│   │   │   │   │   ├── hooks/          # useIncidentDetail, useIncidentTimer
│   │   │   │   │   ├── styles/         # Shared + tenant styles
│   │   │   │   │   ├── types/          # Page-specific types
│   │   │   │   │   └── utils/          # SLA calc, priority colors, time summary
│   │   │   │   └── Header/
│   │   │   └── user/
│   │   ├── slices/                # Redux slices
│   │   ├── store/                 # Redux store
│   │   └── state/                 # State management
│   │
│   ├── theme/                     # Theming system
│   │   ├── createAppStyles.ts     # Style factory
│   │   └── createAppMetadata.ts   # App metadata
│   ├── shared/                    # Shared constants
│   │   └── constants/
│   ├── services/                  # API services
│   └── utils/                     # Utility functions
│
├── web/                           # FRONTEND APPS
│   ├── apps/
│   │   ├── admin/                 # Admin web app
│   │   │   ├── src/
│   │   │   ├── package.json
│   │   │   └── webpack.config.js
│   │   └── user/                  # User web app
│   │       ├── src/
│   │       ├── package.json
│   │       └── webpack.config.js
│   └── tenants/
│       ├── generale-partner-admin/
│       └── generale-partner-user/
│
├── env/                           # Environment configs
│   └── src/
│       ├── env.admin.json
│       ├── env.user.json
│       ├── env.generale-partner.json
│       └── env.gateway.json
│
├── docker-compose.yml             # Docker services
├── Dockerfile                     # Docker build
├── .dockerignore
├── nodemon.json                   # Nodemon config
├── package.json
├── tsconfig.base.json
├── tsconfig.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ (or use Docker)
- Redis 7+ (or use Docker)
- npm 9+

### Installation

```bash
# Clone repository
git clone <repository-url>
cd picks

# Install dependencies
npm install

# Setup database
npm run prisma:generate
npm run prisma:migrate
```

### Running the Application

```bash
# Start backend (Express API)
npm run dev:backend              # http://localhost:3001

# Start frontend (React)
npm run serve:admin              # http://localhost:1500
npm run serve:user               # http://localhost:1400

# Start Storybook
npm run storybook                # http://localhost:6006
```

### Port Configuration

| App Type | Apps | Port |
|----------|------|------|
| **Admin** | admin, generale-partner-admin | 1500 |
| **User** | user, generale-partner-user | 1400 |
| **Backend** | Express API | 3001 |
| **Storybook** | Component docs | 6006 |

> **Note:** Admin apps and their tenants share port 1500. User apps and their tenants share port 1400. Run only one app per port at a time.

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
| PostgreSQL | picks-postgres | 5432 | Database |
| Redis | picks-redis | 6379 | Caching |

### Application Ports

| Application | Port | Description |
|-------------|------|-------------|
| Admin Apps | 1500 | admin, generale-partner-admin |
| User Apps | 1400 | user, generale-partner-user |
| Backend API | 3001 | Express REST API |
| Storybook | 6006 | Component documentation |

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/picks_db?schema=public

# Redis (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Email / SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-here
SMTP_FROM=PICKS App <noreply@picks.com>

# Environment
NODE_ENV=development
```

#### Gmail SMTP Setup

For Gmail, use an **App Password** (not your regular account password):

1. Enable 2-Factor Authentication on your Google account
2. Visit [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Generate a new App Password for "Mail"
4. Copy the 16-character password
5. Use it as the `SMTP_PASS` value in your `.env` file

> **Note**: In development mode (`NODE_ENV=development`), OTPs are logged to the console instead of sending emails, making it easier to test without configuring SMTP.

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

export const JOB_STATUS_CONFIG: Record<JobStatus, { label: string; color: string; bgColor: string }>;
export const JOB_PRIORITY_COLORS: Record<JobPriority, string>;
```

### Usage

```typescript
// Backend
import { IJob, JobStatus } from '@picks/interfaces';

// Frontend
import { IJob, JOB_STATUS_CONFIG, JOB_PRIORITY_COLORS } from '@picks/interfaces';
```

---

## Backend Architecture

### Controller Pattern

Each API endpoint has a controller with DTOs and routes. Validation uses Yup schemas.

```typescript
// gateways/api/admin/TicketType/TicketType.controller.ts
import { ValidationError } from 'yup';
import { CreateTicketTypeSchema } from '@picks/interfaces';

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
        const errors = error.inner.map((err) => ({
          path: err.path,
          message: err.message,
        }));
        next(new BadRequestException('Validation failed', errors));
      }
      next(error);
    }
  }

  async findAll(req: Request, res: Response): Promise<void> {
    const results = await this.service.findAll();
    res.json(results);
  }
}
```

### Gateway Pattern

Two implementations of the same interface:

**1. Prisma Gateway (Production)**
```typescript
export class PrismaHeaderGateway implements IHeaderGateway {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: ICreateHeaderInput): Promise<IHeader> {
    return this.prisma.adminHeader.create({ data });
  }
}
```

**2. InMemory Gateway (Testing)**
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

Components only receive props and render - no business logic.

```typescript
// libs/ui/components/JobStatusCard/JobStatusCard.tsx
import { IJob, JOB_STATUS_CONFIG } from '@picks/interfaces';
import { useStyles } from './styles';

export interface JobStatusCardProps extends IJob {
  onAction?: (id: string, action: 'view' | 'edit' | 'delete') => void;
}

export const JobStatusCard: React.FC<JobStatusCardProps> = ({
  title,
  status,
  priority,
  assignee,
}) => {
  const { classes } = useStyles({
    statusColor: JOB_STATUS_CONFIG[status].color,
    // ... style params
  });

  return (
    <Card className={classes.card}>
      <Typography className={classes.title}>{title}</Typography>
      {/* No business logic here */}
    </Card>
  );
};
```

---

## Incident Management

The Incident Management module is the core ITSM feature, providing full lifecycle management for IT incidents.

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

Priority is calculated from **Impact** x **Urgency**:

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
- **Work Timer** — Start/pause/stop timer for time tracking per incident
- **Description Section** — Rich text incident description
- **Tabs Section** — Comments, Time Entries, Resolutions, Activities, Attachments
- **Sidebar** — Created info, Client, Assignment Group, Secondary Resource, checkboxes (Major/Recurring/Release), accordions (Contact & Billing, Reporting, Additional Fields)

### Seeded Test Data

```bash
# Default credentials
admin@picks.com / admin123       # Admin role
user@picks.com / user123         # User role
consultant@picks.com / consultant123  # Consultant role
```

Run `npm run prisma:seed` to populate the database with sample incidents in various statuses including draft incidents with expiry dates.

---

## Component Styling Pattern

All components use external styles following a consistent pattern. **No inline styles allowed.**

### Style File Structure

```
ComponentName/
├── ComponentName.tsx
├── index.ts
└── styles/
    ├── ComponentName.styles.shared.ts   # Base styles
    ├── ComponentName.styles.ts          # useStyles hook
    └── index.ts                         # Exports
```

### Example: Creating Styles

**1. Shared Styles (Base)**
```typescript
// styles/ComponentName.styles.shared.ts
import { Theme } from '@mui/material/styles';
import { CSSObject } from 'tss-react';

export interface ComponentStyleParams {
  color: string;
  isActive: boolean;
}

export const getBaseStyles = (
  theme: Theme,
  params: ComponentStyleParams
): Record<string, CSSObject> => ({
  root: {
    padding: theme.spacing(2),
    backgroundColor: params.color,
    opacity: params.isActive ? 1 : 0.5,
  },
  title: {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
  },
});
```

**2. Styles Hook**
```typescript
// styles/ComponentName.styles.ts
import { Theme } from '@mui/material/styles';
import { createAppStyles } from '@picks/theme';
import { getBaseStyles, ComponentStyleParams } from './ComponentName.styles.shared';

export const useStyles = createAppStyles(
  (theme: Theme, params: ComponentStyleParams) => getBaseStyles(theme, params),
  {
    admin: {},    // Admin tenant overrides
    user: {},     // User tenant overrides
  }
);
```

**3. Export**
```typescript
// styles/index.ts
export { useStyles } from './ComponentName.styles';
export type { ComponentStyleParams } from './ComponentName.styles.shared';
```

**4. Usage in Component**
```typescript
// ComponentName.tsx
import { useStyles } from './styles';

const MyComponent = ({ color, isActive }) => {
  const { classes } = useStyles({ color, isActive });

  return (
    <Box className={classes.root}>
      <Typography className={classes.title}>Title</Typography>
    </Box>
  );
};
```

---

## Testing

### Backend Testing (Use Cases)

```typescript
import { CreateHeaderUseCase } from '../CreateHeader.usecase';
import { InMemoryHeaderGateway } from '@picks/core/infrastructure';

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

View all component variations in Storybook:

```bash
npm run storybook
```

- See components in all states (loading, error, success)
- Test different data scenarios with mocks
- Preview by tenant/theme

---

## Development Commands

### Backend

```bash
npm run dev:backend              # Start Express server (hot reload)
npm run start:backend            # Start without hot reload
```

### Database (Prisma)

```bash
# Development workflow
npm run prisma:sync              # Quick sync schema to DB (development)
npm run prisma:studio            # Open Prisma Studio GUI

# Migration workflow (single init migration)
npm run prisma:regenerate        # Regenerate init migration from schema
npm run prisma:deploy            # Deploy migration to production
npm run prisma:reset             # Reset database completely

# Other
npm run prisma:generate          # Generate Prisma client
npm run prisma:seed              # Seed database with test data
```

---

## Database Migration Strategy

This project uses a **single migration** approach instead of incremental migrations.

### Migration Structure

```
gateways/prisma/
├── schema.prisma                 # Database schema definition
├── prisma.config.ts              # Prisma configuration
├── seed.ts                       # Database seeding
├── scripts/
│   ├── sync-schema.ts            # Quick sync for development
│   └── regenerate-migration.ts   # Regenerate init migration
└── migrations/
    ├── migration_lock.toml
    └── 20260105000000_init/      # Single migration (all schema)
        └── migration.sql
```

### How It Works

| Traditional Approach | Our Approach |
|---------------------|--------------|
| Creates new folder for each change | Single `20260105000000_init` folder |
| `20260101_init`, `20260102_add_users`, etc. | All changes in one migration |
| Complex migration history | Simple, clean structure |

### Development Workflow

```bash
# Step 1: Edit schema
# Edit gateways/prisma/schema.prisma

# Step 2: Sync to database (development)
npm run prisma:sync
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

### Example: Adding a New Model

```prisma
// gateways/prisma/schema.prisma

// Add new model
model AdminTask {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  status      String   @default("pending")
  createdAt   DateTime @default(now())
}
```

```bash
# For development
npm run prisma:sync

# For production (regenerates init migration)
npm run prisma:regenerate
```

### Commands Reference

| Command | When to Use | What It Does |
|---------|-------------|--------------|
| `prisma:sync` | Development | Pushes schema changes directly to DB |
| `prisma:regenerate` | Before production | Regenerates init migration from schema |
| `prisma:deploy` | Production | Applies migration to production DB |
| `prisma:reset` | Reset needed | Drops all data and recreates DB |
| `prisma:studio` | Debug/View data | Opens Prisma Studio GUI |

### Frontend

```bash
# Admin apps (Port 1500)
npm run serve:admin              # Start Admin app (http://localhost:1500)
npm run serve:generale-partner-admin  # Start Generale Partner Admin (http://localhost:1500)

# User apps (Port 1400)
npm run serve:user               # Start User app (http://localhost:1400)
npm run serve:generale-partner-user   # Start Generale Partner User (http://localhost:1400)

# Build commands
npm run build:admin              # Build Admin
npm run build:user               # Build User
npm run build:generale-partner-admin
npm run build:generale-partner-user
npm run build:shared             # Build shared libs
```

### Testing & Quality

```bash
npm test                         # Run all tests
npm run test:watch               # Watch mode
npm run test:coverage            # With coverage
npm run test:admin               # Admin tests only
npm run test:user                # User tests only
npm run storybook                # Start Storybook
npm run build-storybook          # Build Storybook
npm run lint                     # Lint code
npm run lint:fix                 # Auto-fix lint issues
npm run format                   # Format with Prettier
npm run format:check             # Check formatting
npm run fix:all                  # Lint + Format
npm run type-check               # TypeScript check
npm run validate                 # Format + Lint + Type check
```

### Docker

```bash
docker-compose up -d             # Start services
docker-compose down              # Stop services
docker-compose logs -f           # View logs
```

---

## API Endpoints

### Authentication API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/signin` | Sign in |
| POST | `/api/auth/forgot-password` | Request password reset OTP |
| POST | `/api/auth/verify-otp` | Verify OTP |
| POST | `/api/auth/reset-password` | Reset password |

### Admin API

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Ticket Types** | | |
| GET | `/api/admin/ticket-type` | Get all ticket types |
| GET | `/api/admin/ticket-type/:id` | Get ticket type by ID |
| POST | `/api/admin/ticket-type` | Create ticket type |
| PUT | `/api/admin/ticket-type/:id` | Update ticket type |
| DELETE | `/api/admin/ticket-type/:id` | Delete ticket type |
| **Incidents** | | |
| GET | `/api/admin/incident` | Get all incidents |
| GET | `/api/admin/incident/:number` | Get incident by number |
| POST | `/api/admin/incident` | Create incident |
| PUT | `/api/admin/incident/:id` | Update incident |
| DELETE | `/api/admin/incident/:id` | Delete incident |
| **Incident Comments** | | |
| GET | `/api/admin/incident/:id/comments` | Get comments for incident |
| POST | `/api/admin/incident/:id/comments` | Add comment to incident |
| **Incident Time Entries** | | |
| GET | `/api/admin/incident/:id/time-entries` | Get time entries |
| POST | `/api/admin/incident/:id/time-entries` | Add time entry |
| **Incident Resolutions** | | |
| GET | `/api/admin/incident/:id/resolutions` | Get resolutions |
| POST | `/api/admin/incident/:id/resolutions` | Add resolution |
| **Incident Activities** | | |
| GET | `/api/admin/incident/:id/activities` | Get activity log |
| **Headers** | | |
| GET | `/api/admin/header` | Get all headers |
| POST | `/api/admin/header` | Create header |
| PUT | `/api/admin/header/:id` | Update header |
| DELETE | `/api/admin/header/:id` | Delete header |
| **Dashboard** | | |
| GET | `/api/admin/dashboard` | Get dashboard summary |
| **Access Requests** | | |
| GET | `/api/admin/access-requests` | Get pending role requests |
| PUT | `/api/admin/access-requests/:id` | Approve/deny role request |

### User API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/dashboard` | Get user dashboard |
| GET | `/api/user/not-found` | 404 handler |

> **API Testing:** Use [Postman](https://www.postman.com/) to test API endpoints

---

## Path Aliases

```typescript
// Shared interfaces (FE + BE)
import { IHeader, IJob } from '@picks/interfaces';

// Backend core
import { CreateHeaderUseCase } from '@picks/core/use-cases';
import { PrismaHeaderGateway } from '@picks/core/infrastructure';

// Frontend components
import { JobStatusCard, DataTable, Button } from '@picks/component';

// Mock data
import { mockJobInProgress } from '@picks/mocks';

// Theme & Styles
import { createAppStyles } from '@picks/theme';

// Hooks
import { useDebounce } from '@picks/hooks';

// Services
import { adminService } from '@picks/services';

// Constants
import { API_ROUTES } from '@picks/constants';

// Store & State
import { store } from '@picks/store';
import { useAppSelector } from '@picks/state';
```

---

## Technology Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Backend** | Express.js | 4.18 | REST API server |
| **Database** | PostgreSQL | 15 | Data persistence |
| **ORM** | Prisma | 7.2 | Database access |
| **Cache** | Redis | 7 | Caching layer |
| **Frontend** | React | 19.0 | UI framework |
| **UI Library** | MUI | 7.3 | Component library |
| **State** | Redux Toolkit | 2.10 | State management |
| **Forms** | Formik + Yup | 2.4 | Form handling |
| **Styling** | Emotion + tss-react | 4.9 | CSS-in-JS |
| **Charts** | ApexCharts | 5.3 | Data visualization |
| **Testing** | Jest | 30 | Unit testing |
| **Docs** | Storybook | 10.1 | Component documentation |
| **Build** | Webpack + NX | 22.1 | Build tooling |
| **API Testing** | Postman | - | API testing & documentation |
| **Validation** | Yup | 1.7 | Schema validation |
| **Language** | TypeScript | 5.9 | Type safety |

---

## Troubleshooting

### Email/OTP Not Sending

**Symptoms:**
- Users not receiving OTP emails for password reset
- Email send failures in backend logs

**Solutions:**

1. **Development Mode**: Check console logs for OTP
   ```bash
   # OTP will be printed to console in development
   [DEV] OTP for user@example.com: 123456
   ```

2. **Verify SMTP Configuration**: Ensure all SMTP variables are set in `.env`
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password  # Use App Password, not regular password
   SMTP_FROM=PICKS App <noreply@picks.com>
   ```

3. **Gmail Setup**:
   - Enable 2FA on Google account
   - Generate App Password at [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Use the 16-character App Password as `SMTP_PASS`

4. **Check Email Logs**: Look for error details in backend console
   ```
   Failed to send OTP email: Error: ...
   ```

### Database Connection Issues

**Symptoms:**
- `P1001: Can't reach database server`
- Connection timeout errors

**Solutions:**

1. **Verify PostgreSQL is Running**:
   ```bash
   # If using Docker
   docker-compose ps
   docker-compose up -d postgres

   # If using local PostgreSQL
   # Windows: Check Services
   # Mac/Linux: systemctl status postgresql
   ```

2. **Check DATABASE_URL**: Ensure correct format in `.env`
   ```env
   DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
   # Special characters in password must be URL-encoded (& becomes %26)
   ```

3. **Run Migrations**:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Test Connection**:
   ```bash
   npx prisma studio  # Opens Prisma Studio if connection works
   ```

### Build Errors

**Symptoms:**
- `Module not found` errors
- TypeScript compilation errors
- Prisma client errors

**Solutions:**

1. **Clear Cache and Reinstall**:
   ```bash
   rm -rf node_modules .nx dist
   npm install
   ```

2. **Regenerate Prisma Client**:
   ```bash
   npx prisma generate
   ```

3. **Clear Nx Cache**:
   ```bash
   npx nx reset
   ```

4. **Check Node Version**:
   ```bash
   node -v  # Should be 20+
   npm -v   # Should be 9+
   ```

### Port Already in Use

**Symptoms:**
- `EADDRINUSE: address already in use :::3001`

**Solutions:**

1. **Find and Kill Process**:
   ```bash
   # Windows
   netstat -ano | findstr :3001
   taskkill /PID <PID> /F

   # Mac/Linux
   lsof -ti:3001 | xargs kill -9
   ```

2. **Change Port**: Update `.env`
   ```env
   PORT=3002  # Use different port
   ```

### Role Request Not Appearing

**Symptoms:**
- User signed up as Consultant/Admin but no request in Access Requests

**Solutions:**

1. **Check User Status**:
   ```bash
   npx prisma studio
   # Open User table, check requestedRole and status fields
   ```

2. **Verify Sign-Up Flow**:
   - Ensure validation schema accepts 'consultant' and 'admin' roles
   - Check backend Auth.controller.ts correctly sets `requestedRole`
   - Confirm frontend sends correct role value

3. **Check Database**:
   ```sql
   SELECT email, role, requestedRole, status FROM "User" WHERE email = 'user@example.com';
   ```

### Styles Not Applying in Consultant View

**Symptoms:**
- Components look unstyled or use wrong theme in consultant pages

**Solutions:**

1. **Verify Component Styles**: Check that component has `consultant:` block
   ```typescript
   // In component.styles.ts
   export const useStyles = createAppStyles((theme: Theme) => getBaseStyles(theme), {
     admin: { root: {} },
     user: { root: {} },
     consultant: { root: {} },  // Must be present
   });
   ```

2. **Check Theme Context**: Ensure consultant routes wrapped with correct theme provider

3. **Clear Browser Cache**: Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

---

## License

MIT

---

**Last Updated:** February 2026
