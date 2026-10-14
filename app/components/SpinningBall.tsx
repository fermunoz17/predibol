import { useId } from "react";

// The Predibol logo ball, spinning on its axis tilted 45° (same look as the landing logo's idle
// spin). Pure SVG + CSS, so it works in server components, loading.tsx and Suspense fallbacks.
// Spin styles live in globals.css → "Spinning ball". Size is in px.

const PERIOD = 280;
const TILT = -45; // matches IDLE_TILT in HeroLogoReveal

export function SpinningBall({ size = 40, className = "", label, x, y }: { size?: number; className?: string; label?: string; x?: number; y?: number }) {
  const id = "sb" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return (
    <svg
      className={`sb ${className}`}
      x={x}
      y={y}
      width={size}
      height={size}
      viewBox="-146 -146 292 292"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <radialGradient id={`${id}-shade`} cx="0.38" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.7" stopColor="#F1F4FA" />
          <stop offset="1" stopColor="#C9D2E3" />
        </radialGradient>
        <radialGradient id={`${id}-sphere`} cx="0.42" cy="0.38" r="0.7">
          <stop offset="0.55" stopColor="#0B1E5B" stopOpacity="0" />
          <stop offset="1" stopColor="#0B1E5B" stopOpacity="0.38" />
        </radialGradient>
        <clipPath id={`${id}-clip`}><circle r="137" /></clipPath>
        <g id={`${id}-art`}>
          <g fill="none" stroke="#B7C2D8" strokeWidth="2.5">
            <path d="M-138,-10 C-96,-14 -60,-6 -40,0" />
            <path d="M-40,0 C-30,-40 -10,-70 24,-86 C56,-100 92,-102 120,-92" />
            <path d="M24,-86 C10,-104 4,-122 6,-140" />
            <path d="M-40,0 C-62,-30 -96,-44 -132,-46" />
            <path d="M-40,0 C-20,40 10,70 40,90 M40,90 C70,80 100,60 120,40 M-40,0 C-80,30 -110,60 -120,72" />
          </g>
          <g fill="#7BE33B">
            <path d="M-26,0 C10,-48 66,-82 134,-62 L139,-34 C86,-56 40,-30 14,0 Z" />
            <path d="M-110,40 C-60,70 -10,110 20,138 L-12,139 C-40,110 -80,80 -126,60 Z" />
          </g>
          <g>
            <path d="M-136,-48 C-80,-62 -30,-100 -4,-139 L36,-135 C6,-96 -52,-46 -128,-22 Z" fill="#2457E6" />
            <path d="M60,-118 C70,-92 96,-78 124,-76" fill="none" stroke="#2457E6" strokeWidth="10" strokeLinecap="round" />
            <path d="M60,20 C90,40 110,70 120,90 L104,104 C96,80 80,54 52,34 Z" fill="#2457E6" />
          </g>
          <g fill="#0B1E5B">
            <path d="M-120,-66 C-70,-78 -40,-104 -24,-128 L-12,-130 C-30,-100 -64,-72 -116,-56 Z" />
            <path d="M30,-6 C56,-38 92,-56 138,-50 L139,-42 C96,-48 64,-32 42,-4 Z" />
            <path d="M-70,90 C-40,100 -20,118 -10,134 L-22,136 C-34,120 -52,106 -76,98 Z" />
          </g>
        </g>
      </defs>
      <circle r="140" fill={`url(#${id}-shade)`} />
      <g clipPath={`url(#${id}-clip)`}>
        <g transform={`rotate(${-TILT})`}>
          <g className="sb-roll">
            <use href={`#${id}-art`} transform={`rotate(${TILT})`} />
            <use href={`#${id}-art`} transform={`translate(-${PERIOD} 0) rotate(${TILT})`} />
          </g>
        </g>
        <circle r="140" fill={`url(#${id}-sphere)`} />
        <ellipse cx="-45" cy="-60" rx="55" ry="32" fill="#FFFFFF" opacity="0.18" transform="rotate(-30 -45 -60)" />
      </g>
      <circle r="140" fill="none" stroke="#0B1E5B" strokeWidth="8" />
    </svg>
  );
}
