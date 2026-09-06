import React, { useState, useEffect } from 'react';
import { resolvePhotoUrl } from '../api/photoService';

const SIZE_MAP = {
  xs: { dim: 26, fontSize: 11, stroke: 1.5 },
  sm: { dim: 34, fontSize: 13, stroke: 2 },
  md: { dim: 44, fontSize: 16, stroke: 2.5 },
  lg: { dim: 64, fontSize: 24, stroke: 3 },
  xl: { dim: 110, fontSize: 38, stroke: 4 },
};

// Deterministic pleasing gradient palettes based on string hashing
const PALETTES = [
  { start: '#6366f1', end: '#a855f7', text: '#ffffff' }, // Indigo - Purple
  { start: '#0284c7', end: '#06b6d4', text: '#ffffff' }, // Sky - Cyan
  { start: '#10b981', end: '#059669', text: '#ffffff' }, // Emerald - Teal
  { start: '#f59e0b', end: '#d97706', text: '#ffffff' }, // Amber - Orange
  { start: '#ec4899', end: '#8b5cf6', text: '#ffffff' }, // Pink - Violet
  { start: '#3b82f6', end: '#1d4ed8', text: '#ffffff' }, // Blue - Dark Blue
  { start: '#14b8a6', end: '#0f766e', text: '#ffffff' }, // Teal - Dark Teal
];

function getInitials(name) {
  if (!name || typeof name !== 'string') return '?';
  const clean = name.trim();
  if (!clean) return '?';
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getPalette(name) {
  if (!name) return PALETTES[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTES.length;
  return PALETTES[index];
}

/**
 * Reusable Avatar component supporting both real/base64 photo URLs and
 * fully offline SVG initials-based placeholders.
 */
export default function Avatar({
  user = {},
  size = 'md',
  className = '',
  style = {},
  alt = '',
  bordered = false,
}) {
  const [imgError, setImgError] = useState(false);

  // Allow extracting photo and name from flexible user prop or direct properties
  const photoSrc =
    user?.photo_url ||
    user?.photoUrl ||
    user?.photo ||
    (typeof user === 'string' ? user : '');
  const userName =
    user?.name ||
    user?.fullName ||
    user?.email ||
    (typeof user === 'string' ? '' : '');

  const resolved = resolvePhotoUrl(photoSrc);

  // Reset img error if photo src changes
  useEffect(() => {
    setImgError(false);
  }, [resolved]);

  const sizeCfg = SIZE_MAP[size] || SIZE_MAP.md;
  const initials = getInitials(userName);
  const palette = getPalette(userName || initials);

  const containerStyle = {
    width: `${sizeCfg.dim}px`,
    height: `${sizeCfg.dim}px`,
    minWidth: `${sizeCfg.dim}px`,
    minHeight: `${sizeCfg.dim}px`,
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: bordered ? '0 0 0 2px rgba(255, 255, 255, 0.15)' : 'none',
    userSelect: 'none',
    position: 'relative',
    ...style,
  };

  if (resolved && !imgError) {
    return (
      <div className={`avatar-container ${className}`} style={containerStyle}>
        <img
          src={resolved}
          alt={alt || userName || 'Avatar'}
          onError={() => setImgError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>
    );
  }

  // Fallback: Inline SVG initials badge (100% offline, zero network requests)
  return (
    <div className={`avatar-container avatar-placeholder ${className}`} style={containerStyle}>
      <svg
        width={sizeCfg.dim}
        height={sizeCfg.dim}
        viewBox={`0 0 ${sizeCfg.dim} ${sizeCfg.dim}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          <linearGradient id={`grad-${initials}-${sizeCfg.dim}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.start} />
            <stop offset="100%" stopColor={palette.end} />
          </linearGradient>
        </defs>
        <rect
          width={sizeCfg.dim}
          height={sizeCfg.dim}
          rx={sizeCfg.dim / 2}
          fill={`url(#grad-${initials}-${sizeCfg.dim})`}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          fill={palette.text}
          fontSize={sizeCfg.fontSize}
          fontWeight="700"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          letterSpacing="-0.02em"
        >
          {initials}
        </text>
      </svg>
    </div>
  );
}
