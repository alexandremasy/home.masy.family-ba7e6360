import { createFileRoute } from "@tanstack/react-router";
import { Lightbulb, Music, ChevronLeft } from "lucide-react";
import { meteo, rooms } from "@/lib/mock-data";
import { LAB_THEME_CSS, bez, sunProgress } from "@/lib/lab-theme";

// Surface #2 — the 480×480 wall touchscreen (Waveshare ESP32-S3-Touch-LCD-4B, 86mm box).
// Same vocabulary as the console (tokens + primitives from lab-theme), a quarter of the density:
// glanceable in one look, one gesture at arm's reach. This is the extensibility proof.
export const Route = createFileRoute("/mural")({
  component: MuralPage,
  head: () => ({ meta: [{ title: "Épreuve — Mural 480×480" }] }),
});

function MuralPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-neutral-800 p-10">
      <style>{LAB_THEME_CSS}</style>
      <div>
        {/* The real surface, at its real size */}
        <div className="lab-root overflow-hidden rounded-[18px] shadow-2xl" style={{ width: 480, height: 480 }}>
          <MuralSurface />
        </div>
        <p className="mt-4 text-center text-xs uppercase tracking-[0.18em] text-white/40">Mural cuisine · 480 × 480 · 4"</p>
      </div>
    </div>
  );
}

function MuralSurface() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" });
  const m = meteo.today;
  const cuisine = rooms.find((r) => r.key === "cuisine");

  const t = sunProgress(now, m.sunrise, m.sunset);
  const sunX = bez(t, 12, 110, 208), sunY = bez(t, 58, -18, 58);

  return (
    <div className="flex h-full flex-col p-4">
      {/* Header — minimal: where you are, what time it is */}
      <div className="lab-in flex items-center justify-between" style={{ ["--d" as string]: "0ms" }}>
        <button className="orb h-8 w-8"><ChevronLeft className="h-4 w-4" /></button>
        <p className="font-serif text-lg tracking-tight">Cuisine</p>
        <p className="text-[13px] tabular-nums text-[color:var(--dim)]">{timeStr}</p>
      </div>

      {/* THE glance — one dominant tile: the room + its one gesture */}
      <div className="lab-in tile-accent relative mt-3 flex-1 overflow-hidden rounded-[22px] p-4" style={{ ["--d" as string]: "100ms" }}>
        <span className="volume" style={{ right: "-14%", bottom: "-22%", width: "40%", aspectRatio: "1", opacity: 0.28 }} />
        <div className="relative flex h-full flex-col justify-center gap-1">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-black/50">Il fait</p>
            <p className="font-serif text-5xl tracking-tight text-black">{cuisine?.temperature}°</p>
            <p className="mt-1 text-[12px] text-black/55">{m.tempC}° dehors · {m.label}</p>
          </div>
          {/* the day arc, shrunk — same signature, quarter scale */}
          <svg viewBox="0 0 220 66" className="h-12 w-full overflow-visible">
            <defs>
              <radialGradient id="sunball-m" cx="34%" cy="28%" r="72%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="55%" stopColor="oklch(0.93 0.09 85)" />
                <stop offset="100%" stopColor="oklch(0.74 0.15 52)" />
              </radialGradient>
            </defs>
            <path d="M 12 58 Q 110 -18 208 58" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1.2" strokeDasharray="3 5" className="lab-arc" />
            <g className="lab-sun">
              <ellipse cx={sunX} cy={sunY + 9} rx="8" ry="2.5" fill="rgba(0,0,0,0.18)" />
              <circle cx={sunX} cy={sunY} r="8" fill="url(#sunball-m)" />
            </g>
          </svg>
        </div>
      </div>

      {/* One gesture + one glance — nothing more fits, and nothing more belongs */}
      <div className="lab-in mt-3 grid grid-cols-2 gap-3" style={{ ["--d" as string]: "200ms" }}>
        <button className="surface flex items-center gap-2.5 rounded-[18px] p-3.5 text-left transition-transform active:scale-[0.97]">
          <span className="orb h-9 w-9 shrink-0" style={{ color: "var(--hot)" }}><Lightbulb className="h-4 w-4" /></span>
          <span className="min-w-0">
            <span className="block text-[13px] font-medium">Lumières</span>
            <span className="block text-[11px] text-[color:var(--dim)]">Éteintes</span>
          </span>
        </button>
        <div className="surface flex items-center gap-2.5 rounded-[18px] p-3.5">
          <span className="orb h-9 w-9 shrink-0" style={{ color: "var(--hot)" }}><Music className="h-4 w-4" /></span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium">Linked</span>
            <span className="block truncate text-[11px] text-[color:var(--dim)]">Bonobo</span>
          </span>
          <span className="eq shrink-0" aria-hidden><i /><i /><i /><i /></span>
        </div>
      </div>
    </div>
  );
}
