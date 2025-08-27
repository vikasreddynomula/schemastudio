"use client";

import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

type RowT = { id: number; name: string; count: number };

const data: RowT[] = Array.from({ length: 10_000 }, (_, i) => ({
  id: i + 1,
  name: `Row ${i + 1}`,
  count: Math.floor(Math.random() * 1000),
}));

const columns: ColumnDef<RowT>[] = [
  { header: "ID", accessorKey: "id" },
  { header: "Name", accessorKey: "name" },
  { header: "Count", accessorKey: "count" },
];

const GRID_TEMPLATE = "120px 1fr 140px";

export default function DataGrid() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const table = useReactTable<RowT>({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const parentRef = React.useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 10,
  });

  const items = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  return (
    <div className="space-y-2">
      <div className="text-2xl font-semibold">Demo Data Grid</div>

      <div
        ref={parentRef}
        className="border rounded relative bg-white"
        style={{ height: "70vh", overflow: "auto" }}
      >
        <div
          className="sticky top-0 z-10 bg-white/95 backdrop-blur shadow-sm border-b"
          style={{ display: "grid", gridTemplateColumns: GRID_TEMPLATE }}
        >
          {table.getHeaderGroups().map((hg) =>
            hg.headers.map((h) => (
              <div
                key={h.id}
                className="px-3 py-2 text-sm font-medium select-none cursor-pointer"
                onClick={h.column.getToggleSortingHandler()}
              >
                {h.isPlaceholder
                  ? null
                  : flexRender(h.column.columnDef.header, h.getContext())}
                {{ asc: " ▲", desc: " ▼" }[h.column.getIsSorted() as string] ?? null}
              </div>
            ))
          )}
        </div>

        <div
          className="relative"
          style={{ height: totalSize }}
        >
          {items.map((vi) => {
            const row = table.getRowModel().rows[vi.index];
            return (
              <div
                key={vi.key}
                className="absolute inset-x-0 border-b"
                style={{
                  transform: `translateY(${vi.start}px)`,
                  height: vi.size,
                  display: "grid",
                  gridTemplateColumns: GRID_TEMPLATE,
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <div key={cell.id} className="px-3 py-2 text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Simple page controls (optional) */}
      {/* Add pagination/filtering later with MSW + React Query */}
    </div>
  );
}
