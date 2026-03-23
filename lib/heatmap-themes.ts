/**
 * Heatmap theme palettes.
 * Each theme has 5 levels: none, L1, L2, L3, L4
 */

export interface HeatmapTheme {
  id: string;
  name: string;
  levels: [string, string, string, string, string]; // none, L1, L2, L3, L4
  textColor: string;
  labelColor: string;
  borderColor: string;
}

export const HEATMAP_THEMES: HeatmapTheme[] = [
  {
    id: "github",
    name: "GitHub Green",
    levels: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
    textColor: "#e6edf3",
    labelColor: "#8b949e",
    borderColor: "#30363d",
  },
  {
    id: "indigo",
    name: "Indigo Night",
    levels: ["#161b22", "#1e1b4b", "#3730a3", "#6366f1", "#a5b4fc"],
    textColor: "#e6edf3",
    labelColor: "#8b949e",
    borderColor: "#30363d",
  },
  {
    id: "synthwave",
    name: "Synthwave",
    levels: ["#1a1025", "#4a1a6b", "#9b2d9b", "#e040fb", "#ff80ab"],
    textColor: "#f0e6ff",
    labelColor: "#9d8abf",
    borderColor: "#3d2a5c",
  },
  {
    id: "sunset",
    name: "Sunset",
    levels: ["#1c1917", "#7c2d12", "#c2410c", "#ea580c", "#fb923c"],
    textColor: "#fef3c7",
    labelColor: "#a8a29e",
    borderColor: "#44403c",
  },
  {
    id: "ocean",
    name: "Deep Ocean",
    levels: ["#0c1222", "#0c4a6e", "#0369a1", "#0ea5e9", "#7dd3fc"],
    textColor: "#e0f2fe",
    labelColor: "#7e8ca0",
    borderColor: "#1e3a5f",
  },
  {
    id: "forest",
    name: "Forest",
    levels: ["#0f1a0f", "#14532d", "#166534", "#22c55e", "#86efac"],
    textColor: "#dcfce7",
    labelColor: "#6b8f71",
    borderColor: "#1a3a1a",
  },
  {
    id: "cherry",
    name: "Cherry Blossom",
    levels: ["#1a1015", "#831843", "#be185d", "#ec4899", "#f9a8d4"],
    textColor: "#fce7f3",
    labelColor: "#9d7a8f",
    borderColor: "#3d1a2e",
  },
  {
    id: "dracula",
    name: "Dracula",
    levels: ["#282a36", "#44475a", "#6272a4", "#bd93f9", "#ff79c6"],
    textColor: "#f8f8f2",
    labelColor: "#6272a4",
    borderColor: "#44475a",
  },
  {
    id: "mono",
    name: "Monochrome",
    levels: ["#161616", "#333333", "#555555", "#999999", "#cccccc"],
    textColor: "#e0e0e0",
    labelColor: "#777777",
    borderColor: "#333333",
  },
];

export function getTheme(id: string): HeatmapTheme {
  return HEATMAP_THEMES.find((t) => t.id === id) || HEATMAP_THEMES[0];
}

/**
 * Map GitHub contribution level to theme color index
 */
export function levelToIndex(
  level: "NONE" | "FIRST_QUARTILE" | "SECOND_QUARTILE" | "THIRD_QUARTILE" | "FOURTH_QUARTILE"
): number {
  switch (level) {
    case "NONE":
      return 0;
    case "FIRST_QUARTILE":
      return 1;
    case "SECOND_QUARTILE":
      return 2;
    case "THIRD_QUARTILE":
      return 3;
    case "FOURTH_QUARTILE":
      return 4;
    default:
      return 0;
  }
}
