# StraBook — Premium Celebrity Booking Backend

Professional Node.js/Express backend for the StraBook platform.

## Features
- **SQLite Database**: Lightweight, no configuration required.
- **JWT Authentication**: Secure user registration and login.
- **Booking Management**: Handles celebrity bookings, donations, and fan cards.
- **Payment Hooks**: Placeholders for Crypto (BTC/ETH), CashApp, Venmo, PayPal, and Gift Cards.
- **Admin Dashboard API**: Endpoints for managing all platform bookings.

## Quick Start
1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Environment Setup**: Create a `.env` file (optional, defaults are in code).
    ```env
    PORT=5000
    JWT_SECRET=starbook-luxury-secret-key-2025
    ```
3.  **Run Development Server**:
    ```bash
    npm run start
    ```

## API Endpoints
### Authentication
- `POST /api/auth/register` — Body: `{ name, email, password }`
- `POST /api/auth/login` — Body: `{ email, password }`

### Client Operations
- `POST /api/bookings` — (Authenticated) Submit a booking/donation/fan-card request.
- `GET /api/user/bookings` — (Authenticated) Fetch logged-in user's history.

### Admin Operations
- `GET /api/admin/bookings` — (Admin only) Fetch all platform bookings.

### Payment Placeholders
- `POST /api/payments/crypto` — (Authenticated) Returns deposit addresses.
- `POST /api/payments/create-intent` — (Authenticated) Stripe/PayPal integration point.

## Scalability
To transition to production:
1. Replace `sqlite3` with `pg` (PostgreSQL) in `server.js`.
2. Connect real payment APIs (Stripe, Coinbase Commerce) in the provided placeholders.
3. Deploy to Heroku/DigitalOcean/AWS.

---
© 2025 StraBook Engineering Team
