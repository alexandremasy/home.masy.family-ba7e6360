import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { perimeter } from "@/lib/mock-data";
import { ShieldCheck, ShieldAlert } from "lucide-react";

// Sécurité is a module of its own (like Budget): a layout + tabs in the TopNav.
// The verdict badge is shared by every tab, so it lives here.
export const Route = createFileRoute("/_app/securite")({
  component: SecuriteLayout,
  head: () => ({
    meta: [
      { title: "Sécurité — Maison" },
      {
        name: "description",
        content:
          "État de la maison : armement, présence, périmètre, activité, caméras et santé du système.",
      },
    ],
  }),
});

function SecuriteLayout() {
  const openPoints = perimeter.filter((p) => p.state !== "secure");
  const secure = openPoints.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sécurité"
        subtitle="L'état de la maison, en un coup d'œil"
        variant="page"
        trailing={
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs uppercase tracking-eyebrow ${
              secure ? "bg-success/15 text-success" : "bg-warm/15 text-warm"
            }`}
          >
            {secure ? (
              <ShieldCheck className="h-3.5 w-3.5" />
            ) : (
              <ShieldAlert className="h-3.5 w-3.5" />
            )}
            {secure ? "Sécurisée" : `${openPoints.length} à vérifier`}
          </span>
        }
      />
      <Outlet />
    </div>
  );
}
