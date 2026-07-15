import { createFileRoute } from "@tanstack/react-router";
import { Home, Zap, ShieldCheck, Wifi, Car, Coins, ArrowUpRight, Cake, Music, Plug, Search, SlidersHorizontal } from "lucide-react";
import { CountUp } from "@/components/CountUp";
import { meteo, tesla, dishwasher } from "@/lib/mock-data";
import { people } from "@/lib/maison-data";

// Ambience proof v4 — one merged attention zone (weather lives INSIDE it), eye-level greeting,
// persistent module dock, light + dark following the browser.
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

      <div className="lab-blob b1" /><div className="lab-blob b2" /><div className="lab-blob b3" />

      {/* Eye-level start: generous breathing room above the greeting */}
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

        {/* ---- ONE attention zone — the weather lives inside the bento, not above it ---- */}
        <div className="lab-in mt-9 grid grid-cols-2 gap-3" style={{ ["--d" as string]: "140ms" }}>

          {/* Moment — wide hero */}
          <div className="lab-hero col-span-2 relative overflow-hidden rounded-[30px] p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-black/55">{m.location} · maintenant</p>
                <div className="mt-1 flex items-baseline gap-2 text-black">
                  <span className="font-serif text-6xl tracking-tight"><CountUp to={m.tempC} />°</span>
                  <span className="text-sm text-black/60">{m.label}</span>
                </div>
                <p className="mt-2 text-[13px] text-black/55">Le jour décline · coucher {m.sunset}</p>
              </div>
              <button className="lab-arrow"><ArrowUpRight className="h-4 w-4" /></button>
            </div>
            <svg viewBox="0 0 320 108" className="mt-3 h-24 w-full overflow-visible">
              <path d="M 14 96 Q 160 -34 306 96" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="1.5" strokeDasharray="3 5" className="lab-arc" />
              <line x1="14" y1="96" x2="306" y2="96" stroke="rgba(0,0,0,0.18)" strokeWidth="1" />
              <g className="lab-sun">
                <circle cx={sunX} cy={sunY} r="16" fill="rgba(0,0,0,0.18)" className="lab-sun-glow" />
                <circle cx={sunX} cy={sunY} r="7" fill="#fff" />
              </g>
            </svg>
          </div>

          {/* Léo — tall tile (the asymmetry) */}
          {leo && (
            <div className="lab-glass row-span-2 flex flex-col justify-between rounded-3xl p-5">
              <div>
                <span className="grid h-11 w-11 place-items-center rounded-full text-black" style={{ background: "linear-gradient(140deg, var(--amber), var(--terra))" }}><Cake className="h-5 w-5" /></span>
                <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-[color:var(--hot)]">Aujourd'hui</p>
                <p className="mt-1 font-serif text-xl leading-tight text-[color:var(--ink)]">Léo a 34 ans</p>
                <p className="mt-1.5 text-[12px] leading-relaxed text-[color:var(--dim)]">Un mot lui ferait plaisir.</p>
              </div>
              <button className="mt-4 w-full rounded-full bg-[color:var(--amber)] py-2 text-[13px] font-medium text-black transition-transform hover:scale-[1.02]">Écrire</button>
            </div>
          )}

          {/* Music — vertical compact tile */}
          <div className="lab-glass flex flex-col justify-between rounded-3xl p-4">
            <div className="flex items-start justify-between">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color:var(--chip)] text-[color:var(--hot)]"><Music className="h-4 w-4" /></span>
              <div className="lab-eq" aria-hidden><i /><i /><i /><i /></div>
            </div>
            <div className="mt-5 min-w-0">
              <p className="truncate text-[13px] font-medium text-[color:var(--ink)]">Linked</p>
              <p className="truncate text-[11px] text-[color:var(--dim)]">Bonobo · Salon</p>
            </div>
          </div>

          {/* Bernard — vertical compact tile */}
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

          {/* Dishwasher — wide strip */}
          <div className="lab-glass col-span-2 rounded-3xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-medium text-[color:var(--ink)]">Lave-vaisselle · {dishwasher.phase}</p>
              <p className="text-[11px] text-[color:var(--dim)]">fin ~20:30</p>
            </div>
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--track)]">
              <div className="lab-bar h-full rounded-full" style={{ ["--p" as string]: `${dishwasher.progressPct}%`, background: "linear-gradient(90deg, var(--terra), var(--amber))" }} />
            </div>
          </div>
        </div>

        <p className="lab-in mt-8 text-[13px] text-[color:var(--dim)]" style={{ ["--d" as string]: "320ms" }}>
          PMC à sortir avant 07:00 demain.
        </p>
      </div>

      {/* ---- Global module nav — persistent, discreet, always one tap away ---- */}
      <nav className="lab-in lab-dock fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full px-2 py-2" style={{ ["--d" as string]: "460ms" }}>
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <button key={mod.key} aria-label={mod.label} className="lab-dock-btn group relative grid h-11 w-11 place-items-center rounded-full text-[color:var(--dim)]">
              <Icon className="h-[18px] w-[18px]" />
              {mod.alert && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[color:var(--terra)]" />}
              <span className="lab-tip">{mod.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

const CSS = `
/* ---------- LIGHT (default) — warm, aurora present enough for glass to exist ---------- */
.lab-root {
  --bg0: oklch(0.98 0.012 85); --bg1: oklch(0.955 0.028 62);
  --ink: oklch(0.26 0.03 40); --dim: oklch(0.52 0.03 50);
  --amber: oklch(0.82 0.13 68); --terra: oklch(0.64 0.16 33); --hot: oklch(0.58 0.16 35);
  --glass-bg: rgba(255,255,255,0.55); --glass-br: rgba(255,255,255,0.8);
  --glass-sh: 0 24px 60px -30px rgba(90,50,20,0.4); --glass-hl: rgba(255,255,255,0.9);
  --chip: rgba(0,0,0,0.05); --track: rgba(0,0,0,0.08);
  --blob1: oklch(0.74 0.14 33 / 0.30); --blob2: oklch(0.86 0.12 72 / 0.32); --blob3: oklch(0.68 0.09 330 / 0.14);
  --ease: cubic-bezier(0.2,0.7,0.2,1);
  background: radial-gradient(130% 100% at 50% -10%, var(--bg0), var(--bg1) 75%);
  color: var(--ink);
}
/* ---------- DARK — follows the browser, or a forced .dark class ---------- */
@media (prefers-color-scheme: dark) {
  .lab-root {
    --bg0: oklch(0.19 0.035 42); --bg1: oklch(0.13 0.028 32);
    --ink: oklch(0.96 0.015 75); --dim: oklch(0.72 0.03 62); --hot: oklch(0.82 0.13 68);
    --glass-bg: rgba(255,248,240,0.055); --glass-br: rgba(255,238,222,0.13);
    --glass-sh: 0 24px 60px -30px rgba(0,0,0,0.7); --glass-hl: rgba(255,244,232,0.14);
    --chip: rgba(255,255,255,0.10); --track: rgba(255,255,255,0.10);
    --blob1: oklch(0.66 0.15 33 / 0.55); --blob2: oklch(0.80 0.12 68 / 0.40); --blob3: oklch(0.50 0.13 330 / 0.28);
  }
}
.dark .lab-root {
  --bg0: oklch(0.19 0.035 42); --bg1: oklch(0.13 0.028 32);
  --ink: oklch(0.96 0.015 75); --dim: oklch(0.72 0.03 62); --hot: oklch(0.82 0.13 68);
  --glass-bg: rgba(255,248,240,0.055); --glass-br: rgba(255,238,222,0.13);
  --glass-sh: 0 24px 60px -30px rgba(0,0,0,0.7); --glass-hl: rgba(255,244,232,0.14);
  --chip: rgba(255,255,255,0.10); --track: rgba(255,255,255,0.10);
  --blob1: oklch(0.66 0.15 33 / 0.55); --blob2: oklch(0.80 0.12 68 / 0.40); --blob3: oklch(0.50 0.13 330 / 0.28);
}
.lab-glass {
  background: var(--glass-bg); border: 1px solid var(--glass-br);
  backdrop-filter: blur(22px) saturate(1.25);
  box-shadow: var(--glass-sh), inset 0 1px 0 var(--glass-hl);
}
.lab-orb { display:grid; place-items:center; width:40px; height:40px; border-radius:999px; color:var(--dim);
  background: var(--glass-bg); border:1px solid var(--glass-br); backdrop-filter: blur(12px); }
.lab-arrow { display:grid; place-items:center; width:36px; height:36px; border-radius:999px; color:#000; background: rgba(0,0,0,0.14); }
.lab-hero { background: linear-gradient(150deg, var(--amber), var(--terra));
  box-shadow: 0 30px 70px -28px oklch(0.64 0.16 33 / 0.55), inset 0 1px 0 rgba(255,255,255,0.35); }
/* Dock */
.lab-dock { background: var(--glass-bg); border:1px solid var(--glass-br); backdrop-filter: blur(24px) saturate(1.3); box-shadow: var(--glass-sh); }
.lab-dock-btn { transition: background .25s var(--ease), color .25s var(--ease), transform .25s var(--ease); }
.lab-dock-btn:hover { background: var(--chip); color: var(--hot); transform: translateY(-2px); }
/* Tooltip — glass, rises on hover/focus */
.lab-tip {
  position:absolute; bottom: calc(100% + 10px); left:50%;
  transform: translateX(-50%) translateY(4px) scale(.96);
  padding: 5px 10px; border-radius: 999px; white-space: nowrap;
  font-size: 12px; line-height: 1; color: var(--ink);
  background: var(--glass-bg); border: 1px solid var(--glass-br);
  backdrop-filter: blur(18px) saturate(1.3); box-shadow: var(--glass-sh);
  opacity: 0; pointer-events: none;
  transition: opacity .2s var(--ease), transform .25s var(--ease);
}
.lab-dock-btn:hover .lab-tip, .lab-dock-btn:focus-visible .lab-tip {
  opacity: 1; transform: translateX(-50%) translateY(0) scale(1);
}
/* Aurora */
.lab-blob { position:absolute; border-radius:999px; filter: blur(90px); pointer-events:none; z-index:0; }
.b1 { left:-14%; top:-8%; width:64vh; height:64vh; background: radial-gradient(circle, var(--blob1), transparent 70%); animation: lab-float 18s ease-in-out infinite; }
.b2 { right:-12%; top:4%; width:58vh; height:58vh; background: radial-gradient(circle, var(--blob2), transparent 70%); animation: lab-float 24s ease-in-out infinite reverse; }
.b3 { left:18%; bottom:-16%; width:60vh; height:60vh; background: radial-gradient(circle, var(--blob3), transparent 70%); animation: lab-float 28s ease-in-out infinite; }
@keyframes lab-float { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(5%,4%) scale(1.1);} }
/* Motion */
@keyframes lab-rise { from{opacity:0; transform:translateY(16px);} to{opacity:1; transform:none;} }
.lab-in { opacity:0; animation: lab-rise .7s var(--ease) forwards; animation-delay: var(--d,0ms); }
@keyframes lab-draw { from{stroke-dashoffset:520;} to{stroke-dashoffset:0;} }
.lab-arc { animation: lab-draw 1.6s var(--ease) .5s both; }
@keyframes lab-sun-in { from{opacity:0; transform:scale(.4);} to{opacity:1; transform:scale(1);} }
.lab-sun { transform-box: fill-box; transform-origin:center; animation: lab-sun-in .8s var(--ease) 1.2s both; }
@keyframes lab-glow { 0%,100%{opacity:.5; r:15;} 50%{opacity:.85; r:19;} }
.lab-sun-glow { animation: lab-glow 3.5s ease-in-out infinite 1.6s; }
.lab-eq { display:flex; align-items:flex-end; gap:2.5px; height:16px; }
.lab-eq i { width:3px; border-radius:2px; background: var(--hot); height:40%; animation: lab-bars 1s ease-in-out infinite; }
.lab-eq i:nth-child(2){animation-delay:.2s;} .lab-eq i:nth-child(3){animation-delay:.45s;} .lab-eq i:nth-child(4){animation-delay:.1s;}
@keyframes lab-bars { 0%,100%{height:25%;} 50%{height:100%;} }
@keyframes lab-fill { from{width:0;} to{width:var(--p);} }
.lab-bar { width:var(--p); animation: lab-fill 1.4s var(--ease) .7s both; }
@media (prefers-reduced-motion: reduce){ .lab-in,.lab-arc,.lab-sun,.lab-bar{ animation:none; opacity:1; } }
`;
