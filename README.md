# FIXIT AI - AI-Powered Complaint & Maintenance Management System
**Academic M.Sc. IT Stage 1 Project**

FIXIT AI is a modern SaaS-style complaint and facility maintenance management platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js), styled with Tailwind CSS and Lucide icons.

---

## 🌟 Key Features

- **Role-Based Access Control (RBAC)**:
  - 👤 **USER**: Report problems with photos, track status timeline, edit/delete pending tickets, view notifications, manage profile.
  - 🛠️ **STAFF / TECHNICIAN**: View assigned complaints, start repairs (`In Progress`), record resolution notes and mark tickets as `Resolved`.
  - 🛡️ **ADMIN**: Full executive dashboard with real MongoDB analytics, assign technicians, update complaint statuses, manage users (activate/deactivate), manage staff, and manage categories.
- **Visual Status Timeline**:
  - `Submitted` ➔ `Assigned` ➔ `In Progress` ➔ `Resolved` (or `Rejected`).
- **Dynamic Live Notifications**: Stored in MongoDB and triggered automatically on status transitions and assignments.
- **Image Upload Support**: Multer-powered photo attachment validation (JPG, JPEG, PNG, WEBP, max 5MB).
- **Executive Analytics**: Live MongoDB aggregation for complaints by Category, Status, and Priority with printable audit reports.
- **Modern Responsive Design**: Clean SaaS aesthetic with blue/indigo highlights, white rounded cards, soft shadows, and full responsiveness on Mobile, Tablet, Laptop, and Desktop.

---

## 🔑 Demo Login Credentials

For quick evaluation, the login screen includes **1-click demo credential chips**:

| Role | Email | Password | Dashboard URL |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@fixitai.demo` | `Password123!` | `http://localhost:5173/admin/dashboard` |
| **Staff (Technician)** | `staff@fixitai.demo` | `Password123!` | `http://localhost:5173/staff/dashboard` |
| **User (Student/Faculty)** | `user@fixitai.demo` | `Password123!` | `http://localhost:5173/dashboard` |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (running locally on port 27017 or a MongoDB Atlas URI)

### 2. Backend Setup
```bash
# Navigate to the server folder
cd server

# Install dependencies (Express, Mongoose, Multer, JWT, Bcrypt, Cors, Dotenv)
npm install

# Seed the database with Admin, Staff, Users, Categories, and Complaints
node seed/seedData.js

# Start the backend server (Runs on port 5000)
npm start
```

### 3. Frontend Setup
```bash
# Open a new terminal and navigate to the client folder
cd client

# Install dependencies (React Router DOM, Axios, Lucide React, Tailwind CSS)
npm install

# Start the Vite development server (Runs on port 5173)
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 📁 Project Structure

```
FixItAI/
├── client/                     # Frontend (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── admin/              # Admin pages (Dashboard, Complaints, Users, Staff, Categories, Analytics, Reports)
│   │   ├── staff/              # Staff pages (Dashboard, Work Orders, Details & Notes)
│   │   ├── pages/              # Public & User pages (Home, About, Contact, Login, Register, MyComplaints, etc.)
│   │   ├── components/         # Reusable UI (Navbar, Sidebar, Footer, Badges, Table, Modals)
│   │   ├── context/            # AuthContext (JWT & state management)
│   │   ├── services/           # Axios API services (Auth, Complaints, Staff, Categories, Notifications)
│   │   ├── utils/              # Helpers and Constants
│   │   ├── App.jsx             # React Router setup
│   │   └── main.jsx            # Entry point
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                     # Backend (Node.js + Express + MongoDB)
│   ├── config/db.js            # MongoDB Mongoose connection
│   ├── controllers/            # Request handlers (Auth, Complaints, Staff, Categories, Admin, Notifications)
│   ├── models/                 # Mongoose Models (User, Complaint, Staff, Category, Notification)
│   ├── routes/                 # API Routes (/api/auth, /api/complaints, etc.)
│   ├── middleware/             # Auth, Admin, Staff, Multer Upload, and Error handling
│   ├── seed/seedData.js        # Realistic demo database seeder
│   ├── uploads/                # Uploaded complaint images
│   ├── test-e2e.js             # Automated end-to-end verification script
│   ├── server.js               # Express server entry point
│   └── package.json
│
└── README.md
```

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register`: Create new user
- `POST /api/auth/login`: Authenticate and receive JWT
- `GET /api/auth/me`: Get profile of logged-in user
- `PUT /api/auth/profile`: Update name, phone, or change password

### Complaints (`/api/complaints`)
- `GET /api/complaints`: List complaints (supports search & status/category/priority filters)
- `GET /api/complaints/:id`: Get complaint details
- `POST /api/complaints`: Create complaint (supports photo upload)
- `PUT /api/complaints/:id`: Update complaint (if Pending)
- `DELETE /api/complaints/:id`: Delete complaint (if Pending)
- `PUT /api/complaints/:id/staff-status`: Technician updates status and adds resolution notes

### Staff (`/api/staff`)
- `GET /api/staff`: List all staff members
- `POST /api/staff`: Create new staff profile and login account
- `GET /api/staff/:id`: Get staff member by ID
- `PUT /api/staff/:id`: Update staff member
- `DELETE /api/staff/:id`: Delete staff member

### Categories (`/api/categories`)
- `GET /api/categories`: List all categories
- `POST /api/categories`: Create category
- `PUT /api/categories/:id`: Update category
- `DELETE /api/categories/:id`: Delete category

### Admin (`/api/admin`)
- `GET /api/admin/dashboard`: Real-time aggregated statistics and chart data
- `GET /api/admin/users`: List all users
- `PUT /api/admin/users/:id/status`: Activate or deactivate account
- `PUT /api/admin/complaints/:id/assign`: Assign complaint to staff member
- `PUT /api/admin/complaints/:id/status`: Change complaint status directly

### Notifications (`/api/notifications`)
- `GET /api/notifications`: Get user notifications
- `PUT /api/notifications/:id/read`: Mark notification as read
- `PUT /api/notifications/read-all`: Mark all notifications as read

---

## 🧪 Verification & Testing

An automated verification test script is included in `server/test-e2e.js` that tests all 20 CRUD and authentication operations:
```bash
cd server
node test-e2e.js
```
Expected output:
```
=============================================
E2E TEST SUMMARY: 20 PASSED, 0 FAILED
=============================================
```
