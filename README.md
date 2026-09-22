# HIS Future Talents 2026 (HFT 2026)

Official repository for the HIS Future Talents 2026 website and administration portal.
---

## 1. Project Overview

HFT 2026 is a Next.js 14 App Router application that provides:

- Public bilingual website (`/en`, `/ar`) with RTL support for Arabic
- Student registration flow with CV upload and pass badge generation
- Exhibitor lead capture flow
- Sponsor and exhibitor showcase
- Admin portal for leads, students, sponsors, and QR-based check-in workflows
- Optional PostgreSQL persistence via Prisma
- Resilient fallback to local JSON storage when DB is unavailable
- Integrations with Google Sheets and SMTP for operational workflows

---

## 2. Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript + React
- **Styling**: Tailwind CSS
- **Icons/UI libs**: Lucide, Chakra UI (partial usage)
- **ORM**: Prisma
- **Database**: PostgreSQL (optional but recommended)
- **Fallback persistence**: JSON files in `/data`
- **Email**: Nodemailer + SMTP
- **External integration**: Google Sheets API (JWT service account)
- **Badge generation**: `sharp`, `pdf-lib`, `qrcode`

---

## 3. High-Level Architecture

### 3.1 Layered View

1. **Frontend (App Router pages + components)**
   - Public pages and forms in `app/[locale]/*`
   - UI components in `components/*`
   - Translation context in `context/LanguageContext.tsx`

2. **Backend (Route Handlers)**
   - API endpoints in `app/api/*`
   - Business logic mostly delegated to `lib/*`

3. **Data Layer**
   - Primary: PostgreSQL through Prisma (`prisma/schema.prisma`)
   - Fallback: local JSON (`data/leads.json`, `data/students.json`, `data/sponsors.json`)

4. **External Services**
   - Google Sheets for leads synchronization (`lib/googleSheets.ts`)
   - SMTP for student confirmation emails (`lib/mailer.ts`)

### 3.2 Runtime Data Strategy

The app is intentionally resilient:

- If `DATABASE_URL` is set and DB access works, CRUD uses Prisma.
- If DB is not configured or temporarily unavailable, it falls back to JSON storage.
- Some endpoints merge local data with live production/API sources and Google Sheets data.

This behavior is centralized in `lib/dataStore.ts`.

---

## 4. Repository Structure

```text
app/
  [locale]/
    page.tsx                # Main public page
    students/page.tsx       # Student landing + registration
    admin/page.tsx          # Admin portal (client-side guarded)
    verify/page.tsx         # Ticket/pass verification UI
  api/
    leads/route.ts          # Leads CRUD + Sheets merge/sync
    students/route.ts       # Student CRUD + email dispatch
    students/badge/route.ts # Badge PNG/PDF generation
    sponsors/route.ts       # Sponsor CRUD + lead enrichment
    upload/route.ts         # Sponsor logo upload
    upload-cv/route.ts      # Student CV upload
    register/route.ts       # Legacy registration -> Sheets
    test-email/route.ts     # SMTP diagnostic endpoint

components/                # UI and form components
context/                   # i18n language context provider
lib/                       # Data store, Prisma client, mailer, Sheets integration, badge generation
prisma/
  schema.prisma            # Prisma models / DB schema
data/                      # JSON fallback data store + static datasets
public/                    # Static assets + uploaded files
scripts/                   # Utility scripts (e.g., sync-live-data.js)
```

---

## 5. Database and Data Model

Prisma models (PostgreSQL):

- `ExhibitorLead` (`exhibitor_leads`)
- `StudentApplication` (`student_applications`)
- `Sponsor` (`sponsors`)

Schema file: `prisma/schema.prisma`

### Key behavior

- `lib/dataStore.ts` contains CRUD functions used by API handlers.
- On startup/access, files are ensured under `/data`.
- `autoSeedDatabaseIfEmpty()` can seed DB with existing fallback datasets.
- Mock legacy records are actively filtered out in read paths.

---

## 6. Backend API Map

### Leads
- `GET /api/leads`: merge and return leads (local + live + Google Sheets)
- `POST /api/leads`: create lead, save to store, append to Google Sheets
- `PATCH /api/leads`: update status or delete (`action: "delete"`)

### Students
- `GET /api/students`: merge local and live students
- `POST /api/students`: create registration and auto-confirm + trigger email
- `PATCH /api/students`: update status, delete, or resend email

### Sponsors
- `GET /api/sponsors`: read + normalize/sort/enrich sponsors
- `POST /api/sponsors`: create sponsor
- `PUT /api/sponsors`: update sponsor
- `DELETE /api/sponsors`: delete sponsor

### Uploads
- `POST /api/upload-cv`: PDF CV upload (max 10MB), stored under `public/uploads/cv`
- `POST /api/upload`: image upload for sponsor logos, stored under `public/partners/{edition}`

### Badge
- `GET/POST /api/students/badge`: generate downloadable PNG/PDF pass assets

### Diagnostics
- `GET /api/test-email`: verify SMTP and send test message

---

## 7. Frontend Architecture

### Routing and i18n

- Locale-prefixed routes (`/en`, `/ar`) are enforced by `middleware.ts`.
- Legacy `/fr` is redirected to `/en`.
- Language context and translations are managed in:
  - `context/LanguageContext.tsx`
  - `messages/en.json`
  - `messages/ar.json`

### Main user journeys

1. **Exhibitor lead submission**
   - `components/SponsorLeadForm.tsx` -> `POST /api/leads`

2. **Student registration**
   - `components/StudentRegistrationForm.tsx`
   - CV upload -> `POST /api/upload-cv`
   - Registration -> `POST /api/students`
   - Badge rendering -> `components/StudentBadge.tsx` and badge API

3. **Sponsor/exhibitor discovery**
   - `components/PartnerLogoGrid.tsx`, `components/SponsorsSection.tsx`
   - Fetches `GET /api/sponsors`

4. **Admin operations**
   - `app/[locale]/admin/page.tsx`
   - Works against leads/students/sponsors APIs
   - Includes QR scanning and badge verification helper logic

---

## 8. Environment Variables

Start from `.env.example`, then create `.env.local` for local development.

### Core

- `NEXT_PUBLIC_APP_URL` (recommended)

### Database (optional but recommended)

- `DATABASE_URL` (PostgreSQL connection string)

If missing, app uses `/data/*.json` fallback.

### SMTP (for student confirmation emails)

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

### Google Sheets (for lead synchronization)

Use one of these approaches:

1. Direct vars
   - `GOOGLE_CLIENT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
2. Embedded JSON
   - `GOOGLE_SERVICE_ACCOUNT_JSON`
3. JSON path
   - `GOOGLE_SERVICE_ACCOUNT_JSON_PATH`

And:
- `GOOGLE_SHEETS_SPREADSHEET_ID`

---

## 9. Local Setup (Recommended Workflow)

### 9.1 Prerequisites

- Node.js >= 20
- npm
- PostgreSQL (optional but recommended for backend changes)

### 9.2 Install

```bash
npm install
```

### 9.3 Configure environment

```bash
cp .env.example .env.local
```

Fill `.env.local` with real values.

### 9.4 Prisma setup (if using PostgreSQL)

```bash
npx prisma generate
npx prisma db push
```

### 9.5 Run locally

```bash
npm run dev
```

Open:
- Public site: `http://localhost:3000/en`
- Student page: `http://localhost:3000/en/students`
- Admin page: `http://localhost:3000/en/admin`

---

## 10. How to Work Safely on Frontend, Backend, and DB

### Frontend changes

- Most UI work is in `components/*` and `app/[locale]/*`
- Keep translation parity between `messages/en.json` and `messages/ar.json`
- Verify RTL behavior for Arabic after UI updates

### Backend/API changes

- Route handlers in `app/api/*/route.ts`
- Reuse existing logic in `lib/dataStore.ts`, `lib/mailer.ts`, `lib/googleSheets.ts`
- Maintain graceful error handling and JSON fallback resilience

### DB changes

- Edit `prisma/schema.prisma`
- Run `npx prisma generate` and `npx prisma db push`
- Validate both DB mode and fallback JSON mode where possible

---

## 11. Data Files and Uploads

- Fallback data files:
  - `data/leads.json`
  - `data/students.json`
  - `data/sponsors.json`
- Uploaded CV files: `public/uploads/cv`
- Uploaded sponsor logos: `public/partners/{edition}`

Important: these paths are part of runtime behavior. Do not move them without updating route handlers and data store logic.

---

## 12. Quality Checks

Available project commands:

```bash
npm run lint
npm run build
npm run start
```

Recommended before merge:
1. `npm run lint`
2. `npm run build`
3. Manual smoke test of key flows (lead form, student registration, admin actions)

---

## 13. Deployment Notes

### Docker

A production Dockerfile is provided:

- Base image: `node:20-alpine`
- Installs fonts needed for rendering/badge generation
- Runs `prisma generate` and `npm run build`
- Serves app on port 3000

### Nixpacks

`nixpacks.toml` installs font packages needed in Dokploy/Nixpacks environments.

---

## 14. Operational and Security Notes

- Configure all secrets via environment variables; never hardcode credentials.
- Validate SMTP and Google credentials in each environment.
- The admin portal currently uses client-side passcode gating in `app/[locale]/admin/page.tsx`; treat this as lightweight gating, not full security.
- If production-grade admin access control is required, add server-side authentication and authorization.

---

## 15. Quick Onboarding Checklist for New Colleagues

1. Clone repo and install dependencies.
2. Create `.env.local` from `.env.example`.
3. Decide storage mode:
   - PostgreSQL (`DATABASE_URL`) for normal development
   - JSON fallback for lightweight local testing
4. Run Prisma generate + db push if using DB.
5. Start app with `npm run dev`.
6. Test:
   - `/en` (public)
   - `/en/students` (student flow)
   - `/en/admin` (admin flow)
7. Before submitting changes: lint, build, and smoke test affected flows.

---

## License

All rights reserved © 2026 HIS University, Algiers.
