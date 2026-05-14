export type RoomKey = "buanderie" | "cuisine" | "salon" | "escalier" | "bureau" | "chambre";

export interface Room {
  key: RoomKey;
  name: string;
  hasSensors: boolean;
  lightsOn?: boolean;
  temperature?: number;
  climate?: { on: boolean; setpoint?: number };
}

export const rooms: Room[] = [
  { key: "salon", name: "Salon", hasSensors: true, lightsOn: true, temperature: 21.4, climate: { on: true, setpoint: 21 } },
  { key: "cuisine", name: "Cuisine", hasSensors: true, lightsOn: false, temperature: 22.1, climate: { on: false } },
  { key: "bureau", name: "Bureau", hasSensors: true, lightsOn: true, temperature: 20.8, climate: { on: true, setpoint: 21 } },
  { key: "chambre", name: "Chambre", hasSensors: true, lightsOn: false, temperature: 19.6, climate: { on: false } },
  { key: "buanderie", name: "Buanderie", hasSensors: true, lightsOn: false, temperature: 18.9 },
  { key: "escalier", name: "Escalier", hasSensors: false },
];

export const tesla = {
  charge: 74,
  pluggedIn: true,
  chargeLimit: 80,
  rangeKm: 310,
  interior: 21,
  exterior: 14,
};

export const reseau = {
  wifi1: true,
  wifi2: true,
  internet: true,
  speedMbps: 450,
  homelab: { cpu: 28, memory: 61, disk: 42 },
  twingate: true,
  services: [
    { name: "Portainer", url: "https://portainer.local" },
    { name: "Traefik", url: "https://traefik.local" },
    { name: "Grafana", url: "https://grafana.local" },
  ],
};

export const energie = {
  monthlyDue: true,
  history: [
    { month: "Jan", eau: 8.2, jour: 210, nuit: 165, mazout: 1850 },
    { month: "Fév", eau: 7.6, jour: 198, nuit: 172, mazout: 1620 },
    { month: "Mar", eau: 9.1, jour: 184, nuit: 158, mazout: 1430 },
    { month: "Avr", eau: 8.4, jour: 162, nuit: 140, mazout: 1280 },
    { month: "Mai", eau: 9.8, jour: 148, nuit: 132, mazout: 1180 },
  ],
};

export const calendrier = {
  poubelleToday: { type: "PMC", icon: "♻️", time: "07:00" },
};

// Room detail mocks
export const roomDetails: Record<RoomKey, {
  lights?: { zones: { name: string; on: boolean }[]; scene: string; scenes: string[]; brightness: number };
  climate?: { on: boolean; current: number; setpoint: number };
  media?: { nowPlaying: string; source: string; volume: number };
  devices?: { ink?: { c: number; m: number; y: number; k: number }; batteries: { name: string; level: number }[] };
}> = {
  salon: {
    lights: { zones: [{ name: "Plafond", on: false }, { name: "Lampes", on: true }, { name: "TV bias", on: true }], scene: "Film", scenes: ["Film", "Lecture", "Soirée", "Off"], brightness: 35 },
    climate: { on: true, current: 21.4, setpoint: 21 },
    media: { nowPlaying: "Bonobo — Linked", source: "Spotify", volume: 28 },
    devices: { batteries: [{ name: "Capteur canapé", level: 84 }, { name: "Télécommande", level: 62 }] },
  },
  cuisine: {
    lights: { zones: [{ name: "Plan de travail", on: false }, { name: "Îlot", on: false }], scene: "Off", scenes: ["Cuisine", "Dîner", "Off"], brightness: 0 },
    climate: { on: false, current: 22.1, setpoint: 21 },
    devices: { batteries: [{ name: "Capteur four", level: 91 }, { name: "Capteur frigo", level: 78 }] },
  },
  bureau: {
    lights: { zones: [{ name: "Bureau", on: true }, { name: "Étagère", on: true }], scene: "Travail", scenes: ["Travail", "Lecture", "Off"], brightness: 70 },
    climate: { on: true, current: 20.8, setpoint: 21 },
    devices: {
      ink: { c: 72, m: 58, y: 64, k: 81 },
      batteries: [{ name: "Capteur fenêtre", level: 78 }, { name: "Souris", level: 91 }],
    },
  },
  chambre: {
    lights: { zones: [{ name: "Plafond", on: false }, { name: "Chevet", on: false }], scene: "Off", scenes: ["Réveil", "Lecture", "Nuit", "Off"], brightness: 0 },
    climate: { on: false, current: 19.6, setpoint: 19 },
  },
  buanderie: {
    lights: { zones: [{ name: "Plafond", on: false }], scene: "Off", scenes: ["On", "Off"], brightness: 0 },
  },
  escalier: {},
};
