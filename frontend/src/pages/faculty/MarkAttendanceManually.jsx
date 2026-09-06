import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CheckSquare,
  CheckCircle2,
  AlertTriangle,
  Users,
  Calendar,
  Clock,
  FileEdit,
  History,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { getStudents, markAttendanceByFaculty, getAllAttendance } from '../../api/offlineSync';

export default function MarkAttendanceManually() {
  const [searchParams] = useSearchParams();
  const preselectedStudentId = searchParams.get('studentId');

  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeIn, setTimeIn] = useState(new Date().toTimeString().split(' ')[0]);
  const [status, setStatus] = useState('Present');
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Recent manual overrides log
  const [recentOverrides, setRecentOverrides] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const loadData = async () => {
    try {
      const [stuData, attData] = await Promise.all([
        getStudents(),
        getAllAttendance(),
      ]);
      setStudents(stuData);

      // If query param passed, set selectedStudent
      if (preselectedStudentId) {
        setSelectedStudent(Number(preselectedStudentId));
      } else if (stuData.length > 0 && !selectedStudent) {
        setSelectedStudent(stuData[0].studentId);
      }

      // Filter recent manual overrides
      const overrides = attData
        .filter((a) => a.markedBy === 'faculty' || a.markedBy === 'admin')
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
        .slice(0, 8);
      setRecentOverrides(overrides);
    } catch (err) {
      console.warn('Error loading manual attendance data:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [preselectedStudentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedStudent) {
      setErrorMsg('Please select a student.');
      return;
    }

    setLoading(true);
    try {
      const studentObj = students.find((s) => s.studentId === Number(selectedStudent));
      const studentName = studentObj ? studentObj.name : `Student #${selectedStudent}`;

      await markAttendanceByFaculty({
        studentId: Number(selectedStudent),
        date,
        timeIn: status === 'Absent' ? null : timeIn,
        status,
        markedBy: 'faculty',
      });

      setSuccessMsg(
        `Successfully logged ${status} for ${studentName} (${date}). Record updated without GPS requirement.`
      );
      setRemark('');
      loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update attendance.');
    } finally {
      setLoading(false);
    }
  };

  const selectedStudentObj = students.find((s) => s.studentId === Number(selectedStudent));

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div
            className="icon-badge"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
              boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
            }}
          >
            <CheckSquare size={20} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Faculty Manual Attendance & Correction
          </h1>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>
          Authoritative manual override for off-campus academic duty, medical leave, or biometric device rectifications. No GPS boundary restriction applied.
        </p>
      </div>

      {/* Grid: Form on Left, Overrides on Right */}
      <div className="responsive-grid-split" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px', alignItems: 'start' }}>
        {/* Form Card */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '20px' }}>
            Attendance Entry / Correction Form
          </h2>

          {successMsg && (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#34d399',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '0.88rem',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '0.88rem',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Student Select */}
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                Select Student
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="input-field"
                required
              >
                {students.map((s) => (
                  <option key={s.studentId} value={s.studentId}>
                    {s.rollNumber} &bull; {s.name} ({s.department}, Yr {s.year}-{s.section})
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Student Details Pill */}
            {selectedStudentObj && (
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  fontSize: '0.82rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ color: '#94a3b8' }}>Student: </span>
                  <strong style={{ color: '#f8fafc' }}>{selectedStudentObj.name}</strong>
                  <span style={{ color: '#64748b' }}> ({selectedStudentObj.rollNumber})</span>
                </div>
                <div style={{ color: '#38bdf8', fontWeight: 600 }}>
                  {selectedStudentObj.department}
                </div>
              </div>
            )}

            {/* Date & Time In */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                  Session Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                  Recorded Time In
                </label>
                <input
                  type="time"
                  step="1"
                  value={timeIn}
                  onChange={(e) => setTimeIn(e.target.value)}
                  className="input-field"
                  disabled={status === 'Absent'}
                />
              </div>
            </div>

            {/* Status Select */}
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                Attendance Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="input-field"
              >
                <option value="Present">Present (Full Attendance)</option>
                <option value="Late">Late Arrival</option>
                <option value="Absent">Absent (Unexcused)</option>
              </select>
            </div>

            {/* Remarks / Justification */}
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                Faculty Remarks / Justification (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Inter-college hackathon duty, medical certificate verified"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="input-field"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                opacity: loading ? 0.7 : 1,
              }}
            >
              <CheckSquare size={17} />
              <span>{loading ? 'Committing Override...' : 'Confirm & Save Attendance'}</span>
            </button>
          </form>
        </div>

        {/* Recent Manual Overrides Column */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={18} color="#38bdf8" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
                Recent Manual Overrides
              </h2>
            </div>
            <button
              onClick={loadData}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.78rem',
              }}
            >
              <RefreshCw size={12} className={loadingHistory ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          {loadingHistory ? (
            <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Loading overrides history...</p>
          ) : recentOverrides.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8' }}>
              <FileEdit size={32} color="#64748b" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '0.92rem', color: '#cbd5e1' }}>No manual overrides logged</div>
              <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>
                Records corrected by faculty will be listed here.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '520px', overflowY: 'auto' }}>
              {recentOverrides.map((row) => (
                <div
                  key={row.attendanceId || `${row.date}-${row.student?.studentId || row.studentId}`}
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f8fafc' }}>
                      {row.student?.name || `Student #${row.student?.studentId || row.studentId}`}
                    </span>
                    <span
                      className={`badge ${
                        row.status === 'Present'
                          ? 'badge-present'
                          : row.status === 'Late'
                          ? 'badge-late'
                          : 'badge-absent'
                      }`}
                    >
                      {row.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8' }}>
                    <span>Date: {row.date} {row.timeIn ? `at ${row.timeIn}` : ''}</span>
                    <span style={{ color: '#38bdf8', textTransform: 'capitalize' }}>
                      By {row.markedBy}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
