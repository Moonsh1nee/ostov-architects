import { SiteShell } from "@/components/layout/SiteShell";
import "../globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell locale="en">{children}</SiteShell>;
}
