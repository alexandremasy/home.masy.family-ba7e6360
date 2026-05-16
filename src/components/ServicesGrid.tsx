import type { ReactNode } from "react";

type Service = {
  name: string;
  desc: string;
  url: string;
  glyph: ReactNode;
  /** Brand-ish accent color, used as a soft background tint behind the glyph. */
  color: string;
};

/* -- Inline brand-ish glyphs (simplified, single-color, currentColor) -- */

const DockerGlyph = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M21.8 10.3c-.6-.4-1.9-.6-2.9-.4-.1-1-.7-1.9-1.5-2.6l-.3-.2-.2.3c-.5.7-.7 1.9-.6 2.7.1.6.3 1.2.7 1.7-.4.2-.9.4-1.4.5H1.7c-.4 0-.7.3-.7.7 0 1.5.2 3 .8 4.4 1 1.7 2.4 2.9 4.5 3.2 1.2.2 4.9.3 8.3-1.3 2.4-1.1 4.4-3.2 5.7-6.1l.1-.2c.6-.1 2-.7 2.5-2 .2-.4.2-.6.2-.6l-1.3-.1zM3.5 11h2.1c.1 0 .2-.1.2-.2v-2c0-.1-.1-.2-.2-.2H3.5c-.1 0-.2.1-.2.2v2c0 .1.1.2.2.2zm2.9 0h2.1c.1 0 .2-.1.2-.2v-2c0-.1-.1-.2-.2-.2H6.4c-.1 0-.2.1-.2.2v2c0 .1.1.2.2.2zm3 0h2.1c.1 0 .2-.1.2-.2v-2c0-.1-.1-.2-.2-.2H9.4c-.1 0-.2.1-.2.2v2c0 .1.1.2.2.2zm3 0h2c.1 0 .2-.1.2-.2v-2c0-.1-.1-.2-.2-.2h-2c-.1 0-.2.1-.2.2v2c0 .1.1.2.2.2zm-3-2.8h2.1c.1 0 .2-.1.2-.2v-2c0-.1-.1-.2-.2-.2H9.4c-.1 0-.2.1-.2.2v2c.1.2.1.2.2.2zm3 0h2c.1 0 .2-.1.2-.2v-2c0-.1-.1-.2-.2-.2h-2c-.1 0-.2.1-.2.2v2c0 .2.1.2.2.2zm0-2.8h2c.1 0 .2-.1.2-.2v-2c0-.1-.1-.2-.2-.2h-2c-.1 0-.2.1-.2.2v2c0 .1.1.2.2.2zm2.9 5.6H17c.1 0 .2-.1.2-.2v-2c0-.1-.1-.2-.2-.2h-2.1c-.1 0-.2.1-.2.2v2c0 .1.1.2.2.2z"/>
  </svg>
);

const GrafanaGlyph = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M23.1 10.6c0-.4-.1-.8-.1-1.3-.1-.5-.2-1-.4-1.5-.2-.5-.5-1.1-.8-1.6-.3-.5-.7-1-1.2-1.5.7-2.8-.9-5.3-.9-5.3-2.7-.2-4.4 1.1-5 1.5-.1 0-.2-.1-.3-.1l-.5-.2c-.2 0-.3-.1-.5-.1-.2 0-.3-.1-.5-.1-.6-2.4-2.8-3.4-2.8-3.4-2.5 1.6-3 3.8-3 3.8s0 .2-.1.5c-.1 0-.2.1-.3.1l-.4.2c-.1.1-.3.1-.4.2-.1.1-.3.1-.4.2-.1.1-.3.2-.4.3-.1.1-.3.2-.4.3-2.2-.7-4.1.3-4.1.3-.2 2.4 1 4 1.2 4.2-.1.1-.1.3-.2.4l-.2.5c0 .1-.1.3-.1.4 0 .1-.1.3-.1.4-.1.3-.2.6-.2.8-2 1-2.6 3.1-2.6 3.1 1.6 1.9 3.6 2 3.6 2 .3.4.5.7.8 1.1l.4.5c-1 2.8.2 5.1.2 5.1 3 .1 4.9-1.3 5.3-1.6.3.1.6.2.9.3.1 0 .2.1.4.1.1 0 .2.1.3.1.4.1.8.1 1.1.1.2 0 .4.1.5.1h.9c1.4 2.5 4.2 2.8 4.2 2.8 2-2.1 2.1-4.1 2.1-4.6v-.2-.2-.2c.4-.3.7-.6 1-.9l.4-.5.2-.2c2.8.8 4.7-1.1 4.7-1.1-.5-2.9-2.1-4.2-2.4-4.4l.1-.2c.1-.3.2-.5.3-.8 0-.1.1-.2.1-.3 0-.1.1-.3.1-.4 0-.1.1-.3.1-.4.1-.4.1-.7.1-1zM13 16.5c-2.5.4-4.9-1.2-5.4-3.7-.4-2.5 1.2-4.9 3.7-5.4 2.5-.4 4.9 1.2 5.4 3.7.5 2.6-1.2 5-3.7 5.4z"/>
  </svg>
);

const TeslaGlyph = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 5.4c2.3 0 5-.4 7.2-1.4-1.7 3.1-3.3 4-5.6 4.2L12 22 10.4 8.3C8.1 8 6.5 7.1 4.8 4c2.2 1 4.9 1.4 7.2 1.4M12 4C9.1 4 5.9 3.6 3.4 2c-.2 0-.3.2-.2.3.3.5 1 1.2 2.1 1.8C5.1 4 5 3.7 4.9 3.4c2.1.9 4.6 1.5 7.1 1.5s5-.6 7.1-1.5c-.1.3-.2.6-.3.7 1.1-.6 1.8-1.3 2.1-1.8.1-.1 0-.3-.2-.3C18.1 3.6 14.9 4 12 4z"/>
  </svg>
);

const HomeAssistantGlyph = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 3.2 3 11v10h6v-6h6v6h6V11l-9-7.8zM8.5 9.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
  </svg>
);

const PiHoleGlyph = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2C8.7 2 6 4.7 6 8c0 2.4 1.4 4.4 3.4 5.4-1.7.9-3 2.4-3.7 4.2-.4 1 .4 2.1 1.5 2.1h9.6c1.1 0 1.9-1.1 1.5-2.1-.7-1.8-2-3.3-3.7-4.2C16.6 12.4 18 10.4 18 8c0-3.3-2.7-6-6-6zm0 2a4 4 0 0 1 4 4c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4z"/>
  </svg>
);

const ProxmoxGlyph = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M3 5h8v6H3V5zm10 0h8v6h-8V5zM3 13h8v6H3v-6zm10 0h8v6h-8v-6z" opacity=".4"/>
    <path d="M5 7h4v2H5V7zm10 0h4v2h-4V7zM5 15h4v2H5v-2zm10 0h4v2h-4v-2z"/>
  </svg>
);

const SynologyGlyph = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M4 5h16a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm0 9h16a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1zm14-6.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0 9a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
  </svg>
);

const PlexGlyph = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M5 2h6l6 10-6 10H5l6-10L5 2z"/>
  </svg>
);

const TraefikGlyph = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2 3 7v10l9 5 9-5V7l-9-5zm0 2.3L18.6 8 12 11.7 5.4 8 12 4.3zM5 9.7l6 3.4v7L5 16.8V9.7zm14 0v7.1l-6 3.3v-7l6-3.4z"/>
  </svg>
);

const DnsGlyph = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.9 7H16c-.3-1.8-.9-3.4-1.7-4.5C16.6 5.3 18.2 7 18.9 9zM12 4c.9 0 2.1 1.9 2.6 5h-5.2C9.9 5.9 11.1 4 12 4zM4.3 13c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2H8c-.1.6-.1 1.3-.1 2s0 1.4.1 2H4.3zM5.1 15H8c.3 1.8.9 3.4 1.7 4.5C7.4 18.7 5.8 17 5.1 15zm2.9-6c.1-.7.1-1.4.1-2s0-1.3-.1-2H5.1C5.8 5 7.4 3.3 9.7 2.5 8.9 3.6 8.3 5.2 8 9zm4 11c-.9 0-2.1-1.9-2.6-5h5.2c-.5 3.1-1.7 5-2.6 5zm3-7H9c-.1-.6-.1-1.3-.1-2s0-1.4.1-2h6c.1.6.1 1.3.1 2s0 1.4-.1 2zm.3 6.5c.8-1.1 1.4-2.7 1.7-4.5h2.9c-.7 2-2.3 3.7-4.6 4.5zM16.1 13c.1-.6.1-1.3.1-2s0-1.4-.1-2H20c.2.6.3 1.3.3 2s-.1 1.4-.3 2h-3.9z"/>
  </svg>
);

const DatabaseGlyph = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <ellipse cx="12" cy="5" rx="8" ry="3"/>
    <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3V7c-1 1.4-4.3 2.5-8 2.5S5 8.4 4 7v5z" opacity=".7"/>
    <path d="M4 19c0 1.7 3.6 3 8 3s8-1.3 8-3v-5c-1 1.4-4.3 2.5-8 2.5S5 15.4 4 14v5z"/>
  </svg>
);

/* Placeholder list — swap with real services + URLs. */
const services: Service[] = [
  { name: "Portainer", desc: "Containers", url: "#", glyph: DockerGlyph,        color: "oklch(0.62 0.16 240)" },
  { name: "Grafana",   desc: "Monitoring", url: "#", glyph: GrafanaGlyph,       color: "oklch(0.7  0.18 50)"  },
  { name: "Home Assistant", desc: "Automatisation", url: "#", glyph: HomeAssistantGlyph, color: "oklch(0.7 0.15 220)" },
  { name: "Pi-hole",   desc: "DNS · ads",  url: "#", glyph: PiHoleGlyph,        color: "oklch(0.6  0.2  25)"  },
  { name: "Proxmox",   desc: "Hyperviseur",url: "#", glyph: ProxmoxGlyph,       color: "oklch(0.68 0.17 35)"  },
  { name: "Synology",  desc: "NAS",        url: "#", glyph: SynologyGlyph,      color: "oklch(0.65 0.13 180)" },
  { name: "Plex",      desc: "Médias",     url: "#", glyph: PlexGlyph,          color: "oklch(0.78 0.17 85)"  },
  { name: "Traefik",   desc: "Reverse proxy", url: "#", glyph: TraefikGlyph,    color: "oklch(0.65 0.15 250)" },
  { name: "Tesla API", desc: "Bernard",    url: "#", glyph: TeslaGlyph,         color: "oklch(0.55 0.2  25)"  },
  { name: "AdGuard DNS", desc: "Résolveur",url: "#", glyph: DnsGlyph,           color: "oklch(0.6  0.15 145)" },
  { name: "PostgreSQL",desc: "Base de données",url:"#",glyph: DatabaseGlyph,    color: "oklch(0.55 0.13 240)" },
];

export function ServicesGrid() {
  return (
    <section className="pt-2">
      <div className="mb-3 flex items-baseline justify-between px-1">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Services</p>
        <span className="text-[11px] text-muted-foreground/60">{services.length}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {services.map((s) => (
          <a
            key={s.name}
            href={s.url}
            target="_blank"
            rel="noreferrer"
            title={s.desc}
            className="group inline-flex items-center gap-2 rounded-full border border-border/40 bg-card/40 py-1 pl-1 pr-3 text-sm text-muted-foreground transition-colors hover:border-border hover:bg-card hover:text-foreground"
          >
            <span
              className="grid h-5 w-5 shrink-0 place-items-center rounded-full transition-colors"
              style={{
                background: `color-mix(in oklab, ${s.color} 16%, transparent)`,
                color: s.color,
              }}
              aria-hidden
            >
              <span className="block h-3 w-3">{s.glyph}</span>
            </span>
            <span className="truncate">{s.name}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
