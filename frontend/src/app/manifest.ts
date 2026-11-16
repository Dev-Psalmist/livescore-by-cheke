import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "LiveScore by Cheke",
    short_name: "LiveScore",
    description:
      "Follow live sports scores, fixtures, results, leagues and match updates with LiveScore by Cheke.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#050b09",
    theme_color: "#050b09",
    categories: ["sports", "news"],
    icons: [
      {
        src: "/brand/livescore-icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/brand/livescore-icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
    ],
  };
}
