import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent Dashboard - Eazybe",
  description: "Manage and monitor your AI agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
