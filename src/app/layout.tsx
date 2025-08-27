export const metadata = { title: "SchemaStudio", description: "Schema‑driven Admin Console" };
import "./globals.css";
import Providers from "@/app/providers";


export default function RootLayout({ children }: { children: React.ReactNode }) {
return (
<html lang="en" suppressHydrationWarning>
<body className="min-h-screen bg-background text-foreground">
<Providers>
{children}
</Providers>
</body>
</html>
);
}