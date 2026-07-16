import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Eyebrow } from "@/components/Eyebrow";
import { Panel, Section, Tile } from "@/components/Card";
import { BudgetBar } from "@/components/BudgetBar";
import { DishCard, StatusPill } from "@/components/DishCard";
import { WeatherIcon } from "@/components/WeatherIcon";
import { CommandButton } from "@/components/CommandButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { dishes } from "@/lib/maison-data";
import { ChevronLeft, ChevronRight, Repeat, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/_app/design-system")({
  component: DesignSystemPage,
  head: () => ({ meta: [{ title: "Design system — Cockpit" }] }),
});

/* ────────────────────────────────────────────────────────────── */

/**
 * A swatch that reads its own resolved value from the DOM rather than repeating
 * it — the page can't drift from styles.css, and it re-reads on theme switch.
 */
function Swatch({ token, note }: { token: string; note?: string }) {
  const [value, setValue] = useState("");

  useEffect(() => {
    const read = () => {
      const v = getComputedStyle(document.documentElement).getPropertyValue(`--${token}`).trim();
      setValue(v);
    };
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, [token]);

  return (
    <div className="flex items-center gap-3">
      <span
        className="h-11 w-11 shrink-0 rounded-lg border border-border/60 shadow-soft"
        style={{ background: `var(--${token})` }}
      />
      <div className="min-w-0">
        <p className="truncate font-mono text-xs text-foreground">--{token}</p>
        <p className="truncate font-mono text-2xs text-muted-foreground">{value || "—"}</p>
        {note && <p className="mt-0.5 text-xs text-muted-foreground">{note}</p>}
      </div>
    </div>
  );
}

/**
 * A type specimen that measures itself. Same contract as Swatch: the size is read
 * off the rendered node, never retyped here, so the page can't drift from the scale.
 */
function TypeRow({ cls, role, sample }: { cls: string; role: string; sample: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [metrics, setMetrics] = useState("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const s = getComputedStyle(el);
    const track = s.letterSpacing === "normal" ? "" : ` · ${s.letterSpacing}`;
    setMetrics(`${s.fontSize} / ${s.lineHeight}${track}`);
  }, [cls]);

  return (
    <div className="grid gap-1 border-b border-border/40 py-3 last:border-0 sm:grid-cols-[12rem_7rem_minmax(0,1fr)] sm:items-baseline sm:gap-4">
      <code className="font-mono text-xs text-foreground">{cls}</code>
      <span className="font-mono text-xs text-muted-foreground">{metrics || "—"}</span>
      <p ref={ref} className={cls}>
        {sample}
        <span className="ml-2 font-sans text-xs font-normal normal-case tracking-normal text-muted-foreground/70">
          {role}
        </span>
      </p>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 border-b border-border/40 py-4 last:border-0 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4">
      <Eyebrow size="xs" className="pt-1.5">{label}</Eyebrow>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */

function DesignSystemPage() {
  const [checked, setChecked] = useState(true);
  const [seg, setSeg] = useState("full");
  const dish = dishes[5] ?? dishes[0];

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="Design system"
        subtitle="The tokens and components actually in use, rendered live. This page cannot drift from the code."
        variant="page"
      />

      {/* ── TOKENS ── */}
      <Section title="Colour">
        <p className="mb-5 text-sm text-muted-foreground">
          The light theme is <b>ported from Figma</b> — <i>alexandremasy — tokens</i>, the "Colors"
          page — so each swatch below <b>is</b> a rung of one of the nine ramps. Values are read live
          off <code className="font-mono text-xs">document.documentElement</code>; flip the theme and
          they follow. <b>The dark theme is not from Figma</b> — the library has no dark ramp, so it
          stays as authored. That's the one place a colour here is still invented.
        </p>

        <div className="space-y-6">
          <div>
            <Eyebrow size="xs" className="mb-3">Semantics — meaning before hue</Eyebrow>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Swatch token="primary" note="Positive signal: today, links, active" />
              <Swatch token="warm" note="ALERT. Nothing else." />
              <Swatch token="mustard" note="Decorative + data series" />
              <Swatch token="success" note="Succeeded, nominal" />
              <Swatch token="destructive" note="Destructive, error" />
              <Swatch token="accent" note="shadcn's hover/focus surface. Neutral." />
            </div>
          </div>

          <div>
            <Eyebrow size="xs" className="mb-3">Surfaces</Eyebrow>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Swatch token="background" />
              <Swatch token="card" />
              <Swatch token="popover" />
              <Swatch token="secondary" />
              <Swatch token="muted" />
            </div>
          </div>

          <div>
            <Eyebrow size="xs" className="mb-3">Text & lines</Eyebrow>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Swatch token="foreground" />
              <Swatch token="muted-foreground" />
              <Swatch token="border" />
              <Swatch token="input" />
              <Swatch token="ring" note="Focus ring" />
            </div>
          </div>
        </div>

        <Panel padding="sm" className="mt-6 border-warm/40 bg-warm/5">
          <Eyebrow size="xs" tone="current" className="text-warm">The rule</Eyebrow>
          <p className="mt-1.5 text-sm">
            A <code className="font-mono text-xs">-foreground</code> token only works on its own solid
            fill. Since the port, every accent foreground is <b>Light/90</b> (dark) in both themes, so
            they no longer invert — they were chosen for contrast: warm 6.4:1, mustard 9.0:1, teal
            5.1:1. On a <i>tint</i> like <code className="font-mono text-xs">bg-warm/15</code> the fill
            is nearly the page, so use <code className="font-mono text-xs">text-warm</code> there, not
            the foreground.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-md bg-warm px-2.5 py-1 text-xs text-warm-foreground">bg-warm + text-warm-foreground ✓</span>
            <span className="rounded-md bg-mustard px-2.5 py-1 text-xs text-mustard-foreground">bg-mustard + text-mustard-foreground ✓</span>
            <span className="rounded-md bg-warm/15 px-2.5 py-1 text-xs text-warm">bg-warm/15 + text-warm ✓</span>
          </div>
        </Panel>
      </Section>

      {/* ── TYPE ── */}
      <Section title="Type">
        <p className="mb-5 text-sm text-muted-foreground">
          The scale is <b>ported from Figma</b> — <i>alexandremasy — tokens</i>, node 503-473 — which
          is the source of truth. Barlow, eleven steps, nothing else. Every size below is measured
          off its own rendered node, like the swatches above, so this page can't drift from{" "}
          <code className="font-mono text-xs">styles.css</code> and neither can drift from Figma
          without someone noticing here.
        </p>

        <div className="space-y-6">
          <div>
            <Eyebrow size="xs" className="mb-1">The scale — 10 · 12 · 14 · 16 · 20 · 24 · 28 · 32 · 40 · 48 · 56</Eyebrow>
            <p className="mb-3 text-xs text-muted-foreground">
              <code className="font-mono">styles.css</code> wipes Tailwind's own scale
              (<code className="font-mono">--text-*: initial</code>) before declaring these, so they are
              the only sizes that exist. <code className="font-mono">text-7xl</code> and{" "}
              <code className="font-mono">text-[13px]</code> aren't discouraged — they're unwritable.
            </p>
            <div>
              <TypeRow cls="text-6xl font-semibold" role="56 · display ceiling" sample="56" />
              <TypeRow cls="text-5xl font-semibold" role="48" sample="Forty eight" />
              <TypeRow cls="text-4xl font-semibold tracking-tight" role="40 · the big number" sample="21.4°" />
              <TypeRow cls="font-serif text-3xl tracking-tight" role="32 · page title" sample="Sixteen dishes" />
              <TypeRow cls="font-serif text-2xl tracking-tight" role="28" sample="Twenty eight" />
              <TypeRow cls="font-serif text-xl tracking-tight" role="24 · section title" sample="This week" />
              <TypeRow cls="text-lg font-semibold" role="20 · the name of a thing" sample="Chili sin carne" />
              <TypeRow cls="text-base" role="16 · body, roomy" sample="Reads at arm's length." />
              <TypeRow cls="text-sm" role="14 · body, the default" sample="Reads at arm's length." />
              <TypeRow cls="text-xs" role="12 · the body floor" sample="Metadata, figures, captions." />
              <TypeRow cls="text-2xs uppercase tracking-eyebrow" role="10 · the eyebrow, uppercase only" sample="Eyebrow" />
            </div>
          </div>

          <div>
            <Eyebrow size="xs" className="mb-1">Two things here are not from Figma</Eyebrow>
            <div className="grid gap-3 sm:grid-cols-2">
              <Panel padding="sm">
                <p className="font-mono text-xs text-foreground">line-height</p>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Figma sets <b>1.25 flat</b>. That's a display ratio: at 12px it gives 15px of
                  leading and a paragraph you can't read. These keep Tailwind's rhythm — generous
                  at body sizes, ~1 at display sizes. Deliberate divergence.
                </p>
              </Panel>
              <Panel padding="sm">
                <p className="font-mono text-xs text-foreground">tracking-eyebrow · 0.18em</p>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Figma sets letter-spacing <b>0</b> on every token. The eyebrow is a dashboard
                  pattern the reference doesn't cover, so the app just owns its spacing.
                </p>
              </Panel>
            </div>
          </div>

          <div>
            <Eyebrow size="xs" className="mb-3">Eyebrow — the component</Eyebrow>
            <div className="space-y-1">
              <Eyebrow>size sm (default) · text-xs</Eyebrow>
              <Eyebrow size="xs">size xs · text-2xs, for cramped boxes</Eyebrow>
              <Eyebrow tone="foreground">tone foreground · when the label carries meaning</Eyebrow>
            </div>
          </div>
        </div>

        <Panel padding="sm" className="mt-6 border-warm/40 bg-warm/5">
          <Eyebrow size="xs" tone="current" className="text-warm">The trap</Eyebrow>
          <p className="mt-1.5 text-sm">
            <b>The names are Tailwind's, the values are Figma's, and they disagree by one rung.</b>{" "}
            <code className="font-mono text-xs">text-xl</code> is <b>24px</b> here, not Tailwind's 20.
            Six rungs already coincided (12·14·16·20·24·48), which is why the app was mostly on this
            rhythm before the port. Read the value, not the name — or read this page.
          </p>
        </Panel>
      </Section>

      {/* ── BUTTONS ── */}
      <Section title="Buttons">
        <Row label="Variants">
          <Button variant="inverted">Inverted</Button>
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </Row>
        <Row label="Sizes">
          <Button size="sm">sm</Button>
          <Button>default</Button>
          <Button size="lg">lg</Button>
          <Button size="icon" variant="outline"><Plus className="h-4 w-4" /></Button>
          <Button size="iconRound" variant="outline"><ChevronLeft className="h-4 w-4" /></Button>
          <Button size="iconRound" variant="outline"><ChevronRight className="h-4 w-4" /></Button>
        </Row>
        <Row label="States">
          <Button variant="inverted" disabled>Disabled</Button>
          <Button variant="outline" size="iconRound" disabled><ChevronRight className="h-4 w-4" /></Button>
          <CommandButton
            onCommand={() => toast.success("Command sent")}
            commandLabel="Demo"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background"
          >
            CommandButton (pending/error)
          </CommandButton>
        </Row>
        <p className="pt-3 text-xs text-muted-foreground">
          <b>inverted</b> is this app's primary action — <code className="font-mono">bg-foreground</code>, not
          the teal of <code className="font-mono">--primary</code>. <b>iconRound</b> exists because{" "}
          <code className="font-mono">size="icon"</code> ships as <code className="font-mono">rounded-md</code>.
        </p>
      </Section>

      {/* ── TAGS ── */}
      <Section title="Tags & pills">
        <Row label="Badge">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </Row>
        <Row label="StatusPill">
          <StatusPill tone="primary" icon={<Repeat className="h-3 w-3" />}>acted on · 1 slot</StatusPill>
          <StatusPill>annotation only</StatusPill>
          <StatusPill icon={<Repeat className="h-3 w-3" />} title="Icon alone, for a narrow cell" />
        </Row>
        <p className="pt-3 text-xs text-muted-foreground">
          <code className="font-mono">primary</code> for what gets acted on,{" "}
          <code className="font-mono">muted</code> for an annotation. Never <code className="font-mono">warm</code>.
        </p>
      </Section>

      {/* ── FORM ── */}
      <Section title="Form">
        <Row label="Input">
          <div className="w-full max-w-xs space-y-1.5">
            <Label htmlFor="ds-input">A field</Label>
            <Input id="ds-input" placeholder="Type here…" />
          </div>
        </Row>
        <Row label="Textarea">
          <Textarea placeholder="Something longer…" className="max-w-xs" />
        </Row>
        <Row label="Select">
          <Select defaultValue="chili">
            <SelectTrigger aria-label="Select demo" className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="chili">Chili</SelectItem>
              <SelectItem value="curry">Curry</SelectItem>
              <SelectItem value="lasagne">Lasagne</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row label="Checkbox">
          <div className="flex items-center gap-2">
            <Checkbox id="ds-cb" checked={checked} onCheckedChange={(c) => setChecked(!!c)} />
            <Label htmlFor="ds-cb" className="font-normal">Checked</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked="indeterminate" aria-label="Indeterminate" />
            <span className="text-sm text-muted-foreground">Indeterminate</span>
          </div>
        </Row>
        <Row label="Switch">
          <Switch defaultChecked aria-label="Switch demo" />
          <Switch aria-label="Switch demo, off" />
        </Row>
        <Row label="Slider">
          <Slider defaultValue={[50]} max={100} step={1} className="max-w-xs" aria-label="Slider demo" />
        </Row>
        <Row label="ToggleGroup">
          <ToggleGroup
            type="single" value={seg} onValueChange={(v) => v && setSeg(v)}
            aria-label="Density" className="inline-flex justify-start gap-0 rounded-lg bg-secondary/70 p-1"
          >
            {["full", "light"].map((v) => (
              <ToggleGroupItem
                key={v} value={v}
                className="h-auto rounded-md px-3 py-1 text-sm font-normal capitalize text-muted-foreground hover:bg-transparent hover:text-foreground data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow"
              >{v}</ToggleGroupItem>
            ))}
          </ToggleGroup>
          <span className="text-xs text-muted-foreground">arrow keys + Enter</span>
        </Row>
        <Row label="Tabs">
          <Tabs defaultValue="a">
            <TabsList className="h-10 bg-secondary/70 p-1">
              <TabsTrigger value="a" className="px-4">Overview</TabsTrigger>
              <TabsTrigger value="b" className="px-4">Readings</TabsTrigger>
              <TabsTrigger value="c" className="px-4">Import</TabsTrigger>
            </TabsList>
          </Tabs>
        </Row>
      </Section>

      {/* ── CONTAINERS ── */}
      <Section title="Containers">
        <p className="mb-4 text-sm text-muted-foreground">
          <code className="font-mono text-xs">Section</code> is a{" "}
          <code className="font-mono text-xs">Panel</code> with a title line — not a second box.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Panel padding="sm"><Eyebrow size="xs">Panel</Eyebrow><p className="mt-1 text-sm">padding sm</p></Panel>
          <Panel><Eyebrow size="xs">Panel</Eyebrow><p className="mt-1 text-sm">padding md (default)</p></Panel>
          <Panel padding="lg"><Eyebrow size="xs">Panel</Eyebrow><p className="mt-1 text-sm">padding lg</p></Panel>
        </div>
        <Eyebrow size="xs" className="mb-3 mt-6">Tile — the bento tones</Eyebrow>
        <div className="grid-bento">
          {(["default", "primary", "mustard", "warm", "dark"] as const).map((t) => (
            <Tile key={t} span={1} tone={t}>
              <Eyebrow size="xs" tone="current" className="opacity-70">tone</Eyebrow>
              <p className="mt-1 font-semibold text-lg">{t}</p>
            </Tile>
          ))}
        </div>
      </Section>

      {/* ── DOMAIN ── */}
      <Section title="Domain components">
        <Row label="DishCard">
          <div className="w-full max-w-sm rounded-xl border border-border/60 bg-card p-3">
            <DishCard dish={dish} status={<StatusPill tone="primary" icon={<Repeat className="h-3 w-3" />}>1 slot left</StatusPill>} />
          </div>
          <div className="w-40 rounded-lg bg-secondary/50 p-2">
            <DishCard dish={dish} variant="compact" status={<StatusPill icon={<Repeat className="h-3 w-3" />} title="batch" />} />
          </div>
        </Row>
        <Row label="BudgetBar">
          <div className="w-full max-w-md space-y-3">
            <div><p className="text-xs text-muted-foreground">60% spent</p><BudgetBar value={60} /></div>
            <div><p className="text-xs text-muted-foreground">actual 40% · projected 80%</p><BudgetBar value={40} projected={80} /></div>
            <div><p className="text-xs text-muted-foreground">overrun — the only legitimate warm on this page</p><BudgetBar value={100} overflow={18} /></div>
          </div>
        </Row>
        <Row label="WeatherIcon">
          {(["sun", "partly", "cloud", "rain", "storm", "snow", "fog"] as const).map((c) => (
            <span key={c} className="flex flex-col items-center gap-1 text-muted-foreground">
              <WeatherIcon cond={c} className="h-5 w-5" />
              <span className="text-2xs">{c}</span>
            </span>
          ))}
        </Row>
      </Section>

      {/* ── OVERLAYS ── */}
      <Section title="Overlays">
        <Row label="Dialog">
          <Dialog>
            <DialogTrigger asChild><Button variant="outline">Open a Dialog</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-serif text-lg">A Dialog</DialogTitle></DialogHeader>
              <p className="text-sm text-muted-foreground">Centred, traps focus, Escape closes.</p>
            </DialogContent>
          </Dialog>
        </Row>
        <Row label="Drawer">
          <Drawer>
            <DrawerTrigger asChild><Button variant="outline">Open a Drawer</Button></DrawerTrigger>
            <DrawerContent className="bg-background px-4 pb-6">
              <DrawerHeader className="px-0 text-left"><DrawerTitle className="font-serif text-lg">A Drawer</DrawerTitle></DrawerHeader>
              <p className="text-sm text-muted-foreground">From the bottom, drag to dismiss. This is the meal picker on mobile.</p>
            </DrawerContent>
          </Drawer>
        </Row>
        <Row label="AlertDialog">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="gap-1.5 text-destructive hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete?</AlertDialogTitle>
                <AlertDialogDescription>A confirmation says what gets lost, not "are you sure".</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Row>
        <Row label="DropdownMenu">
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline">Open a menu</Button></DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>First</DropdownMenuItem>
              <DropdownMenuItem>Second</DropdownMenuItem>
              <DropdownMenuItem>Third</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="text-xs text-muted-foreground">keyboard highlight is neutral now, not mustard</span>
        </Row>
        <Row label="Tooltip">
          <Tooltip>
            <TooltipTrigger asChild><Button variant="outline" size="iconRound"><Repeat className="h-4 w-4" /></Button></TooltipTrigger>
            <TooltipContent>A tooltip</TooltipContent>
          </Tooltip>
        </Row>
        <Row label="Toast">
          <Button variant="outline" onClick={() => toast.success("Saved")}>Success</Button>
          <Button variant="outline" onClick={() => toast.error("Failed", { description: "Try again in a moment." })}>Error</Button>
        </Row>
      </Section>

      {/* ── TABLE ── */}
      <Section title="Table">
        <div className="overflow-hidden rounded-xl border border-border/60">
          <Table>
            <TableHeader>
              <TableRow className="text-left text-xs uppercase tracking-eyebrow text-muted-foreground hover:bg-transparent">
                <TableHead className="px-3 py-3">Dish</TableHead>
                <TableHead className="px-3 py-3">Base</TableHead>
                <TableHead className="px-3 py-3 text-right">Yield</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dishes.slice(0, 3).map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="px-3 py-2.5 font-semibold">{d.name}</TableCell>
                  <TableCell className="px-3 py-2.5 capitalize text-muted-foreground">{d.base}</TableCell>
                  <TableCell className="px-3 py-2.5 text-right tabular-nums">{d.rendement}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>

      <Panel padding="sm" className="border-dashed">
        <p className="text-xs text-muted-foreground">
          Missing a control? <b>Look in <code className="font-mono">src/components/ui/</code> first</b> —
          19 primitives, all of them live. It exists but fights the palette? <b>Edit{" "}
          <code className="font-mono">ui/*</code></b>, we own that code. It really is this app's own
          vocabulary? Build it <b>once</b> in <code className="font-mono">components/</code> and share it.
          Never a fourth path. See <code className="font-mono">DESIGN-SYSTEM.md</code>.
        </p>
      </Panel>
    </div>
  );
}
