import * as DialogPrimitive from "@radix-ui/react-dialog";
import { createFileRoute, Outlet, useLocation, useNavigate, Link } from "@tanstack/react-router";
import { AppSidebar } from "@/components/AppSidebar";
import { BottomBar } from "@/components/BottomBar";
import { MobileDrawerPanel } from "@/components/MobileDrawerPanel";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { footerLines } from "@/lib/mock-data";
import { Dashboard } from "./_app.index";
import { OverlayCloseLink } from "@/components/OverlayCloseLink";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // A module with its own world is full-bleed (it owns the whole content area).
  // Everything else opens as an overlay above the dashboard.
  const isFullBleed =
    pathname.startsWith("/budget") ||
    pathname.startsWith("/securite") ||
    pathname.startsWith("/repas") ||
    pathname.startsWith("/anniversaires") ||
    // Not in any nav — a reference page, reachable by URL.
    pathname.startsWith("/design-system");
  const isOverlay = !isFullBleed && pathname !== "/";
  // Room views carry their own drag handle inside a sticky header, so the panel's
  // own grabber (which scrolls away) is hidden for them.
  const isRoom = pathname.startsWith("/room/");

  // Pick a line based on day-of-year for a stable but rotating feel
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = (Number(new Date()) - Number(start)) / 86_400_000;
  const line = footerLines[Math.floor(diff) % footerLines.length];

  return (
    // Collapsed to an icon rail by default — the calm home stays edge-to-edge,
    // the rail expands on demand (trigger / Cmd+B / hover the toggle).
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      {/* Below md the rail is replaced by a floating bottom bar, so reserve the
          room it needs (bar height + its bottom offset). */}
      <SidebarInset className="pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0">
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
              <p className="font-serif text-sm italic text-muted-foreground">{line}</p>
            </footer>
          </>
        ) : (
          <>
            <div
              className={
                "mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 transition-all duration-500 " +
                (isOverlay
                  ? "scale-[0.985] opacity-60 blur-[1px] pointer-events-none select-none"
                  : "scale-100 opacity-100")
              }
              aria-hidden={isOverlay}
            >
              <Dashboard />
            </div>

            <footer className="mx-auto max-w-6xl px-4 pb-10 pt-6 text-center sm:px-6">
              <p className="font-serif text-sm italic text-muted-foreground">{line}</p>
            </footer>

            {/* On Radix Dialog, not by hand — it traps focus, handles Escape and the
                scroll lock. Not ui/sheet (a side panel) nor ui/dialog (a centred
                box): the primitives with our own shape. Below sm it's a Stripe-style
                bottom drawer (anchored to the bottom, rounded top, slides up); at sm
                and up it's the centred panel that scrolls its whole container. */}
            <DialogPrimitive.Root
              open={isOverlay}
              onOpenChange={(o) => {
                if (!o) navigate({ to: "/" });
              }}
            >
              <DialogPrimitive.Portal>
                <DialogPrimitive.Content
                  key={pathname}
                  className="overlay-enter fixed inset-0 z-40 flex flex-col justify-end overflow-hidden sm:block sm:overflow-y-auto sm:overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  aria-describedby={undefined}
                >
                  {/* Radix needs a title to announce; the real one is inside the route. */}
                  <DialogPrimitive.Title className="sr-only">Détail</DialogPrimitive.Title>

                  <Link
                    to="/"
                    aria-label="Fermer"
                    tabIndex={-1}
                    className="overlay-backdrop fixed inset-0 z-0 bg-foreground/30 backdrop-blur-md"
                  />
                  <div className="overlay-panel relative z-10 w-full sm:mx-auto sm:mt-24 sm:mb-8 sm:w-full sm:max-w-5xl sm:px-6">
                    <MobileDrawerPanel onClose={() => navigate({ to: "/" })} showHandle={!isRoom}>
                      <div className="px-5 pb-8 pt-4 sm:px-8 sm:py-10">
                        <Outlet />
                      </div>
                    </MobileDrawerPanel>
                  </div>
                  <OverlayCloseLink to="/" className="hidden sm:grid" />
                </DialogPrimitive.Content>
              </DialogPrimitive.Portal>
            </DialogPrimitive.Root>
          </>
        )}
      </SidebarInset>
      <BottomBar />
    </SidebarProvider>
  );
}
