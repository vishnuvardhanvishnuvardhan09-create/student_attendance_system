import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Clock,
  Sparkles,
  Calendar,
  CheckCircle2,
  BookmarkCheck,
  Search,
} from 'lucide-react';
import { getHolidays } from '../../api/offlineSync';

export default function HolidaysView() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadHolidays() {
      setLoading(true);
      try {
        const data = await getHolidays();
        // Sort ascending by date
        const sorted = [...data].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
        setHolidays(sorted);
      } catch (err) {
        console.warn('Error loading holidays:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHolidays();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to compute countdown text
  const getCountdown = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr === todayStr) return { text: 'Today! 🎉', isUpcoming: true, isToday: true };
    if (dateStr < todayStr) return { text: 'Passed', isUpcoming: false, isToday: false };

    const todayDate = new Date(todayStr);
    const holidayDate = new Date(dateStr);
    const diffTime = holidayDate.getTime() - todayDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      text: `In ${diffDays} day${diffDays === 1 ? '' : 's'}`,
      isUpcoming: true,
      isToday: false,
    };
  };

  const filteredHolidays = holidays.filter((h) => {
    const q = searchTerm.toLowerCase();
    return (
      (h.title && h.title.toLowerCase().includes(q)) ||
      (h.description && h.description.toLowerCase().includes(q)) ||
      (h.date && h.date.includes(q))
    );
  });

  const upcomingCount = holidays.filter((h) => h.date >= todayStr).length;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
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
                background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)',
              }}
            >
              <CalendarDays size={20} color="#ffffff" />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
              Academic Holidays Calendar
            </h1>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>
            Official university holidays, observances, and scheduled academic breaks for 2026.
          </p>
        </div>

        {/* Counter Pill */}
        <div
          className="glass-card"
          style={{
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid rgba(245, 158, 11, 0.3)',
          }}
        >
          <Sparkles size={16} color="#fbbf24" />
          <span style={{ fontSize: '0.84rem', color: '#cbd5e1' }}>
            <strong style={{ color: '#fbbf24' }}>{upcomingCount}</strong> upcoming holiday{upcomingCount === 1 ? '' : 's'} remaining
          </span>
        </div>
      </div>

      {/* Search Input Filter */}
      <div
        className="glass-card"
        style={{
          padding: '12px 18px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <Search size={18} color="#94a3b8" />
        <input
          type="text"
          placeholder="Search holiday by name, description, or date (e.g. Diwali, 2026-10)..."
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

      {/* Holiday Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
          Loading holidays calendar...
        </div>
      ) : filteredHolidays.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
          <CalendarDays size={40} color="#64748b" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#e2e8f0' }}>No Holidays Found</div>
          <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
            No scheduled holidays match your search query.
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
            gap: '20px',
          }}
        >
          {filteredHolidays.map((holiday) => {
            const countdown = getCountdown(holiday.date);
            return (
              <div
                key={holiday.holidayId || holiday.date}
                className="glass-card"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: countdown.isToday
                    ? '3px solid #10b981'
                    : countdown.isUpcoming
                    ? '3px solid #fbbf24'
                    : '3px solid rgba(255, 255, 255, 0.1)',
                  opacity: countdown.isUpcoming ? 1 : 0.65,
                  transition: 'all 0.2s ease',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: countdown.isToday
                          ? 'rgba(16, 185, 129, 0.2)'
                          : countdown.isUpcoming
                          ? 'rgba(245, 158, 11, 0.2)'
                          : 'rgba(255, 255, 255, 0.05)',
                        color: countdown.isToday
                          ? '#34d399'
                          : countdown.isUpcoming
                          ? '#fbbf24'
                          : '#94a3b8',
                      }}
                    >
                      {countdown.text}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.82rem' }}>
                      <Calendar size={14} />
                      <span>{holiday.date}</span>
                    </div>
                  </div>

                  <h3
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: '#f8fafc',
                      marginBottom: '8px',
                    }}
                  >
                    {holiday.title}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.86rem',
                      color: '#94a3b8',
                      lineHeight: '1.45',
                    }}
                  >
                    {holiday.description || 'University closed. No academic sessions or examinations.'}
                  </p>
                </div>

                <div
                  style={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    marginTop: '18px',
                    paddingTop: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.76rem',
                    color: '#64748b',
                  }}
                >
                  <BookmarkCheck size={14} color="#38bdf8" />
                  <span>College Calendar Holiday</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
