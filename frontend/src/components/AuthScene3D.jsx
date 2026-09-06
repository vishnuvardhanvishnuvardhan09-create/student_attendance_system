import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Icosahedron, TorusKnot } from '@react-three/drei';
import { MapPin, Sparkles } from 'lucide-react';

function InteractiveMesh() {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Steady background rotation
      meshRef.current.rotation.x += delta * 0.18;
      meshRef.current.rotation.y += delta * 0.25;

      // Subtle reaction to mouse pointer movement
      const targetX = state.mouse.x * 0.6;
      const targetY = state.mouse.y * 0.6;
      meshRef.current.rotation.x += (targetY - meshRef.current.rotation.x * 0.1) * 0.04;
      meshRef.current.rotation.y += (targetX - meshRef.current.rotation.y * 0.1) * 0.04;
    }
  });

  return (
    <Float speed={2.2} rotationIntensity={1.4} floatIntensity={1.8}>
      <Icosahedron ref={meshRef} args={[1.7, 4]} scale={1.1}>
        <MeshDistortMaterial
          color="#6366f1"
          attach="material"
          distort={0.45}
          speed={2.2}
          roughness={0.2}
          metalness={0.85}
          clearcoat={0.9}
          clearcoatRoughness={0.1}
        />
      </Icosahedron>
      <TorusKnot args={[2.5, 0.06, 128, 16]} rotation={[0.8, 0.4, 0]}>
        <meshStandardMaterial color="#38bdf8" roughness={0.15} metalness={0.9} />
      </TorusKnot>
    </Float>
  );
}

function MouseReactiveLight() {
  const lightRef = useRef();

  useFrame((state) => {
    if (lightRef.current) {
      // Light follows mouse cursor position subtly
      lightRef.current.position.x = state.mouse.x * 5;
      lightRef.current.position.y = state.mouse.y * 5;
    }
  });

  return (
    <pointLight
      ref={lightRef}
      position={[0, 0, 4]}
      color="#ec4899"
      intensity={2.8}
      distance={14}
    />
  );
}

export default function AuthScene3D() {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '400px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0b0f19 0%, #1e1b4b 60%, #0f172a 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px',
      }}
    >
      {/* Three.js Canvas */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
      >
        <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[6, 8, 6]} intensity={1.6} color="#818cf8" />
          <pointLight position={[-6, -6, -2]} color="#06b6d4" intensity={2.2} />
          <MouseReactiveLight />
          <InteractiveMesh />
        </Canvas>
      </div>

      {/* Decorative branding overlay content */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            className="icon-badge"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
            }}
          >
            <MapPin size={20} color="#ffffff" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            EduAttend
          </span>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '420px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '999px',
            background: 'rgba(99, 102, 241, 0.25)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            color: '#c7d2fe',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: '16px',
          }}
        >
          <Sparkles size={13} color="#a5b4fc" />
          <span>Geofenced Campus Portal</span>
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.25, marginBottom: '12px' }}>
          Smart Attendance & Academic Records
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6 }}>
          Automated GPS location validation, instant faculty overrides, transparent dispute reviews, and offline fallback.
        </p>
      </div>
    </div>
  );
}
