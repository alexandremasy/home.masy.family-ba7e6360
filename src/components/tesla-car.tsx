import { Lock, LockOpen, MapPin } from "lucide-react";

export interface TeslaCarProps {
  /** The charge port glows while current is flowing. */
  charging: boolean;
  /** Locked reads green on the roof and in the badge; unlocked reads warm. */
  locked: boolean;
  /** Where the car is, shown under it. Omitted, the place is left out. */
  location?: string | null;
}

/**
 * The car itself — a playful Model 3, drawn rather than photographed.
 *
 * Purely presentational: two booleans and a place. It is the one illustration in
 * the app, and it carries the two states you check from across the room (is it
 * charging, is it locked) at a glance rather than in a list of fields.
 */
export function TeslaCar({ charging, locked, location }: TeslaCarProps) {
  return (
    <div className="relative flex flex-col items-center">
      <svg
        viewBox="0 0 260 130"
        className="h-32 w-52 sm:h-36 sm:w-60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="teslaBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(0, 78%, 62%)" />
            <stop offset="55%" stopColor="hsl(0, 75%, 50%)" />
            <stop offset="100%" stopColor="hsl(0, 70%, 38%)" />
          </linearGradient>
          <linearGradient id="teslaGlass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(210, 60%, 85%)" />
            <stop offset="100%" stopColor="hsl(210, 50%, 65%)" />
          </linearGradient>
          <linearGradient id="teslaTire" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(260, 30%, 30%)" />
            <stop offset="100%" stopColor="hsl(260, 35%, 18%)" />
          </linearGradient>
          <radialGradient id="teslaHub" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="hsl(40, 100%, 70%)" />
            <stop offset="100%" stopColor="hsl(28, 95%, 55%)" />
          </radialGradient>
        </defs>

        {/* soft ground shadow */}
        <ellipse cx="130" cy="118" rx="105" ry="5" className="fill-foreground/10" />

        {/* lower bumper / chrome */}
        <path
          d="M22 92 Q26 84 36 84 L224 84 Q234 84 238 92 L236 100 L24 100 Z"
          className="fill-secondary"
        />

        {/* main body */}
        <path
          d="M30 88 Q34 70 56 66 L88 60 Q104 38 130 36 Q156 38 172 60 L204 66 Q226 70 230 88 L230 96 Q230 100 226 100 L210 100 Q208 108 198 108 Q188 108 186 100 L74 100 Q72 108 62 108 Q52 108 50 100 L34 100 Q30 100 30 96 Z"
          fill="url(#teslaBody)"
        />

        {/* highlight stripe */}
        <path d="M40 84 Q90 76 200 78 Q220 80 224 86 L40 86 Z" className="fill-white/20" />

        {/* greenhouse / windows */}
        <path d="M92 64 L108 44 Q119 40 130 40 Q141 40 152 44 L168 64 Z" fill="url(#teslaGlass)" />
        {/* B-pillar */}
        <line
          x1="130"
          y1="40"
          x2="130"
          y2="64"
          className="stroke-foreground/70"
          strokeWidth="1.4"
        />
        {/* window outline */}
        <path
          d="M92 64 L108 44 Q119 40 130 40 Q141 40 152 44 L168 64"
          className="stroke-foreground/40"
          strokeWidth="1"
          fill="none"
        />

        {/* door line */}
        <path d="M130 66 L130 84" className="stroke-foreground/15" strokeWidth="1" />
        {/* door handle */}
        <rect x="118" y="74" width="8" height="2" rx="1" className="fill-foreground/30" />
        <rect x="142" y="74" width="8" height="2" rx="1" className="fill-foreground/30" />

        {/* headlight */}
        <path d="M222 80 Q230 80 230 86 L222 86 Z" className="fill-primary-foreground" />
        {/* taillight */}
        <rect x="30" y="80" width="6" height="4" rx="1" className="fill-foreground/40" />

        {/* wheel arches */}
        <path d="M44 100 Q44 78 74 78 Q104 78 104 100 Z" className="fill-foreground/15" />
        <path d="M156 100 Q156 78 186 78 Q216 78 216 100 Z" className="fill-foreground/15" />

        {/* wheels */}
        <circle cx="74" cy="100" r="16" fill="url(#teslaTire)" />
        <circle cx="74" cy="100" r="9" fill="url(#teslaHub)" />
        <circle cx="74" cy="100" r="2.5" className="fill-foreground/70" />
        <circle cx="186" cy="100" r="16" fill="url(#teslaTire)" />
        <circle cx="186" cy="100" r="9" fill="url(#teslaHub)" />
        <circle cx="186" cy="100" r="2.5" className="fill-foreground/70" />

        {/* sparkles */}
        <g className="fill-white">
          <path
            d="M170 50 l1.5 3 l3 1.5 l-3 1.5 l-1.5 3 l-1.5 -3 l-3 -1.5 l3 -1.5 z"
            opacity="0.9"
          />
          <path d="M70 78 l1 2 l2 1 l-2 1 l-1 2 l-1 -2 l-2 -1 l2 -1 z" opacity="0.8" />
          <path d="M210 92 l1 2 l2 1 l-2 1 l-1 2 l-1 -2 l-2 -1 l2 -1 z" opacity="0.7" />
        </g>

        {/* charge port glow */}
        {charging && (
          <g className="anim-breathe">
            <circle cx="34" cy="74" r="5" className="fill-primary/40" />
            <circle cx="34" cy="74" r="2.5" className="fill-primary" />
          </g>
        )}

        {/* lock indicator on roof */}
        <g>
          <circle cx="130" cy="52" r="6" className={locked ? "fill-success/25" : "fill-warm/25"} />
          <circle cx="130" cy="52" r="2.5" className={locked ? "fill-success" : "fill-warm"} />
        </g>
      </svg>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-2 text-2xs">
        <span
          className={
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 " +
            (locked ? "bg-success/10 text-success" : "bg-warm/10 text-warm")
          }
        >
          {locked ? <Lock className="h-3 w-3" /> : <LockOpen className="h-3 w-3" />}
          {locked ? "Verrouillée" : "Ouverte"}
        </span>
        {location && (
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {location}
          </span>
        )}
      </div>
    </div>
  );
}
