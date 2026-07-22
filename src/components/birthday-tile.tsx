import { Cake } from "lucide-react";
import { Card } from "@/components/card";

export interface BirthdayTileProps {
  /** Where the tile leads — the anniversaires page. */
  to: string;
  /** Whose birthday it is. What the tile is really about, so it comes first. */
  name: string;
  /**
   * The age they are turning. Absent when the birth year is unknown — the tile
   * then names the occasion instead of inventing a number.
   */
  age?: number;
  /** Days until it. 0 is today, and today the cake steps forward. */
  days: number;
}

/**
 * The next birthday — an event of row 1, the same pill as the collection beside it.
 *
 * The countdown is a phrase rather than a number ("Demain", "Dans 6 j"): a date on
 * a dashboard is read in passing, and nobody counts days from one.
 */
export function BirthdayTile({ to, name, age, days }: BirthdayTileProps) {
  const today = days === 0;
  const when = today ? "Auj." : days === 1 ? "Demain" : `Dans ${days} j`;

  return (
    <Card to={to} variant="inset" radius="full" padding="sm">
      <Cake
        className={
          "pointer-events-none absolute -right-3 -top-2 h-16 w-16 " +
          (today ? "opacity-15" : "opacity-[0.06]")
        }
      />
      <div className="relative min-w-0">
        <p className="break-words text-base font-semibold leading-tight">
          {age != null ? `${name} a ${age} ans` : `L'anniversaire de ${name}`}
        </p>
        <p className={"text-2xs " + (today ? "opacity-80" : "text-muted-foreground")}>{when}</p>
      </div>
    </Card>
  );
}
