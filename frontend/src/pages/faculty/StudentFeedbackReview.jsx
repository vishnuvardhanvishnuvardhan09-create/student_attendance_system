import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  User,
  RefreshCw,
  Tag,
  Check,
} from 'lucide-react';
import { getAllFeedback, updateFeedbackStatus } from '../../api/offlineSync';

export default function StudentFeedbackReview() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const data = await getAllFeedback();
      // Sort newest first
      const sorted = [...data].sort(
        (a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime()
      );
      setFeedback(sorted);
    } catch (err) {
      console.warn('Error loading student feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleMarkReviewed = async (id) => {
    setUpdatingId(id);
    try {
      await updateFeedbackStatus(id, 'Reviewed');
      setFeedback((prev) =>
        prev.map((f) => (f.feedbackId === id ? { ...f, status: 'Reviewed' } : f))
      );
    } catch (err) {
      console.warn('Error marking feedback reviewed:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredFeedback = feedback.filter((f) => {
    if (statusFilter !== 'ALL' && (f.status || 'New') !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchSubject = (f.subject || '').toLowerCase().includes(q);
      const matchMessage = (f.message || '').toLowerCase().includes(q);
      const matchStudent = (f.student?.name || '').toLowerCase().includes(q);
      if (!matchSubject && !matchMessage && !matchStudent) return false;
    }
    return true;
  });

  const totalCount = feedback.length;
  const pendingCount = feedback.filter((f) => f.status === 'New').length;
  const reviewedCount = feedback.filter((f) => f.status === 'Reviewed').length;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
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
              <MessageSquare size={20} color="#ffffff" />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
              Student Inquiries & Feedback Review
            </h1>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>
            Review issues submitted by students regarding lecture schedules, GPS attendance anomalies, and queries.
          </p>
        </div>

        <button
          onClick={fetchFeedback}
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

      {/* Metric Counters */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>Total Submissions</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>
            {totalCount}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px', borderLeft: '3px solid #fbbf24' }}>
          <div style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 600 }}>Pending Review</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#fbbf24', marginTop: '4px' }}>
            {pendingCount}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px', borderLeft: '3px solid #10b981' }}>
          <div style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 600 }}>Reviewed</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
            {reviewedCount}
          </div>
        </div>
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
            placeholder="Search inquiries by subject, student name, keyword..."
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
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
            style={{ width: 'auto', padding: '8px 12px', fontSize: '0.86rem' }}
          >
            <option value="ALL">All Inquiries</option>
            <option value="New">Pending Review (New)</option>
            <option value="Reviewed">Reviewed</option>
          </select>
        </div>
      </div>

      {/* Feedback List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <div>Loading student feedback...</div>
        </div>
      ) : filteredFeedback.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
          <MessageSquare size={40} color="#64748b" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#cbd5e1' }}>No Feedback Found</div>
          <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
            No student inquiries match your filter criteria.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredFeedback.map((item) => (
            <div
              key={item.feedbackId}
              className="glass-card"
              style={{
                padding: '24px 28px',
                borderLeft: item.status === 'Reviewed' ? '4px solid #10b981' : '4px solid #fbbf24',
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
                      background:
                        item.status === 'Reviewed'
                          ? 'rgba(16, 185, 129, 0.18)'
                          : 'rgba(245, 158, 11, 0.18)',
                      color: item.status === 'Reviewed' ? '#34d399' : '#fbbf24',
                      border: `1px solid ${
                        item.status === 'Reviewed' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.35)'
                      }`,
                    }}
                  >
                    {item.status || 'New'}
                  </span>

                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>
                    From: {item.student?.name || `Student #${item.student?.studentId || item.studentId}`}
                  </span>

                  <span style={{ color: '#64748b', fontSize: '0.78rem' }}>
                    &bull; {formatDate(item.submittedAt)}
                  </span>
                </div>

                {item.status !== 'Reviewed' && (
                  <button
                    onClick={() => handleMarkReviewed(item.feedbackId)}
                    disabled={updatingId === item.feedbackId}
                    className="btn-secondary"
                    style={{
                      padding: '5px 12px',
                      fontSize: '0.8rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <Check size={14} color="#34d399" />
                    <span>{updatingId === item.feedbackId ? 'Marking...' : 'Mark as Reviewed'}</span>
                  </button>
                )}
              </div>

              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
                {item.subject}
              </h2>

              <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                {item.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
