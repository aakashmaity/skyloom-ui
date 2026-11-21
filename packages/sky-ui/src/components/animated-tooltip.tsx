"use client";
import { useState } from "react";
import { motion as animated } from "motion/react";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "./tooltip";
import { Button } from "./button";
import { useMotionPolicy } from "./motion";
export type TooltipPerson = { id: string | number; name: string; designation: string; image?: string };
function Person({ item, effect }: { item: TooltipPerson; effect: "spring" | "follow" | "none" }) {
  const [x, setX] = useState(0); const { enabled, settings } = useMotionPolicy();
  const details = <><p className="font-semibold">{item.name}</p><p className="text-caption">{item.designation}</p></>;
  return <Popover><Tooltip><TooltipTrigger asChild><PopoverTrigger asChild><Button size="icon" variant="ghost" shape="pill" aria-label={`Details for ${item.name}`} onPointerMove={event => { const rect = event.currentTarget.getBoundingClientRect(); if (event.pointerType === "mouse") setX((event.clientX - rect.left) / rect.width - .5); }} onPointerLeave={() => setX(0)}><Avatar><AvatarImage src={item.image} alt="" /><AvatarFallback>{item.name.slice(0, 2)}</AvatarFallback></Avatar></Button></PopoverTrigger></TooltipTrigger><TooltipContent><animated.div initial={enabled && effect !== "none" ? { opacity: 0, scale: .85, y: "20%" } : false} animate={{ opacity: 1, scale: 1, y: "0%", rotate: enabled && effect === "follow" ? x * 12 : 0, x: enabled && effect === "follow" ? `${x * 20}%` : "0%" }} transition={{ type: "spring", stiffness: settings.stiffness, damping: settings.damping, duration: enabled ? undefined : 0 }}>{details}</animated.div></TooltipContent></Tooltip><PopoverContent aria-label={item.name}>{details}</PopoverContent></Popover>;
}
export function AnimatedTooltip({ items, effect = "spring" }: { items: readonly TooltipPerson[]; effect?: "spring" | "follow" | "none" }) { return <TooltipProvider><div className="flex flex-wrap items-center -space-x-control rtl:space-x-reverse" aria-label="People">{items.map(item => <Person key={item.id} item={item} effect={effect} />)}</div></TooltipProvider>; }
