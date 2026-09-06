import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Percent,
  CalendarDays,
  Bell,
  MapPin,
  BarChart3,
  QrCode,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
} from 'lucide-react';
import {
  getStudentAttendance,
  getHolidays,
  getNoticesForAudience,
} from '../../api/offlineSync';
import Avatar from '../../components/Avatar';

export default function StudentDashboard() {
  const user = JSON.parse(localStorage.getItem('attendance_user') || '{}');

  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [nextHoliday, setNextHoliday] = useState(null);
  const [latestNotice, setLatestNotice] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState({
    percentage: 0,
    present: 0,
    total: 0,
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const studentId = user.studentId;

        // 1. Fetch Student Attendance
        let records = [];
        if (studentId) {
          records = await getStudentAttendance(studentId);
          setAttendanceRecords(records);

          // Calculate current month's attendance percentage
          const now = new Date();
          const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          const currentMonthRecords = records.filter(
            (r) => r.date && r.date.startsWith(currentMonthPrefix)
          );

          const totalCurrent = currentMonthRecords.length;
          const presentCurrent = currentMonthRecords.filter(
            (r) => r.status === 'Present' || r.status === 'Late' || r.status === 'Present-OutOfRange'
          ).length;

          const pct = totalCurrent > 0 ? Math.round((presentCurrent / totalCurrent) * 100) : 100;
          setMonthlyStats({
            percentage: pct,
            present: presentCurrent,
            total: totalCurrent,
          });
        }

        // 2. Fetch Next Upcoming Holiday
        const holidays = await getHolidays();
        const todayStr = new Date().toISOString().split('T')[0];
        const upcoming = holidays
          .filter((h) => h.date >= todayStr)
          .sort((a, b) => a.date.localeCompare(b.date));

        if (upcoming.length > 0) {
          setNextHoliday(upcoming[0]);
        } else if (holidays.length > 0) {
          setNextHoliday(holidays[0]);
        }

        // 3. Fetch Latest Notice for Student Audience
        const notices = await getNoticesForAudience(user.year || 1, user.section || 'A');
        if (notices && notices.length > 0) {
          // sort descending by postedAt or noticeId
          const sorted = [...notices].sort(
            (a, b) => new Date(b.postedAt || 0) - new Date(a.postedAt || 0)
          );
          setLatestNotice(sorted[0]);
        }
      } catch (err) {
        console.warn('Error loading student dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user.studentId, user.year, user.section]);

  const recentRecords = attendanceRecords.slice(0, 5);

  // Status color badge logic
  const getPercentageColor = (pct) => {
    if (pct >= 75) return '#10b981'; // Good
    if (pct >= 65) return '#f59e0b'; // Warning
    return '#ef4444'; // Critical
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Welcome Banner */}
      <div
        className="glass-card"
        style={{
          padding: '28px 32px',
          marginBottom: '32px',
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)',
          border: '1px solid rgba(14, 165, 233, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Avatar user={user} size="xl" bordered />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#38bdf8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Academic Year 2026
              </span>
              <span style={{ color: '#64748b' }}>&bull;</span>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                {user.department || 'Computer Science'} &bull; Year {user.year || 1} ({user.section || 'A'})
              </span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
              Welcome back, {user.name || 'Student'}! 👋
            </h1>
            <p style={{ color: '#cbd5e1', fontSize: '0.92rem', marginTop: '4px' }}>
              Roll No: <strong style={{ color: '#38bdf8' }}>{user.rollNumber || 'CS2026001'}</strong> &bull; Track your
              attendance, schedules, and college updates in real-time.
            </p>
          </div>
        </div>

        <Link
          to="/student/mark"
          className="btn-primary"
          style={{
            padding: '12px 24px',
            fontSize: '0.95rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
            boxShadow: '0 4px 16px rgba(14, 165, 233, 0.4)',
          }}
        >
          <MapPin size={18} />
          <span>Mark Attendance Now</span>
        </Link>
      </div>

      {/* 3 Metric Overview Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        {/* Card 1: Attendance % This Month */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.86rem', fontWeight: 600 }}>
              Attendance This Month
            </span>
            <div
              className="icon-badge"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(14, 165, 233, 0.15)',
                border: '1px solid rgba(14, 165, 233, 0.3)',
              }}
            >
              <Percent size={18} color="#38bdf8" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '2.3rem',
                fontWeight: 800,
                color: getPercentageColor(monthlyStats.percentage),
                letterSpacing: '-0.02em',
              }}
            >
              {loading ? '...' : `${monthlyStats.percentage}%`}
            </span>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '6px',
                background:
                  monthlyStats.percentage >= 75
                    ? 'rgba(16, 185, 129, 0.15)'
                    : monthlyStats.percentage >= 65
                    ? 'rgba(245, 158, 11, 0.15)'
                    : 'rgba(239, 68, 68, 0.15)',
                color: getPercentageColor(monthlyStats.percentage),
              }}
            >
              {monthlyStats.percentage >= 75
                ? 'Good Standing'
                : monthlyStats.percentage >= 65
                ? 'Warning (Near 75%)'
                : 'Critical Shortage'}
            </span>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            Attended {monthlyStats.present} of {monthlyStats.total} recorded sessions this month.
          </div>
          <Link
            to="/student/analysis"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#38bdf8',
              fontSize: '0.82rem',
              fontWeight: 600,
              marginTop: '14px',
            }}
          >
            <span>View detailed breakdown</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Card 2: Next Holiday */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.86rem', fontWeight: 600 }}>
              Next Academic Holiday
            </span>
            <div
              className="icon-badge"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
              }}
            >
              <CalendarDays size={18} color="#fbbf24" />
            </div>
          </div>
          {nextHoliday ? (
            <>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>
                {nextHoliday.title}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontSize: '0.88rem', fontWeight: 600 }}>
                <Clock size={15} />
                <span>{nextHoliday.date}</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {nextHoliday.description || 'College closed for holiday.'}
              </div>
            </>
          ) : (
            <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '12px' }}>
              No upcoming holidays scheduled.
            </div>
          )}
          <Link
            to="/student/holidays"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#fbbf24',
              fontSize: '0.82rem',
              fontWeight: 600,
              marginTop: '14px',
            }}
          >
            <span>View holiday calendar</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Card 3: Latest Notice */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.86rem', fontWeight: 600 }}>
              Latest Campus Notice
            </span>
            <div
              className="icon-badge"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
              }}
            >
              <Bell size={18} color="#a5b4fc" />
            </div>
          </div>
          {latestNotice ? (
            <>
              <div
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: '#f8fafc',
                  marginBottom: '6px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {latestNotice.title}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: '1.4', maxHeight: '42px', overflow: 'hidden' }}>
                {latestNotice.message}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#818cf8', marginTop: '6px', fontWeight: 600 }}>
                Audience: {latestNotice.targetAudience}
              </div>
            </>
          ) : (
            <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '12px' }}>
              No recent notices for your class.
            </div>
          )}
          <Link
            to="/student/notices"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#a5b4fc',
              fontSize: '0.82rem',
              fontWeight: 600,
              marginTop: '14px',
            }}
          >
            <span>Open notice board</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Quick Action Shortcuts Grid */}
      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', color: '#cbd5e1' }}>
        Quick Navigation
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <Link
          to="/student/mark"
          className="glass-card"
          style={{
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.4)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
        >
          <div
            className="icon-badge"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(14, 165, 233, 0.15)',
            }}
          >
            <MapPin size={22} color="#38bdf8" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>Mark Attendance</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>GPS Check-in</div>
          </div>
        </Link>

        <Link
          to="/student/analysis"
          className="glass-card"
          style={{
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
        >
          <div
            className="icon-badge"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.15)',
            }}
          >
            <BarChart3 size={22} color="#a5b4fc" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>Monthly Analysis</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Charts & % breakdown</div>
          </div>
        </Link>

        <Link
          to="/student/profile"
          className="glass-card"
          style={{
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
        >
          <div
            className="icon-badge"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
            }}
          >
            <QrCode size={22} color="#34d399" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>Digital QR Badge</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Student ID verification</div>
          </div>
        </Link>

        <Link
          to="/student/feedback"
          className="glass-card"
          style={{
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
        >
          <div
            className="icon-badge"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.15)',
            }}
          >
            <HelpCircle size={22} color="#fbbf24" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>Student Feedback</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Help & queries</div>
          </div>
        </Link>
      </div>

      {/* Recent Attendance Preview Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
              Recent Attendance History
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '2px' }}>
              Latest 5 check-ins recorded for your profile.
            </p>
          </div>
          <Link
            to="/student/history"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#38bdf8',
              fontSize: '0.84rem',
              fontWeight: 600,
            }}
          >
            <span>View All Records</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <p style={{ color: '#94a3b8', padding: '16px 0' }}>Loading records...</p>
        ) : recentRecords.length === 0 ? (
          <p style={{ color: '#94a3b8', padding: '16px 0' }}>No attendance records recorded yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
                  <th style={{ padding: '12px 10px' }}>Date</th>
                  <th style={{ padding: '12px 10px' }}>Time In</th>
                  <th style={{ padding: '12px 10px' }}>Status</th>
                  <th style={{ padding: '12px 10px' }}>Verification</th>
                </tr>
              </thead>
              <tbody>
                {recentRecords.map((row) => (
                  <tr
                    key={row.attendanceId || row.date}
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}
                  >
                    <td style={{ padding: '12px 10px', fontWeight: 600, color: '#f1f5f9' }}>
                      {row.date}
                    </td>
                    <td style={{ padding: '12px 10px', color: '#94a3b8' }}>
                      {row.timeIn || '—'}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span
                        className={`badge ${
                          row.status === 'Present'
                            ? 'badge-present'
                            : row.status === 'Late'
                            ? 'badge-late'
                            : row.status === 'Absent'
                            ? 'badge-absent'
                            : 'badge-outofboundary'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', color: '#64748b', textTransform: 'capitalize' }}>
                      {row.markedBy === 'self' ? 'GPS Self-Mark' : row.markedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
