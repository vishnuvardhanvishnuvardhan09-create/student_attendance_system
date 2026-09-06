import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Send,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Users,
  Clock,
  History,
  Tag,
  RefreshCw,
} from 'lucide-react';
import { postNotice, getNotices } from '../../api/offlineSync';

export default function PostNotice() {
  const user = JSON.parse(localStorage.getItem('attendance_user') || '{}');

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('All');
  const [targetYear, setTargetYear] = useState('1');
  const [targetSection, setTargetSection] = useState('A');

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [notices, setNotices] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchNotices = async () => {
    setLoadingHistory(true);
    try {
      const data = await getNotices();
      // Sort newest first
      const sorted = [...data].sort(
        (a, b) => new Date(b.postedAt || 0).getTime() - new Date(a.postedAt || 0).getTime()
      );
      setNotices(sorted);
    } catch (err) {
      console.warn('Error fetching notices:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handlePostNotice = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!title.trim()) {
      setErrorMsg('Please provide a notice headline/title.');
      return;
    }
    if (!message.trim()) {
      setErrorMsg('Please write the announcement text.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        message: message.trim(),
        targetAudience,
        targetYear: targetAudience === 'Specific Year' ? Number(targetYear) : null,
        targetSection: targetAudience === 'Specific Section' ? targetSection : null,
        postedByFacultyId: user.facultyId,
      };

      await postNotice(payload);
      setSuccessMsg('Announcement broadcasted successfully to student dashboards!');
      setTitle('');
      setMessage('');
      fetchNotices();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to broadcast announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Just now';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
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
            <Megaphone size={20} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Broadcast Department Notices
          </h1>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>
          Publish academic notifications, timetable changes, and seminar updates to student dashboards.
        </p>
      </div>

      {/* Grid: Form on Left, History on Right */}
      <div className="responsive-grid-split" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px', alignItems: 'start' }}>
        {/* Form Card */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '18px' }}>
            Compose Announcement
          </h2>

          {successMsg && (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#34d399',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '0.88rem',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '0.88rem',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handlePostNotice} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                Notice Headline / Subject
              </label>
              <input
                type="text"
                placeholder="e.g. Rescheduled Lab Session for CS Section A"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                Target Student Audience
              </label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="input-field"
              >
                <option value="All">All Students (Campus-Wide)</option>
                <option value="Specific Year">Specific Academic Year</option>
                <option value="Specific Section">Specific Section</option>
              </select>
            </div>

            {/* Conditional Audience Filters */}
            {targetAudience === 'Specific Year' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                  Target Academic Year
                </label>
                <select
                  value={targetYear}
                  onChange={(e) => setTargetYear(e.target.value)}
                  className="input-field"
                >
                  <option value="1">1st Year (Freshmen)</option>
                  <option value="2">2nd Year (Sophomores)</option>
                  <option value="3">3rd Year (Juniors)</option>
                  <option value="4">4th Year (Seniors)</option>
                </select>
              </div>
            )}

            {targetAudience === 'Specific Section' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                  Target Section
                </label>
                <select
                  value={targetSection}
                  onChange={(e) => setTargetSection(e.target.value)}
                  className="input-field"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                Notice Content / Body
              </label>
              <textarea
                rows={5}
                placeholder="Type the full announcement details here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input-field"
                style={{ resize: 'vertical' }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              <Send size={16} />
              <span>{submitting ? 'Broadcasting...' : 'Publish Announcement'}</span>
            </button>
          </form>
        </div>

        {/* History Column */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={18} color="#34d399" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
                Published Circulars
              </h2>
            </div>
            <button
              onClick={fetchNotices}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.78rem',
              }}
            >
              <RefreshCw size={12} className={loadingHistory ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          {loadingHistory ? (
            <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Loading notices history...</p>
          ) : notices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8' }}>
              <Megaphone size={32} color="#64748b" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '0.92rem', color: '#cbd5e1' }}>No notices published yet</div>
              <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>
                Announcements you broadcast will appear here.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '520px', overflowY: 'auto' }}>
              {notices.map((n) => (
                <div
                  key={n.noticeId}
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '10px',
                    padding: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'rgba(16, 185, 129, 0.18)',
                        color: '#34d399',
                      }}
                    >
                      {n.targetAudience}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {formatDate(n.postedAt)}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '4px' }}>
                    {n.title}
                  </div>

                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: '1.4' }}>
                    {n.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
