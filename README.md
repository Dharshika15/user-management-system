# UserVault — MERN User Management System

A full-stack **MERN** (MongoDB, Express, React, Node.js) application for managing user accounts with role-based access control (RBAC), JWT authentication with refresh tokens, and a polished dark-themed UI.

---

## 🖼️ Screenshots

The system features a deep navy + amber design with:
- Role-aware sidebar navigation
- Stats dashboard (admins/managers)
- Searchable, filterable user table with pagination
- Inline user editing with audit trail
- Profile management with password change

---

## ✨ Features

### Authentication & Security
- JWT access tokens (15-min expiry) + HTTP-only refresh tokens (7 days)
- Automatic silent token refresh via Axios interceptors
- Passwords hashed with bcrypt (12 rounds)
- Rate limiting on all routes (10 login attempts / 15 min)
- Helmet security headers, CORS, NoSQL injection prevention (mongo-sanitize)
- Input validation on all endpoints (express-validator)

### Role-Based Access Control (RBAC)
| Capability | Admin | Manager | User |
|---|---|---|---|
| View all users | ✅ | ✅ (non-admins) | ❌ |
| Create user | ✅ | ❌ | ❌ |
| Edit any user | ✅ | ✅ (users only) | ❌ |
| Change roles | ✅ | ❌ | ❌ |
| Delete user | ✅ | ❌ | ❌ |
| View own profile | ✅ | ✅ | ✅ |
| Edit own profile | ✅ | ✅ | ✅ |

### User Management
- Paginated, searchable, filterable user list
- Create users (admin) with auto-generate password option
- Soft delete (preserves data, sets `isDeleted: true`)
- Audit trail: `createdBy`, `updatedBy`, `createdAt`, `updatedAt`, `lastLogin`
- User deactivation (inactive users cannot log in)

---

## 🗂️ Project Structure

```
user-management-system/
├── backend/
│   ├── src/
│   │   ├── config/          # DB, roles/permissions config
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, error handler, validation
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routers
│   │   ├── services/        # Business logic
│   │   ├── utils/           # JWT helpers, logger, seeder, AppError
│   │   ├── validators/      # express-validator rules
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── api/             # Axios client + API modules
    │   ├── components/
    │   │   ├── common/      # Button, FormField, Badges, LoadingScreen
    │   │   └── layout/      # Sidebar, AppLayout
    │   ├── context/         # AuthContext (global auth state)
    │   ├── hooks/           # useUsers, useUser, useUserStats
    │   ├── pages/
    │   │   ├── auth/        # LoginPage, RegisterPage
    │   │   ├── admin/       # DashboardPage, UsersPage, UserDetailPage, CreateUserPage
    │   │   └── user/        # MyProfilePage
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── .env.example
    └── package.json
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas URI)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/user-management-system.git
cd user-management-system
```

### 2. Backend setup
```bash
cd backend
cp .env.example .env
# Edit .env with your values (see below)
npm install
npm run seed      # Seeds 5 demo users
npm run dev       # Starts on http://localhost:5000
```

### 3. Frontend setup
```bash
cd frontend
cp .env.example .env
# Set REACT_APP_API_URL=http://localhost:5000/api
npm install
npm start         # Starts on http://localhost:3000
```

### Backend `.env` variables
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/user_management
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=another_long_random_string
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
BCRYPT_ROUNDS=12
```

---

## 🐳 Docker Setup

```bash
# Copy env files
cp backend/.env.example backend/.env
# Edit backend/.env — set MONGODB_URI=mongodb://mongo:27017/user_management

docker-compose up --build
# Seeds run automatically on first start
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
```

---

## 🔐 Demo Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | Admin@123456 |
| Manager | manager@example.com | Manager@123456 |
| User | user@example.com | User@123456 |

> Use the **Quick Demo Access** buttons on the login page.

---

## 📡 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | ❌ | Login |
| POST | `/api/auth/register` | ❌ | Register |
| POST | `/api/auth/refresh` | Cookie | Refresh access token |
| POST | `/api/auth/logout` | ✅ | Logout |
| GET | `/api/auth/me` | ✅ | Get current user |

### Users
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/users` | Admin, Manager | List all users (paginated) |
| POST | `/api/users` | Admin | Create user |
| GET | `/api/users/stats` | Admin, Manager | User statistics |
| GET | `/api/users/:id` | Admin, Manager | Get user by ID |
| PATCH | `/api/users/:id` | Admin, Manager | Update user |
| DELETE | `/api/users/:id` | Admin | Soft-delete user |
| PATCH | `/api/users/me` | All | Update own profile |

### Query parameters for `GET /api/users`
```
?page=1&limit=10&search=john&role=user&status=active&sortBy=createdAt&sortOrder=desc
```

---

## 🌐 Deployment

### Backend — Render
1. Create a new **Web Service** on [render.com](https://render.com)
2. Set root directory: `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all environment variables from `.env.example`
6. After deploy, run seed: `npm run seed` (one-time)

### Frontend — Vercel
1. Import repo on [vercel.com](https://vercel.com)
2. Set root directory: `frontend`
3. Add env var: `REACT_APP_API_URL=https://your-backend.onrender.com/api`
4. Deploy

---

## 🏗️ Architecture Decisions

- **Soft delete**: Users are never hard-deleted; `isDeleted: true` + `deletedAt` preserves audit history.
- **Layered architecture**: controllers → services → models. Controllers handle HTTP; services contain business logic.
- **Permission matrix**: `config/roles.js` exports `ROLE_PERMISSIONS` — extending permissions only requires editing this file.
- **Token rotation**: Each refresh issues a new refresh token and invalidates the old one (stored in DB).
- **Global error handler**: All errors flow through `middleware/errorHandler.js` for consistent API responses.

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Axios |
| State | React Context + useReducer |
| Backend | Node.js, Express 4 |
| Database | MongoDB with Mongoose |
| Auth | JWT (access + refresh), bcryptjs |
| Security | Helmet, express-rate-limit, mongo-sanitize, CORS |
| Logging | Winston, Morgan |
| Validation | express-validator |
| Dev | nodemon, dotenv |
