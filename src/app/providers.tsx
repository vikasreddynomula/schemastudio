"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { startMockWorker } from "@/mocks/browser";


export default function Providers({ children }: { children: React.ReactNode }) {
const [client] = React.useState(() => new QueryClient());
React.useEffect(() => { startMockWorker(); }, []);
return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}