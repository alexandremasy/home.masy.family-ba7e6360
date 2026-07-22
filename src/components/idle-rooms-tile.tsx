import { Card } from "@/components/card";
import { RoomIcon } from "@/components/room-icon";
import type { Room } from "@/lib/mock-data";

/** One quiet room: enough to name it, place it and read its temperature. */
export interface IdleRoomView {
  /** Stable identity, used as the list key. */
  key: string;
  /** Where the row leads — that room's page. */
  to: string;
  /** The room's name. */
  name: string;
  /** Which room drawing to use. */
  icon: Room["icon"];
  /** Current temperature in °C, when the room has a sensor. */
  temperature?: number;
}

export interface IdleRoomsTileProps {
  /** The rooms that gave up their slot. Caller decides what counts as idle. */
  rooms: IdleRoomView[];
}

/**
 * Rooms that are off and empty. They give up their own tile and share one cell —
 * but each stays its own card, with its own edge and its own link. Merging them
 * into one list would erase the fact that they are separate rooms.
 */
export function IdleRoomsTile({ rooms }: IdleRoomsTileProps) {
  return (
    <div className="flex h-full flex-col gap-2">
      {rooms.map((r) => (
        <Card key={r.key} to={r.to} variant="glass" padding="sm" className="flex-1">
          <div className="flex flex-1 items-center gap-2.5">
            <RoomIcon icon={r.icon} className="icon-hover h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate text-sm">{r.name}</span>
            {typeof r.temperature === "number" && (
              <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                {r.temperature.toLocaleString("fr-BE", { maximumFractionDigits: 1 })}°
              </span>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
