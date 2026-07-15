import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Home, Zap, ShieldCheck, Wifi, Car, Coins, ArrowUpRight, Cake, Music, Plug, Search, SlidersHorizontal, Flame, Droplet, X, TrendingDown, Minus } from "lucide-react";
import { CountUp } from "@/components/CountUp";
import { meteo, tesla, dishwasher, energie } from "@/lib/mock-data";
import { people } from "@/lib/maison-data";
import { LAB_THEME_CSS, bez, sunProgress } from "@/lib/lab-theme";

// Ambience proof v7 — console. Closer to the Novo ref:
// arrows on every tile, a ticked gauge (its signature) on a subject that earns it (the oil tank),
// a more varied bento. Sober bg, opaque saturated tiles, glass as the single exception.
export const Route = createFileRoute("/lab")({
  component: LabAmbience,
  head: () => ({ meta: [{ title: "Épreuve d'ambiance — Accueil" }] }),
});

const MODULES = [
  { key: "maison", label: "Maison", icon: Home },
  { key: "energie", label: "Énergie", icon: Zap, alert: true },
  { key: "securite", label: "Sécurité", icon: ShieldCheck },
  { key: "reseau", label: "Réseau", icon: Wifi },
  { key: "bernard", label: "Bernard", icon: Car },
  { key: "budget", label: "Budget", icon: Coins },
];

/** The ref's signature control: an arc of ticks with a marker on the value. */
function Gauge({ pct, label }: { pct: number; label: string }) {
  const N = 34, cx = 100, cy = 96, r = 74;
  const ticks = Array.from({ length: N }, (_, i) => {
    const t = i / (N - 1);
    const a = Math.PI - t * Math.PI;
    const on = t <= pct / 100;
    const len = on ? 12 : 8;
    return {
      x1: cx + r * Math.cos(a), y1: cy - r * Math.sin(a),
      x2: cx + (r - len) * Math.cos(a), y2: cy - (r - len) * Math.sin(a),
      on, key: i,
    };
  });
  const a = Math.PI - (pct / 100) * Math.PI;
  const mx = cx + (r + 3) * Math.cos(a), my = cy - (r + 3) * Math.sin(a);
  return (
    <svg viewBox="0 0 200 108" className="w-full overflow-visible">
      {ticks.map((t) => (
        <line key={t.key} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} strokeWidth={t.on ? 2.2 : 1.4} strokeLinecap="round"
          stroke={t.on ? "var(--accent-deep)" : "color-mix(in oklab, var(--ink) 22%, transparent)"} className="gauge-tick" />
      ))}
      <circle cx={mx} cy={my} r="3.5" fill="var(--accent-deep)" />
      <text x={cx} y={cy - 26} textAnchor="middle" className="fill-[color:var(--ink)] font-serif" fontSize="30">{pct}%</text>
      <text x={cx} y={cy - 8} textAnchor="middle" className="fill-[color:var(--dim)]" fontSize="9" letterSpacing="1.4">{label}</text>
    </svg>
  );
}

function Arrow() {
  return (
    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[color:var(--ink)]/15 text-[color:var(--dim)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
      <ArrowUpRight className="h-3.5 w-3.5" />
    </span>
  );
}

function LabAmbience() {
  const now = new Date();
  const h = now.getHours();
  const greeting = h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir";
  const timeStr = now.toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" });
  const m = meteo.today;
  const leo = people.find((p) => p.id === "leo");
  const oil = energie.oil;

  const t = sunProgress(now, m.sunrise, m.sunset);
  const sunX = bez(t, 14, 160, 306), sunY = bez(t, 96, -34, 96);

  return (
    <div className="lab-root relative min-h-screen w-full overflow-hidden">
      <style>{LAB_THEME_CSS}</style>

      <div className="relative z-10 mx-auto w-full max-w-2xl px-6 pb-32 pt-[20vh] sm:pt-[24vh]">

        {/* Greeting */}
        <div className="lab-in flex items-start justify-between" style={{ ["--d" as string]: "0ms" }}>
          <div>
            <p className="text-[13px] text-[color:var(--dim)]">{greeting}, Alexandre · {timeStr}</p>
            <h1 className="mt-2 font-serif text-[2.1rem] leading-[1.06] tracking-tight text-[color:var(--ink)] sm:text-5xl">
              La maison veille,<br /><span className="italic text-[color:var(--hot)]">une chose t'attend.</span>
            </h1>
          </div>
          <div className="flex gap-2">
            <button className="orb h-10 w-10"><Search className="h-4 w-4" /></button>
            <button className="orb h-10 w-10"><SlidersHorizontal className="h-4 w-4" /></button>
          </div>
        </div>

        {/* ---- One attention zone ---- */}
        <div className="lab-in mt-9 grid grid-cols-2 gap-3" style={{ ["--d" as string]: "140ms" }}>

          {/* MOMENT — big colour tile */}
          <button className="tile-accent group col-span-2 relative overflow-hidden rounded-[30px] p-6 text-left">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-black/50">{m.location} · maintenant</p>
                <div className="mt-1 flex items-baseline gap-2 text-black">
                  <span className="font-serif text-6xl tracking-tight"><CountUp to={m.tempC} />°</span>
                  <span className="text-sm text-black/55">{m.label}</span>
                </div>
                <p className="mt-2 text-[13px] text-black/50">Le jour décline · coucher {m.sunset}</p>
              </div>
              <span className="arrow-btn transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"><ArrowUpRight className="h-4 w-4" /></span>
            </div>
            <svg viewBox="0 0 320 108" className="mt-3 h-24 w-full overflow-visible">
              <defs>
                <radialGradient id="sunball" cx="34%" cy="28%" r="72%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="55%" stopColor="oklch(0.93 0.09 85)" />
                  <stop offset="100%" stopColor="oklch(0.74 0.15 52)" />
                </radialGradient>
              </defs>
              <path d="M 14 96 Q 160 -34 306 96" fill="none" stroke="rgba(0,0,0,0.30)" strokeWidth="1.5" strokeDasharray="3 5" className="lab-arc" />
              <line x1="14" y1="96" x2="306" y2="96" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
              <g className="lab-sun">
                <ellipse cx={sunX} cy={sunY + 13} rx="11" ry="3" fill="rgba(0,0,0,0.18)" />
                <circle cx={sunX} cy={sunY} r="11" fill="url(#sunball)" />
              </g>
            </svg>
          </button>

          {/* LÉO — second colour tile, tall */}
          {leo && (
            <div className="tile-deep group row-span-2 relative flex flex-col justify-between overflow-hidden rounded-3xl p-5">
              <span className="volume" aria-hidden style={{ right: "-28%", bottom: "-16%", width: "74%", aspectRatio: "1", opacity: 0.5 }} />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-black/20 text-white"><Cake className="h-5 w-5" /></span>
                  <span className="grid h-7 w-7 place-items-center rounded-full border border-white/25 text-white/80"><ArrowUpRight className="h-3.5 w-3.5" /></span>
                </div>
                <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-white/70">Aujourd'hui</p>
                <p className="mt-1 font-serif text-xl leading-tight text-white">Léo a 34 ans</p>
                <p className="mt-1.5 text-[12px] leading-relaxed text-white/70">Un mot lui ferait plaisir.</p>
              </div>
              <button className="relative mt-4 w-full rounded-full bg-white py-2 text-[13px] font-medium text-black transition-transform hover:scale-[1.02]">Écrire</button>
            </div>
          )}

          {/* MAZOUT — the ticked gauge, on a subject that earns it */}
          <button className="surface group flex flex-col rounded-3xl p-4 text-left">
            <div className="flex w-full items-start justify-between">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color:var(--chip)] text-[color:var(--accent-deep)]"><Flame className="h-4 w-4" /></span>
              <Arrow />
            </div>
            <div className="mt-1">
              <Gauge pct={oil.tankPct} label="CUVE" />
            </div>
            <p className="-mt-1 text-[11px] text-[color:var(--dim)]">{oil.tankLiters} L · ~{oil.autonomyDays} j d'autonomie</p>
          </button>

          {/* MUSIC */}
          <button className="surface group flex flex-col justify-between rounded-3xl p-4 text-left">
            <div className="flex items-start justify-between">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color:var(--chip)] text-[color:var(--hot)]"><Music className="h-4 w-4" /></span>
              <div className="eq" aria-hidden><i /><i /><i /><i /></div>
            </div>
            <div className="mt-5 min-w-0">
              <p className="truncate text-[13px] font-medium text-[color:var(--ink)]">Linked</p>
              <p className="truncate text-[11px] text-[color:var(--dim)]">Bonobo · Salon</p>
            </div>
          </button>

          {/* BERNARD — THE glass exception */}
          <button className="glass group flex flex-col justify-between rounded-3xl p-4 text-left">
            <div className="flex items-start justify-between">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color:var(--chip)] text-[color:var(--ink)]"><Car className="h-4 w-4" /></span>
              <span className="inline-flex shrink-0 items-center gap-1 text-[12px] tabular-nums text-[color:var(--dim)]"><Plug className="h-3 w-3" /><CountUp to={tesla.charge} />%</span>
            </div>
            <div className="mt-5 min-w-0">
              <p className="truncate text-[13px] font-medium text-[color:var(--ink)]">En route</p>
              <p className="truncate text-[11px] text-[color:var(--dim)]">Place Flagey</p>
            </div>
          </button>

          {/* DISHWASHER */}
          <button className="surface group flex flex-col justify-between rounded-3xl p-4 text-left">
            <div className="flex items-start justify-between">
              <span className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--dim)]">{dishwasher.phase}</span>
              <Arrow />
            </div>
            <div className="mt-5">
              <p className="text-[13px] font-medium text-[color:var(--ink)]">Lave-vaisselle</p>
              <p className="mt-0.5 text-[11px] text-[color:var(--dim)]">fin ~20:30</p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--track)]">
                <div className="bar h-full rounded-full" style={{ ["--p" as string]: `${dishwasher.progressPct}%`, background: "linear-gradient(90deg, var(--accent-deep), var(--accent-lite))" }} />
              </div>
            </div>
          </button>
        </div>

        <p className="lab-in mt-8 text-[13px] text-[color:var(--dim)]" style={{ ["--d" as string]: "320ms" }}>
          PMC à sortir avant 07:00 demain.
        </p>
      </div>

      {/* Global module nav */}
      <nav className="lab-in dock fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full px-2 py-2" style={{ ["--d" as string]: "460ms" }}>
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <button key={mod.key} aria-label={mod.label} className="dock-btn group relative grid h-11 w-11 place-items-center rounded-full text-[color:var(--dim)]">
              <Icon className="h-[18px] w-[18px]" />
              {mod.alert && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[color:var(--accent-deep)]" />}
              <span className="tip">{mod.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
