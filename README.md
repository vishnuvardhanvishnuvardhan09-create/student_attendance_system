# ?? Smart Student Attendance System

A modern, full-stack college attendance management system built with **React (Vite)**, **Java Spring Boot**, and **MySQL**. It features geofenced GPS student self-attendance, real-time analytics dashboards, digital QR code student ID badges, profile photo management, and a robust **Offline-First / Zero-Backend Architecture** that functions offline and deploys standalone to Vercel.

---

> [!NOTE]
> **Academic / Demonstration Purpose Disclaimer**:
> This project is designed exclusively for academic evaluation, project exhibitions, and demonstration purposes. **Passwords are intentionally stored in plain text without cryptographic hashing or encryption** to allow examiners, evaluators, and students to easily inspect accounts and verify database operations directly. Do not use plain-text credentials in production environments.

---

## ??? Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Lucide React icons, Recharts (data visualizations), QR code generation (`qrcode.react`), Three.js / React Three Fiber (login/register 3D animations).
- **Backend**: Java 17+, Spring Boot 3 (Spring Web, Spring Data JPA, Hibernate).
- **Database**: MySQL 8.0+ (`student_attendance_db`).
- **Offline / Deployment Layer**: HTML5 LocalStorage mirrors, reactive online/offline health check pinging, queued background sync (`pending_attendance`, `pending_photos`, `pending_feedback`, `pending_students`), and SPA routing rewrite (`vercel.json`).

---

## ?? Repository & Folder Structure

```text
student-attendance-system/
+-- backend/                       # Java Spring Boot REST API
¦   +-- src/main/java/com/attendance/system/
¦   ¦   +-- config/                # CorsConfig, WebMvc static resource handlers
¦   ¦   +-- controller/            # Admin, Auth, Student, Faculty, PhotoUpload
¦   ¦   +-- dto/                   # Request/Response data transfer objects
¦   ¦   +-- model/                 # JPA Entities: Student, Faculty, Admin, Attendance, Notice, Holiday, Feedback
¦   ¦   +-- repository/            # Spring Data JPA interfaces
¦   ¦   +-- service/               # Geofence validation, AuthService, AttendanceService
¦   +-- src/main/resources/
¦   ¦   +-- application.properties # Server port 8080 & MySQL database configuration
¦   +-- uploads/photos/            # Physical directory for server-stored profile photos
¦   +-- pom.xml                    # Maven dependencies
+-- database/                      # SQL scripts
¦   +-- schema.sql                 # Complete DDL table definitions with foreign keys and indexes
¦   +-- seed_data.sql              # Pre-seeded demo administrators, faculty, students, holidays, notices
+-- frontend/                      # React SPA client application
¦   +-- public/                    # Static favicon and assets
¦   +-- src/
¦   ¦   +-- api/                   # apiClient (Axios), offlineSync (mirror + queue), localAccounts, photoService
¦   ¦   +-- components/            # Avatar, PhotoUpload, AuthScene3D, UI widgets
¦   ¦   +-- layouts/ & pages/      # Admin, Student, Faculty dashboards & management pages
¦   ¦   +-- styles/                # CSS design system and theme variables
¦   ¦   +-- App.jsx                # Route hierarchy and startup health check
¦   ¦   +-- main.jsx               # React entry point
¦   +-- .env.example               # Template environment configuration
¦   +-- package.json               # Frontend dependencies & Vite scripts
¦   +-- vercel.json                # Single Page Application rewrites for Vercel
+-- vercel.json                    # Workspace root SPA rewrites
+-- .gitignore                     # Git hygiene: excludes node_modules, target, .env, metadata
+-- README.md                      # Comprehensive project guide
```

---

## ??? Database Setup (MySQL)

1. Ensure MySQL Server is running locally on port `3306`.
2. Open MySQL Command Line Client, MySQL Workbench, or your preferred SQL editor.
3. Execute the schema script to create the database and tables:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
4. Populate the database with demo accounts, attendance logs, notices, and holidays:
   ```bash
   mysql -u root -p < database/seed_data.sql
   ```
5. Verify that the database `student_attendance_db` contains tables: `admin`, `faculty`, `students`, `attendance`, `holidays`, `notices`, `feedback`.

---

## ? How to Run the Backend (in Eclipse / Spring Tool Suite)

1. **Open Eclipse IDE / STS**:
   - Ensure the **Java SE 17+** and **Spring Tools 4** plugins are installed.
2. **Import Project**:
   - Go to `File` > `Import...` > `Existing Maven Projects`.
   - Click `Browse...` and select the `student-attendance-system/backend` folder.
   - Click `Finish` to resolve Maven dependencies.
3. **Configure Database Connection**:
   - Open `src/main/resources/application.properties`.
   - Verify the MySQL credentials match your local setup:
     ```properties
     spring.datasource.url=jdbc:mysql://localhost:3306/student_attendance_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
     spring.datasource.username=root
     spring.datasource.password=YOUR_MYSQL_PASSWORD
     server.port=8080
     ```
4. **Run the Application**:
   - Right-click the project root or `com.attendance.system.AttendanceSystemApplication.java`.
   - Select `Run As` > `Spring Boot App` (or `Java Application`).
   - The console will confirm startup:
     ```
     Tomcat started on port 8080 (http) with context path '/'
     Started AttendanceSystemApplication in ... seconds
     ```

---

## ?? How to Run the Frontend (in VS Code)

1. **Open in VS Code**:
   - Open VS Code and select `File` > `Open Folder...`.
   - Choose `student-attendance-system/frontend` (or the workspace root).
2. **Environment Configuration**:
   - In `frontend/`, create a `.env` file (or copy `.env.example`):
     ```env
     VITE_API_BASE_URL=http://localhost:8080/api
     ```
3. **Install Dependencies**:
   - Open the integrated terminal in the `frontend` directory:
     ```bash
     npm install
     ```
4. **Start Development Server**:
   ```bash
   npm run dev
   ```
5. **Open Application**:
   - Navigate to `http://localhost:5173` in your browser.

---

## ?? Standalone Vercel Deployment (Zero-Backend Mode)

The frontend is engineered with an **Offline-First Data Layer** that automatically detects when a live Spring Boot backend is not present. On app load:
1. It runs a non-blocking health check ping to `/api/admin/dashboard-summary`.
2. If unreachable (e.g. deployed standalone to Vercel), it activates `isOffline = true`.
3. Authentication and CRUD actions route seamlessly to localStorage account directories with pre-seeded demo records.
4. When deployed to Vercel, `vercel.json` rewrites all deep routes (`/admin/*`, `/student/*`, `/faculty/*`) to `index.html`.

---

## ?? Pre-Configured Demo Credentials

| Role | Email | Password | Access Level & Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@attendance.edu` | `admin123` | Full admin rights: students, faculty, holidays, feedback, CSV export |
| **Faculty** | `alan.turing@attendance.edu` | `faculty123` | Computer Science: attendance overview, manual marking, notices |
| **Faculty** | `ada.lovelace@attendance.edu` | `faculty456` | Information Technology department overview & circulars |
| **Faculty** | `claude.shannon@attendance.edu` | `faculty789` | Electronics & Communication department overview |
| **Student** | `alice.johnson@student.edu` | `student123` | Year 3, Sec A (CS): GPS attendance, QR badge, profile photo |
| **Student** | `bob.smith@student.edu` | `student123` | Year 3, Sec A (CS): student portal & attendance history |
| **Student** | `diana.prince@student.edu` | `student123` | Year 2, Sec A (CS): student portal & feedback submission |
