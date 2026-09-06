import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Pencil, Trash2, Camera } from 'lucide-react';
import { getFaculty, createFaculty, updateFaculty, deleteFaculty } from '../../api/offlineSync';
import * as localAccounts from '../../api/localAccounts';
import Avatar from '../../components/Avatar';
import PhotoUpload from '../../components/PhotoUpload';

export default function ManageFaculty() {
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [photoTargetFaculty, setPhotoTargetFaculty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    passwordPlain: '',
    department: 'Computer Science',
  });
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadFaculty();
  }, []);

  const loadFaculty = async () => {
    setLoading(true);
    try {
      const data = await getFaculty();
      setFacultyList(data);
    } catch (err) {
      console.warn('Failed to load faculty:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingFaculty(null);
    setFormData({
      name: '',
      email: '',
      passwordPlain: '',
      department: 'Computer Science',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (faculty) => {
    setEditingFaculty(faculty);
    setFormData({
      name: faculty.name || '',
      email: faculty.email || '',
      passwordPlain: faculty.passwordPlain || '',
      department: faculty.department || 'Computer Science',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFaculty(null);
    setModalError('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setSubmitting(true);

    try {
      if (editingFaculty) {
        const updated = await updateFaculty(editingFaculty.facultyId, formData);
        localAccounts.updateFaculty(editingFaculty.facultyId, {
          ...formData,
          password_plain: formData.passwordPlain || formData.password,
        });
      } else {
        const created = await createFaculty(formData);
        // Explicitly mirror saved record with generated ID into local account directory
        localAccounts.addFaculty({
          ...created,
          password_plain: formData.passwordPlain || formData.password,
        });
      }
      closeModal();
      loadFaculty();
    } catch (err) {
      setModalError(err.message || 'Operation failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete faculty member "${name}"?`)) {
      try {
        await deleteFaculty(id);
        localAccounts.deleteFaculty(id);
        loadFaculty();
      } catch (err) {
        alert('Failed to delete faculty member.');
      }
    }
  };

  const filteredFaculty = facultyList.filter((f) => {
    const matchesSearch =
      (f.name && f.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (f.email && f.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDept = selectedDept === 'All' || f.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginBottom: '4px' }}>
            Manage Faculty
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
            Department professors, teaching staff, and credentials
          </p>
        </div>
        <button onClick={openAddModal} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <UserPlus size={16} />
          <span>Add Faculty</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '18px 20px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
        <div style={{ flex: '1 1 260px', position: 'relative' }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '36px' }}
            placeholder="Search by faculty name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ minWidth: '180px' }}>
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
      </div>

      {/* Faculty Table */}
      <div className="glass-card" style={{ padding: '20px', overflowX: 'auto' }}>
        {loading ? (
          <p style={{ color: '#94a3b8', padding: '20px' }}>Loading faculty records...</p>
        ) : filteredFaculty.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
            No faculty members found matching current filters.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
                <th style={{ padding: '12px 10px', width: '56px' }}>Photo</th>
                <th style={{ padding: '12px 10px' }}>Faculty ID</th>
                <th style={{ padding: '12px 10px' }}>Name</th>
                <th style={{ padding: '12px 10px' }}>Email</th>
                <th style={{ padding: '12px 10px' }}>Department</th>
                <th style={{ padding: '12px 10px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFaculty.map((f) => (
                <tr
                  key={f.facultyId}
                  style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background 0.15s' }}
                >
                  <td style={{ padding: '10px 10px' }}>
                    <Avatar user={f} size="sm" bordered />
                  </td>
                  <td style={{ padding: '12px 10px', fontWeight: 700, color: '#34d399' }}>#{f.facultyId}</td>
                  <td style={{ padding: '12px 10px', fontWeight: 600, color: '#f8fafc' }}>{f.name}</td>
                  <td style={{ padding: '12px 10px', color: '#94a3b8' }}>{f.email}</td>
                  <td style={{ padding: '12px 10px', color: '#cbd5e1' }}>{f.department}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                    <button
                      onClick={() => setPhotoTargetFaculty(f)}
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
                    <button
                      onClick={() => openEditModal(f)}
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
                      onClick={() => handleDelete(f.facultyId, f.name)}
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

      {/* Add / Edit Faculty Modal */}
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
              maxWidth: '480px',
              padding: '32px',
              background: '#0f172a',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f8fafc' }}>
                {editingFaculty ? 'Edit Faculty Details' : 'Add New Faculty'}
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
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '4px' }}>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="input-field"
                  placeholder="e.g. Dr. Ada Lovelace"
                  value={formData.name}
                  onChange={handleFormChange}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '4px' }}>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="input-field"
                  placeholder="faculty@attendance.edu"
                  value={formData.email}
                  onChange={handleFormChange}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
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

              <div style={{ marginBottom: '24px' }}>
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Saving...' : editingFaculty ? 'Update Faculty' : 'Add Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Upload Modal */}
      {photoTargetFaculty && (
        <PhotoUpload
          user={photoTargetFaculty}
          userType="faculty"
          onSave={(newPhotoUrl) => {
            setFacultyList((prev) =>
              prev.map((item) =>
                item.facultyId === photoTargetFaculty.facultyId
                  ? { ...item, photoUrl: newPhotoUrl, photo_url: newPhotoUrl }
                  : item
              )
            );
            setPhotoTargetFaculty(null);
          }}
          onCancel={() => setPhotoTargetFaculty(null)}
        />
      )}
    </div>
  );
}
