---
name: nav-is-collapsed-sidebar
description: Navigation is a collapsed shadcn sidebar (UniFi-style rail), not a top bar
metadata:
  type: project
---

**Decision (2026-07-16, Alex validated):** the app's navigation is a **collapsed shadcn
sidebar** (icon rail, expands on demand), replacing the old top `TopNav`. Reference points Alex
gave: **UniFi OS** (left icon rail + console switcher) and **shadcn's `sidebar` component**.

**Why:** the nav is intrinsically two-level (mode: Maison/Sécurité/Budget → then the mode's
sections). A top bar crushed both onto one row — tight on desktop, a horizontal scroll strip on
mobile. A rail gives a vertical level that breathes and where Médias/Veille can land later.

**How it's built:**
- `src/components/ui/{sidebar,sheet,separator}.tsx` — canonical shadcn, vendored (Tailwind v4).
  `--sidebar-*` tokens live in `styles.css` (`@theme inline` + `:root` + `.dark`).
- `src/components/AppSidebar.tsx` — `<Sidebar collapsible="icon">`. **Header** = the mode switcher
  (Gustave portrait + label + `ChevronsUpDown`, dropdown to switch mode, reads `@/lib/modes`).
  **Content** = the current mode's sections (Maison leads with a Pièces rooms-dropdown). **Footer**
  = Design system, Outils, Théme. `ThemeToggle` gained an `asSidebarItem` prop.
- `src/routes/_app.tsx` — `SidebarProvider defaultOpen={false}` (collapsed rail by default, so the
  home stays edge-to-edge), `AppSidebar`, `SidebarInset` with a slim `h-14` sticky bar holding the
  `SidebarTrigger`. The full-bleed vs overlay content logic is unchanged inside the inset.
- `--nav-h` is now **56px** (the slim bar), single value (was 109/69). Sticky page sub-headers
  offset by `top-[var(--nav-h)]` (fixed the two hardcoded 66/68px in budget pages).
- **Deleted:** `TopNav.tsx`, `ModeSwitcher.tsx` (superseded; recover from git if needed).

Related: [[modes]] isn't a memory but `src/lib/modes.ts` is the mode source of truth; see
[[live-access-and-brief-workflow]] for how these renders were judged (Playwright screenshots).
