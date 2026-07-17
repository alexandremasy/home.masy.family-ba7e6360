import { useEffect } from "react";

/**
 * Lock background scroll while a modal/sheet is open — iOS-safe.
 *
 * `overflow: hidden` on <body> does NOT reliably stop touch scrolling on iOS
 * Safari/Chrome, so we pin the body with `position: fixed` at its current scroll
 * offset and restore it (and the scroll position) on unlock. This complements
 * Radix's own scroll lock, which leaks on iOS.
 */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const { body } = document;
    const scrollY = window.scrollY;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      window.scrollTo(0, scrollY);
    };
  }, [locked]);
}
