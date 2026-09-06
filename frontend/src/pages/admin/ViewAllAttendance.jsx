import React, { useState, useEffect } from 'react';
import { Download, Search, X } from 'lucide-react';
import { getAllAttendance, getStudents } from '../../api/offlineSync';
import Avatar from '../../components/Avatar';

export default function ViewAllAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const [attData, stuData] = await Promise.all([
        getAllAttendance(),
        getStudents(),
      ]);

      // Enhance records with student details if not populated
      const studentMap = {};
      stuData.forEach((s) => {
        studentMap[s.studentId] = s;
      });

      const enriched = attData.map((r) => {
        const studentInfo = r.student || studentMap[r.studentId] || {};
        return {
          ...r,
          student: studentInfo,
          studentName: studentInfo.name || 'Unknown Student',
          rollNumber: studentInfo.rollNumber || 'N/A',
          department: studentInfo.department || 'N/A',
        };
      });

      setRecords(enriched);
    } catch (err) {
      console.warn('Failed to load attendance:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredRecords = records.filter((r) => {
    const matchesDate = !selectedDate || r.date === selectedDate;
    const matchesStatus = selectedStatus === 'All' || r.status === selectedStatus;
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.department.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesDate && matchesStatus && matchesSearch;
  });

  // Client-Side CSV Export
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      alert('No attendance records to export.');
      return;
    }

    const headers = ['Attendance ID', 'Date', 'Time In', 'Roll Number', 'Student Name', 'Department', 'Status', 'Marked By'];
    const rows = filteredRecords.map((r) => [
      r.attendanceId,
      r.date,
      r.timeIn || '—',
      `"${r.rollNumber}"`,
      `"${r.studentName}"`,
      `"${r.department}"`,
      r.status,
      r.markedBy,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `attendance_export_${selectedDate || 'all'}_${new Date().toISOString().split('T')[0]}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginBottom: '4px' }}>
            Comprehensive Attendance Logs
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
            Audit attendance records across all students with GPS status flags
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="btn-secondary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            color: '#a5b4fc',
          }}
        >
          <Download size={16} />
          <span>Export to CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '18px 20px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '36px' }}
            placeholder="Search by student name or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Date Filter */}
        <div style={{ minWidth: '160px' }}>
          <input
            type="date"
            className="input-field"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            title="Filter by date"
          />
        </div>

        {/* Clear Date */}
        {selectedDate && (
          <button
            onClick={() => setSelectedDate('')}
            className="btn-secondary"
            style={{ padding: '8px 12px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <X size={13} />
            <span>Clear Date</span>
          </button>
        )}

        {/* Status Filter */}
        <div style={{ minWidth: '160px' }}>
          <select
            className="input-field"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ cursor: 'pointer' }}
          >
            <option value="All">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Present-OutOfRange">Present (Out-Of-Range)</option>
            <option value="Absent">Absent</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ padding: '20px', overflowX: 'auto' }}>
        {loading ? (
          <p style={{ color: '#94a3b8', padding: '20px' }}>Loading attendance records...</p>
        ) : filteredRecords.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
            No attendance entries match current filters.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
                <th style={{ padding: '12px 10px' }}>Date</th>
                <th style={{ padding: '12px 10px' }}>Roll Number</th>
                <th style={{ padding: '12px 10px' }}>Student Name</th>
                <th style={{ padding: '12px 10px' }}>Department</th>
                <th style={{ padding: '12px 10px' }}>Time In</th>
                <th style={{ padding: '12px 10px' }}>Status</th>
                <th style={{ padding: '12px 10px' }}>Marked By</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r, idx) => (
                <tr
                  key={r.attendanceId || idx}
                  style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background 0.15s' }}
                >
                  <td style={{ padding: '12px 10px', fontWeight: 600 }}>{r.date}</td>
                  <td style={{ padding: '12px 10px', fontWeight: 700, color: '#818cf8' }}>{r.rollNumber}</td>
                  <td style={{ padding: '12px 10px', fontWeight: 600, color: '#f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Avatar user={r.student} size="xs" />
                      <span>{r.studentName}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 10px', color: '#cbd5e1' }}>{r.department}</td>
                  <td style={{ padding: '12px 10px', color: '#94a3b8' }}>{r.timeIn || '—'}</td>
                  <td style={{ padding: '12px 10px' }}>
                    <span
                      className={`badge ${
                        r.status === 'Present'
                          ? 'badge-present'
                          : r.status === 'Late'
                          ? 'badge-late'
                          : r.status === 'Absent'
                          ? 'badge-absent'
                          : 'badge-outofboundary'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', textTransform: 'capitalize', color: '#94a3b8' }}>
                    {r.markedBy}
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
