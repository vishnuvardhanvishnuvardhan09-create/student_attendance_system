import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import {
  QrCode,
  GraduationCap,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  Layers,
  Printer,
  Download,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Percent,
  Sparkles,
  Building,
  User,
  RefreshCw,
  Camera,
  X,
} from 'lucide-react';
import { getStudents, getStudentAttendance } from '../../api/offlineSync';
import Avatar from '../../components/Avatar';
import PhotoUpload from '../../components/PhotoUpload';

export default function Profile({ studentId: propStudentId, student: propStudent, isReadOnly: propReadOnly }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const loggedInUser = JSON.parse(localStorage.getItem('attendance_user') || '{}');

  // Determine target student ID
  const paramStudentId = searchParams.get('studentId');
  const targetStudentId = propStudentId || paramStudentId || loggedInUser.studentId || loggedInUser.student_id;

  // Check if viewing as an observer (Faculty or Admin or looking at another student)
  const isObserver =
    propReadOnly ||
    Boolean(paramStudentId && String(paramStudentId) !== String(loggedInUser.studentId || loggedInUser.student_id)) ||
    loggedInUser.role === 'admin' ||
    loggedInUser.role === 'faculty';

  const [studentData, setStudentData] = useState(propStudent || null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrDownloaded, setQrDownloaded] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  useEffect(() => {
    async function loadStudentInfo() {
      setLoading(true);
      try {
        let foundStudent = propStudent || null;

        // 1. Fetch student details from roster
        if (!foundStudent && targetStudentId) {
          const allStudents = await getStudents();
          foundStudent = allStudents.find(
            (s) => String(s.studentId) === String(targetStudentId) || String(s.student_id) === String(targetStudentId)
          );
        }

        // Fallback to logged-in user if matching
        if (!foundStudent && String(loggedInUser.studentId || loggedInUser.student_id) === String(targetStudentId)) {
          foundStudent = loggedInUser;
        }

        setStudentData(foundStudent);

        // 2. Fetch attendance history to calculate live attendance % & compliance
        if (targetStudentId) {
          const att = await getStudentAttendance(targetStudentId);
          setAttendanceRecords(att || []);
        }
      } catch (err) {
        console.warn('Error loading student profile data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStudentInfo();
  }, [targetStudentId, propStudent]);

  // Compute live attendance rate and academic compliance
  const totalSessions = attendanceRecords.length;
  const presentSessions = attendanceRecords.filter(
    (a) => a.status === 'Present' || a.status === 'Late' || a.status === 'Present-OutOfRange'
  ).length;
  const attendanceRate =
    totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 100;

  const isEligible = attendanceRate >= 75;
  const isWarning = attendanceRate >= 65 && attendanceRate < 75;

  // Student active details
  const student = studentData || {
    studentId: targetStudentId || 1,
    name: loggedInUser.name || 'Student Name',
    rollNumber: loggedInUser.rollNumber || 'CS2026001',
    department: loggedInUser.department || 'Computer Science',
    year: loggedInUser.year || 3,
    section: loggedInUser.section || 'A',
    email: loggedInUser.email || 'student@university.edu',
    phone: loggedInUser.phone || '+91 98765 43210',
    photoUrl: loggedInUser.photoUrl || '',
  };

  // Structured JSON Payload encoded directly in the QR Code
  // Fully readable by any offline scanner/camera to retrieve identity & attendance
  const qrPayload = JSON.stringify({
    type: 'STUDENT_DIGITAL_ID',
    student_id: student.studentId,
    name: student.name,
    roll_number: student.rollNumber,
    department: student.department,
    year: student.year,
    section: student.section,
    email: student.email,
    attendance_rate: `${attendanceRate}%`,
    sessions_attended: `${presentSessions}/${totalSessions}`,
    compliance: isEligible ? 'ELIGIBLE_FOR_EXAMS' : 'SHORTAGE_WARNING',
    issued: '2026-ACADEMIC-YEAR',
  });

  // Export QR Code as PNG
  const handleDownloadQR = () => {
    const canvas = document.getElementById('student-id-qr-canvas');
    if (!canvas) return;

    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.download = `${student.rollNumber || 'student'}_QR_Badge.png`;
    downloadLink.href = pngUrl;
    downloadLink.click();

    setQrDownloaded(true);
    setTimeout(() => setQrDownloaded(false), 3000);
  };

  // Print ID Card
  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
      {/* Observer Mode Notice Bar (when viewed by Admin or Faculty) */}
      {isObserver && (
        <div
          className="glass-card"
          style={{
            padding: '12px 20px',
            marginBottom: '24px',
            background: 'rgba(14, 165, 233, 0.1)',
            border: '1px solid rgba(14, 165, 233, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={18} color="#38bdf8" />
            <span style={{ fontSize: '0.88rem', color: '#e2e8f0', fontWeight: 600 }}>
              Viewing Student ID Credential in Read-Only Observer Mode ({loggedInUser.role?.toUpperCase() || 'OBSERVER'})
            </span>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary"
            style={{
              padding: '6px 14px',
              fontSize: '0.82rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <ArrowLeft size={14} />
            <span>Return to Previous Roster</span>
          </button>
        </div>
      )}

      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div
              className="icon-badge"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
              }}
            >
              <QrCode size={20} color="#ffffff" />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
              Student Profile & Digital ID Badge
            </h1>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>
            Official university credential with high-density offline-verifiable QR code and live attendance analytics.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleDownloadQR}
            className="btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.88rem',
              padding: '9px 16px',
              background: qrDownloaded ? 'rgba(16, 185, 129, 0.2)' : undefined,
              borderColor: qrDownloaded ? '#10b981' : undefined,
            }}
          >
            {qrDownloaded ? <CheckCircle2 size={16} color="#34d399" /> : <Download size={16} />}
            <span>{qrDownloaded ? 'QR Downloaded!' : 'Download QR (PNG)'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.88rem',
              padding: '9px 18px',
              background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
            }}
          >
            <Printer size={16} />
            <span>Print ID Card</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
          <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <div>Retrieving official student credential...</div>
        </div>
      ) : (
        /* Main Grid: Left is Digital ID Card, Right is Academic Details & Attendance Summary */
        <div className="responsive-grid-split" style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '28px', alignItems: 'start' }}>
          {/* DIGITAL ID CARD (Self-contained, printable card) */}
          <div
            id="printable-id-card"
            className="glass-card"
            style={{
              padding: '0',
              overflow: 'hidden',
              borderRadius: '22px',
              border: '1.5px solid rgba(14, 165, 233, 0.4)',
              boxShadow: '0 16px 36px rgba(0, 0, 0, 0.45), 0 0 24px rgba(14, 165, 233, 0.2)',
              background: 'linear-gradient(180deg, #0f172a 0%, #070a12 100%)',
              position: 'relative',
            }}
          >
            {/* Top University Brand Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #0ea5e9 100%)',
                padding: '20px 22px',
                textAlign: 'center',
                position: 'relative',
                borderBottom: '2px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#ffffff', marginBottom: '4px' }}>
                <GraduationCap size={24} />
                <span style={{ fontWeight: 900, fontSize: '1.05rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Metropolitan University
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#e0f2fe', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>
                Academic Student Identification Card
              </div>
            </div>

            {/* Card Body */}
            <div style={{ padding: '26px 24px', textAlign: 'center' }}>
              {/* Student Photo with Avatar & Optional Change Photo Action */}
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '14px' }}>
                <Avatar
                  user={student}
                  size="xl"
                  bordered
                  style={{
                    border: '3px solid #38bdf8',
                    boxShadow: '0 6px 18px rgba(14, 165, 233, 0.4)',
                  }}
                />
                {!isObserver && (
                  <button
                    type="button"
                    onClick={() => setShowPhotoModal(true)}
                    title="Change Profile Photo"
                    style={{
                      position: 'absolute',
                      bottom: '4px',
                      right: '4px',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
                      border: '2px solid #0f172a',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 10px rgba(2, 132, 199, 0.5)',
                      transition: 'transform 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    <Camera size={15} />
                  </button>
                )}
              </div>

              {/* Name & Roll Number */}
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', marginBottom: '4px' }}>
                {student.name}
              </h2>
              <div
                style={{
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  color: '#38bdf8',
                  fontFamily: 'monospace',
                  letterSpacing: '0.08em',
                  marginBottom: '16px',
                }}
              >
                {student.rollNumber}
              </div>

              {/* QR Code Container (Canvas format for direct PNG export) */}
              <div
                style={{
                  background: '#ffffff',
                  padding: '12px',
                  borderRadius: '16px',
                  display: 'inline-block',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
                  marginBottom: '16px',
                }}
              >
                <QRCodeCanvas
                  id="student-id-qr-canvas"
                  value={qrPayload}
                  size={170}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div style={{ fontSize: '0.74rem', color: '#64748b', marginBottom: '18px' }}>
                Scan to pull up offline-verifiable identity & attendance data
              </div>

              {/* ID Metadata Quick Grid */}
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  padding: '14px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  textAlign: 'left',
                  fontSize: '0.8rem',
                }}
              >
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.74rem' }}>Department:</span>
                  <div style={{ color: '#e2e8f0', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {student.department}
                  </div>
                </div>

                <div>
                  <span style={{ color: '#64748b', fontSize: '0.74rem' }}>Class Cohort:</span>
                  <div style={{ color: '#e2e8f0', fontWeight: 700 }}>
                    Year {student.year} &bull; Sec {student.section}
                  </div>
                </div>

                <div>
                  <span style={{ color: '#64748b', fontSize: '0.74rem' }}>Attendance Rate:</span>
                  <div style={{ color: isEligible ? '#34d399' : '#f87171', fontWeight: 800 }}>
                    {attendanceRate}%
                  </div>
                </div>

                <div>
                  <span style={{ color: '#64748b', fontSize: '0.74rem' }}>Status:</span>
                  <div style={{ color: isEligible ? '#34d399' : '#fbbf24', fontWeight: 700 }}>
                    {isEligible ? 'Exam Eligible' : 'At-Risk'}
                  </div>
                </div>
              </div>

              {/* Decorative Holographic Strip / ID Barcode */}
              <div
                style={{
                  marginTop: '16px',
                  paddingTop: '12px',
                  borderTop: '1px dashed rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.72rem',
                  color: '#475569',
                  fontFamily: 'monospace',
                }}
              >
                <span>ID: {String(student.studentId).padStart(6, '0')}</span>
                <span>METRO-SECURE-2026</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Full Student Details & Live Attendance Compliance Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Academic Information Details Card */}
            <div className="glass-card" style={{ padding: '28px 32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
                <ShieldCheck size={22} color="#38bdf8" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
                  Registered Academic Profile
                </h2>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px',
                }}
              >
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.76rem', marginBottom: '4px' }}>
                    <User size={14} color="#38bdf8" />
                    <span>Full Student Name</span>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                    {student.name}
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.76rem', marginBottom: '4px' }}>
                    <GraduationCap size={14} color="#38bdf8" />
                    <span>Roll / Registration Number</span>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>
                    {student.rollNumber}
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.76rem', marginBottom: '4px' }}>
                    <Mail size={14} color="#38bdf8" />
                    <span>Institutional Email</span>
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#f8fafc', wordBreak: 'break-all' }}>
                    {student.email}
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.76rem', marginBottom: '4px' }}>
                    <Phone size={14} color="#38bdf8" />
                    <span>Phone Number</span>
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>
                    {student.phone || 'Not Registered'}
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.76rem', marginBottom: '4px' }}>
                    <BookOpen size={14} color="#38bdf8" />
                    <span>Academic Department</span>
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                    {student.department}
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.76rem', marginBottom: '4px' }}>
                    <Calendar size={14} color="#38bdf8" />
                    <span>Year & Assigned Section</span>
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                    Year {student.year} &bull; Section {student.section}
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Compliance & Examination Clearance Card */}
            <div
              className="glass-card"
              style={{
                padding: '28px 32px',
                borderLeft: isEligible
                  ? '5px solid #10b981'
                  : isWarning
                  ? '5px solid #fbbf24'
                  : '5px solid #ef4444',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {isEligible ? (
                    <ShieldCheck size={24} color="#10b981" />
                  ) : (
                    <ShieldAlert size={24} color="#f87171" />
                  )}
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
                      University Attendance & Examination Clearance
                    </h3>
                    <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                      Audit of recorded check-ins against university 75% minimum examination attendance criteria.
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      fontSize: '2rem',
                      fontWeight: 900,
                      color: isEligible ? '#34d399' : isWarning ? '#fbbf24' : '#f87171',
                    }}
                  >
                    {attendanceRate}%
                  </span>
                </div>
              </div>

              {/* Status Message */}
              <div
                style={{
                  background: isEligible
                    ? 'rgba(16, 185, 129, 0.12)'
                    : isWarning
                    ? 'rgba(245, 158, 11, 0.12)'
                    : 'rgba(239, 68, 68, 0.12)',
                  border: `1px solid ${
                    isEligible
                      ? 'rgba(16, 185, 129, 0.3)'
                      : isWarning
                      ? 'rgba(245, 158, 11, 0.3)'
                      : 'rgba(239, 68, 68, 0.3)'
                  }`,
                  padding: '12px 16px',
                  borderRadius: '10px',
                  fontSize: '0.86rem',
                  color: isEligible ? '#34d399' : isWarning ? '#fbbf24' : '#f87171',
                  marginBottom: '18px',
                }}
              >
                {isEligible
                  ? '✓ Examination Clearance Granted: Student meets or exceeds the mandatory 75% attendance threshold.'
                  : isWarning
                  ? '⚠ Warning Notice: Attendance is between 65% and 74%. Student is near debarment threshold.'
                  : '✕ Debarment Notice: Attendance is below 65%. Ineligible for end-semester examinations without condonation.'}
              </div>

              {/* Metric Breakdown */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  textAlign: 'center',
                }}
              >
                <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Sessions</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
                    {totalSessions}
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Attended Sessions</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399', marginTop: '2px' }}>
                    {presentSessions}
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Missed Sessions</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f87171', marginTop: '2px' }}>
                    {totalSessions - presentSessions}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Photo Update Modal */}
      {showPhotoModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: '400px',
              width: '100%',
              padding: '28px',
              borderRadius: '20px',
              border: '1px solid rgba(14, 165, 233, 0.3)',
              position: 'relative',
              background: '#0f172a',
            }}
          >
            <button
              type="button"
              onClick={() => setShowPhotoModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px', textAlign: 'center' }}>
              Update Profile Photo
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', textAlign: 'center', marginBottom: '16px' }}>
              Upload an image to personalize your digital ID card. Supports offline mode.
            </p>

            <PhotoUpload
              user={student}
              userType="student"
              userId={targetStudentId}
              size="xl"
              onSave={(newPhotoUrl) => {
                setStudentData((prev) => ({
                  ...prev,
                  photoUrl: newPhotoUrl,
                  photo_url: newPhotoUrl,
                }));
                setShowPhotoModal(false);
              }}
              onCancel={() => setShowPhotoModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
