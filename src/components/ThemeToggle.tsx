import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ThemeToggle({
  asSidebarItem = false,
  asSegmented = false,
}: {
  asSidebarItem?: boolean;
  asSegmented?: boolean;
}) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored ? stored === "dark" : prefers;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const apply = (next: boolean) => {
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const toggle = () => apply(!dark);
  const label = dark ? "Thème clair" : "Thème sombre";

  if (asSegmented) {
    return (
      <Tabs value={dark ? "dark" : "light"} onValueChange={(v) => apply(v === "dark")}>
        <TabsList className="w-full">
          <TabsTrigger value="light" className="flex-1 gap-1.5">
            <Sun className="h-3.5 w-3.5" />
            Clair
          </TabsTrigger>
          <TabsTrigger value="dark" className="flex-1 gap-1.5">
            <Moon className="h-3.5 w-3.5" />
            Sombre
          </TabsTrigger>
        </TabsList>
      </Tabs>
    );
  }

  if (asSidebarItem) {
    return (
      <SidebarMenuButton onClick={toggle} tooltip={label}>
        {dark ? <Sun /> : <Moon />}
        <span>{label}</span>
      </SidebarMenuButton>
    );
  }

  return (
    <Button variant="outline" size="iconRound" onClick={toggle} aria-label="Toggle theme">
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
