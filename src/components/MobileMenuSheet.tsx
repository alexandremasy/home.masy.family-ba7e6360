import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Link, useLocation } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { X, Palette, ExternalLink, LayoutGrid } from "lucide-react";
import { RoomIcon } from "@/components/RoomIcon";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { Room } from "@/lib/mock-data";
import { modes, currentMode } from "@/lib/modes";
import { rooms, upcoming, externals, navForMode } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { useScrollLock } from "@/lib/use-scroll-lock";

const rowCls = (active: boolean) =>
  cn(
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
    active
      ? "bg-secondary font-medium text-foreground"
      : "text-foreground/80 hover:bg-secondary/60",
  );

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pb-1 pt-4 text-2xs font-medium uppercase tracking-eyebrow text-muted-foreground">
      {children}
    </p>
  );
}

// A menu row that navigates and closes the sheet. `asChild` on Close lets the
// Link be the interactive element while still dismissing the sheet.
function NavRow({
  to,
  params,
  icon: Icon,
  label,
  active,
}: {
  to: string;
  params?: Record<string, string>;
  icon: LucideIcon;
  label: string;
  active: boolean;
}) {
  return (
    <DialogPrimitive.Close asChild>
      <Link to={to} params={params} className={rowCls(active)}>
        <Icon className={cn("size-5 shrink-0", active && "text-primary")} />
        <span className="flex-1 truncate">{label}</span>
      </Link>
    </DialogPrimitive.Close>
  );
}

/**
 * The full mobile menu — the bottom bar's Gustave button deploys it into a sheet
 * that slides up from the bottom: an identity card and a close button float over
 * the dimmed backdrop, and a rounded panel carries every destination (modes, the
 * current mode's sections, rooms, tools, theme). Mirrors the reference dribbble
 * layout. Mobile only.
 */
export function MobileMenuSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { pathname } = useLocation();
  const current = currentMode(pathname);
  const isMaison = current.key === "maison";
  const activeRoom = rooms.find((r) => pathname.startsWith("/room/" + r.key));
  const isActive = (to: string) => pathname === to || pathname.startsWith(to + "/");
  useScrollLock(open);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 md:hidden" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 flex flex-col px-3 transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom data-[state=closed]:duration-300 data-[state=open]:duration-500 md:hidden"
        >
          <DialogPrimitive.Title className="sr-only">Menu</DialogPrimitive.Title>

          {/* Header — identity card + close, floating over the backdrop. */}
          <div className="mx-auto flex w-full max-w-md items-center gap-3 pb-2">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-card p-2.5 shadow-float">
              <img
                src={current.gustave}
                alt=""
                className="size-9 shrink-0 rounded-lg object-cover object-top ring-1 ring-border"
              />
              <div className="min-w-0">
                <p className="truncate font-serif text-sm font-medium leading-tight">
                  {current.label}
                </p>
                <p className="truncate text-2xs text-muted-foreground">Assistant maison</p>
              </div>
            </div>
            <DialogPrimitive.Close
              aria-label="Fermer"
              className="grid size-12 shrink-0 place-items-center rounded-2xl bg-card text-foreground shadow-float transition-colors hover:bg-secondary"
            >
              <X className="size-5" />
            </DialogPrimitive.Close>
          </div>

          {/* Panel — the full menu. */}
          <div className="mx-auto flex max-h-[68vh] w-full max-w-md flex-col overflow-y-auto rounded-t-3xl border border-border/60 bg-background p-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-float [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {/* Home — back to the bento dashboard. */}
            <NavRow to="/" icon={LayoutGrid} label="Accueil" active={pathname === "/"} />

            {/* Current mode's own navigation leads — we're already in it. */}
            <GroupLabel>{current.label}</GroupLabel>
            {navForMode(current.key).map((item) => (
              <NavRow
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                active={isActive(item.to)}
              />
            ))}

            {isMaison && (
              <>
                <GroupLabel>Pièces</GroupLabel>
                {rooms.map((r) => (
                  <DialogPrimitive.Close asChild key={r.key}>
                    <Link
                      to="/room/$roomKey"
                      params={{ roomKey: r.key }}
                      className={rowCls(activeRoom?.key === r.key)}
                    >
                      <RoomIcon
                        icon={r.icon as Room["icon"]}
                        className={cn(
                          "size-5 shrink-0",
                          activeRoom?.key === r.key && "text-primary",
                        )}
                      />
                      <span className="flex-1 truncate">{r.label}</span>
                    </Link>
                  </DialogPrimitive.Close>
                ))}
              </>
            )}

            <GroupLabel>Outils</GroupLabel>
            <NavRow
              to="/design-system"
              icon={Palette}
              label="Design system"
              active={isActive("/design-system")}
            />
            {externals.map((item) => {
              const I = item.icon;
              return (
                <DialogPrimitive.Close asChild key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={rowCls(false)}
                  >
                    <I className="size-5 shrink-0" />
                    <span className="flex-1 truncate">{item.label}</span>
                    <ExternalLink className="size-3.5 opacity-50" />
                  </a>
                </DialogPrimitive.Close>
              );
            })}

            <GroupLabel>Bientôt</GroupLabel>
            {upcoming.map((m) => {
              const I = m.icon;
              return (
                <div
                  key={m.key}
                  aria-disabled
                  className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground/60"
                >
                  <I className="size-5 shrink-0" />
                  <span className="flex-1 truncate">{m.label}</span>
                  <span className="rounded-full bg-secondary px-1.5 py-0.5 text-2xs uppercase tracking-wider">
                    Bientôt
                  </span>
                </div>
              );
            })}

            {/* Mode switcher last — we're already in the current one. */}
            <GroupLabel>Modes</GroupLabel>
            {modes.map((m) => (
              <DialogPrimitive.Close asChild key={m.key}>
                <Link to={m.to} className={rowCls(m.key === current.key)}>
                  <img
                    src={m.gustave}
                    alt=""
                    className="size-6 shrink-0 rounded-md object-cover object-top ring-1 ring-border/60"
                  />
                  <span className="flex-1 truncate">{m.label}</span>
                  {m.key === current.key && <span className="size-1.5 rounded-full bg-primary" />}
                </Link>
              </DialogPrimitive.Close>
            ))}

            <GroupLabel>Thème</GroupLabel>
            <div className="px-1">
              <ThemeToggle asSegmented />
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
