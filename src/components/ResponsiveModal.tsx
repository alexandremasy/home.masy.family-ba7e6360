import type { ReactNode } from "react";
import { AppSheet } from "@/components/AppSheet";
import { useSheetClose } from "@/lib/use-sheet-close";

/**
 * In-page modal (person edit, message studio). A thin wrapper over the shared
 * AppSheet — bottom sheet on mobile, top-anchored panel on desktop — so modals and
 * route overlays are literally the same shell. `size` tunes the desktop width.
 */
export function ResponsiveModal({
  open,
  onOpenChange,
  title,
  headerAction,
  size = "md",
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  headerAction?: ReactNode;
  size?: "md" | "lg";
  children: ReactNode;
}) {
  const { closing, requestClose } = useSheetClose({ open, onClosed: () => onOpenChange(false) });

  return (
    <AppSheet
      open={open}
      closing={closing}
      onRequestClose={requestClose}
      size={size}
      title={title}
      headerAction={headerAction}
    >
      {children}
    </AppSheet>
  );
}
