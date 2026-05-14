import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { TopNav } from "@/components/TopNav";
import { footerLines } from "@/lib/mock-data";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { pathname } = useLocation();
  // Pick a line based on day-of-year for a stable but rotating feel
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = (Number(new Date()) - Number(start)) / 86_400_000;
  const line = footerLines[Math.floor(diff) % footerLines.length];

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main key={pathname} className="page-enter mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <Outlet />
      </main>
      <footer className="mx-auto max-w-6xl px-4 pb-10 pt-6 text-center sm:px-6">
        <p key={pathname + "-f"} className="font-serif text-sm italic text-muted-foreground anim-slide-up">{line}</p>
      </footer>
    </div>
  );
}
