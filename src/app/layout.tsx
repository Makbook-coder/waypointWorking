import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { StudyTimer } from "@/components/StudyTimer";
import { SyncBoot } from "@/components/SyncBoot";
import { ThemeController } from "@/components/ThemeController";
import { STORAGE_KEY } from "@/lib/store";

export const metadata: Metadata = {
  title: { default: "Waypoint · AI engineering tracker", template: "%s · Waypoint" },
  description: "Track your progress through a 16-level AI engineering curriculum: topics, practice, spaced review and notes.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f1ea" },
    { media: "(prefers-color-scheme: dark)", color: "#111215" },
  ],
};

// Applies the saved theme before first paint to avoid a light/dark flash.
const themeScript = `try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)})||"{}");var t=s&&s.settings&&s.settings.theme;if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-bg"
        >
          Skip to content
        </a>
        <ThemeController />
        <StudyTimer />
        <SyncBoot />
        <SiteHeader />
        <main id="main" className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6">
          {children}
        </main>
        <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs text-muted sm:px-6">
          Progress is stored in this browser only. Export it from Settings to keep a backup.
        </footer>
      </body>
    </html>
  );
}
