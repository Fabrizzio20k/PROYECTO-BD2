import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Music retrieval App",
  description: "Music retrieval App",
  icons: {
    icon: "/icons/icon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
