"use client";

import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react";
import { motion as animated } from "motion/react";
import * as Menu from "@radix-ui/react-navigation-menu";
import { Button, type ButtonProps } from "./button";
import { Icon } from "./icon";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "./sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { useMotionPolicy } from "./motion";
import { cn } from "../lib/utils";

export type SurfaceVariant = "default" | "classic" | "modern";
export type NavigationItem = { id: string; label: string; href?: string; icon?: ReactNode; active?: boolean; description?: string; children?: readonly NavigationItem[]; onSelect?: () => void };
export type NavigationProps = { items: readonly NavigationItem[]; label?: string; brand?: ReactNode; actions?: ReactNode; variant?: SurfaceVariant; className?: string; scrollTarget?: RefObject<HTMLElement | null>; position?: "sticky" | "fixed" | "static" };

function useScrollState(target?: RefObject<HTMLElement | null>) {
  const [state, setState] = useState({ scrolled: false, down: false });
  useEffect(() => {
    const node = target?.current;
    const source = node ?? window;
    let previous = node?.scrollTop ?? window.scrollY, frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = node?.scrollTop ?? window.scrollY;
        const threshold = (node?.clientHeight ?? window.innerHeight) * .05;
        setState({ scrolled: next > threshold, down: next > threshold && next > previous }); previous = next;
      });
    };
    source.addEventListener("scroll", update, { passive: true }); update();
    return () => { cancelAnimationFrame(frame); source.removeEventListener("scroll", update); };
  }, [target]);
  return state;
}

function NavLink({ item, compact = false, onNavigate, ...props }: ButtonProps & { item: NavigationItem; compact?: boolean; onNavigate?: () => void }) {
  const content = <>{item.icon}<span className={cn("min-w-0 wrap-anywhere", compact && "sr-only")}>{item.label}</span></>;
  const shared = { variant: item.active ? "secondary" as const : "ghost" as const, className: "h-auto min-h-touch justify-start whitespace-normal py-control", "aria-label": compact ? item.label : undefined };
  const select = () => { item.onSelect?.(); onNavigate?.(); };
  return item.href ? <Button {...shared} {...props} asChild><a href={item.href} aria-current={item.active ? "page" : undefined} onClick={select}>{content}</a></Button> : <Button {...shared} {...props} aria-pressed={item.active} onClick={select}>{content}</Button>;
}

function MobileNavigation({ items, label }: { items: readonly NavigationItem[]; label: string }) {
  const [open, setOpen] = useState(false);
  return <div className="tablet:hidden"><Button variant="ghost" aria-label={`Open ${label}`} aria-expanded={open} onClick={() => setOpen(true)}><Icon name="menu" /></Button><Sheet open={open} onOpenChange={setOpen}><SheetContent><SheetTitle>{label}</SheetTitle><SheetDescription>Choose a destination.</SheetDescription><nav aria-label={label} className="grid gap-control">{items.map(item => <div key={item.id}><NavLink item={item} onNavigate={() => setOpen(false)} />{item.children?.map(child => <div key={child.id} className="ps-panel"><NavLink item={child} onNavigate={() => setOpen(false)} /></div>)}</div>)}</nav></SheetContent></Sheet></div>;
}

function Navbar({ items, label = "Main navigation", brand, actions, variant = "default", className, scrollTarget, position = "sticky", behavior }: NavigationProps & { behavior: "floating" | "resize" }) {
  const scroll = useScrollState(scrollTarget);
  const [focused, setFocused] = useState(false);
  const policy = useMotionPolicy();
  const hidden = behavior === "floating" && scroll.down && !focused;
  return <animated.nav aria-label={label} data-position={position} data-variant={variant} data-compact={behavior === "resize" && scroll.scrolled} className={cn("sky-navbar sky-advanced-surface mx-auto flex min-w-0 items-center gap-control p-control", className)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    animate={{ y: hidden ? "-150%" : "0%", opacity: hidden ? 0 : 1 }} transition={{ duration: policy.enabled ? policy.settings.duration : 0 }}>
    {brand && <div className="min-w-0 shrink-0 px-control font-semibold">{brand}</div>}
    <div className="hidden min-w-0 flex-1 flex-wrap items-center justify-center gap-control tablet:flex">{items.map(item => <NavLink key={item.id} item={item} />)}</div>
    <div className="ms-auto flex items-center gap-control">{actions}<MobileNavigation items={items} label={label} /></div>
  </animated.nav>;
}
export const FloatingNavbar = (props: NavigationProps) => <Navbar {...props} behavior="floating" />;
export const ResizableNavbar = (props: NavigationProps) => <Navbar {...props} behavior="resize" />;

export function NavbarMenu({ items, label = "Navigation menu", brand, actions, className, variant = "default" }: NavigationProps) {
  return <div data-variant={variant} className={cn("sky-advanced-surface relative flex flex-wrap items-center gap-control p-control", className)}>{brand}<Menu.Root aria-label={label} className="relative hidden min-w-0 flex-1 tablet:block"><Menu.List className="flex flex-wrap items-center gap-control">{items.map(item => <Menu.Item key={item.id}>
    {item.children?.length ? <><Menu.Trigger className="sky-focus sky-disclosure flex min-h-touch items-center gap-control rounded-control px-inline text-label hover:bg-secondary">{item.icon}{item.label}<Icon name="chevron-down" className="sky-disclosure-icon" /></Menu.Trigger><Menu.Content className="sky-enter sky-popover sky-advanced-surface absolute inset-x-0 top-full grid gap-control p-panel shadow-floating tablet:grid-cols-2">{item.children.map(child => <Menu.Link key={child.id} asChild><a href={child.href ?? "#"} onClick={child.onSelect} className="sky-focus rounded-control p-inline hover:bg-secondary"><span className="flex items-center gap-control font-medium">{child.icon}{child.label}</span>{child.description && <span className="mt-control block text-label text-muted-foreground">{child.description}</span>}</a></Menu.Link>)}</Menu.Content></>
      : <Menu.Link asChild active={item.active}><a href={item.href ?? "#"} onClick={item.onSelect} className="sky-focus flex min-h-touch items-center gap-control rounded-control px-inline text-label hover:bg-secondary">{item.icon}{item.label}</a></Menu.Link>}
  </Menu.Item>)}</Menu.List></Menu.Root><MobileNavigation items={items} label={label} />{actions}</div>;
}

export type SidebarProps = NavigationProps & { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; children?: ReactNode };
export function Sidebar({ items, label = "Sidebar", brand, actions, className, variant = "default", open: controlled, defaultOpen = true, onOpenChange, children }: SidebarProps) {
  const [internal, setInternal] = useState(defaultOpen), [mobile, setMobile] = useState(false);
  const open = controlled ?? internal;
  const change = (next: boolean) => { if (controlled === undefined) setInternal(next); onOpenChange?.(next); };
  const links = (compact: boolean) => items.map(item => <NavLink key={item.id} item={item} compact={compact && !!item.icon} onNavigate={() => setMobile(false)} />);
  return <div className={cn("flex min-w-0 gap-stack", className)}><aside aria-label={label} data-variant={variant} data-expanded={open} className="sky-sidebar-panel sky-advanced-surface hidden shrink-0 flex-col gap-stack p-control tablet:flex"><div className="flex flex-wrap items-center justify-between gap-control">{open && brand}<Button size="icon" variant="ghost" aria-label={open ? "Collapse sidebar" : "Expand sidebar"} aria-expanded={open} onClick={() => change(!open)}><Icon name="menu" /></Button></div><nav aria-label={label} className="grid gap-control">{links(!open)}</nav>{open && actions}</aside><div className="min-w-0 flex-1"><Button className="mb-stack tablet:hidden" variant="outline" aria-expanded={mobile} onClick={() => setMobile(true)}><Icon name="menu" />{label}</Button>{children}</div><Sheet open={mobile} onOpenChange={setMobile}><SheetContent side="left"><SheetTitle>{label}</SheetTitle><SheetDescription>Workspace navigation</SheetDescription>{brand}<nav className="grid gap-control" aria-label={label}>{links(false)}</nav>{actions}</SheetContent></Sheet></div>;
}

export function FloatingDock({ items, label = "Dock", variant = "default", className }: NavigationProps) {
  const [active, setActive] = useState(-1);
  const touch = useRef(false);
  const { enabled, settings } = useMotionPolicy();
  return <TooltipProvider><nav aria-label={label} data-variant={variant} className={cn("sky-advanced-surface mx-auto flex w-fit max-w-full items-end gap-control overflow-x-auto p-inline", className)} onPointerLeave={() => setActive(-1)}>{items.map((item, index) => <animated.div key={item.id} onPointerEnter={event => { if (event.pointerType !== "touch") setActive(index); }} onPointerDownCapture={event => { touch.current = event.pointerType === "touch"; if (touch.current) setActive(-1); }} onKeyDownCapture={() => { touch.current = false; setActive(index); }} onFocus={() => { if (!touch.current) setActive(index); }} onBlur={() => setActive(-1)} animate={{ scale: enabled && active >= 0 ? Math.max(1, 1.2 - Math.abs(index - active) * .12) : 1 }} transition={{ duration: enabled ? settings.duration : 0 }}><Tooltip><TooltipTrigger asChild><NavLink item={item} compact={!!item.icon} /></TooltipTrigger><TooltipContent>{item.label}</TooltipContent></Tooltip></animated.div>)}</nav></TooltipProvider>;
}

export type NotchGroup = { id: string; label: string; options: readonly { value: string; label: string; icon?: ReactNode }[]; value?: string; defaultValue?: string; onValueChange?: (value: string) => void };
function NotchControl({ group }: { group: NotchGroup }) {
  const [value, setValue] = useState(group.defaultValue ?? group.options[0]?.value ?? ""), [open, setOpen] = useState(false);
  const selected = group.value ?? value;
  return <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><Button variant="ghost" className="h-auto flex-wrap py-control">{group.label}<span className="text-muted-foreground">{group.options.find(option => option.value === selected)?.label}</span><Icon name="chevron-down" /></Button></PopoverTrigger><PopoverContent className="grid gap-control" aria-label={group.label}>{group.options.map(option => <Button key={option.value} variant={option.value === selected ? "secondary" : "ghost"} aria-pressed={option.value === selected} className="justify-start" onClick={() => { if (group.value === undefined) setValue(option.value); group.onValueChange?.(option.value); setOpen(false); }}>{option.icon}{option.label}{option.value === selected && <Icon name="check" className="ms-auto" />}</Button>)}</PopoverContent></Popover>;
}
export function Notch({ groups, position = "bottom", align = "center", fixed = false, variant = "modern", className }: { groups: readonly NotchGroup[]; position?: "top" | "bottom"; align?: "start" | "center" | "end"; fixed?: boolean; variant?: SurfaceVariant; className?: string }) {
  return <div role="group" aria-label="Quick controls" data-position={position} data-align={align} data-fixed={fixed} data-variant={variant} className={cn("sky-notch sky-advanced-surface flex w-fit max-w-full flex-wrap items-center gap-control p-control", className)}>{groups.map(group => <NotchControl key={group.id} group={group} />)}</div>;
}

export type AnimatedTab = { id: string; label: string; content: ReactNode };
export function AnimatedTabs({ items, value: controlled, defaultValue, onValueChange, effect = "indicator", className }: { items: readonly AnimatedTab[]; value?: string; defaultValue?: string; onValueChange?: (value: string) => void; effect?: "indicator" | "stacked"; className?: string }) {
  const [value, setValue] = useState(defaultValue ?? items[0]?.id ?? "");
  const selected = controlled ?? value, id = useId(), { enabled, settings } = useMotionPolicy();
  return <Tabs value={selected} onValueChange={next => { if (controlled === undefined) setValue(next); onValueChange?.(next); }} className={className}><TabsList aria-label="Content sections">{items.map(item => <TabsTrigger key={item.id} value={item.id} className="relative isolate data-[state=active]:bg-transparent">{selected === item.id && <animated.span aria-hidden="true" layoutId={`${id}-indicator`} transition={{ duration: enabled ? settings.duration : 0 }} className="absolute inset-0 -z-10 rounded-control bg-card shadow-raised" />}{item.label}</TabsTrigger>)}</TabsList>{items.map(item => <TabsContent key={item.id} value={item.id}><animated.div initial={enabled ? { opacity: 0, y: effect === "stacked" ? "5%" : 0, rotateX: effect === "stacked" ? -6 : 0 } : false} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: enabled ? settings.duration : 0 }} className={cn(effect === "stacked" && "sky-tab-stack sky-advanced-surface p-panel")}>{item.content}</animated.div></TabsContent>)}</Tabs>;
}

export function StickyBanner({ children, open: controlled, defaultOpen = true, onOpenChange, hideOnScroll = false, scrollTarget, variant = "default", className }: { children: ReactNode; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; hideOnScroll?: boolean; scrollTarget?: RefObject<HTMLElement | null>; variant?: SurfaceVariant; className?: string }) {
  const [internal, setInternal] = useState(defaultOpen), [focused, setFocused] = useState(false);
  const scroll = useScrollState(scrollTarget), { enabled, settings } = useMotionPolicy();
  if (!(controlled ?? internal)) return null;
  return <animated.aside aria-label="Announcement" data-variant={variant} className={cn("sky-banner sky-advanced-surface flex items-center gap-inline p-inline", className)} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }} animate={{ y: hideOnScroll && scroll.down && !focused ? "-150%" : "0%" }} transition={{ duration: enabled ? settings.duration : 0 }}><div className="min-w-0 flex-1 text-label">{children}</div>{(controlled === undefined || onOpenChange) && <Button variant="ghost" size="icon" aria-label="Dismiss announcement" onClick={() => { if (controlled === undefined) setInternal(false); onOpenChange?.(false); }}><Icon name="close" /></Button>}</animated.aside>;
}
