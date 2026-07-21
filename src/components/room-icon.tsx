import {
  Sofa,
  Briefcase,
  UtensilsCrossed,
  Bed,
  Footprints,
  WashingMachine,
  type LucideProps,
} from "lucide-react";
import type { Room } from "@/lib/mock-data";

const map = {
  sofa: Sofa,
  briefcase: Briefcase,
  utensils: UtensilsCrossed,
  bed: Bed,
  footprints: Footprints,
  "washing-machine": WashingMachine,
} as const;

/**
 * The room's glyph. It carries NO colour of its own: dropped in a card's `icon`
 * slot it must take the tinted circle's colour, and it used to force
 * `text-foreground`, which is why the room tiles on the dashboard showed a black
 * glyph while every other tile showed the toned one. Colour it at the call site
 * when it sits outside a slot that already colours it.
 */
export function RoomIcon({ icon, className, ...props }: { icon: Room["icon"] } & LucideProps) {
  const Cmp = map[icon];
  return <Cmp className={className} {...props} />;
}
