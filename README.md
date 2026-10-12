# Airline Authentication Service

## Overview
The **Airline Authentication Service** is dedicated to user identity management, credential security, role-based authorization, and token issuance for the entire Airline Reservation platform. It provides token generation (JWT), secure password hashing using `bcrypt`, role mapping (Admin vs. Customer), and centralized authentication verification consumed by the **API Gateway** before permitting access to protected operations like flight bookings.

---

## Tech Stack
- **Runtime**: Node.js (v18+)
- **Framework**: Express 5
- **ORM**: Sequelize v6
- **Database**: MySQL (`mysql2` driver)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`)
- **Password Hashing**: `bcrypt` / `bcryptjs`
- **Environment Management**: `dotenv`
- **Development Tooling**: `nodemon`, `sequelize-cli`

---

## Environment Variables

Copy `.env.example` into `.env`:

```bash
cp .env.example .env
```

| Variable Name | Required | Default Value | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | Required | `3001` | Port on which the auth service listens. API Gateway points to this port. |
| `JWT_KEY` | Required | `your_jwt_secret_key_here` | Secret key used to sign and verify JSON Web Tokens. |
| `DB_SYNC` | Optional | `false` | When set to `true`, automatically runs `sequelize.sync({alter: true})` on server start. |
| `NODE_ENV` | Optional | `development` | Runtime environment (`development`, `test`, `production`). |

### Database Configuration (`src/config/config.json`)
Sequelize reads database connection details from `src/config/config.json`. A template is provided in `src/config/config.json.example`:

```json
{
  "development": {
    "username": "root",
    "password": "your_mysql_password",
    "database": "Airline_Auth_DEV",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
```

---

## Prerequisites & Installation

### Prerequisites
1. **Node.js**: v18.0.0 or higher
2. **MySQL Server**: v8.0 or higher running on `127.0.0.1:3306`

### Installation Steps

1. Navigate into the auth service directory:
   ```bash
   cd Airline_auth_service
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment and database configurations:
   ```bash
   # Copy environment file
   copy .env.example .env

   # Ensure src/config/config.json has your MySQL password
   copy src\config\config.json.example src\config\config.json
   ```

4. Create database and apply migrations:
   ```bash
   # Create the database
   npx sequelize db:create

   # Run schema migrations (creates Users, Roles, and UserRoles tables)
   npx sequelize db:migrate

   # Seed default roles (ADMIN, CUSTOMER, AIRLINE_BUSINESS)
   npx sequelize db:seed:all
   ```

5. Start the service:
   ```bash
   # Start with nodemon (auto-reload)
   npm start
   ```

---

## API Endpoints & Routes

All routes are prefixed with `/api/v1`.

### 1. User Signup
Registers a new user and securely hashes their password.

- **URL**: `POST /api/v1/signup`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "pilot@skyairline.com",
    "password": "SecurePassword123"
  }
  ```
- **Success Response** (`201 Created`):
  ```json
  {
    "message": "User created successfully",
    "data": {
      "id": 1,
      "email": "pilot@skyairline.com",
      "createdAt": "2026-10-12T15:30:00.000Z",
      "updatedAt": "2026-10-12T15:30:00.000Z"
    },
    "success": true,
    "err": {}
  }
  ```

---

### 2. User Signin
Authenticates user credentials and issues a signed JWT token.

- **URL**: `POST /api/v1/signin`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "pilot@skyairline.com",
    "password": "SecurePassword123"
  }
  ```
- **Success Response** (`200 OK`):
  ```json
  {
    "message": "User signed in successfully",
    "data": "<eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...>",
    "success": true,
    "err": null
  }
  ```

---

### 3. Verify Authentication (Used by API Gateway)
Validates whether a JWT token is active and decodes the user ID.

- **URL**: `GET /api/v1/isAuthenticated`
- **Headers**:
  ```http
  x-access-token: <jwt_token_string>
  ```
- **Success Response** (`200 OK`):
  ```json
  {
    "message": "User is authenticated and token is valid",
    "data": 1,
    "success": true,
    "err": {}
  }
  ```
- **Error Response** (`500 / 401`):
  ```json
  {
    "message": "Something went wrong",
    "data": {},
    "success": false,
    "err": "JsonWebTokenError: invalid token"
  }
  ```

---

### 4. Admin Role Verification
Verifies if a specific user has administrator privileges.

- **URL**: `GET /api/v1/isAdmin`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "id": 1
  }
  ```
- **Success Response** (`200 OK`):
  ```json
  {
    "message": "Successfully checked if user is admin or not",
    "data": true,
    "success": true,
    "err": {}
  }
  ```
