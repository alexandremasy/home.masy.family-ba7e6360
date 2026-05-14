import { createFileRoute, Link } from "@tanstack/react-router";
import { Section } from "@/components/Card";
import { reseau } from "@/lib/mock-data";
import { Wifi, Cpu, HardDrive, MemoryStick, Shield, ExternalLink, Gauge } from "lucide-react";

export const Route = createFileRoute("/_app/reseau")({
  component: ReseauPage,
  head: () => ({ meta: [{ title: "Réseau — Maison" }] }),
});

function ReseauPage() {
  return (
    <div className="space-y-6">
      <div className="px-1">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Cockpit</Link>
        <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">Réseau</h1>
        <p className="mt-1 text-muted-foreground">Connectivité, homelab et services</p>
      </div>

      <Section title="Connectivité" action={<span className="inline-flex items-center gap-1.5 text-sm text-success"><Wifi className="h-4 w-4" />Tout en ligne</span>}>
        <div className="grid gap-3 sm:grid-cols-3">
          <Status label="WiFi 1" on={reseau.wifi1} />
          <Status label="WiFi 2" on={reseau.wifi2} />
          <Status label="Internet" on={reseau.internet} />
        </div>
        <div className="mt-5 flex items-end justify-between rounded-2xl bg-secondary/60 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Speedtest</p>
            <p className="mt-1 font-serif text-4xl tracking-tight">{reseau.speedMbps}<span className="text-base text-muted-foreground"> Mbps</span></p>
          </div>
          <Gauge className="h-6 w-6 text-muted-foreground" />
        </div>
      </Section>

      <Section title="Homelab">
        <div className="grid gap-3 sm:grid-cols-3">
          <Meter icon={<Cpu className="h-4 w-4" />} label="CPU" value={reseau.homelab.cpu} />
          <Meter icon={<MemoryStick className="h-4 w-4" />} label="Mémoire" value={reseau.homelab.memory} />
          <Meter icon={<HardDrive className="h-4 w-4" />} label="Disque" value={reseau.homelab.disk} />
        </div>
        <div className="mt-5 flex items-center justify-between rounded-2xl border border-border/60 bg-card p-4">
          <span className="flex items-center gap-3"><Shield className="h-4 w-4 text-success" /> Twingate connector</span>
          <span className={"rounded-full px-3 py-1 text-xs " + (reseau.twingate ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>
            {reseau.twingate ? "Connecté" : "Hors ligne"}
          </span>
        </div>
      </Section>

      <Section title="Services">
        <div className="grid gap-3 sm:grid-cols-3">
          {reseau.services.map((s) => (
            <a key={s.name} href={s.url} target="_blank" rel="noreferrer"
              className="group flex items-center justify-between rounded-2xl border border-border/60 bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-soft">
              <span className="font-serif text-xl">{s.name}</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </a>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Status({ label, on }: { label: string; on: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-card p-4">
      <span>{label}</span>
      <span className={"flex items-center gap-2 text-xs " + (on ? "text-success" : "text-muted-foreground")}>
        <span className={"h-2 w-2 rounded-full " + (on ? "bg-success" : "bg-muted-foreground/40")} />
        {on ? "Actif" : "Hors ligne"}
      </span>
    </div>
  );
}

function Meter({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">{icon}{label}</div>
      <p className="mt-3 font-serif text-3xl">{value}<span className="text-sm text-muted-foreground">%</span></p>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={"h-full rounded-full " + (value > 80 ? "bg-destructive" : value > 60 ? "bg-warm" : "bg-primary")} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
