import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";

const meta = {
  title: "UI/Dialog",
  component: Dialog,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="inverted">Nouveau repas</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un repas</DialogTitle>
          <DialogDescription>Renseignez le plat et le jour prevu.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <Label htmlFor="plat">Plat</Label>
          <Input id="plat" placeholder="Gratin de courgettes" />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <Button variant="inverted">Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
