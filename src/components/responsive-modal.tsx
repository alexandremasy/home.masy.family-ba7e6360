import type { ReactNode } from "react";
import { AppSheet } from "@/components/app-sheet";
import { useSheetClose } from "@/lib/use-sheet-close";

/**
 * In-page modal (person edit, message studio). A thin wrapper over the shared
 * AppSheet — bottom sheet on mobile, top-anchored panel on desktop — so modals and
 * route overlays are literally the same shell. `size` tunes the desktop width.
 *
 * It carries the sheet's full anatomy: what goes in the header and what goes in the
 * footer is decided here, by the caller, never redrawn inside the content.
 */
export function ResponsiveModal({
  open,
  onOpenChange,
  title,
  subline,
  icon,
  trailing,
  footer,
  size = "md",
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  subline?: string;
  icon?: ReactNode;
  trailing?: ReactNode;
  footer?: ReactNode;
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
      subline={subline}
      icon={icon}
      trailing={trailing}
      footer={footer}
    >
      {children}
    </AppSheet>
  );
}
