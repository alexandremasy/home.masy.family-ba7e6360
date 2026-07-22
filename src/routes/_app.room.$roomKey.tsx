import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { RoomIcon } from "@/components/room-icon";
import {
  RoomDetailTemplate,
  type RoomApplianceView,
  type RoomClimateMode,
  type RoomClimatePreset,
  type RoomZoneView,
} from "@/templates/room-detail";
import {
  rooms,
  roomDetails,
  cameras,
  motionEvents,
  vacuum,
  dishwasher,
  type RoomKey,
} from "@/lib/mock-data";

export const Route = createFileRoute("/_app/room/$roomKey")({
  component: RoomPage,
  loader: ({ params }: { params: { roomKey: string } }) => {
    const room = rooms.find((r) => r.key === (params.roomKey as RoomKey));
    if (!room) throw notFound();
    return { room };
  },
  notFoundComponent: () => (
    <div className="py-16 text-center">
      <h1 className="text-3xl">Pièce introuvable</h1>
      <Link to="/" className="mt-4 inline-block text-primary underline">
        Retour
      </Link>
    </div>
  ),
  head: ({ params }: { params: { roomKey: string } }) => {
    const room = rooms.find((r) => r.key === (params.roomKey as RoomKey));
    return { meta: [{ title: room ? `${room.name} — Maison` : "Pièce" }] };
  },
});

const MUSIQ3_TINT = "oklch(0.72 0.17 150)";

/** The page is the template; this file only pretends to be a house. */
function RoomPage() {
  const { room } = Route.useLoaderData() as { room: (typeof rooms)[number] };
  const detail = roomDetails[room.key];

  // Everything a tap changes lives here, because over in the cockpit it lives in
  // Home Assistant: the template only ever draws what it is handed.
  const [zones, setZones] = useState<RoomZoneView[]>(
    (detail.lights?.zones ?? []).map((z) => ({ key: z.name, name: z.name, on: z.on })),
  );
  const [scene, setScene] = useState(detail.lights?.scene ?? "Off");
  const [brightness, setBrightness] = useState(detail.lights?.brightness ?? 0);
  const [roomOn, setRoomOn] = useState(true);
  const [mode, setMode] = useState<RoomClimateMode>(
    detail.climate && !("dual" in detail.climate) ? detail.climate.mode : "auto",
  );
  const [system, setSystem] = useState<"heat" | "cool">(
    detail.climate && "dual" in detail.climate && detail.climate.mode === "cool" ? "cool" : "heat",
  );
  const [heatPreset, setHeatPreset] = useState<RoomClimatePreset>(
    detail.climate && "dual" in detail.climate ? detail.climate.heatSetpoint : "off",
  );
  const [coolPreset, setCoolPreset] = useState<RoomClimatePreset>(
    detail.climate && "dual" in detail.climate ? detail.climate.coolSetpoint : "off",
  );
  const [appliances, setAppliances] = useState<RoomApplianceView[]>(
    (detail.devices?.appliances ?? []).map((a) => ({ key: a.name, name: a.name, on: a.on })),
  );
  const [radioOn, setRadioOn] = useState((detail.media?.source ?? "off") !== "off");
  const [playing, setPlaying] = useState((detail.media?.source ?? "off") !== "off");

  const roomCams = cameras.filter(
    (c) =>
      c.installed &&
      ((room.key === "salon" && c.id === "salon") ||
        (room.key === "buanderie" && c.id === "buanderie")),
  );
  const events = motionEvents
    .filter((e) => roomCams.some((c) => c.id === e.cameraId))
    .slice(0, 3)
    .map((e) => ({ id: String(e.id), label: e.label, time: e.time }));

  const media = detail.media && room.key === "salon" ? detail.media : null;

  return (
    <RoomDetailTemplate
      name={room.name}
      icon={<RoomIcon icon={room.icon} className="h-5 w-5 anim-float" />}
      temperature={typeof room.temperature === "number" ? room.temperature : undefined}
      roomOn={roomOn}
      onToggleRoom={() => setRoomOn((on) => !on)}
      lights={
        detail.lights
          ? {
              scenes: detail.lights.scenes.map((s) => ({ value: s })),
              activeScene: scene,
              zones,
              brightness: detail.lights.hideBrightness ? null : brightness,
            }
          : undefined
      }
      onSelectScene={setScene}
      onToggleZone={(key) =>
        setZones((zs) => zs.map((z) => (z.key === key ? { ...z, on: !z.on } : z)))
      }
      onSetBrightness={setBrightness}
      climate={
        detail.climate
          ? {
              dual: "dual" in detail.climate,
              mode,
              system,
              heatPreset,
              coolPreset,
            }
          : undefined
      }
      onSelectMode={setMode}
      onSelectSystem={setSystem}
      onSelectHeatPreset={setHeatPreset}
      onSelectCoolPreset={setCoolPreset}
      media={
        media
          ? {
              radioOn,
              playing,
              label: radioOn ? "Musiq3" : "Aucun média",
              title: media.nowPlaying ?? "—",
              artist: media.artist ?? undefined,
              tint: radioOn ? MUSIQ3_TINT : null,
            }
          : undefined
      }
      onToggleRadio={() => {
        setRadioOn((on) => {
          setPlaying(!on);
          return !on;
        });
      }}
      onTogglePlay={() => setPlaying((p) => !p)}
      onVolumeDown={() => {}}
      onVolumeUp={() => {}}
      dishwasher={room.key === "cuisine" ? dishwasher : undefined}
      vacuum={room.key === "buanderie" ? vacuum : undefined}
      onStartVacuum={() => {}}
      onEmptyBin={() => {}}
      cameras={roomCams}
      cameraEvents={events}
      devices={
        detail.devices
          ? {
              ink: detail.devices.ink,
              appliances,
              batteries: detail.devices.batteries.map((b) => ({
                key: b.name,
                name: b.name,
                level: b.level,
              })),
            }
          : undefined
      }
      onToggleAppliance={(key) =>
        setAppliances((as) => as.map((a) => (a.key === key ? { ...a, on: !a.on } : a)))
      }
    />
  );
}
