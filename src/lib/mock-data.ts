export type RoomKey = "cuisine" | "salon" | "escalier" | "bureau" | "chambre" | "buanderie";

export interface Room {
  key: RoomKey;
  name: string;
  icon: "sofa" | "briefcase" | "utensils" | "bed" | "footprints" | "washing-machine";
  hasSensors: boolean;
  lightsOn?: boolean;
  temperature?: number;
  climate?: { on: boolean; setpoint?: number };
  scene?: string;
  occupied?: boolean;
}

export const rooms: Room[] = [
  { key: "salon", name: "Salon", icon: "sofa", hasSensors: true, lightsOn: true, scene: "Film", occupied: true },
  { key: "bureau", name: "Bureau", icon: "briefcase", hasSensors: true, lightsOn: true, temperature: 20.8, climate: { on: true, setpoint: 21 }, scene: "Travail", occupied: true },
  { key: "cuisine", name: "Cuisine", icon: "utensils", hasSensors: true, lightsOn: false, temperature: 22.1, climate: { on: false }, scene: "Off" },
  { key: "chambre", name: "Chambre", icon: "bed", hasSensors: true, lightsOn: false, temperature: 19.6, climate: { on: false }, scene: "Off" },
  { key: "escalier", name: "Escalier", icon: "footprints", hasSensors: false },
  { key: "buanderie", name: "Buanderie", icon: "washing-machine", hasSensors: true, temperature: 18.2, occupied: false },
];

export const tesla = {
  model: "Model 3 Long Range",
  charge: 74,
  pluggedIn: true,
  charging: false,
  inGarage: false,
  locked: true,
  location: "Bruxelles · Place Flagey",
  coords: { lat: 50.8275, lng: 4.3719 },
  chargeLimit: 80,
  rangeKm: 310,
  interior: 21,
  exterior: 14,
  odometerKm: 48230,
  software: "2026.8.3",
  lastSeen: "il y a 4 min",
  pricePerKWh: 0.231, // € — used to invoice quarterly
  monthly: {
    current: { kWh: 184, sessions: 12, cost: 42.6 },
    previous: { kWh: 212, sessions: 14, cost: 49.1 },
    // 13 months so we can show the current quarter + 4 previous full quarters
    history: [
      { month: "Mai", year: 2025, kWh: 168, sessions: 11 },
      { month: "Juin", year: 2025, kWh: 152, sessions: 10 },
      { month: "Juil", year: 2025, kWh: 144, sessions: 9 },
      { month: "Août", year: 2025, kWh: 138, sessions: 9 },
      { month: "Sep", year: 2025, kWh: 176, sessions: 12 },
      { month: "Oct", year: 2025, kWh: 198, sessions: 13 },
      { month: "Nov", year: 2025, kWh: 224, sessions: 14 },
      { month: "Déc", year: 2025, kWh: 240, sessions: 15 },
      { month: "Jan", year: 2026, kWh: 228, sessions: 14 },
      { month: "Fév", year: 2026, kWh: 196, sessions: 13 },
      { month: "Mar", year: 2026, kWh: 220, sessions: 14 },
      { month: "Avr", year: 2026, kWh: 212, sessions: 14 },
      { month: "Mai", year: 2026, kWh: 184, sessions: 12 },
    ],
  },
};

export const reseau = {
  wifi1: { ssid: "private.masy.family", on: true, clients: 14 },
  wifi2: { ssid: "masy.family", on: true, clients: 6 },
  internet: { on: true, speedMbps: 450, latencyMs: 12, lastSpeedtest: { downMbps: 472, upMbps: 38, pingMs: 11, when: "il y a 2h" } },
  homelab: { cpu: 28, memory: 61, disk: 42, uptimeDays: 47 },
  twingate: true,
  pihole: {
    on: true,
    queries24h: 48230,
    blocked24h: 7124,
    blockedPct: 14.8,
    domainsOnList: 152340,
    clients: 22,
    topBlocked: [
      { domain: "telemetry.microsoft.com", hits: 412 },
      { domain: "graph.facebook.com", hits: 287 },
      { domain: "ads.google.com", hits: 196 },
    ],
    url: "https://pihole.local",
  },
  serviceGroups: [
    {
      key: "data" as const,
      label: "Data",
      services: [
        { name: "Backup", url: "https://backup.masy.family", status: "ok" as const },
        { name: "Base de donnée", url: "https://db.masy.family", status: "ok" as const },
        { name: "Redis", url: "https://redis.masy.family", status: "ok" as const },
        { name: "Qdrant", url: "https://qdrant.masy.family", status: "ok" as const },
        { name: "Metabase", url: "https://data.masy.family", status: "ok" as const },
        { name: "Grafana", url: "https://grafana.masy.family", status: "ok" as const },
      ],
    },
    {
      key: "home" as const,
      label: "Home",
      services: [
        { name: "Home Assistant", url: "https://ha.masy.family", status: "ok" as const },
        { name: "Automate", url: "https://automate.masy.family", status: "ok" as const },
        { name: "Tesla", url: "https://tesla.masy.family", status: "ok" as const },
        { name: "Portainer", url: "https://docker.masy.family", status: "ok" as const },
      ],
    },
    {
      key: "network" as const,
      label: "Network",
      services: [
        { name: "Zigbee", url: "https://zigbee.masy.family", status: "ok" as const },
        { name: "Search", url: "https://search.masy.family", status: "ok" as const },
        { name: "Traefik", url: "https://traefik.masy.family", status: "ok" as const },
      ],
    },
  ],
};

export type EnergyStatus = "normal" | "alert";
export type Trend = "up" | "down" | "stable";

export const energie = {
  monthlyDue: false,
  lastReadingDate: "2026-05-01",
  electricity: {
    status: "normal" as EnergyStatus,
    dailyKWh: 9.3,
    avg90dKWh: 10.4,
    trendPct: -10.6, // vs 90d avg
    trend: "down" as Trend,
    monthKWh: 280,
    dayTotal: 148,
    nightTotal: 132,
  },
  water: {
    status: "normal" as EnergyStatus,
    dailyM3: 0.32,
    dailyL: 320,
    trend: "stable" as Trend,
    trendPct: 1.4,
  },
  oil: {
    status: "alert" as EnergyStatus, // running low
    tankPct: 22,
    tankLiters: 660,
    tankCapacity: 3000,
    last30dLiters: 410,
    autonomyDays: 48,
  },
  // legacy (still used by /energie page + saisie)
  current: { eau: 9.8, jour: 148, nuit: 132, mazout: 1180 },
  trend: { eau: -0.2, jour: -14, nuit: -8, mazout: -100 },
  // 13 months ending on the latest fully-recorded month (April 2026 if last reading = May 1).
  // Order: oldest → newest.
  // `solar` = kWh injected on the grid (PV surplus over self-consumption).
  // Net grid consumption shown on the elec chart = (jour + nuit) - solar,
  // which goes negative in summer when production exceeds consumption.
  history: [
    { month: "Avr", eau: 8.6, jour: 168, nuit: 142, mazout: 1320, solar: 180 },  // Apr 2025
    { month: "Mai", eau: 9.4, jour: 152, nuit: 134, mazout: 980,  solar: 320 },  // May 2025
    { month: "Juin", eau: 10.2, jour: 138, nuit: 122, mazout: 540, solar: 340 }, // Jun 2025
    { month: "Juil", eau: 11.1, jour: 132, nuit: 118, mazout: 320, solar: 360 }, // Jul 2025 (net -110)
    { month: "Août", eau: 10.8, jour: 128, nuit: 116, mazout: 280, solar: 330 }, // Aug 2025 (net -86)
    { month: "Sep", eau: 9.6, jour: 142, nuit: 126, mazout: 620,  solar: 230 },  // Sep 2025
    { month: "Oct", eau: 8.8, jour: 168, nuit: 148, mazout: 1180, solar: 110 },  // Oct 2025
    { month: "Nov", eau: 8.2, jour: 198, nuit: 168, mazout: 1620, solar: 40 },   // Nov 2025
    { month: "Déc", eau: 7.9, jour: 224, nuit: 184, mazout: 1980, solar: 20 },   // Dec 2025
    { month: "Jan", eau: 8.2, jour: 210, nuit: 165, mazout: 1850, solar: 30 },   // Jan 2026
    { month: "Fév", eau: 7.6, jour: 198, nuit: 172, mazout: 1620, solar: 70 },   // Feb 2026
    { month: "Mar", eau: 9.1, jour: 184, nuit: 158, mazout: 1430, solar: 160 },  // Mar 2026
    { month: "Avr", eau: 8.4, jour: 162, nuit: 140, mazout: 1280, solar: 220 },  // Apr 2026
  ],
};

export const calendrier = {
  poubelleToday: { type: "PMC", icon: "♻️", time: "07:00" },
};

export type WeatherCond = "sun" | "cloud" | "partly" | "rain" | "storm" | "snow" | "fog";

export const meteo = {
  today: {
    cond: "partly" as WeatherCond,
    label: "Éclaircies",
    tempC: 17,
    feelsC: 16,
    minC: 11,
    maxC: 19,
    rainMm: 1.2,
    rainProb: 35,
    windKmh: 14,
    humidity: 62,
    sunrise: "05:48",
    sunset: "21:24",
    location: "Fumal",
  },
  forecast: [
    { day: "Ven", cond: "sun" as WeatherCond, minC: 12, maxC: 21, rainProb: 5 },
    { day: "Sam", cond: "partly" as WeatherCond, minC: 13, maxC: 22, rainProb: 20 },
    { day: "Dim", cond: "rain" as WeatherCond, minC: 11, maxC: 17, rainProb: 80 },
    { day: "Lun", cond: "cloud" as WeatherCond, minC: 10, maxC: 16, rainProb: 40 },
    { day: "Mar", cond: "partly" as WeatherCond, minC: 11, maxC: 19, rainProb: 25 },
  ],
};

export type MediaSource = "musiq3" | "off";

// Room detail mocks
export const roomDetails: Record<RoomKey, {
  lights?: { zones: { name: string; on: boolean }[]; scene: string; scenes: string[]; brightness: number; hideBrightness?: boolean };
  climate?:
    | { mode: "auto" | 20 | 21 | 22; current: number }
    | { dual: true; mode: "off" | "heat" | "cool"; heatSetpoint: number; coolSetpoint: number; current: number };
  media?: { source: MediaSource; nowPlaying?: string; artist?: string; cover?: string };
  devices?: {
    ink?: { c: number; m: number; y: number; k: number };
    batteries: { name: string; level: number }[];
    appliances?: { name: string; on: boolean }[];
  };
}> = {
  salon: {
    lights: {
      zones: [{ name: "Table", on: false }, { name: "Divan", on: true }],
      scene: "50%",
      scenes: ["10%", "25%", "50%", "75%", "100%"],
      brightness: 50,
      hideBrightness: true,
    },
    media: { source: "musiq3", nowPlaying: "Linked", artist: "Bonobo" },
    devices: {
      batteries: [{ name: "Télécommande", level: 62 }],
      appliances: [
        { name: "Projecteur", on: false },
        { name: "Bouboule", on: true },
        { name: "Coin", on: false },
      ],
    },
  },
  cuisine: {
    lights: { zones: [{ name: "Table", on: false }, { name: "Plan de travail", on: false }], scene: "Off", scenes: [], brightness: 0, hideBrightness: true },
    climate: { mode: "auto", current: 22.1 },
    devices: { batteries: [{ name: "Radiateur", level: 84 }] },
  },
  bureau: {
    lights: {
      zones: [
        { name: "Bureau Alex", on: true },
        { name: "Bureau Cathy", on: true },
        { name: "Escalier", on: false },
        { name: "Plafond", on: false },
      ],
      scene: "Moyen",
      scenes: ["Meditation", "Cosy", "Moyen", "Lumineux"],
      brightness: 70,
      hideBrightness: true,
    },
    climate: { dual: true, mode: "heat", heatSetpoint: 21, coolSetpoint: 24, current: 20.8 },
    devices: {
      ink: { c: 72, m: 58, y: 64, k: 81 },
      appliances: [
        { name: "Lampe à sel", on: true },
        { name: "Chat", on: false },
        { name: "Playbar", on: false },
      ],
      batteries: [
        { name: "Radiateur Jardin", level: 78 },
        { name: "Radiateur Rue", level: 64 },
      ],
    },
  },
  chambre: {
    lights: { zones: [{ name: "Plafond", on: false }, { name: "Chevet", on: false }], scene: "Off", scenes: ["Réveil", "Lecture", "Nuit", "Off"], brightness: 0 },
    climate: { mode: "auto", current: 19.6 },
  },
  escalier: {},
  buanderie: {
    lights: { zones: [{ name: "Plafond", on: false }], scene: "Off", scenes: [], brightness: 0, hideBrightness: true },
    devices: {
      batteries: [{ name: "Détecteur fumée", level: 88 }],
      appliances: [
        { name: "Sèche-linge", on: false },
        { name: "Lave-linge", on: true },
      ],
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Sécurité — caméras & sonnette
// ─────────────────────────────────────────────────────────────────────────────

export type CameraId =
  | "front-door"
  | "driveway"
  | "garden"
  | "backyard"
  | "salon"
  | "buanderie";
export type CameraKind = "indoor" | "outdoor" | "doorbell";
export type CameraState = "online" | "offline" | "recording" | "installing";
export type CameraScene = "front" | "driveway" | "garden" | "backyard" | "living" | "utility";

export interface Camera {
  id: CameraId;
  name: string;
  location: string;
  kind: CameraKind;
  state: CameraState;
  night: boolean;      // night-vision mode
  motion: boolean;     // motion detected right now
  lastMotion?: string; // "il y a 12 min"
  scene: CameraScene;
  batteryPct?: number; // undefined = wired
  wired: boolean;
  installed: boolean;  // false = arrive bientôt
}

export const cameras: Camera[] = [
  {
    id: "front-door", name: "Sonnette", location: "Entrée principale",
    kind: "doorbell", state: "installing", night: false, motion: false,
    scene: "front", wired: true, installed: false,
  },
  {
    id: "driveway", name: "Allée", location: "Extérieur — devant",
    kind: "outdoor", state: "recording", night: false, motion: true,
    lastMotion: "à l'instant", scene: "driveway", batteryPct: 84, wired: false, installed: true,
  },
  {
    id: "garden", name: "Jardin", location: "Extérieur — côté",
    kind: "outdoor", state: "online", night: false, motion: false,
    lastMotion: "il y a 34 min", scene: "garden", batteryPct: 62, wired: false, installed: true,
  },
  {
    id: "backyard", name: "Arrière", location: "Extérieur — arrière",
    kind: "outdoor", state: "online", night: true, motion: false,
    lastMotion: "il y a 2 h", scene: "backyard", batteryPct: 41, wired: false, installed: true,
  },
  {
    id: "salon", name: "Salon", location: "Intérieur — salon",
    kind: "indoor", state: "online", night: false, motion: false,
    lastMotion: "il y a 12 min", scene: "living", wired: true, installed: true,
  },
  {
    id: "buanderie", name: "Buanderie", location: "Intérieur — buanderie",
    kind: "indoor", state: "online", night: false, motion: false,
    lastMotion: "il y a 1 h", scene: "utility", wired: true, installed: true,
  },
];

export interface MotionEvent {
  id: string;
  cameraId: CameraId;
  label: string;
  time: string;    // e.g. "18:42"
  ago: string;     // e.g. "il y a 6 min"
  kind: "person" | "vehicle" | "animal" | "package" | "movement";
}

export const motionEvents: MotionEvent[] = [
  { id: "e1", cameraId: "driveway", label: "Véhicule détecté", time: "18:46", ago: "à l'instant", kind: "vehicle" },
  { id: "e2", cameraId: "salon",    label: "Mouvement",         time: "18:34", ago: "il y a 12 min", kind: "movement" },
  { id: "e3", cameraId: "garden",   label: "Personne détectée", time: "18:12", ago: "il y a 34 min", kind: "person" },
  { id: "e4", cameraId: "driveway", label: "Colis déposé",      time: "16:22", ago: "il y a 2 h",  kind: "package" },
  { id: "e5", cameraId: "backyard", label: "Animal (chat)",     time: "15:58", ago: "il y a 2 h",  kind: "animal" },
  { id: "e6", cameraId: "buanderie",label: "Mouvement",         time: "14:41", ago: "il y a 4 h",  kind: "movement" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sécurité — dashboard maison (état-first : la maison est une machine à armer)
// ─────────────────────────────────────────────────────────────────────────────

// 1 ── État & armement
export type ArmMode = "disarmed" | "home" | "night" | "away";
export type SecurityVerdict = "secure" | "attention" | "alarm";

export const armModes: { key: ArmMode; label: string; hint: string }[] = [
  { key: "disarmed", label: "Désarmé", hint: "Aucune surveillance active" },
  { key: "home",     label: "Maison",  hint: "Périmètre armé, intérieur libre" },
  { key: "night",    label: "Nuit",    hint: "Périmètre + rez armés" },
  { key: "away",     label: "Absent",  hint: "Tout armé, alertes push" },
];

export const security = {
  mode: "home" as ArmMode,
  armedSince: "18:40",
  autoFollowPresence: true,
};

// 2 ── Présence (l'armement auto suit la présence)
export interface PresenceMember {
  name: string;
  initial: string;
  home: boolean;
  place?: string;   // quand absent
  since: string;    // "depuis 08:12" / "il y a 2 h"
}
export const presence: PresenceMember[] = [
  { name: "Alex",  initial: "A", home: true,  since: "depuis ce matin" },
  { name: "Sam",   initial: "S", home: false, place: "Bruxelles · Flagey", since: "il y a 2 h" },
  { name: "Léa",   initial: "L", home: true,  since: "depuis 16:20" },
];

// 3 ── Périmètre (intégrité physique : portes, fenêtres, serrures)
export type OpeningType = "door" | "window" | "garage";
export type OpeningState = "secure" | "open" | "unlocked";
export interface PerimeterPoint {
  name: string;
  zone: string;
  type: OpeningType;
  state: OpeningState;
}
export const perimeter: PerimeterPoint[] = [
  { name: "Porte d'entrée",   zone: "Rez",      type: "door",   state: "secure" },
  { name: "Baie salon",       zone: "Rez",      type: "window", state: "secure" },
  { name: "Fenêtre cuisine",  zone: "Rez",      type: "window", state: "secure" },
  { name: "Porte terrasse",   zone: "Rez",      type: "door",   state: "unlocked" },
  { name: "Porte garage",     zone: "Garage",   type: "garage", state: "open" },
  { name: "Fenêtre chambre",  zone: "Étage",    type: "window", state: "secure" },
  { name: "Velux bureau",     zone: "Étage",    type: "window", state: "secure" },
  { name: "Fenêtre buanderie",zone: "Sous-sol", type: "window", state: "secure" },
];
export const locks: { name: string; locked: boolean }[] = [
  { name: "Porte d'entrée", locked: true },
  { name: "Porte garage",   locked: false },
  { name: "Porte terrasse", locked: false },
];

// 4 ── Activité (timeline unifiée, tous capteurs confondus)
export type ActivityKind =
  | "person" | "vehicle" | "animal" | "package" | "motion"
  | "door" | "lock" | "doorbell" | "arm" | "system";
export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  label: string;
  where: string;
  time: string;
  ago: string;
  level?: "info" | "warn" | "alert";
}
export const activity: ActivityItem[] = [
  { id: "a1", kind: "door",     label: "Porte garage ouverte",       where: "Garage", time: "18:52", ago: "à l'instant",  level: "warn" },
  { id: "a2", kind: "vehicle",  label: "Véhicule détecté",           where: "Allée",  time: "18:46", ago: "il y a 6 min" },
  { id: "a3", kind: "arm",      label: "Passé en mode Maison",       where: "Système",time: "18:40", ago: "il y a 12 min" },
  { id: "a4", kind: "person",   label: "Personne détectée",          where: "Jardin", time: "18:12", ago: "il y a 40 min" },
  { id: "a5", kind: "doorbell", label: "Sonnette",                   where: "Entrée", time: "17:30", ago: "il y a 1 h" },
  { id: "a6", kind: "package",  label: "Colis déposé",               where: "Allée",  time: "16:22", ago: "il y a 2 h" },
  { id: "a7", kind: "lock",     label: "Porte d'entrée verrouillée", where: "Rez",    time: "08:12", ago: "ce matin" },
  { id: "a8", kind: "animal",   label: "Animal (chat)",              where: "Arrière",time: "07:58", ago: "ce matin" },
];

// 6 ── Santé du système
export const securityHealth = {
  devicesOnline: 11,
  devicesTotal: 12,
  connectivity: "ok" as "ok" | "degraded" | "down",
  siren: "ready" as "ready" | "triggered" | "off",
  tamper: false,
  lastTest: "il y a 3 j",
  offline: [{ name: "Capteur fenêtre garage", since: "il y a 2 j" }],
  batteries: [
    { name: "Capteur porte cuisine", level: 18 },
    { name: "Détecteur salon",       level: 46 },
    { name: "Sonnette",              level: 72 },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Lave-vaisselle (cuisine)
// ─────────────────────────────────────────────────────────────────────────────

export type DishState = "idle" | "running" | "paused" | "finished" | "error" | "door_open";
export type DishPhase = "Prélavage" | "Lavage" | "Rinçage" | "Séchage" | "—";

export const dishwasher = {
  brand: "Bosch Series 6",
  state: "running" as DishState,
  program: "Eco 50°",
  phase: "Rinçage" as DishPhase,
  progressPct: 62,
  remainingMin: 48,
  totalMin: 128,
  startedAt: "18:12",
  endsAt: "20:30",
  door: "closed" as "open" | "closed",
  saltLow: false,
  rinseAidLow: true,
  cyclesThisMonth: 22,
  energyKWh: 0.92,
  waterL: 9.5,
  lastRun: "Hier, 21:14 · Auto 45–65°",
  errorMsg: null as string | null,
};

// ─────────────────────────────────────────────────────────────────────────────
// Aspirateur robot
// ─────────────────────────────────────────────────────────────────────────────

export type VacState = "docked" | "cleaning" | "returning" | "paused" | "error" | "charging";

export const vacuum = {
  name: "Roomba j7",
  state: "cleaning" as VacState,
  batteryPct: 68,
  charging: false,
  currentRoom: "Bureau" as string | null,
  dockLocation: "Buanderie",
  areaCleanedM2: 34,
  areaTargetM2: 72,
  elapsedMin: 22,
  etaMin: 28,
  binFullPct: 40,
  errorMsg: null as string | null,
  nextSchedule: "Demain 09:30 · RDC complet",
  lastRun: {
    when: "Aujourd'hui 07:15",
    areaM2: 68,
    durationMin: 54,
    rooms: ["Salon", "Cuisine", "Buanderie"],
  },
  plan: [
    { room: "Salon",     status: "done" as const },
    { room: "Cuisine",   status: "done" as const },
    { room: "Bureau",    status: "active" as const },
    { room: "Chambre",   status: "todo" as const },
    { room: "Buanderie", status: "todo" as const },
  ],
};


// A pinch of fun for the footer — rotates by day-of-year
export const footerLines = [
  "“La maison, c'est l'endroit où l'on trouve toujours sa pantoufle perdue.” — anonyme",
  "Les capteurs veillent. Toi, va te coucher.",
  "Une maison bien réglée, c'est 17 % de bonheur en plus. (chiffre inventé, sentiment réel)",
  "Café chaud, WiFi stable, lumière douce — la sainte trinité.",
  "“Avoir un toit, c'est déjà un luxe.” — un raton laveur, sous la pluie",
  "Aujourd'hui la maison ronronne.",
  "Si Bernard pouvait parler, il dirait merci pour la prise.",
  "Le mazout baisse, le moral monte.",
  "“Domus dulcis domus.” — un romain, vers -42",
  "Tout est sous contrôle. Probablement.",
];
