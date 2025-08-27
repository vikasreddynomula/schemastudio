// src/modules/grid/DataGrid.tsx
"use client";

import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  Row,
} from "@tanstack/react-table";

// Demo data (replace with MSW/React Query later)
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

export default function DataGrid() {
  // Memo to avoid re-creating table on every render
  const table = useReactTable<RowT>({
    data: React.useMemo(() => data, []),
    columns: React.useMemo(() => columns, []),
    getCoreRowModel: getCoreRowModel(),
  });

  const parentRef = React.useRef<HTMLDivElement | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36, // row height
    overscan: 10,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  return (
    <div
      ref={parentRef}
      className="border rounded"
      style={{ height: "70vh", overflow: "auto" }}
    >
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-white shadow z-10">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th key={h.id} className="text-left px-2 py-2 border-b">
                  {h.isPlaceholder
                    ? null
                    : flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        {/* Virtualized body */}
        <tbody
          style={{
            position: "relative",
            display: "block",
            height: `${totalSize}px`,
          }}
        >
          {virtualItems.map((vi) => {
            const row: Row<RowT> = table.getRowModel().rows[vi.index];
            return (
              <tr
                key={vi.key} // use virtual key for stability
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  transform: `translateY(${vi.start}px)`,
                  width: "100%",
                }}
                className="grid"
                // keep column count in sync with headers (3 here)
                // If you add/remove columns, update this class
                // or switch to CSS grid with templateColumns inline.
                // For now we have 3:
                data-cols={3}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-2 py-2 border-b">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
