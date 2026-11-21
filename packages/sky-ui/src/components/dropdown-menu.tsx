"use client";
import type { ComponentPropsWithRef } from "react";
import * as Primitive from "@radix-ui/react-dropdown-menu";
import { cn } from "../lib/utils";
export const DropdownMenu = Primitive.Root;
export const DropdownMenuTrigger = Primitive.Trigger;
export const DropdownMenuGroup = Primitive.Group;
export function DropdownMenuContent({ className, ...props }: ComponentPropsWithRef<typeof Primitive.Content>) {
  return <Primitive.Portal><Primitive.Content className={cn("sky-enter sky-popover sky-border min-w-preview overflow-y-auto rounded-surface border-border bg-popover p-control text-popover-foreground shadow-floating", className)} {...props} /></Primitive.Portal>;
}
export function DropdownMenuItem({ className, ...props }: ComponentPropsWithRef<typeof Primitive.Item>) {
  return <Primitive.Item className={cn("sky-icon-slot sky-disabled flex min-h-touch cursor-default items-center gap-control rounded-control px-inline py-control text-label outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none tablet:min-h-field", className)} {...props} />;
}
export function DropdownMenuLabel({ className, ...props }: ComponentPropsWithRef<typeof Primitive.Label>) {
  return <Primitive.Label className={cn("px-inline py-control text-caption font-semibold text-muted-foreground", className)} {...props} />;
}
export function DropdownMenuSeparator({ className, ...props }: ComponentPropsWithRef<typeof Primitive.Separator>) {
  return <Primitive.Separator className={cn("my-control h-hairline bg-border", className)} {...props} />;
}
