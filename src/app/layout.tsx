import type { Metadata } from "next";
import "./globals.css";
import Watermark from "@/components/Watermark";

export const metadata: Metadata = {
  title: "CRI Recon — OSINT Reconnaissance Tool",
  description: "Web-based reconnaissance framework. Subdomain discovery, HTTP probing, directory enumeration, and security analysis.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        {children}
        <Watermark />
      </body>
    </html>
  );
}
