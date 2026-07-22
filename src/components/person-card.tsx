import { nextBirthday, upcomingAge, hasBirthYear, type Person } from "@/lib/maison-data";
import { cap } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/card";

/**
 * The small person card: the name as the card title, relation · date · age as its
 * subline. A right chevron signals it's actionable. With onEdit it becomes a button
 * opening the edit modal; without, a static tile.
 *
 * It has no shell of its own — it is a `Card` with a header and no body.
 */
export function PersonCard({ person, onEdit }: { person: Person; onEdit?: () => void }) {
  const meta = [
    cap(person.relation),
    nextBirthday(person).toLocaleDateString("fr-BE", { day: "numeric", month: "long" }),
    hasBirthYear(person.dob) ? `${upcomingAge(person)} ans` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const card = (
    <Card
      as="div"
      variant="solid"
      padding="sm"
      title={person.name}
      subline={meta}
      // The card is not a link here, so it carries the caret itself.
      trailing={<ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
      // The button wraps the card, so the hover tint has to reach the filled sheet.
      className={
        onEdit
          ? "[&_[data-slot=sheet]]:transition-colors hover:[&_[data-slot=sheet]]:bg-secondary/40"
          : undefined
      }
    />
  );

  if (onEdit) {
    return (
      <button type="button" onClick={onEdit} className="w-full text-left">
        {card}
      </button>
    );
  }
  return card;
}
