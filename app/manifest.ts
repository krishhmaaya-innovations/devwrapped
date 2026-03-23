import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DevWrapped",
    short_name: "DevWrapped",
    description:
      "Turn your GitHub contributions into a beautiful, shareable visual. Free, no sign-up.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f0f23",
    theme_color: "#6366f1",
    orientation: "portrait-primary",
    categories: ["developer tools", "productivity"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
