// src/app/layout.tsx
export const metadata = {
  title: "SchemaStudio",
  description: "Schema-driven Admin Console",
};

import "./globals.css";
import Providers from "@/app/providers";
import { ThemeProvider } from "@/modules/theme/ThemeProvider";
import ThemeToggle from "@/modules/theme/ThemeToggle";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Body colors adapt to .dark class added by ThemeProvider */}
      <body className="min-h-screen bg-white text-black dark:bg-neutral-900 dark:text-neutral-100">
        <ThemeProvider>
          <Providers>
            <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur dark:bg-neutral-900/80 dark:border-neutral-800">
              <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-between">
                <h1 className="text-sm font-semibold">SchemaStudio</h1>
                <ThemeToggle />
              </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-6">
              {children}
            </main>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
