import { Sofa, Briefcase, UtensilsCrossed, Bed, Footprints, WashingMachine, type LucideProps } from "lucide-react";
import type { Room } from "@/lib/mock-data";

const map = {
  sofa: Sofa,
  briefcase: Briefcase,
  utensils: UtensilsCrossed,
  bed: Bed,
  footprints: Footprints,
  "washing-machine": WashingMachine,
} as const;

export function RoomIcon({ icon, ...props }: { icon: Room["icon"] } & LucideProps) {
  const Cmp = map[icon];
  return <Cmp {...props} />;
}
