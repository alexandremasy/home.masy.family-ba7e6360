import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { Eyebrow } from "@/components/eyebrow";

export interface RepasLineProps {
  /** Where the line leads — the repas page. */
  to: string;
  /** The day, written out — "mercredi 22 juillet". Also read out as the link's label. */
  dateLabel: string;
  /** What is planned for midday, if anything. */
  midi?: string;
  /** What is planned for the evening, if anything. */
  soir?: string;
}

/**
 * Today's menu, under the greeting. Not a tile: it belongs to the header, so it
 * reads as a sentence about the day rather than one more card to scan.
 *
 * The slot is a glyph (sun, moon) instead of a word, because two lines that both
 * start with a label read as a table, and this is meant to be read in passing.
 */
export function RepasLine({ to, dateLabel, midi, soir }: RepasLineProps) {
  return (
    <Link
      to={to}
      aria-label={`Repas du ${dateLabel}`}
      className="group mt-8 block w-full min-w-0 max-w-md py-0.5"
    >
      <Eyebrow tone="current" size="xs" as="span" className="block text-muted-foreground">
        {dateLabel}
      </Eyebrow>

      {midi || soir ? (
        <div className="mt-2 space-y-1.5">
          {midi && <MealRow icon={<Sun className="h-3.5 w-3.5 text-mustard" />} name={midi} />}
          {soir && <MealRow icon={<Moon className="h-3.5 w-3.5 text-primary" />} name={soir} />}
        </div>
      ) : (
        <p className="mt-2 text-sm italic text-muted-foreground/60">Rien de prévu</p>
      )}
    </Link>
  );
}

/** One meal line — slot glyph then the dish, truncated so long names never break the grid. */
function MealRow({ icon, name }: { icon: ReactNode; name: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="shrink-0">{icon}</span>
      <span className="min-w-0 truncate text-sm leading-tight text-muted-foreground">{name}</span>
    </div>
  );
}
