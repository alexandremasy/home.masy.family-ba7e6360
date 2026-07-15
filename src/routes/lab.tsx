import { createFileRoute } from "@tanstack/react-router";
import { Home, Zap, ShieldCheck, Wifi, Car, Coins, ArrowUpRight, Cake, Music, Plug, Search, SlidersHorizontal } from "lucide-react";
import { CountUp } from "@/components/CountUp";
import { meteo, tesla, dishwasher } from "@/lib/mock-data";
import { people } from "@/lib/maison-data";
import { LAB_THEME_CSS, bez, hm } from "@/lib/lab-theme";

// Ambience proof v6 — closing the gap with the Novo ref:
// sober background (no aurora wash), OPAQUE saturated tiles that pop, glass as a single
// exception, and material (radial-gradient volumes) instead of flat icons.
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

const hm = (s: string) => { const [h, m] = s.split(":").map(Number); return h + m / 60; };
const bez = (t: number, a: number, b: number, c: number) => { const u = 1 - t; return u * u * a + 2 * u * t * b + t * t * c; };

function LabAmbience() {
  const now = new Date();
  const h = now.getHours();
  const greeting = h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir";
  const timeStr = now.toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" });
  const m = meteo.today;
  const leo = people.find((p) => p.id === "leo");

  const dayT = Math.min(1, Math.max(0, (h + now.getMinutes() / 60 - hm(m.sunrise)) / (hm(m.sunset) - hm(m.sunrise))));
  const sunX = bez(dayT, 14, 160, 306), sunY = bez(dayT, 96, -34, 96);

  return (
    <div className="lab-root relative min-h-screen w-full overflow-hidden">
      <style>{CSS}</style>

      <div className="relative z-10 mx-auto w-full max-w-2xl px-6 pb-32 pt-[20vh] sm:pt-[24vh]">

        {/* Greeting */}
        <div className="lab-in flex items-start justify-between" style={{ ["--d" as string]: "0ms" }}>
          <div>
            <p className="text-[13px] text-[color:var(--dim)]">{greeting}, Alexandre · {timeStr}</p>
            <h1 className="mt-2 font-serif text-[2.1rem] leading-[1.06] tracking-tight text-[color:var(--ink)] sm:text-5xl">
              La maison veille,<br /><span className="italic text-[color:var(--hot)]">tout est paisible.</span>
            </h1>
          </div>
          <div className="flex gap-2">
            <button className="lab-orb"><Search className="h-4 w-4" /></button>
            <button className="lab-orb"><SlidersHorizontal className="h-4 w-4" /></button>
          </div>
        </div>

        {/* ---- One attention zone. Rhythm: colour · dark · glass · dark ---- */}
        <div className="lab-in mt-9 grid grid-cols-2 gap-3" style={{ ["--d" as string]: "140ms" }}>

          {/* MOMENT — opaque saturated hero (the big colour tile) */}
          <div className="lab-tile-accent col-span-2 relative overflow-hidden rounded-[30px] p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-black/50">{m.location} · maintenant</p>
                <div className="mt-1 flex items-baseline gap-2 text-black">
                  <span className="font-serif text-6xl tracking-tight"><CountUp to={m.tempC} />°</span>
                  <span className="text-sm text-black/55">{m.label}</span>
                </div>
                <p className="mt-2 text-[13px] text-black/50">Le jour décline · coucher {m.sunset}</p>
              </div>
              <button className="lab-arrow"><ArrowUpRight className="h-4 w-4" /></button>
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
          </div>

          {/* LÉO — second colour tile, saturated, with an overflowing volume */}
          {leo && (
            <div className="lab-tile-deep row-span-2 relative flex flex-col justify-between overflow-hidden rounded-3xl p-5">
              <span className="lab-orb-3d" aria-hidden />
              <div className="relative">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-black/20 text-white"><Cake className="h-5 w-5" /></span>
                <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-white/70">Aujourd'hui</p>
                <p className="mt-1 font-serif text-xl leading-tight text-white">Léo a 34 ans</p>
                <p className="mt-1.5 text-[12px] leading-relaxed text-white/70">Un mot lui ferait plaisir.</p>
              </div>
              <button className="relative mt-4 w-full rounded-full bg-white py-2 text-[13px] font-medium text-black transition-transform hover:scale-[1.02]">Écrire</button>
            </div>
          )}

          {/* MUSIC — dark opaque surface */}
          <div className="lab-surface flex flex-col justify-between rounded-3xl p-4">
            <div className="flex items-start justify-between">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color:var(--chip)] text-[color:var(--hot)]"><Music className="h-4 w-4" /></span>
              <div className="lab-eq" aria-hidden><i /><i /><i /><i /></div>
            </div>
            <div className="mt-5 min-w-0">
              <p className="truncate text-[13px] font-medium text-[color:var(--ink)]">Linked</p>
              <p className="truncate text-[11px] text-[color:var(--dim)]">Bonobo · Salon</p>
            </div>
          </div>

          {/* BERNARD — THE glass exception */}
          <div className="lab-glass flex flex-col justify-between rounded-3xl p-4">
            <div className="flex items-start justify-between">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color:var(--chip)] text-[color:var(--ink)]"><Car className="h-4 w-4" /></span>
              <span className="inline-flex shrink-0 items-center gap-1 text-[12px] tabular-nums text-[color:var(--dim)]"><Plug className="h-3 w-3" /><CountUp to={tesla.charge} />%</span>
            </div>
            <div className="mt-5 min-w-0">
              <p className="truncate text-[13px] font-medium text-[color:var(--ink)]">En route</p>
              <p className="truncate text-[11px] text-[color:var(--dim)]">Place Flagey</p>
            </div>
          </div>

          {/* DISHWASHER — dark opaque strip */}
          <div className="lab-surface col-span-2 rounded-3xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-medium text-[color:var(--ink)]">Lave-vaisselle · {dishwasher.phase}</p>
              <p className="text-[11px] text-[color:var(--dim)]">fin ~20:30</p>
            </div>
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--track)]">
              <div className="lab-bar h-full rounded-full" style={{ ["--p" as string]: `${dishwasher.progressPct}%`, background: "linear-gradient(90deg, var(--accent-deep), var(--accent-lite))" }} />
            </div>
          </div>
        </div>

        <p className="lab-in mt-8 text-[13px] text-[color:var(--dim)]" style={{ ["--d" as string]: "320ms" }}>
          PMC à sortir avant 07:00 demain.
        </p>
      </div>

      {/* Global module nav */}
      <nav className="lab-in lab-dock fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full px-2 py-2" style={{ ["--d" as string]: "460ms" }}>
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <button key={mod.key} aria-label={mod.label} className="lab-dock-btn group relative grid h-11 w-11 place-items-center rounded-full text-[color:var(--dim)]">
              <Icon className="h-[18px] w-[18px]" />
              {mod.alert && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[color:var(--accent-deep)]" />}
              <span className="lab-tip">{mod.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

const CSS = `
/* ---------- LIGHT — sober cream, colour lives in the tiles ---------- */
.lab-root {
  --bg: oklch(0.965 0.010 80);
  --surface: oklch(1 0 0); --surface-br: oklch(0.90 0.012 80);
  --ink: oklch(0.24 0.03 40); --dim: oklch(0.50 0.03 50); --hot: oklch(0.58 0.16 35);
  --accent-lite: oklch(0.84 0.115 72); --accent-deep: oklch(0.62 0.16 34);
  --glass-bg: rgba(255,255,255,0.55); --glass-br: rgba(255,255,255,0.85);
  --chip: rgba(0,0,0,0.05); --track: rgba(0,0,0,0.08);
  --sh: 0 18px 44px -24px rgba(80,45,20,0.35);
  --ease: cubic-bezier(0.2,0.7,0.2,1);
  background: var(--bg); color: var(--ink);
}
/* ---------- DARK — sober warm-black, colour lives in the tiles ---------- */
@media (prefers-color-scheme: dark) {
  .lab-root {
    --bg: oklch(0.145 0.018 32);
    --surface: oklch(0.205 0.020 34); --surface-br: oklch(0.26 0.02 34);
    --ink: oklch(0.96 0.012 75); --dim: oklch(0.66 0.02 60); --hot: oklch(0.84 0.115 72);
    --glass-bg: rgba(255,248,240,0.07); --glass-br: rgba(255,238,222,0.14);
    --chip: rgba(255,255,255,0.10); --track: rgba(255,255,255,0.10);
    --sh: 0 24px 60px -28px rgba(0,0,0,0.75);
  }
}
.dark .lab-root {
  --bg: oklch(0.145 0.018 32);
  --surface: oklch(0.205 0.020 34); --surface-br: oklch(0.26 0.02 34);
  --ink: oklch(0.96 0.012 75); --dim: oklch(0.66 0.02 60); --hot: oklch(0.84 0.115 72);
  --glass-bg: rgba(255,248,240,0.07); --glass-br: rgba(255,238,222,0.14);
  --chip: rgba(255,255,255,0.10); --track: rgba(255,255,255,0.10);
  --sh: 0 24px 60px -28px rgba(0,0,0,0.75);
}
/* Opaque tiles — the pop */
.lab-tile-accent { background: var(--accent-lite); box-shadow: var(--sh), inset 0 1px 0 rgba(255,255,255,0.4); }
.lab-tile-deep { background: var(--accent-deep); box-shadow: var(--sh), inset 0 1px 0 rgba(255,255,255,0.25); }
.lab-surface { background: var(--surface); border: 1px solid var(--surface-br); box-shadow: var(--sh); }
/* Glass — the single exception */
.lab-glass { background: var(--glass-bg); border: 1px solid var(--glass-br); backdrop-filter: blur(20px) saturate(1.2); box-shadow: var(--sh), inset 0 1px 0 var(--glass-br); }
/* Material — an overflowing volume inside the deep tile */
.lab-orb-3d { position:absolute; right:-28%; bottom:-16%; width:74%; aspect-ratio:1; border-radius:999px;
  background: radial-gradient(circle at 32% 28%, rgba(255,255,255,0.85), rgba(255,255,255,0.28) 42%, rgba(0,0,0,0.16) 78%);
  filter: blur(0.4px); opacity:.5; pointer-events:none; }
.lab-orb { display:grid; place-items:center; width:40px; height:40px; border-radius:999px; color:var(--dim);
  background: var(--surface); border:1px solid var(--surface-br); }
.lab-arrow { display:grid; place-items:center; width:36px; height:36px; border-radius:999px; color:#000; background: rgba(0,0,0,0.13); }
/* Dock */
.lab-dock { background: var(--surface); border:1px solid var(--surface-br); box-shadow: var(--sh); }
.lab-dock-btn { transition: background .25s var(--ease), color .25s var(--ease), transform .25s var(--ease); }
.lab-dock-btn:hover { background: var(--chip); color: var(--hot); transform: translateY(-2px); }
.lab-tip { position:absolute; bottom: calc(100% + 10px); left:50%; transform: translateX(-50%) translateY(4px) scale(.96);
  padding:5px 10px; border-radius:999px; white-space:nowrap; font-size:12px; line-height:1; color:var(--ink);
  background: var(--surface); border:1px solid var(--surface-br); box-shadow: var(--sh);
  opacity:0; pointer-events:none; transition: opacity .2s var(--ease), transform .25s var(--ease); }
.lab-dock-btn:hover .lab-tip, .lab-dock-btn:focus-visible .lab-tip { opacity:1; transform: translateX(-50%) translateY(0) scale(1); }
/* Motion */
@keyframes lab-rise { from{opacity:0; transform:translateY(16px);} to{opacity:1; transform:none;} }
.lab-in { opacity:0; animation: lab-rise .7s var(--ease) forwards; animation-delay: var(--d,0ms); }
@keyframes lab-draw { from{stroke-dashoffset:520;} to{stroke-dashoffset:0;} }
.lab-arc { animation: lab-draw 1.6s var(--ease) .5s both; }
@keyframes lab-sun-in { from{opacity:0; transform:scale(.4);} to{opacity:1; transform:scale(1);} }
.lab-sun { transform-box: fill-box; transform-origin:center; animation: lab-sun-in .8s var(--ease) 1.2s both; }
.lab-eq { display:flex; align-items:flex-end; gap:2.5px; height:16px; }
.lab-eq i { width:3px; border-radius:2px; background: var(--hot); height:40%; animation: lab-bars 1s ease-in-out infinite; }
.lab-eq i:nth-child(2){animation-delay:.2s;} .lab-eq i:nth-child(3){animation-delay:.45s;} .lab-eq i:nth-child(4){animation-delay:.1s;}
@keyframes lab-bars { 0%,100%{height:25%;} 50%{height:100%;} }
@keyframes lab-fill { from{width:0;} to{width:var(--p);} }
.lab-bar { width:var(--p); animation: lab-fill 1.4s var(--ease) .7s both; }
@media (prefers-reduced-motion: reduce){ .lab-in,.lab-arc,.lab-sun,.lab-bar{ animation:none; opacity:1; } }
`;
