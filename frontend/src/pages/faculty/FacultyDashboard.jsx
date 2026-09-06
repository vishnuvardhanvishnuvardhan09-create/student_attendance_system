import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  Users,
  Percent,
  AlertTriangle,
  MessageSquare,
  CheckSquare,
  BarChart3,
  Megaphone,
  ArrowRight,
  ShieldAlert,
  Building,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  getStudents,
  getAllAttendance,
  getAllFeedback,
} from '../../api/offlineSync';
import Avatar from '../../components/Avatar';

export default function FacultyDashboard() {
  const user = JSON.parse(localStorage.getItem('attendance_user') || '{}');
  const facultyDept = user.department || '';

  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState(facultyDept ? 'dept' : 'all');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [studentsData, attendanceData, feedbackData] = await Promise.all([
          getStudents(),
          getAllAttendance(),
          getAllFeedback(),
        ]);
        setStudents(studentsData);
        setAttendance(attendanceData);
        setFeedback(feedbackData);
      } catch (err) {
        console.warn('Error loading faculty dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter students based on department toggle
  const relevantStudents = students.filter((s) => {
    if (departmentFilter === 'dept' && facultyDept) {
      return s.department && s.department.toLowerCase() === facultyDept.toLowerCase();
    }
    return true;
  });

  const relevantStudentIds = new Set(relevantStudents.map((s) => s.studentId));

  // Filter today's attendance for relevant students
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = attendance.filter(
    (a) =>
      a.date === todayStr &&
      relevantStudentIds.has(a.student?.studentId || a.studentId)
  );

  const todayPresent = todayRecords.filter((a) => a.status === 'Present').length;
  const todayLate = todayRecords.filter((a) => a.status === 'Late').length;
  const todayOutOfRange = todayRecords.filter((a) => a.status === 'Present-OutOfRange').length;
  const todayAbsent = todayRecords.filter((a) => a.status === 'Absent').length;

  const totalRelevant = relevantStudents.length;
  const effectiveTodayPresent = todayPresent + todayLate + todayOutOfRange;
  const todayPercentage =
    totalRelevant > 0 ? Math.round((effectiveTodayPresent / totalRelevant) * 100) : 0;

  // Compute attendance % for each student to identify at-risk students (< 75%)
  const studentStats = relevantStudents.map((s) => {
    const studentRecords = attendance.filter(
      (a) => (a.student?.studentId || a.studentId) === s.studentId
    );
    const total = studentRecords.length;
    const presentCount = studentRecords.filter(
      (a) => a.status === 'Present' || a.status === 'Late' || a.status === 'Present-OutOfRange'
    ).length;
    const rate = total > 0 ? Math.round((presentCount / total) * 100) : 100;
    return {
      ...s,
      totalSessions: total,
      presentSessions: presentCount,
      rate,
    };
  });

  const atRiskStudents = studentStats.filter((s) => s.rate < 75);
  const pendingFeedbackCount = feedback.filter((f) => f.status === 'New').length;

  // Status breakdown data for Pie Chart
  const statusPieData = [
    { name: 'Present', value: todayPresent, color: '#10b981' },
    { name: 'Late', value: todayLate, color: '#fbbf24' },
    { name: 'Out-Of-Range', value: todayOutOfRange, color: '#c084fc' },
    { name: 'Absent', value: Math.max(0, totalRelevant - effectiveTodayPresent), color: '#ef4444' },
  ].filter((d) => d.value > 0);

  // Year-wise student count distribution
  const yearDistribution = [1, 2, 3, 4].map((year) => {
    const yearStudents = relevantStudents.filter((s) => Number(s.year) === year);
    return {
      year: `Year ${year}`,
      students: yearStudents.length,
    };
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div
        className="glass-card"
        style={{
          padding: '28px 32px',
          marginBottom: '32px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
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
                  color: '#34d399',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Faculty Analytics Console
              </span>
              <span style={{ color: '#64748b' }}>&bull;</span>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Department: <strong style={{ color: '#e2e8f0' }}>{facultyDept || 'All Engineering'}</strong>
              </span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
              Hello, {user.name || 'Professor'} 👋
            </h1>
            <p style={{ color: '#cbd5e1', fontSize: '0.92rem', marginTop: '4px' }}>
              Observational monitoring, attendance auditing, and department circular management.
            </p>
          </div>
        </div>

        {/* Scope Toggle */}
        {facultyDept && (
          <div
            style={{
              display: 'flex',
              background: 'rgba(15, 23, 42, 0.8)',
              padding: '4px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <button
              onClick={() => setDepartmentFilter('dept')}
              style={{
                background: departmentFilter === 'dept' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
                color: departmentFilter === 'dept' ? '#34d399' : '#94a3b8',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              My Dept ({facultyDept.split(' ')[0]})
            </button>
            <button
              onClick={() => setDepartmentFilter('all')}
              style={{
                background: departmentFilter === 'all' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
                color: departmentFilter === 'all' ? '#34d399' : '#94a3b8',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              All Students
            </button>
          </div>
        )}
      </div>

      {/* 4 Analytical Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        {/* Metric 1: Total Department Students */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.84rem', fontWeight: 600 }}>
              Enrolled Students
            </span>
            <div
              className="icon-badge"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <Users size={18} color="#34d399" />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc' }}>
            {loading ? '...' : totalRelevant}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px' }}>
            {departmentFilter === 'dept' ? `${facultyDept} cohorts` : 'Campus-wide roster'}
          </div>
        </div>

        {/* Metric 2: Today's Overall Attendance % */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.84rem', fontWeight: 600 }}>
              Today&apos;s Attendance
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
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: todayPercentage >= 75 ? '#34d399' : '#fbbf24' }}>
            {loading ? '...' : `${todayPercentage}%`}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px' }}>
            {effectiveTodayPresent} of {totalRelevant} students marked today
          </div>
        </div>

        {/* Metric 3: Critical Attendance (< 75%) */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.84rem', fontWeight: 600 }}>
              At-Risk (&lt; 75%)
            </span>
            <div
              className="icon-badge"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <ShieldAlert size={18} color="#f87171" />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: atRiskStudents.length > 0 ? '#f87171' : '#34d399' }}>
            {loading ? '...' : atRiskStudents.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px' }}>
            Students facing exam debarment risk
          </div>
        </div>

        {/* Metric 4: Pending Queries */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.84rem', fontWeight: 600 }}>
              Student Inquiries
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
              <MessageSquare size={18} color="#fbbf24" />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc' }}>
            {loading ? '...' : pendingFeedbackCount}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px' }}>
            Awaiting faculty review / response
          </div>
        </div>
      </div>

      {/* Recharts Visualizations Grid */}
      <div className="responsive-grid-split" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Chart 1: Today's Status Breakdown */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px' }}>
            Today&apos;s Department Status Distribution
          </h2>
          {statusPieData.length === 0 ? (
            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              No check-in logs recorded today yet.
            </div>
          ) : (
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#1e293b',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 2: Cohort Enrolment by Year */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px' }}>
            Students Enrolled by Academic Year
          </h2>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={yearDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#f8fafc',
                  }}
                />
                <Bar dataKey="students" name="Students" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* At-Risk (< 75%) Students Alert Table */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={20} color="#f87171" />
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
                Students Requiring Attendance Intervention (&lt; 75%)
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '2px' }}>
                University exam policy mandates minimum 75% attendance. These students require counseling.
              </p>
            </div>
          </div>
          <Link
            to="/faculty/overview"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#34d399',
              fontSize: '0.84rem',
              fontWeight: 600,
            }}
          >
            <span>Full Class Analytics</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {atRiskStudents.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: '#34d399' }}>
            <CheckCircle2 size={32} style={{ margin: '0 auto 8px' }} />
            <div style={{ fontWeight: 600 }}>Excellent! All students are currently meeting the 75% threshold.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
                  <th style={{ padding: '10px 12px' }}>Roll Number</th>
                  <th style={{ padding: '10px 12px' }}>Student Name</th>
                  <th style={{ padding: '10px 12px' }}>Cohort</th>
                  <th style={{ padding: '10px 12px' }}>Attended / Total</th>
                  <th style={{ padding: '10px 12px' }}>Attendance %</th>
                  <th style={{ padding: '10px 12px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {atRiskStudents.map((s) => (
                  <tr
                    key={s.studentId}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      background: 'rgba(239, 68, 68, 0.05)',
                    }}
                  >
                    <td style={{ padding: '12px', fontWeight: 700, color: '#f8fafc' }}>
                      {s.rollNumber}
                    </td>
                    <td style={{ padding: '12px', color: '#e2e8f0' }}>{s.name}</td>
                    <td style={{ padding: '12px', color: '#94a3b8' }}>
                      Yr {s.year} &bull; Sec {s.section}
                    </td>
                    <td style={{ padding: '12px', color: '#cbd5e1' }}>
                      {s.presentSessions} / {s.totalSessions}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 800, color: '#f87171' }}>
                      {s.rate}%
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Link
                        to={`/faculty/mark?studentId=${s.studentId}`}
                        className="btn-secondary"
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.78rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <CheckSquare size={13} />
                        <span>Update Attendance</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Navigation Cards */}
      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', color: '#cbd5e1' }}>
        Faculty Quick Actions
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <Link
          to="/faculty/overview"
          className="glass-card"
          style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
        >
          <div
            className="icon-badge"
            style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)' }}
          >
            <BarChart3 size={22} color="#34d399" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>Attendance Overview</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Filter cohorts & track trends</div>
          </div>
        </Link>

        <Link
          to="/faculty/mark"
          className="glass-card"
          style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.4)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
        >
          <div
            className="icon-badge"
            style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(14, 165, 233, 0.15)' }}
          >
            <CheckSquare size={22} color="#38bdf8" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>Manual Correction</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Override / rectify records</div>
          </div>
        </Link>

        <Link
          to="/faculty/notices"
          className="glass-card"
          style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
        >
          <div
            className="icon-badge"
            style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)' }}
          >
            <Megaphone size={22} color="#fbbf24" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>Broadcast Notice</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Target specific years or sections</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
