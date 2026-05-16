import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Section } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";

import { Switch } from "@/components/ui/switch";
import { reseau } from "@/lib/mock-data";
import { Wifi, Cpu, HardDrive, MemoryStick, Shield, ExternalLink, Gauge, Users, Router, Globe, ShieldOff } from "lucide-react";

export const Route = createFileRoute("/_app/reseau")({
  component: ReseauPage,
  head: () => ({ meta: [{ title: "Réseau — Maison" }] }),
});

function ReseauPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Réseau" subtitle="Connectivité, homelab et services" />

      <Section title="Connectivité" action={<span className="inline-flex items-center gap-1.5 text-sm text-success"><Wifi className="h-4 w-4 anim-glow" />Tout en ligne</span>}>
        <div className="grid gap-3 sm:grid-cols-2">
          <WifiCard ssid={reseau.wifi1.ssid} clients={reseau.wifi1.clients} initialOn={reseau.wifi1.on} />
          <WifiCard ssid={reseau.wifi2.ssid} clients={reseau.wifi2.clients} initialOn={reseau.wifi2.on} />
        </div>
        <div className="mt-3 flex items-center justify-between rounded-xl bg-secondary/40 px-4 py-2.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2"><Gauge className="h-3.5 w-3.5" />Internet · {reseau.internet.speedMbps} Mbps · {reseau.internet.latencyMs} ms</span>
          <span className={reseau.internet.on ? "text-success" : "text-muted-foreground"}>{reseau.internet.on ? "stable" : "interrompu"}</span>
        </div>
        <a
          href="https://unifi.local"
          target="_blank"
          rel="noreferrer"
          className="group mt-3 flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-card px-3 py-2.5 text-sm transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-soft"
        >
          <span className="flex items-center gap-2"><Router className="h-4 w-4 text-muted-foreground" />UniFi</span>
          <ExternalLink className="h-3 w-3 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
        </div>
      </Section>

      <Section
        title="DNS"
        action={
          <a
            href={reseau.pihole.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Pi-hole <ExternalLink className="h-3 w-3" />
          </a>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat
            icon={<Globe className="h-4 w-4 anim-drift" />}
            label="Requêtes 24 h"
            value={reseau.pihole.queries24h.toLocaleString("fr-BE")}
          />
          <Stat
            icon={<ShieldOff className="h-4 w-4 anim-glow" />}
            label="Bloquées"
            value={reseau.pihole.blocked24h.toLocaleString("fr-BE")}
            sub={`${reseau.pihole.blockedPct}%`}
            tone="warm"
          />
          <Stat
            icon={<Users className="h-4 w-4 anim-float" />}
            label="Clients"
            value={reseau.pihole.clients.toString()}
            sub={`${reseau.pihole.domainsOnList.toLocaleString("fr-BE")} domaines listés`}
          />
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-border/60 bg-card">
          <div className="flex items-center justify-between border-b border-border/50 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <span>Top domaines bloqués</span>
            <span>Hits</span>
          </div>
          <ul className="divide-y divide-border/40">
            {reseau.pihole.topBlocked.map((d) => (
              <li key={d.domain} className="flex items-center justify-between px-4 py-2 text-sm">
                <span className="font-mono truncate text-muted-foreground">{d.domain}</span>
                <span className="tabular-nums">{d.hits}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section title="Homelab" action={<span className="text-xs text-muted-foreground">Uptime {reseau.homelab.uptimeDays} j</span>}>
        <div className="grid gap-3 sm:grid-cols-3">
          <Meter icon={<Cpu className="h-4 w-4 anim-drift" />} label="CPU" value={reseau.homelab.cpu} />
          <Meter icon={<MemoryStick className="h-4 w-4 anim-float" />} label="Mémoire" value={reseau.homelab.memory} />
          <Meter icon={<HardDrive className="h-4 w-4 anim-breathe" />} label="Disque" value={reseau.homelab.disk} />
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl border border-border/60 bg-card p-3 text-sm">
          <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-success" /> Twingate</span>
          <span className={"rounded-full px-2.5 py-0.5 text-xs " + (reseau.twingate ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>
            {reseau.twingate ? "Connecté" : "Hors ligne"}
          </span>
        </div>
      </Section>

      <Section title="Services" action={<span className="text-xs text-muted-foreground">{reseau.services.length} actifs</span>}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 stagger">
          {reseau.services.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-card px-3 py-2 text-sm transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-soft"
            >
              <span className="flex items-center gap-2 truncate">
                <span className={"h-1.5 w-1.5 shrink-0 rounded-full " + (s.status === "ok" ? "bg-success" : "bg-destructive")} />
                <span className="truncate">{s.name}</span>
              </span>
              <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          ))}
        </div>
      </Section>
    </div>
  );
}

function WifiCard({ ssid, clients, initialOn }: { ssid: string; clients: number; initialOn: boolean }) {
  const [on, setOn] = useState(initialOn);
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-4">
      <div>
        <p className="font-mono text-sm">{ssid}</p>
        <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />{clients} clients
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className={"text-xs " + (on ? "text-success" : "text-muted-foreground")}>
          {on ? "Actif" : "Hors ligne"}
        </span>
        <Switch checked={on} onCheckedChange={setOn} aria-label={`Toggle ${ssid}`} />
      </div>
    </div>
  );
}

function Meter({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">{icon}{label}</div>
      <p className="mt-2 font-serif text-2xl">{value}<span className="text-sm text-muted-foreground">%</span></p>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
        <div className={"h-full rounded-full transition-all duration-700 " + (value > 80 ? "bg-destructive" : value > 60 ? "bg-warm" : "bg-primary")} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
