import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Home, Car, Wifi, Zap, ShieldCheck, UtensilsCrossed, Coins, ChevronDown,
  ArrowUpRight, Search, SlidersHorizontal, MoreHorizontal,
} from "lucide-react";
import { energie, tesla, dishwasher, rooms } from "@/lib/mock-data";

// /lab — the Novo ref reproduced with the mockup's own data + the mockup's extended navigation.
export const Route = createFileRoute("/lab")({
  component: Lab,
  head: () => ({ meta: [{ title: "Lab — Accueil" }] }),
});

const ROOMS = rooms.map((r) => r.name);
const DOMAINS = [
  { label: "Maison", icon: UtensilsCrossed },
  { label: "Bernard", icon: Car },
  { label: "Réseau", icon: Wifi },
  { label: "Énergie", icon: Zap },
  { label: "Sécurité", icon: ShieldCheck },
  { label: "Budget", icon: Coins },
];

/** Novo's signature control: an arc of ticks with a marker on the value. */
function Gauge({ pct }: { pct: number }) {
  const N = 40, cx = 100, cy = 92, r = 72;
  const ticks = Array.from({ length: N }, (_, i) => {
    const t = i / (N - 1);
    const a = Math.PI - t * Math.PI;
    const on = t <= pct / 100;
    const len = on ? 13 : 9;
    return {
      x1: cx + r * Math.cos(a), y1: cy - r * Math.sin(a),
      x2: cx + (r - len) * Math.cos(a), y2: cy - (r - len) * Math.sin(a),
      on, key: i,
    };
  });
  return (
    <svg viewBox="0 0 200 100" className="w-full overflow-visible">
      {ticks.map((t) => (
        <line key={t.key} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
          strokeWidth={t.on ? 2.6 : 1.4} strokeLinecap="round"
          stroke={t.on ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.18)"} />
      ))}
    </svg>
  );
}

function Lab() {
  const [openRooms, setOpenRooms] = useState(false);
  const oil = energie.oil;
  const el = energie.electricity;

  return (
    <div className="lab relative min-h-screen w-full">
      <style>{CSS}</style>

      {/* ---- Extended navigation — the mockup's own: Pièces ▾ + domains ---- */}
      <header className="nav-bar sticky top-0 z-30">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-3">
          <nav className="flex items-center gap-1 overflow-x-auto">
            <div className="relative shrink-0">
              <button onClick={() => setOpenRooms((v) => !v)} className="pill">
                <Home className="h-3.5 w-3.5" /> Pièces <ChevronDown className="h-3 w-3 opacity-60" />
              </button>
              {openRooms && (
                <div className="menu absolute left-0 top-full z-40 mt-2 min-w-40 p-1.5">
                  {ROOMS.map((r) => (
                    <button key={r} className="menu-item">{r}</button>
                  ))}
                </div>
              )}
            </div>
            {DOMAINS.map((d) => {
              const Icon = d.icon;
              return (
                <button key={d.label} className={"pill shrink-0 " + (d.label === "Énergie" ? "pill-on" : "")}>
                  <Icon className="h-3.5 w-3.5" /> {d.label}
                </button>
              );
            })}
          </nav>
          <button className="orb shrink-0"><MoreHorizontal className="h-4 w-4" /></button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl px-5 pb-16 pt-5">

        {/* ---- Header: small greeting + two orbs (Novo) ---- */}
        <div className="flex items-start justify-between">
          <p className="pt-2 text-[13px] text-[color:var(--dim)]">Bonjour, Alexandre !</p>
          <div className="flex gap-2">
            <button className="orb"><Search className="h-4 w-4" /></button>
            <button className="orb"><SlidersHorizontal className="h-4 w-4" /></button>
          </div>
        </div>

        {/* ---- Editorial title, second line coloured (Novo) ---- */}
        <h1 className="title mt-3">
          Ta maison va bien,<br />
          <em>la cuve demande un œil.</em>
        </h1>

        {/* ---- The bento, Novo's exact composition ---- */}
        <div className="mt-6 grid grid-cols-2 gap-3">

          {/* HERO — light saturated tile: title + ↗, badge, gauge, 3D object */}
          <section className="tile-lite col-span-2 relative overflow-hidden rounded-[26px] p-5">
            <div className="flex items-start justify-between">
              <p className="text-[19px] font-medium text-black">Cuve à mazout</p>
              <span className="arrow-dark"><ArrowUpRight className="h-4 w-4" /></span>
            </div>
            <div className="mt-3 flex justify-center">
              <span className="badge">{oil.tankPct}%</span>
            </div>
            <div className="mx-auto -mt-1 w-[62%]">
              <Gauge pct={oil.tankPct} />
            </div>
            {/* the object */}
            <div className="relative mx-auto -mt-10 h-28 w-40">
              <span className="ball" />
              <span className="ball-label">{oil.tankLiters} L</span>
            </div>
            <p className="mt-1 text-center text-[12px] text-black/50">sur {oil.tankCapacity} L · ~{oil.autonomyDays} jours</p>
          </section>

          {/* LEFT — small metric tile with blurred backdrop (Novo "Weight Score") */}
          <section className="tile-dark relative overflow-hidden rounded-[26px] p-5">
            <span className="haze" />
            <div className="relative flex items-start justify-between">
              <p className="text-[13px] text-[color:var(--dim)]">Élec. / jour</p>
              <span className="arrow-light"><ArrowUpRight className="h-3.5 w-3.5" /></span>
            </div>
            <p className="relative mt-6 text-[40px] font-medium leading-none text-white">{el.dailyKWh}</p>
            <p className="relative mt-1 text-[12px] text-[color:var(--dim)]">kWh · {el.trendPct}% vs 90j</p>
          </section>

          {/* RIGHT — tall saturated tile with object + button (Novo "Wegovy Pen") */}
          <section className="tile-deep relative row-span-2 flex flex-col overflow-hidden rounded-[26px] p-5">
            <div className="flex items-start justify-between">
              <p className="text-[19px] font-medium leading-tight text-white">Bernard</p>
              <span className="arrow-white"><ArrowUpRight className="h-4 w-4" /></span>
            </div>
            <p className="mt-1 text-[12px] text-white/60">{tesla.location}</p>
            <div className="relative my-4 flex-1">
              <span className="pen" />
            </div>
            <div className="relative">
              <p className="text-[34px] font-medium leading-none text-white">{tesla.charge}<span className="text-lg text-white/60">%</span></p>
              <p className="mt-1 text-[12px] text-white/60">{tesla.rangeKm} km · limite {tesla.chargeLimit}%</p>
              <button className="btn-ghost mt-4 w-full">Voir Bernard</button>
            </div>
          </section>

          {/* LEFT bottom — dark tile with status badge + object (Novo "Your Supplements") */}
          <section className="tile-dark relative overflow-hidden rounded-[26px] p-5">
            <div className="flex items-start justify-between">
              <span className="chip"><span className="dot" /> {dishwasher.phase}</span>
              <span className="arrow-light"><ArrowUpRight className="h-3.5 w-3.5" /></span>
            </div>
            <div className="relative mx-auto my-3 h-16 w-16">
              <span className="puck" />
            </div>
            <p className="text-[15px] text-white">Lave-vaisselle</p>
            <p className="mt-0.5 text-[12px] text-[color:var(--dim)]">fin ~{dishwasher.endsAt}</p>
          </section>
        </div>
      </div>
    </div>
  );
}

const CSS = `
.lab {
  --bg: oklch(0.155 0.022 32);
  --panel: oklch(0.21 0.022 34);
  --dim: oklch(0.66 0.02 60);
  --lite: oklch(0.84 0.115 72);
  --deep: oklch(0.62 0.16 34);
  background: radial-gradient(120% 90% at 50% 0%, oklch(0.20 0.03 34), var(--bg) 70%);
  color: #fff;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
}
/* Nav */
.nav-bar { background: color-mix(in oklab, var(--bg) 82%, transparent); backdrop-filter: blur(18px); border-bottom: 1px solid rgba(255,255,255,0.07); }
.pill { display:inline-flex; align-items:center; gap:6px; border-radius:999px; padding:7px 12px; font-size:13px;
  color: var(--dim); background: rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.07); white-space:nowrap;
  transition: background .2s, color .2s; }
.pill:hover { background: rgba(255,255,255,0.1); color:#fff; }
.pill-on { background: var(--lite); color:#000; border-color: transparent; }
.menu { background: var(--panel); border:1px solid rgba(255,255,255,0.1); border-radius:16px; box-shadow: 0 24px 60px -20px rgba(0,0,0,.8); }
.menu-item { display:block; width:100%; text-align:left; padding:7px 10px; border-radius:10px; font-size:13px; color: var(--dim); }
.menu-item:hover { background: rgba(255,255,255,0.07); color:#fff; }
.orb { display:grid; place-items:center; width:38px; height:38px; border-radius:999px; color:var(--dim);
  background: rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); }
/* Title */
.title { font-size: clamp(1.9rem, 4.6vw, 2.7rem); line-height:1.12; letter-spacing:-0.02em; font-weight:500; color:#fff; }
.title em { font-style: italic; color: var(--lite); }
/* Tiles */
.tile-lite { background: var(--lite); }
.tile-deep { background: var(--deep); }
.tile-dark { background: var(--panel); border:1px solid rgba(255,255,255,0.06); }
.arrow-dark { display:grid; place-items:center; width:34px; height:34px; border-radius:999px; background: rgba(0,0,0,0.14); color:#000; }
.arrow-white { display:grid; place-items:center; width:34px; height:34px; border-radius:999px; background: rgba(255,255,255,0.2); color:#fff; }
.arrow-light { display:grid; place-items:center; width:28px; height:28px; border-radius:999px; border:1px solid rgba(255,255,255,0.16); color: var(--dim); }
.badge { display:inline-block; border-radius:999px; padding:4px 12px; font-size:12px; font-weight:500;
  background: oklch(0.82 0.14 62); color:#000; }
.chip { display:inline-flex; align-items:center; gap:6px; border-radius:999px; padding:4px 10px; font-size:11px;
  background: rgba(255,255,255,0.07); color: var(--dim); }
.dot { width:6px; height:6px; border-radius:999px; background: var(--deep); }
.btn-ghost { border-radius:999px; padding:9px 0; font-size:13px; color:#fff;
  background: rgba(255,255,255,0.14); border:1px solid rgba(255,255,255,0.18); transition: background .2s; }
.btn-ghost:hover { background: rgba(255,255,255,0.24); }
/* Objects (stand-ins for Novo's 3D renders) */
.ball { position:absolute; left:50%; top:0; transform:translateX(-50%); width:92px; height:92px; border-radius:999px;
  background: radial-gradient(circle at 34% 28%, #fff, oklch(0.9 0.03 80) 42%, oklch(0.62 0.07 60) 100%);
  box-shadow: 0 18px 30px -10px rgba(0,0,0,.35); }
.ball-label { position:absolute; left:50%; top:44px; transform:translateX(-50%); font-size:12px; color: rgba(0,0,0,.45); letter-spacing:.08em; }
.pen { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%) rotate(24deg); width:34px; height:120px; border-radius:18px;
  background: linear-gradient(100deg, #fff, oklch(0.88 0.02 60) 60%, oklch(0.7 0.04 50));
  box-shadow: 0 22px 34px -12px rgba(0,0,0,.45); }
.pen::after { content:""; position:absolute; left:6px; right:6px; bottom:22px; height:16px; border-radius:4px; background: oklch(0.62 0.16 34 / .35); }
.puck { position:absolute; inset:0; border-radius:999px;
  background: radial-gradient(circle at 34% 28%, #fff, oklch(0.86 0.02 70) 46%, oklch(0.55 0.03 50) 100%);
  box-shadow: 0 12px 22px -8px rgba(0,0,0,.6); }
.haze { position:absolute; right:-20%; bottom:-40%; width:110%; height:110%; border-radius:999px; filter: blur(26px);
  background: radial-gradient(circle, oklch(0.62 0.16 34 / .5), transparent 65%); }
`;
