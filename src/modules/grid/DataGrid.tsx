// src/modules/grid/DataGrid.tsx
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
import { useEffect, useMemo, useRef, useState } from "react";

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
  total: number;       // total rows across all pages (AFTER filters)
};

type Focus = { r: number; c: number } | null; // rowIndex within current page model, column index

export default function DataGrid({
  data = [],
  page,
  pageSize,
  total,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parentRef = useRef<HTMLDivElement>(null);

  // --- URL-backed sorting state (still client-side sorting on the page slice) ---
  const sortBy = searchParams.get("sortBy") || "id";
  const sortDir = (searchParams.get("sortDir") as "asc" | "desc") || "asc";
  const sorting: SortingState = useMemo(
    () => [{ id: sortBy, desc: sortDir === "desc" }],
    [sortBy, sortDir]
  );

  // --- URL-backed filters (applied in the PAGE in GridPage) ---
  const fName = searchParams.get("fName") || "";
  const fRole = searchParams.get("fRole") || "";
  const fAgeMin = searchParams.get("fAgeMin") || "";
  const fAgeMax = searchParams.get("fAgeMax") || "";

  const updateSearchParams = (updates: Record<string, string | null>) => {
    const sp = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === null || v === "") sp.delete(k);
      else sp.set(k, v);
    });
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

  // --- keyboard focus state (grid a11y) ---
  const [focus, setFocus] = useState<Focus>(null); // which cell is "active"
  // Move focus when data changes (e.g., page change) to keep it valid
  useEffect(() => {
    setFocus((f) => {
      if (!f) return null;
      const maxRow = Math.max(0, data.length - 1);
      return { r: Math.min(f.r, maxRow), c: f.c };
    });
  }, [data.length]);

  const columns = useMemo(() => {
    const cols: ColumnDef<Row>[] = [
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
                className="border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-1 w-full rounded"
                autoFocus
                value={editedData.name ?? row.name}
                onChange={(e) => setEditedData((d) => ({ ...d, name: e.target.value }))}
                onBlur={() => {
                  row.name = editedData.name ?? row.name;
                  setEditingCell(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === "Escape") {
                    (e.target as HTMLInputElement).blur();
                  }
                }}
              />
            );
          }
          return <span>{row.name}</span>;
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
                className="border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-1 w-20 rounded"
                autoFocus
                value={editedData.age ?? row.age}
                onChange={(e) =>
                  setEditedData((d) => ({ ...d, age: Number(e.target.value) }))
                }
                onBlur={() => {
                  row.age = editedData.age ?? row.age;
                  setEditingCell(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === "Escape") {
                    (e.target as HTMLInputElement).blur();
                  }
                }}
              />
            );
          }
          return <span>{row.age}</span>;
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
                className="border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-1 rounded"
                autoFocus
                value={editedData.role ?? row.role}
                onChange={(e) => setEditedData((d) => ({ ...d, role: e.target.value }))}
                onBlur={() => {
                  row.role = editedData.role ?? row.role;
                  setEditingCell(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === "Escape") {
                    (e.target as HTMLSelectElement).blur();
                  }
                }}
              >
                <option>Admin</option>
                <option>User</option>
                <option>Guest</option>
              </select>
            );
          }
          return <span>{row.role}</span>;
        },
      },
    ];
    return cols;
  }, [editingCell, editedData]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const rowModel = table.getRowModel();
  const headerColumns = table.getFlatHeaders();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // virtualization for current page only
  const rowVirtualizer = useVirtualizer({
    count: rowModel?.rows.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
    overscan: 8,
  });

  // keyboard handlers for cells
  const handleCellKeyDown = (e: React.KeyboardEvent, rIndex: number, cIndex: number, rowId: number, colId: string) => {
    // start editing
    if (e.key === "Enter") {
      e.preventDefault();
      setEditingCell({ rowId, colId });
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setEditingCell(null);
      return;
    }
    // move focus
    let nr = rIndex;
    let nc = cIndex;
    if (e.key === "ArrowRight") nc = Math.min(headerColumns.length - 1, cIndex + 1);
    if (e.key === "ArrowLeft") nc = Math.max(0, cIndex - 1);
    if (e.key === "ArrowDown") nr = Math.min(rowModel.rows.length - 1, rIndex + 1);
    if (e.key === "ArrowUp") nr = Math.max(0, rIndex - 1);
    if (nr !== rIndex || nc !== cIndex) {
      e.preventDefault();
      setFocus({ r: nr, c: nc });
      // ensure into view
      const vi = rowVirtualizer.getVirtualItems().find(v => v.index === nr);
      if (!vi) {
        rowVirtualizer.scrollToIndex(nr);
      }
    }
  };

  return (
    <div
      className="
        border rounded overflow-hidden
        bg-white text-neutral-900 border-neutral-200
        dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-800
      "
    >
      {/* Toolbar: sorting + pagination */}
      <div
        className="
          flex flex-wrap items-center gap-3 p-2
          bg-white/90 backdrop-blur border-b
          border-neutral-200
          dark:bg-neutral-900/85 dark:border-neutral-800
        "
      >
        <span className="text-sm">
          Sort: <b>{sortBy}</b> ({sortDir})
        </span>
        <button
          disabled={page <= 0}
          className="
            px-2 py-1 rounded text-sm
            border border-neutral-300 hover:bg-neutral-50 active:bg-neutral-100
            disabled:opacity-50
            dark:border-neutral-700 dark:hover:bg-neutral-800 dark:active:bg-neutral-700
          "
          onClick={() => updateSearchParams({ page: String(Math.max(page - 1, 0)) })}
        >
          Prev
        </button>
        <span className="text-sm">
          Page {page + 1} / {totalPages}
        </span>
        <button
          disabled={page + 1 >= totalPages}
          className="
            px-2 py-1 rounded text-sm
            border border-neutral-300 hover:bg-neutral-50 active:bg-neutral-100
            disabled:opacity-50
            dark:border-neutral-700 dark:hover:bg-neutral-800 dark:active:bg-neutral-700
          "
          onClick={() => updateSearchParams({ page: String(page + 1) })}
        >
          Next
        </button>
      </div>

      {/* Filters row (URL-synced) */}
      <div
        className="
          flex flex-wrap items-end gap-2 p-2 text-xs sm:text-sm
          border-b border-neutral-200
          bg-neutral-50
          dark:bg-neutral-800 dark:border-neutral-700
        "
      >
        <div className="flex flex-col">
          <label className="mb-1 opacity-70">Name contains</label>
          <input
            className="border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded px-2 py-1"
            value={fName}
            onChange={(e) => updateSearchParams({ fName: e.target.value || null, page: "0" })}
            placeholder="e.g. User 12"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 opacity-70">Role</label>
          <select
            className="border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded px-2 py-1"
            value={fRole}
            onChange={(e) => updateSearchParams({ fRole: e.target.value || null, page: "0" })}
          >
            <option value="">Any</option>
            <option>Admin</option>
            <option>User</option>
            <option>Guest</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-1 opacity-70">Age min</label>
          <input
            type="number"
            className="w-24 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded px-2 py-1"
            value={fAgeMin}
            onChange={(e) => updateSearchParams({ fAgeMin: e.target.value || null, page: "0" })}
            placeholder="e.g. 21"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 opacity-70">Age max</label>
          <input
            type="number"
            className="w-24 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded px-2 py-1"
            value={fAgeMax}
            onChange={(e) => updateSearchParams({ fAgeMax: e.target.value || null, page: "0" })}
            placeholder="e.g. 60"
          />
        </div>
        <button
          className="
            ml-auto px-2 py-1 rounded text-xs sm:text-sm
            border border-neutral-300 hover:bg-neutral-100
            dark:border-neutral-700 dark:hover:bg-neutral-700
          "
          onClick={() =>
            updateSearchParams({ fName: null, fRole: null, fAgeMin: null, fAgeMax: null, page: "0" })
          }
        >
          Clear filters
        </button>
      </div>

      {/* Make header+table horizontally scrollable on small screens */}
      <div className="overflow-x-auto">
        {/* Header (click to sort) */}
        <div
          className="
            sticky top-0 z-10 flex border-y
            bg-neutral-50 border-neutral-200
            dark:bg-neutral-800 dark:border-neutral-700
            text-xs sm:text-sm
            min-w-[640px]
          "
          role="row"
          aria-rowindex={1}
        >
          {headerColumns.map((header, cIndex) => (
            <div
              key={header.id}
              role="columnheader"
              aria-colindex={cIndex + 1}
              className="
                flex-1 p-2 text-sm font-medium cursor-pointer select-none
                hover:bg-neutral-100 dark:hover:bg-neutral-700
                outline-none
              "
              tabIndex={0}
              onClick={() => toggleSort(header.column.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleSort(header.column.id);
                }
              }}
              title="Click to sort"
            >
              {flexRender(header.column.columnDef.header, header.getContext())}
              {sortBy === header.column.id ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
            </div>
          ))}
        </div>

        {/* Body (virtualized) */}
        <div
          ref={parentRef}
          className="h-[360px] sm:h-[420px] overflow-auto"
          role="grid"
          aria-rowcount={rowModel.rows.length}
          aria-colcount={headerColumns.length}
        >
          <div
            style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}
            className="min-w-[640px]"
          >
            {rowVirtualizer.getVirtualItems().map((vr) => {
              const row = rowModel.rows[vr.index];
              return (
                <div
                  key={row.id}
                  role="row"
                  aria-rowindex={vr.index + 2} // +1 for header, +1 to be 1-based
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${vr.size}px`,
                    transform: `translateY(${vr.start}px)`,
                    display: "flex",
                    borderBottom: "1px solid",
                  }}
                  className="border-neutral-200 dark:border-neutral-700"
                >
                  {row.getVisibleCells().map((cell, cIndex) => {
                    const rowId = row.original.id;
                    const colId = cell.column.id;
                    const isFocused = focus?.r === vr.index && focus?.c === cIndex;

                    return (
                      <div
                        key={cell.id}
                        role="gridcell"
                        aria-colindex={cIndex + 1}
                        tabIndex={0}
                        className={[
                          "flex-1 p-2 border-r last:border-r-0",
                          "border-neutral-200 dark:border-neutral-700",
                          isFocused ? "outline outline-2 outline-blue-500" : "outline-none",
                        ].join(" ")}
                        onFocus={() => setFocus({ r: vr.index, c: cIndex })}
                        onKeyDown={(e) => handleCellKeyDown(e, vr.index, cIndex, rowId, colId)}
                        onDoubleClick={() => setEditingCell({ rowId, colId })}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {rowModel.rows.length === 0 && (
              <div className="p-4 text-sm text-center opacity-70">No rows match your filters</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
