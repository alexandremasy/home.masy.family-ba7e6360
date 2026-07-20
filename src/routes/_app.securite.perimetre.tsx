import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Section } from "@/components/card";
import { perimeter, locks, cameras } from "@/lib/mock-data";
import {
  ShieldCheck,
  ShieldAlert,
  DoorOpen,
  DoorClosed,
  Lock,
  LockOpen,
  Warehouse,
  Moon,
  Bell,
  Camera as CamIcon,
  Eye,
  ChevronRight,
} from "lucide-react";
import { Eyebrow } from "@/components/eyebrow";

// Tab 2 — Périmètre: the physical shell (openings, locks) and the eyes on it (cameras).
export const Route = createFileRoute("/_app/securite/perimetre")({
  component: PerimetreTab,
});

function PerimetreTab() {
  const openPoints = perimeter.filter((p) => p.state !== "secure");
  const perimeterSecure = openPoints.length === 0;
  const installedCams = cameras.filter((c) => c.installed);

  return (
    <div className="space-y-6">
      <Section
        title="Périmètre"
        action={
          <span
            className={`inline-flex items-center gap-1.5 text-sm ${perimeterSecure ? "text-success" : "text-warm"}`}
          >
            {perimeterSecure ? (
              <ShieldCheck className="h-4 w-4" />
            ) : (
              <ShieldAlert className="h-4 w-4" />
            )}
            {perimeterSecure
              ? "Périmètre sécurisé"
              : `${openPoints.length} point${openPoints.length > 1 ? "s" : ""} ouvert${openPoints.length > 1 ? "s" : ""}`}
          </span>
        }
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {perimeter.map((p) => {
            const Icon =
              p.type === "garage" ? Warehouse : p.state === "open" ? DoorOpen : DoorClosed;
            const secure = p.state === "secure";
            return (
              <div
                key={p.name}
                className={`flex items-center gap-3 rounded-xl border p-3 ${
                  secure ? "border-border/60 bg-card" : "border-warm/40 bg-warm/10"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${secure ? "text-muted-foreground" : "text-warm"}`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{p.name}</p>
                  <Eyebrow size="xs">{p.zone}</Eyebrow>
                </div>
                <span className={`shrink-0 text-xs ${secure ? "text-success" : "text-warm"}`}>
                  {p.state === "secure" ? "Fermé" : p.state === "open" ? "Ouvert" : "Déverrouillé"}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-4">
          <Eyebrow className="mb-2">Serrures</Eyebrow>
          <div className="grid gap-2 sm:grid-cols-3">
            {locks.map((l) => (
              <LockRow key={l.name} name={l.name} initial={l.locked} />
            ))}
          </div>
        </div>
      </Section>

      <Section
        title="Caméras"
        action={
          <span className="text-sm text-muted-foreground">{installedCams.length} en ligne</span>
        }
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {installedCams.map((c) => {
            const offline = c.state === "offline";
            return (
              <div
                key={c.id}
                className="group rounded-xl border border-border/60 bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-soft"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <CamIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <p className="truncate text-sm">{c.name}</p>
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${offline ? "bg-destructive" : "bg-success"}`}
                    />
                  </div>
                  {c.night && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-secondary px-1.5 py-0.5 text-2xs uppercase tracking-wider text-muted-foreground">
                      <Moon className="h-2.5 w-2.5" />
                      IR
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{c.location}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {offline
                      ? "Hors-ligne"
                      : c.lastMotion
                        ? `Mvt · ${c.lastMotion}`
                        : "Rien à signaler"}
                  </span>
                  <button className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                    <Eye className="h-3.5 w-3.5" />
                    Voir le flux
                    <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            );
          })}

          <div className="flex items-center gap-3 rounded-xl border border-dashed border-border/60 bg-secondary/30 p-3">
            <Bell className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">Sonnette vidéo</p>
              <p className="text-xs text-muted-foreground">Entrée principale</p>
            </div>
            <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-2xs uppercase tracking-wider text-muted-foreground">
              À venir
            </span>
          </div>
        </div>
      </Section>
    </div>
  );
}

function LockRow({ name, initial }: { name: string; initial: boolean }) {
  const [locked, setLocked] = useState(initial);
  return (
    <button
      onClick={() => setLocked((v) => !v)}
      className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-soft ${
        locked ? "border-border/60 bg-card" : "border-warm/40 bg-warm/10"
      }`}
    >
      {locked ? (
        <Lock className="h-4 w-4 shrink-0 text-success" />
      ) : (
        <LockOpen className="h-4 w-4 shrink-0 text-warm" />
      )}
      <span className="min-w-0 flex-1 truncate text-sm">{name}</span>
      <span className={`shrink-0 text-xs ${locked ? "text-success" : "text-warm"}`}>
        {locked ? "Verrouillée" : "Ouverte"}
      </span>
    </button>
  );
}
