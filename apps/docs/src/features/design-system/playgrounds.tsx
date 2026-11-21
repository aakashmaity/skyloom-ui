"use client";

import type { Example } from "./examples";
import type { PlaygroundDefinition } from "./playground-model";
import { inputPlaygrounds } from "./playground-inputs";
import { surfacePlaygrounds } from "./playground-surfaces";
import { dataPlaygrounds } from "./playground-data";
import { expansionPlaygrounds } from "./expansion-playgrounds";
import { titleCase } from "./playground-model";
import { advancedPlaygrounds } from "./advanced-playgrounds";

export const playgrounds: Record<string, PlaygroundDefinition> = {
  ...inputPlaygrounds, ...surfacePlaygrounds, ...dataPlaygrounds, ...advancedPlaygrounds, ...expansionPlaygrounds,
  "surface-variants": surfacePlaygrounds.card, "action-variants": inputPlaygrounds.button,
  "status-variants": surfacePlaygrounds.badge, "dialog-variants": surfacePlaygrounds.dialog,
  "line-tabs": surfacePlaygrounds.tabs, "chat-primitives": inputPlaygrounds["prompt-input"],
  ...Object.fromEntries(["ai-token-usage", "ai-latency", "ai-errors", "ai-throughput", "ai-distribution", "ai-retrieval", "ai-agents"].map(id => [id, dataPlaygrounds.cartesian])),
  "ai-cost": dataPlaygrounds.donut, "ai-tradeoff": dataPlaygrounds.scatter, "ai-evaluations": dataPlaygrounds.heatmap,
};

const additions = [
  ["loader", "Loader", "Feedback", "Five motion-aware loading effects."],
  ["multi-step-loader", "Multi Step Loader", "Feedback", "Timed or controlled loading steps in a modal or inline."],
  ["image-generation-loader", "Image Generation Loader", "Feedback", "Canvas scanning effects with semantic theme colors."],
  ["floating-navbar", "Floating Navbar", "Navigation", "Scroll-aware navigation with mobile controls."],
  ["resizable-navbar", "Resizable Navbar", "Navigation", "Navigation that contracts as the page scrolls."],
  ["navbar-menu", "Navbar Menu", "Navigation", "Keyboard-accessible navigation menus."],
  ["sidebar", "Sidebar", "Navigation", "Collapsible workspace navigation and mobile drawer."],
  ["floating-dock", "Floating Dock", "Navigation", "Animated navigation with focus and touch support."],
  ["notch", "Notch", "Navigation", "Grouped quick controls."],
  ["animated-tabs", "Animated Tabs", "Navigation", "Moving indicators and stacked content."],
  ["sticky-banner", "Sticky Banner", "Navigation", "Dismissible announcements."],
  ["icon", "Icon", "Data display", "Reusable SVG controls with consistent sizing, alignment, and accessible labels."],
  ["interactive-card", "Interactive Card", "Data display", "Lift and spotlight surfaces with keyboard and reduced-motion support."],
  ["suggestions", "Suggestions", "Inputs", "Selectable prompt ideas with wrapping and disabled states."],
  ["tool-status", "Tool Status", "Feedback", "Collapsible pending, running, complete, and error details."],
  ["task-plan", "Task Plan", "Feedback", "Step-by-step plans with expandable details and explicit task states."],
  ["shimmer-text", "Shimmer Text", "Feedback", "A restrained, finite text pulse for activity feedback."],
  ["message", "Message", "Data display", "Bubble and plain messages for users, assistants, and system notices."],
  ["prompt-input", "Prompt Input", "Inputs", "Classic and modern composers with sending and stop states."],
  ["button-group", "Button Group", "Layout", "Horizontal and vertical action groups."],
  ["kbd", "Keyboard Hint", "Data display", "Single keys and composed keyboard shortcuts."],
] as const;
export const playgroundExamples: Example[] = additions.map(([id, name, category, description]) => {
  const definition = playgrounds[id];
  return { id, name, category, description, imports: "", code: definition.source(definition.defaults), Demo: () => <>{definition.render(definition.defaults)}</>, isNew: true };
});

playgroundExamples.push(...Object.entries(expansionPlaygrounds).map(([id, definition]) => ({ id, name: titleCase(id), category: (["form-panel", "vanish-input", "gooey-input", "file-upload"].includes(id) ? "Inputs" : ["layout-grid", "infinite-card-grid", "bento-grid", "container-cover"].includes(id) ? "Layout" : "Data display") as Example["category"], description: "Theme-aware interactive component with reusable variants.", imports: "", code: definition.source(definition.defaults), Demo: () => <>{definition.render(definition.defaults)}</>, isNew: true })));
