import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Section } from "@/components/Card";
import { Switch } from "@/components/ui/switch";
import { armModes, security, presence, perimeter, type ArmMode } from "@/lib/mock-data";
import {
  ShieldCheck, ShieldAlert, ShieldOff, Home, Moon, LogOut,
  DoorOpen, Lock, Warehouse, MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Tab 1 — État: arming + presence. They belong together: the arming follows the presence.
export const Route = createFileRoute("/_app/securite/etat")({
  component: EtatTab,
});

const modeIcon: Record<ArmMode, typeof Home> = {
  disarmed: ShieldOff, home: Home, night: Moon, away: LogOut,
};

function EtatTab() {
  const openPoints = perimeter.filter((p) => p.state !== "secure");
  const verdict: "secure" | "attention" = openPoints.length === 0 ? "secure" : "attention";

  return (
    <div className="space-y-6">
      <ArmingHero verdict={verdict} openPoints={openPoints} />

      <Section
        title="Présence"
        action={<span className="text-sm text-muted-foreground">{presence.filter((p) => p.home).length}/{presence.length} à la maison</span>}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {presence.map((m) => (
            <div key={m.name} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3">
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full font-serif text-lg ${
                m.home ? "bg-success/15 text-success" : "bg-secondary text-muted-foreground"
              }`}>
                {m.initial}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-lg leading-tight">{m.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {m.home ? "À la maison" : m.place} · {m.since}
                </p>
              </div>
              <span className={`h-2 w-2 shrink-0 rounded-full ${m.home ? "bg-success" : "bg-muted-foreground/40"}`} />
            </div>
          ))}
        </div>
        {security.autoFollowPresence && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            Armement automatique · passe en <span className="font-medium text-foreground">Absent</span> quand tout le monde part
          </p>
        )}
      </Section>
    </div>
  );
}

function ArmingHero({ verdict, openPoints }: { verdict: "secure" | "attention"; openPoints: typeof perimeter }) {
  const [mode, setMode] = useState<ArmMode>(security.mode);
  const [autoFollow, setAutoFollow] = useState(security.autoFollowPresence);
  const current = armModes.find((m) => m.key === mode)!;
  const armed = mode !== "disarmed";

  const headline =
    verdict === "attention"
      ? openPoints.length === 1 ? `${openPoints[0].name} · ${openPoints[0].state === "open" ? "ouverte" : "déverrouillée"}` : `${openPoints.length} points à vérifier`
      : armed ? "Maison sécurisée" : "Surveillance désactivée";

  const HeadIcon = verdict === "attention" ? ShieldAlert : armed ? ShieldCheck : ShieldOff;

  return (
    <section className={`overflow-hidden rounded-2xl border p-6 shadow-soft sm:p-8 anim-slide-up ${
      verdict === "attention" ? "border-warm/40 bg-warm/[0.06]" :
      armed ? "border-success/30 bg-success/[0.05]" : "border-border/60 bg-card"
    }`}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${
            verdict === "attention" ? "bg-warm/15 text-warm" : armed ? "bg-success/15 text-success" : "bg-secondary text-muted-foreground"
          }`}>
            <HeadIcon className="h-7 w-7 anim-breathe" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Mode {current.label}{armed && ` · depuis ${security.armedSince}`}
            </p>
            <p className="mt-1 font-serif text-3xl leading-tight tracking-tight">{headline}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{current.hint}</p>
          </div>
        </div>

        <div className="inline-flex flex-wrap gap-1 rounded-full bg-secondary/70 p-1">
          {armModes.map((m) => {
            const Icon = modeIcon[m.key];
            const active = m.key === mode;
            return (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all ${
                  active ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {verdict === "attention" && (
        <div className="mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-warm/30 bg-card/60 p-3">
          <span className="text-xs uppercase tracking-[0.14em] text-warm">À vérifier</span>
          {openPoints.map((p) => (
            <span key={p.name} className="inline-flex items-center gap-1 rounded-full bg-warm/10 px-2 py-0.5 text-xs text-warm">
              {p.type === "garage" ? <Warehouse className="h-3 w-3" /> : <DoorOpen className="h-3 w-3" />}
              {p.name}
            </span>
          ))}
          <Button variant="inverted" size="sm" className="ml-auto gap-1.5 rounded-full transition-transform hover:-translate-y-0.5">
            <Lock className="h-3.5 w-3.5" />Tout verrouiller
          </Button>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/50 pt-4">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>Armement automatique selon la présence</span>
        </div>
        <Switch checked={autoFollow} onCheckedChange={setAutoFollow} aria-label="Armement automatique" />
      </div>
    </section>
  );
}
