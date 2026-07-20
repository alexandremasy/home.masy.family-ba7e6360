/**
 * Stylized PMC wheelie bin in flat-illustration style (Dribbble inspired).
 * Yellow body (Belgian PMC), domed lid, hinge ridge, recycling glyph,
 * side highlight, two wheels. Sways gently from the lid handle.
 */
export function PMCBag({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 220 240" className={className + " anim-sway origin-top"}>
      {/* ground shadow */}
      <ellipse cx="110" cy="226" rx="78" ry="5" fill="black" opacity="0.18" />

      {/* wheels */}
      <circle cx="56" cy="218" r="11" fill="oklch(0.42 0.02 270)" />
      <circle cx="56" cy="218" r="4" fill="oklch(0.32 0.02 270)" />
      <circle cx="164" cy="218" r="11" fill="oklch(0.42 0.02 270)" />
      <circle cx="164" cy="218" r="4" fill="oklch(0.32 0.02 270)" />

      {/* body */}
      <path
        d="M40 70 Q40 60 50 60 L170 60 Q180 60 180 70 L172 214 Q172 222 162 222 L58 222 Q48 222 48 214 Z"
        fill="oklch(0.86 0.17 92)"
      />
      {/* darker side shadow on right */}
      <path
        d="M158 60 L170 60 Q180 60 180 70 L172 214 Q172 222 162 222 L150 222 Z"
        fill="oklch(0.78 0.18 88)"
      />
      {/* hinge ridge */}
      <rect x="42" y="74" width="136" height="14" rx="3" fill="oklch(0.74 0.17 88)" />
      <g fill="oklch(0.62 0.16 82)" opacity="0.6">
        {Array.from({ length: 22 }).map((_, i) => (
          <rect key={i} x={48 + i * 6} y="78" width="2.5" height="6" rx="1" />
        ))}
      </g>

      {/* front recessed panel */}
      <rect x="62" y="100" width="96" height="108" rx="6" fill="oklch(0.82 0.18 90)" />

      {/* recycling triangle */}
      <g transform="translate(110 138)" fill="white">
        <path d="M-18 6 L-8 -10 L-2 -7 L-12 8 Z" />
        <path d="M18 6 L8 -10 L2 -7 L12 8 Z" />
        <path d="M-10 11 L10 11 L8 17 L-8 17 Z" />
        <path d="M-12 8 L-7 8 L-9 13 Z" opacity="0.7" />
        <path d="M12 8 L7 8 L9 13 Z" opacity="0.7" />
        <path d="M-10 -10 L-7 -5 L-2 -7 Z" opacity="0.7" />
      </g>

      {/* PMC label */}
      <text
        x="110"
        y="186"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontWeight="700"
        fontSize="14"
        letterSpacing="2"
        fill="white"
      >
        PMC
      </text>

      {/* lid */}
      <path
        d="M34 60 Q34 44 50 44 L170 44 Q186 44 186 60 L186 64 Q186 68 182 68 L38 68 Q34 68 34 64 Z"
        fill="oklch(0.78 0.18 88)"
      />
      {/* lid handle */}
      <rect x="98" y="32" width="24" height="14" rx="4" fill="oklch(0.72 0.17 85)" />

      {/* glossy highlight */}
      <path d="M52 90 Q56 86 64 86 L66 200 Q60 204 54 200 Z" fill="white" opacity="0.18" />
    </svg>
  );
}
