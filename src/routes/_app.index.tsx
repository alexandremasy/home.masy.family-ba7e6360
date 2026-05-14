import { createFileRoute, Link } from "@tanstack/react-router";
import { Tile } from "@/components/Card";
import { rooms, tesla, reseau, energie, calendrier, footerLines } from "@/lib/mock-data";
import { Lightbulb, Wind, Wifi, Car, Trash2, Plug, ArrowRight, Droplet, Sun, Moon, Flame, MapPin, Sparkles, Check } from "lucide-react";

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
      <div className="px-1 anim-slide-up">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{dateStr}</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
          {greeting}.
        </h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          Voici l'état de la maison — événements et pièces en priorité.
        </p>
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
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Énergie · ce mois</p>
                <p className="mt-1 font-serif text-xl">À jour</p>
              </div>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-success/15 text-success">
                <Check className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="mt-5 grid grid-cols-4 gap-3">
              <Mini icon={<Droplet className="h-3.5 w-3.5" />} label="Eau" value={energie.current.eau} unit="m³" trend={energie.trend.eau} />
              <Mini icon={<Sun className="h-3.5 w-3.5" />} label="Jour" value={energie.current.jour} unit="kWh" trend={energie.trend.jour} />
              <Mini icon={<Moon className="h-3.5 w-3.5" />} label="Nuit" value={energie.current.nuit} unit="kWh" trend={energie.trend.nuit} />
              <Mini icon={<Flame className="h-3.5 w-3.5" />} label="Mazout" value={energie.current.mazout} unit="L" trend={energie.trend.mazout} />
            </div>
          </Tile>
        )}

        <Tile span={3} tone="accent">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] opacity-70">Aujourd'hui</p>
              <p className="mt-1 font-serif text-xl">Poubelles {calendrier.poubelleToday.type}</p>
              <p className="text-sm opacity-80">À sortir avant {calendrier.poubelleToday.time}</p>
            </div>
            <Trash2 className="h-6 w-6 opacity-70 anim-wiggle" />
          </div>
        </Tile>

        {/* PRIORITY 2 — Rooms */}
        {visibleRooms.map((room) => (
          <Tile key={room.key} to={`/room/${room.key}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-serif text-xl">{room.name}</p>
                {room.scene && room.scene !== "Off" && (
                  <p className="mt-0.5 text-xs uppercase tracking-[0.14em] text-muted-foreground">Scène · {room.scene}</p>
                )}
              </div>
              <RoomStatus on={!!room.lightsOn} occupied={!!room.occupied} />
            </div>

            {typeof room.temperature === "number" && (
              <p className="mt-6 font-serif text-4xl tracking-tight">
                {room.temperature.toFixed(1)}<span className="text-base text-muted-foreground">°C</span>
              </p>
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
          </Tile>
        ))}

        {/* PRIORITY 3 — Tesla (compact) */}
        <Tile span={3} to="/tesla" tone="dark">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] opacity-60">Tesla</p>
              <p className="mt-1 font-serif text-xl">{tesla.inGarage ? "Au garage" : "En déplacement"}</p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-xs opacity-60">
                <MapPin className="h-3 w-3" />{tesla.location}
              </p>
            </div>
            <Car className="h-5 w-5 opacity-60" />
          </div>

          <div className="mt-4 flex items-end gap-6">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-5xl tracking-tight">{tesla.charge}</span>
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
            <span className="relative grid h-7 w-7 place-items-center rounded-full bg-success/15 text-success">
              <Wifi className="h-3.5 w-3.5" />
              <span className="absolute inset-0 rounded-full ring-2 ring-success/30 anim-blink" />
            </span>
          </div>
          <div className="mt-4 space-y-1.5 text-sm">
            <NetRow label={reseau.wifi1.ssid} on={reseau.wifi1.on} />
            <NetRow label={reseau.wifi2.ssid} on={reseau.wifi2.on} />
          </div>
        </Tile>
      </div>

      <FunFooter />
    </div>
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

function NetRow({ label, on }: { label: string; on: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-mono text-xs text-muted-foreground">{label}</span>
      <span className={"flex items-center gap-1.5 text-xs " + (on ? "text-success" : "text-muted-foreground")}>
        <span className={"h-1.5 w-1.5 rounded-full " + (on ? "bg-success" : "bg-muted-foreground/40")} />
        {on ? "OK" : "Off"}
      </span>
    </div>
  );
}

function Mini({ icon, label, value, unit, trend }: { icon: React.ReactNode; label: string; value: number; unit: string; trend: number }) {
  const better = trend < 0;
  return (
    <div className="rounded-xl bg-secondary/60 p-3">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{icon}{label}</div>
      <p className="mt-1.5 font-serif text-lg leading-none">{value}<span className="ml-0.5 text-[10px] text-muted-foreground">{unit}</span></p>
      <p className={"mt-1 text-[10px] " + (better ? "text-success" : "text-warm")}>
        {better ? "↓" : "↑"} {Math.abs(trend)}
      </p>
    </div>
  );
}

// FunFooter is also rendered by the layout, but we keep nothing here — it's elsewhere.
function FunFooter() { return null; }
