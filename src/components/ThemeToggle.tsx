import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

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
    const seg =
      "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all";
    const on = "bg-card text-foreground shadow-soft";
    const off = "text-muted-foreground hover:text-foreground";
    return (
      <div className="flex w-full gap-1 rounded-full bg-secondary/70 p-1">
        <button type="button" onClick={() => apply(false)} className={cn(seg, dark ? off : on)}>
          <Sun className="h-3.5 w-3.5" />
          Clair
        </button>
        <button type="button" onClick={() => apply(true)} className={cn(seg, dark ? on : off)}>
          <Moon className="h-3.5 w-3.5" />
          Sombre
        </button>
      </div>
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
