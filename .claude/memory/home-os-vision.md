---
name: home-os-vision
description: The reframe — this mockup is exploring a "home OS", not a Home Assistant dashboard; its emotion and surfaces
metadata:
  type: project
---

Reframe stated 2026-07-15 (supersedes the narrow "dashboard" framing in [[dashboard-design-direction]],
which becomes the tactical layer under this).

**What it is now.** Started as a Lovable test over Home Assistant (technical house control), grew,
and Alex is now exploring a **unified "home OS"** — the software that carries *the emotion you want
in your home*, not a technical cockpit. Home Assistant = the past/plumbing; this is the layer above.

**Surfaces (one OS, adapted density — this is what makes it an OS, not 3 apps):**
- **Central console / admin** — the interface we're building now (this web app). Fluid, natural,
  intelligence-in-the-background ambience. Can dive deep into rich administration.
- **Small wall touchscreens** everywhere (e.g. Waveshare ESP32-S3 Touch LCD 4B) — glanceable.
- **TV / projection room** — custom media UI to play/watch films.
Same emotion across all three; density adapts per surface.

**Target emotion (from Alex's two Dribbble refs):** a **calm presence that knows.** Welcoming,
personal, not invasive. The AI is *felt*, not shown — via a slow living **aurora / pastel gradient**
(intelligence in the background) and floating **liquid-glass** layers (translucent, blurred, warm
cream/peach, Nordic-minimal decor, lots of empty space). Ref 1 (still): "Good morning, Amelia" +
aurora + one smart contextual card + conversational input. Ref 2 (video): liquid-glass cards
assembling in motion on a nacre backdrop. Stills saved in session scratchpad.

**Central design tension (named, and its resolution):** "admin console" (dense, technical) vs
"welcoming, less invasive" pull opposite ways. Resolution = **ambience on the surface,
administration in depth** — on arrival you get presence (greeting, aurora, the one thing that
deserves attention); you *descend* into density only when you choose to act. This is the same
attention-first model as [[dashboard-design-direction]].

**Compass (answered):** the feeling Alex wants, on every surface, is **"une ambiance de maison
chaleureuse et profondément humaine"** — warmth + the people first (not sensors). Arrival must be
*alive* (motion, like his video ref), and NOT hang on a rare event (a birthday isn't every day, and
on a birthday other things happen too) → the pillar is a permanent living "moment" (time, light, sun
arc) + a flux of what's happening now; a birthday is just one card in the flux.

**Design learning — glass needs contrast.** Translucent "liquid glass" cards on the near-white cream
background read as white-on-white: no depth, no material. To make glass exist you need contrast
BEHIND the cards — either (A) a much stronger, living warm aurora, or (B) darker/night zones (like
the dashboard's dark Bernard card). Open branch for Alex to pick (A lit & warm vs B dark & cinematic).

**Where we are (2026-07-15).** Ambience proof built at route `/lab` (isolated, real accueil
untouched), iterated to V2: living "moment" hero with animated sun arc + "en ce moment" flux
(music equalizer, Bernard, dishwasher bar) + glass module access, all entering in a cascade. All
its animation CSS is self-contained in `src/routes/lab.tsx`. Emotion + motion + focus-with-more-info
land well; **glass/depth still doesn't** (see design learning above).

**Branch resolved → voie B (dark).** Alex picked a new ref (Novo/weight-loss app: dark aubergine
bento, saturated violet tiles that pop, 3D product objects, editorial title with a colored emphasis
word, ↗ arrows). Its ADN is now the target *language*: **warm-dark background** (aubergine/brown,
NOT cold black), **saturated accent that pops** to give depth (the glass finally reads on dark),
**asymmetric rounded bento**, **3D/material objects**, **expressive editorial typography**.
Transposition nuance (mine, for the compass): keep it **warm** — accent toward amber/terracotta, not
the clinical medical mauve — so it stays "maison chaleureuse", not pharma. 3D objects = a later
asset chantier; evoke material via rich gradients/glows for now. Keep the V2 wins (sun arc, living
flux, motion).

**Working mode:** prototype in the live mockup; to show Alex MOTION, record a Playwright video →
mp4 and SendUserFile it (he's on tmux+ssh, can't see pasted images; live URL + sent files work).
See [[live-access-and-brief-workflow]].
