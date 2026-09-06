import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Search, Pencil, Trash2, X, QrCode, Camera } from 'lucide-react';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../../api/offlineSync';
import * as localAccounts from '../../api/localAccounts';
import Avatar from '../../components/Avatar';
import PhotoUpload from '../../components/PhotoUpload';

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [photoTargetStudent, setPhotoTargetStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    email: '',
    passwordPlain: '',
    department: 'Computer Science',
    year: 1,
    section: 'A',
    phone: '',
  });
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (err) {
      console.warn('Failed to load students:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      rollNumber: '',
      email: '',
      passwordPlain: '',
      department: 'Computer Science',
      year: 1,
      section: 'A',
      phone: '',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name || '',
      rollNumber: student.rollNumber || '',
      email: student.email || '',
      passwordPlain: student.passwordPlain || '',
      department: student.department || 'Computer Science',
      year: student.year || 1,
      section: student.section || 'A',
      phone: student.phone || '',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    setModalError('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setSubmitting(true);

    try {
      if (editingStudent) {
        const updated = await updateStudent(editingStudent.studentId, formData);
        localAccounts.updateStudent(editingStudent.studentId, {
          ...formData,
          password_plain: formData.passwordPlain || formData.password,
        });
      } else {
        const created = await createStudent(formData);
        // Explicitly mirror saved record with generated ID into local account directory
        localAccounts.addStudent({
          ...created,
          password_plain: formData.passwordPlain || formData.password,
        });
      }
      closeModal();
      loadStudents();
    } catch (err) {
      setModalError(err.message || 'Operation failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete student "${name}"?`)) {
      try {
        await deleteStudent(id);
        localAccounts.deleteStudent(id);
        loadStudents();
      } catch (err) {
        alert('Failed to delete student.');
      }
    }
  };

  // Filter & Search Logic
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.rollNumber && s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDept = selectedDept === 'All' || s.department === selectedDept;
    const matchesYear = selectedYear === 'All' || String(s.year) === String(selectedYear);
    const matchesSec = selectedSection === 'All' || s.section === selectedSection;

    return matchesSearch && matchesDept && matchesYear && matchesSec;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginBottom: '4px' }}>
            Manage Students
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
            Enrolled student profiles, academic grouping, and credentials
          </p>
        </div>
        <button onClick={openAddModal} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <UserPlus size={16} />
          <span>Add Student</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '18px 20px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '36px' }}
            placeholder="Search by name, roll number, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Department Filter */}
        <div style={{ minWidth: '160px' }}>
          <select
            className="input-field"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            style={{ cursor: 'pointer' }}
          >
            <option value="All">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics & Communication">Electronics &amp; Comm.</option>
            <option value="Mechanical Engineering">Mechanical Eng.</option>
          </select>
        </div>

        {/* Year Filter */}
        <div style={{ minWidth: '110px' }}>
          <select
            className="input-field"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{ cursor: 'pointer' }}
          >
            <option value="All">All Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>

        {/* Section Filter */}
        <div style={{ minWidth: '110px' }}>
          <select
            className="input-field"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            style={{ cursor: 'pointer' }}
          >
            <option value="All">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="glass-card" style={{ padding: '20px', overflowX: 'auto' }}>
        {loading ? (
          <p style={{ color: '#94a3b8', padding: '20px' }}>Loading student records...</p>
        ) : filteredStudents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
            No students found matching current filters.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
                <th style={{ padding: '12px 10px', width: '56px' }}>Photo</th>
                <th style={{ padding: '12px 10px' }}>Roll Number</th>
                <th style={{ padding: '12px 10px' }}>Name</th>
                <th style={{ padding: '12px 10px' }}>Email</th>
                <th style={{ padding: '12px 10px' }}>Department</th>
                <th style={{ padding: '12px 10px' }}>Year / Sec</th>
                <th style={{ padding: '12px 10px' }}>Phone</th>
                <th style={{ padding: '12px 10px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => (
                <tr
                  key={s.studentId}
                  style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background 0.15s' }}
                >
                  <td style={{ padding: '10px 10px' }}>
                    <Avatar user={s} size="sm" bordered />
                  </td>
                  <td style={{ padding: '12px 10px', fontWeight: 700, color: '#818cf8' }}>{s.rollNumber}</td>
                  <td style={{ padding: '12px 10px', fontWeight: 600, color: '#f8fafc' }}>{s.name}</td>
                  <td style={{ padding: '12px 10px', color: '#94a3b8' }}>{s.email}</td>
                  <td style={{ padding: '12px 10px', color: '#cbd5e1' }}>{s.department}</td>
                  <td style={{ padding: '12px 10px', color: '#94a3b8' }}>
                    Yr {s.year} &bull; Sec {s.section}
                  </td>
                  <td style={{ padding: '12px 10px', color: '#94a3b8' }}>{s.phone || '—'}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                    <button
                      onClick={() => setPhotoTargetStudent(s)}
                      className="btn-secondary"
                      title="Upload or change photo"
                      style={{
                        padding: '5px 10px',
                        fontSize: '0.78rem',
                        marginRight: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#a855f7',
                        borderColor: 'rgba(168, 85, 247, 0.3)',
                      }}
                    >
                      <Camera size={12} />
                      <span>Photo</span>
                    </button>
                    <Link
                      to={`/student/profile?studentId=${s.studentId}`}
                      className="btn-secondary"
                      style={{
                        padding: '5px 10px',
                        fontSize: '0.78rem',
                        marginRight: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#38bdf8',
                        borderColor: 'rgba(56, 189, 248, 0.3)',
                      }}
                    >
                      <QrCode size={12} />
                      <span>ID Badge</span>
                    </Link>
                    <button
                      onClick={() => openEditModal(s)}
                      className="btn-secondary"
                      style={{
                        padding: '5px 10px',
                        fontSize: '0.78rem',
                        marginRight: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Pencil size={12} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(s.studentId, s.name)}
                      style={{
                        padding: '5px 10px',
                        fontSize: '0.78rem',
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
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Student Modal */}
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
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '540px',
              padding: '32px',
              background: '#0f172a',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f8fafc' }}>
                {editingStudent ? 'Edit Student Details' : 'Add New Student'}
              </h2>
              <button
                onClick={closeModal}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.3rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            {modalError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.86rem' }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '4px' }}>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="input-field"
                    value={formData.name}
                    onChange={handleFormChange}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '4px' }}>Roll Number *</label>
                  <input
                    type="text"
                    name="rollNumber"
                    required
                    className="input-field"
                    value={formData.rollNumber}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '4px' }}>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="input-field"
                    value={formData.email}
                    onChange={handleFormChange}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '4px' }}>Password *</label>
                  <input
                    type="password"
                    name="passwordPlain"
                    required
                    className="input-field"
                    placeholder="Plain text password"
                    value={formData.passwordPlain}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '4px' }}>Department *</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleFormChange}
                    className="input-field"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication">Electronics & Comm.</option>
                    <option value="Mechanical Engineering">Mechanical Eng.</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '4px' }}>Year *</label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleFormChange}
                    className="input-field"
                  >
                    <option value={1}>1st</option>
                    <option value={2}>2nd</option>
                    <option value={3}>3rd</option>
                    <option value={4}>4th</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '4px' }}>Section *</label>
                  <select
                    name="section"
                    value={formData.section}
                    onChange={handleFormChange}
                    className="input-field"
                  >
                    <option value="A">Sec A</option>
                    <option value="B">Sec B</option>
                    <option value="C">Sec C</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '4px' }}>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  className="input-field"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={handleFormChange}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Saving...' : editingStudent ? 'Update Student' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Upload Modal */}
      {photoTargetStudent && (
        <PhotoUpload
          user={photoTargetStudent}
          userType="student"
          onSave={(newPhotoUrl) => {
            setStudents((prev) =>
              prev.map((item) =>
                item.studentId === photoTargetStudent.studentId
                  ? { ...item, photoUrl: newPhotoUrl, photo_url: newPhotoUrl }
                  : item
              )
            );
            setPhotoTargetStudent(null);
          }}
          onCancel={() => setPhotoTargetStudent(null)}
        />
      )}
    </div>
  );
}

