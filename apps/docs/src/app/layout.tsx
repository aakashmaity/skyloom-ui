import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "skyloom-ui/components/theme-provider";
import { ThemeScript } from "skyloom-ui/components/theme-script";
import { inter, editorial } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sky UI — Design System",
  description: "Explore the Sky UI component library, semantic tokens, and responsive patterns.",
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en" data-theme="light" data-density="comfortable" className={`${inter.variable} ${editorial.variable}`} suppressHydrationWarning><head><ThemeScript /></head><body><ThemeProvider>{children}</ThemeProvider></body></html>;
}
