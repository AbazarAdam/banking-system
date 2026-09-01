# Banking System

A full-stack digital banking application built and maintained by Abazar Adam. The project provides JWT authentication, MySQL-backed account management, money transfers, transaction history, profile security, and role-based administration through a React and Vite frontend.


## Current Stack

### Backend

- Java 21
- Spring Boot 3.2.5
- Spring Web MVC
- Spring Data JPA and Hibernate ORM
- MySQL 8
- Spring Security
- JSON Web Tokens with JJWT 0.11.5
- BCrypt password hashing
- Jakarta Validation
- Spring Mail
- Spring Cache
- SpringDoc OpenAPI
- Lombok
- Maven Wrapper

### Frontend

- React 19
- Vite 8
- Tailwind CSS 3
- React Router 7
- Axios
- Lucide React
- React Hot Toast
- React Context API

## Features

### Authentication and Profiles

- User registration with BCrypt password hashing.
- JWT login with a 24-hour token lifetime.
- Roles: `USER`, `ADMIN`, and `SUPER_ADMIN`.
- Locked users cannot log in.
- Login failures display a visible error message.
- Profile page with user identity, role, account details, and lock status.
- Transfer PIN setup and local verification flow.

### Banking Operations

- Create Savings or Current accounts.
- Persist account ownership through the MySQL `user_id` column.
- Recover the user's account after logout and login.
- View and refresh balances.
- Deposit and withdraw funds.
- Transfer funds to another account using its numeric database ID or UUID account number.
- Atomic transfer processing: sender debit, recipient credit, and transaction records are committed together.
- Frozen accounts cannot be used for deposits, withdrawals, or transfers.
- Malaysian ringgit display using the `RM` prefix.
- Transaction history with type filters and search.
- Credit/debit analytics.

### Administration

Admin pages are available at `/admin/dashboard`, `/admin/users`, `/admin/accounts`, and `/admin/transactions`.

- Dashboard statistics for users, accounts, transactions, balance, locked users, and frozen accounts.
- User list with role and lock status.
- User details including owned accounts.
- Lock and unlock users.
- Reset a user's transfer PIN with a supplied or generated four-digit PIN.
- View all accounts with owner details.
- Add balance to any account with an `ADMIN_ADJUSTMENT` transaction.
- Freeze and unfreeze accounts.
- Filterable transaction monitoring.
- Only `SUPER_ADMIN` can change roles.
- A user cannot change or lock their own account through the admin API.

## Application Routes

### Public routes

| Route | Purpose |
| --- | --- |
| `/login` | Authenticate an existing user |
| `/register` | Create a new user and configure a transfer PIN |

### User routes

| Route | Purpose |
| --- | --- |
| `/dashboard` | Balance, analytics, and quick actions |
| `/accounts` | View, refresh, and create an account |
| `/transfer` | Transfer money after PIN confirmation |
| `/transactions` | Search and filter personal transactions |
| `/profile` | View profile and manage the local transfer PIN |

### Admin routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/admin/dashboard` | `ADMIN`, `SUPER_ADMIN` | System statistics |
| `/admin/users` | `ADMIN`, `SUPER_ADMIN` | User management |
| `/admin/accounts` | `ADMIN`, `SUPER_ADMIN` | Account management |
| `/admin/transactions` | `ADMIN`, `SUPER_ADMIN` | Transaction monitoring |

## Requirements

- Java 21 or a compatible Java 17+ runtime.
- Maven 3.9+ or the included Maven Wrapper.
- MySQL 8.
- Node.js 18+ and npm 9+.

## Configuration

The backend reads configuration from `src/main/resources/application.yaml`. Prefer environment variables for credentials:

| Variable | Purpose |
| --- | --- |
| `DB_URL` | MySQL JDBC URL |
| `DB_USERNAME` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `JWT_SECRET` | JWT signing secret; use a long random value in production |
| `MAIL_USERNAME` | Optional SMTP username |
| `MAIL_PASSWORD` | Optional SMTP password |
| `ALLOWED_ORIGIN` | Comma-separated frontend origins |

The local database URL is:

```text
jdbc:mysql://localhost:3306/banking_db?useSSL=false&serverTimezone=UTC
```

Create the database and tables with [db/schema.sql](db/schema.sql), or allow Hibernate `ddl-auto: update` to update an existing database. Do not commit real database passwords, SMTP credentials, or production JWT secrets.

## Installation

### Backend

```powershell
./mvnw.cmd clean install -DskipTests
```

### Frontend

```powershell
Set-Location banking-frontend
npm install
```

## Running Locally

Start MySQL and ensure the `banking_db` database exists. Start the backend from the repository root:

```powershell
./mvnw.cmd spring-boot:run
```

The backend listens on `http://localhost:8080`.

Start the frontend in a second terminal:

```powershell
Set-Location banking-frontend
npm run dev
```

The frontend listens on `http://localhost:5173` and proxies API requests through the Vite configuration.

## Initial Users and Roles

Register users through `POST /api/auth/register`. Registration intentionally creates a `USER` role. Promote the first trusted administrator directly in MySQL:

```sql
UPDATE users
SET role = 'SUPER_ADMIN'
WHERE email = 'admin@bank.com';
```

Log out and back in after changing the role so the new JWT contains `SUPER_ADMIN`. The Users tab will then show the role selector for other users.

Example local credentials:

| Email | Password | Initial role |
| --- | --- | --- |
| `admin@bank.com` | `admin123` | Promote to `SUPER_ADMIN` manually |
| `user@bank.com` | `user123` | `USER` |

Use non-demo passwords outside local development.

## Backend API

### Authentication

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register a user |
| `POST` | `/api/auth/login` | Return a JWT and role |

### User and account APIs

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/users/{id}` | Read a user profile |
| `POST` | `/api/accounts?userId={userId}` | Create an account |
| `GET` | `/api/accounts/user/{userId}` | Recover the user's first account |
| `GET` | `/api/accounts/{id}/balance` | Read an account balance |
| `POST` | `/api/accounts/{id}/deposit` | Deposit funds |
| `POST` | `/api/accounts/{id}/withdraw` | Withdraw funds |
| `POST` | `/api/accounts/transfer` | Atomic transfer between accounts |

Account references may be numeric account IDs or UUID account numbers. Transfer payload:

```json
{
  "fromAccountId": "1",
  "toAccountId": "3d060eab-1a89-4fa9-a7d8-f8bcd32f2b31",
  "amount": 100.00
}
```

### Transaction APIs

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/transactions/account/{accountId}` | List transactions for an account |
| `GET` | `/transactions/filter` | Filter transactions by account and type |
| `GET` | `/transactions/analytics/{accountId}` | Return credit/debit totals |

### Admin APIs

All admin endpoints require a JWT with `ADMIN` or `SUPER_ADMIN` authority. Role updates require `SUPER_ADMIN`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/admin/stats` | System statistics |
| `GET` | `/api/admin/users` | List users |
| `GET` | `/api/admin/users/{id}` | User details and accounts |
| `PUT` | `/api/admin/users/{id}/role` | Change a user's role |
| `PUT` | `/api/admin/users/{id}/lock` | Lock or unlock a user |
| `PUT` | `/api/admin/users/{id}/reset-pin` | Reset a transfer PIN |
| `GET` | `/api/admin/accounts` | List accounts with owners |
| `GET` | `/api/admin/accounts/{id}` | Account details |
| `POST` | `/api/admin/accounts/{id}/add-balance` | Add an admin adjustment |
| `PUT` | `/api/admin/accounts/{id}/freeze` | Freeze or unfreeze an account |
| `GET` | `/api/admin/transactions` | Monitor and filter transactions |
| `GET` | `/api/admin/transactions/{id}` | Transaction details |

## Database

The JPA entities map to these tables:

- `users`: identity, credentials, role, lock state, transfer PIN, and creator ID.
- `accounts`: account number, owner ID, type, balance, and freeze state.
- `transactions`: account ID, amount, type, and timestamp.

Enumerated values are stored as strings. Supported roles are `USER`, `ADMIN`, and `SUPER_ADMIN`. Supported transaction types are `CREDIT`, `DEBIT`, `TRANSFER`, and `ADMIN_ADJUSTMENT`.

The schema reference and existing-database migration statements are in [db/schema.sql](db/schema.sql). See [ARCHITECTURE.md](ARCHITECTURE.md) for the persistence and service-layer design.

## Security Notes

- JWTs are stateless and carry the user ID and role.
- The JWT signing key uses the configured secret as UTF-8 bytes.
- Passwords are hashed with BCrypt.
- The backend enforces admin authorization with Spring method security.
- The transfer service verifies that the authenticated user owns the source account.
- Transfers reject frozen accounts, same-account transfers, invalid amounts, and insufficient balances.
- Login failures and invalid requests return structured error responses.
- The frontend attaches JWTs through Axios and clears the session for protected-route `401` responses.
- Transfer PIN verification is currently client-side and stored as a hash in local storage. This is a known limitation for production banking security.

## Validation Commands

```powershell
# Backend
./mvnw.cmd clean test

# Frontend
Set-Location banking-frontend
npm run build
npm run lint
```

The frontend build and backend tests are the primary repeatable checks. Existing lint findings in legacy frontend files may remain independent of the admin features.

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md): detailed system architecture and implementation deep dive.
- [Frontend README](banking-frontend/README.md): frontend-specific setup and structure.
- [Database schema](db/schema.sql): MySQL schema and migration statements.

## Author

**Abazar Adam**

- GitHub: [github.com/AbazarAdam](https://github.com/AbazarAdam)
- Website: [abazaradam.me](http://abazaradam.me/)
