import { createFileRoute, Link } from "@tanstack/react-router";
import { Section } from "@/components/Card";
import { CameraFeed } from "@/components/CameraFeed";
import { cameras, motionEvents, type MotionEvent } from "@/lib/mock-data";
import { Camera as CamIcon, ShieldCheck, Bell, Package, User, Car, Cat, Activity, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_app/securite")({
  component: SecuritePage,
  head: () => ({
    meta: [
      { title: "Sécurité — Maison" },
      { name: "description", content: "Vue d'ensemble des caméras intérieures et extérieures, sonnette et évènements de mouvement." },
    ],
  }),
});

function eventIcon(kind: MotionEvent["kind"]) {
  switch (kind) {
    case "person":   return User;
    case "vehicle":  return Car;
    case "animal":   return Cat;
    case "package":  return Package;
    default:         return Activity;
  }
}

function SecuritePage() {
  const installed = cameras.filter((c) => c.installed);
  const doorbell = cameras.find((c) => c.kind === "doorbell");
  const outdoor  = installed.filter((c) => c.kind === "outdoor");
  const indoor   = installed.filter((c) => c.kind === "indoor");

  const anyMotion = installed.some((c) => c.motion);
  const anyOffline = installed.some((c) => c.state === "offline");
  const batteryLow = installed.filter((c) => !c.wired && (c.batteryPct ?? 100) < 30);

  return (
    <div className="space-y-6">
      <div className="page-header sticky top-0 z-20 -mx-5 -mt-7 px-5 pt-7 pb-4 sm:-mx-8 sm:-mt-10 sm:px-8 sm:pt-10">
        <div className="page-header__bg pointer-events-none absolute inset-0 bg-background/85 backdrop-blur-xl" />
        <div className="page-header__fade pointer-events-none absolute inset-x-0 top-full h-8 bg-gradient-to-b from-background to-transparent" />
        <div className="relative">
          <Link to="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">← Cockpit</Link>
          <div className="mt-2 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/12 text-primary">
              <ShieldCheck className="h-5 w-5 anim-breathe" />
            </span>
            <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">Sécurité</h1>
            <span className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs uppercase tracking-[0.14em] ${
              anyOffline ? "bg-destructive/15 text-destructive" :
              anyMotion  ? "bg-warm/15 text-warm" :
                           "bg-success/15 text-success"
            }`}>
              {anyOffline ? <AlertTriangle className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
              {anyOffline ? "Caméra hors-ligne" : anyMotion ? "Mouvement en cours" : "Tout est calme"}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {installed.length} caméras actives · {motionEvents.length} évènements aujourd'hui
            {batteryLow.length > 0 && ` · ${batteryLow.length} batterie${batteryLow.length > 1 ? "s" : ""} à surveiller`}
          </p>
        </div>
      </div>

      {/* Sonnette (bientôt) — mise en avant */}
      {doorbell && (
        <Section
          title="Sonnette"
          action={<span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs uppercase tracking-[0.14em] text-muted-foreground"><Bell className="h-3.5 w-3.5" />Arrive bientôt</span>}
        >
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_260px]">
            <CameraFeed camera={doorbell} size="lg" />
            <div className="rounded-xl border border-dashed border-border/60 bg-secondary/40 p-4 text-sm">
              <p className="font-serif text-lg">{doorbell.location}</p>
              <p className="mt-1 text-muted-foreground">
                La sonnette vidéo sera intégrée ici dès son installation.
                Pré-visualisation de la vue, notifications d'appel, historique des passages et détection de colis.
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                <li>· Appel push + carillon intérieur</li>
                <li>· Détection de colis déposé</li>
                <li>· Enregistrement 30 jours</li>
              </ul>
            </div>
          </div>
        </Section>
      )}

      {/* Extérieur */}
      <Section
        title="Extérieur"
        action={<span className="text-sm text-muted-foreground">{outdoor.length} caméras</span>}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {outdoor.map((c) => (
            <div key={c.id} className="space-y-2">
              <CameraFeed camera={c} size="md" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="truncate">{c.location}</span>
                {c.lastMotion && <span className="shrink-0">Mvt · {c.lastMotion}</span>}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Intérieur */}
      <Section
        title="Intérieur"
        action={<span className="text-sm text-muted-foreground">{indoor.length} caméras</span>}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {indoor.map((c) => (
            <div key={c.id} className="space-y-2">
              <CameraFeed camera={c} size="md" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="truncate">{c.location}</span>
                {c.lastMotion && <span className="shrink-0">Mvt · {c.lastMotion}</span>}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Timeline des évènements */}
      <Section title="Évènements récents" action={<span className="text-sm text-muted-foreground">Aujourd'hui</span>}>
        <ul className="space-y-2">
          {motionEvents.map((e) => {
            const cam = cameras.find((c) => c.id === e.cameraId);
            const Icon = eventIcon(e.kind);
            return (
              <li key={e.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                  e.kind === "person"  ? "bg-primary/15 text-primary" :
                  e.kind === "vehicle" ? "bg-accent/20 text-accent-foreground" :
                  e.kind === "package" ? "bg-warm/15 text-warm" :
                  e.kind === "animal"  ? "bg-success/15 text-success" :
                                         "bg-secondary text-muted-foreground"
                }`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-base leading-tight">{e.label}</p>
                  <p className="text-xs text-muted-foreground">
                    <CamIcon className="mr-1 inline h-3 w-3" />
                    {cam?.name} · {e.ago}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{e.time}</span>
              </li>
            );
          })}
        </ul>
      </Section>
    </div>
  );
}
