import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ATHENA · Design Lab",
  description: "Ein lokaler Gestaltungsraum für das persönliche Lernen.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="de"><body>{children}</body></html>;
}
