import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReadEasy",
  description: "The web, made readable for every reader."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
