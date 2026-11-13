import type { Metadata, Viewport } from "next";
import { JackBoy } from "@/components/game/JackBoy";

export const metadata: Metadata = {
  title: "Jackboy | The Church of Jack",
  description:
    "Two cartridges on the Jackboy. Jack's Commute: get through Tempe to work by 9:00. Second Helpings: survive the lunch break. Look to rest yourself.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#101512",
};

export default function CommutePage() {
  return (
    <main className="jackboy-page">
      <a className="jackboy-back" href="/">
        ← The Church
      </a>
      <JackBoy />
      <p className="jackboy-help">
        <span>D-pad / arrows: move</span>
        <span>A / Z / Space: jump · nap</span>
        <span>B / X: run · dash</span>
        <span>Start / Enter: pause</span>
        <span>Select / Esc: cartridge menu</span>
        <span>M or the LED: mute</span>
      </p>
    </main>
  );
}
