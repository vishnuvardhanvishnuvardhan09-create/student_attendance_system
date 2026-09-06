import React, { useState, useRef } from 'react';
import { Camera, Upload, Check, X, RefreshCw, Image as ImageIcon } from 'lucide-react';
import Avatar from './Avatar';
import { uploadUserPhoto, fileToBase64 } from '../api/photoService';

/**
 * Reusable PhotoUpload component.
 * Allows picking an image file, previews it locally, and saves via:
 * - Online: POST /api/upload/photo + PUT /api/admin/{userType}/{userId}/photo
 * - Offline: Base64 data URL saved directly into localStorage directories and queued for sync.
 */
export default function PhotoUpload({
  user = {},
  userType = 'student',
  userId = null,
  onSave = null,
  onCancel = null,
  size = 'lg',
}) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const targetId =
    userId ||
    user?.studentId ||
    user?.student_id ||
    user?.facultyId ||
    user?.faculty_id ||
    user?.id ||
    0;

  const currentPhoto =
    previewUrl ||
    user?.photo_url ||
    user?.photoUrl ||
    user?.photo;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check extension
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      setErrorMsg('Please select a valid image file (JPG, PNG, or WEBP).');
      return;
    }

    // Check size (warn if > 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image is too large (max 5MB recommended).');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setSelectedFile(file);

    try {
      const base64 = await fileToBase64(file);
      setPreviewUrl(base64);
    } catch (err) {
      setErrorMsg('Failed to load image preview.');
    }
  };

  const handleTriggerPicker = () => {
    setErrorMsg('');
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    if (!selectedFile && !previewUrl) {
      setErrorMsg('Please select a photo first.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      const result = await uploadUserPhoto({
        file: selectedFile,
        base64Data: previewUrl,
        userType,
        userId: targetId,
      });

      setSuccessMsg(
        result.isOffline
          ? 'Saved offline (will sync when online).'
          : 'Photo uploaded successfully!'
      );

      setSelectedFile(null);

      if (onSave) {
        onSave(result.photoUrl);
      }

      setTimeout(() => {
        setSuccessMsg('');
      }, 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save photo. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMsg('');
    setSuccessMsg('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        padding: '16px',
      }}
    >
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/jpg,image/webp"
        style={{ display: 'none' }}
      />

      {/* Avatar Display & Hover Overlay */}
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <Avatar
          user={{
            name: user?.name || 'User',
            photoUrl: currentPhoto,
          }}
          size={size}
          bordered
        />

        {/* Floating Camera Button */}
        <button
          type="button"
          onClick={handleTriggerPicker}
          disabled={saving}
          title="Change Photo"
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            border: '2px solid #0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(99, 102, 241, 0.5)',
            transition: 'transform 0.15s ease, background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Camera size={15} />
        </button>
      </div>

      {/* Feedback Messages */}
      {errorMsg && (
        <div
          style={{
            fontSize: '0.82rem',
            color: '#f87171',
            background: 'rgba(239, 68, 68, 0.1)',
            padding: '6px 12px',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div
          style={{
            fontSize: '0.82rem',
            color: '#34d399',
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '6px 12px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Check size={14} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        {previewUrl ? (
          <>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
              style={{
                fontSize: '0.84rem',
                padding: '8px 16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {saving ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Save Photo</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCancelSelection}
              disabled={saving}
              className="btn-secondary"
              style={{
                fontSize: '0.84rem',
                padding: '8px 14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <X size={14} />
              <span>Cancel</span>
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleTriggerPicker}
            className="btn-secondary"
            style={{
              fontSize: '0.82rem',
              padding: '6px 14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Upload size={14} />
            <span>Choose Photo</span>
          </button>
        )}
      </div>
    </div>
  );
}
