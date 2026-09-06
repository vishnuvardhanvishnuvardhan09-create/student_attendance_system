import React, { useState, useEffect } from 'react';
import { CalendarPlus, Calendar, Trash2 } from 'lucide-react';
import { getHolidays, addHoliday, deleteHoliday } from '../../api/offlineSync';

export default function ManageHolidays() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const adminUser = JSON.parse(localStorage.getItem('attendance_user') || '{}');

  useEffect(() => {
    loadHolidays();
  }, []);

  const loadHolidays = async () => {
    setLoading(true);
    try {
      const data = await getHolidays();
      // Sort chronologically
      const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
      setHolidays(sorted);
    } catch (err) {
      console.warn('Failed to load holidays:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      await addHoliday({
        date,
        title,
        description,
        addedByAdminId: adminUser.adminId || 1,
      });
      setIsModalOpen(false);
      setDate('');
      setTitle('');
      setDescription('');
      loadHolidays();
    } catch (err) {
      setErrorMsg('Failed to add holiday.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, titleText) => {
    if (window.confirm(`Delete holiday "${titleText}"?`)) {
      try {
        await deleteHoliday(id);
        loadHolidays();
      } catch (err) {
        alert('Failed to remove holiday.');
      }
    }
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return { day: '', month: '', full: '' };
    const d = new Date(dateStr + 'T00:00:00');
    const month = d.toLocaleString('default', { month: 'short' });
    const day = d.getDate();
    const year = d.getFullYear();
    const weekday = d.toLocaleString('default', { weekday: 'short' });
    return { day, month, year, weekday, full: `${weekday}, ${month} ${day}, ${year}` };
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginBottom: '4px' }}>
            Academic Calendar & Holidays
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
            Official institutional closures, festivals, and scheduled breaks
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <CalendarPlus size={16} />
          <span>Add Holiday</span>
        </button>
      </div>

      {/* Calendar List */}
      <div className="glass-card" style={{ padding: '24px' }}>
        {loading ? (
          <p style={{ color: '#94a3b8', padding: '20px' }}>Loading academic calendar...</p>
        ) : holidays.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
            No holidays registered on the calendar.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {holidays.map((h) => {
              const dateInfo = formatDisplayDate(h.date);
              return (
                <div
                  key={h.holidayId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {/* Calendar Badge */}
                    <div
                      style={{
                        width: '54px',
                        height: '56px',
                        background: 'rgba(99, 102, 241, 0.15)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase' }}>
                        {dateInfo.month}
                      </span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
                        {dateInfo.day}
                      </span>
                    </div>

                    {/* Holiday Details */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>{h.title}</h3>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>({dateInfo.weekday}, {dateInfo.year})</span>
                      </div>
                      <p style={{ color: '#94a3b8', fontSize: '0.86rem', marginTop: '4px' }}>
                        {h.description || 'Institutional holiday — campus facilities closed.'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <button
                      onClick={() => handleDelete(h.holidayId, h.title)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Trash2 size={12} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Holiday Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '32px', background: '#0f172a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc' }}>Add Calendar Holiday</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.3rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            {errorMsg && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.86rem' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.84rem', color: '#cbd5e1', marginBottom: '6px' }}>Date *</label>
                <input
                  type="date"
                  required
                  className="input-field"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.84rem', color: '#cbd5e1', marginBottom: '6px' }}>Title *</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. Founders Day Celebration"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.84rem', color: '#cbd5e1', marginBottom: '6px' }}>Description</label>
                <textarea
                  rows={3}
                  className="input-field"
                  placeholder="Brief note on holiday festivities or instructions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Adding...' : 'Save Holiday'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
