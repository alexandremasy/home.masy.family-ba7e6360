import { useEffect, useState, type ReactNode } from "react";
import {
  BarChart3,
  Boxes,
  Container,
  Cpu,
  ExternalLink,
  Gauge,
  Globe,
  HardDrive,
  Home,
  MemoryStick,
  Network,
  ShieldOff,
  Users,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/card";
import { Eyebrow } from "@/components/eyebrow";
import { PageHeader } from "@/components/page-header";
import { Switch } from "@/components/switch";

/* ─────────────────────────────────────────────────────────────────────────────
   Réseau, as a page — three cards, in the order you ask the questions: is it up,
   what is it filtering, what is running on it.

   The wifi toggles are the only controls here, and they are optimistic: the
   switch moves at once and settles when the real state comes back. A toggle that
   waits for a round trip reads as broken, and this one waits on a radio.

   The page knows nothing about where a figure came from. The mockup fills it from
   memory, the cockpit from HA, and a homelab that stopped reporting arrives as
   `undefined` rather than as a zero — which would draw an idle machine.
   ──────────────────────────────────────────────────────────────────────────── */

/** One wifi network, with the switch that turns it off. */
export interface ReseauWifiView {
  /** Handed back on toggle — the caller's own identifier for the network. */
  id: string;
  /** The network's name, shown as written. */
  ssid: string;
  /** Devices connected to it. */
  clients: number;
  /** Radio on. */
  on: boolean;
}

/** The line itself. */
export interface ReseauInternetView {
  speedMbps: number;
  latencyMs: number;
  /** The line is up. */
  on: boolean;
}

/** What the resolver filtered over the last 24 h. */
export interface ReseauDnsView {
  queries: number;
  blocked: number;
  /** Share of queries blocked, in percent. */
  blockedPct: number;
  /** Distinct clients seen. */
  clients: number;
  /** Size of the blocklist. */
  domainsOnList: number;
}

/** The machine everything runs on. Any figure may be missing — it reads "—". */
export interface ReseauHomelabView {
  cpu?: number;
  memory?: number;
  disk?: number;
  uptimeDays?: number;
}

/** One service, and whether it answers. */
export interface ReseauServiceView {
  /** Its name — also what picks its glyph. */
  name: string;
  url: string;
  /** Answering. False draws the dot in the alarm colour. */
  ok: boolean;
}

/** Services, grouped the way the caller groups them. */
export interface ReseauServiceGroupView {
  key: string;
  label: string;
  services: ReseauServiceView[];
}

/** An admin UI worth one click — UniFi, Twingate, Pi-hole. */
export interface ReseauLinkView {
  href: string;
  label: string;
  /** Its glyph. The caller owns it: these are its own tools. */
  icon: ReactNode;
}

export interface ReseauProps {
  /**
   * `up` everything answers · `partial` a network is off · `down` we cannot even
   * ask — the house's brain is unreachable, so every figure below is stale.
   */
  status: "up" | "partial" | "down";
  /** The wifi networks, in display order. */
  wifis: ReseauWifiView[];
  /** The line. */
  internet: ReseauInternetView;
  /** Links under the connectivity card. */
  links: ReseauLinkView[];
  /** The resolver's last 24 h. */
  dns: ReseauDnsView;
  /** Link under the DNS card — the resolver's own UI. */
  dnsLink?: ReseauLinkView;
  /** The machine. */
  homelab: ReseauHomelabView;
  /** What runs on it. */
  serviceGroups: ReseauServiceGroupView[];
  /** Turning a network on or off. Absent, the switches are decorative. */
  onToggleWifi?: (id: string, on: boolean) => void;
}

/** Services are named, not typed — the glyph is a lookup, with a box as fallback. */
const SERVICE_ICONS: Record<string, LucideIcon> = {
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

const num = (n: number) => n.toLocaleString("fr-BE");

export function Reseau({
  status,
  wifis,
  internet,
  links,
  dns,
  dnsLink,
  homelab,
  serviceGroups,
  onToggleWifi,
}: ReseauProps) {
  const offline = wifis.filter((w) => !w.on).length;
  const totalServices = serviceGroups.reduce((n, g) => n + g.services.length, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Réseau" subtitle="Connectivité, homelab et services" />

      <Card
        variant="solid"
        title="Connectivité"
        trailing={
          <span
            className={
              "inline-flex items-center gap-1.5 text-sm " +
              (status === "up"
                ? "text-success"
                : status === "partial"
                  ? "text-muted-foreground"
                  : "text-destructive")
            }
          >
            <Wifi className={"h-4 w-4 " + (status === "up" ? "anim-glow" : "")} />
            {status === "up"
              ? "Tout en ligne"
              : status === "partial"
                ? `${offline} réseau${offline > 1 ? "x" : ""} inactif`
                : "Problème détecté"}
          </span>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {wifis.map((w) => (
            <WifiCard key={w.id} wifi={w} onToggle={onToggleWifi} />
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between rounded-xl bg-secondary/40 px-4 py-2.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Gauge className="h-3.5 w-3.5" />
            Internet · {num(internet.speedMbps)} Mbps · {num(internet.latencyMs)} ms
          </span>
          <span className={internet.on ? "text-success" : "text-muted-foreground"}>
            {internet.on ? "stable" : "interrompu"}
          </span>
        </div>

        {links.length > 0 && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {links.map((l) => (
              <QuickLink key={l.href} {...l} />
            ))}
          </div>
        )}
      </Card>

      <Card
        variant="solid"
        title="DNS"
        trailing={<span className="text-xs text-muted-foreground">Pi-hole</span>}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat
            icon={<Globe className="h-4 w-4 anim-drift" />}
            label="Requêtes 24 h"
            value={num(dns.queries)}
          />
          <Stat
            icon={<ShieldOff className="h-4 w-4 anim-glow" />}
            label="Bloquées"
            value={num(dns.blocked)}
            sub={`${dns.blockedPct}%`}
          />
          <Stat
            icon={<Users className="h-4 w-4 anim-float" />}
            label="Clients"
            value={num(dns.clients)}
            sub={`${num(dns.domainsOnList)} domaines listés`}
          />
        </div>
        {dnsLink && (
          <div className="mt-3">
            <QuickLink {...dnsLink} />
          </div>
        )}
      </Card>

      <Card
        variant="solid"
        title="Homelab"
        trailing={
          <span className="text-xs text-muted-foreground">
            {homelab.uptimeDays != null ? `Uptime ${num(homelab.uptimeDays)} j · ` : ""}
            {totalServices} services
          </span>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <Meter icon={<Cpu className="h-4 w-4 anim-drift" />} label="CPU" value={homelab.cpu} />
          <Meter
            icon={<MemoryStick className="h-4 w-4 anim-float" />}
            label="Mémoire"
            value={homelab.memory}
          />
          <Meter
            icon={<HardDrive className="h-4 w-4 anim-breathe" />}
            label="Disque"
            value={homelab.disk}
          />
        </div>

        <div className="mt-4 space-y-4">
          {serviceGroups.map((g) => (
            <div key={g.key}>
              <Eyebrow className="mb-2">{g.label}</Eyebrow>
              <div className="stagger grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {g.services.map((s) => {
                  const Icon = SERVICE_ICONS[s.name] ?? Boxes;
                  return (
                    <ExternalRow key={s.name} href={s.url}>
                      <span className="flex items-center gap-2 truncate">
                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="truncate">{s.name}</span>
                        <span
                          className={
                            "h-1.5 w-1.5 shrink-0 rounded-full " +
                            (s.ok ? "bg-success" : "bg-destructive")
                          }
                        />
                      </span>
                    </ExternalRow>
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

/**
 * One network. The switch is optimistic — it moves on click and gives way as soon
 * as the real state arrives, so a radio taking a second to answer never looks stuck.
 */
function WifiCard({
  wifi,
  onToggle,
}: {
  wifi: ReseauWifiView;
  onToggle?: (id: string, on: boolean) => void;
}) {
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const shown = optimistic ?? wifi.on;

  useEffect(() => {
    setOptimistic(null);
  }, [wifi.on]);

  return (
    <Card variant="solid" as="div">
      <div className="flex flex-1 items-center justify-between">
        <div>
          <p className="font-mono text-sm">{wifi.ssid}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            {wifi.clients} clients
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={"text-xs " + (shown ? "text-success" : "text-muted-foreground")}>
            {shown ? "Actif" : "Hors ligne"}
          </span>
          <Switch
            checked={shown}
            onCheckedChange={(v) => {
              setOptimistic(v);
              onToggle?.(wifi.id, v);
            }}
            aria-label={`Toggle ${wifi.ssid}`}
          />
        </div>
      </div>
    </Card>
  );
}

function ExternalRow({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-card px-3 py-2.5 text-sm transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-soft"
    >
      {children}
      <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </a>
  );
}

function QuickLink({ href, label, icon }: ReseauLinkView) {
  return (
    <ExternalRow href={href}>
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
    </ExternalRow>
  );
}

function Meter({ icon, label, value }: { icon: ReactNode; label: string; value?: number }) {
  return (
    <Card variant="solid" as="div">
      <Eyebrow as="div" className="flex items-center gap-2">
        {icon}
        {label}
      </Eyebrow>
      <p className="mt-2 text-xl">
        {value != null ? (
          <>
            {num(value)}
            <span className="text-sm text-muted-foreground">%</span>
          </>
        ) : (
          <span className="opacity-40">—</span>
        )}
      </p>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={
            "h-full rounded-full transition-all duration-700 " +
            ((value ?? 0) > 80 ? "bg-destructive" : (value ?? 0) > 60 ? "bg-warm" : "bg-primary")
          }
          style={{ width: `${value ?? 0}%` }}
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
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card variant="solid" as="div">
      <Eyebrow as="div" className="flex items-center gap-2">
        {icon}
        {label}
      </Eyebrow>
      <p className="mt-2 text-xl tabular-nums text-foreground">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </Card>
  );
}
