"use client";

import { useState } from "react";
import { Layers } from "lucide-react";
import { Alert, AlertTitle, Badge, Button, ButtonGroup, Card, CardHeader, CardTitle, CardDescription, Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, FeatureCard, Input, Kbd, Message, MessageContent, PromptInput, Stack, StatCard, Tabs, TabsList, TabsTrigger, TabsContent } from "skyloom-ui";
import type { Example } from "./examples";

function SurfaceDemo() {
  return <Stack>{(["classic", "modern", "soft", "outline", "elevated"] as const).map(variant => <Card key={variant} variant={variant}><CardHeader><CardTitle className="capitalize">{variant}</CardTitle><CardDescription>One composition, a different surface.</CardDescription></CardHeader></Card>)}</Stack>;
}
function ActionDemo() {
  return <Stack><ButtonGroup aria-label="Action variants"><Button variant="classic">Classic</Button><Button variant="soft" shape="pill">Soft pill</Button><Button variant="success">Success</Button></ButtonGroup><Input variant="filled" aria-label="Filled input" placeholder="Filled input" /><Input variant="classic" aria-label="Classic input" placeholder="Classic input" /><p className="text-caption text-muted-foreground">A shortcut hint <Kbd>Shift</Kbd> + <Kbd>Enter</Kbd></p></Stack>;
}
function StatusDemo() {
  return <Stack><div className="flex flex-wrap gap-control"><Badge variant="info" shape="pill">Information</Badge><Badge variant="warning">Needs review</Badge><Badge variant="soft">Draft</Badge></div><Alert variant="info"><AlertTitle>Your export is being prepared.</AlertTitle></Alert><Alert variant="warning"><AlertTitle>Review the details before continuing.</AlertTitle></Alert></Stack>;
}
function FeatureDemo() {
  return <FeatureCard title="Thoughtful foundations" description="A lightweight feature tile for dashboards, product pages, and bento layouts." icon={<Layers aria-hidden="true" className="shrink-0 size-icon" />} action={<Button asChild variant="soft"><a href="#tokens">Explore tokens</a></Button>} />;
}
function StatDemo() {
  return <StatCard variant="classic" label="Completed requests" value="12,840" trend="Up 12% this week" tone="success" description="Sample data for the current workspace." />;
}
function DialogVariantsDemo() {
  return <ButtonGroup aria-label="Dialog variants">{(["classic", "modern"] as const).map(variant => <Dialog key={variant}><DialogTrigger asChild><Button variant="outline">Open {variant} dialog</Button></DialogTrigger><DialogContent variant={variant} size={variant === "classic" ? "sm" : "lg"}><DialogHeader><DialogTitle>{variant === "classic" ? "Classic details" : "Modern details"}</DialogTitle><DialogDescription>Shared keyboard behavior, theme-aware surfaces, and responsive sizing.</DialogDescription></DialogHeader><Input aria-label="Example title" defaultValue="A reusable dialog" /></DialogContent></Dialog>)}</ButtonGroup>;
}
function LineTabsDemo() {
  return <Tabs defaultValue="overview"><TabsList variant="line" aria-label="Line tabs"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="activity">Activity</TabsTrigger></TabsList><TabsContent value="overview">A quiet, underlined navigation style.</TabsContent><TabsContent value="activity">Arrow keys move between these views.</TabsContent></Tabs>;
}
function ChatDemo() {
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("Help me choose a theme.");
  return <Stack><Message from="user"><MessageContent>{message}</MessageContent></Message><Message from="assistant" variant="plain"><MessageContent>Try the palette and appearance controls above. This is a local preview; no model is connected.</MessageContent></Message><PromptInput aria-label="Chat preview" value={value} onValueChange={setValue} onSubmit={text => { setMessage(text); setValue(""); }} variant="modern" tools={<span className="text-caption text-muted-foreground">Shift + Enter for a new line</span>} /></Stack>;
}

export const variantExamples: Example[] = [
  { id: "surface-variants", name: "Surface variants", category: "Data display", description: "Classic, modern, soft, outline, and elevated cards.", imports: "Card, CardHeader, CardTitle", code: '<Card variant="classic"><CardHeader><CardTitle>Classic surface</CardTitle></CardHeader></Card>', Demo: SurfaceDemo, isNew: true },
  { id: "action-variants", name: "Action & field variants", category: "Inputs", description: "Reusable button groups, keyboard hints, and filled fields.", imports: "ButtonGroup, Button, Input, Kbd", code: '<ButtonGroup aria-label="Actions"><Button variant="classic">Save</Button><Button variant="soft" shape="pill">Preview</Button></ButtonGroup>\n<Input variant="filled" aria-label="Name" />\n<Kbd>Enter</Kbd>', Demo: ActionDemo, isNew: true },
  { id: "status-variants", name: "Status variants", category: "Feedback", description: "Information, warning, and soft semantic states.", imports: "Badge, Alert, AlertTitle", code: '<Badge variant="warning" shape="pill">Needs review</Badge>\n<Alert variant="info"><AlertTitle>Export started</AlertTitle></Alert>', Demo: StatusDemo, isNew: true },
  { id: "feature-card", name: "Feature Card", category: "Data display", description: "Compose feature tiles using the existing responsive grid.", imports: "FeatureCard, ResponsiveGrid", code: '<ResponsiveGrid>\n  <FeatureCard title="Simple" description="Lightweight components." />\n  <FeatureCard title="Flexible" description="Multiple palettes and appearances." />\n</ResponsiveGrid>', Demo: FeatureDemo, isNew: true },
  { id: "stat-card", name: "Stat Card", category: "Data display", description: "A reusable metric with description and explicit trend tone.", imports: "StatCard", code: '<StatCard label="Requests" value="12,840" trend="Up 12%" tone="success" variant="classic" />', Demo: StatDemo, isNew: true },
  { id: "dialog-variants", name: "Dialog variants", category: "Overlays", description: "Classic and modern dialogs with small and large sizes.", imports: "Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, Button", code: '<Dialog>\n  <DialogTrigger asChild><Button>Open</Button></DialogTrigger>\n  <DialogContent variant="classic" size="sm">\n    <DialogHeader><DialogTitle>Details</DialogTitle><DialogDescription>Review your details.</DialogDescription></DialogHeader>\n  </DialogContent>\n</Dialog>', Demo: DialogVariantsDemo, isNew: true },
  { id: "line-tabs", name: "Line Tabs", category: "Navigation", description: "An understated alternative to filled tab controls.", imports: "Tabs, TabsList, TabsTrigger, TabsContent", code: '<Tabs defaultValue="overview">\n  <TabsList variant="line" aria-label="Views"><TabsTrigger value="overview">Overview</TabsTrigger></TabsList>\n  <TabsContent value="overview">Content</TabsContent>\n</Tabs>', Demo: LineTabsDemo, isNew: true },
  { id: "chat-primitives", name: "Messages & Prompt Input", category: "Inputs", description: "Controlled, SDK-independent chat primitives. Enter sends; Shift + Enter adds a line.", imports: "PromptInput, Message, MessageContent", code: 'const [value, setValue] = useState("");\nconst [message, setMessage] = useState("Hello");\n<Message from="user"><MessageContent>{message}</MessageContent></Message>\n<PromptInput value={value} onValueChange={setValue}\n  onSubmit={text => { setMessage(text); setValue(""); }} />', Demo: ChatDemo, isNew: true },
];
