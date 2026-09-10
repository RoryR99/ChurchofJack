import type { Metadata } from "next";
import "./globals.css";
import { images } from "@/data/church";
export const metadata: Metadata = {
  title: "The Church of Jack | Look to rest yourself.",
  description:
    "An entirely unofficial institution. Four sayings. Infinite interpretations. An affectionate parody created by friends of Javan Jack.",
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
