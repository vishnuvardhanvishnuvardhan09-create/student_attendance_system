import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  CalendarDays,
  ClipboardList,
  MessageSquare,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import Avatar from '../../components/Avatar';

export default function AdminLayout() {
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
    navigate('/login?role=admin');
  };

  const navItems = [
    { label: 'Dashboard Overview', path: '/admin', Icon: LayoutDashboard },
    { label: 'Manage Students', path: '/admin/students', Icon: GraduationCap },
    { label: 'Manage Faculty', path: '/admin/faculty', Icon: Users },
    { label: 'Manage Holidays', path: '/admin/holidays', Icon: CalendarDays },
    { label: 'Attendance Logs', path: '/admin/attendance', Icon: ClipboardList },
    { label: 'Student Feedback', path: '/admin/feedback', Icon: MessageSquare },
  ];

  return (
    <div className="portal-container" style={{ display: 'flex', minHeight: '100vh', background: '#0b0f19', color: '#f8fafc' }}>
      {/* Persistent Left Sidebar */}
      <aside
        className="portal-sidebar"
        style={{
          width: '260px',
          background: 'rgba(15, 23, 42, 0.95)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', paddingLeft: '8px' }}>
          <div
            className="icon-badge"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #a855f7, #6366f1)',
              boxShadow: '0 4px 14px rgba(168, 85, 247, 0.35)',
            }}
          >
            <ShieldCheck size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.01em', color: '#ffffff' }}>
              Admin Center
            </div>
            <div style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600 }}>System Administration</div>
          </div>
        </div>

        {/* Logged-in User Profile Bar with Avatar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            marginBottom: '22px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.07)',
          }}
        >
          <Avatar user={user} size="sm" bordered />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.name || 'System Administrator'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.email || 'admin@attendance.edu'}
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.Icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  color: isActive ? '#a5b4fc' : '#94a3b8',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid transparent',
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
                <Icon size={18} color={isActive ? '#818cf8' : '#64748b'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout Footer */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px', marginTop: 'auto' }}>
          <div style={{ paddingLeft: '8px', marginBottom: '12px' }}>
            <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#f1f5f9' }}>
              {user.name || 'System Admin'}
            </div>
            <div style={{ fontSize: '0.76rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.email || 'admin@attendance.edu'}
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
