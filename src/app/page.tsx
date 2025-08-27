// src/app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-blue-500 to-cyan-400 dark:from-blue-600 dark:to-indigo-600" />
        <div className="absolute -bottom-16 -right-16 h-80 w-80 rounded-full blur-3xl opacity-25 bg-gradient-to-tr from-fuchsia-500 to-rose-400 dark:from-fuchsia-600 dark:to-pink-600" />
      </div>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200/70 bg-white/70 px-3 py-1 text-xs text-neutral-600 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/70 dark:text-neutral-300">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          Schema-driven UI builder
        </div>

        <h1 className="mt-6 text-4xl font-bold tracking-tight text-neutral-900 sm:text-6xl dark:text-neutral-50">
          SchemaStudio
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-7 text-neutral-600 dark:text-neutral-300">
          Design powerful forms, preview them live with validation, and explore your data at
          scale with a virtualized grid — all from one sleek workspace.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/designer"
            className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            Start Designing
            <span aria-hidden>→</span>
          </Link>
          <Link
            href="/grid"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 active:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
          >
            Open Data Grid
            <span aria-hidden>→</span>
          </Link>
          <span className="ml-2 text-xs text-neutral-500 dark:text-neutral-400">
            Zod validation · Dark mode · URL-synced grid
          </span>
        </div>

        {/* Preview panel cards */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-neutral-200 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/70">
            <div className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-200">Designer</div>
            <div className="h-40 rounded-lg border border-dashed border-neutral-300 p-3 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
              Drag fields, edit properties, and preview instantly.
              <div className="mt-3 flex gap-2 text-xs">
                <span className="rounded border border-neutral-300 bg-white px-2 py-1 dark:border-neutral-700 dark:bg-neutral-800">
                  Text
                </span>
                <span className="rounded border border-neutral-300 bg-white px-2 py-1 dark:border-neutral-700 dark:bg-neutral-800">
                  Select
                </span>
                <span className="rounded border border-neutral-300 bg-white px-2 py-1 dark:border-neutral-700 dark:bg-neutral-800">
                  Section
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/70">
            <div className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-200">Data Grid</div>
            <div className="h-40 overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
              <div className="grid grid-cols-3 border-b border-neutral-200 bg-neutral-50 text-xs font-medium text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                <div className="px-3 py-2">Name</div>
                <div className="px-3 py-2">Age</div>
                <div className="px-3 py-2">Role</div>
              </div>
              <div className="divide-y divide-neutral-200 text-xs dark:divide-neutral-800">
                {["Ava", "Kai", "Mina", "Leo", "Noa", "Iris"].map((n, i) => (
                  <div key={n} className="grid grid-cols-3 px-3 py-2 text-neutral-600 dark:text-neutral-300">
                    <div>{n}</div>
                    <div>{18 + (i % 5)}</div>
                    <div>{["Admin", "User", "Guest"][i % 3]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature bullets */}
      <section className="relative mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-6 sm:grid-cols-3">
          <Feature
            title="Schema-First"
            desc="Define fields, constraints, visibility, and computed values — the renderer does the rest."
            emoji="🧩"
          />
          <Feature
            title="Live Validation"
            desc="Zod-powered errors, accessible messages, and read-only computed fields by design."
            emoji="✅"
          />
          <Feature
            title="Blazing Grid"
            desc="Virtualized rows, inline edits, and URL-synced sorting & pagination for massive datasets."
            emoji="⚡"
          />
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href="/designer"
            className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            Build a form
            <span aria-hidden>→</span>
          </Link>
          <Link
            href="/grid"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 active:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
          >
            Try the grid
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}

function Feature({ title, desc, emoji }: { title: string; desc: string; emoji: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/70">
      <div className="text-2xl">{emoji}</div>
      <h3 className="mt-2 text-base font-semibold text-neutral-900 dark:text-neutral-100">
        {title}
      </h3>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{desc}</p>
    </div>
  );
}
