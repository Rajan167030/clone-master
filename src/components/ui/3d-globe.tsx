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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.resetTransform && ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    // draw globe background
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    // draw faint outline
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(2,6,23,0.06)";
    ctx.stroke();

    // draw simple world outline via helper component logic
    // reuse WorldOutline projection logic by drawing polylines
    const drawPolyline = (pts: { x: number; y: number }[], stroke = "rgba(148,163,184,0.25)", width = 1) => {
      if (pts.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = width;
      ctx.stroke();
    };

    // equator points
    const equator = Array.from({ length: 180 }, (_, i) => {
      const lng = (i / 180) * 360 - 180;
      const p = project(0, lng);
      return { x: p.x, y: p.y, z: p.z };
    }).filter(p => p.z > -0.2).map(p => ({ x: p.x, y: p.y }));
    drawPolyline(equator, "rgba(148,163,184,0.25)", 1);

    // draw markers
    markers.forEach((m) => {
      const p = project(m.lat, m.lng);
      if (p.z <= 0) return; // hide backside
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#0369a1";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#fff";
      ctx.stroke();
    });

  }, [angle, markers]);

  return (
    <div className="w-full flex justify-center">
      <div className="rounded-lg overflow-hidden shadow-2xl bg-black">
        <canvas ref={canvasRef} style={{ width: "100%", display: "block" }} />
      </div>
    </div>
  );
}

export default Globe3D;
