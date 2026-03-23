import type { Metadata } from "next";
import { UserProfileClient } from "./client";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;

  return {
    title: `${username}'s GitHub Wrapped`,
    description: `See ${username}'s GitHub contribution heatmap, streaks, and coding stats — beautifully visualized by DevWrapped.`,
    alternates: {
      canonical: `https://devwrapped.com/${username}`,
    },
    openGraph: {
      title: `${username}'s GitHub Wrapped — DevWrapped`,
      description: `${username}'s GitHub contributions, beautifully visualized.`,
      url: `https://devwrapped.com/${username}`,
      images: [{
        url: `https://devwrapped.com/api/og/${username}`,
        width: 1200,
        height: 630,
        alt: `${username}'s GitHub Wrapped`,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${username}'s GitHub Wrapped`,
      description: `Check out ${username}'s GitHub contribution stats!`,
      images: [`https://devwrapped.com/api/og/${username}`],
    },
  };
}

export default async function UserPage({ params }: PageProps) {
  const { username } = await params;

  return <UserProfileClient username={username} />;
}
