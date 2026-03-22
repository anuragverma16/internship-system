# 🚀 InternHub — Full Stack Internship Management System

A modern, full-stack internship management platform connecting students with top companies. Built with React, Node.js, Express, MongoDB, and stunning animations.

---

## 📸 Features

### 🎓 For Students
- Register/Login with JWT auth
- Create rich profiles with resume upload
- Browse & search internships with advanced filters
- Apply with cover letters
- Track application status in real-time
- Save/bookmark internships

### 🏢 For Companies
- Post, edit, delete internship listings
- Manage applicants with status pipeline (Pending → Reviewing → Shortlisted → Interview → Accepted/Rejected)
- Company profile with logo upload
- Applicant detail view with resume download

### 🛡️ For Admins
- Platform analytics dashboard with charts
- Manage all users (activate/deactivate/delete)
- Feature/unfeature internship listings
- Verify companies
- Monitor all activity

### 🎨 UI/UX
- Modern glassmorphism design
- Dark/Light mode
- Fully responsive (mobile, tablet, desktop)
- Framer Motion animations
- Recharts analytics
- Smooth transitions & micro-interactions

---

## 🗂️ Project Structure

```
internship-system/
├── backend/
│   ├── config/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── internshipController.js
│   │   ├── applicationController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js          # JWT protect + authorize
│   │   ├── upload.js        # Multer file uploads
│   │   ├── errorHandler.js
│   │   └── notFound.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Company.js
│   │   ├── Internship.js
│   │   └── Application.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── internships.js
│   │   ├── applications.js
│   │   ├── companies.js
│   │   ├── admin.js
│   │   └── upload.js
│   ├── utils/
│   │   └── seeder.js
│   ├── uploads/             # Generated at runtime
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   └── LoadingSpinner.jsx
    │   │   └── layout/
    │   │       ├── Navbar.jsx
    │   │       ├── Footer.jsx
    │   │       └── DashboardLayout.jsx
    │   ├── contexts/
    │   │   ├── AuthContext.jsx
    │   │   └── ThemeContext.jsx
    │   ├── pages/
    │   │   ├── LandingPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── InternshipsPage.jsx
    │   │   ├── InternshipDetailPage.jsx
    │   │   ├── student/
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── Profile.jsx
    │   │   │   ├── Applications.jsx
    │   │   │   └── Saved.jsx
    │   │   ├── company/
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── Profile.jsx
    │   │   │   ├── Internships.jsx
    │   │   │   ├── Applicants.jsx
    │   │   │   └── PostInternship.jsx
    │   │   └── admin/
    │   │       ├── Dashboard.jsx
    │   │       ├── Users.jsx
    │   │       └── Internships.jsx
    │   ├── services/
    │   │   └── api.js        # Axios + all API helpers
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── vite.config.js
    ├── tailwind.config.js
    ├── .env.example
    └── package.json
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Private | Get current user |
| POST | `/api/auth/logout` | Private | Logout |
| PUT | `/api/auth/password` | Private | Change password |

### Internships
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/internships` | Public | List all (with filters) |
| GET | `/api/internships/featured` | Public | Featured listings |
| GET | `/api/internships/:id` | Public | Get single |
| GET | `/api/internships/company/mine` | Company | My listings |
| POST | `/api/internships` | Company | Create |
| PUT | `/api/internships/:id` | Company/Admin | Update |
| DELETE | `/api/internships/:id` | Company/Admin | Delete |

### Applications
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/applications/:internshipId` | Student | Apply |
| GET | `/api/applications/my` | Student | My applications |
| GET | `/api/applications/company` | Company | All company apps |
| GET | `/api/applications/internship/:id` | Company | Per internship apps |
| PATCH | `/api/applications/:id/status` | Company | Update status |
| DELETE | `/api/applications/:id` | Student | Withdraw |

### Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| PUT | `/api/users/profile` | Student | Update profile |
| POST | `/api/users/save-internship/:id` | Student | Save/unsave |
| GET | `/api/users/saved-internships` | Student | Get saved |

### Admin
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/admin/analytics` | Admin | Platform analytics |
| GET | `/api/admin/users` | Admin | All users |
| PATCH | `/api/admin/users/:id/toggle` | Admin | Activate/deactivate |
| DELETE | `/api/admin/users/:id` | Admin | Delete user |
| PATCH | `/api/admin/companies/:id/verify` | Admin | Verify company |
| PATCH | `/api/admin/internships/:id/feature` | Admin | Feature/unfeature |

### Uploads
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/upload/resume` | Student | Upload resume |
| POST | `/api/upload/avatar` | Private | Upload avatar |
| POST | `/api/upload/logo` | Company | Upload company logo |

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/internhub
JWT_SECRET=your_super_secure_jwt_secret_change_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
MAX_FILE_SIZE=5
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Install

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your values
npm install

# Frontend
cd ../frontend
cp .env.example .env
npm install
```

### 2. Seed Database (optional but recommended)

```bash
cd backend
npm run seed
```

This creates demo accounts:
- **Student:** student@demo.com / demo123
- **Company:** company@demo.com / demo123
- **Admin:** admin@demo.com / demo123

### 3. Run Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Runs on http://localhost:5000

# Terminal 2 - Frontend
cd frontend
npm run dev
# Runs on http://localhost:5173
```

---

## 🌐 Deployment

### Backend (Railway / Render / Heroku)

1. Set environment variables in your hosting platform
2. Set `NODE_ENV=production`
3. Use MongoDB Atlas for cloud database
4. Deploy with `npm start`

### Frontend (Vercel / Netlify)

1. Build: `npm run build`
2. Set `VITE_API_URL` to your backend URL
3. For Vercel: add `vercel.json` for SPA routing:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Docker (Full Stack)

```dockerfile
# Add Docker support by creating Dockerfile in each directory
# Backend Dockerfile example:
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Charts | Recharts |
| State | React Query + Context API |
| HTTP | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT + bcryptjs |
| File Upload | Multer |
| Validation | express-validator |
| Security | Helmet, CORS, Rate Limiting |

---

## 📄 License

MIT — Free to use for portfolio projects.
