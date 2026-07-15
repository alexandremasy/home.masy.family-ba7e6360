import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Home, Zap, ShieldCheck, Wifi, Car, Coins, ArrowUpRight, Cake, Music, Flame, Droplet, X, TrendingDown, Minus } from "lucide-react";
import { CountUp } from "@/components/CountUp";
import { meteo, tesla, dishwasher, energie, reseau } from "@/lib/mock-data";
import { people } from "@/lib/maison-data";
import { LAB_THEME_CSS, bez, sunProgress } from "@/lib/lab-theme";

// Ambience proof v8 — the two goals, nothing else:
//   1. Voir ce qui est nécessaire        → NEEDED: computed by relevance, not hardcoded.
//   2. Accès rapide data-oriented        → REGULARS: each module shows ITS data; the data is the door.
// No launcher, no icon dock (a picto tells you nothing — that's a menu in disguise).
export const Route = createFileRoute("/lab")({
  component: LabAmbience,
  head: () => ({ meta: [{ title: "Épreuve — Accueil" }] }),
});

/* ---------- 1. NEEDED — the screen is COMPUTED, this is what makes it adaptive.
   Every signal in the house scores itself. Above the bar it surfaces; below, it stays quiet.
   Another day the birthday is gone, the tank is full, and the screen is simply calm. ---------- */
type Signal = {
  id: string;
  score: number;              // 0..100 relevance right now
  kind: "person" | "alert" | "moment";
  title: string;
  detail: string;
  action?: string;
  module: string;
};

function computeNeeded(now: Date): Signal[] {
  const out: Signal[] = [];
  const oil = energie.oil;

  // A person, today. Peaks on the day, worthless the day after.
  const leo = people.find((p) => p.id === "leo");
  if (leo) {
    const dob = new Date(leo.dob);
    const isToday = dob.getDate() === now.getDate() && dob.getMonth() === now.getMonth();
    if (isToday) out.push({
      id: "leo", score: 95, kind: "person", module: "maison",
      title: `${leo.name} a ${now.getFullYear() - dob.getFullYear()} ans`,
      detail: "À Amsterdam · un mot lui ferait plaisir", action: "Écrire",
    });
  }
  // A tank running out: the fewer days left, the louder.
  if (oil.autonomyDays < 60) out.push({
    id: "oil", score: Math.round(100 - oil.autonomyDays), kind: "alert", module: "energie",
    title: `La cuve tiendra ${oil.autonomyDays} jours`,
    detail: `${oil.tankPct}% · ${oil.tankLiters} L · un plein approche`, action: "Commander",
  });

  return out.filter((s) => s.score >= 40).sort((a, b) => b.score - a.score);
}

/* ---------- 2. REGULARS — the data IS the door. No picto-only entries. ---------- */
function regulars() {
  return [
    { key: "budget", label: "Budget", icon: Coins, value: "+8 092 €", detail: "de marge cette année", tone: "calm" },
    { key: "securite", label: "Sécurité", icon: ShieldCheck, value: "Tout calme", detail: "depuis 3 jours", tone: "calm" },
    { key: "bernard", label: "Bernard", icon: Car, value: `${tesla.charge}%`, detail: tesla.location, tone: "calm" },
    { key: "energie", label: "Énergie", icon: Zap, value: `${energie.electricity.dailyKWh} kWh/j`, detail: `${energie.electricity.trendPct}% vs 90j`, tone: "calm" },
    { key: "maison", label: "Maison", icon: Home, value: "Poulet curry", detail: "au menu ce soir", tone: "calm" },
    { key: "reseau", label: "Réseau", icon: Wifi, value: `${reseau?.wifiClients ?? 20} clients`, detail: "tout en ligne", tone: "calm" },
  ];
}

function LabAmbience() {
  const now = new Date();
  const h = now.getHours();
  const greeting = h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir";
  const timeStr = now.toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" });
  const m = meteo.today;
  const [openModule, setOpenModule] = useState<string | null>(null);

  const needed = computeNeeded(now);
  const t = sunProgress(now, m.sunrise, m.sunset);
  const sunX = bez(t, 14, 160, 306), sunY = bez(t, 96, -34, 96);

  return (
    <div className="lab-root relative min-h-screen w-full overflow-hidden">
      <style>{LAB_THEME_CSS}</style>

      <div className={"relative z-10 mx-auto w-full max-w-2xl px-6 pb-16 pt-[18vh] transition-all duration-500 " +
        (openModule ? "scale-[0.97] opacity-40 blur-[2px]" : "")}>

        {/* Greeting — states what the screen decided */}
        <div className="lab-in" style={{ ["--d" as string]: "0ms" }}>
          <p className="text-[13px] text-[color:var(--dim)]">{greeting}, Alexandre · {timeStr} · {m.tempC}° {m.label}</p>
          <h1 className="mt-2 font-serif text-[2.1rem] leading-[1.06] tracking-tight text-[color:var(--ink)] sm:text-5xl">
            {needed.length
              ? <>La maison veille,<br /><span className="italic text-[color:var(--hot)]">{needed.length === 1 ? "une chose t'attend." : `${needed.length} choses t'attendent.`}</span></>
              : <>La maison veille,<br /><span className="italic text-[color:var(--hot)]">tout est paisible.</span></>}
          </h1>
        </div>

        {/* ---- 1. NÉCESSAIRE — only what scored above the bar ---- */}
        {needed.length > 0 && (
          <div className="lab-in mt-8 space-y-3" style={{ ["--d" as string]: "120ms" }}>
            {needed.map((s, i) => (
              <button key={s.id} onClick={() => setOpenModule(s.module)}
                className={(i === 0 ? "tile-accent" : "surface") + " group relative w-full overflow-hidden rounded-3xl p-5 text-left"}>
                {i === 0 && <span className="volume" aria-hidden style={{ right: "-6%", bottom: "-40%", width: "34%", aspectRatio: "1", opacity: 0.3 }} />}
                <div className="relative flex items-start gap-4">
                  <span className={"grid h-11 w-11 shrink-0 place-items-center rounded-full " + (i === 0 ? "bg-black/15 text-black" : "bg-[color:var(--chip)] text-[color:var(--hot)]")}>
                    {s.kind === "person" ? <Cake className="h-5 w-5" /> : <Flame className="h-5 w-5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={"font-serif text-2xl leading-tight " + (i === 0 ? "text-black" : "text-[color:var(--ink)]")}>{s.title}</p>
                    <p className={"mt-1 text-[13px] " + (i === 0 ? "text-black/55" : "text-[color:var(--dim)]")}>{s.detail}</p>
                  </div>
                  {s.action && (
                    <span className={"shrink-0 rounded-full px-4 py-2 text-[13px] font-medium " + (i === 0 ? "bg-black text-[color:var(--accent-lite)]" : "bg-[color:var(--accent-lite)] text-black")}>
                      {s.action}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ---- The moment — always there, it IS the ambience ---- */}
        <div className="lab-in mt-3" style={{ ["--d" as string]: "200ms" }}>
          <div className="surface relative overflow-hidden rounded-3xl px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="shrink-0">
                <p className="font-serif text-3xl tracking-tight text-[color:var(--ink)]"><CountUp to={m.tempC} />°</p>
                <p className="text-[11px] text-[color:var(--dim)]">{m.location} · coucher {m.sunset}</p>
              </div>
              <svg viewBox="0 0 320 108" className="h-14 flex-1 overflow-visible">
                <defs>
                  <radialGradient id="sunball" cx="34%" cy="28%" r="72%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="55%" stopColor="oklch(0.93 0.09 85)" />
                    <stop offset="100%" stopColor="oklch(0.74 0.15 52)" />
                  </radialGradient>
                </defs>
                <path d="M 14 96 Q 160 -34 306 96" fill="none" stroke="color-mix(in oklab, var(--ink) 20%, transparent)" strokeWidth="1.5" strokeDasharray="3 5" className="lab-arc" />
                <g className="lab-sun">
                  <circle cx={sunX} cy={sunY} r="10" fill="url(#sunball)" />
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* ---- 2. TES RÉGULIERS — the data is the door ---- */}
        <div className="lab-in mt-8" style={{ ["--d" as string]: "300ms" }}>
          <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-[color:var(--dim)]">Tes réguliers</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {regulars().map((r) => {
              const Icon = r.icon;
              return (
                <button key={r.key} onClick={() => setOpenModule(r.key)}
                  className="surface group flex flex-col rounded-3xl p-4 text-left transition-transform hover:-translate-y-0.5">
                  <div className="flex items-start justify-between">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--chip)] text-[color:var(--hot)]"><Icon className="h-3.5 w-3.5" /></span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-[color:var(--dim)] opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  {/* the DATA, not the label, is the headline */}
                  <p className="mt-4 font-serif text-xl leading-tight tracking-tight text-[color:var(--ink)]">{r.value}</p>
                  <p className="mt-0.5 truncate text-[11px] text-[color:var(--dim)]">{r.detail}</p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-[color:var(--dim)]/60">{r.label}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {openModule === "energie" && <EnergieModule onClose={() => setOpenModule(null)} />}
      {openModule && openModule !== "energie" && <StubModule name={openModule} onClose={() => setOpenModule(null)} />}
    </div>
  );
}

function StubModule({ name, onClose }: { name: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center">
      <button aria-label="Fermer" onClick={onClose} className="fixed inset-0 bg-black/45 backdrop-blur-md" />
      <div className="lab-in surface relative rounded-3xl px-8 py-6 text-center" style={{ ["--d" as string]: "0ms" }}>
        <p className="font-serif text-2xl capitalize text-[color:var(--ink)]">{name}</p>
        <p className="mt-1 text-[13px] text-[color:var(--dim)]">Module à construire.</p>
        <button onClick={onClose} className="orb mx-auto mt-4 h-9 w-9"><X className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

/* ---------- Module: Énergie — the density test (unchanged) ---------- */
function EnergieModule({ onClose }: { onClose: () => void }) {
  const oil = energie.oil, el = energie.electricity, water = energie.water;
  const hist = energie.history;
  const max = Math.max(...hist.map((x) => x.mazout));

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto">
      <button aria-label="Fermer" onClick={onClose} className="fixed inset-0 bg-black/45 backdrop-blur-md" />
      <div className="lab-in relative mx-auto w-full max-w-2xl px-6 pb-20 pt-16" style={{ ["--d" as string]: "0ms" }}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--dim)]">Module</p>
            <h2 className="font-serif text-4xl tracking-tight text-[color:var(--ink)]">Énergie</h2>
          </div>
          <button onClick={onClose} className="orb h-10 w-10"><X className="h-4 w-4" /></button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="tile-accent col-span-2 relative overflow-hidden rounded-[30px] p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-black/50">Cuve à mazout</p>
                <p className="mt-1 font-serif text-5xl tracking-tight text-black">{oil.tankLiters} <span className="text-2xl text-black/50">L</span></p>
                <p className="mt-1 text-[13px] text-black/55">sur {oil.tankCapacity} L · ~{oil.autonomyDays} jours</p>
              </div>
              <div className="w-40 shrink-0"><GaugeOnAccent pct={oil.tankPct} /></div>
            </div>
          </div>

          <div className="surface rounded-3xl p-4">
            <div className="flex items-start justify-between">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[color:var(--chip)] text-[color:var(--hot)]"><Zap className="h-4 w-4" /></span>
              <span className="inline-flex items-center gap-1 text-[11px] text-[color:var(--dim)]"><TrendingDown className="h-3 w-3" />{el.trendPct}%</span>
            </div>
            <p className="mt-4 font-serif text-3xl tracking-tight text-[color:var(--ink)]"><CountUp to={el.dailyKWh} decimals={1} /> <span className="text-base text-[color:var(--dim)]">kWh/j</span></p>
            <p className="mt-0.5 text-[11px] text-[color:var(--dim)]">Jour {el.dayTotal} · Nuit {el.nightTotal}</p>
          </div>

          <div className="surface rounded-3xl p-4">
            <div className="flex items-start justify-between">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[color:var(--chip)] text-[color:var(--hot)]"><Droplet className="h-4 w-4" /></span>
              <span className="inline-flex items-center gap-1 text-[11px] text-[color:var(--dim)]"><Minus className="h-3 w-3" />{water.trendPct}%</span>
            </div>
            <p className="mt-4 font-serif text-3xl tracking-tight text-[color:var(--ink)]"><CountUp to={water.dailyM3} decimals={2} /> <span className="text-base text-[color:var(--dim)]">m³/j</span></p>
            <p className="mt-0.5 text-[11px] text-[color:var(--dim)]">{water.dailyL} L par jour</p>
          </div>

          <div className="surface col-span-2 rounded-3xl p-5">
            <div className="flex items-baseline justify-between">
              <p className="text-[13px] font-medium text-[color:var(--ink)]">Mazout consommé</p>
              <p className="text-[11px] text-[color:var(--dim)]">13 mois · L</p>
            </div>
            <div className="mt-4 flex h-24 items-end gap-1.5">
              {hist.map((x, i) => {
                const hpc = (x.mazout / max) * 100;
                const last = i === hist.length - 1;
                return (
                  <div key={i} className="flex h-full flex-1 flex-col items-center gap-1.5">
                    <div className="flex w-full flex-1 items-end">
                      <div className="w-full rounded-t-[4px]" style={{ height: `${hpc}%`, background: last ? "var(--accent-deep)" : "color-mix(in oklab, var(--ink) 16%, transparent)" }} />
                    </div>
                    <span className={"text-[9px] " + (last ? "text-[color:var(--accent-deep)]" : "text-[color:var(--dim)]")}>{x.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GaugeOnAccent({ pct }: { pct: number }) {
  const N = 34, cx = 100, cy = 96, r = 74;
  const ticks = Array.from({ length: N }, (_, i) => {
    const t = i / (N - 1);
    const a = Math.PI - t * Math.PI;
    const on = t <= pct / 100;
    const len = on ? 12 : 8;
    return { x1: cx + r * Math.cos(a), y1: cy - r * Math.sin(a), x2: cx + (r - len) * Math.cos(a), y2: cy - (r - len) * Math.sin(a), on, key: i };
  });
  return (
    <svg viewBox="0 0 200 108" className="w-full overflow-visible">
      {ticks.map((t) => (
        <line key={t.key} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} strokeWidth={t.on ? 2.4 : 1.4} strokeLinecap="round" stroke={t.on ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.22)"} />
      ))}
      <text x={cx} y={cy - 24} textAnchor="middle" className="font-serif" fontSize="34" fill="#000">{pct}%</text>
    </svg>
  );
}
