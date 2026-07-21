import { Camera as CamIcon, Moon, WifiOff, Bell } from "lucide-react";
import type { Camera, CameraScene } from "@/lib/mock-data";
import { Eyebrow } from "@/components/eyebrow";

/**
 * A stylized "live" thumbnail — pure CSS/SVG. Not an actual video feed;
 * meant to communicate camera state at a glance.
 */
function SceneArt({ scene, night }: { scene: CameraScene; night: boolean }) {
  // Night-vision: green monochrome. Day: warm/cool gradient per scene.
  const bg = night
    ? "linear-gradient(180deg, oklch(0.22 0.08 145) 0%, oklch(0.15 0.06 145) 100%)"
    : {
        front:
          "linear-gradient(180deg, oklch(0.55 0.06 240) 0%, oklch(0.72 0.05 60) 55%, oklch(0.35 0.03 40) 100%)",
        driveway:
          "linear-gradient(180deg, oklch(0.62 0.08 250) 0%, oklch(0.55 0.04 230) 50%, oklch(0.30 0.02 230) 100%)",
        garden:
          "linear-gradient(180deg, oklch(0.78 0.10 210) 0%, oklch(0.72 0.14 140) 55%, oklch(0.38 0.08 140) 100%)",
        backyard: "linear-gradient(180deg, oklch(0.45 0.05 260) 0%, oklch(0.30 0.04 250) 100%)",
        living: "linear-gradient(180deg, oklch(0.35 0.02 60) 0%, oklch(0.55 0.06 60) 100%)",
        utility: "linear-gradient(180deg, oklch(0.42 0.02 230) 0%, oklch(0.30 0.02 230) 100%)",
      }[scene];

  const stroke = night ? "oklch(0.85 0.14 145)" : "rgba(255,255,255,0.55)";
  const fill = night ? "oklch(0.30 0.10 145)" : "rgba(0,0,0,0.30)";

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: bg }}>
      <svg
        viewBox="0 0 200 120"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {scene === "front" && (
          <>
            <rect
              x="60"
              y="35"
              width="80"
              height="70"
              fill={fill}
              stroke={stroke}
              strokeWidth="0.8"
            />
            <rect x="92" y="55" width="16" height="50" fill={stroke} opacity="0.35" />
            <circle cx="103" cy="80" r="1.2" fill={stroke} />
            <path d="M 0 105 L 200 105" stroke={stroke} strokeWidth="0.6" opacity="0.6" />
          </>
        )}
        {scene === "driveway" && (
          <>
            <path d="M 0 120 L 80 60 L 120 60 L 200 120 Z" fill={fill} opacity="0.5" />
            <rect x="70" y="65" width="60" height="28" rx="6" fill={stroke} opacity="0.75" />
            <rect x="78" y="70" width="44" height="10" rx="2" fill={fill} opacity="0.7" />
            <circle cx="82" cy="94" r="4" fill={fill} />
            <circle cx="118" cy="94" r="4" fill={fill} />
          </>
        )}
        {scene === "garden" && (
          <>
            <path
              d="M 0 90 Q 50 70 100 90 T 200 90 L 200 120 L 0 120 Z"
              fill={fill}
              opacity="0.5"
            />
            <circle cx="40" cy="80" r="14" fill={stroke} opacity="0.35" />
            <rect x="38" y="80" width="4" height="18" fill={stroke} opacity="0.5" />
            <circle cx="160" cy="72" r="18" fill={stroke} opacity="0.3" />
            <rect x="158" y="72" width="4" height="24" fill={stroke} opacity="0.5" />
          </>
        )}
        {scene === "backyard" && (
          <>
            <rect x="0" y="70" width="200" height="50" fill={fill} opacity="0.5" />
            <path d="M 20 70 L 60 40 L 100 70 Z" fill={stroke} opacity="0.35" />
            <rect x="120" y="55" width="60" height="35" fill={stroke} opacity="0.25" />
            <rect x="132" y="65" width="10" height="12" fill={fill} />
            <rect x="155" y="65" width="10" height="12" fill={fill} />
          </>
        )}
        {scene === "living" && (
          <>
            <rect x="20" y="60" width="90" height="45" rx="8" fill={fill} opacity="0.55" />
            <rect x="120" y="45" width="60" height="35" fill={stroke} opacity="0.35" />
            <rect x="125" y="50" width="50" height="25" fill={fill} opacity="0.6" />
            <rect x="0" y="105" width="200" height="15" fill={fill} opacity="0.4" />
          </>
        )}
        {scene === "utility" && (
          <>
            <rect x="30" y="50" width="55" height="60" fill={fill} opacity="0.6" />
            <circle cx="57" cy="80" r="18" fill={stroke} opacity="0.35" />
            <circle cx="57" cy="80" r="10" fill={fill} opacity="0.7" />
            <rect x="105" y="50" width="55" height="60" fill={fill} opacity="0.6" />
            <circle cx="132" cy="80" r="18" fill={stroke} opacity="0.35" />
          </>
        )}
      </svg>
      {/* Scan lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0 1px, transparent 1px 3px)",
        }}
      />
      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.35) 100%)",
        }}
      />
    </div>
  );
}

interface CameraFeedProps {
  /** The camera to picture — its scene, state and night mode drive the whole render. */
  camera: Camera;
  /** Thumbnail size. `sm` drops the overlay text, which no longer fits. */
  size?: "sm" | "md" | "lg";
  /** The overlay furniture: name, state pill, night badge. Off for a bare thumbnail. */
  showChrome?: boolean;
}

export function CameraFeed({ camera, size = "md", showChrome = true }: CameraFeedProps) {
  const notInstalled = !camera.installed;
  const offline = camera.state === "offline";

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border/40 bg-foreground/95">
      {notInstalled ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-secondary text-muted-foreground">
          <Bell className="h-6 w-6 opacity-60" />
          <Eyebrow tone="current" as="span">
            Bientôt installée
          </Eyebrow>
        </div>
      ) : offline ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-foreground/80 text-background/60">
          <WifiOff className="h-6 w-6" />
          <Eyebrow tone="current" as="span">
            Hors-ligne
          </Eyebrow>
        </div>
      ) : (
        <>
          <SceneArt scene={camera.scene} night={camera.night} />

          {showChrome && (
            <>
              {/* Bottom-left: badges */}
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-2 text-2xs uppercase tracking-eyebrow text-white/90">
                <span className="inline-flex items-center gap-1 rounded bg-black/40 px-1.5 py-0.5 backdrop-blur-sm">
                  <CamIcon className="h-3 w-3" />
                  {camera.name}
                </span>
                {camera.night && (
                  <span className="inline-flex items-center gap-1 rounded bg-black/40 px-1.5 py-0.5 text-emerald-300 backdrop-blur-sm">
                    <Moon className="h-3 w-3" />
                    IR
                  </span>
                )}
              </div>

              {camera.motion && (
                <div className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-red-500/60 rounded-xl anim-breathe" />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
