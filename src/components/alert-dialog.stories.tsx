import type { Meta, StoryObj } from "@storybook/react-vite";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogActions,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTrigger,
} from "./alert-dialog";
import { Button } from "./button";

const meta = {
  title: "Overlays/Alert Dialog",
  component: AlertDialog,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Supprimer le repas</Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        icon={<Trash2 className="h-4 w-4" />}
        tone="destructive"
        title="Confirmer la suppression"
        footer={
          <AlertDialogActions>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction>Supprimer</AlertDialogAction>
          </AlertDialogActions>
        }
      >
        Cette action est irréversible. Le repas sera retiré du planning.
      </AlertDialogContent>
    </AlertDialog>
  ),
};
