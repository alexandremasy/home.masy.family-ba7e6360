import { createFileRoute, Link } from "@tanstack/react-router";
import { Section } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { tesla } from "@/lib/mock-data";
import { Plug, Thermometer, MapPin, TrendingDown, TrendingUp, Zap } from "lucide-react";

export const Route = createFileRoute("/_app/tesla")({
  component: TeslaPage,
  head: () => ({ meta: [{ title: "Tesla — Maison" }] }),
});

function TeslaPage() {
  const { current, previous, history } = tesla.monthly;
  const delta = current.kWh - previous.kWh;
  const better = delta < 0;
  const deltaPct = Math.round((Math.abs(delta) / previous.kWh) * 100);
  const max = Math.max(...history.map((h) => h.kWh));

  return (
    <div className="space-y-6">
      <PageHeader title="Tesla" />

      {/* Concise stat row up top */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 stagger">
        <Stat label="Charge" value={`${tesla.charge}%`} sub={`${tesla.rangeKm} km`} accent />
        <Stat label="Câble" value={tesla.pluggedIn ? "Branchée" : "Débranchée"} sub={`Limite ${tesla.chargeLimit}%`} icon={<Plug className={"h-3.5 w-3.5 " + (tesla.pluggedIn ? "text-primary anim-breathe" : "")} />} />
        <Stat label="Intérieur" value={`${tesla.interior}°`} sub={`Ext. ${tesla.exterior}°`} icon={<Thermometer className="h-3.5 w-3.5" />} />
        <Stat label="Localisation" value={tesla.inGarage ? "Garage" : "En route"} sub={tesla.location} icon={<MapPin className="h-3.5 w-3.5" />} />
      </div>

      {/* Battery bar */}
      <div className="rounded-2xl bg-foreground p-6 text-background shadow-soft">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] opacity-60">Batterie</p>
            <p className="mt-1 font-serif text-5xl tracking-tight">{tesla.charge}<span className="text-2xl opacity-60">%</span></p>
          </div>
          <p className="text-sm opacity-70">{tesla.rangeKm} km estimés</p>
        </div>
        <div className="mt-4 relative h-2 w-full overflow-hidden rounded-full bg-background/15">
          <div className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${tesla.charge}%` }} />
          <div className="absolute top-0 h-full w-px bg-background/40" style={{ left: `${tesla.chargeLimit}%` }} />
        </div>
      </div>

      <Section
        title="Charge ce mois"
        action={
          <span className={"inline-flex items-center gap-1 text-sm " + (better ? "text-success" : "text-warm")}>
            {better ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
            {deltaPct}% vs {previous.kWh} kWh
          </span>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <BigStat icon={<Zap className="h-4 w-4" />} label="Énergie" value={`${current.kWh} kWh`} />
          <BigStat label="Sessions" value={`${current.sessions}`} />
          <BigStat label="Coût estimé" value={`${current.cost.toFixed(2)} €`} />
        </div>

        <div className="mt-6">
          <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">6 derniers mois</p>
          <div className="flex h-32 items-end gap-3">
            {history.map((h, i) => {
              const isCurrent = i === history.length - 1;
              return (
                <div key={h.month} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-[10px] tabular-nums text-muted-foreground">{h.kWh}</span>
                  <div
                    className={"w-full rounded-t-md transition-all duration-700 " + (isCurrent ? "bg-primary" : "bg-secondary")}
                    style={{ height: `${(h.kWh / max) * 100}%` }}
                  />
                  <span className={"text-[10px] " + (isCurrent ? "font-medium text-foreground" : "text-muted-foreground")}>{h.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Section>
    </div>
  );
}

function Stat({ label, value, sub, icon, accent }: { label: string; value: string; sub?: string; icon?: React.ReactNode; accent?: boolean }) {
  return (
    <div className={"rounded-xl border border-border/60 p-3 " + (accent ? "bg-primary/8" : "bg-card")}>
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {icon}{label}
      </div>
      <p className="mt-1.5 font-serif text-lg leading-tight">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function BigStat({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-center gap-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">{icon}{label}</div>
      <p className="mt-2 font-serif text-2xl">{value}</p>
    </div>
  );
}
