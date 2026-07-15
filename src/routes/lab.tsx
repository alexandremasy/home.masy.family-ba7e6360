import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { X } from "lucide-react";
import { meteo, tesla, dishwasher, energie } from "@/lib/mock-data";
import { people } from "@/lib/maison-data";
import { LAB_THEME_CSS, bez, sunProgress } from "@/lib/lab-theme";

// v9 — IDEA 1: "La maison parle."
// No cards. No grid. No icons-in-circles. The screen is a paragraph the house says to you;
// the data is embedded IN the sentence and each datum is the door to its module.
// Adaptive by construction: the sentence recomposes from what's true right now.
export const Route = createFileRoute("/lab")({
  component: LabSpeaks,
  head: () => ({ meta: [{ title: "Épreuve — La maison parle" }] }),
});

type Bit =
  | { t: "text"; v: string }
  | { t: "data"; v: string; module: string; tone?: "hot" | "calm" };

/** What's true right now → what the house says. Reorder/remove and the paragraph still reads. */
function whatTheHouseSays(now: Date): Bit[][] {
  const m = meteo.today;
  const oil = energie.oil;
  const h = now.getHours();
  const bits: Bit[][] = [];

  // The moment — always said, it's the ambience.
  bits.push([
    { t: "text", v: "Il fait " },
    { t: "data", v: `${m.tempC}°`, module: "meteo" },
    { t: "text", v: h < 18 ? " dehors, le jour monte encore." : " dehors, le jour décline." },
  ]);

  // A person, today — the highest thing that can happen in a home.
  const leo = people.find((p) => p.id === "leo");
  if (leo) {
    const dob = new Date(leo.dob);
    if (dob.getDate() === now.getDate() && dob.getMonth() === now.getMonth()) {
      bits.push([
        { t: "data", v: leo.name, module: "maison", tone: "hot" },
        { t: "text", v: ` a ${now.getFullYear() - dob.getFullYear()} ans aujourd'hui — ` },
        { t: "data", v: "un mot lui ferait plaisir", module: "maison", tone: "hot" },
        { t: "text", v: "." },
      ]);
    }
  }

  // Something running out.
  if (oil.autonomyDays < 60) {
    bits.push([
      { t: "text", v: "La cuve tiendra " },
      { t: "data", v: `${oil.autonomyDays} jours`, module: "energie", tone: "hot" },
      { t: "text", v: ", il faudra y penser." },
    ]);
  }

  // Life going on, quietly.
  bits.push([
    { t: "text", v: "Bonobo joue " },
    { t: "data", v: "au salon", module: "maison" },
    { t: "text", v: ", le lave-vaisselle finit " },
    { t: "data", v: "vers 20:30", module: "maison" },
    { t: "text", v: "." },
  ]);

  bits.push([
    { t: "text", v: "Bernard est " },
    { t: "data", v: tesla.location.split(" · ")[1] ?? tesla.location, module: "bernard" },
    { t: "text", v: ", chargé à " },
    { t: "data", v: `${tesla.charge}%`, module: "bernard" },
    { t: "text", v: "." },
  ]);

  // The rest of the house, said in one breath — this is the "regulars" access.
  bits.push([
    { t: "text", v: "Côté sous, il te reste " },
    { t: "data", v: "8 092 €", module: "budget" },
    { t: "text", v: " de marge cette année. Tout est " },
    { t: "data", v: "calme", module: "securite" },
    { t: "text", v: " et " },
    { t: "data", v: "en ligne", module: "reseau" },
    { t: "text", v: "." },
  ]);

  return bits;
}

function LabSpeaks() {
  const now = new Date();
  const h = now.getHours();
  const greeting = h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir";
  const m = meteo.today;
  const [open, setOpen] = useState<string | null>(null);

  const said = whatTheHouseSays(now);
  const t = sunProgress(now, m.sunrise, m.sunset);
  const sunX = bez(t, 14, 160, 306), sunY = bez(t, 96, -34, 96);

  return (
    <div className="lab-root relative min-h-screen w-full overflow-hidden">
      <style>{LAB_THEME_CSS}</style>
      <style>{EXTRA}</style>

      {/* The sun rides across the whole screen — the only "chrome": the day itself */}
      <svg viewBox="0 0 320 108" className="pointer-events-none absolute inset-x-0 top-0 h-[38vh] w-full opacity-70" preserveAspectRatio="none">
        <defs>
          <radialGradient id="sunball" cx="34%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="55%" stopColor="oklch(0.93 0.09 85)" />
            <stop offset="100%" stopColor="oklch(0.74 0.15 52)" />
          </radialGradient>
        </defs>
        <path d="M 14 96 Q 160 -34 306 96" fill="none" stroke="color-mix(in oklab, var(--ink) 12%, transparent)" strokeWidth="0.5" strokeDasharray="2 4" className="lab-arc" />
        <g className="lab-sun"><circle cx={sunX} cy={sunY} r="6" fill="url(#sunball)" /></g>
      </svg>

      <div className={"relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-8 py-24 transition-all duration-500 " +
        (open ? "scale-[0.98] opacity-30 blur-[3px]" : "")}>

        <p className="lab-in text-[13px] text-[color:var(--dim)]" style={{ ["--d" as string]: "0ms" }}>
          {greeting}, Alexandre.
        </p>

        {/* THE PARAGRAPH — this is the whole interface */}
        <div className="mt-6 space-y-1">
          {said.map((line, i) => (
            <p key={i} className="lab-in say" style={{ ["--d" as string]: `${120 + i * 90}ms` }}>
              {line.map((b, j) =>
                b.t === "text" ? (
                  <span key={j}>{b.v}</span>
                ) : (
                  <button key={j} onClick={() => setOpen(b.module)} className={"datum " + (b.tone === "hot" ? "hot" : "")}>
                    {b.v}
                  </button>
                ),
              )}
            </p>
          ))}
        </div>
      </div>

      {open && <Peek name={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

/** Touching a datum opens its module. Stub for now — the point is the paragraph. */
function Peek({ name, onClose }: { name: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center">
      <button aria-label="Fermer" onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-lg" />
      <div className="lab-in surface relative rounded-3xl px-10 py-8 text-center" style={{ ["--d" as string]: "0ms" }}>
        <p className="font-serif text-3xl capitalize text-[color:var(--ink)]">{name}</p>
        <p className="mt-1 text-[13px] text-[color:var(--dim)]">Le module s'ouvre ici.</p>
        <button onClick={onClose} className="orb mx-auto mt-5 h-9 w-9"><X className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

const EXTRA = `
.say {
  font-family: var(--font-serif, Georgia, serif);
  font-size: clamp(1.5rem, 3.4vw, 2.6rem);
  line-height: 1.42;
  letter-spacing: -0.015em;
  color: color-mix(in oklab, var(--ink) 55%, transparent);
}
/* A datum is not a link — it's a word that happens to be alive */
.datum {
  color: var(--ink);
  border-bottom: 2px solid color-mix(in oklab, var(--ink) 18%, transparent);
  padding-bottom: 1px;
  transition: border-color .25s var(--ease), color .25s var(--ease);
}
.datum:hover { border-color: var(--accent-lite); }
.datum.hot { color: var(--hot); border-color: color-mix(in oklab, var(--hot) 35%, transparent); }
.datum.hot:hover { border-color: var(--hot); }
`;
