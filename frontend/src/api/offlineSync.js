import apiClient from './apiClient';
import * as localAccounts from './localAccounts';
import { dataURLtoFile, updateLocalUserPhoto } from './photoService';

/**
 * Offline Sync and Local Storage Mirror Wrapper
 *
 * Provides a resilient data layer:
 * 1. Every read/write tries the backend first via apiClient.
 * 2. If the backend is unreachable (offline or standalone Vercel deployment),
 *    actions are queued in localStorage, mirrors are updated, and local data is returned.
 * 3. Provides Haversine geofence calculation offline for student self-marking.
 * 4. Provides `syncPendingData()` to push all queued changes when back online.
 */

// Keys
const KEYS = {
  ADMIN: 'local_admin_records',
  ATTENDANCE: 'local_attendance_records',
  STUDENTS: 'local_students_records',
  FACULTY: 'local_faculty_records',
  HOLIDAYS: 'local_holidays_records',
  NOTICES: 'local_notices_records',
  FEEDBACK: 'local_feedback_records',
  PENDING_ATTENDANCE: 'pending_attendance',
  PENDING_FEEDBACK: 'pending_feedback',
  PENDING_NOTICES: 'pending_notices',
  PENDING_HOLIDAYS: 'pending_holidays',
  PENDING_STUDENTS: 'pending_students',
  PENDING_FACULTY: 'pending_faculty',
  PENDING_PHOTOS: 'pending_photos',
};

// Default Campus Geofence Coordinates
const CAMPUS_CONFIG = {
  latitude: 12.971598,
  longitude: 77.594566,
  radiusMeters: 200.0,
};

// Online/Offline state tracker
let isOnline = false;
let isOffline = true;

export function getIsOnline() {
  return isOnline;
}

export function getOfflineStatus() {
  return isOffline;
}

export function setOnlineStatus(online) {
  isOnline = Boolean(online);
  const offline = !isOnline;
  if (isOffline !== offline) {
    isOffline = offline;
    window.dispatchEvent(
      new CustomEvent('offline-status-change', { detail: { isOffline: offline, isOnline: isOnline } })
    );
  }
}

export function setOfflineStatus(status) {
  setOnlineStatus(!status);
}

/**
 * Startup Health Check:
 * Pings /admin/dashboard-summary on app load with a quick 2-second timeout.
 * Sets the global isOnline flag used upfront across offlineSync.js and Login.jsx.
 * Seeds demo data if backend is unreachable.
 */
export async function checkBackendHealth() {
  try {
    const res = await apiClient.get('/admin/dashboard-summary', { timeout: 2000 });
    if (res.status >= 200 && res.status < 300) {
      setOnlineStatus(true);
      return true;
    }
  } catch (err) {
    // Expected when running standalone or when backend is turned off
  }

  setOnlineStatus(false);
  initializeLocalMirrors();
  localAccounts.initializeDirectories();
  return false;
}

// --------------------------------------------------------------------------
// Initial Seed Data for Local Mirror (for fresh deployments without DB)
// --------------------------------------------------------------------------
function initializeLocalMirrors() {
  if (!localStorage.getItem(KEYS.ADMIN)) {
    const initialAdmin = [
      {
        adminId: 1,
        name: 'System Administrator',
        email: 'admin@attendance.edu',
        passwordPlain: 'admin123',
      },
    ];
    localStorage.setItem(KEYS.ADMIN, JSON.stringify(initialAdmin));
  }

  if (!localStorage.getItem(KEYS.STUDENTS)) {
    const initialStudents = [
      { studentId: 1, rollNumber: 'CS2026001', name: 'Alice Johnson', email: 'alice.johnson@student.edu', passwordPlain: 'student123', department: 'Computer Science', year: 3, section: 'A', phone: '9876543210' },
      { studentId: 2, rollNumber: 'CS2026002', name: 'Bob Smith', email: 'bob.smith@student.edu', passwordPlain: 'student123', department: 'Computer Science', year: 3, section: 'A', phone: '9876543211' },
      { studentId: 3, rollNumber: 'CS2026003', name: 'Charlie Brown', email: 'charlie.brown@student.edu', passwordPlain: 'student123', department: 'Computer Science', year: 3, section: 'B', phone: '9876543212' },
      { studentId: 4, rollNumber: 'CS2026004', name: 'Diana Prince', email: 'diana.prince@student.edu', passwordPlain: 'student123', department: 'Computer Science', year: 2, section: 'A', phone: '9876543213' },
      { studentId: 5, rollNumber: 'IT2026005', name: 'Evan Wright', email: 'evan.wright@student.edu', passwordPlain: 'student123', department: 'Information Technology', year: 2, section: 'A', phone: '9876543214' },
      { studentId: 6, rollNumber: 'IT2026006', name: 'Fiona Gallagher', email: 'fiona.gallagher@student.edu', passwordPlain: 'student123', department: 'Information Technology', year: 4, section: 'B', phone: '9876543215' },
      { studentId: 7, rollNumber: 'EC2026007', name: 'George Clark', email: 'george.clark@student.edu', passwordPlain: 'student123', department: 'Electronics & Communication', year: 1, section: 'A', phone: '9876543216' },
      { studentId: 8, rollNumber: 'EC2026008', name: 'Hannah Abbott', email: 'hannah.abbott@student.edu', passwordPlain: 'student123', department: 'Electronics & Communication', year: 1, section: 'B', phone: '9876543217' },
      { studentId: 9, rollNumber: 'CS2026009', name: 'Ian Malcolm', email: 'ian.malcolm@student.edu', passwordPlain: 'student123', department: 'Computer Science', year: 4, section: 'A', phone: '9876543218' },
      { studentId: 10, rollNumber: 'IT2026010', name: 'Julia Roberts', email: 'julia.roberts@student.edu', passwordPlain: 'student123', department: 'Information Technology', year: 3, section: 'A', phone: '9876543219' },
    ];
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(initialStudents));
  }

  if (!localStorage.getItem(KEYS.ATTENDANCE)) {
    const initialAttendance = [
      { attendanceId: 1, student: { studentId: 1, name: 'Alice Johnson' }, date: '2026-09-01', timeIn: '08:55:00', status: 'Present', markedBy: 'self' },
      { attendanceId: 2, student: { studentId: 2, name: 'Bob Smith' }, date: '2026-09-01', timeIn: '09:15:30', status: 'Late', markedBy: 'self' },
      { attendanceId: 3, student: { studentId: 3, name: 'Charlie Brown' }, date: '2026-09-01', timeIn: null, status: 'Absent', markedBy: 'faculty' },
      { attendanceId: 4, student: { studentId: 4, name: 'Diana Prince' }, date: '2026-09-01', timeIn: '08:50:10', status: 'Present', markedBy: 'faculty' },
      { attendanceId: 5, student: { studentId: 5, name: 'Evan Wright' }, date: '2026-09-01', timeIn: '08:58:45', status: 'Present', markedBy: 'admin' },
    ];
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(initialAttendance));
  }

  if (!localStorage.getItem(KEYS.NOTICES)) {
    const initialNotices = [
      { noticeId: 1, title: 'Mid-Semester Examination Schedule', message: 'The timetable for the upcoming mid-semester examinations has been published on the student portal.', targetAudience: 'All', postedAt: '2026-09-01T10:00:00' },
      { noticeId: 2, title: 'Lab Session Rescheduled', message: 'CS 3rd Year Section A lab session on Friday is moved to Saturday morning at 10:00 AM.', targetAudience: 'Specific Section', postedAt: '2026-09-02T11:30:00' },
      { noticeId: 3, title: 'Annual Inter-College Hackathon 2026', message: 'Annual Inter-College Hackathon registration closes this Friday. All students are encouraged to participate.', targetAudience: 'All', postedAt: '2026-09-03T14:15:00' },
      { noticeId: 4, title: 'Final Year Project Submission Deadline', message: '4th Year students must submit project synopses by September 15th to project guides.', targetAudience: 'Specific Year', postedAt: '2026-09-04T09:00:00' },
      { noticeId: 5, title: 'Guest Lecture on Quantum Computing', message: 'A guest lecture by Dr. Neil Croft will be held on Thursday at 2 PM in Seminar Hall B.', targetAudience: 'All', postedAt: '2026-09-05T16:00:00' },
    ];
    localStorage.setItem(KEYS.NOTICES, JSON.stringify(initialNotices));
  }

  if (!localStorage.getItem(KEYS.HOLIDAYS)) {
    const initialHolidays = [
      { holidayId: 1, date: '2026-01-26', title: 'Republic Day', description: 'National Holiday' },
      { holidayId: 2, date: '2026-08-15', title: 'Independence Day', description: 'National Independence Day' },
      { holidayId: 3, date: '2026-10-02', title: 'Gandhi Jayanti', description: 'National Holiday' },
      { holidayId: 4, date: '2026-11-08', title: 'Diwali', description: 'Festival of Lights' },
      { holidayId: 5, date: '2026-12-25', title: 'Christmas Day', description: 'Winter Break' },
    ];
    localStorage.setItem(KEYS.HOLIDAYS, JSON.stringify(initialHolidays));
  }

  if (!localStorage.getItem(KEYS.FACULTY)) {
    const initialFaculty = [
      { facultyId: 1, name: 'Dr. Alan Turing', email: 'alan.turing@attendance.edu', passwordPlain: 'faculty123', department: 'Computer Science' },
      { facultyId: 2, name: 'Prof. Ada Lovelace', email: 'ada.lovelace@attendance.edu', passwordPlain: 'faculty456', department: 'Information Technology' },
      { facultyId: 3, name: 'Dr. Claude Shannon', email: 'claude.shannon@attendance.edu', passwordPlain: 'faculty789', department: 'Electronics & Communication' },
    ];
    localStorage.setItem(KEYS.FACULTY, JSON.stringify(initialFaculty));
  }

  if (!localStorage.getItem(KEYS.FEEDBACK)) {
    const initialFeedback = [
      { feedbackId: 1, student: { studentId: 1, name: 'Alice Johnson' }, subject: 'GPS Attendance Precision', message: 'GPS attendance fails near lower floor lab.', status: 'Reviewed', submittedAt: '2026-09-02T12:00:00' },
      { feedbackId: 2, student: { studentId: 2, name: 'Bob Smith' }, subject: 'Library Extended Hours', message: 'Can library remain open until 9 PM during exam weeks?', status: 'New', submittedAt: '2026-09-03T15:30:00' },
    ];
    localStorage.setItem(KEYS.FEEDBACK, JSON.stringify(initialFeedback));
  }
}

// Call initialization
initializeLocalMirrors();
checkBackendHealth();

// --------------------------------------------------------------------------
// Helper Functions for Local Storage Access
// --------------------------------------------------------------------------
function getStorage(key, fallback = []) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error('Storage set error:', err);
  }
}

function enqueue(queueKey, actionType, payload) {
  const queue = getStorage(queueKey, []);
  const item = {
    tempId: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    actionType,
    payload,
    timestamp: new Date().toISOString(),
  };
  queue.push(item);
  setStorage(queueKey, queue);
  window.dispatchEvent(new CustomEvent('pending-queue-updated'));
  return item.tempId;
}

// Haversine formula calculation for offline GPS verification
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000.0;
  const dLat = ((lat2 - lat1) * Math.PI) / 180.0;
  const dLon = ((lon2 - lon1) * Math.PI) / 180.0;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180.0) *
      Math.cos((lat2 * Math.PI) / 180.0) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// --------------------------------------------------------------------------
// UNIFIED AUTHENTICATION & REGISTRATION FUNCTIONS
// --------------------------------------------------------------------------

/**
 * Log in a user (Admin, Faculty, Student) with offline fallback.
 */
export async function loginUser(role, email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();

  // Try real backend first if online
  if (isOnline) {
    try {
      const res = await apiClient.post(`/auth/login/${role}`, {
        email: cleanEmail,
        password,
      });
      setOnlineStatus(true);

      // Update local mirror for this user
      if (role === 'admin') {
        const admins = getStorage(KEYS.ADMIN, []);
        const idx = admins.findIndex((a) => a.email && a.email.toLowerCase() === cleanEmail);
        if (idx !== -1) admins[idx] = { ...admins[idx], ...res.data, passwordPlain: password };
        else admins.push({ ...res.data, passwordPlain: password });
        setStorage(KEYS.ADMIN, admins);
      } else if (role === 'faculty') {
        const faculty = getStorage(KEYS.FACULTY, []);
        const idx = faculty.findIndex((f) => f.email && f.email.toLowerCase() === cleanEmail);
        if (idx !== -1) faculty[idx] = { ...faculty[idx], ...res.data, passwordPlain: password };
        else faculty.push({ ...res.data, passwordPlain: password });
        setStorage(KEYS.FACULTY, faculty);
      } else if (role === 'student') {
        const students = getStorage(KEYS.STUDENTS, []);
        const idx = students.findIndex((s) => s.email && s.email.toLowerCase() === cleanEmail);
        if (idx !== -1) students[idx] = { ...students[idx], ...res.data, passwordPlain: password };
        else students.push({ ...res.data, passwordPlain: password });
        setStorage(KEYS.STUDENTS, students);
      }

      return res.data;
    } catch (err) {
      if (err.response && err.response.status === 401) {
        throw new Error(err.response?.data?.message || 'Invalid email or password.');
      }
      setOnlineStatus(false);
    }
  }

  // Backend is offline / standalone — validate against local accounts directory
  if (role === 'student') {
    const match = localAccounts.findStudentByCredentials(cleanEmail, password);
    if (match) {
      return { ...match, _isOffline: true, _fromDirectory: true };
    }
    const students = getStorage(KEYS.STUDENTS, []);
    const stu = students.find((s) => s.email && s.email.trim().toLowerCase() === cleanEmail);
    if (stu && (stu.passwordPlain === password || (!stu.passwordPlain && password === 'student123'))) {
      return { ...stu, _isOffline: true, _fromDirectory: true };
    }
    throw new Error('Invalid credentials or account not yet synced to this device.');
  } else if (role === 'faculty') {
    const match = localAccounts.findFacultyByCredentials(cleanEmail, password);
    if (match) {
      return { ...match, _isOffline: true, _fromDirectory: true };
    }
    const faculty = getStorage(KEYS.FACULTY, []);
    const fac = faculty.find((f) => f.email && f.email.trim().toLowerCase() === cleanEmail);
    if (fac && (fac.passwordPlain === password || (!fac.passwordPlain && password === 'faculty123'))) {
      return { ...fac, _isOffline: true, _fromDirectory: true };
    }
    throw new Error('Invalid credentials or account not yet synced to this device.');
  } else if (role === 'admin') {
    const admins = getStorage(KEYS.ADMIN, []);
    const admin = admins.find((a) => a.email && a.email.trim().toLowerCase() === cleanEmail);
    if (admin && (admin.passwordPlain === password || (!admin.passwordPlain && password === 'admin123'))) {
      return { ...admin, _isOffline: true, _fromDirectory: true };
    }
    if (cleanEmail === 'admin@attendance.edu' && password === 'admin123') {
      return { adminId: 1, name: 'System Administrator', email: cleanEmail, role: 'admin', _isOffline: true, _fromDirectory: true };
    }
    throw new Error('Invalid credentials or account not yet synced to this device.');
  }

  throw new Error('Invalid credentials or account not yet synced to this device.');
}

/**
 * Register a new student with offline fallback.
 */
export async function registerStudentOffline(formData) {
  const cleanEmail = (formData.email || '').trim().toLowerCase();
  const rollNumber = (formData.roll_number || formData.rollNumber || '').trim();

  // Try real backend first if online
  if (isOnline) {
    try {
      const res = await apiClient.post('/auth/register/student', formData);
      setOnlineStatus(true);

      // Add to local students mirror
      const students = getStorage(KEYS.STUDENTS, []);
      const photo = res.data.photoUrl || res.data.photo_url || formData.photoUrl || formData.photo_url || null;
      const savedStudent = {
        ...res.data,
        passwordPlain: formData.password,
        photoUrl: photo,
        photo_url: photo,
      };
      students.unshift(savedStudent);
      setStorage(KEYS.STUDENTS, students);

      // Write into local accounts directory
      localAccounts.addStudent({
        ...res.data,
        password_plain: formData.password,
        photo_url: photo,
      });

      return savedStudent;
    } catch (err) {
      if (err.response && err.response.status === 400) {
        throw new Error(err.response?.data?.message || 'Email or Roll Number is already registered.');
      }
      setOnlineStatus(false);
    }
  }

  // Standalone / Offline Registration
  const students = getStorage(KEYS.STUDENTS, []);

  // Check duplicates locally
  const emailExists = students.some(
    (s) => s.email && s.email.trim().toLowerCase() === cleanEmail
  );
  if (emailExists) {
    throw new Error('Email is already registered in local records.');
  }

  const rollExists = students.some(
    (s) => (s.roll_number || s.rollNumber || '').toLowerCase() === rollNumber.toLowerCase()
  );
  if (rollExists) {
    throw new Error('Roll Number is already registered in local records.');
  }

  const tempId = `local-${Date.now()}`;
  // Queue for future sync
  enqueue(KEYS.PENDING_STUDENTS, 'register-student', { ...formData, tempId });

  const photo = formData.photoUrl || formData.photo_url || null;
  const newStudent = {
    studentId: tempId,
    student_id: tempId,
    name: formData.name,
    email: cleanEmail,
    passwordPlain: formData.password,
    password_plain: formData.password,
    rollNumber: rollNumber,
    roll_number: rollNumber,
    department: formData.department,
    year: formData.year,
    section: formData.section,
    phone: formData.phone || '',
    photoUrl: photo,
    photo_url: photo,
    _isOffline: true,
  };

  students.unshift(newStudent);
  setStorage(KEYS.STUDENTS, students);

  // Save into offline account directory
  localAccounts.addStudent(newStudent);

  return newStudent;
}

// --------------------------------------------------------------------------
// UNIFIED ATTENDANCE FUNCTIONS
// --------------------------------------------------------------------------

/**
 * Mark Attendance (Student self-check-in)
 */
export async function markAttendance(payload) {
  if (isOnline) {
    try {
      const res = await apiClient.post('/attendance/mark', payload);
      setOnlineStatus(true);

      // Update local mirror
      const records = getStorage(KEYS.ATTENDANCE, []);
      const idx = records.findIndex(
        (r) =>
          (r.student?.studentId === payload.studentId || r.studentId === payload.studentId) &&
          r.date === res.data.date
      );
      if (idx !== -1) records[idx] = res.data;
      else records.unshift(res.data);
      setStorage(KEYS.ATTENDANCE, records);

      return res.data;
    } catch (err) {
      setOnlineStatus(false);
    }
  }

  // Queue for sync
  const tempId = enqueue(KEYS.PENDING_ATTENDANCE, 'mark-self', payload);

  // Determine status via Haversine calculation offline
  let finalStatus = 'Present';
  if (!payload.latitude || !payload.longitude) {
    finalStatus = 'Present-OutOfRange';
  } else {
    const dist = calculateDistance(
      CAMPUS_CONFIG.latitude,
      CAMPUS_CONFIG.longitude,
      payload.latitude,
      payload.longitude
    );
    if (dist > CAMPUS_CONFIG.radiusMeters) {
      finalStatus = 'Present-OutOfRange';
    }
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const nowStr = new Date().toTimeString().split(' ')[0];

  // Find student name from local records
  const students = getStorage(KEYS.STUDENTS, []);
  const student = students.find((s) => String(s.studentId) === String(payload.studentId)) || {
    studentId: payload.studentId,
    name: 'Student',
  };

  const offlineRecord = {
    attendanceId: tempId,
    student: student,
    date: todayStr,
    timeIn: nowStr,
    status: finalStatus,
    latitude: payload.latitude,
    longitude: payload.longitude,
    markedBy: 'self',
    _isOffline: true,
  };

  // Update mirror
  const records = getStorage(KEYS.ATTENDANCE, []);
  const existingIndex = records.findIndex(
    (r) =>
      (String(r.student?.studentId) === String(payload.studentId) || String(r.studentId) === String(payload.studentId)) &&
      r.date === todayStr
  );
  if (existingIndex !== -1) records[existingIndex] = offlineRecord;
  else records.unshift(offlineRecord);
  setStorage(KEYS.ATTENDANCE, records);

  return offlineRecord;
}

/**
 * Mark Attendance by Faculty
 */
export async function markAttendanceByFaculty(payload) {
  if (isOnline) {
    try {
      const res = await apiClient.post('/attendance/mark-by-faculty', payload);
      setOnlineStatus(true);

      // Update local mirror
      const records = getStorage(KEYS.ATTENDANCE, []);
      const idx = records.findIndex(
        (r) =>
          (r.student?.studentId === payload.studentId || r.studentId === payload.studentId) &&
          r.date === res.data.date
      );
      if (idx !== -1) records[idx] = res.data;
      else records.unshift(res.data);
      setStorage(KEYS.ATTENDANCE, records);

      return res.data;
    } catch (err) {
      setOnlineStatus(false);
    }
  }

  const tempId = enqueue(KEYS.PENDING_ATTENDANCE, 'mark-by-faculty', payload);
  const students = getStorage(KEYS.STUDENTS, []);
  const student = students.find((s) => String(s.studentId) === String(payload.studentId)) || {
    studentId: payload.studentId,
    name: 'Student',
  };

  const offlineRecord = {
    attendanceId: tempId,
    student: student,
    date: payload.date || new Date().toISOString().split('T')[0],
    timeIn: payload.timeIn || new Date().toTimeString().split(' ')[0],
    status: payload.status,
    markedBy: payload.markedBy || 'faculty',
    _isOffline: true,
  };

  const records = getStorage(KEYS.ATTENDANCE, []);
  const existingIndex = records.findIndex(
    (r) =>
      (String(r.student?.studentId) === String(payload.studentId) || String(r.studentId) === String(payload.studentId)) &&
      r.date === offlineRecord.date
  );
  if (existingIndex !== -1) records[existingIndex] = offlineRecord;
  else records.unshift(offlineRecord);
  setStorage(KEYS.ATTENDANCE, records);

  return offlineRecord;
}

/**
 * Get Student Full Attendance History
 */
export async function getStudentAttendance(studentId) {
  if (isOnline) {
    try {
      const res = await apiClient.get(`/attendance/student/${studentId}`);
      setOnlineStatus(true);
      // Update local mirror
      const current = getStorage(KEYS.ATTENDANCE, []);
      const others = current.filter(
        (r) => String(r.student?.studentId || r.studentId) !== String(studentId)
      );
      setStorage(KEYS.ATTENDANCE, [...res.data, ...others]);
      return res.data;
    } catch (err) {
      setOnlineStatus(false);
    }
  }

  const records = getStorage(KEYS.ATTENDANCE, []);
  return records.filter(
    (r) => String(r.student?.studentId || r.studentId) === String(studentId)
  );
}

/**
 * Get All Attendance (Admin / Faculty view)
 */
export async function getAllAttendance() {
  if (isOnline) {
    try {
      const res = await apiClient.get('/attendance/all');
      setOnlineStatus(true);
      setStorage(KEYS.ATTENDANCE, res.data);
      return res.data;
    } catch (err) {
      setOnlineStatus(false);
    }
  }

  return getStorage(KEYS.ATTENDANCE, []);
}

/**
 * Get Student Attendance for a Specific Month & Year
 */
export async function getStudentAttendanceByMonth(studentId, year, month) {
  if (isOnline) {
    try {
      const res = await apiClient.get(`/attendance/student/${studentId}/month/${year}/${month}`);
      setOnlineStatus(true);
      return res.data;
    } catch (err) {
      setOnlineStatus(false);
    }
  }

  const all = await getStudentAttendance(studentId);
  const formattedMonth = String(month).padStart(2, '0');
  const prefix = `${year}-${formattedMonth}`;
  return all.filter((r) => r.date && r.date.startsWith(prefix));
}

// --------------------------------------------------------------------------
// UNIFIED ADMIN & ROSTER FUNCTIONS
// --------------------------------------------------------------------------

/**
 * Get Dashboard Summary
 */
export async function getDashboardSummary() {
  if (isOnline) {
    try {
      const res = await apiClient.get('/admin/dashboard-summary');
      setOnlineStatus(true);
      return res.data;
    } catch (err) {
      setOnlineStatus(false);
    }
  }

  const students = getStorage(KEYS.STUDENTS, []);
  const faculty = getStorage(KEYS.FACULTY, []);
  const attendance = getStorage(KEYS.ATTENDANCE, []);
  const feedback = getStorage(KEYS.FEEDBACK, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayPresent = attendance.filter(
    (a) => a.date === todayStr && ['Present', 'Late', 'Present-OutOfRange'].includes(a.status)
  ).length;

  const totalStudents = students.length || 10;
  const percentage =
    totalStudents > 0
      ? Math.round(((todayPresent / totalStudents) * 100 * 100) / 100)
      : 0;
  const pendingFeedback = feedback.filter((f) => f.status === 'New').length;

  return {
    totalStudents,
    totalFaculty: faculty.length || 3,
    todayAttendancePercentage: percentage,
    presentTodayCount: todayPresent,
    pendingFeedback,
    _isOffline: true,
  };
}

/**
 * Get Students Roster
 */
export async function getStudents() {
  if (isOnline) {
    try {
      const res = await apiClient.get('/admin/students');
      setOnlineStatus(true);
      if (Array.isArray(res.data)) {
        setStorage(KEYS.STUDENTS, res.data);
        res.data.forEach((s) => {
          localAccounts.addStudent(s);
        });
      }
      return res.data;
    } catch (err) {
      setOnlineStatus(false);
    }
  }

  return getStorage(KEYS.STUDENTS, []);
}

export async function createStudent(payload) {
  if (isOnline) {
    try {
      const res = await apiClient.post('/admin/students', payload);
      setOnlineStatus(true);
      const students = getStorage(KEYS.STUDENTS, []);
      students.unshift(res.data);
      setStorage(KEYS.STUDENTS, students);

      // Write into local accounts directory
      localAccounts.addStudent({
        ...res.data,
        password_plain: payload.passwordPlain || payload.password || 'student123',
      });

      return res.data;
    } catch (err) {
      setOnlineStatus(false);
    }
  }

  // Generate temporary local ID and queue for sync
  const tempId = `local-${Date.now()}`;
  const newStudent = {
    ...payload,
    studentId: tempId,
    student_id: tempId,
    password_plain: payload.passwordPlain || payload.password || 'student123',
    passwordPlain: payload.passwordPlain || payload.password || 'student123',
    _isOffline: true,
  };

  enqueue(KEYS.PENDING_STUDENTS, 'create-student', { ...payload, tempId });

  const students = getStorage(KEYS.STUDENTS, []);
  students.unshift(newStudent);
  setStorage(KEYS.STUDENTS, students);

  // Save into offline account directory
  localAccounts.addStudent(newStudent);

  return newStudent;
}

export async function updateStudent(id, payload) {
  if (isOnline) {
    try {
      const res = await apiClient.put(`/admin/students/${id}`, payload);
      setOnlineStatus(true);
      const students = getStorage(KEYS.STUDENTS, []);
      const idx = students.findIndex((s) => s.studentId === id);
      if (idx !== -1) students[idx] = res.data;
      setStorage(KEYS.STUDENTS, students);

      localAccounts.updateStudent(id, payload);

      return res.data;
    } catch (err) {
      setOnlineStatus(false);
    }
  }

  const students = getStorage(KEYS.STUDENTS, []);
  const idx = students.findIndex((s) => s.studentId === id);
  if (idx !== -1) {
    students[idx] = { ...students[idx], ...payload, _isOffline: true };
    setStorage(KEYS.STUDENTS, students);
    localAccounts.updateStudent(id, payload);
    return students[idx];
  }
  localAccounts.updateStudent(id, payload);
  return payload;
}

export async function deleteStudent(id) {
  if (isOnline) {
    try {
      const res = await apiClient.delete(`/admin/students/${id}`);
      setOnlineStatus(true);
      const students = getStorage(KEYS.STUDENTS, []).filter((s) => s.studentId !== id);
      setStorage(KEYS.STUDENTS, students);

      localAccounts.deleteStudent(id);

      return res.data;
    } catch (err) {
      setOnlineStatus(false);
    }
  }

  const students = getStorage(KEYS.STUDENTS, []).filter((s) => s.studentId !== id);
  setStorage(KEYS.STUDENTS, students);

  localAccounts.deleteStudent(id);

  return { success: true };
}

export async function getFaculty() {
  if (isOnline) {
    try {
      const res = await apiClient.get('/admin/faculty');
      setOnlineStatus(true);
      setStorage(KEYS.FACULTY, res.data);
      return res.data;
    } catch (err) {
      setOnlineStatus(false);
    }
  }

  return getStorage(KEYS.FACULTY, []);
}

export async function createFaculty(payload) {
  if (isOnline) {
    try {
      const res = await apiClient.post('/admin/faculty', payload);
      setOnlineStatus(true);
      const faculty = getStorage(KEYS.FACULTY, []);
      faculty.unshift(res.data);
      setStorage(KEYS.FACULTY, faculty);

      // Write into local accounts directory
      localAccounts.addFaculty({
        ...res.data,
        password_plain: payload.passwordPlain || payload.password || 'faculty123',
      });

      return res.data;
    } catch (err) {
      setOnlineStatus(false);
    }
  }

  const tempId = `local-${Date.now()}`;
  const newFaculty = {
    ...payload,
    facultyId: tempId,
    faculty_id: tempId,
    password_plain: payload.passwordPlain || payload.password || 'faculty123',
    passwordPlain: payload.passwordPlain || payload.password || 'faculty123',
    _isOffline: true,
  };

  enqueue(KEYS.PENDING_FACULTY, 'create-faculty', { ...payload, tempId });

  const faculty = getStorage(KEYS.FACULTY, []);
  faculty.unshift(newFaculty);
  setStorage(KEYS.FACULTY, faculty);

  localAccounts.addFaculty(newFaculty);

  return newFaculty;
}

export async function updateFaculty(id, payload) {
  if (isOnline) {
    try {
      const res = await apiClient.put(`/admin/faculty/${id}`, payload);
      setOnlineStatus(true);
      const faculty = getStorage(KEYS.FACULTY, []);
      const idx = faculty.findIndex((f) => f.facultyId === id);
      if (idx !== -1) faculty[idx] = res.data;
      setStorage(KEYS.FACULTY, faculty);

      localAccounts.updateFaculty(id, payload);

      return res.data;
    } catch (err) {
      setOnlineStatus(false);
    }
  }

  const faculty = getStorage(KEYS.FACULTY, []);
  const idx = faculty.findIndex((f) => f.facultyId === id);
  if (idx !== -1) {
    faculty[idx] = { ...faculty[idx], ...payload, _isOffline: true };
    setStorage(KEYS.FACULTY, faculty);
    localAccounts.updateFaculty(id, payload);
    return faculty[idx];
  }
  localAccounts.updateFaculty(id, payload);
  return payload;
}

export async function deleteFaculty(id) {
  if (isOnline) {
    try {
      const res = await apiClient.delete(`/admin/faculty/${id}`);
      setOnlineStatus(true);
      const faculty = getStorage(KEYS.FACULTY, []).filter((f) => f.facultyId !== id);
      setStorage(KEYS.FACULTY, faculty);

      localAccounts.deleteFaculty(id);

      return res.data;
    } catch (err) {
      setOnlineStatus(false);
    }
  }

  const faculty = getStorage(KEYS.FACULTY, []).filter((f) => f.facultyId !== id);
  setStorage(KEYS.FACULTY, faculty);

  localAccounts.deleteFaculty(id);

  return { success: true };
}

// --------------------------------------------------------------------------
// UNIFIED NOTICES FUNCTIONS
// --------------------------------------------------------------------------

export async function getNotices() {
  if (isOnline) {
    try {
      const res = await apiClient.get('/notices');
      setOnlineStatus(true);
      setStorage(KEYS.NOTICES, res.data);
      return res.data;
    } catch (err) {
      setOnlineStatus(false);
    }
  }

  return getStorage(KEYS.NOTICES, []);
}

export async function postNotice(payload) {
  if (isOnline) {
    try {
      const res = await apiClient.post('/notices', payload);
      setOnlineStatus(true);
      const notices = getStorage(KEYS.NOTICES, []);
      notices.unshift(res.data);
      setStorage(KEYS.NOTICES, notices);
      return res.data;
    } catch (err) {
      setOnlineStatus(false);
    }
  }

  const tempId = enqueue(KEYS.PENDING_NOTICES, 'post-notice', payload);

  const offlineNotice = {
    noticeId: tempId,
    title: payload.title,
    message: payload.message,
    targetAudience: payload.targetAudience || 'All',
    postedAt: new Date().toISOString(),
    _isOffline: true,
  };

  const notices = getStorage(KEYS.NOTICES, []);
  notices.unshift(offlineNotice);
  setStorage(KEYS.NOTICES, notices);
  return offlineNotice;
}

/**
 * Get notices filtered by student year and section
 */
export async function getNoticesForAudience(year, section) {
  if (isOnline) {
    try {
      const res = await apiClient.get(`/notices/audience/${year}/${section}`);
      setOnlineStatus(true);
      return res.data;
    } catch (err) {
      setOnlineStatus(false);
    }
  }

  const all = getStorage(KEYS.NOTICES, []);
  return all.filter((n) => {
    if (!n.targetAudience || n.targetAudience === 'All') return true;
    if (n.targetAudience === 'Specific Year' && n.targetYear && Number(n.targetYear) === Number(year)) return true;
    if (n.targetAudience === 'Specific Section' && n.targetSection && n.targetSection.toUpperCase() === String(section).toUpperCase()) return true;
    return true;
  });
}

// --------------------------------------------------------------------------
// UNIFIED FEEDBACK FUNCTIONS
// --------------------------------------------------------------------------

export async function submitFeedback(payload) {
  if (isOnline) {
    try {
      const res = await apiClient.post('/feedback', payload);
      setOnlineStatus(true);
      const list = getStorage(KEYS.FEEDBACK, []);
      list.unshift(res.data);
      setStorage(KEYS.FEEDBACK, list);
      return res.data;
    } catch (err) {
      setOnlineStatus(false);
    }
  }

  const tempId = enqueue(KEYS.PENDING_FEEDBACK, 'submit-feedback', payload);

  const offlineFeedback = {
    feedbackId: tempId,
    student: { studentId: payload.studentId },
    subject: payload.subject,
    message: payload.message,
    status: 'New',
    submittedAt: new Date().toISOString(),
    _isOffline: true,
  };

  const list = getStorage(KEYS.FEEDBACK, []);
  list.unshift(offlineFeedback);
  setStorage(KEYS.FEEDBACK, list);
  return offlineFeedback;
}

export async function getAllFeedback() {
  if (isOnline) {
    try {
      const res = await apiClient.get('/feedback');
      setOnlineStatus(true);
      setStorage(KEYS.FEEDBACK, res.data);
      return res.data;
    } catch (err) {
      setOnlineStatus(false);
    }
  }

  return getStorage(KEYS.FEEDBACK, []);
}

export async function updateFeedbackStatus(id, status = 'Reviewed') {
  if (isOnline) {
    try {
      const res = await apiClient.put(`/feedback/${id}/status`, { status });
      setOnlineStatus(true);
      const list = getStorage(KEYS.FEEDBACK, []);
      const idx = list.findIndex((f) => f.feedbackId === id);
      if (idx !== -1) list[idx] = res.data;
      setStorage(KEYS.FEEDBACK, list);
      return res.data;
    } catch (err) {
      setOnlineStatus(false);
    }
  }

  const list = getStorage(KEYS.FEEDBACK, []);
  const idx = list.findIndex((f) => f.feedbackId === id);
  if (idx !== -1) {
    list[idx].status = status;
    setStorage(KEYS.FEEDBACK, list);
  }
  return list[idx] || { feedbackId: id, status };
}

// --------------------------------------------------------------------------
// UNIFIED HOLIDAYS FUNCTIONS
// --------------------------------------------------------------------------

export async function getHolidays() {
  if (isOnline) {
    try {
      const res = await apiClient.get('/holidays');
      setOnlineStatus(true);
      setStorage(KEYS.HOLIDAYS, res.data);
      return res.data;
    } catch (err) {
      setOnlineStatus(false);
    }
  }

  return getStorage(KEYS.HOLIDAYS, []);
}

export async function addHoliday(payload) {
  if (isOnline) {
    try {
      const res = await apiClient.post('/holidays', payload);
      setOnlineStatus(true);
      const list = getStorage(KEYS.HOLIDAYS, []);
      list.push(res.data);
      setStorage(KEYS.HOLIDAYS, list);
      return res.data;
    } catch (err) {
      setOnlineStatus(false);
    }
  }

  const tempId = enqueue(KEYS.PENDING_HOLIDAYS, 'add-holiday', payload);
  const offlineHoliday = {
    holidayId: tempId,
    date: payload.date,
    title: payload.title,
    description: payload.description,
    _isOffline: true,
  };
  const list = getStorage(KEYS.HOLIDAYS, []);
  list.push(offlineHoliday);
  setStorage(KEYS.HOLIDAYS, list);
  return offlineHoliday;
}

export async function deleteHoliday(id) {
  if (isOnline) {
    try {
      const res = await apiClient.delete(`/holidays/${id}`);
      setOnlineStatus(true);
      const list = getStorage(KEYS.HOLIDAYS, []).filter((h) => h.holidayId !== id);
      setStorage(KEYS.HOLIDAYS, list);
      return res.data;
    } catch (err) {
      setOnlineStatus(false);
    }
  }

  const list = getStorage(KEYS.HOLIDAYS, []).filter((h) => h.holidayId !== id);
  setStorage(KEYS.HOLIDAYS, list);
  return { success: true };
}

// --------------------------------------------------------------------------
// PENDING COUNTS & MANUAL SYNC NOW FUNCTION
// --------------------------------------------------------------------------

export function getPendingCounts() {
  const att = getStorage(KEYS.PENDING_ATTENDANCE, []).length;
  const fb = getStorage(KEYS.PENDING_FEEDBACK, []).length;
  const not = getStorage(KEYS.PENDING_NOTICES, []).length;
  const hol = getStorage(KEYS.PENDING_HOLIDAYS, []).length;
  const stu = getStorage(KEYS.PENDING_STUDENTS, []).length;
  const fac = getStorage(KEYS.PENDING_FACULTY, []).length;
  return {
    attendance: att,
    feedback: fb,
    notices: not,
    holidays: hol,
    students: stu,
    faculty: fac,
    total: att + fb + not + hol + stu + fac,
  };
}

/**
 * Manual "Sync Now" function.
 * Attempts to POST all queued actions to the backend and clears the queue on success.
 */
export async function syncPendingData() {
  const summary = {
    syncedAttendance: 0,
    syncedFeedback: 0,
    syncedNotices: 0,
    syncedHolidays: 0,
    syncedStudents: 0,
    syncedFaculty: 0,
    failedItems: 0,
    errors: [],
  };

  // 1. Sync Pending Attendance
  const pendingAttendance = getStorage(KEYS.PENDING_ATTENDANCE, []);
  const remainingAttendance = [];
  for (const item of pendingAttendance) {
    try {
      if (item.actionType === 'mark-by-faculty') {
        await apiClient.post('/attendance/mark-by-faculty', item.payload);
      } else {
        await apiClient.post('/attendance/mark', item.payload);
      }
      summary.syncedAttendance++;
    } catch (err) {
      remainingAttendance.push(item);
      summary.failedItems++;
      summary.errors.push(`Attendance sync error: ${err.message}`);
    }
  }
  setStorage(KEYS.PENDING_ATTENDANCE, remainingAttendance);

  // 2. Sync Pending Feedback
  const pendingFeedback = getStorage(KEYS.PENDING_FEEDBACK, []);
  const remainingFeedback = [];
  for (const item of pendingFeedback) {
    try {
      await apiClient.post('/feedback', item.payload);
      summary.syncedFeedback++;
    } catch (err) {
      remainingFeedback.push(item);
      summary.failedItems++;
      summary.errors.push(`Feedback sync error: ${err.message}`);
    }
  }
  setStorage(KEYS.PENDING_FEEDBACK, remainingFeedback);

  // 3. Sync Pending Notices
  const pendingNotices = getStorage(KEYS.PENDING_NOTICES, []);
  const remainingNotices = [];
  for (const item of pendingNotices) {
    try {
      await apiClient.post('/notices', item.payload);
      summary.syncedNotices++;
    } catch (err) {
      remainingNotices.push(item);
      summary.failedItems++;
      summary.errors.push(`Notice sync error: ${err.message}`);
    }
  }
  setStorage(KEYS.PENDING_NOTICES, remainingNotices);

  // 4. Sync Pending Holidays
  const pendingHolidays = getStorage(KEYS.PENDING_HOLIDAYS, []);
  const remainingHolidays = [];
  for (const item of pendingHolidays) {
    try {
      await apiClient.post('/holidays', item.payload);
      summary.syncedHolidays++;
    } catch (err) {
      remainingHolidays.push(item);
      summary.failedItems++;
      summary.errors.push(`Holiday sync error: ${err.message}`);
    }
  }
  setStorage(KEYS.PENDING_HOLIDAYS, remainingHolidays);

  // 5. Sync Pending Student Registrations & Admin Creations
  const pendingStudents = getStorage(KEYS.PENDING_STUDENTS, []);
  const remainingStudents = [];
  for (const item of pendingStudents) {
    try {
      let res;
      if (item.actionType === 'create-student') {
        res = await apiClient.post('/admin/students', item.payload);
      } else {
        res = await apiClient.post('/auth/register/student', item.payload);
      }
      // Reconcile temporary ID if generated offline
      const tempId = item.payload?.tempId || item.tempId;
      const realId = res?.data?.studentId || res?.data?.student_id;
      if (tempId && realId) {
        localAccounts.reconcileStudentId(tempId, realId);
      }
      summary.syncedStudents++;
    } catch (err) {
      remainingStudents.push(item);
      summary.failedItems++;
      summary.errors.push(`Student registration sync error: ${err.message}`);
    }
  }
  setStorage(KEYS.PENDING_STUDENTS, remainingStudents);

  // 6. Sync Pending Faculty Creations
  const pendingFaculty = getStorage(KEYS.PENDING_FACULTY, []);
  const remainingFaculty = [];
  for (const item of pendingFaculty) {
    try {
      const res = await apiClient.post('/admin/faculty', item.payload);
      // Reconcile temporary ID if generated offline
      const tempId = item.payload?.tempId || item.tempId;
      const realId = res?.data?.facultyId || res?.data?.faculty_id;
      if (tempId && realId) {
        localAccounts.reconcileFacultyId(tempId, realId);
      }
      summary.syncedFaculty++;
    } catch (err) {
      remainingFaculty.push(item);
      summary.failedItems++;
      summary.errors.push(`Faculty sync error: ${err.message}`);
    }
  }
  setStorage(KEYS.PENDING_FACULTY, remainingFaculty);

  // 7. Sync Pending Profile Photos
  const pendingPhotos = getStorage(KEYS.PENDING_PHOTOS, []);
  const remainingPhotos = [];
  summary.syncedPhotos = 0;
  for (const item of pendingPhotos) {
    try {
      if (item.base64) {
        const file = dataURLtoFile(item.base64, item.filename || `${item.userType}_${item.userId}.jpg`);
        if (file) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('userType', item.userType || 'student');
          formData.append('userId', String(item.userId || '0'));

          const uploadRes = await apiClient.post('/upload/photo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          const serverPhotoUrl = uploadRes.data?.photoUrl;
          if (serverPhotoUrl) {
            const endpoint =
              item.userType === 'faculty'
                ? `/admin/faculty/${item.userId}/photo`
                : `/admin/students/${item.userId}/photo`;
            try {
              await apiClient.put(endpoint, { photoUrl: serverPhotoUrl });
            } catch (err) {
              // non-fatal
            }
            updateLocalUserPhoto(item.userType, item.userId, serverPhotoUrl);
          }
        }
      }
      summary.syncedPhotos++;
    } catch (err) {
      remainingPhotos.push(item);
      summary.failedItems++;
      summary.errors.push(`Photo upload sync error: ${err.message}`);
    }
  }
  setStorage(KEYS.PENDING_PHOTOS, remainingPhotos);

  // If items succeeded and none failed, we are cleanly online
  const totalSynced =
    summary.syncedAttendance +
    summary.syncedFeedback +
    summary.syncedNotices +
    summary.syncedHolidays +
    summary.syncedStudents +
    summary.syncedFaculty +
    (summary.syncedPhotos || 0);

  if (summary.failedItems === 0 && totalSynced > 0) {
    setOnlineStatus(true);
  }

  window.dispatchEvent(new CustomEvent('pending-queue-updated'));
  window.dispatchEvent(new CustomEvent('sync-completed', { detail: summary }));

  return summary;
}
