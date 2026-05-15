/**
 * Stylized PMC bag (Belgian recycling) — yellow sack with subtle sway,
 * peeking bottle + can silhouettes. Pure SVG, themed via design tokens.
 */
export function PMCBag({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 120 140"
      className={className + " anim-sway origin-top"}
    >
      <defs>
        <linearGradient id="pmc-bag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.92 0.16 95)" />
          <stop offset="100%" stopColor="oklch(0.82 0.18 85)" />
        </linearGradient>
        <linearGradient id="pmc-bottle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.78 0.12 200)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="oklch(0.62 0.14 210)" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="pmc-can" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.92 0.02 0)" />
          <stop offset="100%" stopColor="oklch(0.72 0.02 0)" />
        </linearGradient>
      </defs>

      {/* soft ground shadow */}
      <ellipse cx="60" cy="132" rx="34" ry="3.5" fill="black" opacity="0.18" />

      {/* knot at top */}
      <path
        d="M44 28 Q60 14 76 28 Q70 22 60 22 Q50 22 44 28Z"
        fill="url(#pmc-bag)"
        stroke="oklch(0.55 0.14 75)"
        strokeWidth="1"
      />
      <path d="M52 22 Q60 16 68 22" stroke="oklch(0.55 0.14 75)" strokeWidth="1.2" fill="none" strokeLinecap="round" />

      {/* bag body */}
      <path
        d="M30 38 Q60 26 90 38 L96 120 Q60 134 24 120 Z"
        fill="url(#pmc-bag)"
        stroke="oklch(0.55 0.14 75)"
        strokeWidth="1.2"
      />

      {/* translucent transparency fold */}
      <path d="M40 50 L45 118" stroke="oklch(0.55 0.14 75)" strokeWidth="0.7" opacity="0.4" fill="none" />
      <path d="M80 50 L75 118" stroke="oklch(0.55 0.14 75)" strokeWidth="0.7" opacity="0.4" fill="none" />

      {/* peeking bottle */}
      <g transform="translate(48 44)">
        <rect x="-4" y="-12" width="8" height="6" rx="1.5" fill="url(#pmc-bottle)" />
        <path d="M-3 -6 Q-3 -2 -6 2 L-6 16 Q0 18 6 16 L6 2 Q3 -2 3 -6 Z" fill="url(#pmc-bottle)" />
        <path d="M-4 4 L4 4" stroke="white" strokeWidth="0.6" opacity="0.5" />
      </g>

      {/* peeking can */}
      <g transform="translate(72 46)">
        <rect x="-5" y="-10" width="10" height="20" rx="2" fill="url(#pmc-can)" />
        <rect x="-5" y="-10" width="10" height="2.5" rx="1" fill="oklch(0.55 0.02 0)" />
        <rect x="-3.5" y="-4" width="7" height="9" rx="0.5" fill="oklch(0.62 0.18 25)" opacity="0.85" />
      </g>

      {/* PMC label patch */}
      <g transform="translate(60 92)">
        <rect x="-16" y="-10" width="32" height="20" rx="3" fill="white" opacity="0.95" />
        <text
          x="0"
          y="4.5"
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontWeight="800"
          fontSize="12"
          letterSpacing="1.2"
          fill="oklch(0.45 0.14 75)"
        >
          PMC
        </text>
      </g>

      {/* highlight */}
      <path d="M34 48 Q40 42 52 42" stroke="white" strokeWidth="2" opacity="0.45" fill="none" strokeLinecap="round" />
    </svg>
  );
}
