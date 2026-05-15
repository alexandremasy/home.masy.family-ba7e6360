import { createFileRoute, Link } from "@tanstack/react-router";
import { Tile } from "@/components/Card";
import { CountUp } from "@/components/CountUp";
import { MapPinBg } from "@/components/MapPinBg";
import { PMCBag } from "@/components/PMCBag";
import { RoomIcon } from "@/components/RoomIcon";
import { rooms, tesla, reseau, energie, calendrier, meteo, roomDetails, type WeatherCond } from "@/lib/mock-data";
import { Lightbulb, Wind, Wifi, Car, Trash2, Plug, ArrowRight, Droplet, Zap, Flame, MapPin, Sparkles, AlertTriangle, TrendingDown, TrendingUp, Minus, Sun, Cloud, CloudSun, CloudRain, CloudLightning, CloudSnow, CloudFog, Sunrise, Sunset, Thermometer, Music2, Gauge, Server, Cast } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const Route = createFileRoute("/_app/")({
  // Dashboard is rendered by the parent _app layout (so it stays visible
  // behind child-route modals). The index route itself renders nothing.
  component: () => null,
  head: () => ({
    meta: [
      { title: "Maison — Cockpit" },
      { name: "description", content: "Tableau de bord domestique : pièces, Tesla, réseau et énergie en un coup d'œil." },
    ],
  }),
});

export function Dashboard() {
  const visibleRooms = rooms.filter((r) => r.hasSensors);
  const now = new Date();
  const greeting = now.getHours() < 12 ? "Bonjour" : now.getHours() < 18 ? "Bon après-midi" : "Bonsoir";
  const dateStr = now.toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="space-y-8">
      <div className="px-1 anim-slide-up">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{dateStr}</p>
            <h1 className="mt-2 font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
              {greeting}.
            </h1>
          </div>
          <WeatherInline />
        </div>
      </div>

      <div className="grid-bento stagger">

        {/* PRIORITY 1 — Events */}
        {energie.monthlyDue ? (
          <Tile span={3} tone="warm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] opacity-70">Énergie · à faire</p>
                <p className="mt-1 font-serif text-xl">Relevé mensuel à saisir</p>
                <p className="mt-1 text-sm opacity-80">3 compteurs en attente — eau, électricité, mazout.</p>
              </div>
              <span className="relative grid h-9 w-9 place-items-center rounded-full bg-foreground/10">
                <Sparkles className="h-4 w-4 anim-breathe" />
              </span>
            </div>
            <Link
              to="/energie/saisie"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-transform hover:translate-x-0.5"
            >
              Saisir <ArrowRight className="h-4 w-4" />
            </Link>
          </Tile>
        ) : (
          <Tile span={3} to="/energie">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Énergie · {now.toLocaleDateString("fr-BE", { month: "long", year: "numeric" }).replace(/^./, (c) => c.toUpperCase())}</p>
                <p className="mt-1 font-serif text-xl">Vue d'ensemble</p>
              </div>
              {(() => {
                const alerts: string[] = [];
                if (energie.oil.status === "alert") alerts.push("Niveau de mazout faible");
                if (energie.electricity.status === "alert") alerts.push("Conso électrique élevée");
                if (energie.water.status === "alert") alerts.push("Conso d'eau élevée");
                const anyAlert = alerts.length > 0;
                return anyAlert ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-warm/15 px-2.5 py-1 text-warm">
                    <span className="relative grid h-5 w-5 place-items-center rounded-full anim-pulse-ring">
                      <AlertTriangle className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-xs font-medium tracking-tight">{alerts[0]}{alerts.length > 1 ? ` · +${alerts.length - 1}` : ""}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full bg-success/15 px-2.5 py-1 text-success">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium tracking-tight">Tout va bien</span>
                  </span>
                );
              })()}
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
              <ElecBlock />
              <WaterBlock />
              <OilBlock />
            </div>
          </Tile>
        )}

        <Tile span={3} tone="accent" className="relative overflow-hidden">
          <PMCBag className="pointer-events-none absolute -right-3 -top-2 h-[140%] w-auto opacity-95" />
          <div className="relative max-w-[60%]">
            <p className="text-xs uppercase tracking-[0.18em] opacity-70">Aujourd'hui</p>
            <p className="mt-1 font-serif text-xl">Poubelles {calendrier.poubelleToday.type}</p>
            <p className="text-sm opacity-80">À sortir avant {calendrier.poubelleToday.time}</p>
          </div>
        </Tile>

        {/* PRIORITY 2 — Rooms */}
        {visibleRooms.flatMap((room) => {
          if (room.key === "salon") {
            return [
              <SalonTile key="salon-v1" room={room} variant="spotify" label="V1 — minimal" />,
              <SalonTile key="salon-v2" room={room} variant="netflix" label="V2 — cover" />,
              <SalonTile key="salon-v3" room={room} variant="idle" label="V3 — vide" />,
            ];
          }
          return [
            <Tile key={room.key} to={`/room/${room.key}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className={"grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors " + (room.occupied ? "bg-success/15 text-success" : room.lightsOn ? "bg-accent/20 text-accent-foreground" : "bg-secondary text-muted-foreground")}>
                    <RoomIcon icon={room.icon} className="h-4.5 w-4.5 icon-hover" />
                  </span>
                  <div>
                    <p className="font-serif text-xl">{room.name}</p>
                    {room.scene && room.scene !== "Off" && (
                      <p className="mt-0.5 text-xs uppercase tracking-[0.14em] text-muted-foreground">{room.scene}</p>
                    )}
                  </div>
                </div>
                <RoomStatus on={!!room.lightsOn} occupied={!!room.occupied} />
              </div>

              {typeof room.temperature === "number" ? (
                <p className="mt-6 font-serif text-4xl tracking-tight">
                  <CountUp to={room.temperature} decimals={1} /><span className="text-base text-muted-foreground">°C</span>
                </p>
              ) : (
                <div className="mt-6 h-[2.75rem]" aria-hidden />
              )}

              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <span className={"inline-flex items-center gap-1.5 transition-colors " + (room.lightsOn ? "text-accent-foreground" : "")}>
                  <Lightbulb className={"h-3.5 w-3.5 " + (room.lightsOn ? "anim-breathe text-accent-foreground" : "")} />
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

        {/* PRIORITY 3 — Tesla (compact) */}
        <Tile span={3} to="/tesla" tone="dark" className="relative isolate">
          <MapPinBg className="pointer-events-none absolute inset-0 -z-10 h-full w-full text-background opacity-80" />
          <span className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-1/2 rounded-b-[inherit] bg-gradient-to-t from-foreground via-foreground/70 to-transparent" />
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-background/10 text-background">
              <Car className="h-4.5 w-4.5 icon-hover anim-drift" />
            </span>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.18em] opacity-60">Tesla</p>
              <p className="mt-1 font-serif text-xl">{tesla.inGarage ? "Au garage" : "En déplacement"}</p>
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
        </Tile>

        {/* PRIORITY 3 — Réseau (compact) */}
        <Tile span={3} to="/reseau">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Réseau</p>
              <p className="mt-1 font-serif text-xl">Tout est en ligne</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-success/15 px-2.5 py-1 text-success">
              <span className="relative grid h-5 w-5 place-items-center rounded-full">
                <Wifi className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-medium tracking-tight">Stable</span>
            </span>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
            <NetBlock
              icon={<Gauge className="h-3.5 w-3.5 anim-glow sm:h-4 sm:w-4" />}
              label="Internet"
              value={<><CountUp to={reseau.internet.lastSpeedtest.downMbps} /><span className="text-xs text-muted-foreground"> Mbps ↓</span></>}
              sub={`${reseau.internet.lastSpeedtest.upMbps} Mbps ↑ · ${reseau.internet.lastSpeedtest.pingMs} ms`}
              foot={reseau.internet.lastSpeedtest.when}
            />
            <NetBlock
              icon={<Wifi className="h-3.5 w-3.5 anim-breathe sm:h-4 sm:w-4" />}
              label="WiFi privé"
              value={<>{reseau.wifi1.clients}<span className="text-xs text-muted-foreground"> clients</span></>}
              sub={reseau.wifi1.ssid}
              foot={reseau.wifi1.on ? "En ligne" : "Hors ligne"}
              ok={reseau.wifi1.on}
            />
            <NetBlock
              icon={<Server className="h-3.5 w-3.5 anim-breathe sm:h-4 sm:w-4" />}
              label="Homelab"
              value={<>{reseau.homelab.cpu}<span className="text-xs text-muted-foreground">% CPU</span></>}
              sub={`RAM ${reseau.homelab.memory}% · Disk ${reseau.homelab.disk}%`}
              foot={`up ${reseau.homelab.uptimeDays}j`}
              ok
            />
          </div>
        </Tile>
      </div>

    </div>
  );
}

type SalonVariant = "spotify" | "netflix" | "idle";

function SalonTile({ room, variant, label }: { room: typeof rooms[number]; variant: SalonVariant; label: string }) {
  return (
    <Tile to={`/room/${room.key}`} className="relative">
      <span className="absolute right-3 top-3 rounded-full bg-foreground/5 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{label}</span>

      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <span className={"grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors " + (room.occupied ? "bg-success/15 text-success" : "bg-secondary text-muted-foreground")}>
            <RoomIcon icon={room.icon} className="h-4.5 w-4.5 icon-hover" />
          </span>
          <div>
            <p className="font-serif text-xl">{room.name}</p>
            {room.scene && room.scene !== "Off" && (
              <p className="mt-0.5 text-xs uppercase tracking-[0.14em] text-muted-foreground">{room.scene}</p>
            )}
          </div>
        </div>
        <RoomStatus on={!!room.lightsOn} occupied={!!room.occupied} />
      </div>

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
              <span className="font-serif text-[13px] font-bold leading-none">N</span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-serif text-base leading-tight">Dark · S2E4</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">Netflix</p>
            </div>
            <EqBars />
          </>
        )}

        {variant === "idle" && (
          <>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-background text-muted-foreground" aria-hidden>
              <Cast className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-serif text-base leading-tight text-muted-foreground">Chromecast en veille</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground/70">Aucune diffusion</p>
            </div>
          </>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
        <span className={"inline-flex items-center gap-1.5 transition-colors " + (room.lightsOn ? "text-accent-foreground" : "")}>
          <Lightbulb className={"h-3.5 w-3.5 " + (room.lightsOn ? "anim-breathe text-accent-foreground" : "")} />
          {room.lightsOn ? "Allumé" : "Éteint"}
        </span>
      </div>
    </Tile>
  );
}

function EqBars() {
  return (
    <span className="flex items-end gap-0.5 pb-1" aria-hidden>
      <span className="eq-bar h-3 w-0.5 rounded-full bg-accent-foreground/70" style={{ animationDelay: "0ms" }} />
      <span className="eq-bar h-4 w-0.5 rounded-full bg-accent-foreground/70" style={{ animationDelay: "150ms" }} />
      <span className="eq-bar h-2.5 w-0.5 rounded-full bg-accent-foreground/70" style={{ animationDelay: "300ms" }} />
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

function RoomStatus({ on, occupied }: { on: boolean; occupied: boolean }) {
  if (occupied) {
    return (
      <span className="relative inline-flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full rounded-full bg-success/40 animate-ping" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
      </span>
    );
  }
  return (
    <span className={"h-2.5 w-2.5 rounded-full " + (on ? "bg-accent" : "bg-muted-foreground/25")} />
  );
}

function NetBlock({
  icon, label, value, sub, foot, ok = true,
}: { icon: React.ReactNode; label: string; value: React.ReactNode; sub: string; foot: string; ok?: boolean }) {
  return (
    <div className="rounded-xl bg-secondary/60 p-2.5 sm:p-3 transition-colors min-w-0">
      <div className="flex items-center justify-between gap-1">
        <div className="flex min-w-0 items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-muted-foreground sm:text-xs">
          {icon}<span className="truncate">{label}</span>
        </div>
        <span className={"h-2 w-2 rounded-full " + (ok ? "bg-success/70" : "bg-muted-foreground/40")} />
      </div>
      <span className="mt-2 flex items-baseline gap-1 font-serif text-lg leading-none sm:text-xl tabular-nums">
        {value}
      </span>
      <p className="mt-1.5 truncate text-[11px] text-muted-foreground">{sub}</p>
      <p className="mt-1 truncate text-[10px] uppercase tracking-[0.12em] text-muted-foreground/80">{foot}</p>
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
        <div className="flex min-w-0 items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-muted-foreground sm:text-xs">
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
  const tone = trend === "down" ? "text-success" : trend === "up" ? "text-warm" : "text-muted-foreground";
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
          <span className="font-serif text-lg leading-none sm:text-xl">{e.dailyKWh}</span>
          <span className="text-xs text-muted-foreground">kWh/j</span>
        </span>
      </Tip>
      <Tip label="Variation comparée à la moyenne des 90 derniers jours.">
        <span className="mt-1.5 flex items-center gap-1.5">
          <TrendBadge trend={e.trend} pct={e.trendPct} />
          <span className="hidden text-xs text-muted-foreground sm:inline">vs 90j</span>
        </span>
      </Tip>
      <div className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:gap-2">
        <Tip label={`Total cumulé en tarif jour ce mois : ${e.dayTotal} kWh.`}>
          <span className="inline-flex items-center gap-1">☀️<span className="tabular-nums text-foreground/80">{e.dayTotal}</span></span>
        </Tip>
        <Tip label={`Total cumulé en tarif nuit ce mois : ${e.nightTotal} kWh.`}>
          <span className="inline-flex items-center gap-1">✨<span className="tabular-nums text-foreground/80">{e.nightTotal}</span></span>
        </Tip>
        <Tip label="Total consommé sur le mois en cours.">
          <span className="hidden tabular-nums sm:inline">{e.monthKWh} kWh</span>
        </Tip>
      </div>
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
          <span className="font-serif text-lg leading-none sm:text-xl">{w.dailyM3}</span>
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
          <span className="font-serif text-lg leading-none sm:text-xl">{o.tankPct}<span className="text-xs text-muted-foreground">%</span></span>
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
          <span className={"tabular-nums " + (low ? "font-medium text-warm" : "")}>~{o.autonomyDays} j</span>
        </Tip>
      </div>
    </BlockShell>
  );
}

const weatherIconMap: Record<WeatherCond, typeof Sun> = {
  sun: Sun,
  cloud: Cloud,
  partly: CloudSun,
  rain: CloudRain,
  storm: CloudLightning,
  snow: CloudSnow,
  fog: CloudFog,
};

const weatherAnimMap: Record<WeatherCond, string> = {
  sun: "anim-sun",
  cloud: "anim-cloud",
  partly: "anim-partly",
  rain: "anim-rain",
  storm: "anim-storm",
  snow: "anim-snow",
  fog: "anim-fog",
};

function WeatherIcon({ cond, className, animated = true }: { cond: WeatherCond; className?: string; animated?: boolean }) {
  const Icon = weatherIconMap[cond];
  const anim = animated ? " " + weatherAnimMap[cond] : "";
  return <Icon className={(className ?? "") + anim} />;
}

function WeatherInline() {
  const m = meteo.today;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-3 rounded-xl px-2 py-1 text-right transition-colors hover:bg-secondary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Voir la météo détaillée"
        >
          <div className="text-xs text-muted-foreground">
            <p className="font-medium text-foreground">{m.label}</p>
            <p className="mt-0.5">{m.location} · {m.minC}°/{m.maxC}°</p>
          </div>
          <div className="flex items-center gap-2">
            <WeatherIcon cond={m.cond} className="h-7 w-7 text-foreground/80" />
            <span className="font-serif text-3xl leading-none tracking-tight text-foreground">
              {m.tempC}<span className="text-base text-muted-foreground">°</span>
            </span>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg duration-300 data-[state=open]:slide-in-from-top-4 data-[state=closed]:slide-out-to-top-2 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Météo · {m.location}</DialogTitle>
        </DialogHeader>

        {/* Today */}
        <div className="rounded-2xl border border-border/60 bg-secondary/40 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Aujourd'hui</p>
              <p className="mt-1 font-serif text-xl">{m.label}</p>
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
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">Prochains jours</p>
          <div className="grid grid-cols-5 gap-1.5">
            {meteo.forecast.map((d) => (
              <div key={d.day} className="flex flex-col items-center rounded-xl bg-secondary/60 p-2 text-center">
                <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{d.day}</span>
                <WeatherIcon cond={d.cond} className="my-1.5 h-5 w-5" />
                <span className="font-serif text-sm leading-tight">{d.maxC}°</span>
                <span className="text-[10px] tabular-nums text-muted-foreground">{d.minC}°</span>
                <span className="mt-1 inline-flex items-center gap-0.5 text-[9px] text-muted-foreground">
                  <Droplet className="h-2.5 w-2.5" />{d.rainProb}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

