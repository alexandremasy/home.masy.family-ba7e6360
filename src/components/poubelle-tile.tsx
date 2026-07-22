import { Card } from "@/components/card";
import { PMCBag } from "@/components/pmc-bag";

export interface PoubelleTileProps {
  /** What goes out — "PMC", "Papier-carton", "Déchets ménagers". */
  type: string;
  /** The deadline, as a clock time — the bag has to be out before it. */
  time: string;
  /** Which day it is for. "Auj." unless the caller looks further ahead. */
  when?: string;
}

/**
 * The next collection, as a pill. A third the height of a bento tile, because it
 * answers one question — is a bag going out today, and by when.
 *
 * The bag itself is drawing, not information: it bleeds off the top-right corner
 * and the card clips it. It never carries the type, so a collection with no
 * matching art still reads.
 */
export function PoubelleTile({ type, time, when = "Auj." }: PoubelleTileProps) {
  return (
    <Card variant="inset" radius="full" padding="sm" as="div">
      <PMCBag className="pointer-events-none absolute -right-2 -top-1 h-[150%] w-auto opacity-90" />
      <div className="relative min-w-0">
        <p className="truncate text-base font-semibold leading-tight">{type}</p>
        <p className="text-2xs opacity-80">
          {when} · avant {time}
        </p>
      </div>
    </Card>
  );
}
