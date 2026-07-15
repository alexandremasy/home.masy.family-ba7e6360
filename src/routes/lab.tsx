import { createFileRoute } from "@tanstack/react-router";
import { Home, Zap, ShieldCheck, Wifi, Car, Coins, ArrowUpRight, Cake, Music, Plug, Search, SlidersHorizontal } from "lucide-react";
import { CountUp } from "@/components/CountUp";
import { meteo, tesla, dishwasher } from "@/lib/mock-data";
import { people } from "@/lib/maison-data";

// Ambience proof v3 — voie B: warm-dark, glass that finally reads, editorial bento.
// Keeps the wins: living "moment" (sun arc), "en ce moment" flux, motion cascade.
export const Route = createFileRoute("/lab")({
  component: LabAmbience,
  head: () => ({ meta: [{ title: "Épreuve d'ambiance — Accueil" }] }),
});

const MODULES = [
  { key: "maison", label: "Maison", icon: Home, hint: "Repas ce soir" },
  { key: "energie", label: "Énergie", icon: Zap, hint: "mazout 22%" },
  { key: "securite", label: "Sécurité", icon: ShieldCheck, hint: "Tout est calme" },
  { key: "reseau", label: "Réseau", icon: Wifi, hint: "Tout en ligne" },
  { key: "bernard", label: "Bernard", icon: Car, hint: "En route · 74%" },
  { key: "budget", label: "Budget", icon: Coins, hint: "+8 092 €" },
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

      {/* Warm-dark aurora */}
      <div className="lab-blob b1" /><div className="lab-blob b2" /><div className="lab-blob b3" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-11 sm:py-14">

        {/* Header — small greeting + editorial title + round controls */}
        <div className="lab-in" style={{ ["--d" as string]: "0ms" }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] text-[color:var(--dim)]">{greeting}, Alexandre · {timeStr}</p>
              <h1 className="mt-2 font-serif text-[2.1rem] leading-[1.06] tracking-tight text-[color:var(--ink)] sm:text-5xl">
                La maison veille,<br /><em className="not-italic text-[color:var(--amber)] italic">tout est paisible.</em>
              </h1>
            </div>
            <div className="flex gap-2">
              <button className="lab-orb"><Search className="h-4 w-4" /></button>
              <button className="lab-orb"><SlidersHorizontal className="h-4 w-4" /></button>
            </div>
          </div>
        </div>

        {/* HERO — the moment, on a saturated warm tile */}
        <div className="lab-in mt-7" style={{ ["--d" as string]: "120ms" }}>
          <div className="lab-hero relative overflow-hidden rounded-[30px] p-6 sm:p-7">
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
        </div>

        {/* EN CE MOMENT */}
        <div className="lab-in mt-8" style={{ ["--d" as string]: "240ms" }}>
          <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-[color:var(--dim)]">En ce moment</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

            {leo && (
              <div className="lab-glass flex items-center gap-3.5 rounded-2xl p-4 sm:col-span-2">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-black" style={{ background: "linear-gradient(140deg, var(--amber), var(--terra))" }}><Cake className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--amber)]">Aujourd'hui</p>
                  <p className="text-sm text-[color:var(--ink)]"><span className="font-medium">Léo a 34 ans.</span> <span className="text-[color:var(--dim)]">Un mot lui ferait plaisir.</span></p>
                </div>
                <button className="shrink-0 rounded-full bg-[color:var(--amber)] px-3.5 py-2 text-[13px] font-medium text-black transition-transform hover:scale-[1.03]">Écrire</button>
              </div>
            )}

            <div className="lab-glass flex items-center gap-3 rounded-2xl p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-[color:var(--amber)]"><Music className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[color:var(--ink)]">Linked · Bonobo</p>
                <p className="text-[11px] text-[color:var(--dim)]">Salon · Spotify</p>
              </div>
              <div className="lab-eq" aria-hidden><i /><i /><i /><i /></div>
            </div>

            <div className="lab-glass flex items-center gap-3 rounded-2xl p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-[color:var(--ink)]"><Car className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[color:var(--ink)]">En déplacement</p>
                <p className="text-[11px] text-[color:var(--dim)]">{tesla.location}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[13px] tabular-nums text-[color:var(--dim)]"><Plug className="h-3.5 w-3.5" /><CountUp to={tesla.charge} />%</span>
            </div>

            <div className="lab-glass rounded-2xl p-4 sm:col-span-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[color:var(--ink)]">Lave-vaisselle · {dishwasher.phase}</p>
                <p className="text-[11px] text-[color:var(--dim)]">fin ~20:30</p>
              </div>
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
                <div className="lab-bar h-full rounded-full" style={{ ["--p" as string]: `${dishwasher.progressPct}%`, background: "linear-gradient(90deg, var(--terra), var(--amber))" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Modules */}
        <div className="lab-in mt-9" style={{ ["--d" as string]: "380ms" }}>
          <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-[color:var(--dim)]">La maison</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {MODULES.map((mod) => {
              const Icon = mod.icon;
              return (
                <button key={mod.key} className="lab-glass lab-tile group relative flex flex-col gap-3 rounded-2xl p-4 text-left">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-[color:var(--amber)]"><Icon className="h-4 w-4" /></span>
                  <ArrowUpRight className="absolute right-3.5 top-3.5 h-4 w-4 text-[color:var(--dim)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  <span>
                    <span className="block text-sm font-medium text-[color:var(--ink)]">{mod.label}</span>
                    <span className="block truncate text-[11px] text-[color:var(--dim)]">{mod.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lab-in mt-auto pt-8" style={{ ["--d" as string]: "480ms" }}>
          <p className="text-[13px] text-[color:var(--dim)]">PMC à sortir avant 07:00 demain.</p>
        </div>
      </div>
    </div>
  );
}

const CSS = `
.lab-root {
  --bg0: oklch(0.19 0.035 42); --bg1: oklch(0.13 0.028 32);
  --ink: oklch(0.96 0.015 75); --dim: oklch(0.72 0.03 62);
  --amber: oklch(0.82 0.13 68); --terra: oklch(0.66 0.15 33);
  --ease: cubic-bezier(0.2,0.7,0.2,1);
  background: radial-gradient(130% 100% at 50% -10%, var(--bg0), var(--bg1) 70%);
  color: var(--ink);
}
.lab-orb { display:grid; place-items:center; width:40px; height:40px; border-radius:999px; color: var(--dim);
  background: rgba(255,250,244,0.06); border: 1px solid rgba(255,240,225,0.12); backdrop-filter: blur(12px); }
.lab-arrow, .lab-hero .lab-arrow { display:grid; place-items:center; width:36px; height:36px; border-radius:999px; color:#000;
  background: rgba(0,0,0,0.14); }
/* Warm-dark glass — reads because there's a lit aurora behind it */
.lab-glass {
  background: rgba(255,248,240,0.055);
  border: 1px solid rgba(255,238,222,0.13);
  backdrop-filter: blur(22px) saturate(1.25);
  box-shadow: 0 24px 60px -30px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,244,232,0.14);
}
.lab-tile { transition: transform .35s var(--ease), background .35s var(--ease); }
.lab-tile:hover { transform: translateY(-3px); background: rgba(255,248,240,0.09); }
/* Saturated warm hero tile — the pop */
.lab-hero {
  background: linear-gradient(150deg, var(--amber), var(--terra));
  box-shadow: 0 30px 70px -28px oklch(0.66 0.15 33 / 0.6), inset 0 1px 0 rgba(255,255,255,0.35);
}
/* Aurora blobs */
.lab-blob { position:absolute; border-radius:999px; filter: blur(90px); pointer-events:none; z-index:0; }
.b1 { left:-14%; top:-10%; width:64vh; height:64vh; background: radial-gradient(circle, oklch(0.66 0.15 33 / 0.55), transparent 70%); animation: lab-float 18s ease-in-out infinite; }
.b2 { right:-12%; top:2%; width:58vh; height:58vh; background: radial-gradient(circle, oklch(0.80 0.12 68 / 0.4), transparent 70%); animation: lab-float 24s ease-in-out infinite reverse; }
.b3 { left:20%; bottom:-18%; width:60vh; height:60vh; background: radial-gradient(circle, oklch(0.50 0.13 330 / 0.28), transparent 70%); animation: lab-float 28s ease-in-out infinite; }
@keyframes lab-float { 0%,100%{ transform: translate(0,0) scale(1);} 50%{ transform: translate(5%,4%) scale(1.1);} }
/* Cascade */
@keyframes lab-rise { from{opacity:0; transform:translateY(16px);} to{opacity:1; transform:none;} }
.lab-in { opacity:0; animation: lab-rise .7s var(--ease) forwards; animation-delay: var(--d,0ms); }
/* Sun arc */
@keyframes lab-draw { from{stroke-dashoffset:520;} to{stroke-dashoffset:0;} }
.lab-arc { animation: lab-draw 1.6s var(--ease) .4s both; }
@keyframes lab-sun-in { from{opacity:0; transform:scale(.4);} to{opacity:1; transform:scale(1);} }
.lab-sun { transform-box: fill-box; transform-origin: center; animation: lab-sun-in .8s var(--ease) 1.1s both; }
@keyframes lab-glow { 0%,100%{opacity:.5; r:15;} 50%{opacity:.85; r:19;} }
.lab-sun-glow { animation: lab-glow 3.5s ease-in-out infinite 1.6s; }
/* Equalizer */
.lab-eq { display:flex; align-items:flex-end; gap:2.5px; height:18px; }
.lab-eq i { width:3px; border-radius:2px; background: var(--amber); height:40%; animation: lab-bars 1s ease-in-out infinite; }
.lab-eq i:nth-child(2){animation-delay:.2s;} .lab-eq i:nth-child(3){animation-delay:.45s;} .lab-eq i:nth-child(4){animation-delay:.1s;}
@keyframes lab-bars { 0%,100%{height:25%;} 50%{height:100%;} }
/* Progress */
@keyframes lab-fill { from{width:0;} to{width:var(--p);} }
.lab-bar { width:var(--p); animation: lab-fill 1.4s var(--ease) .6s both; }
@media (prefers-reduced-motion: reduce){ .lab-in,.lab-arc,.lab-sun,.lab-bar{ animation:none; opacity:1; } }
`;
