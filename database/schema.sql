-- ==========================================================
-- Database: student_attendance_db
-- Description: Schema for Student Attendance System
-- Note: Plain text passwords for academic/demo purposes only.
-- ==========================================================

CREATE DATABASE IF NOT EXISTS student_attendance_db;
USE student_attendance_db;

-- Disable foreign key checks for clean table teardown and re-creation
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS notices;
DROP TABLE IF EXISTS holidays;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS faculty;
DROP TABLE IF EXISTS admin;
SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------
-- 1. admin Table
-- ----------------------------------------------------------
CREATE TABLE admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_plain VARCHAR(255) NOT NULL, -- Plain text (no hash/encryption, academic/demo only)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------
-- 2. faculty Table
-- ----------------------------------------------------------
CREATE TABLE faculty (
    faculty_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_plain VARCHAR(255) NOT NULL, -- Plain text (no hash/encryption, academic/demo only)
    department VARCHAR(100) NOT NULL,
    photo_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------
-- 3. students Table
-- ----------------------------------------------------------
CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    roll_number VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_plain VARCHAR(255) NOT NULL, -- Plain text (no hash/encryption, academic/demo only)
    department VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    section VARCHAR(10) NOT NULL,
    phone VARCHAR(20),
    photo_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_students_dept_year_sec (department, year, section)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------
-- 4. attendance Table
-- ----------------------------------------------------------
CREATE TABLE attendance (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    date DATE NOT NULL,
    time_in TIME,
    status VARCHAR(30) NOT NULL, -- 'Present', 'Absent', 'Late', 'Present-OutOfRange'
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    marked_by ENUM('self', 'faculty', 'admin') NOT NULL,
    CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT uq_student_date UNIQUE (student_id, date),
    INDEX idx_attendance_student_id (student_id),
    INDEX idx_attendance_date (date),
    INDEX idx_attendance_student_date (student_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------
-- 5. holidays Table
-- ----------------------------------------------------------
CREATE TABLE holidays (
    holiday_id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    added_by_admin_id INT,
    CONSTRAINT fk_holidays_admin FOREIGN KEY (added_by_admin_id) REFERENCES admin(admin_id) ON DELETE SET NULL,
    INDEX idx_holidays_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------
-- 6. notices Table
-- ----------------------------------------------------------
CREATE TABLE notices (
    notice_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    posted_by_faculty_id INT,
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    target_audience ENUM('All', 'Specific Year', 'Specific Section') NOT NULL DEFAULT 'All',
    CONSTRAINT fk_notices_faculty FOREIGN KEY (posted_by_faculty_id) REFERENCES faculty(faculty_id) ON DELETE SET NULL,
    INDEX idx_notices_faculty (posted_by_faculty_id),
    INDEX idx_notices_posted_at (posted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------
-- 7. feedback Table
-- ----------------------------------------------------------
CREATE TABLE feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    subject VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('New', 'Reviewed') NOT NULL DEFAULT 'New',
    CONSTRAINT fk_feedback_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    INDEX idx_feedback_student (student_id),
    INDEX idx_feedback_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
