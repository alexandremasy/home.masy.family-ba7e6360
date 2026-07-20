import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "./sheet";
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
  args: { side: "right" },
  render: (args) => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="inverted">Ouvrir le panneau</Button>
      </SheetTrigger>
      <SheetContent side={args.side} className="gap-4 p-6">
        <SheetHeader className="p-0">
          <SheetTitle>Modifier le profil</SheetTitle>
          <SheetDescription>Ajuste les infos, puis enregistre.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="sheet-name">Nom</Label>
            <Input id="sheet-name" defaultValue="Alex" />
          </div>
        </div>
        <SheetFooter className="p-0">
          <SheetClose asChild>
            <Button variant="inverted">Enregistrer</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};
