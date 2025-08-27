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

const ALL_ROWS = makeRows(10_000);
const PAGE_SIZE = 100;

export default function GridClient() {
  const sp = useSearchParams();

  // parse URL
  const page = parseInt(sp.get("page") || "0", 10);
  const fName = (sp.get("fName") || "").toLowerCase();
  const fRole = sp.get("fRole") || "";
  const fAgeMin = sp.get("fAgeMin");
  const fAgeMax = sp.get("fAgeMax");
  const ageMin = fAgeMin ? Number(fAgeMin) : undefined;
  const ageMax = fAgeMax ? Number(fAgeMax) : undefined;

  // apply filters BEFORE pagination
  const filtered = ALL_ROWS.filter((r) => {
    if (fName && !r.name.toLowerCase().includes(fName)) return false;
    if (fRole && r.role !== fRole) return false;
    if (ageMin !== undefined && r.age < ageMin) return false;
    if (ageMax !== undefined && r.age > ageMax) return false;
    return true;
  });

  // current page slice
  const start = page * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, filtered.length);
  const pageRows = filtered.slice(start, end);

  return (
    <>
      <p className="mb-2 text-sm opacity-70">
        Showing {filtered.length ? start + 1 : 0}–{end} of {filtered.length} filtered rows
        {" "}(out of {ALL_ROWS.length} total)
      </p>

      <DataGrid data={pageRows} page={page} pageSize={PAGE_SIZE} total={filtered.length} />
    </>
  );
}
