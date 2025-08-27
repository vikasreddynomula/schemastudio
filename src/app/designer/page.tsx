"use client";
import { Palette } from "@/modules/designer/components/Palette";
import { Canvas } from "@/modules/designer/components/Canvas";
import { Inspector } from "@/modules/designer/components/Inspector";
import { Toolbar } from "@/modules/designer/components/Toolbar";


export default function DesignerPage() {
return (
<main className="grid grid-rows-[auto_1fr] h-[calc(100vh-2rem)] gap-3 p-3">
<Toolbar />
<div className="grid grid-cols-12 gap-3 overflow-hidden">
<section className="col-span-2 border rounded-lg p-3 overflow-auto">
<h2 className="font-semibold mb-2">Palette</h2>
<Palette />
</section>
<section className="col-span-5 border rounded-lg p-3 overflow-hidden">
<h2 className="font-semibold mb-2">Canvas</h2>
<Canvas />
</section>
<section className="col-span-5 border rounded-lg p-3 overflow-auto">
<h2 className="font-semibold mb-2">Live Preview</h2>
<Inspector />
</section>
</div>
</main>
);
}