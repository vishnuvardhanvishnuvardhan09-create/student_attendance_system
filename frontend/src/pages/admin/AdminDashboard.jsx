import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  GraduationCap,
  Users,
  TrendingUp,
  Inbox,
  PieChart as PieIcon,
  BarChart3,
} from 'lucide-react';
import { getDashboardSummary, getAllAttendance, getStudents } from '../../api/offlineSync';

const STATUS_COLORS = {
  Present: '#10b981',
  Late: '#f59e0b',
  'Present-OutOfRange': '#8b5cf6',
  Absent: '#ef4444',
};

export default function AdminDashboard() {
  const [summary, setSummary] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    todayAttendancePercentage: 0,
    presentTodayCount: 0,
    pendingFeedback: 0,
  });
  const [attendanceData, setAttendanceData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [sumRes, attRes, stuRes] = await Promise.all([
          getDashboardSummary(),
          getAllAttendance(),
          getStudents(),
        ]);

        setSummary(sumRes);

        // Process Attendance for today's status breakdown
        const todayStr = new Date().toISOString().split('T')[0];
        const todaysRecords = attRes.filter((a) => a.date === todayStr);

        const statusCounts = {
          Present: 0,
          Late: 0,
          'Present-OutOfRange': 0,
          Absent: 0,
        };

        todaysRecords.forEach((r) => {
          if (statusCounts[r.status] !== undefined) {
            statusCounts[r.status]++;
          } else {
            statusCounts.Present++;
          }
        });

        // Compute absents if less than total students
        const recorded = todaysRecords.length;
        if (sumRes.totalStudents > recorded) {
          statusCounts.Absent = sumRes.totalStudents - recorded;
        }

        const pieFormatted = Object.keys(statusCounts).map((key) => ({
          name: key,
          value: statusCounts[key],
          color: STATUS_COLORS[key] || '#94a3b8',
        }));
        setAttendanceData(pieFormatted);

        // Process Department breakdown from students list
        const deptCounts = {};
        stuRes.forEach((s) => {
          const dept = s.department || 'General';
          deptCounts[dept] = (deptCounts[dept] || 0) + 1;
        });

        const barFormatted = Object.keys(deptCounts).map((dept) => ({
          department: dept.length > 15 ? dept.substring(0, 13) + '..' : dept,
          fullName: dept,
          students: deptCounts[dept],
        }));
        setDepartmentData(barFormatted);
      } catch (err) {
        console.warn('Dashboard load warning:', err.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const cards = [
    {
      title: 'Total Students',
      value: summary.totalStudents,
      sub: 'Enrolled across all departments',
      Icon: GraduationCap,
      accent: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.1)',
      border: 'rgba(56, 189, 248, 0.25)',
    },
    {
      title: 'Active Faculty',
      value: summary.totalFaculty,
      sub: 'Teaching staff members',
      Icon: Users,
      accent: '#34d399',
      bg: 'rgba(52, 211, 153, 0.1)',
      border: 'rgba(52, 211, 153, 0.25)',
    },
    {
      title: "Today's Attendance",
      value: `${summary.todayAttendancePercentage}%`,
      sub: `${summary.presentTodayCount} of ${summary.totalStudents} present`,
      Icon: TrendingUp,
      accent: '#818cf8',
      bg: 'rgba(129, 140, 248, 0.1)',
      border: 'rgba(129, 140, 248, 0.25)',
    },
    {
      title: 'Pending Feedback',
      value: summary.pendingFeedback,
      sub: 'Awaiting administrative review',
      Icon: Inbox,
      accent: '#fbbf24',
      bg: 'rgba(251, 191, 36, 0.1)',
      border: 'rgba(251, 191, 36, 0.25)',
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>
          Executive Dashboard
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>
          Real-time metrics, attendance trends, and campus analytics
        </p>
      </div>

      {/* 4 Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        {cards.map((card, idx) => {
          const Icon = card.Icon;
          return (
            <div
              key={idx}
              className="glass-card"
              style={{
                padding: '24px',
                borderLeft: `4px solid ${card.accent}`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '0.84rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {card.title}
                  </div>
                  <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#f8fafc', marginTop: '6px' }}>
                    {loading ? '—' : card.value}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '6px' }}>
                    {card.sub}
                  </div>
                </div>
                <div
                  className="icon-badge"
                  style={{
                    background: card.bg,
                    border: `1px solid ${card.border}`,
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                  }}
                >
                  <Icon size={24} color={card.accent} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="responsive-grid-split" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Attendance Breakdown Pie Chart */}
        <div className="glass-card" style={{ padding: '26px' }}>
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <PieIcon size={18} color="#818cf8" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                Today's Attendance Distribution
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              Status breakdown for current academic date
            </p>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    color: '#f8fafc',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(val) => <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Enrollment Bar Chart */}
        <div className="glass-card" style={{ padding: '26px' }}>
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <BarChart3 size={18} color="#818cf8" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                Students by Department
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              Active enrollment across academic disciplines
            </p>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="department"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  interval={0}
                />
                <YAxis
                  allowDecimals={false}
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    color: '#f8fafc',
                  }}
                  formatter={(val, name, item) => [val, item.payload.fullName]}
                />
                <Bar dataKey="students" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
