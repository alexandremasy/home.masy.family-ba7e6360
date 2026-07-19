import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Cog, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Button } from "./button";

const meta = {
  title: "UI/DropdownMenu",
  component: DropdownMenu,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User />
          Profil
          <DropdownMenuShortcut>⇧P</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Cog />
          Reglages
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut />
          Deconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithCheckboxItems: Story = {
  render: () => {
    const [showRepas, setShowRepas] = useState(true);
    const [showCourses, setShowCourses] = useState(false);
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Filtres</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Affichage</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked={showRepas} onCheckedChange={setShowRepas}>
            Repas
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={showCourses} onCheckedChange={setShowCourses}>
            Courses
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};
