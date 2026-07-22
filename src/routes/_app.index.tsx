import { createFileRoute } from "@tanstack/react-router";
import { Dashboard as DashboardTemplate, type DashboardRoomView } from "@/templates/dashboard";
import type { IdleRoomView } from "@/components/idle-rooms-tile";

import { rooms, tesla, reseau, energie, calendrier, meteo, type Room } from "@/lib/mock-data";
import {
  people,
  nextBirthday,
  upcomingAge,
  daysUntil,
  initialPlan,
  dishById,
  iso,
  TODAY,
} from "@/lib/maison-data";

export const Route = createFileRoute("/_app/")({
  // Dashboard is rendered by the parent _app layout (so it stays visible
  // behind child-route modals). The index route itself renders nothing.
  component: () => null,
  head: () => ({
    meta: [
      { title: "Maison — Cockpit" },
      {
        name: "description",
        content:
          "Tableau de bord domestique : pièces, Bernard, réseau et énergie en un coup d'œil.",
      },
    ],
  }),
});

/** A room nobody is in, with everything off, doesn't deserve a slot of its own. */
const isIdle = (r: Room) => !r.lightsOn && !r.occupied;

function mealsOn(date: Date) {
  const key = iso(date);
  const at = (slot: "midi" | "soir") => {
    const e = initialPlan.find((x) => x.date === key && x.slot === slot);
    return e ? (dishById(e.dishId)?.name ?? undefined) : undefined;
  };
  return { midi: at("midi"), soir: at("soir") };
}

function nextBirthdayView() {
  const [first] = [...people]
    .map((p) => ({ p, days: daysUntil(nextBirthday(p)) }))
    .sort((a, b) => a.days - b.days);
  if (!first) return undefined;
  return {
    to: "/anniversaires",
    name: first.p.name,
    age: upcomingAge(first.p),
    days: first.days,
  };
}

/**
 * The mock side of the dashboard: it reads the in-memory house and hands the
 * template a page's worth of props. The cockpit does the same job against the api.
 */
export function Dashboard() {
  const visibleRooms = rooms.filter((r) => r.hasSensors);
  const salonRoom = visibleRooms.find((r) => r.key === "salon" && !isIdle(r));
  const roomCells: DashboardRoomView[] = visibleRooms
    .filter((r) => !isIdle(r) && r.key !== "salon")
    .map((r) => ({
      key: r.key,
      to: `/room/${r.key}`,
      name: r.name,
      icon: r.icon,
      temperature: typeof r.temperature === "number" ? r.temperature : undefined,
      lightsOn: !!r.lightsOn,
      climate: r.climate ?? undefined,
      wide: r.key === "bureau",
    }));
  const idleRooms: IdleRoomView[] = visibleRooms.filter(isIdle).map((r) => ({
    key: r.key,
    to: `/room/${r.key}`,
    name: r.name,
    icon: r.icon,
    temperature: typeof r.temperature === "number" ? r.temperature : undefined,
  }));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
  const today = mealsOn(TODAY);

  return (
    <DashboardTemplate
      greeting={greeting}
      repas={{
        to: "/repas",
        dateLabel: TODAY.toLocaleDateString("fr-BE", {
          weekday: "long",
          day: "numeric",
          month: "long",
        }),
        midi: today.midi,
        soir: today.soir,
      }}
      poubelle={{ type: calendrier.poubelleToday.type, time: calendrier.poubelleToday.time }}
      birthday={nextBirthdayView()}
      salon={
        salonRoom && {
          to: `/room/${salonRoom.key}`,
          name: salonRoom.name,
          icon: salonRoom.icon,
          lightsOn: !!salonRoom.lightsOn,
          source: "spotify",
          media: "Linked · Bonobo",
          playing: true,
        }
      }
      rooms={roomCells}
      idleRooms={idleRooms}
      weather={{ today: { ...meteo.today }, forecast: meteo.forecast }}
      energie={{
        due: energie.monthlyDue,
        to: "/energie",
        saisieTo: "/energie/saisie",
        electricity: {
          value: `${energie.electricity.dailyKWh} kWh/j`,
          trend: energie.electricity.trend,
          trendPct: energie.electricity.trendPct,
          status: energie.electricity.status,
        },
        water: {
          value: `${energie.water.dailyM3} m³/j`,
          trend: energie.water.trend,
          trendPct: energie.water.trendPct,
          status: energie.water.status,
        },
        oil: {
          value: `${energie.oil.tankPct}%`,
          sub: `~${energie.oil.autonomyDays} j`,
          status: energie.oil.status,
          low: energie.oil.tankPct < 25,
        },
      }}
      bernard={{
        to: "/tesla",
        charge: tesla.charge,
        rangeKm: tesla.rangeKm,
        chargeLimit: tesla.chargeLimit,
        pluggedIn: tesla.pluggedIn,
        state: tesla.inGarage ? "garage" : "driving",
        location: tesla.location,
        interior: tesla.interior,
        exterior: tesla.exterior,
      }}
      reseau={{
        to: "/securite/reseau",
        downMbps: reseau.internet.lastSpeedtest.downMbps,
        upMbps: reseau.internet.lastSpeedtest.upMbps,
        pingMs: reseau.internet.lastSpeedtest.pingMs,
        testedWhen: reseau.internet.lastSpeedtest.when,
        clients: reseau.wifi1.clients + reseau.wifi2.clients,
        cpuPct: reseau.homelab.cpu,
        uptimeDays: reseau.homelab.uptimeDays,
      }}
    />
  );
}
