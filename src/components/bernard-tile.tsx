import { Car, MapPin, Plug } from "lucide-react";
import { Card } from "@/components/card";
import { CountUp } from "@/components/count-up";
import { Eyebrow } from "@/components/eyebrow";
import { MapPinBg } from "@/components/map-pin-bg";

/** Where the car is, as the headline reads it. */
export type BernardState = "garage" | "driving" | "parked";

export interface BernardTileProps {
  /** Where the tile leads — the car's own page. */
  to: string;
  /** Battery, 0–100. Absent when the car has not reported — the figure reads "—". */
  charge?: number;
  /** Estimated range, km. */
  rangeKm?: number;
  /** Where charging stops, 0–100 — the tick on the bar. */
  chargeLimit?: number;
  /** Cable in. */
  pluggedIn: boolean;
  /** Home, on the move, or stopped somewhere. */
  state: BernardState;
  /** Where the car is. */
  location: string;
  /** What charging is doing, when it is plugged in — "En charge", "Terminée". */
  chargingLabel?: string;
  /** Cabin temperature, °C. */
  interior?: number;
  /** Outside temperature, °C. */
  exterior?: number;
}

const stateLabel: Record<BernardState, string> = {
  garage: "Au garage",
  driving: "En déplacement",
  parked: "En stationnement",
};

/** A figure the car has not reported. Never a zero — an empty battery is a fact. */
const Dash = () => <span className="opacity-40">—</span>;

/**
 * The car on the dashboard — the dark feature tile, with the map behind it.
 *
 * Two layouts rather than one that shrinks: on a phone the charge and the place
 * are all that fit, and squeezing the full version there truncated the location
 * to three characters. The gauge is the same in both, with the charge limit as a
 * tick — a battery at 80% is full when the limit says 80.
 */
export function BernardTile({
  to,
  charge,
  rangeKm,
  chargeLimit,
  pluggedIn,
  state,
  location,
  chargingLabel,
  interior,
  exterior,
}: BernardTileProps) {
  return (
    <Card to={to} variant="inverted" padding="sm" className="isolate">
      <MapPinBg className="pointer-events-none absolute inset-0 -z-10 h-full w-full text-background opacity-80" />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-1/2 rounded-b-[inherit] bg-gradient-to-t from-foreground via-foreground/70 to-transparent" />

      {/* Mobile compact layout */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between gap-2">
          <Eyebrow tone="current" className="opacity-60">
            Bernard
          </Eyebrow>
          <span
            className={
              "inline-flex items-center text-xs " + (pluggedIn ? "text-primary" : "opacity-60")
            }
          >
            <Plug className={"h-3.5 w-3.5 " + (pluggedIn ? "anim-breathe" : "")} />
          </span>
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-1">
          <span className="flex items-baseline gap-1">
            <span className="text-2xl tracking-tight">
              {charge != null ? <CountUp to={charge} /> : <Dash />}
            </span>
            <span className="text-base opacity-60">%</span>
          </span>
          {rangeKm != null && <span className="text-xs opacity-60">{rangeKm} km</span>}
        </div>
        <div className="relative mt-2 h-1 w-full overflow-hidden rounded-full bg-background/15">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${charge ?? 0}%` }}
          />
        </div>
        <p className="mt-3 inline-flex items-start gap-1 text-xs opacity-70">
          <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
          {stateLabel[state]}
        </p>
      </div>

      {/* sm+ full layout */}
      <div className="hidden h-full sm:flex sm:flex-col sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-background/10 text-background">
            <Car className="h-4.5 w-4.5 icon-hover anim-drift" />
          </span>
          <div className="min-w-0 flex-1">
            <Eyebrow tone="current" className="opacity-60">
              Bernard
            </Eyebrow>
            <p className="mt-1 text-lg">{stateLabel[state]}</p>
            <p className="mt-0.5 inline-flex items-center gap-1 text-xs opacity-60">
              <MapPin className="h-3 w-3" />
              {location}
            </p>
            {pluggedIn && chargingLabel && (
              <p className="mt-0.5 inline-flex items-center gap-1 text-xs opacity-60">
                <Plug className="h-3 w-3" />
                {chargingLabel}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-end gap-6">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl tracking-tight">
                {charge != null ? <CountUp to={charge} /> : <Dash />}
              </span>
              <span className="text-lg opacity-60">%</span>
            </div>
            <p className="text-xs opacity-60">
              {rangeKm != null ? `${rangeKm} km · ` : ""}limite{" "}
              {chargeLimit != null ? `${chargeLimit}%` : "—"}
            </p>
          </div>
          <div className="flex-1 pb-1">
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-background/15">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${charge ?? 0}%` }}
              />
              <div
                className="absolute top-0 h-full w-px bg-background/40"
                style={{ left: `${chargeLimit ?? 0}%` }}
              />
            </div>
            <div className="mt-3 flex items-center gap-3 text-xs opacity-70">
              <span className="inline-flex items-center gap-1">
                <Plug className={"h-3 w-3 " + (pluggedIn ? "text-primary anim-breathe" : "")} />
                {pluggedIn ? "Branchée" : "Débranchée"}
              </span>
              <span>
                · {interior != null ? `${interior}°` : "—"} int /{" "}
                {exterior != null ? `${exterior}°` : "—"} ext
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
