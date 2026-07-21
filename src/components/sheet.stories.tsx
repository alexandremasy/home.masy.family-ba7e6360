import type { Meta, StoryObj } from "@storybook/react-vite";
import { UserRound } from "lucide-react";
import { Sheet, SheetActions, SheetClose, SheetContent, SheetTrigger } from "./sheet";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";

// Slide-over panel (Radix Dialog under the hood). `side` picks the edge it enters from.
const meta = {
  title: "Overlays/Sheet",
  component: SheetContent,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: { side: { control: "inline-radio", options: ["right", "left", "top", "bottom"] } },
} satisfies Meta<typeof SheetContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { side: "right", title: "Modifier le profil" },
  render: (args) => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="inverted">Ouvrir le panneau</Button>
      </SheetTrigger>
      <SheetContent
        side={args.side}
        icon={<UserRound className="h-4 w-4" />}
        title={args.title}
        subline="Ajuste les infos, puis enregistre."
        footer={
          <SheetActions>
            <SheetClose asChild>
              <Button variant="outline">Annuler</Button>
            </SheetClose>
            <Button variant="inverted">Enregistrer</Button>
          </SheetActions>
        }
      >
        <div className="grid gap-1.5">
          <Label htmlFor="sheet-name">Nom</Label>
          <Input id="sheet-name" defaultValue="Alex" />
        </div>
      </SheetContent>
    </Sheet>
  ),
};
