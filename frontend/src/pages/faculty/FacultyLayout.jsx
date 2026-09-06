import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  CheckSquare,
  Megaphone,
  MessageSquare,
  LogOut,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import Avatar from '../../components/Avatar';

export default function FacultyLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('attendance_user') || '{}'));

  useEffect(() => {
    const handlePhotoUpdated = () => {
      setUser(JSON.parse(localStorage.getItem('attendance_user') || '{}'));
    };
    window.addEventListener('user-photo-updated', handlePhotoUpdated);
    return () => window.removeEventListener('user-photo-updated', handlePhotoUpdated);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('attendance_user');
    navigate('/login?role=faculty');
  };

  const navItems = [
    { label: 'Department Overview', path: '/faculty', Icon: LayoutDashboard, exact: true },
    { label: 'Attendance Analytics', path: '/faculty/overview', Icon: BarChart3 },
    { label: 'Manual Attendance', path: '/faculty/mark', Icon: CheckSquare },
    { label: 'Broadcast Notices', path: '/faculty/notices', Icon: Megaphone },
    { label: 'Student Feedback', path: '/faculty/feedback', Icon: MessageSquare },
  ];

  return (
    <div className="portal-container" style={{ display: 'flex', minHeight: '100vh', background: '#090d16', color: '#f8fafc' }}>
      {/* Persistent Left Sidebar with Analytical Emerald / Teal Styling */}
      <aside
        className="portal-sidebar"
        style={{
          width: '260px',
          background: 'rgba(15, 23, 42, 0.95)',
          borderRight: '1px solid rgba(16, 185, 129, 0.18)',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          boxSizing: 'border-box',
          flexShrink: 0,
        }}
      >
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', paddingLeft: '8px' }}>
          <div
            className="icon-badge"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #059669, #10b981)',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
            }}
          >
            <GraduationCap size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.01em', color: '#ffffff' }}>
              Faculty Portal
            </div>
            <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>
              {user.department || 'Academic Department'}
            </div>
          </div>
        </div>

        {/* Logged-in Faculty Profile Bar with Avatar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            marginBottom: '20px',
            background: 'rgba(16, 185, 129, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(16, 185, 129, 0.18)',
          }}
        >
          <Avatar user={user} size="sm" bordered />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.name || 'Faculty Member'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#34d399', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.department || user.email || 'Faculty Portal'}
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, overflowY: 'auto' }}>
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            const Icon = item.Icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '11px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? 'rgba(16, 185, 129, 0.16)' : 'transparent',
                  color: isActive ? '#34d399' : '#94a3b8',
                  border: isActive ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid transparent',
                  transition: 'all 0.18s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.color = '#e2e8f0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#94a3b8';
                  }
                }}
              >
                <Icon size={17} color={isActive ? '#34d399' : '#64748b'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Sign Out Footer */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px', marginTop: 'auto' }}>
          <div style={{ paddingLeft: '8px', marginBottom: '12px' }}>
            <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#f1f5f9' }}>
              {user.name || 'Faculty Member'}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.email || 'faculty@attendance.edu'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '2px', fontWeight: 600 }}>
              Faculty Observer &bull; {user.department || 'All Depts'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn-secondary"
            style={{
              width: '100%',
              fontSize: '0.84rem',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="portal-main" style={{ flex: 1, padding: '36px 44px', overflowY: 'auto', minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  );
}
