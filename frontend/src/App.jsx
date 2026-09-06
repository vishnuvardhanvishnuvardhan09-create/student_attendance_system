import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { checkBackendHealth } from './api/offlineSync';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Module Components
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStudents from './pages/admin/ManageStudents';
import ManageFaculty from './pages/admin/ManageFaculty';
import ManageHolidays from './pages/admin/ManageHolidays';
import ViewAllAttendance from './pages/admin/ViewAllAttendance';
import ViewFeedback from './pages/admin/ViewFeedback';

// Student Module Components
import StudentLayout from './pages/student/StudentLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import MarkAttendance from './pages/student/MarkAttendance';
import MyAttendanceHistory from './pages/student/MyAttendanceHistory';
import MonthlyAnalysis from './pages/student/MonthlyAnalysis';
import HolidaysView from './pages/student/HolidaysView';
import NoticeBoard from './pages/student/NoticeBoard';
import FeedbackForm from './pages/student/FeedbackForm';
import Profile from './pages/student/Profile';

// Faculty Module Components
import FacultyLayout from './pages/faculty/FacultyLayout';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import StudentAttendanceOverview from './pages/faculty/StudentAttendanceOverview';
import MarkAttendanceManually from './pages/faculty/MarkAttendanceManually';
import PostNotice from './pages/faculty/PostNotice';
import StudentFeedbackReview from './pages/faculty/StudentFeedbackReview';

export default function App() {
  useEffect(() => {
    checkBackendHealth();
  }, []);

  return (
    <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Nested Routes with Persistent Layout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<ManageStudents />} />
          <Route path="faculty" element={<ManageFaculty />} />
          <Route path="holidays" element={<ManageHolidays />} />
          <Route path="attendance" element={<ViewAllAttendance />} />
          <Route path="feedback" element={<ViewFeedback />} />
        </Route>

        {/* Student Nested Routes with Persistent Layout */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="mark" element={<MarkAttendance />} />
          <Route path="history" element={<MyAttendanceHistory />} />
          <Route path="analysis" element={<MonthlyAnalysis />} />
          <Route path="holidays" element={<HolidaysView />} />
          <Route path="notices" element={<NoticeBoard />} />
          <Route path="feedback" element={<FeedbackForm />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Faculty Nested Routes with Persistent Layout */}
        <Route path="/faculty" element={<FacultyLayout />}>
          <Route index element={<FacultyDashboard />} />
          <Route path="overview" element={<StudentAttendanceOverview />} />
          <Route path="mark" element={<MarkAttendanceManually />} />
          <Route path="notices" element={<PostNotice />} />
          <Route path="feedback" element={<StudentFeedbackReview />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}
