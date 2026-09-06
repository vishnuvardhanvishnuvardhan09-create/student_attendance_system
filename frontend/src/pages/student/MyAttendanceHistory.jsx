import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { getStudentAttendance } from '../../api/offlineSync';

export default function MyAttendanceHistory() {
  const user = JSON.parse(localStorage.getItem('attendance_user') || '{}');

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const fetchRecords = async () => {
    setLoading(true);
    try {
      if (user.studentId) {
        const data = await getStudentAttendance(user.studentId);
        // Sort descending by date
        const sorted = [...data].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        setRecords(sorted);
      }
    } catch (err) {
      console.warn('Error fetching student attendance history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [user.studentId]);

  // Extract unique months (e.g. "2026-09") for the month filter dropdown
  const availableMonths = Array.from(
    new Set(
      records
        .map((r) => r.date ? r.date.substring(0, 7) : null)
        .filter(Boolean)
    )
  ).sort().reverse();

  // Apply filters
  const filteredRecords = records.filter((r) => {
    if (selectedMonth !== 'ALL') {
      if (!r.date || !r.date.startsWith(selectedMonth)) return false;
    }
    if (selectedStatus !== 'ALL') {
      if (r.status !== selectedStatus) return false;
    }
    return true;
  });

  // Calculate stats for current filter selection
  const totalCount = filteredRecords.length;
  const presentCount = filteredRecords.filter((r) => r.status === 'Present').length;
  const lateCount = filteredRecords.filter((r) => r.status === 'Late').length;
  const outOfRangeCount = filteredRecords.filter((r) => r.status === 'Present-OutOfRange').length;
  const absentCount = filteredRecords.filter((r) => r.status === 'Absent').length;
  const effectivePresent = presentCount + lateCount + outOfRangeCount;
  const attendanceRate = totalCount > 0 ? Math.round((effectivePresent / totalCount) * 100) : 0;

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
                background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
              }}
            >
              <ClipboardList size={20} color="#ffffff" />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
              My Attendance History
            </h1>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>
            Complete audit log of all your recorded check-ins and session statuses.
          </p>
        </div>

        <button
          onClick={fetchRecords}
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
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary Stat Badges */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>Total Sessions</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>
            {totalCount}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px', borderLeft: '3px solid #10b981' }}>
          <div style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 600 }}>Present</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
            {presentCount}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px', borderLeft: '3px solid #fbbf24' }}>
          <div style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 600 }}>Late</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24', marginTop: '4px' }}>
            {lateCount}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px', borderLeft: '3px solid #a855f7' }}>
          <div style={{ fontSize: '0.78rem', color: '#c084fc', fontWeight: 600 }}>Out of Range</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#c084fc', marginTop: '4px' }}>
            {outOfRangeCount}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px', borderLeft: '3px solid #ef4444' }}>
          <div style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: 600 }}>Absent</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f87171', marginTop: '4px' }}>
            {absentCount}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px', borderLeft: '3px solid #0284c7' }}>
          <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600 }}>Attendance Rate</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
            {attendanceRate}%
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.88rem' }}>
          <Filter size={16} color="#38bdf8" />
          <span style={{ fontWeight: 600 }}>Filter By:</span>
        </div>

        {/* Month Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Month:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input-field"
            style={{ width: 'auto', padding: '8px 12px', fontSize: '0.86rem' }}
          >
            <option value="ALL">All Recorded Months</option>
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Status Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input-field"
            style={{ width: 'auto', padding: '8px 12px', fontSize: '0.86rem' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Present-OutOfRange">Present-OutOfRange</option>
            <option value="Absent">Absent</option>
          </select>
        </div>

        {(selectedMonth !== 'ALL' || selectedStatus !== 'ALL') && (
          <button
            onClick={() => {
              setSelectedMonth('ALL');
              setSelectedStatus('ALL');
            }}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem', marginLeft: 'auto' }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Table Card */}
      <div className="glass-card" style={{ padding: '24px', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            <div>Loading your attendance history...</div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
            <ClipboardList size={36} color="#64748b" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#cbd5e1' }}>No Records Found</div>
            <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
              No attendance logs match your selected filter criteria.
            </div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
                <th style={{ padding: '12px 14px' }}>Date</th>
                <th style={{ padding: '12px 14px' }}>Time In</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px' }}>Verification Mode</th>
                <th style={{ padding: '12px 14px' }}>GPS Location</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((row) => (
                <tr
                  key={row.attendanceId || `${row.date}-${row.timeIn}`}
                  style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
                >
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: '#f1f5f9' }}>
                    {row.date}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#94a3b8' }}>
                    {row.timeIn || '—'}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
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
                  <td style={{ padding: '12px 14px', color: '#cbd5e1', textTransform: 'capitalize' }}>
                    {row.markedBy === 'self' ? 'Student Self-Check' : row.markedBy || 'Faculty'}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#64748b' }}>
                    {row.latitude && row.longitude ? (
                      <span>
                        {Number(row.latitude).toFixed(4)}, {Number(row.longitude).toFixed(4)}
                      </span>
                    ) : (
                      '—'
                    )}
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
