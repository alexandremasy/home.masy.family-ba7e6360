import type { ReactNode } from "react";
import { Loader2, PlugZap, Inbox } from "lucide-react";
import { Button } from "@/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/empty";

/** Which of the three non-content situations the page is in. */
export type DataStatus = "loading" | "error" | "empty";

export interface DataStateProps {
  /**
   * Which situation to show. `loading` while the data is on its way, `error` when the
   * request failed, `empty` when it succeeded and there is genuinely nothing.
   *
   * These are three different things and they must look like three different things: a
   * spinner that never resolves is how an unreachable api reads as a slow one.
   */
  status: DataStatus;
  /**
   * What is being loaded, as a French noun phrase with its article — "les plats", "le
   * plan". It fills the default copy, so most callers pass only this. Keep the article:
   * the sentences read "Impossible de charger les plats".
   */
  label: string;
  /** Replaces the default heading. */
  title?: ReactNode;
  /** Replaces the default line under the heading. */
  description?: ReactNode;
  /** Retry handler. Renders the retry button — only on `error`, where retrying means something. */
  onRetry?: () => void;
  /** Extra affordance under the description, typically the create-the-first-one link on `empty`. */
  children?: ReactNode;
  /** Extra classes on the wrapper. */
  className?: string;
}

/**
 * The page has no content to show — and says which of the three reasons that is.
 *
 * Every list in this app goes through the same three situations, and telling them apart
 * is the whole point: "Chargement…" that never ends is indistinguishable from a backend
 * that is down, and an empty grid says "you have nothing" when it means "we could not ask".
 *
 * A template takes `loading` / `error` as props and renders this; it never knows whether
 * the data came from a mock store or from the api.
 */
export function DataState({
  status,
  label,
  title,
  description,
  onRetry,
  children,
  className,
}: DataStateProps) {
  if (status === "loading") {
    return (
      <div
        className={
          "flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground " +
          (className ?? "")
        }
        role="status"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Chargement…
      </div>
    );
  }

  const failed = status === "error";

  return (
    <Empty className={className}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {failed ? <PlugZap className="h-5 w-5" /> : <Inbox className="h-5 w-5" />}
        </EmptyMedia>
        <EmptyTitle>{title ?? (failed ? "Connexion perdue" : "Rien pour l'instant")}</EmptyTitle>
        <EmptyDescription>
          {description ??
            (failed
              ? `Impossible de charger ${label}. Le service ne répond pas.`
              : "Il n'y a rien à afficher pour le moment.")}
        </EmptyDescription>
      </EmptyHeader>
      {(children || (failed && onRetry)) && (
        <EmptyContent>
          {failed && onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Réessayer
            </Button>
          )}
          {children}
        </EmptyContent>
      )}
    </Empty>
  );
}
