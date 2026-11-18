# Coffee Ninja — Customer Inquiry Management System

A full-stack customer inquiry management application developed as part of the Coffee Ninja Full-Stack Developer Internship technical assessment.

## Technology Stack

- **Frontend:** React, Vite, React Router
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT and bcrypt
- **Testing:** Node.js Test Runner, Supertest, Vitest, React Testing Library

## Features

- Staff login and logout
- JWT-protected API endpoints
- Staff-specific inquiry ownership
- Create and view customer inquiries
- Search inquiries by customer name, contact, or subject
- Filter inquiries by status
- Update inquiry status
- Detect concurrent status updates
- Loading, empty, and error states
- Frontend and backend automated tests

## Project Structure

```text
├── backend/
│   ├── scripts/
│   ├── src/
│   └── tests/
├── database/
│   └── schema.sql
├── frontend/
│   ├── src/
│   └── package.json
├── README.md
└── DECISIONS.md
```

## Prerequisites

- Node.js and npm compatible with the installed Vite version
- PostgreSQL
- Git

## Database Setup

1. Create a PostgreSQL database named `coffee_ninja_db`.
2. Create a database role for the application.
3. Execute `database/schema.sql` against the database.
4. Grant the application role the required schema, table, and sequence permissions.

## Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example` as a reference.

Configure the database connection, JWT secret, and seed-user credentials.

Never commit real credentials or secrets.

Seed the staff account:

```bash
node scripts/seedUser.js
```

Start the backend:

```bash
npm run dev
```

Backend URL: `http://localhost:5000`

## Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

## Test Account

The application uses a seeded staff account.

Configure the account email and password through the backend environment variables before running the seed script.

For local development, the example email is:

`staff@example.com`

The password is configured locally and is not stored in this repository.

## Automated Tests

Backend:

```bash
cd backend
node --test tests/auth.test.js
```

Frontend:

```bash
cd frontend
npx vitest run --environment jsdom
```

Production frontend build:

```bash
cd frontend
npm run build
```

## Inquiry Status Rules

- New → In Progress
- In Progress → Resolved
- Resolved → In Progress

Other status transitions are rejected.

## Security

- Passwords are hashed using bcrypt.
- JWT authentication protects inquiry endpoints.
- Inquiry ownership is enforced by backend database queries.
- Unauthorized inquiry access returns HTTP 404.
- Input validation is performed by the frontend and backend.
- Parameterized SQL queries help prevent SQL injection.

## Known Limitations

- The application is intended for local demonstration; deployment is not included.
- JWTs are stored in browser session storage.
- Concurrent status updates use timestamp-based optimistic concurrency control.
- The frontend dependency audit currently reports a high-severity advisory involving `picomatch`; remediation requires further compatibility review.

## AI Assistance

AI-assisted tools were used for development support, debugging, and documentation. The implementation was personally reviewed and validated through manual and automated testing.