import { Sofa, Briefcase, UtensilsCrossed, Bed, Footprints, type LucideProps } from "lucide-react";
import type { Room } from "@/lib/mock-data";

const map = {
  sofa: Sofa,
  briefcase: Briefcase,
  utensils: UtensilsCrossed,
  bed: Bed,
  footprints: Footprints,
} as const;

export function RoomIcon({ icon, ...props }: { icon: Room["icon"] } & LucideProps) {
  const Cmp = map[icon];
  return <Cmp {...props} />;
}
