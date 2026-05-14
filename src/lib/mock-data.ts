export type RoomKey = "cuisine" | "salon" | "escalier" | "bureau" | "chambre";

export interface Room {
  key: RoomKey;
  name: string;
  icon: "sofa" | "briefcase" | "utensils" | "bed" | "footprints";
  hasSensors: boolean;
  lightsOn?: boolean;
  temperature?: number;
  climate?: { on: boolean; setpoint?: number };
  scene?: string;
  occupied?: boolean;
}

export const rooms: Room[] = [
  { key: "salon", name: "Salon", icon: "sofa", hasSensors: true, lightsOn: true, temperature: 21.4, climate: { on: true, setpoint: 21 }, scene: "Film", occupied: true },
  { key: "bureau", name: "Bureau", icon: "briefcase", hasSensors: true, lightsOn: true, temperature: 20.8, climate: { on: true, setpoint: 21 }, scene: "Travail", occupied: true },
  { key: "cuisine", name: "Cuisine", icon: "utensils", hasSensors: true, lightsOn: false, temperature: 22.1, climate: { on: false }, scene: "Off" },
  { key: "chambre", name: "Chambre", icon: "bed", hasSensors: true, lightsOn: false, temperature: 19.6, climate: { on: false }, scene: "Off" },
  { key: "escalier", name: "Escalier", icon: "footprints", hasSensors: false },
];

export const tesla = {
  charge: 74,
  pluggedIn: true,
  inGarage: false,
  location: "Bruxelles · Place Flagey",
  chargeLimit: 80,
  rangeKm: 310,
  interior: 21,
  exterior: 14,
  monthly: {
    current: { kWh: 184, sessions: 12, cost: 42.6 },
    previous: { kWh: 212, sessions: 14, cost: 49.1 },
    history: [
      { month: "Déc", kWh: 240 },
      { month: "Jan", kWh: 228 },
      { month: "Fév", kWh: 196 },
      { month: "Mar", kWh: 220 },
      { month: "Avr", kWh: 212 },
      { month: "Mai", kWh: 184 },
    ],
  },
};

export const reseau = {
  wifi1: { ssid: "private.masy.family", on: true, clients: 14 },
  wifi2: { ssid: "masy.family", on: true, clients: 6 },
  internet: { on: true, speedMbps: 450, latencyMs: 12 },
  homelab: { cpu: 28, memory: 61, disk: 42, uptimeDays: 47 },
  twingate: true,
  services: [
    { name: "Portainer", url: "https://portainer.local", status: "ok" as const },
    { name: "Traefik", url: "https://traefik.local", status: "ok" as const },
    { name: "Grafana", url: "https://grafana.local", status: "ok" as const },
    { name: "Home Assistant", url: "https://ha.local", status: "ok" as const },
    { name: "Plex", url: "https://plex.local", status: "ok" as const },
    { name: "Vaultwarden", url: "https://vault.local", status: "ok" as const },
  ],
};

export const energie = {
  monthlyDue: false,
  lastReadingDate: "2026-05-01",
  current: { eau: 9.8, jour: 148, nuit: 132, mazout: 1180 },
  trend: { eau: -0.2, jour: -14, nuit: -8, mazout: -100 },
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
  climate?: { mode: "auto" | 20 | 21 | 22; current: number };
  media?: { nowPlaying: string; artist?: string; source: string; volume: number; cover?: string };
  devices?: { ink?: { c: number; m: number; y: number; k: number }; batteries: { name: string; level: number }[] };
}> = {
  salon: {
    lights: { zones: [{ name: "Plafond", on: false }, { name: "Lampes", on: true }, { name: "TV bias", on: true }], scene: "Film", scenes: ["Film", "Lecture", "Soirée", "Off"], brightness: 35 },
    climate: { mode: 21, current: 21.4 },
    media: { nowPlaying: "Linked", artist: "Bonobo", source: "Spotify", volume: 28 },
    devices: { batteries: [{ name: "Capteur canapé", level: 84 }, { name: "Télécommande", level: 62 }] },
  },
  cuisine: {
    lights: { zones: [{ name: "Plan de travail", on: false }, { name: "Îlot", on: false }], scene: "Off", scenes: ["Cuisine", "Dîner", "Off"], brightness: 0 },
    climate: { mode: "auto", current: 22.1 },
    devices: { batteries: [{ name: "Capteur four", level: 91 }, { name: "Capteur frigo", level: 78 }] },
  },
  bureau: {
    lights: { zones: [{ name: "Bureau", on: true }, { name: "Étagère", on: true }], scene: "Travail", scenes: ["Travail", "Lecture", "Off"], brightness: 70 },
    climate: { mode: 21, current: 20.8 },
    devices: {
      ink: { c: 72, m: 58, y: 64, k: 81 },
      batteries: [{ name: "Capteur fenêtre", level: 78 }, { name: "Souris", level: 91 }],
    },
  },
  chambre: {
    lights: { zones: [{ name: "Plafond", on: false }, { name: "Chevet", on: false }], scene: "Off", scenes: ["Réveil", "Lecture", "Nuit", "Off"], brightness: 0 },
    climate: { mode: "auto", current: 19.6 },
  },
  escalier: {},
};

// A pinch of fun for the footer — rotates by day-of-year
export const footerLines = [
  "“La maison, c'est l'endroit où l'on trouve toujours sa pantoufle perdue.” — anonyme",
  "Les capteurs veillent. Toi, va te coucher.",
  "Une maison bien réglée, c'est 17 % de bonheur en plus. (chiffre inventé, sentiment réel)",
  "Café chaud, WiFi stable, lumière douce — la sainte trinité.",
  "“Avoir un toit, c'est déjà un luxe.” — un raton laveur, sous la pluie",
  "Aujourd'hui la maison ronronne.",
  "Si la Tesla pouvait parler, elle dirait merci pour la prise.",
  "Le mazout baisse, le moral monte.",
  "“Domus dulcis domus.” — un romain, vers -42",
  "Tout est sous contrôle. Probablement.",
];
