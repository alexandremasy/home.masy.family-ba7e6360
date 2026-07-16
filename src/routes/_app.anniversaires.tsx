import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PeopleProvider } from "@/lib/people-store";

export const Route = createFileRoute("/_app/anniversaires")({
  component: () => (
    <PeopleProvider>
      <Outlet />
    </PeopleProvider>
  ),
});
