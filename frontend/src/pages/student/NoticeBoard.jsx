import React, { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  RefreshCw,
  Calendar,
  Users,
  Megaphone,
  Filter,
} from 'lucide-react';
import { getNoticesForAudience } from '../../api/offlineSync';

export default function NoticeBoard() {
  const user = JSON.parse(localStorage.getItem('attendance_user') || '{}');

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('ALL');

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const data = await getNoticesForAudience(user.year || 1, user.section || 'A');
      // Sort descending by postedAt or noticeId
      const sorted = [...data].sort((a, b) => {
        const timeA = new Date(a.postedAt || 0).getTime();
        const timeB = new Date(b.postedAt || 0).getTime();
        return timeB - timeA;
      });
      setNotices(sorted);
    } catch (err) {
      console.warn('Error loading notices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [user.year, user.section]);

  const filteredNotices = notices.filter((n) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (n.title && n.title.toLowerCase().includes(q)) ||
      (n.message && n.message.toLowerCase().includes(q));

    if (!matchesSearch) return false;
    if (audienceFilter !== 'ALL' && n.targetAudience !== audienceFilter) return false;
    return true;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recent';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

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
                background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
              }}
            >
              <Bell size={20} color="#ffffff" />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
              Campus Notice Board
            </h1>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>
            Circulars, deadlines, exam schedules, and department announcements for {user.department || 'your department'}.
          </p>
        </div>

        <button
          onClick={fetchNotices}
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
          <span>Refresh Notices</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-card"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
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
            placeholder="Search circulars by subject, keyword..."
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Audience:</span>
          <select
            value={audienceFilter}
            onChange={(e) => setAudienceFilter(e.target.value)}
            className="input-field"
            style={{ width: 'auto', padding: '8px 12px', fontSize: '0.86rem' }}
          >
            <option value="ALL">All Circulars</option>
            <option value="All">Campus-Wide</option>
            <option value="Specific Year">Targeted Year</option>
            <option value="Specific Section">Targeted Section</option>
          </select>
        </div>
      </div>

      {/* Notices List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <div>Fetching circulars...</div>
        </div>
      ) : filteredNotices.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
          <Megaphone size={40} color="#64748b" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#cbd5e1' }}>No Notices Available</div>
          <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
            There are currently no circulars or announcements matching your filter.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredNotices.map((notice) => (
            <div
              key={notice.noticeId}
              className="glass-card"
              style={{
                padding: '24px 28px',
                borderLeft: '4px solid #0284c7',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: 'rgba(14, 165, 233, 0.18)',
                      color: '#38bdf8',
                      border: '1px solid rgba(14, 165, 233, 0.35)',
                    }}
                  >
                    {notice.targetAudience || 'General'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: '#64748b' }}>
                    <Calendar size={13} />
                    <span>{formatDate(notice.postedAt)}</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Posted by College Faculty
                </div>
              </div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '10px' }}>
                {notice.title}
              </h2>

              <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                {notice.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
