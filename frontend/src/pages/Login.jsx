import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  ShieldCheck,
  Mail,
  Lock,
  LogIn,
  ArrowLeft,
  UserPlus,
  WifiOff,
  Info,
  CheckCircle2,
} from 'lucide-react';
import apiClient from '../api/apiClient';
import { loginUser, getIsOnline } from '../api/offlineSync';
import { findStudentByCredentials, findFacultyByCredentials } from '../api/localAccounts';
import AuthScene3D from '../components/AuthScene3D';

/**
 * ARCHITECTURAL CONSTRAINT / OFFLINE ACCOUNT SYNCHRONIZATION NOTE:
 * In an offline-first browser application without a centralized server, student and
 * faculty accounts created on an administrator's device are saved into localStorage
 * ("local_students_directory" and "local_faculty_directory").
 *
 * Scoping rule:
 * - Accounts created offline on the Admin's device can only be authenticated offline on that
 *   SAME device and browser instance (localStorage is isolated per machine and origin).
 * - This is an expected architectural characteristic of client-side offline storage, not a bug.
 * - When online connectivity is restored, syncPendingData() posts the new accounts to MySQL
 *   and reconciles the temporary IDs, making them available globally across all devices.
 */
export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [offlineBanner, setOfflineBanner] = useState('');

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && ['admin', 'faculty', 'student'].includes(roleParam.toLowerCase())) {
      setRole(roleParam.toLowerCase());
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setOfflineBanner('');
    setLoading(true);

    const identifier = (email || '').trim();
    const cleanIdentifier = identifier.toLowerCase();
    const cleanPassword = (password || '').trim();

    try {
      let userData = null;
      let isOfflineLogin = false;

      // 1. If backend is reported online, attempt online authentication first
      if (getIsOnline()) {
        try {
          const res = await apiClient.post(`/auth/login/${role}`, {
            email: cleanIdentifier,
            password: cleanPassword,
          });
          userData = { ...res.data, role };
        } catch (networkOrAuthErr) {
          // If server responded with 401 Unauthorized, credentials failed on the backend
          if (networkOrAuthErr.response && networkOrAuthErr.response.status === 401) {
            throw new Error(networkOrAuthErr.response?.data?.message || 'Invalid email or password.');
          }

          // Backend was reachable but went down or failed
          isOfflineLogin = true;
        }
      } else {
        isOfflineLogin = true;
      }

      if (isOfflineLogin) {
        if (role === 'student') {
          const matchedStudent = findStudentByCredentials(identifier, cleanPassword);
          if (matchedStudent) {
            userData = {
              ...matchedStudent,
              studentId: matchedStudent.student_id || matchedStudent.studentId,
              student_id: matchedStudent.student_id || matchedStudent.studentId,
              rollNumber: matchedStudent.roll_number || matchedStudent.rollNumber,
              roll_number: matchedStudent.roll_number || matchedStudent.rollNumber,
              role: 'student',
              _isOffline: true,
            };
          } else {
            throw new Error('Invalid credentials or student record not found on this device.');
          }
        } else if (role === 'faculty') {
          const matchedFaculty = findFacultyByCredentials(cleanIdentifier, cleanPassword);
          if (matchedFaculty) {
            userData = {
              ...matchedFaculty,
              facultyId: matchedFaculty.faculty_id || matchedFaculty.facultyId,
              faculty_id: matchedFaculty.faculty_id || matchedFaculty.facultyId,
              role: 'faculty',
              _isOffline: true,
            };
          } else {
            throw new Error('Invalid credentials or faculty record not found on this device.');
          }
        } else if (role === 'admin') {
          if (cleanIdentifier === 'admin@attendance.edu' && cleanPassword === 'admin123') {
            userData = {
              adminId: 1,
              name: 'System Administrator',
              email: cleanIdentifier,
              role: 'admin',
              _isOffline: true,
            };
          } else {
            const localAdmins = JSON.parse(localStorage.getItem('local_admin_records') || '[]');
            const adminMatch = localAdmins.find(
              (a) =>
                a.email &&
                a.email.trim().toLowerCase() === cleanIdentifier &&
                (a.passwordPlain === cleanPassword || (!a.passwordPlain && cleanPassword === 'admin123'))
            );
            if (adminMatch) {
              userData = { ...adminMatch, role: 'admin', _isOffline: true };
            } else {
              throw new Error('Invalid credentials or account not yet synced to this device.');
            }
          }
        }
      }

      if (!userData) {
        throw new Error('Invalid credentials or account not yet synced to this device.');
      }

      // Store in session
      localStorage.setItem('attendance_user', JSON.stringify(userData));

      navigate(`/${role}`);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid credentials or account not yet synced to this device.');
    } finally {
      setLoading(false);
    }
  };

  const roleConfigs = [
    { key: 'student', label: 'Student', Icon: GraduationCap },
    { key: 'faculty', label: 'Faculty', Icon: Users },
    { key: 'admin', label: 'Admin', Icon: ShieldCheck },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        minHeight: '100vh',
        background: '#0b0f19',
      }}
    >
      {/* Left Half: 3D Scene */}
      <div style={{ height: '100%', minHeight: '480px' }}>
        <AuthScene3D />
      </div>

      {/* Right Half: Login Form */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '48px 32px',
          background: '#0f172a',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            background: 'rgba(30, 41, 59, 0.7)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '36px 32px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div
                className="icon-badge"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                }}
              >
                <LogIn size={18} color="#818cf8" />
              </div>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Sign In
              </h2>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Select your role and enter credentials to continue
            </p>
          </div>

          {/* Role Selector */}
          <div
            style={{
              display: 'flex',
              background: '#0b0f19',
              padding: '4px',
              borderRadius: '12px',
              marginBottom: '24px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              gap: '4px',
            }}
          >
            {roleConfigs.map((item) => {
              const Icon = item.Icon;
              const isSelected = role === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setRole(item.key);
                    setErrorMsg('');
                  }}
                  style={{
                    flex: 1,
                    padding: '9px 10px',
                    border: 'none',
                    borderRadius: '9px',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: isSelected ? '#6366f1' : 'transparent',
                    color: isSelected ? '#ffffff' : '#94a3b8',
                    boxShadow: isSelected ? '0 2px 8px rgba(99, 102, 241, 0.4)' : 'none',
                    transition: 'all 0.2s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Offline Success Banner */}
          {offlineBanner && (
            <div
              style={{
                background: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.35)',
                color: '#93c5fd',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '0.88rem',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                lineHeight: 1.4,
              }}
            >
              <WifiOff size={18} color="#60a5fa" />
              <span>{offlineBanner}</span>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '0.88rem',
                marginBottom: '20px',
                lineHeight: 1.4,
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '18px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: '#cbd5e1',
                  marginBottom: '6px',
                }}
              >
                <Mail size={14} color="#818cf8" />
                <span>{role === 'student' ? 'Email Address or Roll Number' : 'Email Address'}</span>
              </label>
              <input
                type={role === 'student' ? 'text' : 'email'}
                required
                className="input-field"
                placeholder={
                  role === 'student'
                    ? 'e.g. alice.johnson@student.edu or CS2026001'
                    : role === 'faculty'
                    ? 'faculty@attendance.edu'
                    : 'admin@attendance.edu'
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: '#cbd5e1',
                  marginBottom: '6px',
                }}
              >
                <Lock size={14} color="#818cf8" />
                <span>Password</span>
              </label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '0.95rem',
                opacity: loading ? 0.75 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <LogIn size={16} />
              <span>{loading ? 'Authenticating...' : `Sign in as ${role.charAt(0).toUpperCase() + role.slice(1)}`}</span>
            </button>
          </form>

          {/* Navigation Links */}
          {role === 'student' && (
            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.88rem', color: '#94a3b8' }}>
              New student?{' '}
              <Link to="/register" style={{ color: '#818cf8', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <UserPlus size={14} />
                <span>Register Account</span>
              </Link>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link
              to="/"
              style={{
                fontSize: '0.84rem',
                color: '#64748b',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <ArrowLeft size={14} />
              <span>Back to Role Selection</span>
            </Link>
          </div>

          {/* Architectural Note on Offline Storage Scoping */}
          <div
            style={{
              marginTop: '22px',
              padding: '10px 12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '8px',
              fontSize: '0.73rem',
              color: '#64748b',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              lineHeight: 1.4,
            }}
          >
            <Info size={14} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong>Offline Mode:</strong> Accounts created offline are stored in this device&apos;s browser directory and can be authenticated offline on this device.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
