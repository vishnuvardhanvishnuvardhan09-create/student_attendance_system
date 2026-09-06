-- ==========================================================
-- Database: student_attendance_db
-- Description: Seed Data for Student Attendance System
-- Note: Plain text passwords for academic/demo purposes only.
-- ==========================================================

USE student_attendance_db;

-- ----------------------------------------------------------
-- 1. Seed admin (1 admin)
-- ----------------------------------------------------------
INSERT INTO admin (name, email, password_plain) VALUES
('System Administrator', 'admin@attendance.edu', 'admin123');

-- ----------------------------------------------------------
-- 2. Seed faculty (3 faculty)
-- ----------------------------------------------------------
INSERT INTO faculty (name, email, password_plain, department, photo_url) VALUES
('Dr. Alan Turing', 'alan.turing@attendance.edu', 'faculty123', 'Computer Science', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'),
('Prof. Ada Lovelace', 'ada.lovelace@attendance.edu', 'faculty456', 'Information Technology', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2'),
('Dr. Claude Shannon', 'claude.shannon@attendance.edu', 'faculty789', 'Electronics & Communication', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e');

-- ----------------------------------------------------------
-- 3. Seed students (10 students)
-- ----------------------------------------------------------
INSERT INTO students (roll_number, name, email, password_plain, department, year, section, phone, photo_url) VALUES
('CS2026001', 'Alice Johnson', 'alice.johnson@student.edu', 'student123', 'Computer Science', 3, 'A', '9876543210', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330'),
('CS2026002', 'Bob Smith', 'bob.smith@student.edu', 'student123', 'Computer Science', 3, 'A', '9876543211', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'),
('CS2026003', 'Charlie Brown', 'charlie.brown@student.edu', 'student123', 'Computer Science', 3, 'B', '9876543212', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e'),
('CS2026004', 'Diana Prince', 'diana.prince@student.edu', 'student123', 'Computer Science', 2, 'A', '9876543213', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80'),
('IT2026005', 'Evan Wright', 'evan.wright@student.edu', 'student123', 'Information Technology', 2, 'A', '9876543214', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e'),
('IT2026006', 'Fiona Gallagher', 'fiona.gallagher@student.edu', 'student123', 'Information Technology', 4, 'B', '9876543215', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2'),
('EC2026007', 'George Clark', 'george.clark@student.edu', 'student123', 'Electronics & Communication', 1, 'A', '9876543216', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7'),
('EC2026008', 'Hannah Abbott', 'hannah.abbott@student.edu', 'student123', 'Electronics & Communication', 1, 'B', '9876543217', 'https://images.unsplash.com/photo-1517841905240-472988babdf9'),
('CS2026009', 'Ian Malcolm', 'ian.malcolm@student.edu', 'student123', 'Computer Science', 4, 'A', '9876543218', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d'),
('IT2026010', 'Julia Roberts', 'julia.roberts@student.edu', 'student123', 'Information Technology', 3, 'A', '9876543219', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb');

-- ----------------------------------------------------------
-- 4. Seed attendance (5 sample records)
-- ----------------------------------------------------------
INSERT INTO attendance (student_id, date, time_in, status, latitude, longitude, marked_by) VALUES
(1, '2026-09-01', '08:55:00', 'Present', 12.97160000, 77.59460000, 'self'),
(2, '2026-09-01', '09:15:30', 'Late',    12.97150000, 77.59480000, 'self'),
(3, '2026-09-01', NULL,       'Absent',  NULL,        NULL,        'faculty'),
(4, '2026-09-01', '08:50:10', 'Present', 12.97200000, 77.59400000, 'faculty'),
(5, '2026-09-01', '08:58:45', 'Present', 12.97180000, 77.59420000, 'admin');

-- ----------------------------------------------------------
-- 5. Seed holidays (5 sample holidays)
-- ----------------------------------------------------------
INSERT INTO holidays (date, title, description, added_by_admin_id) VALUES
('2026-01-26', 'Republic Day', 'National holiday commemorating the Constitution of India', 1),
('2026-08-15', 'Independence Day', 'National Independence Day celebrations and flag hoisting ceremony', 1),
('2026-10-02', 'Gandhi Jayanti', 'National holiday observing Mahatma Gandhi Birthday', 1),
('2026-11-08', 'Diwali', 'Festival of Lights - Campus will remain closed', 1),
('2026-12-25', 'Christmas Day', 'Winter Break & Christmas celebration', 1);

-- ----------------------------------------------------------
-- 6. Seed notices (5 sample notices)
-- ----------------------------------------------------------
INSERT INTO notices (title, message, posted_by_faculty_id, target_audience) VALUES
('Mid-Semester Examination Schedule', 'The mid-semester timetable has been finalized and released. Please check the department notice board.', 1, 'All'),
('Data Structures Lab Session Rescheduled', 'CS 3rd Year Section A lab session on Friday is rescheduled to Saturday 10:00 AM in Lab 2.', 1, 'Specific Section'),
('Annual Inter-College Hackathon 2026', 'Registrations are now open for the annual coding hackathon. Prizes include sponsored internships.', 2, 'All'),
('Final Year Project Synopsis Deadline', 'All 4th-year students must submit project synopses approved by guides on or before September 15th.', 2, 'Specific Year'),
('Guest Lecture on Quantum Computing', 'Dr. Neil Croft will present on modern quantum computing applications this Thursday at 2 PM in Hall B.', 3, 'All');

-- ----------------------------------------------------------
-- 7. Seed feedback (Sample records)
-- ----------------------------------------------------------
INSERT INTO feedback (student_id, subject, message, status) VALUES
(1, 'GPS Location Range in Campus', 'GPS attendance sometimes fails inside the lower floor computer laboratory.', 'Reviewed'),
(2, 'Library Extended Study Hours', 'Could the college library remain open until 9 PM during exam weeks?', 'New'),
(5, 'Dark Mode in Student Portal', 'Please consider adding dark mode support to the student web interface.', 'New');
