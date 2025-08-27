export default function Home() {
  return (
  <main className="p-8 max-w-5xl mx-auto space-y-4">
  <h1 className="text-3xl font-bold">SchemaStudio</h1>
  <p className="opacity-80">Form Designer + Preview + Data Grid</p>
  <div className="flex gap-3 pt-4">
  <a className="underline" href="/designer">Go to Designer →</a>
  <a className="underline" href="/grid">Go to Data Grid →</a>
  </div>
  </main>
  );
  }