import { forwardRef, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Simulates a Home Assistant command round-trip.
 * Random latency (350–1250 ms) and a small chance of failure (~12 %).
 * Replace with the real service call when wired to HA.
 */
export function simulateHACommand(): Promise<void> {
  const delay = 350 + Math.random() * 900;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.12) reject(new Error("Home Assistant a répondu avec une erreur."));
      else resolve();
    }, delay);
  });
}

/**
 * Deliberately NOT built on ui/button, and this is not an oversight.
 *
 * CommandButton contributes a behaviour (pending / errored round-trip) and no
 * box: all 13 call sites define their own, and they contradict Button's base —
 * `grid place-items-center` / `flex-col` boxes at h-7, h-11, h-16 against
 * Button's `inline-flex items-center justify-center` and `h-9`. Worse,
 * Button's `[&_svg]:size-4` outranks an icon's own `h-3.5` on specificity, so
 * every icon on the room page would silently jump to 16px.
 *
 * Wrap it in a <Button> only if those 13 boxes are redesigned first.
 */
type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  /** Called once the simulated command resolves successfully. */
  onCommand?: () => void;
  /** Human label used in the error toast, e.g. "Scène Travail". */
  commandLabel?: string;
  children: ReactNode;
};

export const CommandButton = forwardRef<HTMLButtonElement, Props>(function CommandButton(
  { onCommand, commandLabel, children, className, disabled, ...rest },
  ref,
) {
  const [pending, setPending] = useState(false);
  const [errored, setErrored] = useState(false);
  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = async () => {
    if (pending) return;
    if (errorTimer.current) clearTimeout(errorTimer.current);
    setPending(true);
    setErrored(false);
    try {
      await simulateHACommand();
      onCommand?.();
    } catch (err) {
      setErrored(true);
      toast.error(commandLabel ? `« ${commandLabel} » a échoué` : "Commande échouée", {
        description: (err as Error).message ?? "Réessaie dans un instant.",
      });
      errorTimer.current = setTimeout(() => setErrored(false), 1800);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      ref={ref}
      {...rest}
      type="button"
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      data-pending={pending || undefined}
      data-errored={errored || undefined}
      onClick={handleClick}
      className={cn(
        "relative disabled:opacity-100",
        pending && "cursor-wait",
        errored && "ring-2 ring-destructive ring-offset-2 ring-offset-background anim-shake",
        className,
      )}
    >
      <span className={cn(pending && "opacity-40 transition-opacity")}>{children}</span>
      {pending && (
        <span className="pointer-events-none absolute inset-0 grid place-items-center rounded-[inherit]">
          <Loader2 className="h-4 w-4 animate-spin" />
        </span>
      )}
    </button>
  );
});
