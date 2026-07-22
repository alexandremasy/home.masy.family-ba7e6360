import { createFileRoute } from "@tanstack/react-router";
import { Router, Shield, ShieldOff } from "lucide-react";
import { Reseau } from "@/templates/reseau";
import { reseau } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/securite/reseau")({
  component: ReseauPage,
  head: () => ({ meta: [{ title: "Réseau — Sécurité" }] }),
});

function ReseauPage() {
  return (
    <Reseau
      status="up"
      wifis={[
        { id: "private", ...reseau.wifi1 },
        { id: "family", ...reseau.wifi2 },
      ]}
      internet={{
        speedMbps: reseau.internet.speedMbps,
        latencyMs: reseau.internet.latencyMs,
        on: reseau.internet.on,
      }}
      links={[
        {
          href: "https://unifi.local",
          label: "UniFi",
          icon: <Router className="h-4 w-4 text-muted-foreground" />,
        },
        {
          href: "https://twingate.com",
          label: "Twingate",
          icon: <Shield className="h-4 w-4 text-muted-foreground" />,
        },
      ]}
      dns={{
        queries: reseau.pihole.queries24h,
        blocked: reseau.pihole.blocked24h,
        blockedPct: reseau.pihole.blockedPct,
        clients: reseau.pihole.clients,
        domainsOnList: reseau.pihole.domainsOnList,
      }}
      dnsLink={{
        href: reseau.pihole.url,
        label: "Pi-hole",
        icon: <ShieldOff className="h-4 w-4 text-muted-foreground" />,
      }}
      homelab={reseau.homelab}
      serviceGroups={reseau.serviceGroups.map((g) => ({
        key: g.key,
        label: g.label,
        services: g.services.map((s) => ({ name: s.name, url: s.url, ok: s.status === "ok" })),
      }))}
    />
  );
}
