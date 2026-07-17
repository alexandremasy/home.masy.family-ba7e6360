import { useState } from "react";
import { usePeople } from "@/lib/people-store";
import { useIsMobile } from "@/lib/use-media";
import { PersonForm, EMPTY_PERSON, type PersonDraft } from "@/components/PersonForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Person } from "@/lib/maison-data";
import { Trash2 } from "lucide-react";

export type PersonTarget = Person | "new" | null;

/**
 * Add / edit a person. Below md it's a bottom sheet (vaul Drawer, drag-to-dismiss);
 * at md and up it's the centred Dialog. Both share one body. Deleting still goes
 * through an AlertDialog.
 */
export function PersonDialog({ target, onOpenChange }: { target: PersonTarget; onOpenChange: (open: boolean) => void }) {
  const { create, update, remove } = usePeople();
  const [confirming, setConfirming] = useState(false);
  const isMobile = useIsMobile();

  const editing = target && target !== "new" ? target : null;
  const isNew = target === "new";
  const open = target !== null;
  const title = isNew ? "Nouvelle personne" : editing?.name;

  const initial: PersonDraft = editing
    ? {
        name: editing.name,
        relation: editing.relation,
        dob: editing.dob.slice(0, 10),
        langue: editing.langue,
        matiereLibre: editing.matiereLibre,
        defaultSliders: editing.defaultSliders,
      }
    : EMPTY_PERSON;

  const removeButton = editing && (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setConfirming(true)}
      className="shrink-0 gap-1.5 text-destructive hover:text-destructive"
    >
      <Trash2 className="h-3.5 w-3.5" />
      Retirer
    </Button>
  );

  const form = (
    <PersonForm
      key={editing?.id ?? "new"}
      initial={initial}
      submitLabel={isNew ? "Ajouter" : "Enregistrer"}
      onCancel={() => onOpenChange(false)}
      onSubmit={(d) => {
        if (isNew) create(d);
        else if (editing) update(editing.id, d);
        onOpenChange(false);
      }}
    />
  );

  const confirm = editing && (
    <AlertDialog open={confirming} onOpenChange={setConfirming}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Retirer {editing.name} ?</AlertDialogTitle>
          <AlertDialogDescription>
            La personne sort du calendrier des anniversaires et des suggestions.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              remove(editing.id);
              onOpenChange(false);
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Retirer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[92vh]">
          <DrawerHeader className="pb-2">
            <div className="flex items-start justify-between gap-3">
              <DrawerTitle className="font-serif text-xl">{title}</DrawerTitle>
              {removeButton}
            </div>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">{form}</div>
          {confirm}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <DialogTitle className="font-serif text-xl">{title}</DialogTitle>
            {removeButton}
          </div>
        </DialogHeader>
        {form}
        {confirm}
      </DialogContent>
    </Dialog>
  );
}
