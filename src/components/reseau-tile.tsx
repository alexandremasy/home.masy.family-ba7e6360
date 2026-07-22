import { type ReactNode } from "react";
import { Activity, ArrowUp, Server, Wifi } from "lucide-react";
import { Card } from "@/components/card";
import { CountUp } from "@/components/count-up";
import { Eyebrow } from "@/components/eyebrow";
import { TickGauge } from "@/components/tick-gauge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tooltip";

export interface ReseauTileProps {
  /** Where the tile leads — the réseau page. */
  to: string;
  /** Downstream speed at the last test, in Mbps. The dial reads this one. */
  downMbps: number;
  /** Upstream speed at the same test, in Mbps. */
  upMbps: number;
  /** Latency to the internet, in ms. */
  pingMs: number;
  /** When that test ran, written out — "il y a 2h". */
  testedWhen: string;
  /** Devices on the wifi, all networks together. */
  clients: number;
  /** Homelab CPU load, in percent. Absent when the box is not reporting. */
  cpuPct?: number;
  /** How long the homelab has been up, in days. */
  uptimeDays?: number;
  /** The line's ceiling — the dial reads the share of it. */
  maxMbps?: number;
  /** The line is holding. False turns the badge into a warning. */
  stable?: boolean;
}

/**
 * The network in one tile: the line speed on a dial, everything else quiet
 * underneath.
 *
 * One figure is promoted because that is the only one anybody checks — the rest
 * (upstream, ping, clients, homelab) is there to be found, not read, so it sits in
 * a footer of glyphs with a tooltip each.
 */
export function ReseauTile({
  to,
  downMbps,
  upMbps,
  pingMs,
  testedWhen,
  clients,
  cpuPct,
  uptimeDays,
  maxMbps = 500,
  stable = true,
}: ReseauTileProps) {
  return (
    <Card
      to={to}
      variant="glass"
      padding="sm"
      icon={<Wifi className="h-4.5 w-4.5" />}
      title="Réseau"
      trailing={
        <span
          className={
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 " +
            (stable ? "bg-success/15 text-success" : "bg-warm/15 text-warm")
          }
        >
          <Wifi className="h-3 w-3" />
          <span className="text-xs font-semibold">{stable ? "Stable" : "Instable"}</span>
        </span>
      }
    >
      <div className="relative flex flex-1 items-center justify-center">
        {/* Narrower than a dial usually wants: Card's header rule and padding take
            height the old tile did not, and the bento row is a fixed 12rem. */}
        <TickGauge
          value={downMbps}
          max={maxMbps}
          className="w-[68%] max-w-[180px] overflow-visible"
        />
        <div className="absolute inset-x-0 top-[44%] text-center">
          <p className="text-2xl leading-none tracking-tight tabular-nums">
            <CountUp to={downMbps} />
          </p>
          <Eyebrow size="xs" className="mt-1">
            Mbps ↓
          </Eyebrow>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-center gap-4 pt-1 text-xs text-foreground/75">
        <Tip label={`Débit montant au dernier test (${testedWhen}).`}>
          <span className="inline-flex items-center gap-1 tabular-nums">
            <ArrowUp className="h-3.5 w-3.5 text-muted-foreground" />
            {upMbps}
          </span>
        </Tip>
        <Tip label="Latence (ping) mesurée vers Internet.">
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Activity className="h-3.5 w-3.5 text-muted-foreground" />
            {pingMs} ms
          </span>
        </Tip>
        <Tip label="Appareils connectés au WiFi.">
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Wifi className="h-3.5 w-3.5 text-muted-foreground" />
            {clients}
          </span>
        </Tip>
        <Tip
          label={
            "Charge CPU du homelab" +
            (uptimeDays != null ? ` · en ligne depuis ${uptimeDays} jours` : "") +
            "."
          }
        >
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Server className="h-3.5 w-3.5 text-muted-foreground" />
            {cpuPct != null ? `${cpuPct}%` : "—"}
          </span>
        </Tip>
      </div>
    </Card>
  );
}

function Tip({ children, label }: { children: ReactNode; label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help">{children}</span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[240px] text-xs leading-snug">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
