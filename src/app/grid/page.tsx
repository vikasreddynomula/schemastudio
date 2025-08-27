"use client";
import DataGrid from "@/modules/grid/DataGrid";
export default function GridPage() {
return (
<main className="p-4 h-[calc(100vh-2rem)]">
<h1 className="text-2xl font-semibold mb-3">Demo Data Grid</h1>
<DataGrid />
</main>
);
}