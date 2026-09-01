# Banking System Frontend

The frontend for Banking System, maintained by Abazar Adam. It is a React single-page application for authentication, account management, transfers, transaction history, profiles, and role-based administration.

## Author

- GitHub: [github.com/AbazarAdam](https://github.com/AbazarAdam)
- Website: [abazaradam.me](http://abazaradam.me/)

## Stack

- React 19
- Vite 8
- Tailwind CSS 3
- React Router 7
- Axios
- Lucide React
- React Hot Toast
- React Context API

## Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/login` | Public | Sign in |
| `/register` | Public | Register and configure a PIN |
| `/dashboard` | Authenticated | Balance, analytics, and quick actions |
| `/accounts` | Authenticated | View, refresh, and create an account |
| `/transfer` | Authenticated | Transfer money with PIN confirmation |
| `/transactions` | Authenticated | Search and filter account transactions |
| `/profile` | Authenticated | Profile details and PIN management |
| `/admin/dashboard` | `ADMIN`, `SUPER_ADMIN` | Administration statistics |
| `/admin/users` | `ADMIN`, `SUPER_ADMIN` | User management |
| `/admin/accounts` | `ADMIN`, `SUPER_ADMIN` | Account management |
| `/admin/transactions` | `ADMIN`, `SUPER_ADMIN` | Transaction monitoring |

## Frontend Behavior

### Authentication

`AuthContext` stores the JWT and user ID in local storage, loads the user profile after authentication, and coordinates login/logout state. Axios attaches the bearer token to API requests. Protected requests that receive `401` clear the session and redirect to `/login`; failed login requests stay on the login screen so their error message can be displayed.

### Account state

`AccountContext` stores the active account and its loading state. After login, it calls `/api/accounts/user/{userId}` so the account is recovered from MySQL even when logout has cleared cached account data. Dashboard, Accounts, Transfer, and Transactions wait for this lookup before displaying an account-missing state.

The normal UI currently displays the first account owned by the user. The admin Accounts view displays all accounts.

### Money transfers

The transfer page validates the amount, destination, available balance, and local transfer PIN before calling:

```text
POST /api/accounts/transfer
```

The destination may be a numeric account ID or the UUID account number displayed in the Accounts view. The backend performs the debit and credit atomically.

### Administration

The admin page is a shared shell with four URL-selected views:

- Dashboard statistics.
- Users with role, lock, and PIN actions.
- Accounts with balance adjustment and freeze actions.
- Transactions with type filtering.

The Change role selector is displayed only when the current JWT/profile role is `SUPER_ADMIN`. To create the first super administrator, update the database and log in again:

```sql
UPDATE users
SET role = 'SUPER_ADMIN'
WHERE email = 'admin@bank.com';
```

## API Configuration

In development, `vite.config.js` proxies API requests to the backend at `http://localhost:8080`.

For another backend origin, set:

```text
VITE_API_BASE_URL=http://your-backend-host:8080
```

The Axios account/auth API uses the `/api` prefix. Transaction endpoints use the backend `/transactions` prefix.

## Setup

From the repository root:

```powershell
Set-Location banking-frontend
npm install
npm run dev
```

The development server runs at `http://localhost:5173`.

## Production Build

```powershell
npm run build
```

## Validation

```powershell
npm run build
npm run lint
```

The production build is the primary frontend validation. Lint may report legacy issues in unrelated pre-existing components.

## Structure

```text
src/
├── api/
│   ├── axiosInstance.js       Shared Axios client and JWT interceptor
│   ├── authApi.js             Login and registration
│   ├── accountApi.js          Account creation, lookup, and balance
│   ├── adminApi.js            Admin statistics and management requests
│   ├── transactionApi.js      History, analytics, and transfers
│   └── userApi.js             Profile lookup
├── components/
│   ├── Layout.jsx             Responsive application shell
│   ├── PinModal.jsx            Transfer PIN confirmation
│   ├── Spinner.jsx             Loading indicator
│   └── StatCard.jsx            Dashboard statistic card
├── context/
│   ├── AuthContext.jsx         Session and user state
│   └── AccountContext.jsx      Account state and rehydration
├── pages/
│   ├── Admin.jsx               Admin dashboard and management tables
│   ├── Accounts.jsx            Account view and creation
│   ├── Dashboard.jsx           User dashboard
│   ├── Login.jsx               Login form and errors
│   ├── Profile.jsx             Profile and PIN management
│   ├── Register.jsx            Registration form
│   ├── Transactions.jsx        Personal transaction history
│   └── Transfer.jsx            Transfer form and PIN flow
├── routes/
│   └── ProtectedRoute.jsx      Authentication and role guard
└── utils/
    └── pinUtils.js             Client-side PIN hashing helpers
```

## Maintainer

This frontend is created and maintained by **Abazar Adam**.

- [GitHub](https://github.com/AbazarAdam)
- [Website](http://abazaradam.me/)
