import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  BarChart3,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Users,
  CheckSquare,
  ShieldAlert,
  ArrowUpDown,
  RefreshCw,
  QrCode,
} from 'lucide-react';
import { getStudents, getAllAttendance } from '../../api/offlineSync';
import Avatar from '../../components/Avatar';

export default function StudentAttendanceOverview() {
  const user = JSON.parse(localStorage.getItem('attendance_user') || '{}');
  const facultyDept = user.department || '';

  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyAtRisk, setOnlyAtRisk] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stuData, attData] = await Promise.all([
        getStudents(),
        getAllAttendance(),
      ]);
      setStudents(stuData);
      setAttendance(attData);
    } catch (err) {
      console.warn('Error fetching overview data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute attendance stats per student
  const studentRows = students.map((s) => {
    const records = attendance.filter(
      (a) => (a.student?.studentId || a.studentId) === s.studentId
    );
    const total = records.length;
    const presentCount = records.filter(
      (a) => a.status === 'Present' || a.status === 'Late' || a.status === 'Present-OutOfRange'
    ).length;
    const lateCount = records.filter((a) => a.status === 'Late').length;
    const outOfRangeCount = records.filter((a) => a.status === 'Present-OutOfRange').length;
    const absentCount = records.filter((a) => a.status === 'Absent').length;
    const rate = total > 0 ? Math.round((presentCount / total) * 100) : 100;

    return {
      ...s,
      total,
      presentCount,
      lateCount,
      outOfRangeCount,
      absentCount,
      rate,
      isAtRisk: rate < 75,
    };
  });

  // Apply filters
  const filteredRows = studentRows.filter((s) => {
    if (selectedYear !== 'ALL' && String(s.year) !== String(selectedYear)) return false;
    if (selectedSection !== 'ALL' && String(s.section).toUpperCase() !== String(selectedSection).toUpperCase()) return false;
    if (onlyAtRisk && !s.isAtRisk) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchRoll = (s.rollNumber || '').toLowerCase().includes(q);
      const matchName = (s.name || '').toLowerCase().includes(q);
      const matchDept = (s.department || '').toLowerCase().includes(q);
      if (!matchRoll && !matchName && !matchDept) return false;
    }
    return true;
  });

  // Calculate high-level cohort aggregates
  const totalFiltered = filteredRows.length;
  const avgRate =
    totalFiltered > 0
      ? Math.round(filteredRows.reduce((acc, s) => acc + s.rate, 0) / totalFiltered)
      : 0;
  const atRiskCount = filteredRows.filter((s) => s.isAtRisk).length;
  const safeCount = totalFiltered - atRiskCount;

  // Chart data: preview top 15 students in current filtered view
  const chartData = filteredRows.slice(0, 15).map((s) => ({
    name: s.rollNumber || s.name.split(' ')[0],
    fullName: s.name,
    rate: s.rate,
    color: s.rate >= 75 ? '#10b981' : '#ef4444',
  }));

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
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
                background: 'linear-gradient(135deg, #059669, #10b981)',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              }}
            >
              <BarChart3 size={20} color="#ffffff" />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
              Student Attendance Overview
            </h1>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>
            Read-only analytical observation of student attendance trends, class cohorts, and debarment risks.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="btn-secondary"
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.88rem',
            padding: '9px 16px',
          }}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Cohort Metric Counters */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>Cohort Size</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>
            {totalFiltered} Students
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px', borderLeft: '3px solid #10b981' }}>
          <div style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 600 }}>Cohort Average %</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: avgRate >= 75 ? '#34d399' : '#fbbf24', marginTop: '4px' }}>
            {avgRate}%
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px', borderLeft: '3px solid #059669' }}>
          <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>Eligible (&ge; 75%)</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
            {safeCount}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px', borderLeft: '3px solid #ef4444' }}>
          <div style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: 600 }}>Flagged Low (&lt; 75%)</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#f87171', marginTop: '4px' }}>
            {atRiskCount}
          </div>
        </div>
      </div>

      {/* Recharts Bar Chart Visualizing Student Trends */}
      {chartData.length > 0 && (
        <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                Attendance Rate Comparison (75% Minimum Threshold)
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                Red bars denote students currently failing the 75% examination eligibility requirement.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.78rem', color: '#cbd5e1' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '3px' }} /> &ge; 75%
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '3px' }} /> &lt; 75% (Flagged)
              </span>
            </div>
          </div>

          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} unit="%" />
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#f8fafc',
                  }}
                  formatter={(val, name, item) => [`${val}% (${item.payload.fullName})`, 'Attendance Rate']}
                />
                <ReferenceLine y={75} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: '75% Cutoff', fill: '#f59e0b', fontSize: 11 }} />
                <Bar
                  dataKey="rate"
                  radius={[4, 4, 0, 0]}
                  // dynamically fill by rate
                  fill="#10b981"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div
        className="glass-card"
        style={{
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: '220px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search by student name, roll number, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f8fafc',
              width: '100%',
              fontSize: '0.9rem',
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '0.8rem',
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Year Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Year:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="input-field"
            style={{ width: 'auto', padding: '8px 12px', fontSize: '0.86rem' }}
          >
            <option value="ALL">All Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>

        {/* Section Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Section:</span>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="input-field"
            style={{ width: 'auto', padding: '8px 12px', fontSize: '0.86rem' }}
          >
            <option value="ALL">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>

        {/* Low Attendance Toggle */}
        <button
          onClick={() => setOnlyAtRisk(!onlyAtRisk)}
          style={{
            background: onlyAtRisk ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${onlyAtRisk ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
            color: onlyAtRisk ? '#f87171' : '#94a3b8',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <ShieldAlert size={15} color={onlyAtRisk ? '#f87171' : '#94a3b8'} />
          <span>Flagged Low (&lt;75%) Only</span>
        </button>
      </div>

      {/* Read-Only Attendance Table with Visual Low-Attendance Highlight */}
      <div className="glass-card" style={{ padding: '24px', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            <div>Loading student attendance metrics...</div>
          </div>
        ) : filteredRows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
            <Users size={36} color="#64748b" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#cbd5e1' }}>No Students Match Filter</div>
            <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
              Try adjusting your Year, Section, or search criteria.
            </div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
                <th style={{ padding: '12px 14px' }}>Roll Number</th>
                <th style={{ padding: '12px 14px' }}>Student Name</th>
                <th style={{ padding: '12px 14px' }}>Department</th>
                <th style={{ padding: '12px 14px' }}>Class</th>
                <th style={{ padding: '12px 14px' }}>Sessions</th>
                <th style={{ padding: '12px 14px' }}>Attendance Rate</th>
                <th style={{ padding: '12px 14px' }}>Eligibility Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Faculty Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr
                  key={row.studentId}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    // Visual Red/Crimson highlight if attendance is under 75%
                    background: row.isAtRisk ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
                    transition: 'background 0.2s',
                  }}
                >
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: row.isAtRisk ? '#fca5a5' : '#f8fafc' }}>
                    {row.rollNumber}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#f1f5f9', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Avatar user={row} size="xs" />
                      <span>{row.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', color: '#94a3b8' }}>
                    {row.department}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#cbd5e1' }}>
                    Yr {row.year} &bull; Sec {row.section}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#94a3b8' }}>
                    <span style={{ color: '#34d399' }}>{row.presentCount}</span> / {row.total}
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 800, fontSize: '0.95rem', color: row.isAtRisk ? '#f87171' : '#34d399' }}>
                    {row.rate}%
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    {row.isAtRisk ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: 'rgba(239, 68, 68, 0.2)',
                          color: '#f87171',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                        }}
                      >
                        <AlertTriangle size={12} />
                        <span>Debarment Risk</span>
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#34d399',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                        }}
                      >
                        <CheckCircle2 size={12} />
                        <span>Exam Clearance</span>
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    <Link
                      to={`/student/profile?studentId=${row.studentId}`}
                      className="btn-secondary"
                      style={{
                        padding: '6px 10px',
                        fontSize: '0.78rem',
                        marginRight: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#38bdf8',
                        borderColor: 'rgba(56, 189, 248, 0.3)',
                      }}
                    >
                      <QrCode size={13} />
                      <span>ID Badge</span>
                    </Link>
                    <Link
                      to={`/faculty/mark?studentId=${row.studentId}`}
                      className="btn-secondary"
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.78rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <CheckSquare size={13} />
                      <span>Rectify</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
