import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Section } from "@/components/Card";
import { CommandButton } from "@/components/CommandButton";
import { useDrawerDrag } from "@/components/MobileDrawerPanel";
import { CameraFeed } from "@/components/CameraFeed";
import { DishwasherPanel } from "@/components/DishwasherPanel";
import { VacuumPanel } from "@/components/VacuumPanel";
import { rooms, roomDetails, cameras, motionEvents, vacuum, type RoomKey } from "@/lib/mock-data";
import { Lightbulb, Thermometer, Volume2, VolumeX, Play, Battery, BatteryFull, BatteryMedium, BatteryLow, BatteryWarning, Droplet, Sparkles, Pause, Power, Radio, Tv, Music as MusicIcon, Moon, Flame, SunDim, SunMedium, Sun, BookOpen, Sunrise, UtensilsCrossed, ChefHat, Briefcase, Armchair, Footprints, Square, Speaker, Bed, Cat, Printer, Projector, Lamp, Disc3, Flower2, Snowflake, ShieldCheck, Home as HomeIcon, ArrowRight, type LucideIcon } from "lucide-react";

function batteryFor(level: number): { Icon: LucideIcon; tone: string } {
  if (level < 20) return { Icon: BatteryWarning, tone: "text-destructive" };
  if (level < 40) return { Icon: BatteryLow, tone: "text-warm" };
  if (level < 75) return { Icon: BatteryMedium, tone: "text-muted-foreground" };
  return { Icon: BatteryFull, tone: "text-success" };
}

function applianceIcon(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (n.includes("sel") || n.includes("lampe")) return Lamp;
  if (n.includes("chat")) return Cat;
  if (n.includes("playbar") || n.includes("speaker") || n.includes("enceinte")) return Speaker;
  if (n.includes("imprim")) return Printer;
  if (n.includes("project")) return Projector;
  if (n.includes("bouboule") || n.includes("boule")) return Disc3;
  if (n.includes("coin")) return Lightbulb;
  return Power;
}

function sceneIcon(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (n.includes("medit")) return Flower2;
  if (n.includes("cosy") || n.includes("cozy")) return Flame;
  if (n.includes("moyen")) return SunDim;
  if (n.includes("lumineux")) return Sun;
  if (n.includes("nuit")) return Moon;
  if (n.includes("réveil") || n.includes("reveil")) return Sunrise;
  if (n.includes("lecture")) return BookOpen;
  if (n.includes("travail")) return SunMedium;
  if (n.includes("dîner") || n.includes("diner")) return UtensilsCrossed;
  if (n.includes("cuisine")) return ChefHat;
  if (n === "off") return Power;
  const pct = parseInt(n, 10);
  if (!Number.isNaN(pct)) {
    if (pct <= 10) return Moon;
    if (pct <= 25) return Flame;
    if (pct <= 50) return SunDim;
    if (pct <= 75) return SunMedium;
    return Sun;
  }
  return Sparkles;
}

function zoneIcon(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (n.includes("bureau")) return Briefcase;
  if (n.includes("divan") || n.includes("canapé") || n.includes("canape")) return Armchair;
  if (n.includes("escalier")) return Footprints;
  if (n.includes("plafond")) return Square;
  if (n.includes("playbar") || n.includes("speaker")) return Speaker;
  if (n.includes("chevet") || n.includes("lit")) return Bed;
  if (n.includes("îlot") || n.includes("ilot") || n.includes("plan")) return ChefHat;
  if (n.includes("étagère") || n.includes("etagere")) return BookOpen;
  if (n.includes("table")) return UtensilsCrossed;
  return Lightbulb;
}
import { RoomIcon } from "@/components/RoomIcon";
import { Eyebrow } from "@/components/Eyebrow";

export const Route = createFileRoute("/_app/room/$roomKey")({
  component: RoomPage,
  loader: ({ params }: { params: { roomKey: string } }) => {
    const room = rooms.find((r) => r.key === params.roomKey as RoomKey);
    if (!room) throw notFound();
    return { room };
  },
  notFoundComponent: () => (
    <div className="py-16 text-center">
      <h1 className="font-serif text-3xl">Pièce introuvable</h1>
      <Link to="/" className="mt-4 inline-block text-primary underline">Retour</Link>
    </div>
  ),
  head: ({ params }: { params: { roomKey: string } }) => {
    const room = rooms.find((r) => r.key === params.roomKey as RoomKey);
    return { meta: [{ title: room ? `${room.name} — Maison` : "Pièce" }] };
  },
});

type ClimateMode = "auto" | 20 | 21 | 22;
type DualSystem = "heat" | "cool";
type DualPreset = "off" | number;

const HEAT_PRESETS: number[] = [19, 20, 21, 22];
const COOL_PRESETS: number[] = [22, 24, 26];

function RoomPage() {
  const data = Route.useLoaderData() as { room: typeof rooms[number] };
  const room = data.room;
  const detail = roomDetails[room.key];
  const isDualClimate = !!detail.climate && "dual" in detail.climate;
  const [zones, setZones] = useState(detail.lights?.zones ?? []);
  const [scene, setScene] = useState(detail.lights?.scene ?? "Off");
  const [brightness, setBrightness] = useState(detail.lights?.brightness ?? 0);
  const [mode, setMode] = useState<ClimateMode>(
    detail.climate && !("dual" in detail.climate) ? detail.climate.mode : "auto"
  );
  const [dualSystem, setDualSystem] = useState<DualSystem>(
    detail.climate && "dual" in detail.climate && detail.climate.mode === "cool" ? "cool" : "heat"
  );
  const [heatPreset, setHeatPreset] = useState<DualPreset>(
    detail.climate && "dual" in detail.climate && detail.climate.mode === "heat"
      ? detail.climate.heatSetpoint
      : detail.climate && "dual" in detail.climate
        ? detail.climate.heatSetpoint
        : "off"
  );
  const [coolPreset, setCoolPreset] = useState<DualPreset>(
    detail.climate && "dual" in detail.climate && detail.climate.mode === "cool"
      ? detail.climate.coolSetpoint
      : detail.climate && "dual" in detail.climate
        ? detail.climate.coolSetpoint
        : "off"
  );
  const [roomOn, setRoomOn] = useState(true);
  const drag = useDrawerDrag();

  return (
    <div className="space-y-6">
      <div
        {...(drag.handlers ?? {})}
        className={
          "page-header sticky top-0 z-20 -mx-5 -mt-7 px-5 pt-7 pb-4 sm:-mx-8 sm:-mt-10 sm:px-8 sm:pt-10 " +
          (drag.handlers ? "cursor-grab touch-none select-none active:cursor-grabbing" : "")
        }
      >
        <div className="page-header__bg pointer-events-none absolute inset-0 bg-background/85 backdrop-blur-xl" />
        <div className="page-header__fade pointer-events-none absolute inset-x-0 top-full h-8 bg-gradient-to-b from-background to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/12 text-primary">
              <RoomIcon icon={room.icon} className="h-5 w-5 anim-float" />
            </span>
            <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">{room.name}</h1>
            {room.occupied && (
              <span className="relative inline-flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full rounded-full bg-success/40 animate-ping" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-success" />
              </span>
            )}
            <CommandButton
              onCommand={() => setRoomOn(!roomOn)}
              commandLabel={roomOn ? "Tout éteindre" : "Tout allumer"}
              aria-pressed={roomOn}
              aria-label={roomOn ? "Tout éteindre" : "Tout allumer"}
              className={"ml-auto inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs uppercase tracking-eyebrow transition-all " + (roomOn
                ? "border-foreground bg-foreground text-background shadow-lift"
                : "border-border/60 bg-card text-muted-foreground hover:border-border")}
            >
              <Power className={"h-3.5 w-3.5 " + (roomOn ? "anim-breathe" : "")} />
              {roomOn ? "On" : "Off"}
            </CommandButton>
          </div>
          {typeof room.temperature === "number" && (
            <p className="mt-1 text-sm text-muted-foreground">Actuellement {room.temperature.toFixed(1)}°C</p>
          )}
        </div>
      </div>

      {detail.lights && (
        <Section
          title="Luminosité"
          action={
            zones.length > 0 ? (
              <span className="text-sm text-muted-foreground">
                {(() => {
                  const on = zones.filter((z) => z.on).length;
                  if (on === 0) return "Tout éteint";
                  if (on === zones.length) return "Tout allumé";
                  return `${on} / ${zones.length} allumées`;
                })()}
              </span>
            ) : undefined
          }
        >
          {detail.lights.scenes.length > 0 && (
            <div
              className="grid gap-2 stagger"
              style={{ gridTemplateColumns: `repeat(${detail.lights.scenes.length}, minmax(0, 1fr))` }}
            >
              {detail.lights.scenes.map((s) => {
                const active = scene === s;
                const Icon = sceneIcon(s);
                return (
                  <CommandButton
                    key={s}
                    onCommand={() => setScene(s)}
                    commandLabel={`Scène ${s}`}
                    className={
                      "group relative flex flex-col items-center gap-1.5 overflow-hidden rounded-xl border px-3 py-4 transition-all duration-300 " +
                      (active
                        ? "border-foreground bg-foreground text-background shadow-lift -translate-y-0.5"
                        : "border-border/60 bg-card hover:-translate-y-0.5 hover:border-border")
                    }
                  >
                    <Icon className={"h-5 w-5 " + (active ? "anim-breathe" : "opacity-60")} />
                    <span className="font-serif text-lg leading-none">{s}</span>
                  </CommandButton>
                );
              })}
            </div>
          )}

          {scene !== "Off" && !detail.lights.hideBrightness && detail.lights.scenes.length > 0 && (
            <div className="mt-6">
              <div className="mb-2 flex justify-between text-xs uppercase tracking-eyebrow text-muted-foreground">
                <span>Luminosité</span><span>{brightness}%</span>
              </div>
              <input
                type="range" min={0} max={100} value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="h-2 w-full appearance-none rounded-full bg-muted accent-primary"
              />
            </div>
          )}

          {zones.length > 0 && (
            <div className={detail.lights.scenes.length > 0 ? "mt-6" : ""}>
              {detail.lights.scenes.length > 0 && (
                <Eyebrow className="mb-3">Zones</Eyebrow>
              )}
              <div className="flex flex-wrap gap-1.5">
                {zones.map((z, i) => {
                  const Icon = zoneIcon(z.name);
                  return (
                    <CommandButton
                      key={z.name}
                      onCommand={() => setZones(zones.map((zz, idx) => idx === i ? { ...zz, on: !zz.on } : zz))}
                      commandLabel={`Zone ${z.name}`}
                      className={"inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all " + (z.on ? "border-foreground bg-foreground text-background shadow-lift" : "border-border/60 bg-card text-muted-foreground hover:border-border hover:text-foreground")}
                    >
                      <Icon className={"h-3 w-3 " + (z.on ? "anim-breathe" : "opacity-50")} />
                      {z.name}
                    </CommandButton>
                  );
                })}
              </div>
            </div>
          )}
        </Section>
      )}

      {detail.climate && (
        <Section
          title="Climatisation"
          action={
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Thermometer className="h-4 w-4" />
              <strong className="text-foreground">{detail.climate.current}°</strong> actuel
            </span>
          }
        >
          {isDualClimate ? (
            <DualClimate
              system={dualSystem}
              setSystem={setDualSystem}
              heatPreset={heatPreset}
              setHeatPreset={setHeatPreset}
              coolPreset={coolPreset}
              setCoolPreset={setCoolPreset}
            />
          ) : (
            <div className="grid grid-cols-4 gap-2 stagger">
              {(["auto", 20, 21, 22] as const).map((m) => {
                const active = mode === m;
                const label = m === "auto" ? "Auto" : `${m}°`;
                const sub = m === "auto" ? "off" : "on";
                return (
                  <CommandButton
                    key={String(m)}
                    onCommand={() => setMode(m)}
                    commandLabel={`Climatisation ${label}`}
                    className={
                      "flex flex-col items-center gap-1 rounded-xl border px-3 py-4 transition-all duration-300 " +
                      (active
                        ? "border-foreground bg-foreground text-background -translate-y-0.5 shadow-lift"
                        : "border-border/60 bg-card hover:-translate-y-0.5 hover:border-border")
                    }
                  >
                    <span className="font-serif text-xl leading-none">{label}</span>
                    <span className={"text-2xs uppercase tracking-wider " + (active ? "opacity-70" : "text-muted-foreground")}>
                      {sub}
                    </span>
                  </CommandButton>
                );
              })}
            </div>
          )}
        </Section>
      )}

      {detail.media && room.key === "salon" && <MediaSection media={detail.media} />}

      {room.key === "cuisine" && (
        <Section
          title="Lave-vaisselle"
          action={
            <Link to="/room/$roomKey" params={{ roomKey: "cuisine" }} className="text-xs uppercase tracking-eyebrow text-muted-foreground hover:text-foreground">
              détails
            </Link>
          }
        >
          <DishwasherPanel />
        </Section>
      )}

      {room.key === "buanderie" && (
        <Section
          title="Aspirateur robot"
          action={<span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"><HomeIcon className="h-4 w-4" />Base ici</span>}
        >
          <VacuumPanel />
          {vacuum.state === "docked" && (
            <div className="mt-4 flex flex-wrap gap-2">
              <CommandButton
                onCommand={() => {}}
                commandLabel="Lancer un cycle"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition-transform hover:translate-x-0.5"
              >
                Lancer un cycle <ArrowRight className="h-4 w-4" />
              </CommandButton>
              <CommandButton
                onCommand={() => {}}
                commandLabel="Vider le bac"
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-border hover:text-foreground"
              >
                Vider le bac
              </CommandButton>
            </div>
          )}
        </Section>
      )}

      {(() => {
        const roomCams = cameras.filter((c) => c.installed && (
          (room.key === "salon"     && c.id === "salon") ||
          (room.key === "buanderie" && c.id === "buanderie")
        ));
        if (roomCams.length === 0) return null;
        const recentEvents = motionEvents.filter((e) => roomCams.some(c => c.id === e.cameraId)).slice(0, 3);
        return (
          <Section
            title="Caméra"
            action={
              <Link to="/securite" className="inline-flex items-center gap-1.5 text-xs uppercase tracking-eyebrow text-muted-foreground hover:text-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />toutes les caméras
              </Link>
            }
          >
            <div className="space-y-3">
              {roomCams.map((c) => (
                <CameraFeed key={c.id} camera={c} size="lg" />
              ))}
              {recentEvents.length > 0 && (
                <ul className="space-y-1.5">
                  {recentEvents.map((e) => (
                    <li key={e.id} className="flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-2 text-xs">
                      <Sparkles className="h-3 w-3 text-primary" />
                      <span className="flex-1 truncate">{e.label}</span>
                      <span className="tabular-nums text-muted-foreground">{e.time}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Section>
        );
      })()}


      {detail.devices && (
        <Section title="Périphériques">
          {detail.devices.ink && (
            <div className="mb-6">
              <Eyebrow className="mb-3">Imprimante · niveaux d'encre</Eyebrow>
              <div className="grid grid-cols-4 gap-3 stagger">
                {([
                  ["Cyan", detail.devices.ink.c, "oklch(0.78 0.13 200)"],
                  ["Magenta", detail.devices.ink.m, "oklch(0.65 0.22 350)"],
                  ["Jaune", detail.devices.ink.y, "oklch(0.86 0.16 95)"],
                  ["Noir", detail.devices.ink.k, "oklch(0.30 0.02 230)"],
                ] as const).map(([name, val, color]) => (
                  <div key={name} className="rounded-xl border border-border/60 bg-card p-3">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground"><Droplet className="h-3 w-3" />{name}</div>
                    <p className="mt-1.5 font-serif text-lg">{val}%</p>
                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${val}%`, background: color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {detail.devices.appliances && detail.devices.appliances.length > 0 && (
            <div className="mb-6">
              <Eyebrow className="mb-3">Appareils</Eyebrow>
              <AppliancesGrid items={detail.devices.appliances} />
            </div>
          )}
          <Eyebrow className="mb-3">Batteries</Eyebrow>
          <div className="grid gap-2 sm:grid-cols-2">
            {detail.devices.batteries.map((b) => {
              const { Icon, tone } = batteryFor(b.level);
              return (
                <div key={b.name} className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-3 text-sm">
                  <span className="flex items-center gap-2"><Icon className={"h-4 w-4 " + tone} />{b.name}</span>
                  <span className={"font-semibold " + (b.level < 20 ? "text-destructive" : "")}>{b.level}%</span>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {!detail.lights && !detail.climate && !detail.media && !detail.devices && (
        <Section title="Aucun appareil">
          <p className="text-muted-foreground">Cette pièce n'a pas encore de capteurs ou d'appareils connectés.</p>
        </Section>
      )}
    </div>
  );
}

function MediaSection({ media }: { media: NonNullable<typeof roomDetails["salon"]["media"]> }) {
  const [source, setSource] = useState(media.source);
  const [playing, setPlaying] = useState(source !== "off");

  const sources = [
    { key: "spotify" as const, label: "Spotify", Icon: MusicIcon, tint: "oklch(0.72 0.17 150)" },
    { key: "netflix" as const, label: "Netflix", Icon: Tv, tint: "oklch(0.58 0.22 25)" },
    { key: "off" as const, label: "Éteint", Icon: Power, tint: "oklch(0.55 0 0)" },
  ];
  const active = sources.find((s) => s.key === source)!;

  return (
    <Section
      title="Média"
      action={
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{active.label}</span>
          {source !== "off" && (
            <CommandButton
              onCommand={() => { setSource("off"); setPlaying(false); }}
              commandLabel="Couper le média"
              className="grid h-7 w-7 place-items-center rounded-full border border-border/60 bg-card text-muted-foreground transition-colors hover:text-foreground hover:border-border"
              aria-label="Couper le média"
              title="Couper"
            >
              <Power className="h-3 w-3" />
            </CommandButton>
          )}
        </div>
      }
    >
      <div
        className="relative overflow-hidden rounded-xl border border-border/60 p-5"
        style={{
          background: source === "off"
            ? "linear-gradient(135deg, color-mix(in oklab, var(--card) 92%, transparent), var(--card))"
            : `linear-gradient(135deg, color-mix(in oklab, ${active.tint} 22%, var(--card)), var(--card) 70%)`,
        }}
      >
        {source === "spotify" && (
          <div className="flex items-center gap-4">
            <div className={"grid h-16 w-16 shrink-0 place-items-center rounded-lg shadow-lift " + (playing ? "animate-spin [animation-duration:10s]" : "")}
                 style={{ background: `radial-gradient(circle at 30% 30%, ${active.tint}, oklch(0.25 0.04 160))` }}>
              <span className="h-2.5 w-2.5 rounded-full bg-background" />
            </div>
            <div className="min-w-0 flex-1">
              <Eyebrow size="xs">Spotify · en lecture</Eyebrow>
              <p className="mt-0.5 truncate font-serif text-lg">{media.nowPlaying ?? "—"}</p>
              {media.artist && <p className="truncate text-sm text-muted-foreground">{media.artist}</p>}
              <div className="mt-2 flex h-3 items-end gap-0.5">
                {[0.6, 0.9, 0.4, 1, 0.7, 0.5, 0.85].map((h, i) => (
                  <span key={i} className={"w-1 rounded-sm bg-foreground/70 " + (playing ? "eq-bar" : "")}
                        style={{ height: `${h * 100}%`, animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </div>
            <CommandButton onCommand={() => setPlaying(!playing)}
                    commandLabel={playing ? "Pause Spotify" : "Lecture Spotify"}
                    className="grid h-11 w-11 place-items-center rounded-full bg-foreground text-background transition-transform hover:scale-105 active:scale-95"
                    aria-label={playing ? "Pause" : "Lecture"}>
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </CommandButton>
          </div>
        )}
        {source === "netflix" && (
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg shadow-lift"
                 style={{ background: `linear-gradient(135deg, ${active.tint}, oklch(0.25 0.08 25))` }}>
              <Tv className="h-6 w-6 text-background" />
            </div>
            <div className="min-w-0 flex-1">
              <Eyebrow size="xs">Netflix</Eyebrow>
              <p className="mt-0.5 truncate font-serif text-lg">Téléviseur allumé</p>
              <p className="truncate text-sm text-muted-foreground">Source HDMI · Apple TV</p>
            </div>
            <CommandButton onCommand={() => setPlaying(!playing)}
                    commandLabel={playing ? "Pause Netflix" : "Lecture Netflix"}
                    className="grid h-11 w-11 place-items-center rounded-full bg-foreground text-background transition-transform hover:scale-105 active:scale-95"
                    aria-label={playing ? "Pause" : "Lecture"}>
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </CommandButton>
          </div>
        )}
        {source === "off" && (
          <div className="flex items-center gap-4 py-2">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-muted">
              <Power className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <Eyebrow size="xs">Aucun média</Eyebrow>
              <p className="mt-0.5 font-serif text-lg">Tout est silencieux</p>
              <p className="text-sm text-muted-foreground">Choisis une source pour démarrer.</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <ActionButton icon={<Radio className="h-4 w-4" />} label="Musiq3" onClick={() => { setSource("spotify"); setPlaying(true); }} />
        <ActionButton icon={<Tv className="h-4 w-4" />} label="Netflix" onClick={() => { setSource("netflix"); setPlaying(true); }} />
        <ActionButton icon={<VolumeX className="h-4 w-4" />} label="Volume −" />
        <ActionButton icon={<Volume2 className="h-4 w-4" />} label="Volume +" />
      </div>
    </Section>
  );
}

function AppliancesGrid({ items }: { items: { name: string; on: boolean }[] }) {
  const [state, setState] = useState(items);
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {state.map((a, i) => {
        const Icon = applianceIcon(a.name);
        return (
          <CommandButton
            key={a.name}
            onCommand={() => setState(state.map((s, idx) => idx === i ? { ...s, on: !s.on } : s))}
            commandLabel={a.name}
            className={"flex items-center justify-between rounded-xl border px-3 py-3 text-sm transition-all " + (a.on ? "border-foreground bg-foreground text-background shadow-lift" : "border-border/60 bg-card hover:border-border")}
          >
            <span className="flex items-center gap-2">
              <Icon className={"h-3.5 w-3.5 " + (a.on ? "anim-breathe" : "opacity-50")} />
              {a.name}
            </span>
            <span className={"text-2xs uppercase tracking-wider " + (a.on ? "opacity-70" : "text-muted-foreground")}>{a.on ? "On" : "Off"}</span>
          </CommandButton>
        );
      })}
    </div>
  );
}

function ActionButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  const [triggered, setTriggered] = useState(false);
  return (
    <CommandButton
      onCommand={() => { onClick?.(); setTriggered(true); setTimeout(() => setTriggered(false), 800); }}
      commandLabel={label}
      className={"flex flex-col items-center gap-1.5 rounded-xl border border-border/60 p-3 text-sm transition-all duration-300 " + (triggered ? "bg-primary text-primary-foreground -translate-y-0.5" : "bg-card hover:-translate-y-0.5 hover:border-border")}
    >
      {icon}
      <span>{label}</span>
    </CommandButton>
  );
}

function DualClimate({
  system,
  setSystem,
  heatPreset,
  setHeatPreset,
  coolPreset,
  setCoolPreset,
}: {
  system: DualSystem;
  setSystem: (s: DualSystem) => void;
  heatPreset: DualPreset;
  setHeatPreset: (p: DualPreset) => void;
  coolPreset: DualPreset;
  setCoolPreset: (p: DualPreset) => void;
}) {
  const HEAT_TINT = "oklch(0.68 0.18 40)";
  const COOL_TINT = "oklch(0.72 0.12 220)";

  const presets = system === "heat" ? HEAT_PRESETS : COOL_PRESETS;
  const activePreset = system === "heat" ? heatPreset : coolPreset;
  const setPreset = system === "heat" ? setHeatPreset : setCoolPreset;
  const tint = system === "heat" ? HEAT_TINT : COOL_TINT;

  const choices: DualPreset[] = ["off", ...presets];

  return (
    <div className="space-y-4">
      <div
        className="relative grid grid-cols-2 rounded-full border border-border/60 bg-card p-1"
        role="tablist"
        aria-label="Mode climatisation"
      >
        <span
          aria-hidden
          className="absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-full shadow-lift transition-all duration-300 ease-out"
          style={{
            left: system === "heat" ? "0.25rem" : "calc(50% + 0rem)",
            background: `linear-gradient(135deg, ${tint}, color-mix(in oklab, ${tint} 60%, var(--foreground)))`,
          }}
        />
        {([
          { key: "heat" as const, label: "Chaud", Icon: Flame },
          { key: "cool" as const, label: "Froid", Icon: Snowflake },
        ]).map(({ key, label, Icon }) => {
          const active = system === key;
          return (
            <CommandButton
              key={key}
              role="tab"
              aria-selected={active}
              onCommand={() => setSystem(key)}
              commandLabel={`Climatisation ${label}`}
              className={
                "relative z-10 flex items-center justify-center gap-2 rounded-full px-3 py-2.5 text-sm font-semibold transition-colors duration-300 " +
                (active ? "text-background" : "text-muted-foreground hover:text-foreground")
              }
            >
              <Icon className={"h-4 w-4 " + (active ? "anim-breathe" : "opacity-60")} />
              <span className="font-serif text-base leading-none">{label}</span>
            </CommandButton>
          );
        })}
      </div>


      <div
        className="rounded-xl border border-border/60 p-3"
        style={{ background: `linear-gradient(to right, var(--card), color-mix(in oklab, ${tint} 28%, var(--card)))` }}
      >
        <div
          className="grid gap-2 stagger"
          style={{ gridTemplateColumns: `repeat(${choices.length}, minmax(0, 1fr))` }}
        >
          {choices.map((p) => {
            const active = activePreset === p;
            const isOff = p === "off";
            return (
              <CommandButton
                key={String(p)}
                onCommand={() => setPreset(p)}
                commandLabel={isOff ? (system === "heat" ? "Chauffage auto" : "Froid off") : `Consigne ${p}°`}
                className={
                  "flex flex-col items-center gap-1 rounded-xl border px-3 py-4 transition-all duration-300 " +
                  (active
                    ? "border-foreground bg-foreground text-background -translate-y-0.5 shadow-lift"
                    : "border-border/60 bg-card hover:-translate-y-0.5 hover:border-border")
                }
              >
                <span className="font-serif text-xl leading-none">{isOff ? (system === "heat" ? "Auto" : "Off") : `${p}°`}</span>
                <span className={"text-2xs uppercase tracking-wider " + (active ? "opacity-70" : "text-muted-foreground")}>
                  {isOff ? "éteint" : "on"}
                </span>
              </CommandButton>
            );
          })}
        </div>
      </div>
    </div>
  );
}
