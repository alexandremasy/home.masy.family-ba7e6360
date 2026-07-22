import { Lightbulb } from "lucide-react";
import { Card } from "@/components/card";
import { RoomIcon } from "@/components/room-icon";
import type { Room } from "@/lib/mock-data";

/** What the room is playing from. `none` falls back to the room's own icon. */
export type SalonMediaSource = "spotify" | "netflix" | "none";

export interface SalonTileProps {
  /** Where the tile leads — the room's page. */
  to: string;
  /** The room's name. */
  name: string;
  /** Which room drawing to use when nothing is playing. */
  icon: Room["icon"];
  /** Any light on in the room. */
  lightsOn: boolean;
  /** What the source is — it becomes the tile's glyph and colour. */
  source?: SalonMediaSource;
  /** What is on, on a second line: "Linked · Bonobo", "Dark · S2E4". */
  media?: string;
  /** Actually playing right now — the equaliser only runs then. */
  playing?: boolean;
}

const tint: Record<SalonMediaSource, string> = {
  spotify: "bg-[oklch(0.72_0.18_150)]/15 text-[oklch(0.55_0.18_150)]",
  netflix: "bg-[oklch(0.32_0.18_25)] text-white",
  none: "bg-white text-primary",
};

/**
 * The living room, which is the one room you read by what it is playing rather
 * than by its temperature.
 *
 * The source takes the icon slot and colours it, so the tile is recognisable
 * before a word is read. The equaliser is the only thing that says *playing* — a
 * paused Spotify and a running one otherwise look the same.
 */
export function SalonTile({
  to,
  name,
  icon,
  lightsOn,
  source = "none",
  media,
  playing = false,
}: SalonTileProps) {
  return (
    <Card to={to} variant="glass" padding="sm" className="flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={
              "grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors " +
              tint[source]
            }
            aria-hidden
          >
            {source === "spotify" ? (
              <SpotifyGlyph className="h-4.5 w-4.5" />
            ) : source === "netflix" ? (
              <span className="text-sm font-semibold leading-none">N</span>
            ) : (
              <RoomIcon icon={icon} className="h-4.5 w-4.5 icon-hover" />
            )}
          </span>
          <div className="min-w-0">
            <p className="text-base font-semibold leading-tight">{name}</p>
            {media && <p className="mt-0.5 truncate text-xs text-muted-foreground">{media}</p>}
          </div>
        </div>
        {playing && <EqBars />}
      </div>

      <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-muted-foreground">
        <span
          className={
            "inline-flex items-center gap-1.5 transition-colors " + (lightsOn ? "text-mustard" : "")
          }
        >
          <Lightbulb className={"h-3.5 w-3.5 " + (lightsOn ? "anim-breathe text-mustard" : "")} />
          {lightsOn ? "Allumé" : "Éteint"}
        </span>
      </div>
    </Card>
  );
}

function EqBars() {
  return (
    <span className="flex items-end gap-0.5 pb-1" aria-hidden>
      <span
        className="eq-bar h-3 w-0.5 rounded-full bg-foreground/70"
        style={{ animationDelay: "0ms" }}
      />
      <span
        className="eq-bar h-4 w-0.5 rounded-full bg-foreground/70"
        style={{ animationDelay: "150ms" }}
      />
      <span
        className="eq-bar h-2.5 w-0.5 rounded-full bg-foreground/70"
        style={{ animationDelay: "300ms" }}
      />
    </span>
  );
}

function SpotifyGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.6 14.4a.7.7 0 0 1-.96.23c-2.63-1.6-5.94-1.97-9.84-1.07a.7.7 0 1 1-.31-1.36c4.27-.98 7.93-.56 10.88 1.24.33.2.43.64.23.96zm1.23-2.74a.88.88 0 0 1-1.2.29c-3.01-1.85-7.6-2.39-11.16-1.31a.88.88 0 1 1-.51-1.68c4.07-1.24 9.13-.64 12.59 1.49.41.25.54.79.28 1.21zm.11-2.86c-3.61-2.14-9.57-2.34-13.02-1.29a1.05 1.05 0 1 1-.61-2.01c3.96-1.2 10.54-.97 14.7 1.5a1.05 1.05 0 1 1-1.07 1.8z" />
    </svg>
  );
}
