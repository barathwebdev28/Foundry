# Foundry

## A campus venture studio for student founders

Foundry is a full-stack incubation platform connecting student founders, internal reviewers, and investors through one focused workflow.

The platform helps a student founder create an account, submit a startup application, track its review status, and receive a final decision. Administrators review applications and supporting files. Investors discover approved startups and record simulated funding support.

Foundry is designed as a semester-ready working model: realistic enough to demonstrate product thinking, database design, authentication, authorization, security awareness, and user-centered UX without pretending to be an enterprise SaaS product.

## Project context

Student founders often have ideas but lack a structured path to validate, build, and present them. Incubation programs typically involve several disconnected activities:

- Collecting founder applications.
- Reviewing startup ideas and supporting material.
- Communicating application status.
- Presenting approved startups to potential supporters.
- Recording early funding interest.

Foundry brings these activities into one platform. The system provides a clear journey from first application to review and funding discovery.

## Problem statement

The project addresses the lack of a focused digital workflow for campus incubation programs. A useful solution must do more than display forms. It must:

- Give founders a clear application and tracking experience.
- Give administrators a reliable review workspace.
- Give investors access only to approved startups.
- Protect private application data and uploaded files.
- Persist information across sessions and devices.
- Communicate status and errors clearly.

## Objectives

1. Build a complete founder-to-investor product workflow.
2. Use a relational database instead of browser-only storage.
3. Implement role-based authentication and authorization.
4. Protect private application and file data.
5. Demonstrate transactional writes and data integrity.
6. Provide a minimalist, premium, responsive interface.
7. Document engineering decisions, risks, limitations, and future improvements.

## Core user roles

### Founder

Founders can create an account, sign in, submit applications, add teammates, attach supporting files, view their own applications, and track pending, approved, or rejected status.

Founders cannot view another founder's applications, review applications, view investor-only data, or record funding.

### Administrator

Administrators can sign in using an internally provisioned account, view all applications, search and filter applications, download supporting files, and make final approval or rejection decisions.

Administrators cannot create arbitrary public accounts. Admin accounts are provisioned through a protected setup script.

### Investor

Investors can sign in using an internally provisioned account, view approved startups, review startup summaries and teams, record simulated funding, and view funding totals.

Investors cannot view pending or rejected applications, review applications, or access private files belonging to unapproved applications.

## Main workflow

```text
Founder creates account
        ↓
Founder submits application
        ↓
Founder tracks application as pending
        ↓
Administrator reviews application
        ↓
Administrator approves or rejects it
        ↓
Founder sees the updated decision
        ↓
Investor discovers approved startup
        ↓
Investor records simulated funding
```

## Application routes

### Public and founder routes

| Route | Purpose |
|---|---|
| `/` | Public Foundry landing page |
| `/founder/signup` | Public founder account creation |
| `/login` | Shared sign-in page for all roles |
| `/register` | Founder application form |
| `/founder` | Founder application dashboard |

### Internal routes

| Route | Purpose |
|---|---|
| `/admin` | Administrator review workspace |
| `/investor` | Investor startup and funding workspace |
| `/investor/login` | Compatibility redirect to `/login` |

The sign-in page accepts only credentials. The user never chooses a role. The server looks up the stored role and redirects the user to the correct workspace.

## Technical architecture

Foundry uses a single Next.js application with server-side Route Handlers and client-side interactive workspace components.

```text
Browser
  │
  ├── Public landing page
  ├── Founder signup and application UI
  ├── Admin workspace
  └── Investor workspace
        │
        ▼
Next.js application
  │
  ├── Server Components for request-aware pages
  ├── Client Components for forms and interaction
  ├── Route Handlers for API operations
  ├── Authentication and session services
  ├── Authorization rules
  └── Validation and transaction boundaries
        │
        ▼
Neon PostgreSQL
  ├── Users and roles
  ├── Sessions
  ├── Applications
  ├── Teams
  ├── Files
  └── Funding transactions
```

## Technology stack

- Next.js 16.
- React 19.
- TypeScript with strict checking.
- Tailwind CSS.
- Neon PostgreSQL.
- `@neondatabase/serverless` for database access.
- Node.js cryptography APIs for password hashing and session tokens.
- HttpOnly cookies for browser sessions.
- Node's built-in test runner for authorization tests.
- Lenis for smooth scrolling on the public landing page.

## Database design

The database schema is defined in [`db/schema.sql`](db/schema.sql).

### `users`

Stores all authenticated users.

- `id` — UUID primary key.
- `username` — unique login identifier.
- `password_hash` — salted password hash.
- `role` — `founder`, `admin`, or `investor`.
- `display_name` — founder-facing display name.
- `created_at` — account creation time.

### `sessions`

Stores server-side sessions. The database stores a hash of the session token, while the raw token exists only in an HttpOnly browser cookie.

- `user_id` — session owner.
- `token_hash` — hashed session token.
- `expires_at` — session expiry time.
- `created_at` — session creation time.

### `applications`

Stores founder applications.

- `founder_user_id` — application owner.
- `founder_name` — submitted founder name.
- `founder_email` — submitted contact email.
- `startup_name` — startup name.
- `overview` — founder description.
- `review_status` — `pending`, `approved`, or `rejected`.
- `submitted_at` — submission timestamp.
- `reviewed_at` — final decision timestamp.

### `application_team_members`

Stores teammates linked to an application. `sort_order` preserves their display order.

### `application_files`

Stores supporting file metadata and binary data for the semester model. In a production-scale platform, file data would move to object storage and the database would store metadata plus a protected object key.

### `funding_transactions`

Stores simulated investor support as immutable transactions. Totals are calculated from transaction history instead of being stored as a mutable aggregate.

## Authentication design

The application uses one shared login page for all roles. The login request contains only a username and password. The server normalizes the identifier, verifies the stored password hash, reads the stored role, creates a session, sets an HttpOnly cookie, and returns the role for routing.

Public account creation is restricted to founder signup. Admin and investor accounts are provisioned internally through the database setup script.

## Security decisions

### Password protection

Passwords are never stored directly. Founder passwords are hashed with Node's `scryptSync` using a random salt.

### Session protection

Session cookies use `HttpOnly`, `SameSite=Lax`, `Secure` in production, and an explicit expiry time. Expired sessions are removed when detected. Logout invalidates both the database session and browser cookie.

### Role-based authorization

Authorization is enforced in server-side API handlers. Hiding a button in the interface is not treated as a security boundary.

### Ownership checks

Founder application queries are filtered by the authenticated founder's user ID. A founder cannot access another founder's application by changing an ID in a request.

### Approved-only investor access

Investors can see and fund only applications whose status is `approved`.

### Final decisions

Admin decisions are final. The database update requires the application to still be `pending`, protecting against conflicting simultaneous review actions.

### File protection

Files are not public. Downloads pass through an authenticated server route that checks the user's role and application visibility before returning file data.

### Input validation

Server-side validation covers required fields, email format, password rules, team member data, file count, file size, and funding amount.

### Login abuse protection

A lightweight in-memory failed-login limiter temporarily blocks repeated failures. This is suitable for the semester deployment and is documented as a replacement point for a shared store such as Redis.

## UX and visual design

The visual direction is minimalist, dark, typography-led, and intentionally restrained.

- Dark surfaces with clear hierarchy.
- No gradients.
- Blur for depth and focus.
- Typography as the primary visual element.
- Warm orange accents for action and status.
- Cool blue ambient emphasis.
- Generous whitespace.
- Rounded surfaces used sparingly.
- Short, direct interface copy.
- Clear loading, success, error, and empty states.

The public landing page is an editorial introduction. Authenticated workspaces are focused operational tools rather than marketing pages.

## API surface

### Authentication

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/auth/register` | Create a founder account |
| `POST` | `/api/auth/login` | Authenticate any existing role |
| `POST` | `/api/auth/logout` | Invalidate the current session |
| `GET` | `/api/auth/session` | Read the current authenticated user |

### Applications

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/submissions` | Create a founder application |
| `GET` | `/api/submissions` | Return role-filtered applications |
| `PATCH` | `/api/submissions/:id` | Review or fund an application |
| `GET` | `/api/submissions/:id/files/:fileId` | Download an authorized file |

## Testing strategy

Automated tests cover the highest-risk business rules:

- Only administrators can review applications.
- Only investors can record funding.
- Founders can access only their own applications.
- Investors can access only approved applications.
- File visibility follows application visibility.

Run tests with:

```bash
npm test
```

Run TypeScript validation with:

```bash
npx tsc --noEmit
```

## Local development

### Requirements

- Node.js 24 or a compatible current Node.js release.
- A Neon PostgreSQL database.
- A configured `.env.local` file.

### Environment variables

Create `.env.local` in the project root:

```env
DATABASE_URL=postgresql://...
```

Never commit `.env.local`.

### Install and migrate

```bash
npm install
node --env-file=.env.local scripts/migrate.mjs
```

### Provision internal users

```powershell
$env:FOUNDRY_USERNAME="admin"
$env:FOUNDRY_PASSWORD="choose-a-password"
$env:FOUNDRY_ROLE="admin"
node --env-file=.env.local scripts/create-user.mjs
```

Repeat with `FOUNDRY_ROLE="investor"` for an investor account.

### Start development

```bash
npm run dev
```

Open `http://localhost:3000`.

## Demonstration script

The recommended presentation demo is five minutes:

1. Introduce the problem of fragmented campus incubation workflows.
2. Create a founder account.
3. Submit an application with a teammate and file.
4. Show the pending state in the founder workspace.
5. Sign in as an administrator and review the application.
6. Download a supporting file and approve the application.
7. Return to the founder workspace and show the updated decision.
8. Sign in as an investor and show the approved startup.
9. Record simulated funding and show the updated total.
10. Explain Neon persistence, server-detected roles, HttpOnly sessions, ownership checks, approved-only access, protected files, and automated authorization tests.

## Project report structure

### 1. Introduction

Introduce student entrepreneurship, the need for structured incubation workflows, and the purpose of Foundry.

### 2. Problem definition

Describe the fragmented application, review, tracking, and funding process.

### 3. Requirements analysis

Describe founder, administrator, and investor requirements. Include functional and non-functional requirements.

### 4. System design

Include the component architecture, route structure, database ER diagram, authorization matrix, and request flow.

### 5. Implementation

Explain the Next.js application, TypeScript domain model, Neon database, Route Handlers, sessions, file handling, and Tailwind UI.

### 6. Security analysis

Discuss password hashing, session cookies, role enforcement, ownership checks, input validation, file authorization, rate limiting, and final-decision protection.

### 7. Testing and validation

Describe automated authorization tests and manual end-to-end workflow testing.

### 8. User experience

Discuss the typography-led dark interface, responsive layouts, loading states, empty states, feedback states, and simplified navigation.

### 9. Limitations

Be transparent about simulated funding, no payment processor, in-memory rate limiting, database-backed file bytes, no email verification, no password reset, and no multi-cohort administration.

### 10. Future work

Potential improvements include object storage with signed URLs, Redis-backed rate limiting, email verification, password reset, admin audit logs, cohort management, notifications, real payment integrations, observability, and a formal deployment pipeline.

## Known limitations

Foundry is intentionally scoped as a semester-ready working model. It demonstrates serious engineering choices without claiming to solve every concern of a production SaaS platform.

The most important production upgrades would be shared rate limiting, external object storage, stronger account recovery, email verification, audit logging, monitoring, and a formal deployment and migration pipeline.

## Conclusion

Foundry demonstrates a complete, role-aware, database-backed product rather than a collection of disconnected screens. Its strongest technical contribution is the combination of user requirements, persistent data, server-side authorization, secure sessions, protected files, transactional writes, automated tests, and a deliberate user experience.

The project shows not only that an application can be built, but that its workflows, risks, constraints, and future evolution have been considered.
