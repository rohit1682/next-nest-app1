# next-nest-app1 — CSV Upload & Display

A two-app monorepo:

- `backend/` — **NestJS** API that accepts a CSV upload, parses it with **papaparse**, validates each row using **class-validator** DTOs, and returns valid rows + per-row validation errors as JSON.
- `frontend/` — **Next.js (React)** UI that uploads a CSV and renders valid rows and any validation errors as tables.

---

## Project Structure

```
backend/
  src/
    app.module.ts
    main.ts                       # Global ValidationPipe, CORS, listens on :3001
    csv/
      csv.module.ts
      csv.controller.ts           # POST /upload (Swagger decorated)
      csv.service.ts              # papaparse + DTO validation
      csv.controller.spec.ts      # Jest: controller w/ mocked service
      csv.service.spec.ts         # Jest: parses CSV + validation behavior
      dto/
        csv-row.dto.ts            # class-validator rules
      interfaces/
        csv.interface.ts          # CsvUploadResult / CsvValidRow / CsvRowError
frontend/
  app/
    page.tsx                      # Upload form + tables for valid rows & errors
    layout.tsx
    globals.css
sample.csv                        # Example CSV for testing
```

---

## Prerequisites

- Node.js 18+ and npm

---

## Install

```bash
cd backend && npm install
cd ../frontend && npm install
```

---

## Run

### 1. Start the backend (port 3001)

```bash
cd backend
npm run start:dev
```

You should see: `Backend running on http://localhost:3001`.

### 2. Start the frontend (port 3000)

In a separate terminal:

```bash
cd frontend
npm run dev
```

Open http://localhost:3000, drop or pick a CSV file, then click **Upload & Parse**.

The frontend calls `http://localhost:3001` by default. To override:

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## API

### `POST /upload`

- Content-Type: `multipart/form-data`
- Form field: `file` (the CSV)

Expected CSV columns: `name,age,email,department` (department is optional).

#### Validation rules (`CsvRowDto`)

| Field      | Rule                                    |
| ---------- | --------------------------------------- |
| name       | required, non-empty string              |
| age        | number, 18 ≤ age ≤ 100                  |
| email      | valid email                             |
| department | optional string                         |

A global `ValidationPipe` is enabled with `whitelist: true` and `forbidNonWhitelisted: true`.

#### Sample request (curl)

```bash
curl -X POST http://localhost:3001/upload \
  -F "file=@sample.csv"
```

#### Sample response

```json
{
  "valid": [
    { "name": "John", "age": 25, "email": "john@example.com", "department": "Engineering" },
    { "name": "Jane", "age": 30, "email": "jane@example.com", "department": "Marketing" }
  ],
  "errors": [
    {
      "row": 3,
      "issues": [
        "name should not be empty",
        "age must be a number",
        "email must be an email"
      ]
    }
  ]
}
```

### Sample CSV

```
name,age,email,department
John,25,john@example.com,Engineering
Jane,30,jane@example.com,Marketing
Invalid,,not-an-email,
```

---

## Test

### Backend unit tests (Jest)

```bash
cd backend
npm test
```

Covered:

- `csv.service.spec.ts` — parses a mock CSV, asserts valid rows and validation errors; ensures `BadRequestException` when no file is provided.
- `csv.controller.spec.ts` — mocks `CsvService` and verifies the controller delegates the uploaded file and returns the service response.

Watch mode:

```bash
npm run test:watch
```

### Manual end-to-end test

1. Start backend and frontend (steps above).
2. Open http://localhost:3000.
3. Upload `sample.csv` from the repo root.
4. Confirm:
   - Two valid rows render in the **Valid Rows** table.
   - One row appears in the **Errors** table with row number and per-field issues.

### Build (production)

```bash
# Backend
cd backend
npm run build
npm start            # runs dist/main.js on :3001

# Frontend
cd ../frontend
npm run build
npm start            # serves Next.js production build on :3000
```

---

## Tech Stack

- NestJS 10 (Node.js + TypeScript)
- papaparse (CSV parsing)
- class-validator + class-transformer (DTO validation)
- @nestjs/swagger (API decorators)
- Jest + ts-jest (unit tests)
- Next.js 14 + React 18 (frontend)
