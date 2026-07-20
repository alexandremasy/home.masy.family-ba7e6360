import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/card";
import { activity, securityHealth, type ActivityItem } from "@/lib/mock-data";
import {
  ShieldCheck,
  DoorOpen,
  Lock,
  Bell,
  Package,
  User,
  Car,
  Cat,
  Activity as ActivityIcon,
  Wifi,
  WifiOff,
  Siren,
  BatteryLow,
  Radio,
} from "lucide-react";

// Tab 3 — Activité: what happened, and whether the system that watched it is healthy.
export const Route = createFileRoute("/_app/securite/activite")({
  component: ActiviteTab,
});

function activityIcon(kind: ActivityItem["kind"]) {
  switch (kind) {
    case "person":
      return User;
    case "vehicle":
      return Car;
    case "animal":
      return Cat;
    case "package":
      return Package;
    case "door":
      return DoorOpen;
    case "lock":
      return Lock;
    case "doorbell":
      return Bell;
    case "arm":
      return ShieldCheck;
    case "system":
      return Radio;
    default:
      return ActivityIcon;
  }
}

function ActiviteTab() {
  return (
    <div className="space-y-6">
      <Section
        title="Activité"
        action={<span className="text-sm text-muted-foreground">Aujourd'hui</span>}
      >
        <ul className="space-y-2">
          {activity.map((e) => {
            const Icon = activityIcon(e.kind);
            const tone =
              e.level === "alert"
                ? "bg-destructive/15 text-destructive"
                : e.level === "warn"
                  ? "bg-warm/15 text-warm"
                  : "bg-secondary text-muted-foreground";
            return (
              <li
                key={e.id}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3"
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${tone}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-base leading-tight">{e.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.where} · {e.ago}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                  {e.time}
                </span>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section
        title="Système"
        action={
          <span className="text-sm text-muted-foreground">
            Dernier test · {securityHealth.lastTest}
          </span>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <HealthStat
            icon={
              securityHealth.devicesOnline === securityHealth.devicesTotal ? (
                <Wifi className="h-4 w-4" />
              ) : (
                <WifiOff className="h-4 w-4" />
              )
            }
            label="Appareils"
            value={`${securityHealth.devicesOnline}/${securityHealth.devicesTotal}`}
            sub="en ligne"
            tone={securityHealth.devicesOnline === securityHealth.devicesTotal ? "default" : "warm"}
          />
          <HealthStat
            icon={<Radio className="h-4 w-4" />}
            label="Connectivité"
            value={securityHealth.connectivity === "ok" ? "Stable" : "Dégradée"}
            tone={securityHealth.connectivity === "ok" ? "default" : "warm"}
          />
          <HealthStat
            icon={<Siren className="h-4 w-4" />}
            label="Sirène"
            value={securityHealth.siren === "ready" ? "Prête" : "Déclenchée"}
            tone={securityHealth.siren === "ready" ? "default" : "warm"}
          />
          <HealthStat
            icon={<ShieldCheck className="h-4 w-4" />}
            label="Sabotage"
            value={securityHealth.tamper ? "Détecté" : "Aucun"}
            tone={securityHealth.tamper ? "warm" : "default"}
          />
        </div>

        {(securityHealth.batteries.length > 0 || securityHealth.offline.length > 0) && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {securityHealth.offline.map((o) => (
              <div
                key={o.name}
                className="flex items-center gap-2 rounded-xl border border-warm/40 bg-warm/10 p-3 text-sm"
              >
                <WifiOff className="h-4 w-4 shrink-0 text-warm" />
                <span className="min-w-0 flex-1 truncate">{o.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{o.since}</span>
              </div>
            ))}
            {securityHealth.batteries
              .filter((b) => b.level < 30)
              .map((b) => (
                <div
                  key={b.name}
                  className="flex items-center gap-2 rounded-xl border border-warm/40 bg-warm/10 p-3 text-sm"
                >
                  <BatteryLow className="h-4 w-4 shrink-0 text-warm" />
                  <span className="min-w-0 flex-1 truncate">{b.name}</span>
                  <span className="shrink-0 text-xs text-warm">{b.level}%</span>
                </div>
              ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function HealthStat({
  icon,
  label,
  value,
  sub,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "warm";
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${tone === "warm" ? "border-warm/40 bg-warm/10" : "border-border/60 bg-card"}`}
    >
      <div
        className={`flex items-center gap-2 text-xs uppercase tracking-eyebrow ${tone === "warm" ? "text-warm" : "text-muted-foreground"}`}
      >
        {icon}
        {label}
      </div>
      <p className="mt-2 font-serif text-xl">
        {value}
        {sub && <span className="ml-1 text-sm text-muted-foreground">{sub}</span>}
      </p>
    </div>
  );
}
