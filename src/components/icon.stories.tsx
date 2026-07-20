import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bell,
  Cake,
  CalendarDays,
  Camera,
  Car,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Cog,
  Coins,
  Copy,
  Droplet,
  ExternalLink,
  Flame,
  Fuel,
  Inbox,
  Info,
  LayoutGrid,
  Lightbulb,
  ListChecks,
  Loader2,
  Lock,
  LogOut,
  Moon,
  MoreHorizontal,
  Package,
  Pencil,
  PiggyBank,
  Plus,
  Power,
  RefreshCw,
  Repeat,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  User,
  Utensils,
  UtensilsCrossed,
  Wifi,
  WifiOff,
  X,
  Zap,
} from "lucide-react";
import { Icon } from "@/components/icon";
import { Eyebrow } from "@/components/eyebrow";
import { LucideGallery } from "@/design-system/live-tokens";

/** The inventory, grouped by where each glyph appears in the product. */
const Domain = {
  energy: { Zap, Droplet, Flame, Fuel, Lightbulb, Power, Cog },
  weather: { Sun, Moon, Cloud, CloudSun, CloudRain, CloudSnow, CloudFog, CloudLightning },
  mobility: { Car, Wifi, WifiOff, ShieldCheck, ShieldAlert, Camera, Lock },
  food: { Utensils, UtensilsCrossed, ListChecks, Package, Repeat },
  budget: { Coins, PiggyBank, CalendarDays, Cake, User },
  nav: {
    LayoutGrid,
    ChevronRight,
    ChevronLeft,
    ChevronUp,
    ChevronDown,
    ArrowRight,
    ArrowLeft,
    MoreHorizontal,
    ExternalLink,
    LogOut,
  },
  actions: { Plus, Pencil, Trash2, Copy, Search, RefreshCw, X, Check },
  status: { Info, AlertCircle, AlertTriangle, Sparkles, Bell, Inbox, Loader2 },
} as const;

/**
 * # Icon
 *
 * Every icon in the app is a [lucide](https://lucide.dev) glyph. This component
 * exists for one reason: to own the size.
 *
 * Before it, each site sized its icon by hand — **275 usages across seven sizes**
 * (124 × `h-4`, 75 × `h-3.5`, 53 × `h-3`, 11 × `h-2.5`, 9 × `h-6`, 9 × `h-5`, and
 * 7 × `h-4.5`, the last one not even on the system's scale). Same story as
 * `Eyebrow`, which collapsed seven tracking values into one.
 *
 * The glyph is passed as a **component**, not a name — `<Icon as={Zap} />`. A
 * `name="zap"` registry would pull the whole icon set into the bundle and need a
 * mapping table to maintain.
 *
 * ## Accessibility
 *
 * An icon is hidden from screen readers by default, which is correct whenever a
 * label sits next to it. Pass `label` only when the icon carries the meaning alone.
 */
const meta = {
  title: "Iconography/Icon",
  component: Icon,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    as: { control: false },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
  },
  args: { as: Zap },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { size: "md" } };

/**
 * The inventory — every lucide glyph the product actually uses, grouped by where it
 * appears. Rendered by Storybook's own `IconGallery`; hover a tile for its import
 * name. Reach for one of these before importing a new glyph.
 */
export const Gallery: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="space-y-8">
      {(
        [
          ["Énergie & maison", Domain.energy],
          ["Météo", Domain.weather],
          ["Mobilité & sécurité", Domain.mobility],
          ["Repas & courses", Domain.food],
          ["Budget", Domain.budget],
          ["Navigation & chrome", Domain.nav],
          ["Actions", Domain.actions],
          ["États & retours", Domain.status],
        ] as const
      ).map(([label, icons]) => (
        <section key={label} className="space-y-2">
          <Eyebrow size="xs">{label}</Eyebrow>
          <LucideGallery icons={icons} />
        </section>
      ))}
    </div>
  ),
};

/** The five steps, from the cramped row to the feature glyph. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-end gap-6">
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Icon {...args} size={size} />
          <span className="text-2xs text-muted-foreground">{size}</span>
        </div>
      ))}
    </div>
  ),
};

/** Colour travels through `className`; the size never does. */
export const Colours: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <Icon {...args} as={Zap} className="text-primary" />
      <Icon {...args} as={Droplet} className="text-primary" />
      <Icon {...args} as={Flame} className="text-warm" />
      <Icon {...args} as={Lightbulb} className="text-mustard" />
      <Icon {...args} as={Wifi} className="text-success" />
      <Icon {...args} as={AlertTriangle} className="text-destructive" />
    </div>
  ),
};

/**
 * With `label`, the icon is announced as an image. Without it, it is hidden — use
 * that whenever the text beside it already says what it means.
 */
export const Labelled: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3 text-sm">
      <span className="flex items-center gap-2">
        <Icon {...args} as={Car} />
        Bernard — le texte porte le sens, l'icône est masquée
      </span>
      <Icon {...args} as={Car} label="Voiture au garage" size="lg" />
    </div>
  ),
};
