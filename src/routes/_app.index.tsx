import { createFileRoute, Link } from "@tanstack/react-router";
import { Tile } from "@/components/Card";
import { rooms, tesla, reseau, energie, calendrier } from "@/lib/mock-data";
import { Lightbulb, Thermometer, Wind, Wifi, Car, Trash2, Plug, ArrowRight, Gauge } from "lucide-react";

export const Route = createFileRoute("/_app/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Maison — Cockpit" },
      { name: "description", content: "Tableau de bord domestique : pièces, Tesla, réseau et énergie en un coup d'œil." },
    ],
  }),
});

function Dashboard() {
  const visibleRooms = rooms.filter((r) => r.hasSensors);
  const now = new Date();
  const greeting = now.getHours() < 12 ? "Bonjour" : now.getHours() < 18 ? "Bon après-midi" : "Bonsoir";
  const dateStr = now.toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="space-y-8">
      <div className="px-1">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{dateStr}</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
          {greeting}.
        </h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          Voici l'état de la maison et les actions en cours.
        </p>
      </div>

      <div className="grid-bento">
        {/* Hero Tesla */}
        <Tile span={3} rowSpan={2} tone="dark" to="/tesla">
          <div className="flex h-full flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] opacity-60">Tesla</p>
                <p className="mt-1 font-serif text-2xl">Model · Garage</p>
              </div>
              <Car className="h-5 w-5 opacity-60" />
            </div>

            <div className="my-6">
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-7xl tracking-tight">{tesla.charge}</span>
                <span className="text-2xl opacity-60">%</span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-background/15">
                <div className="h-full rounded-full bg-primary" style={{ width: `${tesla.charge}%` }} />
                <div className="-mt-1.5 h-1.5 w-px bg-background/40" style={{ marginLeft: `${tesla.chargeLimit}%` }} />
              </div>
              <p className="mt-2 text-xs opacity-60">Limite {tesla.chargeLimit}% · {tesla.rangeKm} km</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-background/8 p-3">
                <Plug className="mb-2 h-4 w-4 opacity-70" />
                <p className="opacity-60 text-xs">Charge</p>
                <p className="font-medium">{tesla.pluggedIn ? "Branchée" : "Débranchée"}</p>
              </div>
              <div className="rounded-2xl bg-background/8 p-3">
                <Thermometer className="mb-2 h-4 w-4 opacity-70" />
                <p className="opacity-60 text-xs">Int / Ext</p>
                <p className="font-medium">{tesla.interior}° / {tesla.exterior}°</p>
              </div>
            </div>
          </div>
        </Tile>

        {/* Réseau */}
        <Tile span={3} to="/reseau">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Réseau</p>
              <p className="mt-1 font-serif text-xl">Tout est en ligne</p>
            </div>
            <Wifi className="h-5 w-5 text-success" />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 text-xs">
            <Pill label="WiFi 1" on={reseau.wifi1} />
            <Pill label="WiFi 2" on={reseau.wifi2} />
            <Pill label="Internet" on={reseau.internet} />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-3xl font-serif tracking-tight">{reseau.speedMbps}<span className="text-sm font-sans text-muted-foreground"> Mbps</span></p>
              <p className="text-xs text-muted-foreground">Speedtest · il y a 2 min</p>
            </div>
            <Gauge className="h-5 w-5 text-muted-foreground" />
          </div>
        </Tile>

        {/* Énergie contextual */}
        {energie.monthlyDue && (
          <Tile span={3} tone="warm">
            <p className="text-xs uppercase tracking-[0.18em] opacity-70">Énergie</p>
            <p className="mt-1 font-serif text-xl">Relevé mensuel à saisir</p>
            <p className="mt-1 text-sm opacity-80">3 compteurs en attente — eau, électricité, mazout.</p>
            <Link
              to="/energie/saisie"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
            >
              Saisir <ArrowRight className="h-4 w-4" />
            </Link>
          </Tile>
        )}

        {/* Calendrier contextual */}
        <Tile span={2} tone="accent">
          <Trash2 className="h-5 w-5 opacity-70" />
          <p className="mt-3 font-serif text-xl">Poubelles {calendrier.poubelleToday.type}</p>
          <p className="text-sm opacity-80">Sortie aujourd'hui · {calendrier.poubelleToday.time}</p>
        </Tile>

        {/* Rooms */}
        {visibleRooms.map((room) => (
          <Tile key={room.key} to={`/room/${room.key}`}>
            <div className="flex items-start justify-between">
              <p className="font-serif text-xl">{room.name}</p>
              {typeof room.lightsOn === "boolean" && (
                <span className={"flex h-7 w-7 items-center justify-center rounded-full " + (room.lightsOn ? "bg-accent/30 text-accent-foreground" : "bg-secondary text-muted-foreground")}>
                  <Lightbulb className="h-3.5 w-3.5" />
                </span>
              )}
            </div>

            {typeof room.temperature === "number" && (
              <p className="mt-6 font-serif text-4xl tracking-tight">
                {room.temperature.toFixed(1)}<span className="text-base text-muted-foreground">°C</span>
              </p>
            )}

            {room.climate && (
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Wind className="h-3.5 w-3.5" />
                {room.climate.on
                  ? <span>Climat actif · cible {room.climate.setpoint}°</span>
                  : <span>Climat éteint</span>}
              </div>
            )}
          </Tile>
        ))}
      </div>
    </div>
  );
}

function Pill({ label, on }: { label: string; on: boolean }) {
  return (
    <div className={"flex items-center justify-between rounded-full px-2.5 py-1 " + (on ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>
      <span>{label}</span>
      <span className={"h-1.5 w-1.5 rounded-full " + (on ? "bg-success" : "bg-muted-foreground/40")} />
    </div>
  );
}
