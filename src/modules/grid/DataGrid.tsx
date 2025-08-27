"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

// Row type
export type Row = {
  id: number;
  name: string;
  age: number;
  role: string;
};

type Props = {
  data?: Row[];
  page: number;        // current page index (0-based)
  pageSize: number;    // rows per page
  total: number;       // total rows across all pages
};

export default function DataGrid({
  data = [],
  page,
  pageSize,
  total,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parentRef = useRef<HTMLDivElement>(null);

  // --- URL-backed sorting state ---
  const sortBy = searchParams.get("sortBy") || "id";
  const sortDir = (searchParams.get("sortDir") as "asc" | "desc") || "asc";
  const sorting: SortingState = useMemo(
    () => [{ id: sortBy, desc: sortDir === "desc" }],
    [sortBy, sortDir]
  );

  const updateSearchParams = (updates: Record<string, string>) => {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) sp.set(k, v);
    router.replace("?" + sp.toString());
  };

  const toggleSort = (id: string) => {
    if (sortBy === id) {
      updateSearchParams({ sortBy: id, sortDir: sortDir === "asc" ? "desc" : "asc" });
    } else {
      updateSearchParams({ sortBy: id, sortDir: "asc" });
    }
  };

  // --- inline editing state ---
  const [editingCell, setEditingCell] = useState<{ rowId: number; colId: string } | null>(null);
  const [editedData, setEditedData] = useState<Record<string, any>>({});

  // --- columns (editable cells) ---
  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      { accessorKey: "id", header: "ID", cell: (info) => info.getValue<number>() },
      {
        accessorKey: "name",
        header: "Name",
        cell: (info) => {
          const row = info.row.original;
          const isEditing = editingCell?.rowId === row.id && editingCell.colId === "name";
          if (isEditing) {
            return (
              <input
                className="border px-1 w-full"
                autoFocus
                value={editedData.name ?? row.name}
                onChange={(e) => setEditedData((d) => ({ ...d, name: e.target.value }))}
                onBlur={() => {
                  row.name = editedData.name ?? row.name;
                  setEditingCell(null);
                }}
              />
            );
          }
          return (
            <span onDoubleClick={() => setEditingCell({ rowId: row.id, colId: "name" })}>
              {row.name}
            </span>
          );
        },
      },
      {
        accessorKey: "age",
        header: "Age",
        cell: (info) => {
          const row = info.row.original;
          const isEditing = editingCell?.rowId === row.id && editingCell.colId === "age";
          if (isEditing) {
            return (
              <input
                type="number"
                className="border px-1 w-20"
                autoFocus
                value={editedData.age ?? row.age}
                onChange={(e) =>
                  setEditedData((d) => ({ ...d, age: Number(e.target.value) }))
                }
                onBlur={() => {
                  row.age = editedData.age ?? row.age;
                  setEditingCell(null);
                }}
              />
            );
          }
          return (
            <span onDoubleClick={() => setEditingCell({ rowId: row.id, colId: "age" })}>
              {row.age}
            </span>
          );
        },
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: (info) => {
          const row = info.row.original;
          const isEditing = editingCell?.rowId === row.id && editingCell.colId === "role";
          if (isEditing) {
            return (
              <select
                className="border px-1"
                autoFocus
                value={editedData.role ?? row.role}
                onChange={(e) => setEditedData((d) => ({ ...d, role: e.target.value }))}
                onBlur={() => {
                  row.role = editedData.role ?? row.role;
                  setEditingCell(null);
                }}
              >
                <option>Admin</option>
                <option>User</option>
                <option>Guest</option>
              </select>
            );
          }
          return (
            <span onDoubleClick={() => setEditingCell({ rowId: row.id, colId: "role" })}>
              {row.role}
            </span>
          );
        },
      },
    ],
    [editingCell, editedData]
  );

  // react-table instance
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // virtualization for current page only
  const rowModel = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rowModel?.rows.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
    overscan: 8,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="border rounded overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 p-2">
        <span className="text-sm">
          Sort: <b>{sortBy}</b> ({sortDir})
        </span>
        <button
          disabled={page <= 0}
          className="px-2 py-1 border rounded disabled:opacity-50"
          onClick={() => updateSearchParams({ page: String(Math.max(page - 1, 0)) })}
        >
          Prev
        </button>
        <span className="text-sm">
          Page {page + 1} / {totalPages}
        </span>
        <button
          disabled={page + 1 >= totalPages}
          className="px-2 py-1 border rounded disabled:opacity-50"
          onClick={() => updateSearchParams({ page: String(page + 1) })}
        >
          Next
        </button>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-10 flex border-t border-b bg-neutral-50">
        {table.getFlatHeaders().map((header) => (
          <div
            key={header.id}
            className="flex-1 p-2 text-sm font-medium cursor-pointer select-none"
            onClick={() => toggleSort(header.column.id)}
            title="Click to sort"
          >
            {flexRender(header.column.columnDef.header, header.getContext())}
            {sortBy === header.column.id ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
          </div>
        ))}
      </div>

      {/* Body (virtualized) */}
      <div ref={parentRef} className="h-[400px] overflow-auto">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((vr) => {
            const row = rowModel.rows[vr.index];
            return (
              <div
                key={row.id}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${vr.size}px`,
                  transform: `translateY(${vr.start}px)`,
                  display: "flex",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <div key={cell.id} className="flex-1 p-2 border-r last:border-r-0">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
            );
          })}
          {rowModel.rows.length === 0 && (
            <div className="p-4 text-sm text-center opacity-70">No rows</div>
          )}
        </div>
      </div>
    </div>
  );
}
