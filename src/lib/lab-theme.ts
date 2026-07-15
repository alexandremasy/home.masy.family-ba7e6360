// Home OS — the vocabulary (not a composition).
// This is what makes the language extensible beyond one frame: tokens + primitives that any
// surface (central console, 480×480 wall touchscreen, TV) composes at its own density.
//
// TOKENS      --bg (sober) · --surface · --accent-lite · --accent-deep · --ink/--dim/--hot
//             radii, elevation (--sh). Light + dark follow the browser.
// PRIMITIVES  .tile-accent (big colour pop) · .tile-deep (2nd colour pop) · .surface (opaque)
//             .glass (the rare exception) · .orb (round control) · .dock + .tip · .eq · .bar
// RULE        colour lives in the tiles, never in the background. Glass is an exception, not the rule.

export const LAB_THEME_CSS = `
/* ---------- LIGHT ---------- */
.lab-root {
  --bg: oklch(0.965 0.010 80);
  --surface-c: oklch(1 0 0); --surface-br: oklch(0.90 0.012 80);
  --ink: oklch(0.24 0.03 40); --dim: oklch(0.50 0.03 50); --hot: oklch(0.58 0.16 35);
  --accent-lite: oklch(0.84 0.115 72); --accent-deep: oklch(0.62 0.16 34);
  --glass-bg: rgba(255,255,255,0.55); --glass-br: rgba(255,255,255,0.85);
  --chip: rgba(0,0,0,0.05); --track: rgba(0,0,0,0.08);
  --sh: 0 18px 44px -24px rgba(80,45,20,0.35);
  --ease: cubic-bezier(0.2,0.7,0.2,1);
  background: var(--bg); color: var(--ink);
}
/* ---------- DARK (browser, or forced .dark) ---------- */
@media (prefers-color-scheme: dark) {
  .lab-root {
    --bg: oklch(0.145 0.018 32);
    --surface-c: oklch(0.205 0.020 34); --surface-br: oklch(0.26 0.02 34);
    --ink: oklch(0.96 0.012 75); --dim: oklch(0.66 0.02 60); --hot: oklch(0.84 0.115 72);
    --glass-bg: rgba(255,248,240,0.07); --glass-br: rgba(255,238,222,0.14);
    --chip: rgba(255,255,255,0.10); --track: rgba(255,255,255,0.10);
    --sh: 0 24px 60px -28px rgba(0,0,0,0.75);
  }
}
.dark .lab-root {
  --bg: oklch(0.145 0.018 32);
  --surface-c: oklch(0.205 0.020 34); --surface-br: oklch(0.26 0.02 34);
  --ink: oklch(0.96 0.012 75); --dim: oklch(0.66 0.02 60); --hot: oklch(0.84 0.115 72);
  --glass-bg: rgba(255,248,240,0.07); --glass-br: rgba(255,238,222,0.14);
  --chip: rgba(255,255,255,0.10); --track: rgba(255,255,255,0.10);
  --sh: 0 24px 60px -28px rgba(0,0,0,0.75);
}
/* ---------- PRIMITIVES ---------- */
.tile-accent { background: var(--accent-lite); box-shadow: var(--sh), inset 0 1px 0 rgba(255,255,255,0.4); }
.tile-deep   { background: var(--accent-deep); box-shadow: var(--sh), inset 0 1px 0 rgba(255,255,255,0.25); }
.surface     { background: var(--surface-c); border: 1px solid var(--surface-br); box-shadow: var(--sh); }
.glass       { background: var(--glass-bg); border: 1px solid var(--glass-br); backdrop-filter: blur(20px) saturate(1.2); box-shadow: var(--sh), inset 0 1px 0 var(--glass-br); }
.orb  { display:grid; place-items:center; border-radius:999px; color:var(--dim); background: var(--surface-c); border:1px solid var(--surface-br); }
.arrow-btn { display:grid; place-items:center; width:36px; height:36px; border-radius:999px; color:#000; background: rgba(0,0,0,0.13); }
/* Material: an overflowing volume (stands in for a 3D object) */
.volume { position:absolute; border-radius:999px; pointer-events:none;
  background: radial-gradient(circle at 32% 28%, rgba(255,255,255,0.85), rgba(255,255,255,0.28) 42%, rgba(0,0,0,0.16) 78%); }
/* Dock + tooltip */
.dock { background: var(--surface-c); border:1px solid var(--surface-br); box-shadow: var(--sh); }
.dock-btn { transition: background .25s var(--ease), color .25s var(--ease), transform .25s var(--ease); }
.dock-btn:hover { background: var(--chip); color: var(--hot); transform: translateY(-2px); }
.tip { position:absolute; bottom: calc(100% + 10px); left:50%; transform: translateX(-50%) translateY(4px) scale(.96);
  padding:5px 10px; border-radius:999px; white-space:nowrap; font-size:12px; line-height:1; color:var(--ink);
  background: var(--surface-c); border:1px solid var(--surface-br); box-shadow: var(--sh);
  opacity:0; pointer-events:none; transition: opacity .2s var(--ease), transform .25s var(--ease); }
.dock-btn:hover .tip, .dock-btn:focus-visible .tip { opacity:1; transform: translateX(-50%) translateY(0) scale(1); }
/* ---------- MOTION ---------- */
@keyframes lab-rise { from{opacity:0; transform:translateY(16px);} to{opacity:1; transform:none;} }
.lab-in { opacity:0; animation: lab-rise .7s var(--ease) forwards; animation-delay: var(--d,0ms); }
@keyframes lab-draw { from{stroke-dashoffset:520;} to{stroke-dashoffset:0;} }
.lab-arc { animation: lab-draw 1.6s var(--ease) .5s both; }
@keyframes lab-sun-in { from{opacity:0; transform:scale(.4);} to{opacity:1; transform:scale(1);} }
.lab-sun { transform-box: fill-box; transform-origin:center; animation: lab-sun-in .8s var(--ease) 1.2s both; }
.eq { display:flex; align-items:flex-end; gap:2.5px; height:16px; }
.eq i { width:3px; border-radius:2px; background: var(--hot); height:40%; animation: lab-bars 1s ease-in-out infinite; }
.eq i:nth-child(2){animation-delay:.2s;} .eq i:nth-child(3){animation-delay:.45s;} .eq i:nth-child(4){animation-delay:.1s;}
@keyframes lab-bars { 0%,100%{height:25%;} 50%{height:100%;} }
@keyframes lab-fill { from{width:0;} to{width:var(--p);} }
.bar { width:var(--p); animation: lab-fill 1.4s var(--ease) .7s both; }
@media (prefers-reduced-motion: reduce){ .lab-in,.lab-arc,.lab-sun,.bar{ animation:none; opacity:1; } }
`;

// The sun's position on the day arc — shared by every surface that shows "the moment".
export const hm = (s: string) => { const [h, m] = s.split(":").map(Number); return h + m / 60; };
export const bez = (t: number, a: number, b: number, c: number) => { const u = 1 - t; return u * u * a + 2 * u * t * b + t * t * c; };
export function sunProgress(now: Date, sunrise: string, sunset: string) {
  const t = now.getHours() + now.getMinutes() / 60;
  return Math.min(1, Math.max(0, (t - hm(sunrise)) / (hm(sunset) - hm(sunrise))));
}
