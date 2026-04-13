# Mini CRM

A local CRM application with Express.js backend, React frontend, and SQLite database.

## Quick Start

```bash
git clone <repo-url> && cd mini-crm
npm install
cd frontend && npm install && cd ..
npx playwright install
npm run seed
```

Then start both servers:

```bash
npm run dev
```

Open http://localhost:5173 and log in with `admin@crm.com` / `password123`.

## Project Structure

```
mini-crm/
├── server/          # Express.js backend (port 3001)
│   ├── index.js     # Server entry point
│   ├── db.js        # Database connection and schema
│   ├── seed.js      # Seed script (10 records per table)
│   ├── auth.js      # JWT middleware and token generation
│   └── routes/      # API route handlers
├── frontend/        # React + Vite frontend (port 5173)
│   ├── src/
│   │   ├── App.jsx       # Root component with auth routing
│   │   ├── Login.jsx     # Login page
│   │   ├── Dashboard.jsx # Main dashboard with tables and forms
│   │   └── api.js        # API client helpers
│   └── vite.config.js    # Vite config with API proxy
├── tests/           # Playwright end-to-end tests
│   └── crm.spec.js  # Login + create contact + DB verification
└── playwright.config.js
```

## Credentials

- Email: `admin@crm.com`
- Password: `password123`

## Callable Tools

### Start both servers

```bash
npm run dev
```

Starts the backend (port 3001) and frontend (port 5173) concurrently in one terminal.

### Start the backend server

```bash
node server/index.js
```

Starts the Express.js API on port 3001. Requires the database to be seeded first.

### Start the frontend dev server

```bash
cd frontend && npx vite --port 5173
```

Starts the React development server on port 5173 with API proxy to the backend.

### Seed the database

```bash
node server/seed.js
```

Creates/resets the SQLite database with 10 sample records per table and the default user account.

### Run the Playwright test

```bash
npx playwright test
```

Runs the end-to-end test that logs in, creates a contact via the UI, and verifies it in the database.
The Playwright config auto-starts both backend and frontend servers.

### Run all (seed + test)

```bash
node server/seed.js && npx playwright test
```
