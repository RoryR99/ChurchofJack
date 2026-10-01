import type { Metadata } from "next";
import "./globals.css";
import { images } from "@/data/church";
export const metadata: Metadata = {
  title: "The Church of Jack | Look to rest yourself.",
  description:
    "The Church of Jack. Rest, sacred snacks, and the wisdom of Jack. Look to rest yourself. Rock Back Heavy.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head><link rel="preload" as="image" href={images[0].src} /></head>
      <body>{children}</body>
    </html>
  );
}
