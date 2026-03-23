import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dev Battle — Compare GitHub Profiles",
  description:
    "Compare two GitHub profiles head-to-head. Who has the most contributions? Longest streak? Best consistency? Find out with DevWrapped Battle.",
  alternates: {
    canonical: "https://devwrapped.com/battle",
  },
  openGraph: {
    title: "Dev Battle — Compare GitHub Profiles — DevWrapped",
    description:
      "Compare two GitHub profiles head-to-head. Who codes more?",
    url: "https://devwrapped.com/battle",
    images: [{
      url: "/api/og",
      width: 1200,
      height: 630,
      alt: "DevWrapped Dev Battle — Compare GitHub Profiles",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dev Battle — DevWrapped",
    description:
      "Compare two GitHub profiles head-to-head. Who codes more?",
    images: ["/api/og"],
  },
};

export default function BattleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
