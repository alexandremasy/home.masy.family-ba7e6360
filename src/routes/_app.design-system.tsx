import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
        <p className="truncate font-mono text-3xs text-muted-foreground">{value || "—"}</p>
        {note && <p className="mt-0.5 text-2xs text-muted-foreground">{note}</p>}
      </div>
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
  const [seg, setSeg] = useState("complet");
  const dish = dishes[5] ?? dishes[0];

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="Design system"
        subtitle="Les tokens et les composants réellement utilisés. Rendus en direct — cette page ne peut pas mentir."
        variant="page"
      />

      {/* ── TOKENS ── */}
      <Section title="Couleurs">
        <p className="mb-5 text-sm text-muted-foreground">
          Les valeurs sont lues sur <code className="font-mono text-xs">document.documentElement</code> —
          bascule le thème, elles suivent. Le navigateur normalise en{" "}
          <code className="font-mono text-xs">lab()</code> l'
          <code className="font-mono text-xs">oklch()</code> écrit dans{" "}
          <code className="font-mono text-xs">styles.css</code> : c'est la valeur calculée, pas la source.
        </p>

        <div className="space-y-6">
          <div>
            <Eyebrow size="xs" className="mb-3">Sémantique — le sens avant la teinte</Eyebrow>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Swatch token="primary" note="Signal positif : aujourd'hui, liens, actif" />
              <Swatch token="warm" note="ALERTE. Rien d'autre." />
              <Swatch token="mustard" note="Décoratif + séries de données" />
              <Swatch token="success" note="Réussi, nominal" />
              <Swatch token="destructive" note="Destructif, erreur" />
              <Swatch token="accent" note="shadcn : surface de survol/focus. Neutre." />
            </div>
          </div>

          <div>
            <Eyebrow size="xs" className="mb-3">Surfaces</Eyebrow>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Swatch token="background" />
              <Swatch token="card" />
              <Swatch token="popover" />
              <Swatch token="surface" />
              <Swatch token="secondary" />
              <Swatch token="muted" />
            </div>
          </div>

          <div>
            <Eyebrow size="xs" className="mb-3">Texte & traits</Eyebrow>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Swatch token="foreground" />
              <Swatch token="muted-foreground" />
              <Swatch token="border" />
              <Swatch token="input" />
              <Swatch token="ring" note="Anneau de focus" />
            </div>
          </div>
        </div>

        <Panel padding="sm" className="mt-6 border-warm/40 bg-warm/5">
          <Eyebrow size="xs" tone="current" className="text-warm">Le piège</Eyebrow>
          <p className="mt-1.5 text-sm">
            Les tokens <code className="font-mono text-xs">-foreground</code> ne marchent que sur
            leur propre aplat plein. <code className="font-mono text-xs">--accent-foreground</code> est
            bleu nuit dans les <b>deux</b> thèmes ; <code className="font-mono text-xs">--warm-foreground</code> s'
            <b>inverse</b>. Pour du texte : <code className="font-mono text-xs">text-warm</code>,{" "}
            <code className="font-mono text-xs">text-mustard</code>.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-md bg-warm px-2.5 py-1 text-xs text-warm-foreground">bg-warm + text-warm-foreground ✓</span>
            <span className="rounded-md bg-mustard px-2.5 py-1 text-xs text-mustard-foreground">bg-mustard + text-mustard-foreground ✓</span>
            <span className="rounded-md bg-warm/15 px-2.5 py-1 text-xs text-warm">bg-warm/15 + text-warm ✓</span>
          </div>
        </Panel>
      </Section>

      {/* ── TYPO ── */}
      <Section title="Typographie">
        <p className="mb-4 text-sm text-muted-foreground">
          Barlow partout. <code className="font-mono text-xs">--font-serif</code> pointe dessus :
          changer la police d'affichage, c'est cette seule ligne.
        </p>
        <div className="space-y-3">
          <h1 className="font-serif text-4xl tracking-tight">Titre de page · text-4xl</h1>
          <h2 className="font-serif text-2xl tracking-tight">Titre de section · text-2xl</h2>
          <p className="font-semibold text-lg">Semibold · le nom d'un objet</p>
          <p className="text-sm">Corps · text-sm</p>
          <p className="text-sm text-muted-foreground">Corps atténué · text-sm text-muted-foreground</p>
          <div className="pt-2">
            <Eyebrow>Eyebrow · size sm (défaut)</Eyebrow>
            <Eyebrow size="xs">Eyebrow · size xs</Eyebrow>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Un seul tracking : 0.18em. Il y en avait sept.
            </p>
          </div>
        </div>
      </Section>

      {/* ── BUTTONS ── */}
      <Section title="Boutons">
        <Row label="Variants">
          <Button variant="inverted">Inverted</Button>
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </Row>
        <Row label="Tailles">
          <Button size="sm">sm</Button>
          <Button>default</Button>
          <Button size="lg">lg</Button>
          <Button size="icon" variant="outline"><Plus className="h-4 w-4" /></Button>
          <Button size="iconRound" variant="outline"><ChevronLeft className="h-4 w-4" /></Button>
          <Button size="iconRound" variant="outline"><ChevronRight className="h-4 w-4" /></Button>
        </Row>
        <Row label="États">
          <Button variant="inverted" disabled>Disabled</Button>
          <Button variant="outline" size="iconRound" disabled><ChevronRight className="h-4 w-4" /></Button>
          <CommandButton
            onCommand={() => toast.success("Commande passée")}
            commandLabel="Démo"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
          >
            CommandButton (pending/error)
          </CommandButton>
        </Row>
        <p className="pt-3 text-xs text-muted-foreground">
          <b>inverted</b> est l'action primaire de l'app — <code className="font-mono">bg-foreground</code>, pas
          le teal de <code className="font-mono">--primary</code>. <b>iconRound</b> existe parce que{" "}
          <code className="font-mono">size="icon"</code> est <code className="font-mono">rounded-md</code>.
        </p>
      </Section>

      {/* ── TAGS ── */}
      <Section title="Tags & pastilles">
        <Row label="Badge">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </Row>
        <Row label="StatusPill">
          <StatusPill tone="primary" icon={<Repeat className="h-3 w-3" />}>à écouler · 1 créneau</StatusPill>
          <StatusPill>déjà 2× sur la fenêtre</StatusPill>
          <StatusPill icon={<Repeat className="h-3 w-3" />} title="Icône seule, pour une case étroite" />
        </Row>
        <p className="pt-3 text-xs text-muted-foreground">
          <code className="font-mono">primary</code> pour ce sur quoi on agit,{" "}
          <code className="font-mono">muted</code> pour une annotation. Jamais <code className="font-mono">warm</code>.
        </p>
      </Section>

      {/* ── FORM ── */}
      <Section title="Formulaire">
        <Row label="Input">
          <div className="w-full max-w-xs space-y-1.5">
            <Label htmlFor="ds-input">Un champ</Label>
            <Input id="ds-input" placeholder="Tape ici…" />
          </div>
        </Row>
        <Row label="Textarea">
          <Textarea placeholder="Un texte plus long…" className="max-w-xs" />
        </Row>
        <Row label="Select">
          <Select defaultValue="chili">
            <SelectTrigger aria-label="Démo select" className="w-56"><SelectValue /></SelectTrigger>
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
            <Label htmlFor="ds-cb" className="font-normal">Cochée</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked="indeterminate" aria-label="Indéterminée" />
            <span className="text-sm text-muted-foreground">Indéterminée</span>
          </div>
        </Row>
        <Row label="Switch">
          <Switch defaultChecked aria-label="Démo switch" />
          <Switch aria-label="Démo switch éteint" />
        </Row>
        <Row label="Slider">
          <Slider defaultValue={[50]} max={100} step={1} className="max-w-xs" aria-label="Démo slider" />
        </Row>
        <Row label="ToggleGroup">
          <ToggleGroup
            type="single" value={seg} onValueChange={(v) => v && setSeg(v)}
            aria-label="Densité" className="inline-flex justify-start gap-0 rounded-lg bg-secondary/70 p-1"
          >
            {["complet", "léger"].map((v) => (
              <ToggleGroupItem
                key={v} value={v}
                className="h-auto rounded-md px-3 py-1 text-sm font-normal capitalize text-muted-foreground hover:bg-transparent hover:text-foreground data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow"
              >{v}</ToggleGroupItem>
            ))}
          </ToggleGroup>
          <span className="text-xs text-muted-foreground">flèches + Entrée</span>
        </Row>
        <Row label="Tabs">
          <Tabs defaultValue="a">
            <TabsList className="h-10 bg-secondary/70 p-1">
              <TabsTrigger value="a" className="px-4">Planification</TabsTrigger>
              <TabsTrigger value="b" className="px-4">Plats</TabsTrigger>
              <TabsTrigger value="c" className="px-4">Courses</TabsTrigger>
            </TabsList>
          </Tabs>
        </Row>
      </Section>

      {/* ── CONTAINERS ── */}
      <Section title="Conteneurs">
        <p className="mb-4 text-sm text-muted-foreground">
          <code className="font-mono text-xs">Section</code> est un{" "}
          <code className="font-mono text-xs">Panel</code> avec une ligne de titre — pas une deuxième boîte.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Panel padding="sm"><Eyebrow size="xs">Panel</Eyebrow><p className="mt-1 text-sm">padding sm</p></Panel>
          <Panel><Eyebrow size="xs">Panel</Eyebrow><p className="mt-1 text-sm">padding md (défaut)</p></Panel>
          <Panel padding="lg"><Eyebrow size="xs">Panel</Eyebrow><p className="mt-1 text-sm">padding lg</p></Panel>
        </div>
        <Eyebrow size="xs" className="mb-3 mt-6">Tile — les tones du bento</Eyebrow>
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
      <Section title="Composants métier">
        <Row label="DishCard">
          <div className="w-full max-w-sm rounded-xl border border-border/60 bg-card p-3">
            <DishCard dish={dish} status={<StatusPill tone="primary" icon={<Repeat className="h-3 w-3" />}>à écouler · 1 créneau</StatusPill>} />
          </div>
          <div className="w-40 rounded-lg bg-secondary/50 p-2">
            <DishCard dish={dish} variant="compact" status={<StatusPill icon={<Repeat className="h-3 w-3" />} title="batch" />} />
          </div>
        </Row>
        <Row label="BudgetBar">
          <div className="w-full max-w-md space-y-3">
            <div><p className="text-xs text-muted-foreground">60 % dépensé</p><BudgetBar value={60} /></div>
            <div><p className="text-xs text-muted-foreground">réel 40 % · prévu 80 %</p><BudgetBar value={40} projected={80} /></div>
            <div><p className="text-xs text-muted-foreground">dépassement — le seul warm légitime ici</p><BudgetBar value={100} overflow={18} /></div>
          </div>
        </Row>
        <Row label="WeatherIcon">
          {(["sun", "partly", "cloud", "rain", "storm", "snow", "fog"] as const).map((c) => (
            <span key={c} className="flex flex-col items-center gap-1 text-muted-foreground">
              <WeatherIcon cond={c} className="h-5 w-5" />
              <span className="text-3xs">{c}</span>
            </span>
          ))}
        </Row>
      </Section>

      {/* ── OVERLAYS ── */}
      <Section title="Surcouches">
        <Row label="Dialog">
          <Dialog>
            <DialogTrigger asChild><Button variant="outline">Ouvrir un Dialog</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-serif text-xl">Un Dialog</DialogTitle></DialogHeader>
              <p className="text-sm text-muted-foreground">Centré, piège le focus, Escape ferme.</p>
            </DialogContent>
          </Dialog>
        </Row>
        <Row label="Drawer">
          <Drawer>
            <DrawerTrigger asChild><Button variant="outline">Ouvrir un Drawer</Button></DrawerTrigger>
            <DrawerContent className="bg-background px-4 pb-6">
              <DrawerHeader className="px-0 text-left"><DrawerTitle className="font-serif text-xl">Un Drawer</DrawerTitle></DrawerHeader>
              <p className="text-sm text-muted-foreground">Depuis le bas, drag-to-dismiss. C'est la modale repas sur mobile.</p>
            </DrawerContent>
          </Drawer>
        </Row>
        <Row label="AlertDialog">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="gap-1.5 text-destructive hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />Supprimer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer ?</AlertDialogTitle>
                <AlertDialogDescription>Une confirmation dit ce qu'on perd, pas « êtes-vous sûr ».</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Supprimer</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Row>
        <Row label="DropdownMenu">
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline">Ouvrir un menu</Button></DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>Premier</DropdownMenuItem>
              <DropdownMenuItem>Deuxième</DropdownMenuItem>
              <DropdownMenuItem>Troisième</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="text-xs text-muted-foreground">survol au clavier = neutre, plus moutarde</span>
        </Row>
        <Row label="Tooltip">
          <Tooltip>
            <TooltipTrigger asChild><Button variant="outline" size="iconRound"><Repeat className="h-4 w-4" /></Button></TooltipTrigger>
            <TooltipContent>Une tooltip</TooltipContent>
          </Tooltip>
        </Row>
        <Row label="Toast">
          <Button variant="outline" onClick={() => toast.success("Enregistré")}>Succès</Button>
          <Button variant="outline" onClick={() => toast.error("Échec", { description: "Réessaie dans un instant." })}>Erreur</Button>
        </Row>
      </Section>

      {/* ── TABLE ── */}
      <Section title="Table">
        <div className="overflow-hidden rounded-xl border border-border/60">
          <Table>
            <TableHeader>
              <TableRow className="text-left text-2xs uppercase tracking-eyebrow text-muted-foreground hover:bg-transparent">
                <TableHead className="px-3 py-3">Plat</TableHead>
                <TableHead className="px-3 py-3">Base</TableHead>
                <TableHead className="px-3 py-3 text-right">Rendement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dishes.slice(0, 3).map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="px-3 py-2.5 font-medium">{d.name}</TableCell>
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
          Il manque un composant ? <b>Cherche dans <code className="font-mono">src/components/ui/</code> d'abord</b> —
          19 primitives, toutes vivantes. Il existe mais ne colle pas à la palette ? <b>Édite <code className="font-mono">ui/*</code></b>,
          on possède le code. C'est vraiment le vocabulaire de l'app ? Construis-le <b>une fois</b> dans{" "}
          <code className="font-mono">components/</code>. Jamais de quatrième voie. Voir{" "}
          <code className="font-mono">DESIGN-SYSTEM.md</code>.
        </p>
      </Panel>
    </div>
  );
}
