# HRMS - Human Resource Management System

A full-stack Human Resource Management System built with React, Vite, Node.js, Express, and MongoDB. The repository contains three main application areas:

- `client/` - admin / HR / employee portal
- `server/` - backend API and database integration
- `candidate/` - candidate-facing frontend for job applications, aptitude tests, and video interviews

This project supports multi-role HR operations including employee management, attendance, leave, payroll, salary structures, recruitment workflows, aptitude assessments, and candidate interview processes.

---

## Overview

The HRMS project is designed for organizations that need to manage internal staff and external candidates within a single ecosystem.

### Core roles

1. Super Admin
   - Manages HR users and employees
   - Oversees attendance, leave, and payroll
   - Handles recruitment and job lifecycle
   - Reviews reports and salary structures

2. HR
   - Manages employees and attendance
   - Reviews leave requests
   - Handles payroll reporting and salary structures
   - Tracks job applications and candidate screening

3. Employee
   - Views profile and attendance data
   - Applies for leave
   - Views payroll information
   - Completes aptitude tasks and video interviews

4. Candidate
   - Registers and logs in
   - Views jobs and job details
   - Applies for positions
   - Takes aptitude tests
   - Participates in video interviews

---

## Features

### Admin / Super Admin features

- User authentication and role-based access control
- HR management
- Employee management
- Attendance monitoring
- Leave approval workflows
- Payroll and compensation management
- Salary structure configuration
- Job creation and management
- Candidate application review
- Aptitude question assignment
- Video interview management
- Reporting dashboards

### HR features

- Employee onboarding and profile management
- Attendance tracking and reporting
- HR leave management
- HR payroll management
- Job application review
- Candidate screening support
- Interview management
- Aptitude test handling

### Employee features

- Personal dashboard
- Profile management
- Attendance records
- Leave application workflow
- Payroll views
- Aptitude engagement
- Video interview tasks

### Candidate features

- Career page / launch screen
- Candidate registration and login
- Job browsing and job details
- Job application submissions
- Aptitude test attempts
- Interview scheduling and video interview flow

---

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Axios
- CSS Modules / custom CSS
- Lucide React icons

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT-based auth with cookies
- CORS + Helmet for security
- Nodemailer for email workflows

### Additional libraries

- ExcelJS
- PDFKit
- jsPDF
- XLSX
- dotenv
- bcryptjs

---

## Repository Structure

```text
HRMS/
├── client/                  # Admin / HR / Employee frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
├── server/                  # Express backend API
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── candidate/               # Candidate portal frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
├── .gitignore
├── README.md
└── package-lock.json
```

---

## Backend Architecture

The server exposes multiple route groups under the `/api` namespace, including:

- `/api/auth`
- `/api/admin`
- `/api/hr`
- `/api/employees`
- `/api/attendance`
- `/api/leave`
- `/api/payroll`
- `/api/salary-structures`
- `/api/jobs`
- `/api/job-applications`
- `/api/candidates`
- `/api/candidate`
- `/api/video-interviews`

The backend uses MongoDB models for major entities such as:

- `Employee`
- `User`
- `Candidate`
- `Job`
- `JobApplication`
- `Attendance`
- `Leave`
- `Payroll`
- `SalaryStructure`
- `AptitudeQuestion`
- `VideoInterview`

---

## Frontend Architecture

The admin / HR / employee UI is a role-based React application powered by protected routes. The app includes multiple layouts and route groups for:

- Super Admin dashboard and management screens
- HR dashboard and employee operations
- Employee-specific pages and reports
- Recruitment, aptitude, and interview modules

The candidate frontend is a separate Vite React application designed for job seekers and external applicants.

---

## Prerequisites

Before running this project, ensure you have:

- Node.js 18 or later
- npm or yarn
- MongoDB running locally or a valid MongoDB Atlas connection string
- Git

---

## Environment Setup

### 1. Server environment

Create a `.env` file inside `server/` based on `.env.example`.

Example:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hrms
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your_app_password
MAIL_FROM_NAME=Technology HR
```

Notes:

- Use a MongoDB connection string for your database.
- For Gmail SMTP, use an app password instead of a regular Gmail password.
- The backend is configured to accept multiple frontend origins, including:
  - `http://localhost:5173`
  - `http://localhost:5174`
  - `http://localhost:5175`

### 2. Candidate frontend environment

Create a `.env` file inside `candidate/` if needed:

```env
VITE_API_URL=http://localhost:5000/api
```

This is used by the candidate frontend to connect to the backend API.

---

## Installation

From the repository root:

```bash
cd server
npm install

cd ../client
npm install

cd ../candidate
npm install
```

---

## Running the Project

### Start the backend

```bash
cd server
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

### Start the admin/HR/employee frontend

```bash
cd client
npm run dev
```

Default frontend URL:

```text
http://localhost:5173
```

### Start the candidate portal

```bash
cd candidate
npm run dev
```

Candidate portal default URL:

```text
http://localhost:5174
```

---

## Useful Scripts

### Server

```bash
npm run dev
npm start
npm run seed:admin
```

### Client

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

### Candidate

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

---

## API Status and Health Checks

The backend exposes a health endpoint:

```text
GET /
```

This responds with a success message confirming the API is running.

There are also connectivity test routes such as:

```text
GET /api/payroll-server-test
GET /api/candidate-server-test
```

---

## Common Workflow Example

A typical recruitment lifecycle in this project looks like this:

1. Admin or HR creates a job posting
2. Candidate applies for the job
3. HR reviews the application
4. Candidate completes aptitude tests
5. Candidate participates in a video interview
6. HR evaluates the outcome
7. Payroll and employee onboarding can be handled after successful hiring

---

## Notes

- The system is built as a multi-app monorepo-like structure in a single Git repository.
- The `client/` app is for internal staff use, while `candidate/` is for external applicants.
- The backend allows cross-origin requests from multiple Vite frontend URLs.
- This repo is a development-ready HRMS project and can be expanded with additional modules, analytics, notifications, or deployment configuration.

---

## License

This project currently uses the default project setup conventions without an explicit custom license file. If you plan to publish or distribute it commercially, add an appropriate license file such as MIT or Apache 2.0.

---

## Contributors

This repository contains a complete HRMS workflow with multiple frontend modules and backend services. It is structured for internal HR administration and candidate recruitment.

---

## Recommended Next Improvements

- Add a root-level deployment guide
- Add Docker support for MongoDB and app services
- Add CI/CD workflow for build validation
- Add API documentation with Swagger
- Add unit and integration tests
- Add role-based dashboard permissions documentation
- Add production environment example files

---

## Summary

This HRMS project is a complete resource management and recruitment system covering:

- employee lifecycle management
- attendance and leave tracking
- payroll and salary structure administration
- job posting and candidate application handling
- aptitude assessments
- video interviews
- role-based access for admin, HR, staff, and candidates

It is structured for real-world HR operations and is ready to be extended into a more complete enterprise solution.
