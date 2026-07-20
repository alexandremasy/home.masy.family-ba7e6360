import { nextBirthday, upcomingAge, hasBirthYear, type Person } from "@/lib/maison-data";
import { cap } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

/**
 * The small person card: name on top, then relation · date · age on one muted line.
 * A right chevron signals it's actionable. With onEdit it becomes a button opening
 * the edit modal; without, a static tile.
 */
export function PersonCard({ person, onEdit }: { person: Person; onEdit?: () => void }) {
  const cls =
    "flex items-center justify-between gap-3 rounded-md border border-border/60 bg-card p-3";
  const meta = [
    cap(person.relation),
    nextBirthday(person).toLocaleDateString("fr-BE", { day: "numeric", month: "long" }),
    hasBirthYear(person.dob) ? `${upcomingAge(person)} ans` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const body = (
    <>
      <div className="min-w-0">
        <p className="truncate font-serif text-sm font-semibold leading-tight">{person.name}</p>
        <p className="truncate text-xs text-muted-foreground">{meta}</p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </>
  );

  if (onEdit) {
    return (
      <button
        type="button"
        onClick={onEdit}
        className={cls + " w-full text-left transition-colors hover:bg-secondary/40"}
      >
        {body}
      </button>
    );
  }
  return <div className={cls}>{body}</div>;
}
