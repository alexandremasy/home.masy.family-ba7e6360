import { createFileRoute, Link } from "@tanstack/react-router";
import { Tile } from "@/components/Card";
import { CountUp } from "@/components/CountUp";
import { MapPinBg } from "@/components/MapPinBg";
import { PMCBag } from "@/components/PMCBag";
import { RoomIcon } from "@/components/RoomIcon";
import { WeatherIcon } from "@/components/WeatherIcon";

import { rooms, tesla, reseau, energie, calendrier, meteo, roomDetails, type Room } from "@/lib/mock-data";
import { people, nextBirthday, upcomingAge, daysUntil, initialPlan, dishById, iso, addDays, frLongDay, TODAY } from "@/lib/maison-data";
import { Lightbulb, Wind, Wifi, Car, Plug, ArrowRight, ArrowUp, Activity, Droplet, Zap, Flame, MapPin, Sparkles, AlertTriangle, TrendingDown, TrendingUp, Minus, Sun, Moon, Sunrise, Sunset, Thermometer, Server, Cast, Cake, UtensilsCrossed } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/Eyebrow";

export const Route = createFileRoute("/_app/")({
  // Dashboard is rendered by the parent _app layout (so it stays visible
  // behind child-route modals). The index route itself renders nothing.
  component: () => null,
  head: () => ({
    meta: [
      { title: "Maison — Cockpit" },
      { name: "description", content: "Tableau de bord domestique : pièces, Bernard, réseau et énergie en un coup d'œil." },
    ],
  }),
});

export function Dashboard() {
  const visibleRooms = rooms.filter((r) => r.hasSensors);
  // A room nobody is in, with everything off, doesn't deserve a slot of its own.
  const isIdle = (r: Room) => !r.lightsOn && !r.occupied;
  const activeRooms = visibleRooms.filter((r) => !isIdle(r));
  const idleRooms = visibleRooms.filter(isIdle);
  const now = new Date();
  const greeting = now.getHours() < 12 ? "Bonjour" : now.getHours() < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <div className="space-y-4 pt-16">
      {/* Header — greeting + two compact info cards. Kept OUT of grid-bento: the
          bento rows have a FIXED height, so short tiles placed there would leave a
          tall empty band beneath them. In normal flow they size to content, and the
          rooms grid sits right below. */}
      <header className="stagger space-y-8">
        <div className="flex flex-col items-start px-4">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {greeting}.
          </h1>
          <RepasLine />
        </div>

        {/* Poubelle + anniversaire — a third the height of a bento tile; same width
            as one column on mobile (capped so they stay small on wider screens). */}
        <div className="grid grid-cols-2 gap-3 sm:max-w-md">
          <Tile span={1} tone="default" className="relative flex min-h-[3rem] items-center overflow-hidden !rounded-full !border-0 !bg-card/70 !px-5 !py-2 backdrop-blur-md">
            <PMCBag className="pointer-events-none absolute -right-2 -top-1 h-[150%] w-auto opacity-90" />
            <div className="relative min-w-0">
              <p className="truncate font-serif text-base font-semibold leading-tight">{calendrier.poubelleToday.type}</p>
              <p className="text-2xs opacity-80">Auj. · avant {calendrier.poubelleToday.time}</p>
            </div>
          </Tile>

          <BirthdayTile />
        </div>
      </header>

      <div className="grid-bento stagger">

        {/* PRIORITY 2 — Rooms. Idle ones share a single reduced slot (below). */}
        {activeRooms.flatMap((room) => {
          if (room.key === "salon") {
            return [
              <SalonTile key="salon-v1" room={room} variant="spotify" />,
              <SalonTile key="salon-v2" room={room} variant="netflix" />,
              <SalonTile key="salon-v3" room={room} variant="idle" />,
            ];
          }
          const bureauCls = room.key === "bureau" ? "sm:col-span-2" : "";
          return [
            <Tile key={room.key} span={1} to={`/room/${room.key}`} className={"flex flex-col !p-4 " + bureauCls}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className={"grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors " + (room.occupied ? "bg-success/15 text-success" : room.lightsOn ? "bg-mustard/20 text-mustard" : "bg-secondary text-muted-foreground")}>
                    <RoomIcon icon={room.icon} className="h-4.5 w-4.5 icon-hover" />
                  </span>
                  <div>
                    <p className="font-serif text-base font-semibold">{room.name}</p>
                  </div>
                </div>
                {bureauCls && <RoomStatus on={!!room.lightsOn} />}
              </div>

              {typeof room.temperature === "number" ? (
                <p className="mt-6 font-serif text-4xl tracking-tight">
                  <CountUp to={room.temperature} decimals={1} /><span className="text-base text-muted-foreground">°C</span>
                </p>
              ) : (
                <div className="mt-6 h-[2.75rem]" aria-hidden />
              )}

              <div className="mt-auto pt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <span className={"inline-flex items-center gap-1.5 transition-colors " + (room.lightsOn ? "text-mustard" : "")}>
                  <Lightbulb className={"h-3.5 w-3.5 " + (room.lightsOn ? "anim-breathe text-mustard" : "")} />
                  {room.lightsOn ? "Allumé" : "Éteint"}
                </span>
                {room.climate && (
                  <span className="inline-flex items-center gap-1.5">
                    <Wind className={"h-3.5 w-3.5 " + (room.climate.on ? "text-primary" : "")} />
                    {room.climate.on ? `${room.climate.setpoint}°` : "Auto"}
                  </span>
                )}
              </div>
            </Tile>,
          ];
        })}

        {/* Idle rooms — one shared slot, reduced */}
        {idleRooms.length > 0 && <IdleRoomsTile rooms={idleRooms} />}

        {/* Weather — single cell, no background, floats into any hole */}
        <WeatherTile />

        {/* Énergie */}
        {energie.monthlyDue ? (
          <Tile span={2} tone="warm">
            <div className="flex items-start justify-between">
              <div>
                <Eyebrow tone="current" className="opacity-70">Énergie · à faire</Eyebrow>
                <p className="mt-1 font-serif text-lg">Relevé mensuel à saisir</p>
                <p className="mt-1 text-sm opacity-80">3 compteurs en attente — eau, électricité, mazout.</p>
              </div>
              <span className="relative grid h-9 w-9 place-items-center rounded-full bg-foreground/10">
                <Sparkles className="h-4 w-4 anim-breathe" />
              </span>
            </div>
            <Button asChild variant="inverted" className="mt-5 gap-1.5 rounded-full transition-transform hover:translate-x-0.5">
              <Link to="/energie/saisie">Saisir <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </Tile>
        ) : (
          <Tile span={2} to="/energie" className="flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Eyebrow>Énergie</Eyebrow>
                <p className="mt-1 font-serif text-lg">Vue d'ensemble</p>
              </div>
              {(() => {
                const alerts: string[] = [];
                if (energie.oil.status === "alert") alerts.push("Mazout faible");
                if (energie.electricity.status === "alert") alerts.push("Élec. élevée");
                if (energie.water.status === "alert") alerts.push("Eau élevée");
                const anyAlert = alerts.length > 0;
                return anyAlert ? (
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-warm/15 px-2 py-0.5 text-warm">
                    <AlertTriangle className="h-3 w-3" />
                    <span className="text-xs font-semibold">{alerts[0]}{alerts.length > 1 ? ` +${alerts.length - 1}` : ""}</span>
                  </span>
                ) : (
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-success/15 px-2 py-0.5 text-success">
                    <Sparkles className="h-3 w-3" />
                    <span className="text-xs font-semibold">OK</span>
                  </span>
                );
              })()}
            </div>
            <div className="mt-4 flex flex-1 flex-col gap-2">
              <EnergieRow
                icon={<Zap className="h-4 w-4 anim-glow" />}
                label="Élec."
                value={`${energie.electricity.dailyKWh} kWh/j`}
                trend={energie.electricity.trend}
                trendPct={energie.electricity.trendPct}
                status={energie.electricity.status}
              />
              <EnergieRow
                icon={<Droplet className="h-4 w-4 anim-float" />}
                label="Eau"
                value={`${energie.water.dailyM3} m³/j`}
                trend={energie.water.trend}
                trendPct={energie.water.trendPct}
                status={energie.water.status}
              />
              <EnergieRow
                icon={<Flame className={"h-4 w-4 " + (energie.oil.tankPct < 25 ? "anim-wiggle text-warm" : "anim-breathe")} />}
                label="Mazout"
                value={`${energie.oil.tankPct}%`}
                sub={`~${energie.oil.autonomyDays} j`}
                status={energie.oil.status}
              />
            </div>
          </Tile>
        )}

        {/* PRIORITY 3 — Bernard (compact) */}
        <Tile span={2} to="/tesla" tone="dark" className="relative isolate !col-span-1 sm:!col-span-2">
          <MapPinBg className="pointer-events-none absolute inset-0 -z-10 h-full w-full text-background opacity-80" />
          <span className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-1/2 rounded-b-[inherit] bg-gradient-to-t from-foreground via-foreground/70 to-transparent" />

          {/* Mobile compact layout */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between gap-2">
              <Eyebrow tone="current" className="opacity-60">Bernard</Eyebrow>
              <span className={"inline-flex items-center gap-1 text-xs " + (tesla.pluggedIn ? "text-primary" : "opacity-60")}>
                <Plug className={"h-3 w-3 " + (tesla.pluggedIn ? "anim-breathe" : "")} />
                {tesla.pluggedIn ? "Branchée" : "Débranchée"}
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-serif text-4xl tracking-tight"><CountUp to={tesla.charge} /></span>
              <span className="text-base opacity-60">%</span>
              <span className="ml-2 text-xs opacity-60">· {tesla.rangeKm} km</span>
            </div>
            <div className="relative mt-2 h-1 w-full overflow-hidden rounded-full bg-background/15">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${tesla.charge}%` }} />
            </div>
            <p className="mt-3 inline-flex items-center gap-1 text-xs opacity-70">
              <MapPin className="h-3 w-3" />{tesla.location}
            </p>
          </div>

          {/* sm+ original layout */}
          <div className="hidden h-full sm:flex sm:flex-col sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-background/10 text-background">
                <Car className="h-4.5 w-4.5 icon-hover anim-drift" />
              </span>
              <div className="min-w-0 flex-1">
                <Eyebrow tone="current" className="opacity-60">Bernard</Eyebrow>
                <p className="mt-1 font-serif text-lg">{tesla.inGarage ? "Au garage" : "En déplacement"}</p>
                <p className="mt-0.5 inline-flex items-center gap-1 text-xs opacity-60">
                  <MapPin className="h-3 w-3" />{tesla.location}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-end gap-6">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-5xl tracking-tight"><CountUp to={tesla.charge} /></span>
                  <span className="text-lg opacity-60">%</span>
                </div>
                <p className="text-xs opacity-60">{tesla.rangeKm} km · limite {tesla.chargeLimit}%</p>
              </div>
              <div className="flex-1 pb-1">
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-background/15">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${tesla.charge}%` }} />
                  <div className="absolute top-0 h-full w-px bg-background/40" style={{ left: `${tesla.chargeLimit}%` }} />
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs opacity-70">
                  <span className="inline-flex items-center gap-1">
                    <Plug className={"h-3 w-3 " + (tesla.pluggedIn ? "text-primary anim-breathe" : "")} />
                    {tesla.pluggedIn ? "Branchée" : "Débranchée"}
                  </span>
                  <span>· {tesla.interior}° int / {tesla.exterior}° ext</span>
                </div>
              </div>
            </div>
          </div>
        </Tile>

        {/* PRIORITY 3 — Réseau: the speed as a dial, everything else quiet */}
        <ReseauTile />

      </div>

    </div>
  );
}


/**
 * The next birthday — an event of row 1, same shape as the PMC notice beside it.
 * What matters first is WHOSE birthday it is; the age comes second.
 */
function BirthdayTile() {
  const sorted = [...people]
    .map((p) => ({ p, days: daysUntil(nextBirthday(p)) }))
    .sort((a, b) => a.days - b.days);
  const [first] = sorted;
  if (!first) return null;

  const today = first.days === 0;
  const when = today ? "Auj." : first.days === 1 ? "Demain" : `Dans ${first.days} j`;

  return (
    <Tile span={1} to="/anniversaires" tone="default" className="relative flex min-h-[3rem] items-center overflow-hidden !rounded-full !border-0 !bg-card/70 !px-5 !py-2 backdrop-blur-md">
      <Cake className={"pointer-events-none absolute -right-3 -top-2 h-16 w-16 " + (today ? "opacity-15" : "opacity-[0.06]")} />
      <div className="relative min-w-0">
        <p className="break-words font-serif text-base font-semibold leading-tight">{first.p.name} a {upcomingAge(first.p)} ans</p>
        <p className={"text-2xs " + (today ? "opacity-80" : "text-muted-foreground")}>
          {when}
        </p>
      </div>
    </Tile>
  );
}

/**
 * What we eat, read as a sentence rather than a list.
 * The plan is a sliding window that starts tomorrow (MAISON-BRIEF), so today is
 * usually empty — we show the first day that actually has meals, then tease the next.
 */
function RepasTile() {
  const dayPlan = (d: Date) => {
    const key = iso(d);
    const at = (slot: "midi" | "soir") => {
      const e = initialPlan.find((x) => x.date === key && x.slot === slot);
      return e ? dishById(e.dishId)?.name ?? null : null;
    };
    return { midi: at("midi"), soir: at("soir") };
  };

  const label = (offset: number) =>
    offset === 0 ? "Aujourd'hui" : offset === 1 ? "Demain" : offset === 2 ? "Après-demain" : frLongDay(addDays(TODAY, offset));

  // first day with something planned, then the one after it
  const planned = [0, 1, 2, 3]
    .map((o) => ({ o, ...dayPlan(addDays(TODAY, o)) }))
    .filter((d) => d.midi || d.soir);
  const first = planned[0];
  const next = planned[1];

  return (
    <Tile span={2} to="/repas" className="flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <Eyebrow>Repas</Eyebrow>
        <UtensilsCrossed className="h-4.5 w-4.5 text-muted-foreground" />
      </div>

      {first ? (
        <>
          <p className="mt-3 font-serif text-lg leading-snug">
            {label(first.o)}
            {first.midi && (
              <>
                , <span className="text-foreground">{first.midi}</span>
                <span className="text-muted-foreground"> à midi</span>
              </>
            )}
            {first.soir && (
              <>
                {first.midi ? " et " : ", "}
                <span className="text-foreground">{first.soir}</span>
                <span className="text-muted-foreground"> le soir</span>
              </>
            )}
            <span className="text-muted-foreground">.</span>
          </p>

          {next && (
            <p className="mt-auto pt-3 text-xs text-muted-foreground">
              Puis {label(next.o).toLowerCase()} · {next.midi ?? next.soir}
            </p>
          )}
        </>
      ) : (
        <p className="mt-3 font-serif text-lg leading-snug text-muted-foreground">Rien de planifié pour l'instant.</p>
      )}
    </Tile>
  );
}

/**
 * Rooms that are off and empty. They give up their own slot and share one — but each
 * stays its own card, with its own edge. A group would erase the fact they're separate rooms.
 */
function IdleRoomsTile({ rooms: idle }: { rooms: Room[] }) {
  return (
    <div className="col-span-2 flex h-full flex-col gap-2">
      {idle.map((r) => (
        <Link
          key={r.key}
          to={`/room/${r.key}`}
          className="group flex flex-1 items-center gap-2.5 rounded-2xl border-[3px] border-border/50 px-3 transition-colors hover:border-border hover:bg-secondary/30"
        >
          <RoomIcon icon={r.icon} className="h-4 w-4 shrink-0 text-muted-foreground icon-hover" />
          <span className="min-w-0 flex-1 truncate font-serif text-sm">{r.name}</span>
          {typeof r.temperature === "number" && (
            <span className="shrink-0 font-serif text-sm tabular-nums text-muted-foreground">{r.temperature}°</span>
          )}
        </Link>
      ))}
    </div>
  );
}

/**
 * A dial of ticks — the value fills the arc up to its share of `max`.
 * Reused idea: the same control reads a tank level or a line speed.
 */
function TickGauge({ value, max, className = "" }: { value: number; max: number; className?: string }) {
  // Many hairline ticks, a wide arc: the density is what makes it read as an instrument.
  const N = 56, cx = 100, cy = 88, r = 78;
  const pct = Math.min(1, Math.max(0, value / max));
  const ticks = Array.from({ length: N }, (_, i) => {
    const t = i / (N - 1);
    const a = Math.PI - t * Math.PI;
    const on = t <= pct;
    const len = on ? 14 : 7;
    return {
      key: i, on,
      x1: cx + r * Math.cos(a), y1: cy - r * Math.sin(a),
      x2: cx + (r - len) * Math.cos(a), y2: cy - (r - len) * Math.sin(a),
    };
  });
  return (
    <svg viewBox="0 0 200 96" className={className} aria-hidden>
      {ticks.map((t) => (
        <line key={t.key} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
          strokeWidth={t.on ? 1.6 : 1} strokeLinecap="round"
          className={t.on ? "stroke-primary" : "stroke-border"}
          opacity={t.on ? 1 : 0.7} />
      ))}
    </svg>
  );
}

/** Réseau — the line speed on a dial; ping, clients and homelab stay quiet underneath. */
function ReseauTile() {
  const st = reseau.internet.lastSpeedtest;
  const clients = reseau.wifi1.clients + reseau.wifi2.clients;
  const MAX = 500; // the line's ceiling — the dial reads the share of it

  return (
    <Tile span={2} to="/securite/reseau" className="flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <Eyebrow>Réseau</Eyebrow>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-success/15 px-2 py-0.5 text-success">
          <Wifi className="h-3 w-3" />
          <span className="text-xs font-semibold">Stable</span>
        </span>
      </div>

      <div className="relative mt-1 flex flex-1 items-center justify-center">
        <TickGauge value={st.downMbps} max={MAX} className="w-[78%] max-w-[220px] overflow-visible" />
        <div className="absolute inset-x-0 top-[44%] text-center">
          <p className="font-serif text-4xl leading-none tracking-tight tabular-nums">
            <CountUp to={st.downMbps} />
          </p>
          <Eyebrow size="xs" className="mt-1">Mbps ↓</Eyebrow>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-center gap-4 pt-1 text-xs text-foreground/75">
        <Tip label={`Débit montant au dernier test (${st.when}).`}>
          <span className="inline-flex items-center gap-1 tabular-nums"><ArrowUp className="h-3.5 w-3.5 text-muted-foreground" />{st.upMbps}</span>
        </Tip>
        <Tip label="Latence (ping) mesurée vers Internet.">
          <span className="inline-flex items-center gap-1 tabular-nums"><Activity className="h-3.5 w-3.5 text-muted-foreground" />{st.pingMs} ms</span>
        </Tip>
        <Tip label={`Appareils connectés au WiFi (${reseau.wifi1.ssid} + ${reseau.wifi2.ssid}).`}>
          <span className="inline-flex items-center gap-1 tabular-nums"><Wifi className="h-3.5 w-3.5 text-muted-foreground" />{clients}</span>
        </Tip>
        <Tip label={`Charge CPU du homelab · en ligne depuis ${reseau.homelab.uptimeDays} jours.`}>
          <span className="inline-flex items-center gap-1 tabular-nums"><Server className="h-3.5 w-3.5 text-muted-foreground" />{reseau.homelab.cpu}%</span>
        </Tip>
      </div>
    </Tile>
  );
}

type SalonVariant = "spotify" | "netflix" | "idle";

function SalonTile({ room, variant }: { room: typeof rooms[number]; variant: SalonVariant }) {
  return (
    <Tile span={2} to={`/room/${room.key}`} className="relative flex flex-col !p-4">

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className={"grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors " + (room.occupied ? "bg-success/15 text-success" : "bg-secondary text-muted-foreground")}>
            <RoomIcon icon={room.icon} className="h-4.5 w-4.5 icon-hover" />
          </span>
          <div>
            <p className="font-serif text-base font-semibold">{room.name}</p>
          </div>
        </div>
        <RoomStatus on={!!room.lightsOn} />
      </div>

      {variant !== "idle" && (
        <div className="mt-5 flex items-center gap-2.5 rounded-xl bg-secondary/60 p-2.5">
          {variant === "spotify" && (
            <>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[oklch(0.72_0.18_150)]/15 text-[oklch(0.55_0.18_150)]" aria-hidden>
                <SpotifyGlyph className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-base leading-tight">Linked</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">Bonobo · Spotify</p>
              </div>
              <EqBars />
            </>
          )}

          {variant === "netflix" && (
            <>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[oklch(0.32_0.18_25)] text-white" aria-hidden>
                <span className="font-serif text-sm font-semibold leading-none">N</span>
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-base leading-tight">Dark · S2E4</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">Netflix</p>
              </div>
              <EqBars />
            </>
          )}
        </div>
      )}

      <div className="mt-auto pt-3 flex items-center gap-3 text-xs text-muted-foreground">
        <span className={"inline-flex items-center gap-1.5 transition-colors " + (room.lightsOn ? "text-mustard" : "")}>
          <Lightbulb className={"h-3.5 w-3.5 " + (room.lightsOn ? "anim-breathe text-mustard" : "")} />
          {room.lightsOn ? "Allumé" : "Éteint"}
        </span>
        {variant === "idle" && (
          <span className="inline-flex items-center gap-1.5">
            <Cast className="h-3.5 w-3.5" />
            Chromecast en veille
          </span>
        )}
      </div>
    </Tile>
  );
}

function EqBars() {
  return (
    <span className="flex items-end gap-0.5 pb-1" aria-hidden>
      <span className="eq-bar h-3 w-0.5 rounded-full bg-foreground/70" style={{ animationDelay: "0ms" }} />
      <span className="eq-bar h-4 w-0.5 rounded-full bg-foreground/70" style={{ animationDelay: "150ms" }} />
      <span className="eq-bar h-2.5 w-0.5 rounded-full bg-foreground/70" style={{ animationDelay: "300ms" }} />
    </span>
  );
}

function SpotifyGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.6 14.4a.7.7 0 0 1-.96.23c-2.63-1.6-5.94-1.97-9.84-1.07a.7.7 0 1 1-.31-1.36c4.27-.98 7.93-.56 10.88 1.24.33.2.43.64.23.96zm1.23-2.74a.88.88 0 0 1-1.2.29c-3.01-1.85-7.6-2.39-11.16-1.31a.88.88 0 1 1-.51-1.68c4.07-1.24 9.13-.64 12.59 1.49.41.25.54.79.28 1.21zm.11-2.86c-3.61-2.14-9.57-2.34-13.02-1.29a1.05 1.05 0 1 1-.61-2.01c3.96-1.2 10.54-.97 14.7 1.5a1.05 1.05 0 1 1-1.07 1.8z"/>
    </svg>
  );
}

function RoomStatus({ on }: { on: boolean }) {
  return (
    <span className={"h-2.5 w-2.5 rounded-full " + (on ? "bg-mustard" : "bg-muted-foreground/25")} />
  );
}

function NetBlock({
  icon, label, value, sub, foot, ok = true,
}: { icon: React.ReactNode; label: string; value: React.ReactNode; sub: string; foot: string; ok?: boolean }) {
  return (
    <div className="rounded-xl bg-secondary/60 p-2.5 sm:p-3 transition-colors min-w-0">
      <div className="flex items-center justify-between gap-1">
        <div className="flex min-w-0 items-center gap-1.5 text-xs uppercase tracking-eyebrow text-muted-foreground sm:text-xs">
          {icon}<span className="truncate">{label}</span>
        </div>
        <span className={"h-2 w-2 rounded-full " + (ok ? "bg-success/70" : "bg-muted-foreground/40")} />
      </div>
      <span className="mt-2 flex items-baseline gap-1 font-serif text-lg leading-none sm:text-lg tabular-nums">
        {value}
      </span>
      <p className="mt-1.5 truncate text-xs text-muted-foreground">{sub}</p>
      <Eyebrow tone="current" size="xs" className="mt-1 truncate text-muted-foreground/80">{foot}</Eyebrow>
    </div>
  );
}

function StatusDot({ status }: { status: "normal" | "alert" }) {
  if (status === "alert") {
    return (
      <span className="relative inline-flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-warm/50 animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-warm" />
      </span>
    );
  }
  return <span className="h-2 w-2 rounded-full bg-success/70" />;
}

function BlockShell({
  status, icon, label, children,
}: { status: "normal" | "alert"; icon: React.ReactNode; label: string; children: React.ReactNode }) {
  const alert = status === "alert";
  return (
    <div className={"rounded-xl p-2.5 sm:p-3 transition-colors min-w-0 " + (alert ? "bg-warm/10 ring-1 ring-warm/30" : "bg-secondary/60")}>
      <div className="flex items-center justify-between gap-1">
        <div className="flex min-w-0 items-center gap-1.5 text-xs uppercase tracking-eyebrow text-muted-foreground sm:text-xs">
          {icon}<span className="truncate">{label}</span>
        </div>
        <StatusDot status={status} />
      </div>
      {children}
    </div>
  );
}

function Tip({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild><span className="cursor-help">{children}</span></TooltipTrigger>
      <TooltipContent side="top" className="max-w-[240px] text-xs leading-snug">{label}</TooltipContent>
    </Tooltip>
  );
}

function TrendBadge({ trend, pct, hidePct }: { trend: "up" | "down" | "stable"; pct?: number; hidePct?: boolean }) {
  const Icon = trend === "down" ? TrendingDown : trend === "up" ? TrendingUp : Minus;
  const tone = trend === "down" ? "text-success" : trend === "up" ? "text-mustard" : "text-muted-foreground";
  return (
    <span className={"inline-flex items-center gap-0.5 text-xs " + tone}>
      <Icon className="h-3.5 w-3.5" />
      {!hidePct && (pct !== undefined ? `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%` : "stable")}
    </span>
  );
}

function ElecBlock() {
  const e = energie.electricity;
  return (
    <BlockShell status={e.status} icon={<Zap className="h-3.5 w-3.5 anim-glow sm:h-4 sm:w-4" />} label="Élec.">
      <Tip label="Consommation électrique moyenne du jour, en kilowattheures.">
        <span className="mt-2 flex items-baseline gap-1">
          <span className="font-serif text-lg leading-none sm:text-lg">{e.dailyKWh}</span>
          <span className="text-xs text-muted-foreground">kWh/j</span>
        </span>
      </Tip>
      <Tip label="Variation comparée à la moyenne des 90 derniers jours.">
        <span className="mt-1.5 flex items-center gap-1.5">
          <TrendBadge trend={e.trend} pct={e.trendPct} />
          <span className="hidden text-xs text-muted-foreground sm:inline">vs 90j</span>
        </span>
      </Tip>
      <Tip label="Total consommé sur le mois en cours.">
        <p className="mt-2 text-xs tabular-nums text-muted-foreground">{e.monthKWh} kWh ce mois</p>
      </Tip>
    </BlockShell>
  );
}

function WaterBlock() {
  const w = energie.water;
  const label = w.trend === "stable" ? "stable" : w.trend === "down" ? "baisse" : "hausse";
  return (
    <BlockShell status={w.status} icon={<Droplet className="h-3.5 w-3.5 anim-float sm:h-4 sm:w-4" />} label="Eau">
      <Tip label="Consommation d'eau moyenne du jour, en mètres cubes.">
        <span className="mt-2 flex items-baseline gap-1">
          <span className="font-serif text-lg leading-none sm:text-lg">{w.dailyM3}</span>
          <span className="text-xs text-muted-foreground">m³/j</span>
        </span>
      </Tip>
      <Tip label="Équivalent en litres pour la même journée.">
        <p className="mt-1 text-xs tabular-nums text-muted-foreground">{w.dailyL} L</p>
      </Tip>
      <Tip label="Tendance comparée à la période précédente.">
        <span className="mt-2 flex items-center gap-1.5">
          <TrendBadge trend={w.trend} pct={w.trend === "stable" ? undefined : w.trendPct} hidePct />
          <span className="text-xs text-muted-foreground">{label}</span>
        </span>
      </Tip>
    </BlockShell>
  );
}

function OilBlock() {
  const o = energie.oil;
  const low = o.tankPct < 25;
  return (
    <BlockShell status={o.status} icon={<Flame className={"h-3.5 w-3.5 sm:h-4 sm:w-4 " + (low ? "anim-wiggle text-warm" : "anim-breathe")} />} label="Mazout">
      <Tip label={`Niveau actuel de la cuve à mazout (${o.tankLiters} L restants).`}>
        <span className="mt-2 flex items-baseline gap-1">
          <span className="font-serif text-lg leading-none sm:text-lg">{o.tankPct}<span className="text-xs text-muted-foreground">%</span></span>
          <span className="hidden text-xs tabular-nums text-muted-foreground sm:inline">· {o.tankLiters} L</span>
        </span>
      </Tip>
      <Tip label={`Niveau visualisé : ${o.tankPct}% de la capacité totale.`}>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className={"h-full rounded-full transition-all duration-700 " + (low ? "bg-warm" : "bg-primary")} style={{ width: `${o.tankPct}%` }} />
        </div>
      </Tip>
      <div className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <Tip label="Consommation cumulée des 30 derniers jours.">
          <span className="tabular-nums">{o.last30dLiters} L/30j</span>
        </Tip>
        <Tip label="Autonomie estimée à ce rythme de consommation.">
          <span className={"tabular-nums " + (low ? "font-semibold text-warm" : "")}>~{o.autonomyDays} j</span>
        </Tip>
      </div>
    </BlockShell>
  );
}

/** Weather — no background, as before; but it takes a full room-sized cell, not a half. */
function WeatherTile() {
  const m = meteo.today;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group relative col-span-2 h-full overflow-hidden rounded-2xl p-4 text-left transition-colors hover:bg-secondary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Voir la météo détaillée"
        >
          <div className="flex items-start justify-between gap-2">
            <Eyebrow>{m.location}</Eyebrow>
            <WeatherIcon cond={m.cond} className="h-6 w-6 text-foreground/80" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-serif text-3xl tracking-tight text-foreground">{m.tempC}</span>
            <span className="text-sm text-muted-foreground">°</span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{m.minC}° / {m.maxC}° · {m.label}</p>
        </button>
      </DialogTrigger>
      <WeatherDialog />
    </Dialog>
  );
}

/**
 * What we eat today — a small menu under the greeting. Each meal reads with its slot
 * glyph (sun = midi, moon = soir) and the dish in serif; quiet, but worked.
 */
function RepasLine() {
  const dayPlan = (d: Date) => {
    const key = iso(d);
    const at = (slot: "midi" | "soir") => {
      const e = initialPlan.find((x) => x.date === key && x.slot === slot);
      return e ? dishById(e.dishId)?.name ?? null : null;
    };
    return { midi: at("midi"), soir: at("soir") };
  };

  const today = dayPlan(TODAY);
  const dateLabel = TODAY.toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long" });

  return (
    <Link
      to="/repas"
      aria-label={`Repas du ${dateLabel}`}
      className="group mt-8 block w-full max-w-md min-w-0 py-0.5"
    >
      <Eyebrow tone="current" size="xs" as="span" className="block text-muted-foreground">{dateLabel}</Eyebrow>

      {today.midi || today.soir ? (
        <div className="mt-2 space-y-1.5">
          {today.midi && <MealRow icon={<Sun className="h-3.5 w-3.5 text-mustard" />} name={today.midi} />}
          {today.soir && <MealRow icon={<Moon className="h-3.5 w-3.5 text-primary" />} name={today.soir} />}
        </div>
      ) : (
        <p className="mt-2 text-sm italic text-muted-foreground/60">Rien de prévu</p>
      )}
    </Link>
  );
}

/** One meal line — slot glyph then the dish, truncated so long names never break the grid. */
function MealRow({ icon, name }: { icon: React.ReactNode; name: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="shrink-0">{icon}</span>
      <span className="min-w-0 truncate font-serif text-sm leading-tight text-muted-foreground">{name}</span>
    </div>
  );
}

function WeatherDialog() {
  const m = meteo.today;
  return (
      <DialogContent className="sm:max-w-lg duration-300 data-[state=open]:slide-in-from-top-4 data-[state=closed]:slide-out-to-top-2 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Météo · {m.location}</DialogTitle>
        </DialogHeader>

        {/* Today */}
        <div className="px-1">
          <div className="flex items-start justify-between">
            <div>
              <Eyebrow>Aujourd'hui</Eyebrow>
              <p className="mt-1 font-serif text-lg">{m.label}</p>
            </div>
            <WeatherIcon cond={m.cond} className="h-10 w-10 text-foreground/80" />
          </div>
          <div className="mt-3 flex items-end gap-5">
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-5xl tracking-tight">{m.tempC}</span>
              <span className="text-lg text-muted-foreground">°C</span>
            </div>
            <p className="pb-1 text-xs text-muted-foreground">
              Ressenti {m.feelsC}° · {m.minC}° / {m.maxC}°
            </p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-4">
            <span className="inline-flex items-center gap-1.5"><Droplet className="h-3.5 w-3.5" />{m.rainMm} mm · {m.rainProb}%</span>
            <span className="inline-flex items-center gap-1.5"><Wind className="h-3.5 w-3.5" />{m.windKmh} km/h</span>
            <span className="inline-flex items-center gap-1.5"><Sunrise className="h-3.5 w-3.5" />{m.sunrise}</span>
            <span className="inline-flex items-center gap-1.5"><Sunset className="h-3.5 w-3.5" />{m.sunset}</span>
            <span className="inline-flex items-center gap-1.5"><Thermometer className="h-3.5 w-3.5" />Humidité {m.humidity}%</span>
          </div>
        </div>

        {/* Forecast */}
        <div>
          <Eyebrow className="mb-2">Prochains jours</Eyebrow>
          <div className="grid grid-cols-5 gap-1.5">
            {meteo.forecast.map((d) => (
              <div key={d.day} className="flex flex-col items-center rounded-xl bg-secondary/60 p-2 text-center">
                <Eyebrow size="xs" as="span">{d.day}</Eyebrow>
                <WeatherIcon cond={d.cond} className="my-1.5 h-5 w-5" />
                <span className="font-serif text-sm leading-tight">{d.maxC}°</span>
                <span className="text-2xs tabular-nums text-muted-foreground">{d.minC}°</span>
                <span className="mt-1 inline-flex items-center gap-0.5 text-2xs text-muted-foreground">
                  <Droplet className="h-2.5 w-2.5" />{d.rainProb}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
  );
}

function EnergieRow({
  icon, label, value, sub, trend, trendPct, status,
}: {
  icon: React.ReactNode; label: string; value: string; sub?: string;
  trend?: "up" | "down" | "stable"; trendPct?: number; status: "normal" | "alert";
}) {
  const alert = status === "alert";
  return (
    <div className={"flex flex-1 items-center gap-2 rounded-lg px-2.5 transition-colors " + (alert ? "bg-warm/10 ring-1 ring-warm/30" : "bg-secondary/60")}>
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-card text-foreground/80">{icon}</span>
      <Eyebrow size="xs" as="span" className="min-w-0 flex-1">{label}</Eyebrow>
      <span className="font-serif text-sm leading-none tabular-nums">{value}</span>
      {sub && <span className="text-xs tabular-nums text-muted-foreground">{sub}</span>}
      {trend && <TrendBadge trend={trend} pct={trendPct} hidePct />}
      <StatusDot status={status} />
    </div>
  );
}
