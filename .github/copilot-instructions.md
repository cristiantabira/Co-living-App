# Copilot Instructions for Co-living-App

# Context Proiect: Sistem Gestiune Co-living (Disertație)

Ești un expert Full-Stack specializat în arhitecturi Node.js (Express) și React. Proiectul este o aplicație de gestiune a spațiilor de locuire partajată.

## Tehnologii Core

- **Backend**: Node.js, Express.js
- **Frontend**: React.js (Componente Funcționale), Bootstrap pentru stilizare
- **Baza de date**: SQLite gestionat prin Sequelize ORM
- **Securitate**: JWT pentru sesiuni, BCrypt pentru hashing parole
- **Limbaj**: JavaScript (ES6+)

## Reguli Generale de Codare

- Scrie cod curat, modular și bine comentat în limba română (pentru explicații) sau engleză (pentru variabile/funcții).
- Respectă arhitectura MVC (Models, Views, Controllers) pentru backend.
- Toate rutele de backend trebuie să folosească middleware-ul `protect` și `authorize` acolo unde este cazul.

## Reguli Specifice Backend (Sequelize)

- Folosește întotdeauna asocierile definite în `models/associations.js`.
- Când interoghezi cheltuielile (Expenses), include întotdeauna modelul `User` (ca Payer) și `ExpenseDebt` (ca Debtors).
- Folosește alias-urile corecte: `as: 'Expenses'` pentru relația Apartment-Expense și `as: 'ManagedComplexes'` pentru User-Complex.

## Reguli Specifice Frontend (React)

- Folosește `hooks` (useState, useEffect, useNavigate).
- Pentru cererile API, folosește o instanță centralizată de `axios` care include token-ul JWT în header-ul de Authorization.
- Toate paginile de Admin trebuie să verifice rolul utilizatorului din context sau localStorage înainte de a randa conținutul.

## Logica de Business Critică: Algoritmul Split-Bill

- Când generezi logica pentru adăugarea unei cheltuieli, asigură-te că suma totală este distribuită corect între participanți.
- Implementează validări pentru a preveni sume negative sau cheltuieli fără participanți.
- Statusul inițial al unei datorii (`ExpenseDebt`) trebuie să fie întotdeauna 'Pending'.

## Stil și UX

- Folosește clasele Bootstrap pentru un design responsive și curat.
- Mesajele de eroare returnate de API trebuie să fie clare și prietenoase (ex: "Fonduri insuficiente" sau "Utilizatorul nu face parte din acest apartament").

## Build, Test, and Lint Commands

### Backend (Express.js)

```bash
cd backend

# Development (with auto-reload via nodemon)
npm run dev

# Production
npm run start
```

No test or lint setup exists yet.

### Frontend (React + Vite)

```bash
cd frontend

# Development server (hot reload)
npm run dev

# Production build
npm run build

# Run ESLint
npm run lint

# Preview built application
npm run preview

# E2E Testing with Playwright
npm run test              # Run all tests headlessly
npm run test:ui           # Run tests with Playwright UI
npm run test:debug        # Run tests in debug mode
npm run test:report       # View HTML test report
```

## High-Level Architecture

### Full-Stack Monorepo Structure

- **Backend**: Express.js API server on port 5000
- **Frontend**: React + Vite app, communicates with backend via Axios
- **Database**: SQLite (file-based) with Sequelize ORM

### Backend Architecture (MVC Pattern)

- **Models** (`backend/models/`): Sequelize model definitions for User, Apartment, Complex, Expense, and ExpenseDebt
- **Controllers** (`backend/controllers/`): Business logic for auth, expenses, apartments, and spaces
- **Routes** (`backend/routes/`): Express route definitions with endpoint handlers
- **Middleware** (`backend/middleware/`): Authentication (JWT token verification) and role-based authorization
- **Data** (`backend/data/`): Optional database utilities

### Frontend Architecture

- **Pages** (`frontend/src/pages/`): Full-page components (Login, Dashboard, Admin, etc.)
- **Components** (`frontend/src/components/`): Reusable UI components (Sidebar, MainLayout)
- **API** (`frontend/src/api/`): Axios instance configuration for backend communication

### Database Model Relationships

```
User (many) <-> Apartment (one)
Complex (one) <-> (many) Apartment
User (Payer) <-> Expense (one-to-many)
Expense (many) <-> (many) User (Debtors) [through ExpenseDebt]
Complex (many) <-> (many) User (Admins) [through ComplexAdmin]
Apartment (one) <-> (many) Expense
```

Associations are centralized in `backend/models/associations.js` and must be called during app initialization.

## Key Conventions

### Backend Code Style

- **Error Handling**: All async/await functions use try-catch blocks with proper HTTP status codes (201 for creation, 400 for bad requests, 404 for not found, 500 for errors)
- **Model Definitions**: Use Sequelize DataTypes (STRING, ENUM, etc.) with validation flags (allowNull, unique, defaultValue)
- **API Responses**: Return objects with `message` for descriptive feedback and data fields for actual content
- **Comments**: Often in Romanian; translate or maintain consistency if adding new comments

### Authentication & Authorization

- **JWT Secret**: Hardcoded as `"SECRET_KEY_FOARTE_SIGURA"` in `authMiddleware.js` and `authController.js` — move to environment variables in production
- **Token Expiry**: Set to 24 hours
- **Middleware Chain**: Protect routes with `protect` middleware first (verifies JWT), then `authorize` middleware for role-based access
- **Roles**: Three role levels exist: USER, ADMIN, GOD (GOD bypasses all authorize checks)
- **Password Hashing**: Uses bcrypt with salt rounds of 10

### Frontend Code Style

- **Routing**: React Router with protected routes wrapped in `MainLayout` for authenticated pages
- **Public vs Private Routes**: Login and SignUp are unwrapped (no sidebar); dashboard, profile, and admin routes use `MainLayout` wrapper
- **API Calls**: All backend communication goes through `frontend/src/api/axios.js`
- **Components**: Functional components with hooks; shared layout in `MainLayout` with `Sidebar`

### Database Naming & Structure

- **Table Names**: Use PascalCase (User, Apartment, Complex, Expense)
- **Foreign Keys**: Named as `{ModelName}Id` (e.g., `complexId`, `apartmentId`, `payerId`)
- **Pivot Tables**: Auto-generated by Sequelize for many-to-many relationships; custom pivot models (ComplexAdmin, ExpenseDebt) handle additional data if needed
- **Cascade Delete**: Apartments cascade-delete when their Complex is deleted

### Form & API Communication Patterns

- **Request Body**: Controllers extract fields directly from `req.body` and validate them
- **File Structure**: Keep models separate from controllers; define relationships in associations file, not in individual model files
- **Many-to-Many Methods**: Sequelize auto-generates adder/remover methods (e.g., `user.addManagedComplex()`)

### Middleware Execution Order

- CORS
- JSON body parsing
- Route handlers (with middleware chain: protect → authorize → controller)
- Database sync on startup with optional `{ alter: true }` for schema migrations

### Seeding Data

- A `seedTenUsers` endpoint exists for development/testing; creates a GOD user and 10 regular users with predictable credentials
- Run via POST `/api/auth/seed-users`

## Backend Services

### Email Notifications (`backend/services/emailService.js`)

Email notifications are sent for:
- **New expenses**: Automatically notified when a group expense is created
- **New bills**: Administrative bills notify all apartment residents
- **Payment reminders**: Sent when a creditor requests a reminder for a pending debt

**Setup**: See `backend/EMAIL_SETUP.md` for Mailtrap, MailPit, or Gmail configuration. Set environment variables:
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`

**Key endpoint**: `POST /api/expenses/send-reminder` (send payment reminder to a debtor)

### Payment Processing (`backend/services/paymentService.js`)

Stripe integration for handling payments:
- `createPaymentIntent(amount, currency, metadata)`: Creates a Stripe PaymentIntent
- `confirmPaymentIntent(paymentIntentId)`: Retrieves and confirms payment status
- Environment: `STRIPE_SECRET_KEY` (set in `.env` or `.env.stripe`)
- Currency default: RON (can be overridden per request)

## Important Notes

- The codebase has comments and variable names in Romanian; maintain consistency when adding features
- JWT secret and database credentials must be in `.env` file (currently hardcoded for development)
- Email credentials, Stripe keys, and JWT secret should be environment variables
- No TypeScript; pure JavaScript with Sequelize type inference
- Vite config uses React plugin; no custom aliases configured
- ESLint configured for React hooks and refresh rules; respects uppercase variable patterns

## Local Development Setup

### Starting the full-stack application:

1. **Backend** (Terminal 1):
```bash
cd backend
npm install
npm run dev          # Starts on http://localhost:5000
```

2. **Frontend** (Terminal 2):
```bash
cd frontend
npm install
npm run dev          # Starts on http://localhost:5173
```

3. **Optional - Seed test data**:
```bash
curl -X POST http://localhost:5000/api/auth/seed-users
```
Creates 1 GOD user and 10 regular users with predictable credentials for testing.

### Optional local services:

- **Email Testing**: Run MailPit for local email testing:
  ```bash
  mailpit          # Opens at http://localhost:8025
  ```
  Then set `EMAIL_HOST=localhost` and `EMAIL_PORT=1025` in `.env`

## E2E Testing with Playwright

### Setup
Playwright is installed as a dev dependency and configured to test the React frontend against http://localhost:5173. Ensure both backend and frontend servers are running before tests.

### Test Structure
- **tests/auth.spec.js**: Authentication flows, navigation, and public routes
- **tests/ui.spec.js**: UI layout, responsiveness, and form validation
- **tests/api.spec.js**: Backend connectivity and error handling

### Running Tests
```bash
cd frontend

# Run all tests (headless)
npm run test

# Run with UI (interactive mode - great for development)
npm run test:ui

# Run in debug mode with browser inspector
npm run test:debug

# View HTML report from last run
npm run test:report

# Run specific test file
npx playwright test tests/auth.spec.js

# Run tests matching a pattern
npx playwright test -g "login"

# Run on specific browser
npx playwright test --project=chromium
```

### Test Configuration
- **Base URL**: http://localhost:5173 (frontend dev server)
- **Browsers**: Chromium, Firefox, WebKit
- **Screenshots**: Captured on test failure in `test-results/` directory
- **Retries**: 2 retries in CI, 0 locally
- **Workers**: Parallel execution (multiple tests at once)

### Best Practices for E2E Tests
- Tests should be independent (no cross-test dependencies)
- Use semantic selectors when possible (role, text content) instead of brittle CSS classes
- Mock external APIs if needed to avoid flaky tests
- Keep tests focused: one feature or user flow per test
- Add tests for critical user journeys (login, add expense, view dashboard)
- Run `npm run test:report` to debug test failures with screenshots
