import apiClient from './apiClient';
import * as localAccounts from './localAccounts';

/**
 * Resolves a photo URL to a valid displayable source:
 * - Data URLs (base64) returned as-is
 * - Full http/https URLs returned as-is
 * - Relative backend paths (e.g. /uploads/photos/...) prepended with the server host
 */
export function resolvePhotoUrl(photoUrl) {
  if (!photoUrl || typeof photoUrl !== 'string') return '';
  const trimmed = photoUrl.trim();
  if (!trimmed) return '';

  if (
    trimmed.startsWith('data:image') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  const isCloudWithoutBackend =
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1' &&
    (!import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL.includes('localhost'));

  if (isCloudWithoutBackend) {
    return '';
  }

  const rawBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
  const serverBase = rawBase.replace(/\/api\/?$/, '');
  return `${serverBase}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
}

/**
 * Convert a File or Blob into a Base64 data URL.
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Convert a Base64 data URL back into a standard File for upload.
 */
export function dataURLtoFile(dataurl, filename = 'photo.jpg') {
  try {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  } catch (err) {
    console.error('Error converting dataURL to file:', err);
    return null;
  }
}

/**
 * Update photo URL in all relevant local storage stores:
 * - localAccounts directories (local_students_directory / local_faculty_directory)
 * - offlineSync mirrors (local_students_records / local_faculty_records)
 * - Current active session user (attendance_user)
 */
export function updateLocalUserPhoto(userType, userId, photoUrl) {
  const cleanType = String(userType).toLowerCase();
  const idStr = String(userId);

  // 1. Update in localAccounts directory
  if (cleanType === 'student') {
    const students = localAccounts.getStudentsDirectory();
    const idx = students.findIndex(
      (s) => String(s.student_id || s.studentId) === idStr
    );
    if (idx !== -1) {
      students[idx].photo_url = photoUrl;
      students[idx].photoUrl = photoUrl;
      localStorage.setItem(
        localAccounts.DIRECTORY_KEYS.STUDENTS,
        JSON.stringify(students)
      );
    }
  } else if (cleanType === 'faculty') {
    const faculty = localAccounts.getFacultyDirectory();
    const idx = faculty.findIndex(
      (f) => String(f.faculty_id || f.facultyId) === idStr
    );
    if (idx !== -1) {
      faculty[idx].photo_url = photoUrl;
      faculty[idx].photoUrl = photoUrl;
      localStorage.setItem(
        localAccounts.DIRECTORY_KEYS.FACULTY,
        JSON.stringify(faculty)
      );
    }
  }

  // 2. Update in offlineSync mirrors
  const mirrorKey =
    cleanType === 'student' ? 'local_students_records' : 'local_faculty_records';
  try {
    const mirror = JSON.parse(localStorage.getItem(mirrorKey) || '[]');
    const idx = mirror.findIndex(
      (item) =>
        String(
          item.studentId || item.student_id || item.facultyId || item.faculty_id
        ) === idStr
    );
    if (idx !== -1) {
      mirror[idx].photo_url = photoUrl;
      mirror[idx].photoUrl = photoUrl;
      localStorage.setItem(mirrorKey, JSON.stringify(mirror));
    }
  } catch (err) {
    console.warn(`Error updating ${mirrorKey}:`, err);
  }

  // 3. Update in active session if matching currently logged-in user
  try {
    const currentUser = JSON.parse(
      localStorage.getItem('attendance_user') || '{}'
    );
    const currentId = String(
      currentUser.studentId ||
        currentUser.student_id ||
        currentUser.facultyId ||
        currentUser.faculty_id ||
        currentUser.adminId ||
        currentUser.id ||
        ''
    );
    if (currentId === idStr || !currentId) {
      currentUser.photo_url = photoUrl;
      currentUser.photoUrl = photoUrl;
      localStorage.setItem('attendance_user', JSON.stringify(currentUser));
    }
  } catch (err) {
    console.warn('Error updating attendance_user session:', err);
  }

  // Dispatch custom event so listening components update their avatars immediately
  window.dispatchEvent(
    new CustomEvent('user-photo-updated', {
      detail: { userType: cleanType, userId: idStr, photoUrl },
    })
  );
}

/**
 * Queue a photo upload for background sync when offline.
 */
export function enqueuePendingPhoto(userType, userId, base64, filename) {
  try {
    const queueKey = 'pending_photos';
    const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
    // Replace any existing queued photo for the same user to save space
    const filtered = queue.filter(
      (item) =>
        !(
          item.userType === userType &&
          String(item.userId) === String(userId)
        )
    );
    filtered.push({
      tempId: `photo-${Date.now()}`,
      userType,
      userId,
      base64,
      filename: filename || `${userType}_${userId}_photo.jpg`,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(queueKey, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('pending-queue-updated'));
  } catch (err) {
    console.error('Failed to enqueue pending photo:', err);
  }
}

/**
 * Unified Photo Upload Function:
 * 1. Attempts uploading multipart/form-data to Spring Boot POST /api/upload/photo
 * 2. Saves returned photoUrl via PUT /api/admin/{userType}/{userId}/photo
 * 3. Falls back to offline Base64 storage in localStorage + queues for sync
 */
export async function uploadUserPhoto({ file, base64Data, userType, userId }) {
  const cleanType = (userType || 'student').toLowerCase();
  const id = userId || '0';

  // Obtain Base64 representation first for offline fallback / immediate preview
  let base64 = base64Data;
  if (!base64 && file) {
    try {
      base64 = await fileToBase64(file);
    } catch (err) {
      console.warn('Could not read file as base64:', err);
    }
  }

  // 1. Try uploading to backend if online
  try {
    let fileToUpload = file;
    if (!fileToUpload && base64) {
      fileToUpload = dataURLtoFile(base64, `${cleanType}_${id}.jpg`);
    }

    if (fileToUpload) {
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('userType', cleanType);
      formData.append('userId', String(id));

      const uploadRes = await apiClient.post('/upload/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 6000,
      });

      const serverPhotoUrl = uploadRes.data?.photoUrl;
      if (serverPhotoUrl) {
        // Save the photoUrl to the user record in MySQL
        const endpoint =
          cleanType === 'student'
            ? `/admin/students/${id}/photo`
            : `/admin/faculty/${id}/photo`;

        try {
          await apiClient.put(endpoint, { photoUrl: serverPhotoUrl });
        } catch (updateErr) {
          console.warn('Backend photoUrl update endpoint call failed:', updateErr);
        }

        // Update local mirrors with the server relative path
        updateLocalUserPhoto(cleanType, id, serverPhotoUrl);

        return {
          success: true,
          photoUrl: serverPhotoUrl,
          isOffline: false,
        };
      }
    }
  } catch (onlineErr) {
    console.warn('Backend upload unreachable. Switching to offline Base64 mode:', onlineErr.message);
  }

  // 2. Offline Mode: Store Base64 directly in localStorage & queue for future sync
  if (base64) {
    updateLocalUserPhoto(cleanType, id, base64);
    enqueuePendingPhoto(cleanType, id, base64, file?.name);
    return {
      success: true,
      photoUrl: base64,
      isOffline: true,
    };
  }

  throw new Error('No photo file or data provided');
}

export default {
  resolvePhotoUrl,
  fileToBase64,
  dataURLtoFile,
  updateLocalUserPhoto,
  enqueuePendingPhoto,
  uploadUserPhoto,
};
