import { Suspense } from "react";
import GridClient from "./GridClient";

export default function GridPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-3">Data Grid</h1>
      <Suspense fallback={<div className="p-4 text-sm opacity-70">Loading grid…</div>}>
        <GridClient />
      </Suspense>
    </div>
  );
}
