import { createFileRoute, Link } from "@tanstack/react-router";
import { Section } from "@/components/Card";
import { tesla } from "@/lib/mock-data";
import { Plug, Battery, Thermometer, Gauge } from "lucide-react";

export const Route = createFileRoute("/_app/tesla")({
  component: TeslaPage,
  head: () => ({ meta: [{ title: "Tesla — Maison" }] }),
});

function TeslaPage() {
  return (
    <div className="space-y-6">
      <div className="px-1">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Cockpit</Link>
        <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">Tesla</h1>
        <p className="mt-1 text-muted-foreground">État du véhicule · lecture seule</p>
      </div>

      <div className="overflow-hidden rounded-3xl bg-foreground p-8 text-background shadow-soft sm:p-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] opacity-60">Batterie</p>
            <p className="mt-2 font-serif text-7xl tracking-tight sm:text-8xl">
              {tesla.charge}<span className="text-3xl opacity-60">%</span>
            </p>
            <p className="mt-2 text-sm opacity-70">{tesla.rangeKm} km estimés</p>
          </div>
          <div className={"inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm " + (tesla.pluggedIn ? "bg-primary text-primary-foreground" : "bg-background/10")}>
            <Plug className="h-4 w-4" /> {tesla.pluggedIn ? "Branchée" : "Débranchée"}
          </div>
        </div>

        <div className="mt-8">
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-background/15">
            <div className="absolute left-0 top-0 h-full rounded-full bg-primary" style={{ width: `${tesla.charge}%` }} />
            <div className="absolute top-1/2 h-4 w-px -translate-y-1/2 bg-background/40" style={{ left: `${tesla.chargeLimit}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-xs opacity-60">
            <span>0%</span><span>Limite {tesla.chargeLimit}%</span><span>100%</span>
          </div>
        </div>
      </div>

      <Section title="Capteurs">
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat icon={<Thermometer className="h-4 w-4" />} label="Intérieur" value={`${tesla.interior}°C`} />
          <Stat icon={<Thermometer className="h-4 w-4" />} label="Extérieur" value={`${tesla.exterior}°C`} />
          <Stat icon={<Gauge className="h-4 w-4" />} label="Autonomie" value={`${tesla.rangeKm} km`} />
          <Stat icon={<Battery className="h-4 w-4" />} label="Charge" value={`${tesla.charge}%`} />
          <Stat icon={<Plug className="h-4 w-4" />} label="État câble" value={tesla.pluggedIn ? "Branchée" : "Débranchée"} />
          <Stat icon={<Battery className="h-4 w-4" />} label="Limite" value={`${tesla.chargeLimit}%`} />
        </div>
      </Section>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">{icon}{label}</div>
      <p className="mt-3 font-serif text-2xl">{value}</p>
    </div>
  );
}
