import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { AlertTriangle, ArrowRight, Droplet, Flame, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { Eyebrow } from "@/components/eyebrow";
import { TrendBadge, type TrendDirection } from "@/components/trend-badge";

/** Normal, or worth a look. The threshold is the caller's. */
export type MeterStatus = "normal" | "alert";

/** One meter's line on the tile. */
export interface EnergieMeterView {
  /** Daily figure with its unit, ready to show — "9,3 kWh/j". */
  value: string;
  /** A second figure to the right — the tank's autonomy, say. */
  sub?: string;
  trend?: TrendDirection;
  trendPct?: number;
  status: MeterStatus;
}

export interface EnergieTileProps {
  /** A monthly reading is overdue — the tile becomes the call to action instead. */
  due?: boolean;
  /** Where the tile leads when there is nothing to do. */
  to: string;
  /** Where the call to action leads when a reading is due. */
  saisieTo: string;
  /** The electricity line — a daily average and where it is heading. */
  electricity: EnergieMeterView;
  /** The water line. */
  water: EnergieMeterView;
  /** The tank line: a level rather than a rate, so it carries an autonomy in `sub`. */
  oil: EnergieMeterView & {
    /** Under the low-level threshold — the flame wriggles rather than breathes. */
    low?: boolean;
  };
}

/**
 * The house's three meters in one tile — and the one thing that can be *due*.
 *
 * A monthly reading nobody has entered is not a smaller version of the summary: it
 * is a different tile, because it asks for something. Everything else is a glance,
 * so each line carries a status dot and the badge shows only the direction — the
 * percentage lives on the Énergie page.
 */
export function EnergieTile({ due, to, saisieTo, electricity, water, oil }: EnergieTileProps) {
  if (due) {
    return (
      <Card variant="soft" padding="sm" as="div">
        <div className="flex items-start justify-between">
          <div>
            <Eyebrow tone="current" className="opacity-70">
              Énergie · à faire
            </Eyebrow>
            <p className="mt-1 text-lg">Relevé mensuel à saisir</p>
            <p className="mt-1 text-sm opacity-80">
              3 compteurs en attente — eau, électricité, mazout.
            </p>
          </div>
          <span className="relative grid h-9 w-9 place-items-center rounded-full bg-foreground/10">
            <Sparkles className="h-4 w-4 anim-breathe" />
          </span>
        </div>
        <Button
          asChild
          variant="inverted"
          className="mt-5 gap-1.5 rounded-full transition-transform hover:translate-x-0.5"
        >
          <Link to={saisieTo}>
            Saisir <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </Card>
    );
  }

  const alerts = [
    oil.status === "alert" && "Mazout faible",
    electricity.status === "alert" && "Élec. élevée",
    water.status === "alert" && "Eau élevée",
  ].filter((a): a is string => !!a);

  return (
    <Card
      to={to}
      variant="glass"
      padding="sm"
      icon={<Zap className="h-4.5 w-4.5" />}
      title="Énergie"
      trailing={
        alerts.length > 0 ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-warm/15 px-2 py-0.5 text-warm">
            <AlertTriangle className="h-3 w-3" />
            <span className="text-xs font-semibold">
              {alerts[0]}
              {alerts.length > 1 ? ` +${alerts.length - 1}` : ""}
            </span>
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-success/15 px-2 py-0.5 text-success">
            <Sparkles className="h-3 w-3" />
            <span className="text-xs font-semibold">OK</span>
          </span>
        )
      }
    >
      <div className="flex flex-1 flex-col gap-2">
        <MeterRow icon={<Zap className="h-4 w-4 anim-glow" />} label="Élec." meter={electricity} />
        <MeterRow icon={<Droplet className="h-4 w-4 anim-float" />} label="Eau" meter={water} />
        <MeterRow
          icon={
            <Flame className={"h-4 w-4 " + (oil.low ? "anim-wiggle text-warm" : "anim-breathe")} />
          }
          label="Mazout"
          meter={oil}
        />
      </div>
    </Card>
  );
}

function MeterRow({
  icon,
  label,
  meter,
}: {
  icon: ReactNode;
  label: string;
  meter: EnergieMeterView;
}) {
  const alert = meter.status === "alert";
  return (
    <div
      className={
        "flex flex-1 items-center gap-2 rounded-lg px-2.5 transition-colors " +
        (alert ? "bg-warm/10 ring-1 ring-warm/30" : "bg-secondary/60")
      }
    >
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-card text-foreground/80">
        {icon}
      </span>
      <Eyebrow size="xs" as="span" className="min-w-0 flex-1">
        {label}
      </Eyebrow>
      <span className="text-sm leading-none tabular-nums">{meter.value}</span>
      {meter.sub && <span className="text-xs tabular-nums text-muted-foreground">{meter.sub}</span>}
      {meter.trend && <TrendBadge trend={meter.trend} pct={meter.trendPct} hidePct size="sm" />}
      <StatusDot status={meter.status} />
    </div>
  );
}

function StatusDot({ status }: { status: MeterStatus }) {
  if (status === "alert") {
    return (
      <span className="relative inline-flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warm/50" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-warm" />
      </span>
    );
  }
  return <span className="h-2 w-2 rounded-full bg-success/70" />;
}
