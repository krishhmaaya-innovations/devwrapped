import type { Metadata } from "next";
import { BattleClient } from "./client";

interface PageProps {
  params: Promise<{ user1: string; user2: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { user1, user2 } = await params;
  const title = `${user1} vs ${user2} — Dev Battle`;
  const description = `GitHub contribution battle: ${user1} vs ${user2}. Who codes more? Find out on DevWrapped.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://devwrapped.com/battle/${user1}/${user2}`,
    },
    openGraph: {
      title: `${title} — DevWrapped`,
      description,
      url: `https://devwrapped.com/battle/${user1}/${user2}`,
      images: [{
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: `${user1} vs ${user2} — Dev Battle on DevWrapped`,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/api/og"],
    },
  };
}

export default async function BattleResultPage({ params }: PageProps) {
  const { user1, user2 } = await params;
  return <BattleClient user1={user1} user2={user2} />;
}
