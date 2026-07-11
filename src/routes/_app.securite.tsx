import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Section } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Switch } from "@/components/ui/switch";
import {
  armModes, security, presence, perimeter, locks, activity, cameras, securityHealth,
  type ArmMode, type ActivityItem,
} from "@/lib/mock-data";
import {
  ShieldCheck, ShieldAlert, ShieldOff, Home, Moon, LogOut,
  DoorOpen, DoorClosed, Lock, LockOpen, Warehouse,
  Bell, Package, User, Car, Cat, Activity as ActivityIcon,
  Camera as CamIcon, Eye, ChevronRight, Wifi, WifiOff, Siren,
  BatteryLow, Radio, MapPin,
} from "lucide-react";

export const Route = createFileRoute("/_app/securite")({
  component: SecuritePage,
  head: () => ({
    meta: [
      { title: "Sécurité — Maison" },
      { name: "description", content: "État de la maison : armement, présence, périmètre, activité, caméras et santé du système." },
    ],
  }),
});

const modeIcon: Record<ArmMode, typeof Home> = {
  disarmed: ShieldOff, home: Home, night: Moon, away: LogOut,
};

function activityIcon(kind: ActivityItem["kind"]) {
  switch (kind) {
    case "person":   return User;
    case "vehicle":  return Car;
    case "animal":   return Cat;
    case "package":  return Package;
    case "door":     return DoorOpen;
    case "lock":     return Lock;
    case "doorbell": return Bell;
    case "arm":      return ShieldCheck;
    case "system":   return Radio;
    default:         return ActivityIcon;
  }
}

function SecuritePage() {
  const openPoints = perimeter.filter((p) => p.state !== "secure");
  const perimeterSecure = openPoints.length === 0;
  const verdict: "secure" | "attention" = perimeterSecure ? "secure" : "attention";
  const installedCams = cameras.filter((c) => c.installed);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sécurité"
        subtitle="L'état de la maison, en un coup d'œil"
        action={
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs uppercase tracking-[0.14em] ${
            verdict === "secure" ? "bg-success/15 text-success" : "bg-warm/15 text-warm"
          }`}>
            {verdict === "secure" ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
            {verdict === "secure" ? "Sécurisée" : `${openPoints.length} à vérifier`}
          </span>
        }
      />

      {/* 1 ── État & armement (hero) */}
      <ArmingHero verdict={verdict} openPoints={openPoints} />

      {/* 2 ── Présence */}
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

      {/* 3 ── Périmètre */}
      <Section
        title="Périmètre"
        action={
          <span className={`inline-flex items-center gap-1.5 text-sm ${perimeterSecure ? "text-success" : "text-warm"}`}>
            {perimeterSecure ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
            {perimeterSecure ? "Périmètre sécurisé" : `${openPoints.length} point${openPoints.length > 1 ? "s" : ""} ouvert${openPoints.length > 1 ? "s" : ""}`}
          </span>
        }
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {perimeter.map((p) => {
            const Icon = p.type === "garage" ? Warehouse : p.state === "open" ? DoorOpen : DoorClosed;
            const secure = p.state === "secure";
            return (
              <div key={p.name} className={`flex items-center gap-3 rounded-xl border p-3 ${
                secure ? "border-border/60 bg-card" : "border-warm/40 bg-warm/10"
              }`}>
                <Icon className={`h-4 w-4 shrink-0 ${secure ? "text-muted-foreground" : "text-warm"}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{p.name}</p>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{p.zone}</p>
                </div>
                <span className={`shrink-0 text-xs ${secure ? "text-success" : "text-warm"}`}>
                  {p.state === "secure" ? "Fermé" : p.state === "open" ? "Ouvert" : "Déverrouillé"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Serrures */}
        <div className="mt-4">
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">Serrures</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {locks.map((l) => (
              <LockRow key={l.name} name={l.name} initial={l.locked} />
            ))}
          </div>
        </div>
      </Section>

      {/* 4 ── Activité */}
      <Section title="Activité" action={<span className="text-sm text-muted-foreground">Aujourd'hui</span>}>
        <ul className="space-y-2">
          {activity.map((e) => {
            const Icon = activityIcon(e.kind);
            const tone =
              e.level === "alert" ? "bg-destructive/15 text-destructive" :
              e.level === "warn"  ? "bg-warm/15 text-warm" :
                                    "bg-secondary text-muted-foreground";
            return (
              <li key={e.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${tone}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-base leading-tight">{e.label}</p>
                  <p className="text-xs text-muted-foreground">{e.where} · {e.ago}</p>
                </div>
                <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{e.time}</span>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* 5 ── Caméras */}
      <Section title="Caméras" action={<span className="text-sm text-muted-foreground">{installedCams.length} en ligne</span>}>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {installedCams.map((c) => {
            const offline = c.state === "offline";
            return (
              <div key={c.id} className="group rounded-xl border border-border/60 bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-soft">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <CamIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <p className="truncate text-sm">{c.name}</p>
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${offline ? "bg-destructive" : "bg-success"}`} />
                  </div>
                  {c.night && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-secondary px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      <Moon className="h-2.5 w-2.5" />IR
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{c.location}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {offline ? "Hors-ligne" : c.lastMotion ? `Mvt · ${c.lastMotion}` : "Rien à signaler"}
                  </span>
                  <button className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                    <Eye className="h-3.5 w-3.5" />Voir le flux
                    <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Sonnette — à venir */}
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-border/60 bg-secondary/30 p-3">
            <Bell className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">Sonnette vidéo</p>
              <p className="text-xs text-muted-foreground">Entrée principale</p>
            </div>
            <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">À venir</span>
          </div>
        </div>
      </Section>

      {/* 6 ── Santé du système */}
      <Section
        title="Système"
        action={<span className="text-sm text-muted-foreground">Dernier test · {securityHealth.lastTest}</span>}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <HealthStat
            icon={securityHealth.devicesOnline === securityHealth.devicesTotal ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            label="Appareils"
            value={`${securityHealth.devicesOnline}/${securityHealth.devicesTotal}`}
            sub="en ligne"
            tone={securityHealth.devicesOnline === securityHealth.devicesTotal ? "default" : "warm"}
          />
          <HealthStat icon={<Radio className="h-4 w-4" />} label="Connectivité" value={securityHealth.connectivity === "ok" ? "Stable" : "Dégradée"} tone={securityHealth.connectivity === "ok" ? "default" : "warm"} />
          <HealthStat icon={<Siren className="h-4 w-4" />} label="Sirène" value={securityHealth.siren === "ready" ? "Prête" : "Déclenchée"} tone={securityHealth.siren === "ready" ? "default" : "warm"} />
          <HealthStat icon={<ShieldCheck className="h-4 w-4" />} label="Sabotage" value={securityHealth.tamper ? "Détecté" : "Aucun"} tone={securityHealth.tamper ? "warm" : "default"} />
        </div>

        {(securityHealth.batteries.length > 0 || securityHealth.offline.length > 0) && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {securityHealth.offline.map((o) => (
              <div key={o.name} className="flex items-center gap-2 rounded-xl border border-warm/40 bg-warm/10 p-3 text-sm">
                <WifiOff className="h-4 w-4 shrink-0 text-warm" />
                <span className="min-w-0 flex-1 truncate">{o.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{o.since}</span>
              </div>
            ))}
            {securityHealth.batteries.filter((b) => b.level < 30).map((b) => (
              <div key={b.name} className="flex items-center gap-2 rounded-xl border border-warm/40 bg-warm/10 p-3 text-sm">
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

// ── 1 ── Hero armement ────────────────────────────────────────────────────────
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

        {/* Sélecteur de mode */}
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

      {/* Bandeau attention + actions */}
      {verdict === "attention" && (
        <div className="mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-warm/30 bg-card/60 p-3">
          <span className="text-xs uppercase tracking-[0.14em] text-warm">À vérifier</span>
          {openPoints.map((p) => (
            <span key={p.name} className="inline-flex items-center gap-1 rounded-full bg-warm/10 px-2 py-0.5 text-xs text-warm">
              {p.type === "garage" ? <Warehouse className="h-3 w-3" /> : <DoorOpen className="h-3 w-3" />}
              {p.name}
            </span>
          ))}
          <button className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-xs text-background transition-transform hover:-translate-y-0.5">
            <Lock className="h-3.5 w-3.5" />Tout verrouiller
          </button>
        </div>
      )}

      {/* Auto-suivi présence */}
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

// ── Serrure (toggle) ──────────────────────────────────────────────────────────
function LockRow({ name, initial }: { name: string; initial: boolean }) {
  const [locked, setLocked] = useState(initial);
  return (
    <button
      onClick={() => setLocked((v) => !v)}
      className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-soft ${
        locked ? "border-border/60 bg-card" : "border-warm/40 bg-warm/10"
      }`}
    >
      {locked ? <Lock className="h-4 w-4 shrink-0 text-success" /> : <LockOpen className="h-4 w-4 shrink-0 text-warm" />}
      <span className="min-w-0 flex-1 truncate text-sm">{name}</span>
      <span className={`shrink-0 text-xs ${locked ? "text-success" : "text-warm"}`}>{locked ? "Verrouillée" : "Ouverte"}</span>
    </button>
  );
}

// ── Santé (stat) ──────────────────────────────────────────────────────────────
function HealthStat({ icon, label, value, sub, tone = "default" }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; tone?: "default" | "warm";
}) {
  return (
    <div className={`rounded-xl border p-4 ${tone === "warm" ? "border-warm/40 bg-warm/10" : "border-border/60 bg-card"}`}>
      <div className={`flex items-center gap-2 text-xs uppercase tracking-[0.14em] ${tone === "warm" ? "text-warm" : "text-muted-foreground"}`}>
        {icon}{label}
      </div>
      <p className="mt-2 font-serif text-2xl">{value}{sub && <span className="ml-1 text-sm text-muted-foreground">{sub}</span>}</p>
    </div>
  );
}
