# UHID - Unified Health Identity (Prototype)

UHID is a full-stack healthcare prototype with role-based portals for Patients, Doctors, and Admins.
It supports consent-based medical record sharing, OTP login flows, doctor verification, and notification-driven workflows.

## Summary

- Multi-portal web app: Patient Portal, Doctor Portal, Admin Portal
- Consent-gated access to patient records
- Core EHR modules: Health profile, lab reports, treatments, prescriptions, diets, vaccinations, visit history
- OTP + password authentication flow with role-aware login
- Admin doctor onboarding and audit logs
- AI-assisted lab report extraction (Gemini) with manual verification flow

## Important Prototype Disclaimer

This project is a **prototype for learning/interview/demo use**.

- It includes Aadhaar-related onboarding fields and document upload patterns.
- Any production/real-world Aadhaar processing in India requires applicable legal/regulatory compliance and approvals (UIDAI/government and organization-level controls).
- Do not treat this repository as a compliance-ready healthcare product.

## Tech Stack

### Frontend (`Frontend/UHID-Frontend`)

- React 19 + Vite 7
- React Router 7
- TanStack React Query
- Tailwind CSS 4
- Axios
- Framer Motion

### Backend (`Backend`)

- Node.js (ES modules) + Express 5
- Prisma 7 + PostgreSQL
- Zod validation
- JWT + HTTP-only cookies
- Nodemailer (SMTP OTP)
- Firebase Admin SDK (file storage)
- Node-cron (OTP/diet cleanup)
- Google Generative AI SDK (lab extraction)

## Portals and Capabilities

### 1) Patient Portal

- Register with Aadhaar upload and profile details
- Login with password + OTP verification
- Dashboard summary
- Health profile management and profile photo upload
- View records:
  - Lab reports
  - Treatments
  - Diet plans
  - Prescriptions
  - Vaccination history
  - Visit history
- Consent actions:
  - Accept doctor request
  - Reject request
  - Revoke consent
- Notifications:
  - unread count
  - mark read / mark all read
  - clear read / delete

### 2) Doctor Portal

- Doctor registration + certificate upload
- Login with password + OTP
- Status flow (Pending / Rejected / Active)
- Profile view/update + profile photo upload
- Search patient by UHID
- Request consent from patient
- Access patient full record only when consent is valid
- Create patient records:
  - Prescription
  - Treatment
  - Diet
  - Lab report
  - Vaccination
  - Visit
- Delete specific records
- AI-assisted lab report extraction upload
- Verify / reject uploaded lab reports
- Notification center

### 3) Admin Portal

- Admin login/logout
- Dashboard and analytics
- Review pending doctors
- Approve/reject doctors with reason
- View doctor documents
- Audit logs
- Notification center

## Core Backend Route Map

Mounted in `Backend/Server.js`:

- `/api/auth` - OTP APIs
- `/api/patients` - patient auth + patient records + notifications
- `/api/doctors` - doctor auth + doctor workflows + notifications
- `/admin` - admin auth + governance APIs + notifications
- `/consents` - consent actions (request/accept/reject/revoke)

## Database (Prisma)

Primary models include:

- `Patient`, `Doctor`, `Admin`
- `AuthOtp`, `AuditLog`, `Consent`, `Notification`
- `HealthProfile`
- `Prescription`, `PrescriptionMedicine`
- `LabReport`, `LabResult`
- `Treatment`, `Diet`, `VaccinationHistory`, `VisitHistory`
- `PatientDocument`, `DoctorDocument`

Recent schema direction includes:

- `bp` stored as string (for values like `120/80`)
- patient email/phone non-unique migration applied

## Project Structure

```text
UHID/
├─ Backend/
│  ├─ Server.js
│  ├─ lib/
│  ├─ prisma/
│  ├─ src/
│  │  ├─ Controllers/
│  │  ├─ Routes/
│  │  ├─ Middlewares/
│  │  ├─ Config/
│  │  ├─ schemas/
│  │  ├─ scheduleJobs/
│  │  └─ Scripts/
│  └─ package.json
└─ Frontend/
   └─ UHID-Frontend/
      ├─ src/
      │  ├─ components/
      │  ├─ services/
      │  ├─ hooks/
      │  ├─ layout/
      │  └─ api/
      └─ package.json
```

## Local Setup

## 1) Prerequisites

- Node.js 18+ (recommended 20+)
- PostgreSQL running locally or remotely
- npm

## 2) Clone and install

From repo root:

```bash
# Backend
cd Backend
npm install

# Frontend
cd ../Frontend/UHID-Frontend
npm install
```

## 3) Backend environment (`Backend/.env`)

Create `Backend/.env` with at least:

```env
# Runtime
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME

# JWT
JWT_SECRET=replace_with_secure_secret

# SMTP (OTP emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@example.com
SMTP_PASS=your_app_password
FROM_EMAIL=your_email@example.com

# CORS
CORS_ORIGIN_DEV=http://localhost:5173
CORS_ORIGIN_PROD=https://your-frontend-domain.com

# AI (optional, required for AI lab extraction route)
GEMINI_API_KEY=your_gemini_api_key

# Admin seed (optional)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=StrongAdminPassword123
```

## 4) Firebase service account

Place your Firebase service account JSON at:

`Backend/src/Config/uhid-auth-firebase-service-account.json`

Used by:

- profile photo uploads
- medical file uploads

## 5) Prisma setup

From `Backend/`:

```bash
npx prisma generate
npx prisma migrate dev
```

Optional admin bootstrap:

```bash
node src/Scripts/seedAdmin.js
```

## 6) Frontend environment (`Frontend/UHID-Frontend/.env.development`)

```env
VITE_API_BASE=http://localhost:3000
```

For production build use `.env.production` with your deployed backend URL.

## 7) Run app

### Backend

From `Backend/`:

```bash
npm run server
```

### Frontend

From `Frontend/UHID-Frontend/`:

```bash
npm run dev
```

Open:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## Authentication Flow (High-level)

- Patient/Doctor:
  1. Submit credentials
  2. Receive `tempLoginId`
  3. Verify OTP (`/api/auth/verify-login-otp`)
  4. Backend sets cookie token
  5. Frontend stores role in localStorage and routes by role/status

- Admin:
  - direct credential login (`/admin/login`)

## Consent Model (High-level)

- Doctor requests access
- Patient accepts/rejects/revokes
- Record access for doctor is enforced via consent middleware/routes

## Scheduled Jobs

`Backend/src/scheduleJobs/otpCleanup.js` runs periodically to:

- delete expired/old OTP records
- auto-complete diets with expired end date

## Interview-Friendly Talking Points

- Role-based architecture with separate route/controller layers
- Consent-first medical access model
- Unified notification pattern across all 3 portals
- OTP + cookie-based auth
- Prisma-backed domain modeling for healthcare records
- AI-assisted document extraction integrated into doctor workflow

## Current Scope

This repository is intentionally focused on a practical prototype scope and interview demonstration readiness.
It is not positioned as a final clinical product or regulatory-complete deployment.

