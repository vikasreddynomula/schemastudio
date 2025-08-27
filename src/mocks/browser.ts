export async function startMockWorker() {
    if (typeof window === "undefined") return;
    if (process.env.NODE_ENV !== "development") return; // don't run in prod/Vercel
  
    const { worker } = await import("./worker");
    await worker.start({
      onUnhandledRequest: "bypass",
      serviceWorker: { url: "/mockServiceWorker.js" }, // path in /public
    });
  }
  