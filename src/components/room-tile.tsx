import { Lightbulb, Wind } from "lucide-react";
import { Card } from "@/components/card";
import { CountUp } from "@/components/count-up";
import { RoomIcon } from "@/components/room-icon";
import type { Room } from "@/lib/mock-data";

export interface RoomTileProps {
  /** Where the tile leads — the room's own page. */
  to: string;
  /** The room's name. */
  name: string;
  /** Which room drawing to use. */
  icon: Room["icon"];
  /** Current temperature in °C. Absent, the slot is held open so tiles stay aligned. */
  temperature?: number;
  /** Any light on in the room. */
  lightsOn: boolean;
  /**
   * The room's climate, when it has one. `setpoint` is what it is aiming for;
   * `on` false — or no setpoint at all — reads as "Auto": the schedule has it.
   */
  climate?: { on: boolean; setpoint?: number };
}

/**
 * One room on the dashboard: its temperature, and the two things you check before
 * walking in — is a light on, is the climate doing something.
 *
 * The empty temperature slot is deliberate. A room with no sensor keeps the same
 * height as its neighbours, because a bento row that reflows around a missing
 * reading is worse than a small blank.
 */
export function RoomTile({ to, name, icon, temperature, lightsOn, climate }: RoomTileProps) {
  return (
    <Card
      to={to}
      variant="glass"
      padding="sm"
      icon={<RoomIcon icon={icon} className="h-4.5 w-4.5 icon-hover" />}
      title={name}
    >
      {typeof temperature === "number" ? (
        <p className="text-2xl tracking-tight">
          <CountUp to={temperature} decimals={1} />
          <span className="text-base text-muted-foreground">°C</span>
        </p>
      ) : (
        <div className="h-[2.75rem]" aria-hidden />
      )}

      <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-muted-foreground">
        <span
          className={
            "inline-flex items-center gap-1.5 transition-colors " + (lightsOn ? "text-mustard" : "")
          }
        >
          <Lightbulb className={"h-3.5 w-3.5 " + (lightsOn ? "anim-breathe text-mustard" : "")} />
          {lightsOn ? "Allumé" : "Éteint"}
        </span>
        {climate && (
          <span className="inline-flex items-center gap-1.5">
            <Wind className={"h-3.5 w-3.5 " + (climate.on ? "text-primary" : "")} />
            {climate.on && climate.setpoint != null ? `${climate.setpoint}°` : "Auto"}
          </span>
        )}
      </div>
    </Card>
  );
}
