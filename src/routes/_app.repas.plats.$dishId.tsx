import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { PlatDetailTemplate } from "@/templates/repas-plat-detail";
import { useDishes } from "@/lib/dishes-store";
import { initialPlan } from "@/lib/maison-data";

export const Route = createFileRoute("/_app/repas/plats/$dishId")({
  component: DishDetail,
});

// The page is the template; this file reads the dish and says what saving and
// deleting mean. Here the mock store answers synchronously.
function DishDetail() {
  const { dishId } = Route.useParams();
  const { get, update, remove } = useDishes();
  const navigate = useNavigate();

  const dish = get(dishId) ?? null;
  const plannedCount = useMemo(
    () => initialPlan.filter((e) => e.dishId === dishId).length,
    [dishId],
  );

  return (
    <PlatDetailTemplate
      dish={dish}
      plannedCount={plannedCount}
      onCancel={() => navigate({ to: "/repas/plats" })}
      onSubmit={(draft) => {
        if (!dish) return;
        update(dish.id, draft);
        navigate({ to: "/repas/plats" });
      }}
      onDelete={() => {
        if (!dish) return;
        remove(dish.id);
        navigate({ to: "/repas/plats" });
      }}
    />
  );
}
