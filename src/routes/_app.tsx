import { useEffect } from "react";
import { createFileRoute, Outlet, useLocation, useNavigate, Link } from "@tanstack/react-router";
import { TopNav } from "@/components/TopNav";
import { footerLines } from "@/lib/mock-data";
import { Dashboard } from "./_app.index";
import { OverlayCloseLink } from "@/components/OverlayCloseLink";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // A module with its own world is full-bleed (its tabs live in the TopNav, which an
  // overlay would cover). Everything else opens as an overlay above the dashboard.
  const isFullBleed =
    pathname.startsWith("/budget") ||
    pathname.startsWith("/securite") ||
    pathname.startsWith("/repas") ||
    pathname.startsWith("/anniversaires");
  const isOverlay = !isFullBleed && pathname !== "/";

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

  // Full-bleed shell — no Maison backdrop, no overlay. The route owns the whole page.
  if (isFullBleed) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <main key={pathname} className="mode-enter mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
          <Outlet />
        </main>
        <footer className="mx-auto max-w-7xl px-4 pb-10 pt-6 text-center sm:px-6">
          <p className="font-serif text-sm italic text-muted-foreground">{line}</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

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

      {isOverlay && (
        <div
          key={pathname}
          className="fixed inset-0 z-40 overflow-y-auto overflow-x-hidden overlay-enter [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="dialog"
          aria-modal="true"
        >
          <Link
            to="/"
            aria-label="Fermer"
            className="overlay-backdrop fixed inset-0 z-0 bg-foreground/30 backdrop-blur-md"
          />
          <div className="overlay-panel relative z-10 mx-0 mt-16 mb-8 w-screen max-w-none sm:mx-auto sm:mt-24 sm:w-full sm:max-w-5xl sm:px-6">
            <div className="relative overflow-clip border border-border/60 bg-background shadow-lift sm:rounded-3xl">
              <div className="px-5 py-7 sm:px-8 sm:py-10">
                <Outlet />
              </div>
            </div>
          </div>
          <OverlayCloseLink to="/" />
        </div>
      )}
    </div>
  );
}
