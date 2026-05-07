"use client";
import React from "react";
import { motion } from "framer-motion";

type LatLng = { lat: number; lng: number };
type Dot = { start: LatLng; end: LatLng };

const project = (lat: number, lng: number, w: number, h: number) => {
  const x = ((lng + 180) / 360) * w;
  const y = ((90 - lat) / 180) * h;
  return { x, y };
};

export default function WorldMapDemo({ dots }: { dots: Dot[] }) {
  const w = 1000;
  const h = 520;

  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl rounded-2xl bg-gradient-to-br from-white/70 to-neutral-50 dark:from-neutral-900 dark:to-neutral-800 p-4 shadow-lg">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[260px] md:h-[340px] lg:h-[420px]">
          <defs>
            <linearGradient id="g1" x1="0" x2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* subtle globe background grid */}
          <rect x={0} y={0} width={w} height={h} fill="transparent" />

          {/* draw connecting lines */}
          {dots.map((d, idx) => {
            const s = project(d.start.lat, d.start.lng, w, h);
            const e = project(d.end.lat, d.end.lng, w, h);
            return (
              <motion.g key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.12 }}>
                <motion.path
                  d={`M ${s.x} ${s.y} L ${e.x} ${e.y}`}
                  stroke="url(#g1)"
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.9, ease: "easeInOut", delay: idx * 0.12 }}
                  style={{ filter: "drop-shadow(0 6px 12px rgba(16,24,40,0.06))" }}
                />

                <circle cx={s.x} cy={s.y} r={4} fill="#0ea5e9" />
                <circle cx={e.x} cy={e.y} r={4} fill="#34d399" />
              </motion.g>
            );
          })}

          {/* faint world latitude/longitude lines for visual interest */}
          {[...Array(5)].map((_, i) => (
            <path
              key={i}
              d={`M 0 ${((i + 1) / 6) * h} H ${w}`}
              stroke="rgba(0,0,0,0.03)"
              strokeWidth={1}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
