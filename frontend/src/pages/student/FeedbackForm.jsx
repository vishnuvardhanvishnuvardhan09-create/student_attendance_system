import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  History,
  Tag,
  RefreshCw,
} from 'lucide-react';
import { submitFeedback, getAllFeedback } from '../../api/offlineSync';

export default function FeedbackForm() {
  const user = JSON.parse(localStorage.getItem('attendance_user') || '{}');

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Attendance / Geolocation');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [pastFeedback, setPastFeedback] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      if (user.studentId) {
        const all = await getAllFeedback();
        // Filter by studentId
        const myFeedback = all.filter(
          (f) =>
            (f.student && (f.student.studentId === user.studentId || f.student.id === user.studentId)) ||
            f.studentId === user.studentId
        );
        // Sort newest first
        myFeedback.sort(
          (a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime()
        );
        setPastFeedback(myFeedback);
      }
    } catch (err) {
      console.warn('Error loading feedback history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user.studentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!subject.trim()) {
      setErrorMsg('Please enter a feedback subject.');
      return;
    }
    if (!message.trim()) {
      setErrorMsg('Please write your feedback message or inquiry.');
      return;
    }

    setSubmitting(true);
    try {
      const fullSubject = category ? `[${category}] ${subject.trim()}` : subject.trim();
      await submitFeedback({
        studentId: user.studentId,
        subject: fullSubject,
        message: message.trim(),
      });

      setSuccessMsg('Your feedback has been submitted successfully! The administration will review it.');
      setSubject('');
      setMessage('');
      fetchHistory();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit feedback. Please try again.');
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
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
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
            <MessageSquare size={20} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Submit Student Feedback
          </h1>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>
          Share your queries, report attendance GPS anomalies, or request support from department faculty.
        </p>
      </div>

      {/* Split Grid: Form on Left, History on Right */}
      <div className="responsive-grid-split" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px', alignItems: 'start' }}>
        {/* Form Card */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '18px' }}>
            New Feedback Entry
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field"
                style={{ width: '100%' }}
              >
                <option value="Attendance / Geolocation">Attendance / Geolocation Accuracy</option>
                <option value="Academics & Timetable">Academics & Timetable Schedule</option>
                <option value="Lectures & Faculty">Lectures & Faculty Query</option>
                <option value="Campus Facilities">Campus Facilities & Labs</option>
                <option value="Other">General Inquiry</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                Subject
              </label>
              <input
                type="text"
                placeholder="e.g. GPS error on lower laboratory floor"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                Message
              </label>
              <textarea
                rows={5}
                placeholder="Provide details about your query or grievance..."
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
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              <Send size={16} />
              <span>{submitting ? 'Submitting...' : 'Submit Feedback'}</span>
            </button>
          </form>
        </div>

        {/* History Column */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={18} color="#38bdf8" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
                My Submitted Feedback
              </h2>
            </div>
            <button
              onClick={fetchHistory}
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
            <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Loading past feedback...</p>
          ) : pastFeedback.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8' }}>
              <MessageSquare size={32} color="#64748b" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '0.92rem', color: '#cbd5e1' }}>No feedback submitted yet</div>
              <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>
                Your queries and faculty responses will appear here.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '520px', overflowY: 'auto' }}>
              {pastFeedback.map((item) => (
                <div
                  key={item.feedbackId}
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
                        background:
                          item.status === 'Reviewed'
                            ? 'rgba(16, 185, 129, 0.2)'
                            : 'rgba(245, 158, 11, 0.2)',
                        color: item.status === 'Reviewed' ? '#34d399' : '#fbbf24',
                      }}
                    >
                      {item.status || 'New'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {formatDate(item.submittedAt)}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '4px' }}>
                    {item.subject}
                  </div>

                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: '1.4' }}>
                    {item.message}
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
