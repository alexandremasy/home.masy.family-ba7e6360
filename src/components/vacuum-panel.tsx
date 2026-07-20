import { vacuum } from "@/lib/mock-data";
import {
  Bot,
  BatteryCharging,
  Battery,
  Home,
  AlertTriangle,
  Trash2,
  MoveRight,
  PauseCircle,
} from "lucide-react";
import { Eyebrow } from "@/components/eyebrow";

export function VacuumPanel({ compact = false }: { compact?: boolean }) {
  const v = vacuum;
  const cleaning = v.state === "cleaning";
  const returning = v.state === "returning";
  const charging = v.state === "charging" || (v.state === "docked" && v.charging);
  const docked = v.state === "docked";
  const paused = v.state === "paused";
  const error = v.state === "error";

  const status = cleaning
    ? {
        tone: "bg-primary/15 text-primary",
        Icon: Bot,
        text: v.currentRoom ? `Nettoie · ${v.currentRoom}` : "En nettoyage",
      }
    : returning
      ? { tone: "bg-mustard/25 text-mustard", Icon: MoveRight, text: "Retour à la base" }
      : charging
        ? { tone: "bg-success/15 text-success", Icon: BatteryCharging, text: "En charge" }
        : paused
          ? { tone: "bg-secondary text-muted-foreground", Icon: PauseCircle, text: "En pause" }
          : error
            ? {
                tone: "bg-destructive/15 text-destructive",
                Icon: AlertTriangle,
                text: v.errorMsg ?? "Erreur",
              }
            : {
                tone: "bg-muted text-muted-foreground",
                Icon: Home,
                text: `À la base (${v.dockLocation})`,
              };

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
              <BatteryIcon className="h-3 w-3" />
              {v.batteryPct}%
            </span>
            <span>·</span>
            <span className="truncate">{status.text}</span>
          </div>
          {(cleaning || returning || paused) && (
            <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(100, areaPct)}%` }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {!(cleaning || returning || paused) && (
        <p className="font-serif text-base font-semibold">{status.text}</p>
      )}

      {(cleaning || returning || paused) && (
        <div className="rounded-xl border border-border/60 bg-secondary/40 p-4">
          <p className="mb-3 font-serif text-base font-semibold">{status.text}</p>
          <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Progression · {areaPct}%</span>
            <span className="tabular-nums">
              {v.elapsedMin} min · ~{v.etaMin} min restantes
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${areaPct}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div
          className={`rounded-lg border p-3 ${batLow ? "border-warm/40 bg-warm/10" : "border-border/60 bg-secondary/40"}`}
        >
          <Eyebrow size="xs" as="div" className="flex items-center gap-1.5">
            <BatteryIcon className="h-3.5 w-3.5" />
            Batterie
          </Eyebrow>
          <p className={`mt-1 font-serif text-base ${batLow ? "text-warm" : ""}`}>
            {v.batteryPct}%
          </p>
        </div>
        <div
          className={`rounded-lg border p-3 ${v.binFullPct > 80 ? "border-warm/40 bg-warm/10" : "border-border/60 bg-secondary/40"}`}
        >
          <Eyebrow size="xs" as="div" className="flex items-center gap-1.5">
            <Trash2 className="h-3.5 w-3.5" />
            Bac
          </Eyebrow>
          <p className="mt-1 font-serif text-base">{v.binFullPct}% plein</p>
        </div>
      </div>
    </div>
  );
}
