# 🔐 SkyFlow Authentication Service

[![Production Auth Service](https://img.shields.io/badge/Production-Live%20on%20Render-success?style=for-the-badge&logo=render)](https://skyflow-auth-service-o60j.onrender.com/health)
[![Node.js](https://img.shields.io/badge/Node.js-v18.0.0+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5.0-black?style=for-the-badge&logo=express)](https://expressjs.com/)
[![Sequelize ORM](https://img.shields.io/badge/Sequelize-v6.0-52B0E7?style=for-the-badge&logo=sequelize)](https://sequelize.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Multi--Dialect-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![JWT](https://img.shields.io/badge/JWT-Protected-black?style=for-the-badge&logo=json-web-tokens)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

The **SkyFlow Authentication Service** is dedicated to user identity lifecycle management, secure credential storage, role-based authorization (RBAC), and JSON Web Token (JWT) issuance. It implements dynamic per-user `bcrypt` salting (10 rounds) and provides token validation consumed by the **API Gateway** before granting access to protected flight booking and operations dispatch resources.

---

## 🏗️ System Architecture & Context Flow

The service acts as the identity provider for the microservice cluster. In production, calls to this service are proxied through the **API Gateway**.

```mermaid
flowchart TD
    GW(["SkyFlow API Gateway (:3005 / Render)"])

    subgraph AuthServiceBoundary ["Airline Authentication Service (:3001 / Render)"]
        Routes["Express Router (/api/v1)"]
        
        subgraph MiddlewarePipeline ["Validation & Interceptors"]
            ValidateAuth["Auth Validator Middleware<br/>• Email Format Verification<br/>• Password Complexity Rules"]
            TokenGuard["Token Extraction Middleware<br/>• Extracts x-access-token Header"]
        end

        subgraph CoreLogic ["Controller & Service Domain"]
            UserCtrl["User Controller"]
            UserSvc["User Service<br/>• Dynamic Bcrypt Salting (10 Rounds)<br/>• JWT Signing (RS256/HS256)<br/>• Role Attachment Logic"]
            UserRepo["User Repository<br/>(Sequelize Data Access Layer)"]
        end

        subgraph SecurityEngine ["Cryptographic Operations"]
            Bcrypt["Bcrypt Password Hasher<br/>• Dynamic Per-User Salt Generation"]
            JWTEngine["JSON Web Token Engine<br/>• Token Verification & Expiry Check"]
        end
    end

    subgraph RelationalDB ["Relational Database (PostgreSQL / MySQL)"]
        UsersTable[("Users Table<br/>(id, email, password, timestamps)")]
        RolesTable[("Roles Table<br/>(id, name: ADMIN / CUSTOMER)")]
        UserRolesTable[("User_Roles Join Table<br/>(userId, roleId)")]
    end

    GW -->|POST /signup, POST /signin| Routes
    GW -->|GET /isauthenticated, GET /isAdmin| Routes
    Routes --> MiddlewarePipeline
    MiddlewarePipeline --> UserCtrl
    UserCtrl --> UserSvc
    UserSvc <--> SecurityEngine
    UserSvc --> UserRepo
    UserRepo <--> RelationalDB

    classDef gwStyle fill:#1e1b4b,stroke:#8b5cf6,stroke-width:2px,color:#f8fafc;
    classDef svcStyle fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#f8fafc;
    classDef dbStyle fill:#1e293b,stroke:#10b981,stroke-width:2px,color:#f8fafc;

    class GW gwStyle;
    class AuthServiceBoundary,Routes,MiddlewarePipeline,CoreLogic,SecurityEngine svcStyle;
    class RelationalDB,UsersTable,RolesTable,UserRolesTable dbStyle;
```

---

## 📊 Database Domain Model (ER Diagram)

The Authentication Service maintains a many-to-many relationship between Users and Roles using Sequelize ORM:

```mermaid
erDiagram
    USER ||--o{ USER_ROLE : "assigned"
    ROLE ||--o{ USER_ROLE : "contains"

    USER {
        int id PK "Auto Increment"
        string email "Unique, Indexed"
        string password "Bcrypt Hashed (60 chars)"
        datetime createdAt
        datetime updatedAt
    }

    ROLE {
        int id PK "Auto Increment"
        string name "ADMIN | CUSTOMER | AIRLINE_BUSINESS"
        datetime createdAt
        datetime updatedAt
    }

    USER_ROLE {
        int userId FK "References Users(id)"
        int roleId FK "References Roles(id)"
        datetime createdAt
        datetime updatedAt
    }
```

---

## ⚡ Core Capabilities

1. **Secure Registration & Dynamic Salting**:
   - Passwords are automatically hashed via `bcrypt.hashSync(plainText, salt)` before insertion using a Sequelize `beforeCreate` lifecycle hook.
2. **JWT Issuance & Verification**:
   - Generates signed JWTs upon successful sign-in with customizable expiration (default: 1 day).
   - Validates incoming tokens via `jwt.verify(token, JWT_KEY)` and extracts the authenticated user ID.
3. **Role-Based Authorization (RBAC)**:
   - Evaluates user roles through the `User_Roles` mapping table.
   - Exposes `GET /api/v1/isAdmin?id={userId}` used by the API Gateway to guard sensitive flight creation and fleet scheduling routes.
4. **Cloud Database Multi-Dialect Support**:
   - Supports local MySQL and cloud-hosted PostgreSQL with dynamic SSL auto-negotiation (`ssl: { rejectUnauthorized: false }`).

---

## 🛠️ Tech Stack & Dependencies

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Runtime** | Node.js (v18+) | Server execution runtime |
| **Framework** | Express 5 | REST API web framework |
| **ORM** | Sequelize v6 | Promise-based ORM with migration & seeder support |
| **Databases** | PostgreSQL & MySQL | Multi-dialect database drivers (`pg`, `mysql2`) |
| **Authentication** | `jsonwebtoken` | Token signing and verification |
| **Encryption** | `bcrypt` / `bcryptjs` | Adaptive one-way password hashing |
| **Validation** | Custom Middlewares | Email regex and mandatory credential checks |

---

## 🌐 API Endpoints & Request Contract

### 1. User Registration
- **Endpoint**: `POST /api/v1/signup`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "passenger@skyflow.com",
    "password": "Password123!"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "success": true,
    "message": "Successfully created a new user",
    "data": {
      "id": 4,
      "email": "passenger@skyflow.com"
    },
    "err": {}
  }
  ```

### 2. User Authentication (Sign In)
- **Endpoint**: `POST /api/v1/signin`
- **Access**: Public (Brute-force rate-limited at Gateway)
- **Request Body**:
  ```json
  {
    "email": "passenger@skyflow.com",
    "password": "Password123!"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Successfully signed in",
    "data": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "err": {}
  }
  ```

### 3. Verify Token Validity
- **Endpoint**: `GET /api/v1/isauthenticated`
- **Access**: Protected
- **Headers**: `x-access-token: <jwt_token>`
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "User is authenticated and token is valid",
    "data": 4,
    "err": {}
  }
  ```

### 4. Admin Role Verification
- **Endpoint**: `GET /api/v1/isAdmin?id={userId}`
- **Access**: Protected
- **Headers**: `x-access-token: <jwt_token>`
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Successfully fetched whether user is admin or not",
    "data": true,
    "err": {}
  }
  ```

### 5. Assign Role to User (Admin Operation)
- **Endpoint**: `POST /api/v1/user/role`
- **Access**: Admin Internal
- **Request Body**:
  ```json
  {
    "userId": 4,
    "roleName": "ADMIN"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Successfully assigned role to user",
    "data": true,
    "err": {}
  }
  ```

### 6. Health Probe
- **Endpoint**: `GET /health`
- **Response** (`200 OK`):
  ```json
  {
    "service": "Airline_auth_service",
    "status": "UP",
    "database": "CONNECTED",
    "timestamp": "2026-10-13T06:09:15.445Z"
  }
  ```

---

## ⚙️ Environment Variables

Create a `.env` file in `Airline_auth_service`:

| Variable | Required | Default / Example | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | **Yes** | `3001` (Local) / `10000` (Render) | Server listening port. |
| `JWT_KEY` | **Yes** | `SkyFlow_Production_Secret_2026!` | Secret key for signing and verifying JWTs. |
| `DATABASE_URL` | Optional | `postgres://user:pass@host/db` | Connection URI for cloud databases (Render PostgreSQL). |
| `DB_SYNC` | Optional | `false` | When set to `true`, executes `sequelize.sync({ alter: true })`. |
| `NODE_ENV` | Optional | `development` | Operating environment (`development`, `production`). |

---

## 🚀 Local Development & Setup

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **MySQL**: Running on `127.0.0.1:3306` (or PostgreSQL)

### Step-by-Step Instructions

1. **Navigate to Service:**
   ```bash
   cd Airline_auth_service
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment & Database:**
   ```bash
   cp .env.example .env
   cp src/config/config.json.example src/config/config.json
   # Update config.json with your local MySQL credentials
   ```

4. **Run Migrations & Seed Default Roles:**
   ```bash
   npx sequelize db:create
   npx sequelize db:migrate
   npx sequelize db:seed:all
   ```

5. **Start Development Server:**
   ```bash
   npm start
   ```
   Service will listen on `http://localhost:3001`.

---

## 🐳 Docker Setup

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . ./
EXPOSE 3001
CMD ["node", "src/index.js"]
```

```bash
docker build -t skyflow-auth-service .
docker run -p 3001:3001 --env-file .env skyflow-auth-service
```

---

## 📄 License
This project is licensed under the MIT License.
