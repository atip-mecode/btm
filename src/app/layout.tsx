import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DevTools } from "@/dev/DevTools";

export const metadata: Metadata = {
  title: { default: "BMT", template: "%s | BMT" },
  description: "BMT web application",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body className="app-body">
        {children}
        {process.env.NODE_ENV === "development" ? <DevTools /> : null}
      </body>
    </html>
  );
}
