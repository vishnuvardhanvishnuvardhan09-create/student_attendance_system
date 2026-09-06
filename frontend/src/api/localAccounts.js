/**
 * Local Accounts Directory (localStorage-backed)
 *
 * Provides client-side account storage for offline authentication fallback:
 * - "local_students_directory": array of { student_id, roll_number, name, email, password_plain, department, year, section, phone, photo_url }
 * - "local_faculty_directory": array of { faculty_id, name, email, password_plain, department }
 *
 * NOTE ON OFFLINE ARCHITECTURE / CONSTRAINTS:
 * A student or faculty account created on the ADMIN's device will only be loginable
 * offline on that SAME device/browser, since browser localStorage is isolated per
 * origin and per client machine. This is a known architectural characteristic of
 * client-side offline mode without a distributed P2P sync mechanism, not a bug.
 * Once the admin syncs with the live MySQL backend, all devices can log in online.
 */

export const DIRECTORY_KEYS = {
  STUDENTS: 'local_students_directory',
  FACULTY: 'local_faculty_directory',
};

// Initial Seed Students for fresh browser instances
const DEFAULT_STUDENTS_SEED = [
  {
    student_id: 1,
    roll_number: 'CS2026001',
    name: 'Alice Johnson',
    email: 'alice.johnson@student.edu',
    password_plain: 'student123',
    department: 'Computer Science',
    year: 3,
    section: 'A',
    phone: '9876543210',
    photo_url: '',
  },
  {
    student_id: 2,
    roll_number: 'CS2026002',
    name: 'Bob Smith',
    email: 'bob.smith@student.edu',
    password_plain: 'student123',
    department: 'Computer Science',
    year: 3,
    section: 'A',
    phone: '9876543211',
    photo_url: '',
  },
  {
    student_id: 3,
    roll_number: 'CS2026003',
    name: 'Charlie Brown',
    email: 'charlie.brown@student.edu',
    password_plain: 'student123',
    department: 'Computer Science',
    year: 3,
    section: 'B',
    phone: '9876543212',
    photo_url: '',
  },
  {
    student_id: 4,
    roll_number: 'CS2026004',
    name: 'Diana Prince',
    email: 'diana.prince@student.edu',
    password_plain: 'student123',
    department: 'Computer Science',
    year: 2,
    section: 'A',
    phone: '9876543213',
    photo_url: '',
  },
  {
    student_id: 5,
    roll_number: 'IT2026005',
    name: 'Evan Wright',
    email: 'evan.wright@student.edu',
    password_plain: 'student123',
    department: 'Information Technology',
    year: 2,
    section: 'A',
    phone: '9876543214',
    photo_url: '',
  },
  {
    student_id: 6,
    roll_number: 'IT2026006',
    name: 'Fiona Gallagher',
    email: 'fiona.gallagher@student.edu',
    password_plain: 'student123',
    department: 'Information Technology',
    year: 4,
    section: 'B',
    phone: '9876543215',
    photo_url: '',
  },
  {
    student_id: 7,
    roll_number: 'EC2026007',
    name: 'George Clark',
    email: 'george.clark@student.edu',
    password_plain: 'student123',
    department: 'Electronics & Communication',
    year: 1,
    section: 'A',
    phone: '9876543216',
    photo_url: '',
  },
  {
    student_id: 8,
    roll_number: 'EC2026008',
    name: 'Hannah Abbott',
    email: 'hannah.abbott@student.edu',
    password_plain: 'student123',
    department: 'Electronics & Communication',
    year: 1,
    section: 'B',
    phone: '9876543217',
    photo_url: '',
  },
  {
    student_id: 9,
    roll_number: 'CS2026009',
    name: 'Ian Malcolm',
    email: 'ian.malcolm@student.edu',
    password_plain: 'student123',
    department: 'Computer Science',
    year: 4,
    section: 'A',
    phone: '9876543218',
    photo_url: '',
  },
  {
    student_id: 10,
    roll_number: 'IT2026010',
    name: 'Julia Roberts',
    email: 'julia.roberts@student.edu',
    password_plain: 'student123',
    department: 'Information Technology',
    year: 3,
    section: 'A',
    phone: '9876543219',
    photo_url: '',
  },
];

// Initial Seed Faculty for fresh browser instances
const DEFAULT_FACULTY_SEED = [
  {
    faculty_id: 1,
    name: 'Dr. Alan Turing',
    email: 'alan.turing@attendance.edu',
    password_plain: 'faculty123',
    department: 'Computer Science',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
  },
  {
    faculty_id: 2,
    name: 'Prof. Ada Lovelace',
    email: 'ada.lovelace@attendance.edu',
    password_plain: 'faculty456',
    department: 'Information Technology',
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
  },
  {
    faculty_id: 3,
    name: 'Dr. Claude Shannon',
    email: 'claude.shannon@attendance.edu',
    password_plain: 'faculty789',
    department: 'Electronics & Communication',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
  },
];

function getDirectory(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading directory ${key}:`, err);
    return fallback;
  }
}

function setDirectory(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving directory ${key}:`, err);
  }
}

// Ensure initial seeds are loaded
export function initializeDirectories() {
  const currentStudents = getDirectory(DIRECTORY_KEYS.STUDENTS, []);
  if (currentStudents.length === 0) {
    localStorage.setItem(DIRECTORY_KEYS.STUDENTS, JSON.stringify(DEFAULT_STUDENTS_SEED));
  } else {
    // Ensure all default demo students exist by email or roll_number
    DEFAULT_STUDENTS_SEED.forEach((seed) => {
      const exists = currentStudents.some(
        (s) => (s.email && s.email.toLowerCase() === seed.email.toLowerCase()) ||
               (seed.roll_number && (s.roll_number || s.rollNumber || '').toLowerCase() === seed.roll_number.toLowerCase())
      );
      if (!exists) currentStudents.push({ ...seed });
    });
    localStorage.setItem(DIRECTORY_KEYS.STUDENTS, JSON.stringify(currentStudents));
  }

  const currentFaculty = getDirectory(DIRECTORY_KEYS.FACULTY, []);
  if (currentFaculty.length === 0) {
    localStorage.setItem(DIRECTORY_KEYS.FACULTY, JSON.stringify(DEFAULT_FACULTY_SEED));
  } else {
    DEFAULT_FACULTY_SEED.forEach((seed) => {
      const exists = currentFaculty.some(
        (f) => f.email && f.email.toLowerCase() === seed.email.toLowerCase()
      );
      if (!exists) currentFaculty.push({ ...seed });
    });
    localStorage.setItem(DIRECTORY_KEYS.FACULTY, JSON.stringify(currentFaculty));
  }
}

initializeDirectories();

// --------------------------------------------------------------------------
// STUDENT DIRECTORY OPERATIONS
// --------------------------------------------------------------------------

export function getStudentsDirectory() {
  return getDirectory(DIRECTORY_KEYS.STUDENTS, DEFAULT_STUDENTS_SEED);
}

/**
 * Add or update student in the local offline directory.
 * Avoids duplicates by matching on student_id, roll_number, or email.
 */
export function addStudent(record) {
  const directory = getStudentsDirectory();

  const studentId = record.student_id || record.studentId;
  const rollNumber = (record.roll_number || record.rollNumber || '').trim();
  const email = (record.email || '').trim().toLowerCase();

  const normalized = {
    student_id: studentId,
    studentId: studentId, // maintain property interoperability
    roll_number: rollNumber,
    rollNumber: rollNumber,
    name: record.name,
    email: email,
    password_plain: record.password_plain || record.passwordPlain || record.password || 'student123',
    passwordPlain: record.password_plain || record.passwordPlain || record.password || 'student123',
    department: record.department || 'Computer Science',
    year: Number(record.year) || 1,
    section: record.section || 'A',
    phone: record.phone || '',
    photo_url: record.photo_url || record.photoUrl || '',
  };

  const existingIndex = directory.findIndex(
    (s) =>
      (studentId && (s.student_id === studentId || s.studentId === studentId)) ||
      (email && s.email && s.email.toLowerCase() === email) ||
      (rollNumber && (s.roll_number || s.rollNumber || '').toLowerCase() === rollNumber.toLowerCase())
  );

  if (existingIndex !== -1) {
    directory[existingIndex] = { ...directory[existingIndex], ...normalized };
  } else {
    directory.unshift(normalized);
  }

  setDirectory(DIRECTORY_KEYS.STUDENTS, directory);
  return normalized;
}

export function updateStudent(studentId, updatedFields) {
  const directory = getStudentsDirectory();
  const idx = directory.findIndex(
    (s) => s.student_id === studentId || s.studentId === studentId
  );
  if (idx !== -1) {
    directory[idx] = {
      ...directory[idx],
      ...updatedFields,
      student_id: studentId,
      studentId: studentId,
    };
    setDirectory(DIRECTORY_KEYS.STUDENTS, directory);
    return directory[idx];
  }
  return null;
}

export function deleteStudent(studentId) {
  const directory = getStudentsDirectory().filter(
    (s) => s.student_id !== studentId && s.studentId !== studentId
  );
  setDirectory(DIRECTORY_KEYS.STUDENTS, directory);
}

/**
 * Reconcile temporary local student ID with official backend MySQL ID after sync.
 */
export function reconcileStudentId(tempId, realId) {
  const directory = getStudentsDirectory();
  const idx = directory.findIndex(
    (s) => s.student_id === tempId || s.studentId === tempId
  );
  if (idx !== -1) {
    directory[idx].student_id = realId;
    directory[idx].studentId = realId;
    setDirectory(DIRECTORY_KEYS.STUDENTS, directory);
  }
}

/**
 * Find student in directory by email or roll number, and password.
 * Checks local accounts directory, attendance_students mirror, and hardcoded demo seeds.
 */
export function findStudentByCredentials(identifier, passwordPlain) {
  if (!identifier) return null;
  const cleanId = String(identifier).trim().toLowerCase();
  const cleanPass = passwordPlain != null ? String(passwordPlain).trim() : '';

  const matchCandidate = (s) => {
    const emailMatch = s.email && s.email.trim().toLowerCase() === cleanId;
    const rollMatch = (s.roll_number || s.rollNumber || '').trim().toLowerCase() === cleanId;
    if (!emailMatch && !rollMatch) return false;

    // Password validation
    const pass = s.password_plain || s.passwordPlain || s.password;
    if (pass) {
      return String(pass).trim() === cleanPass;
    }
    // Fallback: if student record had no password saved (e.g. from backend read), allow 'student123'
    return cleanPass === 'student123' || !cleanPass;
  };

  // 1. Search in local_students_directory
  const directory = getStudentsDirectory();
  let found = directory.find(matchCandidate);
  if (found) {
    return {
      ...found,
      studentId: found.student_id || found.studentId,
      student_id: found.student_id || found.studentId,
      rollNumber: found.roll_number || found.rollNumber,
      roll_number: found.roll_number || found.rollNumber,
    };
  }

  // 2. Search in attendance_students (local mirror)
  try {
    const mirror = JSON.parse(localStorage.getItem('attendance_students') || '[]');
    found = mirror.find(matchCandidate);
    if (found) {
      return {
        ...found,
        studentId: found.student_id || found.studentId,
        student_id: found.student_id || found.studentId,
        rollNumber: found.roll_number || found.rollNumber,
        roll_number: found.roll_number || found.rollNumber,
      };
    }
  } catch (err) {
    console.warn('Error reading attendance_students mirror:', err);
  }

  // 3. Fallback to DEFAULT_STUDENTS_SEED (guarantees offline login for all demo accounts)
  found = DEFAULT_STUDENTS_SEED.find(matchCandidate);
  if (found) {
    return {
      ...found,
      studentId: found.student_id || found.studentId,
      student_id: found.student_id || found.studentId,
      rollNumber: found.roll_number || found.rollNumber,
      roll_number: found.roll_number || found.rollNumber,
    };
  }

  return null;
}

// --------------------------------------------------------------------------
// FACULTY DIRECTORY OPERATIONS
// --------------------------------------------------------------------------

export function getFacultyDirectory() {
  return getDirectory(DIRECTORY_KEYS.FACULTY, DEFAULT_FACULTY_SEED);
}

/**
 * Add or update faculty in the local offline directory.
 */
export function addFaculty(record) {
  const directory = getFacultyDirectory();

  const facultyId = record.faculty_id || record.facultyId;
  const email = (record.email || '').trim().toLowerCase();

  const normalized = {
    faculty_id: facultyId,
    facultyId: facultyId,
    name: record.name,
    email: email,
    password_plain: record.password_plain || record.passwordPlain || record.password || 'faculty123',
    passwordPlain: record.password_plain || record.passwordPlain || record.password || 'faculty123',
    department: record.department || 'Computer Science',
  };

  const existingIndex = directory.findIndex(
    (f) =>
      (facultyId && (f.faculty_id === facultyId || f.facultyId === facultyId)) ||
      (email && f.email && f.email.toLowerCase() === email)
  );

  if (existingIndex !== -1) {
    directory[existingIndex] = { ...directory[existingIndex], ...normalized };
  } else {
    directory.unshift(normalized);
  }

  setDirectory(DIRECTORY_KEYS.FACULTY, directory);
  return normalized;
}

export function updateFaculty(facultyId, updatedFields) {
  const directory = getFacultyDirectory();
  const idx = directory.findIndex(
    (f) => f.faculty_id === facultyId || f.facultyId === facultyId
  );
  if (idx !== -1) {
    directory[idx] = {
      ...directory[idx],
      ...updatedFields,
      faculty_id: facultyId,
      facultyId: facultyId,
    };
    setDirectory(DIRECTORY_KEYS.FACULTY, directory);
    return directory[idx];
  }
  return null;
}

export function deleteFaculty(facultyId) {
  const directory = getFacultyDirectory().filter(
    (f) => f.faculty_id !== facultyId && f.facultyId !== facultyId
  );
  setDirectory(DIRECTORY_KEYS.FACULTY, directory);
}

/**
 * Reconcile temporary local faculty ID with official backend MySQL ID after sync.
 */
export function reconcileFacultyId(tempId, realId) {
  const directory = getFacultyDirectory();
  const idx = directory.findIndex(
    (f) => f.faculty_id === tempId || f.facultyId === tempId
  );
  if (idx !== -1) {
    directory[idx].faculty_id = realId;
    directory[idx].facultyId = realId;
    setDirectory(DIRECTORY_KEYS.FACULTY, directory);
  }
}

/**
 * Find faculty in directory by email and password.
 * Checks local accounts directory, attendance_faculty mirror, and hardcoded demo seeds.
 */
export function findFacultyByCredentials(email, passwordPlain) {
  if (!email) return null;
  const cleanEmail = String(email).trim().toLowerCase();
  const cleanPass = passwordPlain != null ? String(passwordPlain).trim() : '';

  const matchCandidate = (f) => {
    const emailMatch = f.email && f.email.trim().toLowerCase() === cleanEmail;
    if (!emailMatch) return false;

    const pass = f.password_plain || f.passwordPlain || f.password;
    if (pass) {
      return String(pass).trim() === cleanPass;
    }
    return cleanPass === 'faculty123' || !cleanPass;
  };

  // 1. Search in local_faculty_directory
  const directory = getFacultyDirectory();
  let found = directory.find(matchCandidate);
  if (found) {
    return {
      ...found,
      facultyId: found.faculty_id || found.facultyId,
      faculty_id: found.faculty_id || found.facultyId,
    };
  }

  // 2. Search in attendance_faculty mirror
  try {
    const mirror = JSON.parse(localStorage.getItem('attendance_faculty') || '[]');
    found = mirror.find(matchCandidate);
    if (found) {
      return {
        ...found,
        facultyId: found.faculty_id || found.facultyId,
        faculty_id: found.faculty_id || found.facultyId,
      };
    }
  } catch (err) {
    console.warn('Error reading attendance_faculty mirror:', err);
  }

  // 3. Fallback to DEFAULT_FACULTY_SEED
  found = DEFAULT_FACULTY_SEED.find(matchCandidate);
  if (found) {
    return {
      ...found,
      facultyId: found.faculty_id || found.facultyId,
      faculty_id: found.faculty_id || found.facultyId,
    };
  }

  return null;
}

export default {
  DIRECTORY_KEYS,
  initializeDirectories,
  getStudentsDirectory,
  addStudent,
  updateStudent,
  deleteStudent,
  reconcileStudentId,
  findStudentByCredentials,
  getFacultyDirectory,
  addFaculty,
  updateFaculty,
  deleteFaculty,
  reconcileFacultyId,
  findFacultyByCredentials,
};
