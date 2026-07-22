import { useState, type ReactNode } from "react";
import { BentoGrid, BentoItem } from "@/blocks/bento";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { CameraFeed } from "@/components/camera-feed";
import { DishwasherPanel, type DishwasherData } from "@/components/dishwasher-panel";
import { MediaSweep } from "@/components/effects";
import { Eyebrow } from "@/components/eyebrow";
import { useDrawerDrag } from "@/components/mobile-drawer-panel";
import { SlidingTabs } from "@/components/sliding-tabs";
import { Toggle } from "@/components/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/toggle-group";
import { VacuumPanel, type VacuumData } from "@/components/vacuum-panel";
import type { Camera as CameraModel } from "@/lib/mock-data";
import {
  ArrowRight,
  Armchair,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BatteryWarning,
  Bed,
  BookOpen,
  Briefcase,
  Camera,
  Cat,
  ChefHat,
  Disc3,
  Droplet,
  ExternalLink,
  Flame,
  Flower2,
  Footprints,
  Home as HomeIcon,
  LampCeiling,
  Lamp,
  Lightbulb,
  Moon,
  Pause,
  Play,
  Power,
  Printer,
  Projector,
  Radio,
  Snowflake,
  Speaker,
  Sparkles,
  Sun,
  SunDim,
  SunMedium,
  Sunrise,
  Thermometer,
  UtensilsCrossed,
  Volume1,
  Volume2,
  type LucideIcon,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   A room, as a page — whatever that room happens to have.

   Every module is optional and the bento closes over the ones that are there,
   so a room with two devices and a room with six both come out whole. What a
   room HAS is the caller's answer; what a room LOOKS like is this file's.

   Nothing here calls anything. A tap hands back the thing that was tapped —
   a zone key, a preset, a scene — and the caller turns it into a script, a
   service call, or a `setState` in a mock. The state shown is always the state
   passed in, which is what lets an optimistic update and a physical remote both
   land in the same place.
   ──────────────────────────────────────────────────────────────────────────── */

/** One switchable light zone. */
export interface RoomZoneView {
  /** Identifies the zone to the caller. Opaque here. */
  key: string;
  /** What it is called on screen — the icon is picked from it. */
  name: string;
  on: boolean;
}

/** One light scene the room can be put in. */
export interface RoomSceneView {
  /** Identifies the scene to the caller, and matches `activeScene`. */
  value: string;
  /** What the tab reads. Defaults to `value`. */
  label?: string;
}

export interface RoomLightsView {
  /** The scenes, in the order they should appear. Empty hides the switcher. */
  scenes: RoomSceneView[];
  /** Which scene is on — `"Off"` for none. */
  activeScene: string;
  /** The zones, or empty when the room's lights are not split. */
  zones: RoomZoneView[];
  /** Brightness 0–100, or `null` when nothing here dims. */
  brightness: number | null;
}

/** `"auto"` lets the schedule decide; a number is a setpoint in °C. */
export type RoomClimateMode = "auto" | number;
/** `"off"` steps the system back; a number is a setpoint in °C. */
export type RoomClimatePreset = "off" | number;

export interface RoomClimateView {
  /** The room heats AND cools — adds the Chaud/Froid switch above the setpoints. */
  dual: boolean;
  /** Simple rooms: the active setpoint. */
  mode: RoomClimateMode;
  /** Dual rooms: which system has the room. */
  system: "heat" | "cool";
  /** Dual rooms: the heating setpoint. */
  heatPreset: RoomClimatePreset;
  /** Dual rooms: the cooling setpoint. */
  coolPreset: RoomClimatePreset;
}

export interface RoomMediaView {
  /** The radio button is pressed. */
  radioOn: boolean;
  /** Something is actually playing (as opposed to paused). */
  playing: boolean;
  /** The eyebrow over the title — "Musiq3", "Spotify · en pause". */
  label: string;
  /** What is playing. */
  title: string;
  artist?: string;
  /** Accent colour for the sweep and the disc. `null` when the room is silent. */
  tint: string | null;
}

/** A switch, a lamp, a printer — anything the room turns on and off. */
export interface RoomApplianceView {
  key: string;
  /** Its name, which picks the icon. */
  name: string;
  on: boolean;
}

export interface RoomBatteryView {
  key: string;
  name: string;
  /** Charge left, 0–100. Under 20 reads as critical. */
  level: number;
}

/** Printer ink, per cartridge, 0–100. */
export interface RoomInkView {
  c: number;
  m: number;
  y: number;
  k: number;
}

export interface RoomDevicesView {
  ink?: RoomInkView;
  appliances?: RoomApplianceView[];
  batteries: RoomBatteryView[];
}

/** One thing the camera saw. */
export interface RoomMotionEventView {
  id: string;
  label: string;
  /** Clock time — "07:12". */
  time: string;
}

export interface RoomDetailProps {
  /** The room's name. */
  name: string;
  /** Its icon, rendered by the caller (`<RoomIcon …>` on both sides). */
  icon: ReactNode;
  /** Current temperature in °C, when the room measures one. */
  temperature?: number;
  /** The room reads as on. */
  roomOn: boolean;
  /** Toggle everything. Absent, the header shows no On/Off — some rooms have none. */
  onToggleRoom?: () => void;

  lights?: RoomLightsView;
  /** A scene was picked. */
  onSelectScene?: (value: string) => void;
  /** A zone was tapped, by key. */
  onToggleZone?: (key: string) => void;
  /** The brightness slider was released — the value is final, not every drag frame. */
  onSetBrightness?: (pct: number) => void;

  climate?: RoomClimateView;
  onSelectMode?: (mode: RoomClimateMode) => void;
  onSelectSystem?: (system: "heat" | "cool") => void;
  onSelectHeatPreset?: (preset: RoomClimatePreset) => void;
  onSelectCoolPreset?: (preset: RoomClimatePreset) => void;

  media?: RoomMediaView;
  onToggleRadio?: () => void;
  onVolumeDown?: () => void;
  onVolumeUp?: () => void;
  onTogglePlay?: () => void;

  dishwasher?: DishwasherData;

  vacuum?: VacuumData;
  /** Send the robot out. Only offered while it is docked. */
  onStartVacuum?: () => void;
  /** Empty the bin. */
  onEmptyBin?: () => void;

  /** The room's cameras. Empty or absent hides the module. */
  cameras?: CameraModel[];
  /** What those cameras saw recently, newest first. */
  cameraEvents?: RoomMotionEventView[];
  /** Where the "UI Protect" link goes. */
  protectHref?: string;

  devices?: RoomDevicesView;
  /** An appliance was tapped, by key. */
  onToggleAppliance?: (key: string) => void;
}

// ---------- icon vocabulary ----------

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
  if (n.includes("plafond")) return LampCeiling;
  if (n.includes("playbar") || n.includes("speaker")) return Speaker;
  if (n.includes("chevet") || n.includes("lit")) return Bed;
  if (n.includes("îlot") || n.includes("ilot") || n.includes("plan")) return ChefHat;
  if (n.includes("étagère") || n.includes("etagere")) return BookOpen;
  if (n.includes("table")) return UtensilsCrossed;
  return Lightbulb;
}

const HEAT_PRESETS: number[] = [19, 20, 21, 22];
const COOL_PRESETS: number[] = [22, 24, 26];
const SIMPLE_MODES: RoomClimateMode[] = ["auto", 20, 21, 22];

// ---------- page ----------

/** One room and everything it can do. */
export function RoomDetailTemplate({
  name,
  icon,
  temperature,
  roomOn,
  onToggleRoom,
  lights,
  onSelectScene,
  onToggleZone,
  onSetBrightness,
  climate,
  onSelectMode,
  onSelectSystem,
  onSelectHeatPreset,
  onSelectCoolPreset,
  media,
  onToggleRadio,
  onVolumeDown,
  onVolumeUp,
  onTogglePlay,
  dishwasher,
  vacuum,
  onStartVacuum,
  onEmptyBin,
  cameras = [],
  cameraEvents = [],
  protectHref = "https://unifi.ui.com",
  devices,
  onToggleAppliance,
}: RoomDetailProps) {
  const drag = useDrawerDrag();

  // Bento modules are collected first so the grid can always be complete: two per
  // row (span 3), and the last one takes the full width (span 6) when the count is
  // odd — no holes, whatever modules a room happens to have.
  const modules: { key: string; node: ReactNode }[] = [];

  const hasLights = !!lights && (lights.scenes.length > 0 || lights.zones.length > 0);

  if (hasLights && lights) {
    const zonesOn = lights.zones.filter((z) => z.on).length;
    modules.push({
      key: "lights",
      node: (
        <Card
          variant="solid"
          icon={<Lightbulb className="h-4 w-4" />}
          title="Luminosité"
          trailing={
            lights.zones.length > 0 ? (
              <span className="text-sm text-muted-foreground">
                {zonesOn === 0
                  ? "Tout éteint"
                  : zonesOn === lights.zones.length
                    ? "Tout allumé"
                    : `${zonesOn} / ${lights.zones.length} allumées`}
              </span>
            ) : undefined
          }
        >
          {lights.scenes.length > 0 && (
            <SlidingTabs
              value={lights.activeScene}
              onValueChange={(v) => onSelectScene?.(v)}
              options={lights.scenes.map((s) => ({
                value: s.value,
                label: s.label ?? s.value,
                icon: sceneIcon(s.value),
              }))}
            />
          )}

          {lights.brightness !== null && lights.activeScene !== "Off" && (
            <BrightnessSlider
              value={lights.brightness}
              onCommit={(v) => onSetBrightness?.(v)}
              className={lights.scenes.length > 0 ? "mt-6" : ""}
            />
          )}

          {lights.zones.length > 0 && (
            <div className={lights.scenes.length > 0 ? "mt-6" : ""}>
              {lights.scenes.length > 0 && <Eyebrow className="mb-3">Zones</Eyebrow>}
              <div className="flex flex-wrap gap-1.5">
                {lights.zones.map((z) => {
                  const Icon = zoneIcon(z.name);
                  return (
                    <Toggle
                      key={z.key}
                      size="sm"
                      pressed={z.on}
                      onPressedChange={() => onToggleZone?.(z.key)}
                      aria-label={`Zone ${z.name}`}
                      className="gap-1.5 rounded-full text-xs data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background data-[state=on]:hover:bg-foreground/90 data-[state=on]:hover:text-background"
                    >
                      <Icon className={z.on ? "anim-breathe" : "opacity-50"} />
                      {z.name}
                    </Toggle>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      ),
    });
  }

  if (climate) {
    modules.push({
      key: "climate",
      node: (
        <Card
          variant="solid"
          icon={<Thermometer className="h-4 w-4" />}
          title="Climatisation"
          // A reading, not an action — and in a 2-column cell the action slot
          // squeezed the title down to "Climati…".
          subline={
            typeof temperature === "number" ? `${temperature.toFixed(1)}° actuellement` : undefined
          }
        >
          <ClimateControl
            climate={climate}
            onSelectMode={onSelectMode}
            onSelectSystem={onSelectSystem}
            onSelectHeatPreset={onSelectHeatPreset}
            onSelectCoolPreset={onSelectCoolPreset}
          />
        </Card>
      ),
    });
  }

  if (media) {
    modules.push({
      key: "media",
      node: (
        <MediaModule
          media={media}
          onToggleRadio={onToggleRadio}
          onVolumeDown={onVolumeDown}
          onVolumeUp={onVolumeUp}
          onTogglePlay={onTogglePlay}
        />
      ),
    });
  }

  if (dishwasher) {
    modules.push({
      key: "dishwasher",
      node: (
        <Card
          variant="solid"
          icon={<Droplet className="h-4 w-4" />}
          title="Lave-vaisselle"
          subline={
            dishwasher.state === "running" || dishwasher.state === "paused"
              ? `${dishwasher.program} · fin prévue ${dishwasher.endsAt}`
              : dishwasher.program
          }
        >
          <DishwasherPanel data={dishwasher} />
        </Card>
      ),
    });
  }

  if (vacuum) {
    modules.push({
      key: "vacuum",
      node: (
        <Card
          variant="solid"
          icon={<Sparkles className="h-4 w-4" />}
          title="Aspirateur robot"
          trailing={
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <HomeIcon className="h-4 w-4" />
              Base ici
            </span>
          }
        >
          <VacuumPanel data={vacuum} />
          {vacuum.state === "docked" && (onStartVacuum || onEmptyBin) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {onStartVacuum && (
                <Button
                  onClick={onStartVacuum}
                  className="rounded-full bg-foreground text-background hover:bg-foreground/90"
                >
                  Lancer un cycle
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
              {onEmptyBin && (
                <Button variant="outline" onClick={onEmptyBin} className="rounded-full">
                  Vider le bac
                </Button>
              )}
            </div>
          )}
        </Card>
      ),
    });
  }

  if (cameras.length > 0) {
    modules.push({
      key: "camera",
      node: (
        <Card
          variant="solid"
          icon={<Camera className="h-4 w-4" />}
          title="Caméra"
          trailing={
            <a
              href={protectHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              UI Protect
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          }
        >
          <div className="space-y-3">
            {cameras.map((c) => (
              <CameraFeed key={c.id} camera={c} size="lg" />
            ))}
            {cameraEvents.length > 0 && (
              <ul className="space-y-1.5">
                {cameraEvents.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-2 text-xs"
                  >
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span className="flex-1 truncate">{e.label}</span>
                    <span className="tabular-nums text-muted-foreground">{e.time}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      ),
    });
  }

  if (devices) {
    modules.push({
      key: "devices",
      node: (
        <Card variant="solid" icon={<Printer className="h-4 w-4" />} title="Périphériques">
          {devices.ink && (
            <div className="mb-6">
              <Eyebrow className="mb-3">Imprimante · niveaux d'encre</Eyebrow>
              <div className="grid grid-cols-2 gap-3 stagger sm:grid-cols-4">
                {(
                  [
                    ["Cyan", devices.ink.c, "oklch(0.78 0.13 200)"],
                    ["Magenta", devices.ink.m, "oklch(0.65 0.22 350)"],
                    ["Jaune", devices.ink.y, "oklch(0.86 0.16 95)"],
                    ["Noir", devices.ink.k, "oklch(0.30 0.02 230)"],
                  ] as const
                ).map(([label, val, color]) => (
                  <Card key={label} variant="inset" padding="sm" as="div">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Droplet className="h-3 w-3" />
                      {label}
                    </div>
                    <p className="mt-1.5 text-base">{Math.round(val)}%</p>
                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${val}%`, background: color }}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {devices.appliances && devices.appliances.length > 0 && (
            <div className="mb-6">
              <Eyebrow className="mb-3">Appareils</Eyebrow>
              <div className="grid gap-2 sm:grid-cols-2">
                {devices.appliances.map((a) => {
                  const Icon = applianceIcon(a.name);
                  return (
                    <button
                      key={a.key}
                      type="button"
                      onClick={() => onToggleAppliance?.(a.key)}
                      className={
                        "flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all " +
                        (a.on
                          ? "border-foreground bg-foreground text-background"
                          : "border-border/60 bg-card hover:border-border")
                      }
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <Icon
                          className={"h-4 w-4 shrink-0 " + (a.on ? "anim-breathe" : "opacity-50")}
                        />
                        <span className="truncate">{a.name}</span>
                      </span>
                      <span className={a.on ? "text-background/70" : "text-muted-foreground"}>
                        {a.on ? "On" : "Off"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {devices.batteries.length > 0 && (
            <>
              <Eyebrow className="mb-3">Batteries</Eyebrow>
              <div className="grid gap-2 sm:grid-cols-2">
                {devices.batteries.map((b) => {
                  const { Icon, tone } = batteryFor(b.level);
                  return (
                    <Card key={b.key} variant="inset" padding="sm" as="div">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Icon className={"h-4 w-4 " + tone} />
                          {b.name}
                        </span>
                        <span
                          className={
                            "text-xs font-semibold " + (b.level < 20 ? "text-destructive" : "")
                          }
                        >
                          {Math.round(b.level)}%
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </Card>
      ),
    });
  }

  if (modules.length === 0) {
    modules.push({
      key: "empty",
      node: (
        <Card variant="solid" title="Aucun appareil">
          <p className="text-muted-foreground">
            Cette pièce n'a pas encore de capteurs ou d'appareils connectés.
          </p>
        </Card>
      ),
    });
  }

  return (
    <div className="space-y-6">
      <div
        {...(drag.handlers ?? {})}
        className={
          "page-header sticky top-0 z-20 -mx-5 -mt-4 px-5 pt-2 pb-2 md:-mx-8 md:-mt-10 md:px-8 md:pb-4 md:pt-10 " +
          (drag.handlers ? "cursor-grab touch-none select-none active:cursor-grabbing" : "")
        }
      >
        <div className="page-header__bg pointer-events-none absolute inset-0 bg-background/95 md:bg-background/85 md:backdrop-blur-xl" />
        <div className="page-header__fade pointer-events-none absolute inset-x-0 top-full h-8 bg-gradient-to-b from-background to-transparent" />
        {/* Drag handle — lives in the sticky header so it stays put while scrolling. */}
        {drag.handlers && (
          <div className="relative mx-auto mb-2 h-1.5 w-11 rounded-full bg-muted-foreground/30 md:hidden" />
        )}
        <div className="relative flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/12 text-primary">
            {icon}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">{name}</h1>
            {typeof temperature === "number" && (
              <p className="text-xs text-muted-foreground">
                Actuellement {temperature.toFixed(1)}°C
              </p>
            )}
          </div>
          {onToggleRoom && (
            <Toggle
              size="sm"
              pressed={roomOn}
              onPressedChange={() => onToggleRoom()}
              aria-label={roomOn ? "Tout éteindre" : "Tout allumer"}
              className="ml-auto shrink-0 rounded-full px-3 data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background data-[state=on]:hover:bg-foreground/90 data-[state=on]:hover:text-background"
            >
              <Power className={roomOn ? "anim-breathe" : ""} />
              {roomOn ? "On" : "Off"}
            </Toggle>
          )}
        </div>
      </div>

      <BentoGrid rows="auto">
        {modules.map((m, i) => (
          <BentoItem
            key={m.key}
            span={i === modules.length - 1 && modules.length % 2 === 1 ? 6 : 3}
          >
            {m.node}
          </BentoItem>
        ))}
      </BentoGrid>
    </div>
  );
}

// ---------- brightness ----------

/**
 * The slider tracks the finger locally and only reports on release: a light that
 * is asked to dim on every frame of a drag falls behind and fights the thumb.
 */
function BrightnessSlider({
  value,
  onCommit,
  className,
}: {
  value: number;
  onCommit: (pct: number) => void;
  className?: string;
}) {
  const [local, setLocal] = useState<number | null>(null);
  const shown = local ?? value;
  const commit = (v: number) => {
    onCommit(v);
    setLocal(null);
  };
  return (
    <div className={className}>
      <div className="mb-2 flex justify-between text-xs uppercase tracking-eyebrow text-muted-foreground">
        <span>Luminosité</span>
        <span>{Math.round(shown)}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={shown}
        onChange={(e) => setLocal(Number(e.target.value))}
        onMouseUp={(e) => commit(Number((e.target as HTMLInputElement).value))}
        onTouchEnd={(e) => commit(Number((e.target as HTMLInputElement).value))}
        className="h-2 w-full appearance-none rounded-full bg-muted accent-primary"
      />
    </div>
  );
}

// ---------- media ----------

function MediaModule({
  media,
  onToggleRadio,
  onVolumeDown,
  onVolumeUp,
  onTogglePlay,
}: {
  media: RoomMediaView;
  onToggleRadio?: () => void;
  onVolumeDown?: () => void;
  onVolumeUp?: () => void;
  onTogglePlay?: () => void;
}) {
  const silent = media.tint === null;
  return (
    <Card variant="solid" icon={<Speaker className="h-4 w-4" />} title="Média">
      {/* Radio + volume — one button group, above the player. */}
      <div className="flex">
        <Toggle
          pressed={media.radioOn}
          onPressedChange={() => onToggleRadio?.()}
          aria-label="Radio Musiq3"
          className="flex-1 gap-1.5 rounded-r-none data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background data-[state=on]:hover:bg-foreground/90 data-[state=on]:hover:text-background"
        >
          <Radio className="h-4 w-4" />
          Musiq3
        </Toggle>
        <Button
          variant="outline"
          onClick={onVolumeDown}
          aria-label="Baisser le volume"
          className="-ml-px flex-1 rounded-none"
        >
          <Volume1 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          onClick={onVolumeUp}
          aria-label="Monter le volume"
          className="-ml-px flex-1 rounded-l-none"
        >
          <Volume2 className="h-4 w-4" />
        </Button>
      </div>

      <MediaSweep
        tint={media.tint}
        className="relative mt-3 overflow-hidden rounded-xl border border-border/60 p-5"
      >
        {silent ? (
          <div className="flex items-center gap-4 py-2">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-muted">
              <Power className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <Eyebrow size="xs">Aucun média</Eyebrow>
              <p className="mt-0.5 text-lg">Tout est silencieux</p>
              <p className="text-sm text-muted-foreground">Choisis une source pour démarrer.</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div
              className={
                "grid h-16 w-16 shrink-0 place-items-center rounded-lg shadow-lift " +
                (media.playing ? "animate-spin [animation-duration:10s]" : "")
              }
              style={{
                background: `radial-gradient(circle at 30% 30%, ${media.tint}, oklch(0.25 0.04 160))`,
              }}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-background" />
            </div>
            <div className="min-w-0 flex-1">
              <Eyebrow size="xs">{media.label}</Eyebrow>
              <p className="mt-0.5 truncate text-lg">{media.title || "—"}</p>
              {media.artist && (
                <p className="truncate text-sm text-muted-foreground">{media.artist}</p>
              )}
              <div className="mt-2 flex h-3 items-end gap-0.5">
                {[0.6, 0.9, 0.4, 1, 0.7, 0.5, 0.85].map((h, i) => (
                  <span
                    key={i}
                    className={"w-1 rounded-sm bg-foreground/70 " + (media.playing ? "eq-bar" : "")}
                    style={{ height: `${h * 100}%`, animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
            <Toggle
              pressed={media.playing}
              onPressedChange={() => onTogglePlay?.()}
              aria-label={media.playing ? "Pause" : "Lecture"}
              className="h-11 w-11 rounded-full data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background data-[state=on]:hover:bg-foreground/90 data-[state=on]:hover:text-background"
            >
              {media.playing ? <Pause /> : <Play />}
            </Toggle>
          </div>
        )}
      </MediaSweep>
    </Card>
  );
}

// ---------- climate ----------

/**
 * Simple rooms get the setpoint tabs alone; dual rooms get a Chaud/Froid switch
 * above the same tabs. Same building blocks as the light scenes, so climate reads
 * like the rest of the room.
 */
function ClimateControl({
  climate,
  onSelectMode,
  onSelectSystem,
  onSelectHeatPreset,
  onSelectCoolPreset,
}: {
  climate: RoomClimateView;
  onSelectMode?: (mode: RoomClimateMode) => void;
  onSelectSystem?: (system: "heat" | "cool") => void;
  onSelectHeatPreset?: (preset: RoomClimatePreset) => void;
  onSelectCoolPreset?: (preset: RoomClimatePreset) => void;
}) {
  if (!climate.dual) {
    return (
      <SlidingTabs
        value={String(climate.mode)}
        onValueChange={(v) => onSelectMode?.(v === "auto" ? "auto" : Number(v))}
        options={SIMPLE_MODES.map((m) => ({
          value: String(m),
          label: m === "auto" ? "Auto" : `${m}°`,
        }))}
      />
    );
  }

  const heating = climate.system === "heat";
  const presets = heating ? HEAT_PRESETS : COOL_PRESETS;
  const active = heating ? climate.heatPreset : climate.coolPreset;
  const setPreset = heating ? onSelectHeatPreset : onSelectCoolPreset;
  const choices: RoomClimatePreset[] = ["off", ...presets];

  return (
    <div className="space-y-4">
      {/* Chaud / Froid — toggle group, like the room On/Off. */}
      <ToggleGroup
        type="single"
        value={climate.system}
        onValueChange={(v) => {
          if (v) onSelectSystem?.(v as "heat" | "cool");
        }}
        className="w-full"
      >
        <ToggleGroupItem
          value="heat"
          className="flex-1 gap-1.5 data-[state=on]:bg-foreground data-[state=on]:text-background data-[state=on]:hover:bg-foreground/90 data-[state=on]:hover:text-background"
        >
          <Flame className="h-4 w-4" />
          Chaud
        </ToggleGroupItem>
        <ToggleGroupItem
          value="cool"
          className="flex-1 gap-1.5 data-[state=on]:bg-foreground data-[state=on]:text-background data-[state=on]:hover:bg-foreground/90 data-[state=on]:hover:text-background"
        >
          <Snowflake className="h-4 w-4" />
          Froid
        </ToggleGroupItem>
      </ToggleGroup>

      {/* Températures — sliding tabs, like the light scenes. */}
      <SlidingTabs
        value={String(active)}
        onValueChange={(v) => setPreset?.(v === "off" ? "off" : Number(v))}
        options={choices.map((p) => ({
          value: String(p),
          label: p === "off" ? (heating ? "Auto" : "Off") : `${p}°`,
        }))}
      />
    </div>
  );
}
