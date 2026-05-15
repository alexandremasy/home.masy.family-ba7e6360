/**
 * Stylized abstract "map" background with an animated location pin.
 * No external tile service — pure SVG, themed via design tokens.
 */
export function MapPinBg({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 200"
      preserveAspectRatio="xMidYMid slice"
      className={className}
    >
      <defs>
        <pattern id="map-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.18" />
        </pattern>
        <radialGradient id="map-vignette" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.55" />
        </radialGradient>
        <radialGradient id="pin-pulse" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* base grid */}
      <rect x="0" y="0" width="400" height="200" fill="url(#map-grid)" />

      {/* fake roads */}
      <g stroke="currentColor" strokeWidth="1.4" opacity="0.22" fill="none" strokeLinecap="round">
        <path d="M -10 60 Q 120 40 220 80 T 420 110" />
        <path d="M -10 150 Q 100 130 180 150 T 420 130" />
        <path d="M 70 -10 L 110 220" />
        <path d="M 280 -10 Q 260 80 300 140 T 280 220" />
      </g>
      <g stroke="currentColor" strokeWidth="0.6" opacity="0.16" fill="none">
        <path d="M -10 95 Q 100 85 200 100 T 420 90" />
        <path d="M 200 -10 Q 195 100 215 220" />
      </g>

      {/* park / water blobs */}
      <ellipse cx="60" cy="170" rx="55" ry="22" fill="currentColor" opacity="0.08" />
      <ellipse cx="340" cy="40" rx="40" ry="18" fill="currentColor" opacity="0.08" />

      {/* pin */}
      <g transform="translate(200 100)">
        <circle r="34" fill="url(#pin-pulse)">
          <animate attributeName="r" values="22;38;22" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;0.2;0.9" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <circle r="10" fill="var(--primary)" />
        <circle r="4" fill="white" />
      </g>

      {/* vignette */}
      <rect x="0" y="0" width="400" height="200" fill="url(#map-vignette)" />
    </svg>
  );
}
