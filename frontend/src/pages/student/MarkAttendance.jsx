import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Compass,
  RefreshCw,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { markAttendance, getStudentAttendance } from '../../api/offlineSync';

// Campus Reference Coordinates & Geofence (200m)
const CAMPUS_COORDS = {
  latitude: 12.971598,
  longitude: 77.594566,
  radiusMeters: 200.0,
  name: 'Main Campus Center',
};

// Haversine formula to compute distance in meters
function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000.0;
  const dLat = ((lat2 - lat1) * Math.PI) / 180.0;
  const dLon = ((lon2 - lon1) * Math.PI) / 180.0;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180.0) *
      Math.cos((lat2 * Math.PI) / 180.0) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Custom Leaflet DivIcons to prevent missing PNG asset 404s
const campusIcon = L.divIcon({
  className: 'custom-campus-pin',
  html: `
    <div style="
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #0284c7, #0369a1);
      border: 2.5px solid #ffffff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(2, 132, 199, 0.5);
      color: white;
    ">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 21h18"></path>
        <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path>
        <path d="M9 7h1"></path><path d="M9 11h1"></path><path d="M9 15h1"></path>
        <path d="M14 7h1"></path><path d="M14 11h1"></path><path d="M14 15h1"></path>
      </svg>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const userIcon = L.divIcon({
  className: 'custom-user-pin',
  html: `
    <div style="
      position: relative;
      width: 32px;
      height: 32px;
      background: #10b981;
      border: 2.5px solid #ffffff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(16, 185, 129, 0.6);
      color: white;
    ">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Map re-centering helper
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 16, { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function MarkAttendance() {
  const user = JSON.parse(localStorage.getItem('attendance_user') || '{}');
  const [marking, setMarking] = useState(false);
  const [coords, setCoords] = useState(null);
  const [distance, setDistance] = useState(null);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [todayRecord, setTodayRecord] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Check if today's attendance has already been recorded
  useEffect(() => {
    if (user.studentId) {
      getStudentAttendance(user.studentId)
        .then((records) => {
          const today = new Date().toISOString().split('T')[0];
          const found = records.find((r) => r.date === today);
          if (found) {
            setTodayRecord(found);
          }
        })
        .catch((err) => console.warn(err.message))
        .finally(() => setLoadingInitial(false));
    } else {
      setLoadingInitial(false);
    }
  }, [user.studentId]);

  const handleMarkAttendance = () => {
    setErrorMsg('');
    setResult(null);
    setMarking(true);

    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      setMarking(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ latitude, longitude });

        const dist = getHaversineDistance(
          CAMPUS_COORDS.latitude,
          CAMPUS_COORDS.longitude,
          latitude,
          longitude
        );
        setDistance(dist);

        try {
          const res = await markAttendance({
            studentId: user.studentId,
            latitude,
            longitude,
            status: 'Present',
          });
          setResult(res);
          setTodayRecord(res);
        } catch (err) {
          setErrorMsg(err.message || 'Failed to record attendance. Please try again.');
        } finally {
          setMarking(false);
        }
      },
      (err) => {
        let explanation = 'Please enable location permissions.';
        if (err.code === 1) explanation = 'Location permission was denied. Please allow location access in your browser.';
        else if (err.code === 2) explanation = 'GPS position unavailable. Please check your network connection or device sensors.';
        else if (err.code === 3) explanation = 'Geolocation request timed out. Please try again.';
        setErrorMsg(`Geolocation Error: ${explanation}`);
        setMarking(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const mapCenter = coords
    ? [coords.latitude, coords.longitude]
    : [CAMPUS_COORDS.latitude, CAMPUS_COORDS.longitude];

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
            <MapPin size={20} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Mark My Attendance
          </h1>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>
          Real-time GPS geofence verification within the 200-meter campus perimeter.
        </p>
      </div>

      {/* Today's Existing Status Alert Banner */}
      {todayRecord && !result && (
        <div
          className="glass-card"
          style={{
            padding: '16px 20px',
            marginBottom: '24px',
            borderLeft: '4px solid #10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(16, 185, 129, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle2 size={24} color="#10b981" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>
                You already have an attendance record for today!
              </div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px' }}>
                Logged at <strong style={{ color: '#e2e8f0' }}>{todayRecord.timeIn || '09:00:00'}</strong> &bull; Status:{' '}
                <span
                  className={`badge ${
                    todayRecord.status === 'Present'
                      ? 'badge-present'
                      : todayRecord.status === 'Late'
                      ? 'badge-late'
                      : 'badge-outofboundary'
                  }`}
                  style={{ marginLeft: '6px' }}
                >
                  {todayRecord.status}
                </span>
              </div>
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Marked by: {todayRecord.markedBy || 'self'}
          </div>
        </div>
      )}

      {/* Grid: Left is Action & Coordinates Card, Right is Embedded Map */}
      <div className="responsive-grid-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Column: Control Card */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div
              className={`icon-badge ${marking ? 'radar-pulse' : ''}`}
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
                boxShadow: '0 8px 24px rgba(14, 165, 233, 0.35)',
                margin: '0 auto 16px',
              }}
            >
              <Navigation size={32} color="#ffffff" className={marking ? 'animate-spin' : ''} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>Self Check-In</h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
              Your browser will detect your location and verify against campus coordinates.
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '0.86rem',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}
            >
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{errorMsg}</div>
            </div>
          )}

          {/* Success / OutOfRange Result Banner */}
          {result && (
            <div
              style={{
                background:
                  result.status === 'Present-OutOfRange'
                    ? 'rgba(245, 158, 11, 0.12)'
                    : 'rgba(16, 185, 129, 0.12)',
                border: `1px solid ${
                  result.status === 'Present-OutOfRange'
                    ? 'rgba(245, 158, 11, 0.4)'
                    : 'rgba(16, 185, 129, 0.4)'
                }`,
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                {result.status === 'Present-OutOfRange' ? (
                  <AlertTriangle size={20} color="#fbbf24" />
                ) : (
                  <CheckCircle2 size={20} color="#34d399" />
                )}
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: '0.98rem',
                    color: result.status === 'Present-OutOfRange' ? '#fbbf24' : '#34d399',
                  }}
                >
                  {result.status === 'Present-OutOfRange'
                    ? 'Marked Outside Campus'
                    : 'Attendance Confirmed!'}
                </span>
              </div>
              <div style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                <div>Date: <strong>{result.date}</strong> &bull; Time: <strong>{result.timeIn}</strong></div>
                <div>Status: <span className="badge badge-present" style={{ marginLeft: '4px' }}>{result.status}</span></div>
                {distance !== null && (
                  <div style={{ marginTop: '4px', color: '#94a3b8' }}>
                    Distance from campus center: <strong>{distance} meters</strong>
                  </div>
                )}
              </div>
              {result.status === 'Present-OutOfRange' && (
                <p style={{ fontSize: '0.78rem', color: '#fcd34d', marginTop: '8px' }}>
                  You are outside the 200m perimeter. Your record is preserved with &quot;Present-OutOfRange&quot; for administrative review.
                </p>
              )}
            </div>
          )}

          {/* Coordinate Details Box */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '20px',
              fontSize: '0.82rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>Campus Center:</span>
              <span style={{ color: '#38bdf8', fontWeight: 600 }}>
                {CAMPUS_COORDS.latitude}, {CAMPUS_COORDS.longitude}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>Campus Radius:</span>
              <span style={{ color: '#94a3b8', fontWeight: 600 }}>200 meters</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Your Position:</span>
              <span style={{ color: coords ? '#10b981' : '#64748b', fontWeight: 600 }}>
                {coords ? `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}` : 'Not Captured'}
              </span>
            </div>
          </div>

          {/* Mark Attendance Button */}
          <button
            onClick={handleMarkAttendance}
            disabled={marking}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '13px',
              fontSize: '0.96rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              opacity: marking ? 0.75 : 1,
              cursor: marking ? 'not-allowed' : 'pointer',
            }}
          >
            {marking ? (
              <>
                <RefreshCw size={17} className="animate-spin" />
                <span>Acquiring Coordinates & Marking...</span>
              </>
            ) : (
              <>
                <Navigation size={17} />
                <span>{todayRecord ? 'Update / Mark Attendance Again' : 'Mark My Attendance'}</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Embedded Map */}
        <div className="glass-card" style={{ padding: '16px', overflow: 'hidden' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
              padding: '4px 8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={18} color="#38bdf8" />
              <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f8fafc' }}>
                Campus Geofence Radar
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0284c7' }} /> Campus
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} /> You
              </span>
            </div>
          </div>

          {/* Leaflet Map Container */}
          <div
            style={{
              height: '420px',
              width: '100%',
              borderRadius: '12px',
              overflow: 'hidden',
              position: 'relative',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <MapContainer
              center={mapCenter}
              zoom={16}
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%', background: '#0f172a' }}
            >
              <RecenterMap center={coords ? [coords.latitude, coords.longitude] : null} />

              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* 200m Campus Boundary Circle */}
              <Circle
                center={[CAMPUS_COORDS.latitude, CAMPUS_COORDS.longitude]}
                radius={CAMPUS_COORDS.radiusMeters}
                pathOptions={{
                  color: '#0284c7',
                  fillColor: '#0ea5e9',
                  fillOpacity: 0.18,
                  weight: 2,
                  dashArray: '4, 4',
                }}
              />

              {/* Campus Center Marker */}
              <Marker
                position={[CAMPUS_COORDS.latitude, CAMPUS_COORDS.longitude]}
                icon={campusIcon}
              >
                <Popup>
                  <div style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.85rem' }}>
                    <strong>{CAMPUS_COORDS.name}</strong>
                    <br />
                    200m Attendance Boundary
                  </div>
                </Popup>
              </Marker>

              {/* Student's Captured Position Marker */}
              {coords && (
                <Marker
                  position={[coords.latitude, coords.longitude]}
                  icon={userIcon}
                >
                  <Popup>
                    <div style={{ color: '#0f172a', fontSize: '0.85rem' }}>
                      <strong>Your Location</strong>
                      <br />
                      {distance !== null && `${distance}m from campus`}
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>

          <div style={{ marginTop: '12px', padding: '0 8px', fontSize: '0.78rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
            <span>Map Powered by OpenStreetMap (No API key required)</span>
            <span>Radius: 200m</span>
          </div>
        </div>
      </div>
    </div>
  );
}
