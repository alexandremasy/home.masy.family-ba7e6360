import { Droplet, Sunrise, Sunset, Thermometer, Wind } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/dialog";
import { Eyebrow } from "@/components/eyebrow";
import { WeatherIcon } from "@/components/weather-icon";
import type { WeatherCond } from "@/lib/mock-data";

/** Today, in the detail the dialog needs. The tile itself reads only the first four. */
export interface WeatherTodayView {
  /** Where this is the weather of. */
  location: string;
  /** Which sky to draw. */
  cond: WeatherCond;
  /** Current temperature in °C. */
  tempC: number;
  /** The day's low and high, in °C. */
  minC: number;
  maxC: number;
  /** The sky, in words — "Éclaircies". */
  label: string;
  /** What it feels like, in °C. */
  feelsC: number;
  /** Rain expected, in mm, and how likely it is, in percent. */
  rainMm: number;
  rainProb: number;
  /** Wind, in km/h. */
  windKmh: number;
  /** Relative humidity, in percent. */
  humidity: number;
  /** Sun times, as clock times. */
  sunrise: string;
  sunset: string;
}

/** One day ahead. Short label, a sky, the two ends of the range, the rain risk. */
export interface WeatherForecastDay {
  /** Three letters — "Ven". Also the list key. */
  day: string;
  cond: WeatherCond;
  minC: number;
  maxC: number;
  rainProb: number;
}

export interface WeatherTileProps {
  /** Today, and what the dialog opens onto. Absent, the tile reads "Hors ligne". */
  today?: WeatherTodayView | null;
  /** The next days, in order. Empty, the dialog drops that section. */
  forecast?: WeatherForecastDay[];
}

/**
 * The weather, as a temperature you glance at — and a dialog for the rest.
 *
 * The tile has no card behind it on purpose: the sky is not a household reading
 * like the others, and giving it a surface made it compete with the rooms. It
 * still takes a full cell, so it floats into whatever hole the bento leaves.
 */
export function WeatherTile({ today, forecast = [] }: WeatherTileProps) {
  // No reading at all: the tile keeps its place rather than leaving a hole in the
  // mosaic, and says plainly that it has nothing — a stale temperature would lie.
  if (!today) {
    return (
      <div
        className="relative h-full w-full overflow-hidden rounded-2xl p-4 text-left"
        aria-label="Météo hors ligne"
      >
        <div className="flex items-start justify-between gap-2">
          <Eyebrow>Météo</Eyebrow>
          <WeatherIcon cond="cloud" className="h-6 w-6 text-foreground/30" animated={false} />
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl tracking-tight text-foreground opacity-40">—</span>
          <span className="text-sm text-muted-foreground">°</span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">Hors ligne</p>
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group relative h-full w-full overflow-hidden rounded-2xl p-4 text-left transition-colors hover:bg-secondary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Voir la météo détaillée"
        >
          <div className="flex items-start justify-between gap-2">
            <Eyebrow>{today.location}</Eyebrow>
            <WeatherIcon cond={today.cond} className="h-6 w-6 text-foreground/80" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl tracking-tight text-foreground">{today.tempC}</span>
            <span className="text-sm text-muted-foreground">°</span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {today.minC}° / {today.maxC}° · {today.label}
          </p>
        </button>
      </DialogTrigger>
      <WeatherDialog today={today} forecast={forecast} />
    </Dialog>
  );
}

function WeatherDialog({
  today: m,
  forecast,
}: {
  today: WeatherTodayView;
  forecast: WeatherForecastDay[];
}) {
  return (
    <DialogContent
      title={`Météo · ${m.location}`}
      className="duration-300 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-4 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:max-w-lg"
    >
      <div>
        <div className="flex items-start justify-between">
          <div>
            <Eyebrow>Aujourd'hui</Eyebrow>
            <p className="mt-1 text-lg">{m.label}</p>
          </div>
          <WeatherIcon cond={m.cond} className="h-10 w-10 text-foreground/80" />
        </div>
        <div className="mt-3 flex items-end gap-5">
          <div className="flex items-baseline gap-1">
            <span className="text-5xl tracking-tight">{m.tempC}</span>
            <span className="text-lg text-muted-foreground">°C</span>
          </div>
          <p className="pb-1 text-xs text-muted-foreground">
            Ressenti {m.feelsC}° · {m.minC}° / {m.maxC}°
          </p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-4">
          <span className="inline-flex items-center gap-1.5">
            <Droplet className="h-3.5 w-3.5" />
            {m.rainMm} mm · {m.rainProb}%
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Wind className="h-3.5 w-3.5" />
            {m.windKmh} km/h
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sunrise className="h-3.5 w-3.5" />
            {m.sunrise}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sunset className="h-3.5 w-3.5" />
            {m.sunset}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Thermometer className="h-3.5 w-3.5" />
            Humidité {m.humidity}%
          </span>
        </div>
      </div>

      {forecast.length > 0 && (
        <div>
          <Eyebrow className="mb-2">Prochains jours</Eyebrow>
          <div className="grid grid-cols-5 gap-1.5">
            {forecast.map((d) => (
              <div
                key={d.day}
                className="flex flex-col items-center rounded-xl bg-secondary/60 p-2 text-center"
              >
                <Eyebrow size="xs" as="span">
                  {d.day}
                </Eyebrow>
                <WeatherIcon cond={d.cond} className="my-1.5 h-5 w-5" />
                <span className="text-sm leading-tight">{d.maxC}°</span>
                <span className="text-2xs tabular-nums text-muted-foreground">{d.minC}°</span>
                <span className="mt-1 inline-flex items-center gap-0.5 text-2xs text-muted-foreground">
                  <Droplet className="h-2.5 w-2.5" />
                  {d.rainProb}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </DialogContent>
  );
}
