import { createFileRoute } from "@tanstack/react-router";
import { Home, Zap, ShieldCheck, Wifi, Car, Coins, ArrowUpRight, Sparkles, Recycle } from "lucide-react";
import { meteo } from "@/lib/mock-data";
import { people } from "@/lib/maison-data";

// Ambience proof — the arrival screen for the home OS.
// Boussole: "une ambiance de maison chaleureuse et profondément humaine."
// The screen speaks first of the people in the home, then of the house.
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

function LabAmbience() {
  const now = new Date();
  const h = now.getHours();
  const greeting = h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir";
  const dateStr = now.toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long" });

  const leo = people.find((p) => p.id === "leo");
  const m = meteo.today;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      {/* ---- Living aurora — intelligence in the background, warmed ---- */}
      <div className="pointer-events-none absolute inset-0 bg-mesh-anim opacity-80" />
      <div
        className="pointer-events-none absolute -left-[10%] -top-[15%] h-[70vh] w-[70vh] rounded-full blur-[90px] opacity-60"
        style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--warm) 55%, transparent), transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute right-[-8%] top-[10%] h-[55vh] w-[55vh] rounded-full blur-[90px] opacity-50"
        style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--accent) 55%, transparent), transparent 70%)" }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background/70 to-transparent" />

      {/* ---- Content ---- */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-14 sm:py-20">
        {/* Top line — date · weather, whisper-quiet */}
        <div className="flex items-center justify-between text-[13px] text-muted-foreground">
          <span className="capitalize">{dateStr}</span>
          <span className="inline-flex items-center gap-2">
            <span className="tabular-nums">{m.tempC}°</span>
            <span>{m.label}</span>
            <span className="text-muted-foreground/60">· {m.location}</span>
          </span>
        </div>

        {/* Greeting — the welcome */}
        <div className="mt-14 sm:mt-20">
          <h1 className="font-serif text-4xl leading-tight tracking-tight sm:text-6xl">
            {greeting}, Alexandre.
          </h1>
          <p className="mt-3 max-w-md text-base text-muted-foreground">
            La maison est calme. Une chose mérite ton attention aujourd'hui.
          </p>
        </div>

        {/* The card that matters — a person, not a sensor */}
        {leo && (
          <div className="mt-10 overflow-hidden rounded-[28px] border border-white/50 bg-white/45 p-6 shadow-[0_20px_60px_-24px_rgba(60,40,20,0.35)] backdrop-blur-2xl sm:p-8">
            <div className="flex items-start gap-5">
              <div
                className="grid h-16 w-16 shrink-0 place-items-center rounded-full font-serif text-2xl text-white shadow-inner"
                style={{ background: "linear-gradient(140deg, var(--warm), var(--accent))" }}
              >
                {leo.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-warm">
                  <Sparkles className="h-3.5 w-3.5" /> Aujourd'hui dans la famille
                </p>
                <h2 className="mt-1.5 font-serif text-2xl tracking-tight sm:text-3xl">
                  {leo.name} a 34 ans
                </h2>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-foreground/70">
                  À Amsterdam, il apprend la guitare en ce moment — et râle contre son voisin
                  techno. Un mot lui ferait plaisir.
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-2.5">
                  <button className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm text-background transition-transform hover:scale-[1.02]">
                    Lui écrire un mot <ArrowUpRight className="h-4 w-4" />
                  </button>
                  <button className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/40 px-4 py-2 text-sm text-foreground/80 backdrop-blur-md transition-colors hover:bg-white/60">
                    L'appeler
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Living access to the modules — glass, calm */}
        <div className="mt-12">
          <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">La maison</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {MODULES.map((mod) => {
              const Icon = mod.icon;
              return (
                <button
                  key={mod.key}
                  className="group flex items-center gap-3 rounded-2xl border border-white/40 bg-white/35 px-4 py-3.5 text-left backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-white/55 hover:shadow-[0_16px_40px_-20px_rgba(60,40,20,0.4)]"
                >
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white"
                    style={{ background: mod.accent }}
                  >
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

        {/* Practical whisper — low, non-invasive */}
        <div className="mt-auto pt-10">
          <p className="inline-flex items-center gap-2 text-[13px] text-muted-foreground/80">
            <Recycle className="h-4 w-4" /> PMC à sortir avant 07:00 demain.
          </p>
        </div>
      </div>
    </div>
  );
}
