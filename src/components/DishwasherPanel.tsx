import { dishwasher } from "@/lib/mock-data";
import { Droplet, Zap, AlertTriangle, DoorOpen, CheckCircle2, Pause, Play, CircleDashed } from "lucide-react";
import { Eyebrow } from "@/components/Eyebrow";

const PHASES: { key: string; label: string }[] = [
  { key: "Prélavage", label: "Prélavage" },
  { key: "Lavage",    label: "Lavage" },
  { key: "Rinçage",   label: "Rinçage" },
  { key: "Séchage",   label: "Séchage" },
];

function ProgressRing({ pct, children }: { pct: number; children: React.ReactNode }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);
  return (
    <div className="relative grid h-28 w-28 place-items-center">
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--muted)" strokeWidth="6" />
        <circle
          cx="50" cy="50" r={r} fill="none"
          stroke="var(--primary)" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="text-center">{children}</div>
    </div>
  );
}

export function DishwasherPanel({ compact = false }: { compact?: boolean }) {
  const d = dishwasher;
  const running = d.state === "running";
  const finished = d.state === "finished";
  const idle = d.state === "idle";
  const error = d.state === "error";
  const paused = d.state === "paused";
  const doorOpen = d.state === "door_open";

  const statusPill =
    running ? { tone: "bg-primary/15 text-primary", Icon: Play, text: `${d.remainingMin} min restantes` } :
    paused  ? { tone: "bg-secondary text-muted-foreground", Icon: Pause, text: "En pause" } :
    finished? { tone: "bg-success/15 text-success", Icon: CheckCircle2, text: "Cycle terminé" } :
    error   ? { tone: "bg-destructive/15 text-destructive", Icon: AlertTriangle, text: d.errorMsg ?? "Erreur" } :
    doorOpen? { tone: "bg-warm/15 text-warm", Icon: DoorOpen, text: "Porte ouverte" } :
              { tone: "bg-muted text-muted-foreground", Icon: CircleDashed, text: "Prêt" };

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <ProgressRing pct={running || paused ? d.progressPct : finished ? 100 : 0}>
          {running || paused ? (
            <>
              <p className="font-serif text-xl leading-none">{d.remainingMin}</p>
              <p className="text-3xs uppercase tracking-wider text-muted-foreground">min</p>
            </>
          ) : (
            <statusPill.Icon className="h-5 w-5 opacity-70" />
          )}
        </ProgressRing>
        <div className="min-w-0 flex-1">
          <Eyebrow size="xs">Lave-vaisselle</Eyebrow>
          <p className="mt-0.5 truncate font-serif text-lg leading-tight">{d.program}</p>
          <p className="mt-0.5 text-xs text-muted-foreground truncate">
            {running || paused ? `${d.phase} · fin ${d.endsAt}` : idle ? d.lastRun : statusPill.text}
          </p>
          <span className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-3xs uppercase tracking-wider ${statusPill.tone}`}>
            <statusPill.Icon className="h-3 w-3" />
            {statusPill.text}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Eyebrow>{d.brand}</Eyebrow>
          <p className="mt-1 font-serif text-2xl">{d.program}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">Démarré {d.startedAt} · fin prévue {d.endsAt}</p>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs uppercase tracking-eyebrow ${statusPill.tone}`}>
          <statusPill.Icon className="h-3.5 w-3.5" />
          {statusPill.text}
        </span>
      </div>

      {(running || paused) && (
        <div className="rounded-xl border border-border/60 bg-secondary/40 p-4">
          <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>{d.progressPct}% · {d.phase}</span>
            <span className="tabular-nums">{d.remainingMin} min restantes</span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${d.progressPct}%` }} />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-1.5">
            {PHASES.map((p, i) => {
              const currentIdx = PHASES.findIndex((x) => x.key === d.phase);
              const active = i === currentIdx;
              const done = i < currentIdx;
              return (
                <div key={p.key} className={`rounded-lg px-2 py-1.5 text-center text-3xs uppercase tracking-eyebrow transition-colors ${
                  active ? "bg-foreground text-background" :
                  done   ? "bg-primary/15 text-primary" :
                           "bg-card text-muted-foreground"
                }`}>
                  {p.label}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-xl border border-border/60 bg-card p-3">
          <Eyebrow size="xs" as="div" className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5" />Énergie
          </Eyebrow>
          <p className="mt-1 font-serif text-lg">{d.energyKWh} <span className="text-xs text-muted-foreground">kWh</span></p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-3">
          <Eyebrow size="xs" as="div" className="flex items-center gap-1.5">
            <Droplet className="h-3.5 w-3.5" />Eau
          </Eyebrow>
          <p className="mt-1 font-serif text-lg">{d.waterL} <span className="text-xs text-muted-foreground">L</span></p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-3">
          <Eyebrow size="xs">Cycles</Eyebrow>
          <p className="mt-1 font-serif text-lg">{d.cyclesThisMonth} <span className="text-xs text-muted-foreground">ce mois</span></p>
        </div>
        <div className={`rounded-xl border p-3 ${d.rinseAidLow || d.saltLow ? "border-warm/40 bg-warm/10" : "border-border/60 bg-card"}`}>
          <Eyebrow size="xs">Consommables</Eyebrow>
          <div className="mt-1 flex flex-wrap gap-1 text-xs">
            <span className={d.saltLow ? "text-warm" : "text-muted-foreground"}>Sel {d.saltLow ? "faible" : "OK"}</span>
            <span className="text-muted-foreground">·</span>
            <span className={d.rinseAidLow ? "text-warm" : "text-muted-foreground"}>Rinçage {d.rinseAidLow ? "faible" : "OK"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
