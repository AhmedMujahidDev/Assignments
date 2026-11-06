# Practice Server

An Express 5 API backed by MongoDB and Mongoose. Authentication uses email OTPs and signed bearer tokens.

## Requirements

- Node.js 20.6 or newer (the npm scripts use Node's `--env-file` option)
- MongoDB, local or hosted
- An SMTP account for sending verification, login, and password-reset codes

## Setup

From the project directory, install dependencies:

```powershell
npm install
```

Create a `.env` file in the project root:

```dotenv
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/practice-server
JWT_SECRET=replace-with-a-random-secret-at-least-32-characters-long
OTP_SECRET=replace-with-a-different-random-secret-at-least-32-characters-long

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
MAIL_FROM=Practice Server <no-reply@example.com>
```

`PORT` is optional and defaults to `4000`. `MONGO_URI`, `JWT_SECRET`, and `OTP_SECRET` are required; both secrets must contain at least 32 characters. Use different, randomly generated values for the secrets. SMTP settings are needed for email-based authentication flows. Keep `.env` private and do not commit real credentials.

You can generate a random secret with Node.js and paste the output into `.env`:

```powershell
node --input-type=commonjs -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Start the API:

```powershell
npm run dev
```

For a non-watch run:

```powershell
npm start
```

The server connects to MongoDB before listening. The default local API base URL is `http://localhost:4000`.

## API

All API routes are under `/api`. Send JSON request bodies with `Content-Type: application/json`. Successful responses use a `data` envelope; errors use an `error` field.

### Health check

| Method | Path | Authentication | Description |
|---|---|---|---|
| `GET` | `/health` | No | Returns server status and uptime. |

### Authentication

| Method | Path | Authentication | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | No | Create an account and send an email verification code (`201 Created`). |
| `POST` | `/api/auth/verify` | No | Verify an account using its email and six-digit code. |
| `POST` | `/api/auth/resend` | No | Resend an account verification code when eligible. |
| `POST` | `/api/auth/login` | No | Check email/password and send a login code by email. |
| `POST` | `/api/auth/verify-login-otp` | No | Verify the login code and receive a bearer token. |
| `GET` | `/api/auth/me` | Bearer token | Return the authenticated user's public profile. |
| `POST` | `/api/auth/logout` | Bearer token | Returns client-side logout guidance; the issued token is not revoked. |
| `POST` | `/api/auth/forgot-password` | No | Request a password-reset code. The response is the same whether or not the account exists. |
| `POST` | `/api/auth/reset-password` | No | Reset a password using its email, reset code, and new password. |

### Request examples

Create an account. Passwords must be 12–72 characters and no more than 72 bytes; names must be 2–80 characters.

```http
POST /api/auth/signup
Content-Type: application/json
```

```json
{
  "name": "Alex User",
  "email": "alex@example.com",
  "password": "a-long-example-password"
}
```

Verify the account using the code delivered to that email:

```json
{
  "email": "alex@example.com",
  "code": "123456"
}
```

The login flow is two steps. First, `POST /api/auth/login` with the same `email` and `password`; after the login code arrives, call `POST /api/auth/verify-login-otp` with `email` and `code`. A successful OTP verification returns a token and public user profile.

Use the returned token to access the current-user endpoint:

```http
GET /api/auth/me
Authorization: Bearer <token>
```

For password recovery, call `POST /api/auth/forgot-password` with an `email`, then `POST /api/auth/reset-password` with `email`, `code`, and `newPassword`. The reset endpoint accepts 8–72 characters; choose at least 12 characters to meet the password-login requirement.

### Response examples

Successful requests are wrapped in `data`, for example:

```json
{
  "data": {
    "User": {
      "id": "65a000000000000000000001",
      "name": "Alex User",
      "email": "alex@example.com",
      "city": "",
      "phone": "",
      "role": "user",
      "verified": true
    }
  }
}
```

Errors have this shape:

```json
{
  "error": "Invalid or expired token"
}
```

Common statuses include `400` for an invalid OTP, `401` for missing or invalid authentication, `403` for an account or permission restriction, `404` for an unknown route, `409` for duplicate records, `422` for invalid input, `429` for rate limits or OTP resend limits, and `500` for an unexpected server error. OTPs expire after 10 minutes and are limited to five verification attempts. Authentication endpoints are limited to 30 requests per IP per minute; the API-wide limit is 300 requests per IP per minute.
