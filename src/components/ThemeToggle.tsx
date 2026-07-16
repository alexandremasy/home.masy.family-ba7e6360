import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarMenuButton } from "@/components/ui/sidebar";

export function ThemeToggle({ asSidebarItem = false }: { asSidebarItem?: boolean }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored ? stored === "dark" : prefers;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const label = dark ? "Thème clair" : "Thème sombre";

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
