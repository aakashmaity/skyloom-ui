import type { ComponentPropsWithRef } from "react";
import { cn } from "../lib/utils";
export function Table({ className, ...props }: ComponentPropsWithRef<"table">) {
  return <div className="w-full overflow-x-auto"><table className={cn("w-full text-label", className)} {...props} /></div>;
}
export function TableHeader(props: ComponentPropsWithRef<"thead">) { return <thead {...props} />; }
export function TableBody(props: ComponentPropsWithRef<"tbody">) { return <tbody {...props} />; }
export function TableFooter({ className, ...props }: ComponentPropsWithRef<"tfoot">) { return <tfoot className={cn("bg-muted font-medium", className)} {...props} />; }
export function TableRow({ className, ...props }: ComponentPropsWithRef<"tr">) { return <tr className={cn("sky-table-row hover:bg-muted", className)} {...props} />; }
export function TableHead({ className, scope = "col", ...props }: ComponentPropsWithRef<"th">) { return <th scope={scope} className={cn("px-inline py-control text-start font-medium text-muted-foreground", className)} {...props} />; }
export function TableCell({ className, ...props }: ComponentPropsWithRef<"td">) { return <td className={cn("px-inline py-stack", className)} {...props} />; }
export function TableCaption({ className, ...props }: ComponentPropsWithRef<"caption">) { return <caption className={cn("caption-bottom py-stack text-caption text-muted-foreground", className)} {...props} />; }
