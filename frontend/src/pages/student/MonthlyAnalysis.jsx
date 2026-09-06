import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Award,
  Calendar,
  Layers,
} from 'lucide-react';
import { getStudentAttendance } from '../../api/offlineSync';

export default function MonthlyAnalysis() {
  const user = JSON.parse(localStorage.getItem('attendance_user') || '{}');

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [overallStats, setOverallStats] = useState({
    total: 0,
    present: 0,
    late: 0,
    absent: 0,
    outOfRange: 0,
    rate: 0,
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        if (user.studentId) {
          const data = await getStudentAttendance(user.studentId);
          setRecords(data);

          // Group by Month (YYYY-MM)
          const monthsMap = {};
          const monthNames = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
          ];

          data.forEach((r) => {
            if (!r.date) return;
            const ym = r.date.substring(0, 7); // e.g. "2026-09"
            if (!monthsMap[ym]) {
              const [year, month] = ym.split('-');
              const monthLabel = `${monthNames[parseInt(month, 10) - 1]} ${year}`;
              monthsMap[ym] = {
                key: ym,
                month: monthLabel,
                Present: 0,
                Late: 0,
                OutOfRange: 0,
                Absent: 0,
                Total: 0,
              };
            }

            monthsMap[ym].Total++;
            if (r.status === 'Present') monthsMap[ym].Present++;
            else if (r.status === 'Late') monthsMap[ym].Late++;
            else if (r.status === 'Present-OutOfRange') monthsMap[ym].OutOfRange++;
            else if (r.status === 'Absent') monthsMap[ym].Absent++;
          });

          // Sort months ascending for chronological chart view
          const sortedMonths = Object.keys(monthsMap)
            .sort()
            .map((k) => {
              const m = monthsMap[k];
              const effective = m.Present + m.Late + m.OutOfRange;
              const rate = m.Total > 0 ? Math.round((effective / m.Total) * 100) : 0;
              return {
                ...m,
                Rate: rate,
              };
            });

          setMonthlyData(sortedMonths);

          // Compute overall stats
          const total = data.length;
          const present = data.filter((r) => r.status === 'Present').length;
          const late = data.filter((r) => r.status === 'Late').length;
          const outOfRange = data.filter((r) => r.status === 'Present-OutOfRange').length;
          const absent = data.filter((r) => r.status === 'Absent').length;
          const effective = present + late + outOfRange;
          const rate = total > 0 ? Math.round((effective / total) * 100) : 0;

          setOverallStats({
            total,
            present,
            late,
            absent,
            outOfRange,
            rate,
          });
        }
      } catch (err) {
        console.warn('Error loading monthly analysis:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user.studentId]);

  // Threshold evaluation
  const getStatusBadge = (rate) => {
    if (rate >= 75) {
      return {
        label: 'Good Standing',
        variant: 'badge-present',
        color: '#10b981',
        icon: ShieldCheck,
        description: 'Meets university minimum criteria (>75%) for end-semester exams.',
      };
    }
    if (rate >= 65) {
      return {
        label: 'Warning (65% - 74%)',
        variant: 'badge-late',
        color: '#fbbf24',
        icon: AlertTriangle,
        description: 'Below 75%. You are at risk of debarment without medical condonation.',
      };
    }
    return {
      label: 'Critical Shortage (<65%)',
      variant: 'badge-absent',
      color: '#f87171',
      icon: ShieldAlert,
      description: 'Severe attendance shortage. Ineligible for final semester exams.',
    };
  };

  const currentStatus = getStatusBadge(overallStats.rate);
  const StatusIcon = currentStatus.icon;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
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
            <BarChart3 size={20} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Monthly Attendance Analysis
          </h1>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>
          Visual performance trends, status breakdowns, and university 75% exam compliance check.
        </p>
      </div>

      {/* Compliance / Status Banner */}
      <div
        className="glass-card"
        style={{
          padding: '24px 28px',
          marginBottom: '32px',
          borderLeft: `5px solid ${currentStatus.color}`,
          background: `rgba(15, 23, 42, 0.85)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            className="icon-badge"
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: `${currentStatus.color}20`,
              border: `1.5px solid ${currentStatus.color}50`,
            }}
          >
            <StatusIcon size={26} color={currentStatus.color} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
                Academic Compliance:
              </span>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: `${currentStatus.color}25`,
                  color: currentStatus.color,
                  border: `1px solid ${currentStatus.color}40`,
                }}
              >
                {currentStatus.label}
              </span>
            </div>
            <div style={{ color: '#cbd5e1', fontSize: '0.88rem', marginTop: '4px' }}>
              {currentStatus.description}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>CUMULATIVE ATTENDANCE</div>
          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: currentStatus.color, lineHeight: '1.1' }}>
            {overallStats.rate}%
          </div>
        </div>
      </div>

      {/* Grid: Bar Chart & Line Chart */}
      <div className="responsive-grid-split" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Chart 1: Monthly Attendance Breakdown */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Layers size={18} color="#38bdf8" />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
              Monthly Session Status Breakdown
            </h2>
          </div>

          {loading ? (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              Loading chart...
            </div>
          ) : monthlyData.length === 0 ? (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              No session data available for chart.
            </div>
          ) : (
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#1e293b',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />
                  <Bar dataKey="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Late" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="OutOfRange" name="Out-of-Range" fill="#c084fc" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 2: Attendance Percentage Trend */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <TrendingUp size={18} color="#10b981" />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
              Monthly Attendance % Trend
            </h2>
          </div>

          {loading ? (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              Loading trend...
            </div>
          ) : monthlyData.length === 0 ? (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              No monthly trend available.
            </div>
          ) : (
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} unit="%" />
                  <Tooltip
                    contentStyle={{
                      background: '#1e293b',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                    }}
                    formatter={(val) => [`${val}%`, 'Attendance Rate']}
                  />
                  <Line
                    type="monotone"
                    dataKey="Rate"
                    stroke="#0ea5e9"
                    strokeWidth={3}
                    dot={{ fill: '#38bdf8', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Month-by-Month Aggregate Breakdown Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px' }}>
          Month-by-Month Summary Details
        </h2>

        {monthlyData.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No monthly data available.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
                  <th style={{ padding: '12px 14px' }}>Month</th>
                  <th style={{ padding: '12px 14px' }}>Total Classes</th>
                  <th style={{ padding: '12px 14px' }}>Present</th>
                  <th style={{ padding: '12px 14px' }}>Late</th>
                  <th style={{ padding: '12px 14px' }}>Out-of-Range</th>
                  <th style={{ padding: '12px 14px' }}>Absent</th>
                  <th style={{ padding: '12px 14px' }}>Monthly Rate</th>
                  <th style={{ padding: '12px 14px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((m) => {
                  const mStatus = getStatusBadge(m.Rate);
                  return (
                    <tr key={m.key} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#f8fafc' }}>
                        {m.month}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#cbd5e1' }}>{m.Total}</td>
                      <td style={{ padding: '12px 14px', color: '#34d399', fontWeight: 600 }}>{m.Present}</td>
                      <td style={{ padding: '12px 14px', color: '#fbbf24' }}>{m.Late}</td>
                      <td style={{ padding: '12px 14px', color: '#c084fc' }}>{m.OutOfRange}</td>
                      <td style={{ padding: '12px 14px', color: '#f87171' }}>{m.Absent}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: mStatus.color }}>
                        {m.Rate}%
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: `${mStatus.color}20`,
                            color: mStatus.color,
                          }}
                        >
                          {m.Rate >= 75 ? 'Good' : m.Rate >= 65 ? 'Warning' : 'Critical'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
