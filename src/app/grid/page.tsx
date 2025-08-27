// src/app/grid/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import DataGrid, { Row } from "@/modules/grid/DataGrid";

function makeRows(count: number): Row[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    age: 18 + (i % 50),
    role: i % 3 === 0 ? "Admin" : i % 3 === 1 ? "User" : "Guest",
  }));
}

const allRows = makeRows(10_000);
const PAGE_SIZE = 100;

export default function GridPage() {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "0", 10);

  const start = page * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, allRows.length);
  const pageRows = allRows.slice(start, end);

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-3">Data Grid (10k rows demo)</h1>
      <p className="mb-2 text-sm opacity-70">
        Showing {start + 1}–{end} of {allRows.length}
      </p>
      <DataGrid data={pageRows} page={page} pageSize={PAGE_SIZE} total={allRows.length} />
    </div>
  );
}
