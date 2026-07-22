import { BentoGrid, BentoItem } from "@/blocks/bento";
import { BernardTile, type BernardTileProps } from "@/components/bernard-tile";
import { BirthdayTile, type BirthdayTileProps } from "@/components/birthday-tile";
import { EnergieTile, type EnergieTileProps } from "@/components/energie-tile";
import { IdleRoomsTile, type IdleRoomView } from "@/components/idle-rooms-tile";
import { PoubelleTile, type PoubelleTileProps } from "@/components/poubelle-tile";
import { RepasLine, type RepasLineProps } from "@/components/repas-line";
import { ReseauTile, type ReseauTileProps } from "@/components/reseau-tile";
import { RoomTile, type RoomTileProps } from "@/components/room-tile";
import { SalonTile, type SalonTileProps } from "@/components/salon-tile";
import { WeatherTile, type WeatherTileProps } from "@/components/weather-tile";

/* ─────────────────────────────────────────────────────────────────────────────
   The dashboard, as a page — a greeting, today's two events, then the mosaic.

   Every tile is its own component; this template only decides what goes in the
   grid and how wide each cell is. That split is the point: placement belongs to
   the cell (BentoItem), never to the card, so the same tile can sit anywhere.

   The header stays OUT of the bento on purpose. The bento rows have a FIXED
   height, so short tiles placed there would leave a tall empty band beneath
   them. In normal flow they size to content, and the mosaic starts right below.

   Nothing here decides what is worth showing: which rooms are idle, whether a
   reading is due, whose birthday is next — that is all the caller's, because it
   is the caller that knows where the data came from.
   ──────────────────────────────────────────────────────────────────────────── */

/** One room's cell in the mosaic. */
export interface DashboardRoomView extends RoomTileProps {
  /** Stable identity, used as the list key. */
  key: string;
  /** Takes two columns from `sm` — for the room that deserves the extra width. */
  wide?: boolean;
}

export interface DashboardProps {
  /** The greeting, already chosen for the hour — "Bonjour", "Bonsoir". */
  greeting: string;
  /** Today's menu, under the greeting. */
  repas: RepasLineProps;
  /** The next collection. Absent, the pill is not drawn. */
  poubelle?: PoubelleTileProps;
  /** The next birthday. Absent when nobody is coming up. */
  birthday?: BirthdayTileProps;
  /** The media room, first in the mosaic. Absent, the mosaic starts with the rooms. */
  salon?: SalonTileProps;
  /** The rooms worth their own tile — lit, occupied, or both. */
  rooms: DashboardRoomView[];
  /** The rooms that share one cell. Empty, that cell is not drawn. */
  idleRooms: IdleRoomView[];
  /** The weather cell and the dialog behind it. */
  weather: WeatherTileProps;
  /** The three meters, or the call to action when a reading is due. */
  energie: EnergieTileProps;
  /** The car. */
  bernard: BernardTileProps;
  /** The line and the homelab. */
  reseau: ReseauTileProps;
}

export function Dashboard({
  greeting,
  repas,
  poubelle,
  birthday,
  salon,
  rooms,
  idleRooms,
  weather,
  energie,
  bernard,
  reseau,
}: DashboardProps) {
  return (
    <div className="space-y-4 pt-16">
      <header className="stagger space-y-8">
        <div className="flex flex-col items-start px-4">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {greeting}.
          </h1>
          <RepasLine {...repas} />
        </div>

        {/* Poubelle + anniversaire — a third the height of a bento tile; same width
            as one column on mobile (capped so they stay small on wider screens). */}
        {(poubelle || birthday) && (
          <div className="grid grid-cols-2 gap-3 sm:max-w-md">
            {poubelle && (
              <BentoItem span={1}>
                <PoubelleTile {...poubelle} />
              </BentoItem>
            )}
            {birthday && (
              <BentoItem span={1}>
                <BirthdayTile {...birthday} />
              </BentoItem>
            )}
          </div>
        )}
      </header>

      <BentoGrid rows="fixed" className="stagger">
        {salon && (
          <BentoItem span={2}>
            <SalonTile {...salon} />
          </BentoItem>
        )}

        {rooms.map(({ key, wide, ...room }) => (
          <BentoItem key={key} span={1} className={wide ? "sm:col-span-2" : undefined}>
            <RoomTile {...room} />
          </BentoItem>
        ))}

        {/* Weather — a full cell with no surface, floats into any hole the grid leaves */}
        <BentoItem span={2}>
          <WeatherTile {...weather} />
        </BentoItem>

        {idleRooms.length > 0 && (
          <BentoItem span={2}>
            <IdleRoomsTile rooms={idleRooms} />
          </BentoItem>
        )}

        <BentoItem span={2}>
          <EnergieTile {...energie} />
        </BentoItem>

        <BentoItem span={2}>
          <BernardTile {...bernard} />
        </BentoItem>

        <BentoItem span={2}>
          <ReseauTile {...reseau} />
        </BentoItem>
      </BentoGrid>
    </div>
  );
}
