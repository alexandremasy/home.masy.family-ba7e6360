import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/budget")({
  component: BudgetLayout,
  head: () => ({
    meta: [
      { title: "Budget — Cockpit" },
      { name: "description", content: "Lecture, exploration et curation du budget familial." },
    ],
  }),
});

function BudgetLayout() {
  return <Outlet />;
}
