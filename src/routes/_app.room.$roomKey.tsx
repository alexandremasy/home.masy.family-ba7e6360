import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Section } from "@/components/Card";
import { rooms, roomDetails, type RoomKey } from "@/lib/mock-data";
import { Lightbulb, Thermometer, Volume2, VolumeX, Play, Battery, Droplet, Sparkles, Pause, Power, Radio, Tv, Music as MusicIcon } from "lucide-react";
import { RoomIcon } from "@/components/RoomIcon";

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

function RoomPage() {
  const data = Route.useLoaderData() as { room: typeof rooms[number] };
  const room = data.room;
  const detail = roomDetails[room.key];
  const [zones, setZones] = useState(detail.lights?.zones ?? []);
  const [scene, setScene] = useState(detail.lights?.scene ?? "Off");
  const [brightness, setBrightness] = useState(detail.lights?.brightness ?? 0);
  const [mode, setMode] = useState<ClimateMode>(detail.climate?.mode ?? "auto");
  const [roomOn, setRoomOn] = useState(true);

  return (
    <div className="space-y-6">
      <div className="page-header sticky top-0 z-20 -mx-5 -mt-7 px-5 pt-7 pb-4 sm:-mx-8 sm:-mt-10 sm:px-8 sm:pt-10">
        <div className="page-header__bg pointer-events-none absolute inset-0 bg-background/85 backdrop-blur-xl" />
        <div className="page-header__fade pointer-events-none absolute inset-x-0 top-full h-8 bg-gradient-to-b from-background to-transparent" />
        <div className="relative">
          <Link to="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">← Cockpit</Link>
          <div className="mt-2 flex items-center gap-3">
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
            <button
              onClick={() => setRoomOn(!roomOn)}
              aria-pressed={roomOn}
              aria-label={roomOn ? "Tout éteindre" : "Tout allumer"}
              className={"ml-auto inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.18em] transition-all " + (roomOn
                ? "border-foreground bg-foreground text-background shadow-lift"
                : "border-border/60 bg-card text-muted-foreground hover:border-border")}
            >
              <Power className={"h-3.5 w-3.5 " + (roomOn ? "anim-breathe" : "")} />
              {roomOn ? "On" : "Off"}
            </button>
          </div>
          {typeof room.temperature === "number" && (
            <p className="mt-1 text-sm text-muted-foreground">Actuellement {room.temperature.toFixed(1)}°C</p>
          )}
        </div>
      </div>

      {detail.lights && (
        <Section title="Luminosité" action={<span className="text-sm text-muted-foreground">Active · {scene}</span>}>
          <div className="grid grid-cols-2 gap-2 stagger sm:grid-cols-4">
            {detail.lights.scenes.map((s) => {
              const active = scene === s;
              return (
                <button
                  key={s}
                  onClick={() => setScene(s)}
                  className={
                    "group relative flex flex-col items-center gap-1 overflow-hidden rounded-xl border px-2 py-3 transition-all duration-300 " +
                    (active
                      ? "border-foreground bg-foreground text-background shadow-lift -translate-y-0.5"
                      : "border-border/60 bg-card hover:-translate-y-0.5 hover:border-border")
                  }
                >
                  <Sparkles className={"h-3.5 w-3.5 " + (active ? "anim-breathe" : "opacity-50")} />
                  <span className="font-serif text-base leading-none">{s}</span>
                </button>
              );
            })}
          </div>

          {scene !== "Off" && !detail.lights.hideBrightness && (
            <div className="mt-6">
              <div className="mb-2 flex justify-between text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <span>Luminosité</span><span>{brightness}%</span>
              </div>
              <input
                type="range" min={0} max={100} value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="h-2 w-full appearance-none rounded-full bg-muted accent-primary"
              />
            </div>
          )}

          <div className="mt-6">
            <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">Zones</p>
            <div className="flex flex-wrap gap-1.5">
              {zones.map((z, i) => (
                <button
                  key={z.name}
                  onClick={() => setZones(zones.map((zz, idx) => idx === i ? { ...zz, on: !zz.on } : zz))}
                  className={"inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all " + (z.on ? "border-foreground bg-foreground text-background shadow-lift" : "border-border/60 bg-card text-muted-foreground hover:border-border hover:text-foreground")}
                >
                  <Lightbulb className={"h-3 w-3 " + (z.on ? "anim-breathe" : "opacity-50")} />
                  {z.name}
                </button>
              ))}
            </div>
          </div>
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
          <div className="grid grid-cols-4 gap-2 stagger">
            {(["auto", 20, 21, 22] as const).map((m) => {
              const active = mode === m;
              const label = m === "auto" ? "Auto" : `${m}°`;
              const sub = m === "auto" ? "off" : "on";
              return (
                <button
                  key={String(m)}
                  onClick={() => setMode(m)}
                  className={
                    "flex flex-col items-center gap-1 rounded-xl border px-3 py-4 transition-all duration-300 " +
                    (active
                      ? "border-foreground bg-foreground text-background -translate-y-0.5 shadow-lift"
                      : "border-border/60 bg-card hover:-translate-y-0.5 hover:border-border")
                  }
                >
                  <span className="font-serif text-2xl leading-none">{label}</span>
                  <span className={"text-[10px] uppercase tracking-wider " + (active ? "opacity-70" : "text-muted-foreground")}>
                    {sub}
                  </span>
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {detail.media && room.key === "salon" && <MediaSection media={detail.media} />}

      {detail.devices && (
        <Section title="Périphériques">
          {detail.devices.ink && (
            <div className="mb-6">
              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">Imprimante · niveaux d'encre</p>
              <div className="grid grid-cols-4 gap-3 stagger">
                {([
                  ["Cyan", detail.devices.ink.c, "oklch(0.78 0.13 200)"],
                  ["Magenta", detail.devices.ink.m, "oklch(0.65 0.22 350)"],
                  ["Jaune", detail.devices.ink.y, "oklch(0.86 0.16 95)"],
                  ["Noir", detail.devices.ink.k, "oklch(0.30 0.02 230)"],
                ] as const).map(([name, val, color]) => (
                  <div key={name} className="rounded-xl border border-border/60 bg-card p-3">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground"><Droplet className="h-3 w-3" />{name}</div>
                    <p className="mt-1.5 font-serif text-xl">{val}%</p>
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
              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">Appareils</p>
              <AppliancesGrid items={detail.devices.appliances} />
            </div>
          )}
          <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">Batteries</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {detail.devices.batteries.map((b) => (
              <div key={b.name} className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-3 text-sm">
                <span className="flex items-center gap-2"><Battery className="h-4 w-4 text-muted-foreground" />{b.name}</span>
                <span className={"font-medium " + (b.level < 20 ? "text-destructive" : "")}>{b.level}%</span>
              </div>
            ))}
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
            <button
              onClick={() => { setSource("off"); setPlaying(false); }}
              className="grid h-7 w-7 place-items-center rounded-full border border-border/60 bg-card text-muted-foreground transition-colors hover:text-foreground hover:border-border"
              aria-label="Couper le média"
              title="Couper"
            >
              <Power className="h-3 w-3" />
            </button>
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
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Spotify · en lecture</p>
              <p className="mt-0.5 truncate font-serif text-xl">{media.nowPlaying ?? "—"}</p>
              {media.artist && <p className="truncate text-sm text-muted-foreground">{media.artist}</p>}
              <div className="mt-2 flex h-3 items-end gap-0.5">
                {[0.6, 0.9, 0.4, 1, 0.7, 0.5, 0.85].map((h, i) => (
                  <span key={i} className={"w-1 rounded-sm bg-foreground/70 " + (playing ? "eq-bar" : "")}
                        style={{ height: `${h * 100}%`, animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </div>
            <button onClick={() => setPlaying(!playing)}
                    className="grid h-11 w-11 place-items-center rounded-full bg-foreground text-background transition-transform hover:scale-105 active:scale-95"
                    aria-label={playing ? "Pause" : "Lecture"}>
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          </div>
        )}
        {source === "netflix" && (
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg shadow-lift"
                 style={{ background: `linear-gradient(135deg, ${active.tint}, oklch(0.25 0.08 25))` }}>
              <Tv className="h-6 w-6 text-background" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Netflix</p>
              <p className="mt-0.5 truncate font-serif text-xl">Téléviseur allumé</p>
              <p className="truncate text-sm text-muted-foreground">Source HDMI · Apple TV</p>
            </div>
            <button onClick={() => setPlaying(!playing)}
                    className="grid h-11 w-11 place-items-center rounded-full bg-foreground text-background transition-transform hover:scale-105 active:scale-95"
                    aria-label={playing ? "Pause" : "Lecture"}>
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          </div>
        )}
        {source === "off" && (
          <div className="flex items-center gap-4 py-2">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-muted">
              <Power className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Aucun média</p>
              <p className="mt-0.5 font-serif text-xl">Tout est silencieux</p>
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
      {state.map((a, i) => (
        <button
          key={a.name}
          onClick={() => setState(state.map((s, idx) => idx === i ? { ...s, on: !s.on } : s))}
          className={"flex items-center justify-between rounded-xl border px-3 py-3 text-sm transition-all " + (a.on ? "border-foreground bg-foreground text-background shadow-lift" : "border-border/60 bg-card hover:border-border")}
        >
          <span className="flex items-center gap-2">
            <Power className={"h-3.5 w-3.5 " + (a.on ? "anim-breathe" : "opacity-50")} />
            {a.name}
          </span>
          <span className={"text-[10px] uppercase tracking-wider " + (a.on ? "opacity-70" : "text-muted-foreground")}>{a.on ? "On" : "Off"}</span>
        </button>
      ))}
    </div>
  );
}

function ActionButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  const [triggered, setTriggered] = useState(false);
  return (
    <button
      onClick={() => { onClick?.(); setTriggered(true); setTimeout(() => setTriggered(false), 800); }}
      className={"flex flex-col items-center gap-1.5 rounded-xl border border-border/60 p-3 text-sm transition-all duration-300 " + (triggered ? "bg-primary text-primary-foreground -translate-y-0.5" : "bg-card hover:-translate-y-0.5 hover:border-border")}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
