import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { BottomBar } from "@/components/bottom-bar";
import { AppSheet } from "@/components/app-sheet";
import { useSheetClose } from "@/lib/use-sheet-close";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/sidebar";
import { footerLines } from "@/lib/mock-data";
import { Dashboard } from "./_app.index";
import { LivingGradient } from "@/components/living-gradient";
import { useDocumentTitle } from "@/lib/page-title";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  // Tab title = active view, prefixed 🎨 to mark the mockup app.
  useDocumentTitle(pathname);

  // A module with its own world is full-bleed (it owns the whole content area).
  // Everything else opens as an overlay above the dashboard.
  const isFullBleed =
    pathname.startsWith("/budget") ||
    pathname.startsWith("/securite") ||
    pathname.startsWith("/repas") ||
    pathname.startsWith("/anniversaires");
  const isOverlay = !isFullBleed && pathname !== "/";

  // Close plays the exit animation, then navigates home — shared with in-page modals
  // via useSheetClose. `closing` also lifts the dashboard blur in parallel (below).
  const { closing, requestClose } = useSheetClose({
    open: isOverlay,
    onClosed: () => navigate({ to: "/" }),
  });

  // Pick a line based on day-of-year for a stable but rotating feel
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = (Number(new Date()) - Number(start)) / 86_400_000;
  const line = footerLines[Math.floor(diff) % footerLines.length];

  return (
    // Expanded by default — the full navigation stays visible (rooms, tools,
    // modes). The rail can still collapse to icons on demand (trigger / Cmd+B).
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      {/* Below md the rail is replaced by a floating bottom bar, so reserve the
          room it needs (bar height + its bottom offset). */}
      <SidebarInset className="isolate pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0">
        {/* Full-viewport living gradient — behind the content, above the page bg
            (SidebarInset is isolated). Shifts hue as the page scrolls. Lives only in
            the dashboard world: the home screen and the overlay modals above it. The
            full-bleed module pages (repas, anniversaires, budget…) own their own calm
            surface, so it doesn't mount there. */}
        {!isFullBleed && <LivingGradient />}
        {/* Repas paints the whole viewport a muted grey behind its content, so the
            page reads as one aligned surface top-to-bottom (its local glow sits over
            it). Fixed at the SidebarInset level — outside the transformed .mode-enter
            wrapper, which would otherwise trap a fixed layer. */}
        {pathname.startsWith("/repas") && (
          <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-muted" />
        )}
        {/* Light bar: just the rail toggle, no surface — the button floats over the
            page. pointer-events-none so the transparent strip never eats clicks on
            content scrolling beneath it; the trigger re-enables them. --nav-h mirrors
            its height for sticky page offsets. Desktop only — mobile uses the bottom bar. */}
        <header className="pointer-events-none sticky top-0 z-30 hidden h-14 items-center px-2 sm:px-4 md:flex">
          <SidebarTrigger className="pointer-events-auto size-9 rounded-full border border-border bg-card text-foreground shadow-soft hover:bg-secondary" />
        </header>

        {isFullBleed ? (
          <>
            <div
              key={pathname}
              className="mode-enter mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10"
            >
              <Outlet />
            </div>
            <footer className="mx-auto max-w-7xl px-4 pb-10 pt-6 text-center sm:px-6">
              <p className="text-sm italic text-muted-foreground">{line}</p>
            </footer>
          </>
        ) : (
          <>
            <div
              className={
                "mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 transition-all duration-500 " +
                // Restore the dashboard the instant a close starts (closing), in
                // parallel with the sheet sliding out — don't wait for navigation.
                (isOverlay && !closing
                  ? "scale-[0.985] opacity-40 md:blur-[1px]"
                  : "scale-100 opacity-100") +
                (isOverlay ? " pointer-events-none select-none" : "")
              }
              aria-hidden={isOverlay}
            >
              <Dashboard />
            </div>

            <footer className="mx-auto max-w-6xl px-4 pb-10 pt-6 text-center sm:px-6">
              <p className="text-sm italic text-muted-foreground">{line}</p>
            </footer>

            {/* The one sheet shell, shared with in-page modals (AppSheet). Below md a
                Stripe-style bottom drawer; at md+ a top-anchored panel. `closing` is
                owned here (useSheetClose) so the dashboard blur above can lift in
                parallel with the exit animation. */}
            <AppSheet open={isOverlay} closing={closing} onRequestClose={requestClose} size="lg">
              <Outlet />
            </AppSheet>
          </>
        )}
      </SidebarInset>
      <BottomBar />
    </SidebarProvider>
  );
}
