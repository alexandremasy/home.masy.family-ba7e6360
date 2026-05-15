import { useEffect } from "react";
import { createFileRoute, Outlet, useLocation, useNavigate, Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { CursorFollower } from "@/components/CursorFollower";
import { footerLines } from "@/lib/mock-data";
import { Dashboard } from "./_app.index";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isOverlay = pathname !== "/";

  // Pick a line based on day-of-year for a stable but rotating feel
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = (Number(new Date()) - Number(start)) / 86_400_000;
  const line = footerLines[Math.floor(diff) % footerLines.length];

  // Close overlay on Escape
  useEffect(() => {
    if (!isOverlay) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") navigate({ to: "/" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOverlay, navigate]);

  // Lock body scroll while overlay is open
  useEffect(() => {
    if (!isOverlay) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOverlay]);

  return (
    <div className="min-h-screen bg-background">
      <CursorFollower />
      <TopNav />

      {/* Dashboard: always rendered as the persistent base layer */}
      <main
        className={
          "mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 transition-all duration-500 " +
          (isOverlay ? "scale-[0.985] opacity-60 blur-[1px] pointer-events-none select-none" : "scale-100 opacity-100")
        }
        aria-hidden={isOverlay}
      >
        <Dashboard />
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-10 pt-6 text-center sm:px-6">
        <p className="font-serif text-sm italic text-muted-foreground">{line}</p>
      </footer>

      {/* Stripe-like slide-up modal for child routes */}
      {isOverlay && (
        <div
          key={pathname}
          className="fixed inset-0 z-40 overflow-y-auto overlay-enter"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop — click to close */}
          <Link
            to="/"
            aria-label="Fermer"
            className="overlay-backdrop fixed inset-0 z-0 bg-foreground/30 backdrop-blur-md"
          />

          {/* Sliding panel */}
          <div className="overlay-panel relative z-10 mx-auto mt-16 mb-8 w-full max-w-5xl px-4 sm:mt-24 sm:px-6">
            <div className="relative rounded-3xl border border-border/60 bg-background shadow-lift">
              <Link
                to="/"
                aria-label="Fermer"
                className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-secondary text-foreground/70 transition-colors hover:bg-secondary/80 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-4 w-4" />
              </Link>
              <div className="px-5 py-7 sm:px-8 sm:py-10">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
