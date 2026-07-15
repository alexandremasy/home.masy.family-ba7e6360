import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Capitalise the first letter only — "boeuf haché" → "Boeuf haché".
 * Tailwind's `capitalize` would give "Boeuf Haché", and the fr locale hands us
 * lowercase day names, so this gets used for both.
 */
export function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
