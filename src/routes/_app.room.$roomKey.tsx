import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Section } from "@/components/Card";
import { rooms, roomDetails, type RoomKey } from "@/lib/mock-data";
import { Lightbulb, Thermometer, Volume2, VolumeX, Play, Film, Music, Battery, Droplet, Sparkles, Pause } from "lucide-react";
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
          </div>
          {typeof room.temperature === "number" && (
            <p className="mt-1 text-sm text-muted-foreground">Actuellement {room.temperature.toFixed(1)}°C</p>
          )}
        </div>
      </div>

      {detail.lights && (
        <Section title="Scènes" action={<span className="text-sm text-muted-foreground">Active · {scene}</span>}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 stagger">
            {detail.lights.scenes.map((s) => {
              const active = scene === s;
              return (
                <button
                  key={s}
                  onClick={() => setScene(s)}
                  className={
                    "group relative overflow-hidden rounded-xl border p-4 text-left transition-all duration-300 " +
                    (active
                      ? "border-foreground bg-foreground text-background shadow-lift -translate-y-0.5"
                      : "border-border/60 bg-card hover:-translate-y-0.5 hover:border-border")
                  }
                >
                  <Sparkles className={"h-4 w-4 " + (active ? "anim-breathe" : "opacity-50")} />
                  <p className={"mt-3 font-serif text-lg " + (active ? "" : "")}>{s}</p>
                  <p className={"text-xs " + (active ? "opacity-70" : "text-muted-foreground")}>
                    {s === "Off" ? "Tout éteint" : "Ambiance"}
                  </p>
                </button>
              );
            })}
          </div>

          {scene === "Off" ? (
            <p className="mt-6 text-xs text-muted-foreground">
              Aucune scène active — toutes les lumières sont éteintes.
            </p>
          ) : (
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

          <details className="mt-6 group">
            <summary className="cursor-pointer text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground">
              Groupes de lumières · réglage manuel
            </summary>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {zones.map((z, i) => (
                <button
                  key={z.name}
                  onClick={() => setZones(zones.map((zz, idx) => idx === i ? { ...zz, on: !zz.on } : zz))}
                  className={"flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm transition-colors " + (z.on ? "bg-accent/15" : "bg-card")}
                >
                  <span className="flex items-center gap-2">
                    <Lightbulb className={"h-3.5 w-3.5 " + (z.on ? "text-accent-foreground anim-breathe" : "text-muted-foreground")} />
                    {z.name}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{z.on ? "On" : "Off"}</span>
                </button>
              ))}
            </div>
          </details>
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
          <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">Capteurs · batterie</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {detail.devices.batteries.map((b) => (
              <div key={b.name} className="flex items-center justify-between rounded-lg border border-border/60 bg-card p-3 text-sm">
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
  const [vol, setVol] = useState(media.volume);
  const [playing, setPlaying] = useState(true);

  return (
    <Section title="Média" action={<span className="text-sm text-muted-foreground">{media.source}</span>}>
      <div className="relative overflow-hidden rounded-2xl bg-foreground p-6 text-background">
        <div className="absolute inset-0 opacity-20" style={{
          background: "radial-gradient(circle at 20% 20%, var(--color-primary) 0%, transparent 40%), radial-gradient(circle at 80% 80%, var(--color-warm) 0%, transparent 40%)",
        }} />
        <div className="relative flex items-center gap-5">
          {/* Album art-ish disc */}
          <div className={"grid h-20 w-20 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-warm shadow-lift " + (playing ? "animate-spin [animation-duration:8s]" : "")}>
            <span className="grid h-3 w-3 place-items-center rounded-full bg-background" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.18em] opacity-60">En lecture</p>
            <p className="mt-0.5 truncate font-serif text-xl">{media.nowPlaying}</p>
            {media.artist && <p className="text-sm opacity-70">{media.artist}</p>}

            {/* Equalizer */}
            <div className="mt-3 flex h-3 items-end gap-0.5">
              {[0.6, 0.9, 0.4, 1, 0.7, 0.5, 0.85].map((h, i) => (
                <span
                  key={i}
                  className={"w-1 rounded-sm bg-primary " + (playing ? "eq-bar" : "")}
                  style={{ height: `${h * 100}%`, animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
          <button
            onClick={() => setPlaying(!playing)}
            className="grid h-12 w-12 place-items-center rounded-full bg-background text-foreground transition-transform hover:scale-105 active:scale-95"
            aria-label={playing ? "Pause" : "Lecture"}
          >
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <ActionButton icon={<Music className="h-4 w-4" />} label="Musique" />
        <ActionButton icon={<Play className="h-4 w-4" />} label="Netflix" />
        <ActionButton icon={<Film className="h-4 w-4" />} label="Cinéma" />
      </div>

      <div className="mt-5">
        <div className="mb-2 flex justify-between text-xs uppercase tracking-[0.18em] text-muted-foreground">
          <span>Volume</span><span>{vol}</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setVol(Math.max(0, vol - 5))} className="grid h-9 w-9 place-items-center rounded-full bg-secondary transition-transform active:scale-90"><VolumeX className="h-4 w-4" /></button>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${vol}%` }} />
          </div>
          <button onClick={() => setVol(Math.min(100, vol + 5))} className="grid h-9 w-9 place-items-center rounded-full bg-secondary transition-transform active:scale-90"><Volume2 className="h-4 w-4" /></button>
        </div>
      </div>
    </Section>
  );
}

function ActionButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  const [triggered, setTriggered] = useState(false);
  return (
    <button
      onClick={() => { setTriggered(true); setTimeout(() => setTriggered(false), 1200); }}
      className={"flex flex-col items-center gap-1.5 rounded-xl border border-border/60 p-3 text-sm transition-all duration-300 " + (triggered ? "bg-primary text-primary-foreground -translate-y-0.5" : "bg-card hover:-translate-y-0.5 hover:border-border")}
    >
      {icon}
      <span>{triggered ? "Lancé" : label}</span>
    </button>
  );
}
