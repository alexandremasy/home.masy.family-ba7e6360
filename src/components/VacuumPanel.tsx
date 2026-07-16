import { vacuum } from "@/lib/mock-data";
import { Bot, BatteryCharging, Battery, Home, AlertTriangle, Trash2, CircleDashed, MoveRight, PauseCircle } from "lucide-react";
import { Eyebrow } from "@/components/Eyebrow";

export function VacuumPanel({ compact = false }: { compact?: boolean }) {
  const v = vacuum;
  const cleaning = v.state === "cleaning";
  const returning = v.state === "returning";
  const charging = v.state === "charging" || (v.state === "docked" && v.charging);
  const docked = v.state === "docked";
  const paused = v.state === "paused";
  const error = v.state === "error";

  const status =
    cleaning ? { tone: "bg-primary/15 text-primary", Icon: Bot, text: v.currentRoom ? `Nettoie · ${v.currentRoom}` : "En nettoyage" } :
    returning? { tone: "bg-mustard/25 text-mustard", Icon: MoveRight, text: "Retour à la base" } :
    charging ? { tone: "bg-success/15 text-success", Icon: BatteryCharging, text: "En charge" } :
    paused   ? { tone: "bg-secondary text-muted-foreground", Icon: PauseCircle, text: "En pause" } :
    error    ? { tone: "bg-destructive/15 text-destructive", Icon: AlertTriangle, text: v.errorMsg ?? "Erreur" } :
               { tone: "bg-muted text-muted-foreground", Icon: Home, text: `À la base (${v.dockLocation})` };

  const areaPct = Math.round((v.areaCleanedM2 / v.areaTargetM2) * 100);
  const BatteryIcon = charging ? BatteryCharging : Battery;
  const batLow = v.batteryPct < 25;

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-secondary text-foreground">
          <Bot className={"h-5 w-5 " + (cleaning ? "anim-breathe text-primary" : "")} />
        </span>
        <div className="min-w-0 flex-1">
          <Eyebrow size="xs">Aspirateur</Eyebrow>
          <p className="mt-0.5 truncate font-serif text-lg leading-tight">{v.name}</p>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span className={`inline-flex items-center gap-1 ${batLow ? "text-warm" : ""}`}>
              <BatteryIcon className="h-3 w-3" />{v.batteryPct}%
            </span>
            <span>·</span>
            <span className="truncate">{status.text}</span>
          </div>
          {(cleaning || returning || paused) && (
            <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, areaPct)}%` }} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Eyebrow>{v.name}</Eyebrow>
          <p className="mt-1 font-serif text-xl">{status.text}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {cleaning || returning
              ? `${v.areaCleanedM2} / ${v.areaTargetM2} m² · ~${v.etaMin} min restantes`
              : `Prochain passage · ${v.nextSchedule}`}
          </p>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs uppercase tracking-eyebrow ${status.tone}`}>
          <status.Icon className="h-3.5 w-3.5" />
          {status.text}
        </span>
      </div>

      {(cleaning || returning || paused) && (
        <div className="rounded-xl border border-border/60 bg-secondary/40 p-4">
          <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Progression · {areaPct}%</span>
            <span className="tabular-nums">{v.elapsedMin} min · ~{v.etaMin} min restantes</span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${areaPct}%` }} />
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {v.plan.map((p) => {
              const done = p.status === "done";
              const active = p.status === "active";
              return (
                <span key={p.room} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition-colors ${
                  active ? "bg-foreground text-background" :
                  done   ? "bg-primary/15 text-primary" :
                           "bg-card text-muted-foreground border border-border/60"
                }`}>
                  {done ? "✓" : active ? <span className="relative inline-flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-background/70" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-background" /></span> : <CircleDashed className="h-2.5 w-2.5 opacity-60" />}
                  {p.room}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className={`rounded-xl border p-3 ${batLow ? "border-warm/40 bg-warm/10" : "border-border/60 bg-card"}`}>
          <Eyebrow size="xs" as="div" className="flex items-center gap-1.5">
            <BatteryIcon className="h-3.5 w-3.5" />Batterie
          </Eyebrow>
          <p className={`mt-1 font-serif text-lg ${batLow ? "text-warm" : ""}`}>{v.batteryPct}%</p>
        </div>
        <div className={`rounded-xl border p-3 ${v.binFullPct > 80 ? "border-warm/40 bg-warm/10" : "border-border/60 bg-card"}`}>
          <Eyebrow size="xs" as="div" className="flex items-center gap-1.5">
            <Trash2 className="h-3.5 w-3.5" />Bac
          </Eyebrow>
          <p className="mt-1 font-serif text-lg">{v.binFullPct}% plein</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-3">
          <Eyebrow size="xs">Dernier passage</Eyebrow>
          <p className="mt-1 truncate font-serif text-sm">{v.lastRun.when}</p>
          <p className="text-xs text-muted-foreground">{v.lastRun.areaM2} m² · {v.lastRun.durationMin} min</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-3">
          <Eyebrow size="xs">Prochain</Eyebrow>
          <p className="mt-1 truncate font-serif text-sm">{v.nextSchedule}</p>
        </div>
      </div>
    </div>
  );
}
