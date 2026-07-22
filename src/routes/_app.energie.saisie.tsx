import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { EnergieSaisieTemplate } from "@/templates/energie-saisie";

export const Route = createFileRoute("/_app/energie/saisie")({
  component: SaisiePage,
  head: () => ({ meta: [{ title: "Saisie · Énergie — Maison" }] }),
});

/** The page is the template; this file only pretends to be a backend. */
function SaisiePage() {
  return (
    <EnergieSaisieTemplate
      doneTo="/energie"
      onSubmit={async () => {
        // No backend here — the wait is what makes the submitting state visible.
        await new Promise((r) => setTimeout(r, 900));
        toast.success("Relevé enregistré");
      }}
    />
  );
}
