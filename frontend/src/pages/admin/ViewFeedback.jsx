import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { getAllFeedback, updateFeedbackStatus } from '../../api/offlineSync';

export default function ViewFeedback() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const data = await getAllFeedback();
      setFeedbackList(data);
    } catch (err) {
      console.warn('Failed to load feedback:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReviewed = async (id) => {
    setActionLoadingId(id);
    try {
      await updateFeedbackStatus(id, 'Reviewed');
      loadFeedback();
    } catch (err) {
      alert('Failed to update status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = feedbackList.filter((f) => {
    if (filterStatus === 'All') return true;
    return f.status === filterStatus;
  });

  const pendingCount = feedbackList.filter((f) => f.status === 'New').length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginBottom: '4px' }}>
            Student Inquiries & Feedback
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
            Review suggestions, reported GPS inconsistencies, and student tickets
          </p>
        </div>

        {pendingCount > 0 && (
          <div
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              color: '#fbbf24',
              fontSize: '0.84rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <AlertCircle size={15} />
            <span>{pendingCount} Pending Review</span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'inline-flex',
          background: 'rgba(15, 23, 42, 0.7)',
          padding: '4px',
          borderRadius: '10px',
          marginBottom: '24px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {['All', 'New', 'Reviewed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            style={{
              padding: '7px 16px',
              border: 'none',
              borderRadius: '7px',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: filterStatus === status ? '#6366f1' : 'transparent',
              color: filterStatus === status ? '#ffffff' : '#94a3b8',
              transition: 'all 0.15s ease',
            }}
          >
            {status} ({status === 'All' ? feedbackList.length : feedbackList.filter((f) => f.status === status).length})
          </button>
        ))}
      </div>

      {/* Feedback List */}
      <div className="glass-card" style={{ padding: '24px' }}>
        {loading ? (
          <p style={{ color: '#94a3b8', padding: '20px' }}>Loading student feedback...</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
            No feedback entries found under "{filterStatus}".
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filtered.map((item) => (
              <div
                key={item.feedbackId}
                style={{
                  padding: '20px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  borderRadius: '12px',
                  border: item.status === 'New' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>{item.subject}</h3>
                      <span className={`badge ${item.status === 'New' ? 'badge-late' : 'badge-present'}`}>
                        {item.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#818cf8', marginTop: '4px', fontWeight: 600 }}>
                      Submitted by: {item.student?.name || `Student #${item.student?.studentId || item.studentId || ''}`}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {item.submittedAt ? item.submittedAt.split('T')[0] : 'Recent'}
                    </span>
                    {item.status === 'New' && (
                      <button
                        onClick={() => handleMarkReviewed(item.feedbackId)}
                        disabled={actionLoadingId === item.feedbackId}
                        className="btn-primary"
                        style={{
                          padding: '6px 14px',
                          fontSize: '0.8rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <CheckCircle2 size={14} />
                        <span>{actionLoadingId === item.feedbackId ? 'Updating...' : 'Mark as Reviewed'}</span>
                      </button>
                    )}
                  </div>
                </div>

                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.55 }}>
                  {item.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
