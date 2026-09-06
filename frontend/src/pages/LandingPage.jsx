import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  GraduationCap,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  UserPlus,
  LogIn,
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'student',
      title: 'Student Portal',
      desc: 'Mark attendance with GPS, view monthly percentages, and check department notices.',
      color: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.12)',
      border: 'rgba(56, 189, 248, 0.3)',
      Icon: GraduationCap,
    },
    {
      id: 'faculty',
      title: 'Faculty Portal',
      desc: 'Verify class records, mark manual attendance, and broadcast department announcements.',
      color: '#34d399',
      bg: 'rgba(52, 211, 153, 0.12)',
      border: 'rgba(52, 211, 153, 0.3)',
      Icon: Users,
    },
    {
      id: 'admin',
      title: 'Administrator',
      desc: 'Manage students and faculty, oversee daily analytics, and manage academic calendar.',
      color: '#a855f7',
      bg: 'rgba(168, 85, 247, 0.12)',
      border: 'rgba(168, 85, 247, 0.3)',
      Icon: ShieldCheck,
    },
  ];

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'radial-gradient(ellipse at 50% 10%, rgba(99, 102, 241, 0.15), transparent 60%), #0b0f19',
      }}
    >
      {/* Header */}
      <header
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '24px 48px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            className="icon-badge"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
            }}
          >
            <MapPin size={22} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            EduAttend <span style={{ color: '#818cf8', fontWeight: 400 }}>System</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate('/register')}
            className="btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <UserPlus size={16} />
            <span>Student Sign Up</span>
          </button>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <LogIn size={16} />
            <span>Sign In</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main
        style={{
          position: 'relative',
          zIndex: 10,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '800px', marginBottom: '48px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '999px',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#a5b4fc',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '20px',
            }}
          >
            <Sparkles size={14} color="#818cf8" />
            <span>Geofenced &amp; Offline-Capable Attendance</span>
          </div>
          <h2 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '18px' }}>
            Smart Campus <span style={{ color: '#818cf8' }}>Attendance</span> Management
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#94a3b8', lineHeight: 1.6 }}>
            Accurate GPS-assisted verification, instant faculty overrides, rich monthly analytics,
            and seamless local storage fallback when connectivity is intermittent.
          </p>
        </div>

        {/* Role Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
            maxWidth: '1000px',
            width: '100%',
          }}
        >
          {roles.map((role) => {
            const Icon = role.Icon;
            return (
              <div
                key={role.id}
                onClick={() => navigate(`/login?role=${role.id}`)}
                className="glass-card"
                style={{
                  padding: '32px 24px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'transform 0.25s ease, border-color 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.borderColor = role.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <div
                  className="icon-badge"
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: role.bg,
                    border: `1px solid ${role.border}`,
                    marginBottom: '20px',
                  }}
                >
                  <Icon size={28} color={role.color} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>{role.title}</h3>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '20px' }}>
                  {role.desc}
                </p>
                <span
                  style={{
                    color: role.color,
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>Enter Portal</span>
                  <ArrowRight size={15} />
                </span>
              </div>
            );
          })}
        </div>
      </main>

      <footer
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          padding: '24px',
          color: '#64748b',
          fontSize: '0.85rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        Academic / Demo Purpose &bull; React JS &bull; Spring Boot &bull; MySQL
      </footer>
    </div>
  );
}
