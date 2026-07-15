import { createFileRoute } from "@tanstack/react-router";
import { Home, Zap, ShieldCheck, Wifi, Car, Coins, ArrowUpRight, Cake, Music, Plug, Sparkles } from "lucide-react";
import { CountUp } from "@/components/CountUp";
import { meteo, tesla, dishwasher } from "@/lib/mock-data";
import { people } from "@/lib/maison-data";

// Ambience proof v2 — the arrival screen for the home OS.
// Boussole: "une ambiance de maison chaleureuse et profondément humaine", vivante.
// A permanent living "moment" (weather + sun arc) + a flux of what's happening now;
// the birthday is one card in the flux, not the pillar. Everything enters in a cascade.
export const Route = createFileRoute("/lab")({
  component: LabAmbience,
  head: () => ({ meta: [{ title: "Épreuve d'ambiance — Accueil" }] }),
});

const MODULES = [
  { key: "maison", label: "Maison", icon: Home, hint: "Repas ce soir · courses", accent: "var(--warm)" },
  { key: "energie", label: "Énergie", icon: Zap, hint: "9.3 kWh · mazout 22%", accent: "var(--accent)" },
  { key: "securite", label: "Sécurité", icon: ShieldCheck, hint: "Tout est calme", accent: "var(--success)" },
  { key: "reseau", label: "Réseau", icon: Wifi, hint: "Tout en ligne", accent: "var(--primary)" },
  { key: "bernard", label: "Bernard", icon: Car, hint: "En déplacement · 74%", accent: "var(--primary)" },
  { key: "budget", label: "Budget", icon: Coins, hint: "Marge +8 092 €", accent: "var(--accent)" },
];

const hm = (s: string) => { const [h, m] = s.split(":").map(Number); return h + m / 60; };

// Quadratic bézier point — the sun's position along the day arc.
function bez(t: number, p0: number, p1: number, p2: number) {
  const u = 1 - t;
  return u * u * p0 + 2 * u * t * p1 + t * t * p2;
}

function LabAmbience() {
  const now = new Date();
  const h = now.getHours();
  const greeting = h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir";
  const dateStr = now.toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long" });
  const timeStr = now.toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" });

  const m = meteo.today;
  const leo = people.find((p) => p.id === "leo");

  // Sun progress across the day → position on the arc.
  const dayT = Math.min(1, Math.max(0, (h + now.getMinutes() / 60 - hm(m.sunrise)) / (hm(m.sunset) - hm(m.sunrise))));
  const P0 = [14, 96], P1 = [160, -34], P2 = [306, 96];
  const sunX = bez(dayT, P0[0], P1[0], P2[0]);
  const sunY = bez(dayT, P0[1], P1[1], P2[1]);

  return (
    <div className="lab-root relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      <style>{CSS}</style>

      {/* ---- Living aurora ---- */}
      <div className="pointer-events-none absolute inset-0 bg-mesh-anim opacity-80" />
      <div className="lab-blob pointer-events-none absolute -left-[12%] -top-[16%] h-[70vh] w-[70vh] rounded-full blur-[90px]"
        style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--warm) 55%, transparent), transparent 70%)" }} />
      <div className="lab-blob lab-blob--slow pointer-events-none absolute right-[-8%] top-[6%] h-[58vh] w-[58vh] rounded-full blur-[90px]"
        style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--accent) 55%, transparent), transparent 70%)" }} />

      {/* ---- Content ---- */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-12 sm:py-16">

        {/* Greeting */}
        <div className="lab-in" style={{ ["--d" as string]: "0ms" }}>
          <div className="flex items-center justify-between text-[13px] text-muted-foreground">
            <span className="capitalize">{dateStr}</span>
            <span className="inline-flex items-center gap-1.5"><span className="lab-pulse-dot" /> {timeStr}</span>
          </div>
          <h1 className="mt-8 font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl">{greeting}, Alexandre.</h1>
        </div>

        {/* HERO — the moment: weather + living sun arc */}
        <div className="lab-in mt-7" style={{ ["--d" as string]: "120ms" }}>
          <div className="lab-glass relative overflow-hidden rounded-[28px] p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{m.location} · maintenant</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-serif text-6xl tracking-tight"><CountUp to={m.tempC} />°</span>
                  <span className="text-sm text-muted-foreground">{m.label}</span>
                </div>
                <p className="mt-2 text-[13px] text-muted-foreground">Le jour décline doucement · coucher {m.sunset}</p>
              </div>
            </div>
            {/* Sun arc */}
            <svg viewBox="0 0 320 108" className="mt-4 h-24 w-full overflow-visible">
              <path d="M 14 96 Q 160 -34 306 96" fill="none" stroke="color-mix(in oklab, var(--foreground) 22%, transparent)"
                strokeWidth="1.5" strokeDasharray="3 5" className="lab-arc" />
              <line x1="14" y1="96" x2="306" y2="96" stroke="color-mix(in oklab, var(--foreground) 12%, transparent)" strokeWidth="1" />
              <g className="lab-sun" style={{ transformOrigin: `${sunX}px ${sunY}px` }}>
                <circle cx={sunX} cy={sunY} r="16" fill="color-mix(in oklab, var(--warm) 30%, transparent)" className="lab-sun-glow" />
                <circle cx={sunX} cy={sunY} r="7" fill="var(--warm)" />
              </g>
            </svg>
          </div>
        </div>

        {/* EN CE MOMENT — the living flux */}
        <div className="lab-in mt-8" style={{ ["--d" as string]: "240ms" }}>
          <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">En ce moment</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

            {/* Birthday — now just one card of the flux, tagged today */}
            {leo && (
              <div className="lab-glass flex items-center gap-3.5 rounded-2xl p-4 sm:col-span-2">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-white"
                  style={{ background: "linear-gradient(140deg, var(--warm), var(--accent))" }}><Cake className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-warm">Aujourd'hui</p>
                  <p className="text-sm"><span className="font-medium">Léo a 34 ans.</span> <span className="text-muted-foreground">Un mot lui ferait plaisir.</span></p>
                </div>
                <button className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-[13px] text-background transition-transform hover:scale-[1.03]">
                  Écrire <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Music — living equalizer */}
            <div className="lab-glass flex items-center gap-3 rounded-2xl p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white" style={{ background: "var(--success)" }}>
                <Music className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">Linked · Bonobo</p>
                <p className="text-[11px] text-muted-foreground">Salon · Spotify</p>
              </div>
              <div className="lab-eq" aria-hidden><i /><i /><i /><i /></div>
            </div>

            {/* Bernard */}
            <div className="lab-glass flex items-center gap-3 rounded-2xl p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white" style={{ background: "var(--primary)" }}>
                <Car className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">En déplacement</p>
                <p className="text-[11px] text-muted-foreground">{tesla.location} · {tesla.lastSeen}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[13px] tabular-nums text-muted-foreground"><Plug className="h-3.5 w-3.5" /><CountUp to={tesla.charge} />%</span>
            </div>

            {/* Dishwasher — filling bar */}
            <div className="lab-glass rounded-2xl p-4 sm:col-span-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Lave-vaisselle · {dishwasher.phase}</p>
                <p className="text-[11px] text-muted-foreground">fin ~20:30</p>
              </div>
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-foreground/8">
                <div className="lab-bar h-full rounded-full" style={{ ["--p" as string]: `${dishwasher.progressPct}%`, background: "linear-gradient(90deg, var(--primary), var(--success))" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Module access */}
        <div className="lab-in mt-9" style={{ ["--d" as string]: "380ms" }}>
          <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">La maison</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {MODULES.map((mod) => {
              const Icon = mod.icon;
              return (
                <button key={mod.key} className="lab-glass lab-tile group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white" style={{ background: mod.accent }}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{mod.label}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">{mod.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lab-in mt-auto pt-8" style={{ ["--d" as string]: "480ms" }}>
          <p className="inline-flex items-center gap-2 text-[13px] text-muted-foreground/80">
            <Sparkles className="h-4 w-4" /> PMC à sortir avant 07:00 demain.
          </p>
        </div>
      </div>
    </div>
  );
}

const CSS = `
.lab-root { --ease: cubic-bezier(0.2,0.7,0.2,1); }
/* Warm glass */
.lab-glass {
  background: color-mix(in oklab, var(--card) 55%, transparent);
  border: 1px solid color-mix(in oklab, #fff 55%, transparent);
  backdrop-filter: blur(20px) saturate(1.3);
  box-shadow: 0 20px 60px -28px rgba(70,45,20,0.42), inset 0 1px 0 rgba(255,255,255,0.55);
}
.lab-tile { transition: transform .35s var(--ease), background .35s var(--ease), box-shadow .35s var(--ease); }
.lab-tile:hover { transform: translateY(-3px); box-shadow: 0 24px 50px -22px rgba(70,45,20,0.5); }
/* Cascade entrance */
@keyframes lab-rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
.lab-in { opacity: 0; animation: lab-rise .7s var(--ease) forwards; animation-delay: var(--d, 0ms); }
/* Aurora drift */
@keyframes lab-float { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(4%, 3%) scale(1.08); } }
.lab-blob { opacity: .55; animation: lab-float 16s ease-in-out infinite; }
.lab-blob--slow { animation-duration: 22s; animation-direction: reverse; }
/* Sun arc draw + sun glow */
@keyframes lab-draw { from { stroke-dashoffset: 520; } to { stroke-dashoffset: 0; } }
.lab-arc { stroke-dashoffset: 0; animation: lab-draw 1.6s var(--ease) .4s both; }
@keyframes lab-sun-in { from { opacity: 0; transform: scale(.4); } to { opacity: 1; transform: scale(1); } }
.lab-sun { animation: lab-sun-in .8s var(--ease) 1.1s both; }
@keyframes lab-glow { 0%,100% { opacity: .5; r: 15; } 50% { opacity: .85; r: 19; } }
.lab-sun-glow { animation: lab-glow 3.5s ease-in-out infinite 1.6s; }
/* Live pulse dot */
@keyframes lab-pulse { 0%,100% { opacity: .35; } 50% { opacity: 1; } }
.lab-pulse-dot { width: 6px; height: 6px; border-radius: 999px; background: var(--success); display: inline-block; animation: lab-pulse 2.4s ease-in-out infinite; }
/* Equalizer */
.lab-eq { display: flex; align-items: flex-end; gap: 2.5px; height: 18px; }
.lab-eq i { width: 3px; border-radius: 2px; background: var(--success); height: 40%; animation: lab-bars 1s ease-in-out infinite; }
.lab-eq i:nth-child(2){ animation-delay: .2s; } .lab-eq i:nth-child(3){ animation-delay: .45s; } .lab-eq i:nth-child(4){ animation-delay: .1s; }
@keyframes lab-bars { 0%,100% { height: 25%; } 50% { height: 100%; } }
/* Progress fill */
@keyframes lab-fill { from { width: 0; } to { width: var(--p); } }
.lab-bar { width: var(--p); animation: lab-fill 1.4s var(--ease) .6s both; }
@media (prefers-reduced-motion: reduce) { .lab-in,.lab-arc,.lab-sun,.lab-bar { animation: none; opacity: 1; } }
`;
