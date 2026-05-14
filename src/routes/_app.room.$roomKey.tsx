import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Section } from "@/components/Card";
import { rooms, roomDetails, type RoomKey } from "@/lib/mock-data";
import { Lightbulb, Power, Thermometer, Volume2, VolumeX, Play, Film, Music, Battery, Droplet } from "lucide-react";

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

function RoomPage() {
  const { room } = Route.useLoaderData();
  const detail = roomDetails[room.key];
  const [zones, setZones] = useState(detail.lights?.zones ?? []);
  const [scene, setScene] = useState(detail.lights?.scene ?? "Off");
  const [brightness, setBrightness] = useState(detail.lights?.brightness ?? 0);
  const [climateOn, setClimateOn] = useState(detail.climate?.on ?? false);
  const [setpoint, setSetpoint] = useState(detail.climate?.setpoint ?? 21);

  return (
    <div className="space-y-6">
      <div className="px-1">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Cockpit</Link>
        <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">{room.name}</h1>
        {typeof room.temperature === "number" && (
          <p className="mt-1 text-muted-foreground">Actuellement {room.temperature.toFixed(1)}°C</p>
        )}
      </div>

      {detail.lights && (
        <Section title="Lumières" action={<span className="text-sm text-muted-foreground">Scène · {scene}</span>}>
          <div className="grid gap-3 sm:grid-cols-2">
            {zones.map((z, i) => (
              <button
                key={z.name}
                onClick={() => setZones(zones.map((zz, idx) => idx === i ? { ...zz, on: !zz.on } : zz))}
                className={"group flex items-center justify-between rounded-2xl border border-border/60 p-4 transition-colors " + (z.on ? "bg-accent/15" : "bg-card")}
              >
                <span className="flex items-center gap-3">
                  <span className={"flex h-9 w-9 items-center justify-center rounded-full " + (z.on ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground")}>
                    <Lightbulb className="h-4 w-4" />
                  </span>
                  <span className="font-medium">{z.name}</span>
                </span>
                <span className={"text-xs uppercase tracking-wider " + (z.on ? "text-accent-foreground/80" : "text-muted-foreground")}>{z.on ? "On" : "Off"}</span>
              </button>
            ))}
          </div>

          <div className="mt-6">
            <p className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">Scènes</p>
            <div className="flex flex-wrap gap-2">
              {detail.lights.scenes.map((s) => (
                <button
                  key={s}
                  onClick={() => setScene(s)}
                  className={"rounded-full px-4 py-1.5 text-sm transition-colors " + (scene === s ? "bg-foreground text-background" : "bg-secondary text-foreground hover:bg-muted")}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {scene === "Off" || !detail.lights.scenes.includes(scene) ? null : null}
          {scene === "Off" && (
            <div className="mt-6">
              <div className="mb-2 flex justify-between text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <span>Luminosité globale</span><span>{brightness}%</span>
              </div>
              <input
                type="range" min={0} max={100} value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="h-2 w-full appearance-none rounded-full bg-muted accent-primary"
              />
            </div>
          )}
        </Section>
      )}

      {detail.climate && (
        <Section title="Climatisation">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => setClimateOn(!climateOn)}
              className={"inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors " + (climateOn ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground")}
            >
              <Power className="h-4 w-4" />
              {climateOn ? "Actif · contrôle manuel" : "Auto"}
            </button>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Thermometer className="h-4 w-4" />
              <span>Actuel <strong className="text-foreground">{detail.climate.current}°</strong></span>
            </div>
          </div>
          <div className="mt-6">
            <p className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">Cible rapide</p>
            <div className="grid grid-cols-3 gap-3">
              {[20, 21, 22].map((t) => (
                <button
                  key={t}
                  onClick={() => { setSetpoint(t); setClimateOn(true); }}
                  className={"rounded-2xl border border-border/60 px-4 py-5 font-serif text-2xl transition-all " + (setpoint === t && climateOn ? "bg-foreground text-background" : "bg-card hover:bg-secondary")}
                >
                  {t}°
                </button>
              ))}
            </div>
          </div>
        </Section>
      )}

      {detail.media && room.key === "salon" && <MediaSection media={detail.media} />}

      {detail.devices && (
        <Section title="Périphériques">
          {detail.devices.ink && (
            <div className="mb-6">
              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">Imprimante · niveaux d'encre</p>
              <div className="grid grid-cols-4 gap-3">
                {([
                  ["Cyan", detail.devices.ink.c, "oklch(0.78 0.13 200)"],
                  ["Magenta", detail.devices.ink.m, "oklch(0.65 0.22 350)"],
                  ["Jaune", detail.devices.ink.y, "oklch(0.86 0.16 95)"],
                  ["Noir", detail.devices.ink.k, "oklch(0.30 0.02 230)"],
                ] as const).map(([name, val, color]) => (
                  <div key={name} className="rounded-2xl border border-border/60 bg-card p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground"><Droplet className="h-3 w-3" />{name}</div>
                    <p className="mt-2 font-serif text-2xl">{val}%</p>
                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full" style={{ width: `${val}%`, background: color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">Capteurs · batterie</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {detail.devices.batteries.map((b) => (
              <div key={b.name} className="flex items-center justify-between rounded-2xl border border-border/60 bg-card p-4">
                <span className="flex items-center gap-3"><Battery className="h-4 w-4 text-muted-foreground" />{b.name}</span>
                <span className="font-medium">{b.level}%</span>
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
  return (
    <Section title="Média" action={<span className="text-sm text-muted-foreground">{media.source}</span>}>
      <div className="rounded-2xl bg-foreground p-5 text-background">
        <p className="text-xs uppercase tracking-[0.18em] opacity-60">En lecture</p>
        <p className="mt-1 font-serif text-2xl">{media.nowPlaying}</p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <ActionButton icon={<Music className="h-4 w-4" />} label="Musique" />
        <ActionButton icon={<Play className="h-4 w-4" />} label="Netflix" />
        <ActionButton icon={<Film className="h-4 w-4" />} label="Cinéma" />
      </div>

      <div className="mt-5">
        <div className="mb-2 flex justify-between text-xs uppercase tracking-[0.18em] text-muted-foreground">
          <span>Volume</span><span>{vol}</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setVol(Math.max(0, vol - 5))} className="grid h-10 w-10 place-items-center rounded-full bg-secondary"><VolumeX className="h-4 w-4" /></button>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${vol}%` }} />
          </div>
          <button onClick={() => setVol(Math.min(100, vol + 5))} className="grid h-10 w-10 place-items-center rounded-full bg-secondary"><Volume2 className="h-4 w-4" /></button>
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
      className={"flex flex-col items-center gap-2 rounded-2xl border border-border/60 p-4 transition-all " + (triggered ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary")}
    >
      {icon}
      <span className="text-sm">{triggered ? "Lancé" : label}</span>
    </button>
  );
}
