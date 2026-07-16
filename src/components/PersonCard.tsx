import { nextBirthday, upcomingAge, hasBirthYear, type Person } from "@/lib/maison-data";
import { cap } from "@/lib/utils";
import { Eyebrow } from "@/components/Eyebrow";

/**
 * The small person card: name + relation on the left, birthday date + age on the
 * right. With onEdit it becomes a button opening the edit modal; without, a
 * static tile.
 */
export function PersonCard({ person, onEdit }: { person: Person; onEdit?: () => void }) {
  const cls = "flex items-center justify-between gap-3 rounded-md border border-border/60 bg-card p-3 shadow-soft";
  const body = (
    <>
      <div className="min-w-0">
        <p className="truncate font-serif text-base font-semibold leading-tight">{person.name}</p>
        <p className="text-xs text-muted-foreground">{cap(person.relation)}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-serif text-base">
          {nextBirthday(person).toLocaleDateString("fr-BE", { day: "numeric", month: "long" })}
        </p>
        {hasBirthYear(person.dob) && <Eyebrow size="xs">{upcomingAge(person)} ans</Eyebrow>}
      </div>
    </>
  );

  if (onEdit) {
    return (
      <button type="button" onClick={onEdit} className={cls + " w-full text-left transition-colors hover:bg-secondary/40"}>
        {body}
      </button>
    );
  }
  return <div className={cls}>{body}</div>;
}
