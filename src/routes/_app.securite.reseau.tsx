import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";

import { Switch } from "@/components/switch";
import { reseau } from "@/lib/mock-data";
import {
  Wifi,
  Cpu,
  HardDrive,
  MemoryStick,
  Shield,
  ExternalLink,
  Gauge,
  Users,
  Router,
  Globe,
  ShieldOff,
  Container,
  Network,
  BarChart3,
  Home,
  Film,
  KeyRound,
  Boxes,
} from "lucide-react";
import { Eyebrow } from "@/components/eyebrow";

const serviceIcons: Record<string, typeof Container> = {
  Portainer: Container,
  Traefik: Network,
  Grafana: BarChart3,
  "Home Assistant": Home,
  Backup: HardDrive,
  "Base de donnée": HardDrive,
  Redis: MemoryStick,
  Qdrant: Boxes,
  Metabase: BarChart3,
  Automate: Network,
  Tesla: Gauge,
  Zigbee: Wifi,
  Search: Globe,
};

export const Route = createFileRoute("/_app/securite/reseau")({
  component: ReseauPage,
  head: () => ({ meta: [{ title: "Réseau — Sécurité" }] }),
});

function ReseauPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Réseau" subtitle="Connectivité, homelab et services" />

      <Card
        variant="solid"
        title="Connectivité"
        action={
          <span className="inline-flex items-center gap-1.5 text-sm text-success">
            <Wifi className="h-4 w-4 anim-glow" />
            Tout en ligne
          </span>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <WifiCard
            ssid={reseau.wifi1.ssid}
            clients={reseau.wifi1.clients}
            initialOn={reseau.wifi1.on}
          />
          <WifiCard
            ssid={reseau.wifi2.ssid}
            clients={reseau.wifi2.clients}
            initialOn={reseau.wifi2.on}
          />
        </div>
        <div className="mt-3 flex items-center justify-between rounded-xl bg-secondary/40 px-4 py-2.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Gauge className="h-3.5 w-3.5" />
            Internet · {reseau.internet.speedMbps} Mbps · {reseau.internet.latencyMs} ms
          </span>
          <span className={reseau.internet.on ? "text-success" : "text-muted-foreground"}>
            {reseau.internet.on ? "stable" : "interrompu"}
          </span>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <a
            href="https://unifi.local"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-card px-3 py-2.5 text-sm transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-soft"
          >
            <span className="flex items-center gap-2">
              <Router className="h-4 w-4 text-muted-foreground" />
              UniFi
            </span>
            <ExternalLink className="h-3 w-3 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
          <a
            href="https://twingate.com"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-card px-3 py-2.5 text-sm transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-soft"
          >
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Twingate
            </span>
            <ExternalLink className="h-3 w-3 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </Card>

      <Card
        variant="solid"
        title="DNS"
        action={<span className="text-xs text-muted-foreground">Pi-hole</span>}
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
            tone="default"
          />
          <Stat
            icon={<Users className="h-4 w-4 anim-float" />}
            label="Clients"
            value={reseau.pihole.clients.toString()}
            sub={`${reseau.pihole.domainsOnList.toLocaleString("fr-BE")} domaines listés`}
          />
        </div>
        <a
          href={reseau.pihole.url}
          target="_blank"
          rel="noreferrer"
          className="group mt-3 flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-card px-3 py-2.5 text-sm transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-soft"
        >
          <span className="flex items-center gap-2">
            <ShieldOff className="h-4 w-4 text-muted-foreground" />
            Pi-hole
          </span>
          <ExternalLink className="h-3 w-3 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </Card>

      <Card
        variant="solid"
        title="Homelab"
        action={
          <span className="text-xs text-muted-foreground">
            Uptime {reseau.homelab.uptimeDays} j ·{" "}
            {reseau.serviceGroups.reduce((n, g) => n + g.services.length, 0)} services
          </span>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <Meter
            icon={<Cpu className="h-4 w-4 anim-drift" />}
            label="CPU"
            value={reseau.homelab.cpu}
          />
          <Meter
            icon={<MemoryStick className="h-4 w-4 anim-float" />}
            label="Mémoire"
            value={reseau.homelab.memory}
          />
          <Meter
            icon={<HardDrive className="h-4 w-4 anim-breathe" />}
            label="Disque"
            value={reseau.homelab.disk}
          />
        </div>
        <div className="mt-4 space-y-4">
          {reseau.serviceGroups.map((g) => (
            <div key={g.key}>
              <Eyebrow className="mb-2">{g.label}</Eyebrow>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 stagger">
                {g.services.map((s) => {
                  const Icon = serviceIcons[s.name] ?? Boxes;
                  return (
                    <a
                      key={s.name}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-card px-3 py-2.5 text-sm transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-soft"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="truncate">{s.name}</span>
                        <span
                          className={
                            "h-1.5 w-1.5 shrink-0 rounded-full " +
                            (s.status === "ok" ? "bg-success" : "bg-destructive")
                          }
                        />
                      </span>
                      <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function WifiCard({
  ssid,
  clients,
  initialOn,
}: {
  ssid: string;
  clients: number;
  initialOn: boolean;
}) {
  const [on, setOn] = useState(initialOn);
  return (
    <Card variant="solid" as="div">
      <div className="flex flex-1 items-center justify-between">
        <div>
          <p className="font-mono text-sm">{ssid}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            {clients} clients
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={"text-xs " + (on ? "text-success" : "text-muted-foreground")}>
            {on ? "Actif" : "Hors ligne"}
          </span>
          <Switch checked={on} onCheckedChange={setOn} aria-label={`Toggle ${ssid}`} />
        </div>
      </div>
    </Card>
  );
}

function Meter({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card variant="solid" as="div">
      <Eyebrow as="div" className="flex items-center gap-2">
        {icon}
        {label}
      </Eyebrow>
      <p className="mt-2 text-xl">
        {value}
        <span className="text-sm text-muted-foreground">%</span>
      </p>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={
            "h-full rounded-full transition-all duration-700 " +
            (value > 80 ? "bg-destructive" : value > 60 ? "bg-warm" : "bg-primary")
          }
          style={{ width: `${value}%` }}
        />
      </div>
    </Card>
  );
}

function Stat({
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
    <Card variant="solid" as="div">
      <Eyebrow as="div" className="flex items-center gap-2">
        {icon}
        {label}
      </Eyebrow>
      <p
        className={
          "mt-2 text-xl tabular-nums " + (tone === "warm" ? "text-warm" : "text-foreground")
        }
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </Card>
  );
}
