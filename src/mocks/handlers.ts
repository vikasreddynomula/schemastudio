import { http, HttpResponse } from "msw";


export const handlers = [
  http.get("/api/rows", ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 1);
    const pageSize = Number(url.searchParams.get("pageSize") ?? 100);
    const sortBy = url.searchParams.get("sortBy");
    const sortDir = url.searchParams.get("sortDir");

    const total = 10000;
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, total);

    let items = Array.from({ length: end - start }, (_, i) => ({
      id: start + i + 1,
      name: `Row ${start + i + 1}`,
      count: Math.floor(Math.random() * 1000),
    }));

    if (sortBy && sortDir) {
      items = items.sort(
        (a: any, b: any) => (a[sortBy as keyof typeof a] > b[sortBy as keyof typeof b] ? 1 : -1) *
          (sortDir === "desc" ? -1 : 1)
      );
    }

    return HttpResponse.json({ items, total });
  }),
];
