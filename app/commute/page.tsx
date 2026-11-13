import type { Metadata, Viewport } from "next";
import { JackBoy } from "@/components/game/JackBoy";

export const metadata: Metadata = {
  title: "Jack's Commute | The Church of Jack",
  description:
    "Guide Jack through Tempe to work by 9:00. Collect matcha and strawberry kiwi vapes. Dodge the admirers. Look to rest yourself.",
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
        <span>A / Z / Space: jump</span>
        <span>B / X: hold to run</span>
        <span>Start / Enter: pause</span>
        <span>Select / M: mute</span>
      </p>
    </main>
  );
}
