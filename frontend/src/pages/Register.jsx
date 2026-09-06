import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Hash,
  Mail,
  Lock,
  Building2,
  Calendar,
  Layers,
  Phone,
  UserPlus,
  ArrowLeft,
  LogIn,
  Camera,
  X as CloseIcon,
} from 'lucide-react';
import { registerStudentOffline } from '../api/offlineSync';
import AuthScene3D from '../components/AuthScene3D';
import Avatar from '../components/Avatar';
import { fileToBase64 } from '../api/photoService';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    roll_number: '',
    department: 'Computer Science',
    year: 1,
    section: 'A',
    phone: '',
    photoUrl: '',
    photo_url: '',
  });

  const [photoPreview, setPhotoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      setPhotoPreview(base64);
      setFormData((prev) => ({
        ...prev,
        photoUrl: base64,
        photo_url: base64,
      }));
    } catch (err) {
      console.warn('Error reading photo:', err);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview('');
    setFormData((prev) => ({
      ...prev,
      photoUrl: '',
      photo_url: '',
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const student = await registerStudentOffline(formData);

      // Store returned student object + role under key "attendance_user"
      const userData = {
        ...student,
        role: 'student',
      };
      localStorage.setItem('attendance_user', JSON.stringify(userData));

      setSuccessMsg('Account created successfully! Loading your portal...');
      setTimeout(() => {
        navigate('/student');
      }, 1000);
    } catch (err) {
      const message =
        err.message || 'Registration failed. Please check your details.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        minHeight: '100vh',
        background: '#0b0f19',
      }}
    >
      {/* Left Half: 3D Scene */}
      <div style={{ height: '100%', minHeight: '480px' }}>
        <AuthScene3D />
      </div>

      {/* Right Half: Registration Form */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px 32px',
          background: '#0f172a',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '520px',
            background: 'rgba(30, 41, 59, 0.7)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '36px 32px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div
                className="icon-badge"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                }}
              >
                <UserPlus size={18} color="#818cf8" />
              </div>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Student Registration
              </h2>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Enter your academic profile details to enroll in the attendance system
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '0.88rem',
                marginBottom: '18px',
              }}
            >
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '0.88rem',
                marginBottom: '18px',
              }}
            >
              {successMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Optional Photo Picker */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '20px',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                border: '1px dashed rgba(255, 255, 255, 0.15)',
              }}
            >
              <div style={{ position: 'relative' }}>
                <Avatar
                  user={{ name: formData.name || 'Student', photoUrl: photoPreview }}
                  size="lg"
                  bordered
                />
                {photoPreview && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    title="Remove photo"
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#ef4444',
                      border: 'none',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    }}
                  >
                    <CloseIcon size={12} />
                  </button>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', marginBottom: '2px' }}>
                  Profile Photo (Optional)
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '8px' }}>
                  Upload a photo for your digital ID card & badge
                </div>
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: 'rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    color: '#818cf8',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Camera size={13} />
                  <span>{photoPreview ? 'Change Image' : 'Select Image'}</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handlePhotoSelect}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#cbd5e1',
                    marginBottom: '6px',
                  }}
                >
                  <User size={13} color="#818cf8" />
                  <span>Full Name *</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="input-field"
                  placeholder="e.g. Alice Johnson"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#cbd5e1',
                    marginBottom: '6px',
                  }}
                >
                  <Hash size={13} color="#818cf8" />
                  <span>Roll Number *</span>
                </label>
                <input
                  type="text"
                  name="roll_number"
                  required
                  className="input-field"
                  placeholder="e.g. CS2026011"
                  value={formData.roll_number}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#cbd5e1',
                    marginBottom: '6px',
                  }}
                >
                  <Mail size={13} color="#818cf8" />
                  <span>Email Address *</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="input-field"
                  placeholder="alice.johnson@student.edu"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#cbd5e1',
                    marginBottom: '6px',
                  }}
                >
                  <Lock size={13} color="#818cf8" />
                  <span>Password *</span>
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  className="input-field"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#cbd5e1',
                    marginBottom: '6px',
                  }}
                >
                  <Building2 size={13} color="#818cf8" />
                  <span>Department *</span>
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="input-field"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication">Electronics &amp; Comm.</option>
                  <option value="Mechanical Engineering">Mechanical Eng.</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#cbd5e1',
                    marginBottom: '6px',
                  }}
                >
                  <Calendar size={13} color="#818cf8" />
                  <span>Year *</span>
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="input-field"
                  style={{ cursor: 'pointer' }}
                >
                  <option value={1}>1st</option>
                  <option value={2}>2nd</option>
                  <option value={3}>3rd</option>
                  <option value={4}>4th</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#cbd5e1',
                    marginBottom: '6px',
                  }}
                >
                  <Layers size={13} color="#818cf8" />
                  <span>Section *</span>
                </label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  className="input-field"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="A">Sec A</option>
                  <option value="B">Sec B</option>
                  <option value="C">Sec C</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '22px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#cbd5e1',
                  marginBottom: '6px',
                }}
              >
                <Phone size={13} color="#818cf8" />
                <span>Phone Number</span>
              </label>
              <input
                type="tel"
                name="phone"
                className="input-field"
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '0.95rem',
                opacity: loading ? 0.75 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <UserPlus size={16} />
              <span>{loading ? 'Creating Profile...' : 'Complete Registration'}</span>
            </button>
          </form>

          {/* Navigation Links */}
          <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.88rem', color: '#94a3b8' }}>
            Already enrolled?{' '}
            <Link to="/login?role=student" style={{ color: '#818cf8', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <LogIn size={14} />
              <span>Sign In</span>
            </Link>
          </div>

          <div style={{ textAlign: 'center', marginTop: '14px' }}>
            <Link
              to="/"
              style={{
                fontSize: '0.84rem',
                color: '#64748b',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <ArrowLeft size={14} />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
