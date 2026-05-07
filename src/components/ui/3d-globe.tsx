import React, { useEffect, useRef, useState } from "react";

export type GlobeMarker = {
  lat: number;
  lng: number;
  src?: string;
  label?: string;
};

type GlobeProps = {
  markers: GlobeMarker[];
  config?: {
    atmosphereColor?: string;
    atmosphereIntensity?: number;
    bumpScale?: number;
    autoRotateSpeed?: number;
  };
  onMarkerClick?: (m: GlobeMarker) => void;
  onMarkerHover?: (m?: GlobeMarker) => void;
};

function deg2rad(d: number) {
  return (d * Math.PI) / 180;
}

// Simplified world map outline (simplified continent shapes)
const WorldOutline = ({ cx, cy, radius, rotation }: { cx: number; cy: number; radius: number; rotation: number }) => {
  const lonOffset = rotation;
  
  const project = (lat: number, lng: number) => {
    const latR = deg2rad(lat);
    const lonR = deg2rad(lng) + lonOffset;
    const x = cx + radius * Math.cos(latR) * Math.sin(lonR);
    const y = cy - radius * Math.sin(latR);
    const z = Math.cos(latR) * Math.cos(lonR);
    return { x, y, z, visible: z > -0.2 };
  };

  // Equator
  const equatorPoints = Array.from({ length: 180 }, (_, i) => {
    const lng = (i / 180) * 360 - 180;
    return project(0, lng);
  }).filter(p => p.visible);

  // Tropics (simplified)
  const tropicPoints = Array.from({ length: 120 }, (_, i) => {
    const lng = (i / 120) * 360 - 180;
    return project(23.5, lng);
  }).filter(p => p.visible);

  // Prime Meridian (simplified)
  const meridianPoints = Array.from({ length: 100 }, (_, i) => {
    const lat = (i / 100) * 180 - 90;
    return project(lat, 0);
  }).filter(p => p.visible);

  return (
    <>
      {equatorPoints.length > 1 && (
        <polyline
          points={equatorPoints.map(p => `${p.x},${p.y}`).join(" ")}
          stroke="rgba(148,163,184,0.25)"
          strokeWidth={1}
          fill="none"
        />
      )}
      {tropicPoints.length > 1 && (
        <polyline
          points={tropicPoints.map(p => `${p.x},${p.y}`).join(" ")}
          stroke="rgba(148,163,184,0.15)"
          strokeWidth={0.8}
          fill="none"
        />
      )}
      {meridianPoints.length > 1 && (
        <polyline
          points={meridianPoints.map(p => `${p.x},${p.y}`).join(" ")}
          stroke="rgba(148,163,184,0.15)"
          strokeWidth={0.8}
          fill="none"
        />
      )}
    </>
  );
};

export function Globe3D({ markers, config, onMarkerClick, onMarkerHover }: GlobeProps) {
  const width = 520;
  const height = 520;
  const radius = Math.min(width, height) / 2 - 20;
  const cx = width / 2;
  const cy = height / 2;

  const [angle, setAngle] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const speed = (config?.autoRotateSpeed ?? 0.3) * (Math.PI / 180);
    let last = performance.now();
    const loop = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      setAngle((a) => a + speed * dt);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [config?.autoRotateSpeed]);

  const project = (lat: number, lng: number) => {
    const latR = deg2rad(lat);
    const lonR = deg2rad(lng) + angle;
    const x = cx + radius * Math.cos(latR) * Math.sin(lonR);
    const y = cy - radius * Math.sin(latR);
    const z = Math.cos(latR) * Math.cos(lonR);
    return { x, y, z };
  };

  return (
    <div className="w-full flex justify-center">
      <div className="rounded-xl overflow-hidden shadow-2xl bg-gradient-to-b from-slate-900 to-black p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" style={{ maxWidth: "520px", display: "block" }}>
          <defs>
            <radialGradient id="globeGradient" cx="35%" cy="35%">
              <stop offset="0%" stopColor={config?.atmosphereColor ?? "#0ea5e9"} stopOpacity="0.4" />
              <stop offset="50%" stopColor={config?.atmosphereColor ?? "#0ea5e9"} stopOpacity="0.2" />
              <stop offset="100%" stopColor="#1e293b" stopOpacity="0.5" />
            </radialGradient>
            <filter id="glowEffect">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="markerShadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Background atmosphere */}
          <circle cx={cx} cy={cy} r={radius + 12} fill="#0f172a" opacity="0.6" />

          {/* Globe sphere */}
          <circle cx={cx} cy={cy} r={radius} fill="url(#globeGradient)" stroke="#334155" strokeWidth="2.5" />

          {/* World grid outline */}
          <WorldOutline cx={cx} cy={cy} radius={radius} rotation={angle} />

          {/* Markers */}
          {markers.map((m, idx) => {
            const p = project(m.lat, m.lng);
            const visible = p.z > 0.05;
            const markerColors = ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
            const markerColor = markerColors[idx % markerColors.length];

            if (!visible) return null;

            return (
              <g key={idx} transform={`translate(${p.x}, ${p.y})`} filter="url(#markerShadow)" style={{ cursor: "pointer" }} onClick={() => onMarkerClick?.(m)}>
                {/* Glow aura */}
                <circle cx={0} cy={0} r={32} fill={markerColor} opacity="0.1" />
                <circle cx={0} cy={0} r={24} fill={markerColor} opacity="0.15" />

                {/* Main marker circle */}
                <circle cx={0} cy={0} r={20} fill="#ffffff" stroke={markerColor} strokeWidth="3" filter="url(#glowEffect)" />

                {/* Inner icon/avatar */}
                {m.src ? (
                  <image href={m.src} x={-13} y={-13} width={26} height={26} clipPath="circle(13px)" />
                ) : (
                  <circle cx={0} cy={0} r={9} fill={markerColor} />
                )}

                {/* Label badge */}
                {m.label && (
                  <g>
                    <rect x={28} y={-12} width={m.label.length * 6 + 10} height={20} rx={10} fill={markerColor} opacity="0.95" />
                    <text
                      x={33}
                      y={3}
                      fontSize={11}
                      fontWeight="700"
                      fill="#ffffff"
                      fontFamily="system-ui, -apple-system, sans-serif"
                      textAnchor="start"
                    >
                      {m.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default Globe3D;
