import type { StyleProps } from "./types/style"

/** Color enum matching Notion's color values */
export enum Color {
  Default = "default",
  Gray = "gray",
  Brown = "brown",
  Orange = "orange",
  Yellow = "yellow",
  Green = "green",
  Blue = "blue",
  Purple = "purple",
  Pink = "pink",
  Red = "red",
  DefaultBackground = "default_background",
  GrayBackground = "gray_background",
  BrownBackground = "brown_background",
  OrangeBackground = "orange_background",
  YellowBackground = "yellow_background",
  GreenBackground = "green_background",
  BlueBackground = "blue_background",
  PurpleBackground = "purple_background",
  PinkBackground = "pink_background",
  RedBackground = "red_background",
}

export function isBackgroundColor(color: Color): boolean {
  return color.endsWith("_background")
}

// Notion actual color values (extracted 2025-01-09)
export const DEFAULT_COLOR = "#2c2c2b"

export const ColorMap: Record<Color, string> = {
  [Color.Default]: DEFAULT_COLOR,
  [Color.Gray]: "#7d7a75",
  [Color.Brown]: "#9f765a",
  [Color.Orange]: "#d27b2d",
  [Color.Yellow]: "#cb9434",
  [Color.Green]: "#50946e",
  [Color.Blue]: "#387dc9",
  [Color.Purple]: "#9a6bb4",
  [Color.Pink]: "#c14c8a",
  [Color.Red]: "#cf5148",
  [Color.DefaultBackground]: DEFAULT_COLOR,
  [Color.GrayBackground]: DEFAULT_COLOR,
  [Color.BrownBackground]: DEFAULT_COLOR,
  [Color.OrangeBackground]: DEFAULT_COLOR,
  [Color.YellowBackground]: DEFAULT_COLOR,
  [Color.GreenBackground]: DEFAULT_COLOR,
  [Color.BlueBackground]: DEFAULT_COLOR,
  [Color.PurpleBackground]: DEFAULT_COLOR,
  [Color.PinkBackground]: DEFAULT_COLOR,
  [Color.RedBackground]: DEFAULT_COLOR,
}

export const HighlightBackgroundColorMap: Record<string, string> = {
  default_background: "transparent",
  gray_background: "rgba(42, 28, 0, 0.071)",
  brown_background: "rgba(139, 46, 0, 0.086)",
  orange_background: "rgba(224, 101, 1, 0.129)",
  yellow_background: "rgba(211, 168, 0, 0.137)",
  green_background: "rgba(0, 100, 45, 0.090)",
  blue_background: "rgba(0, 124, 215, 0.094)",
  purple_background: "rgba(102, 0, 178, 0.078)",
  pink_background: "rgba(197, 0, 93, 0.086)",
  red_background: "rgba(223, 22, 0, 0.094)",
}

export const CalloutBackgroundColorMap: Record<string, string> = {
  default_background: "transparent",
  gray_background: "#f9f8f7",
  brown_background: "#f5ede9",
  orange_background: "#fbebde",
  yellow_background: "#f9f3dc",
  green_background: "#e8f1ec",
  blue_background: "#e5f2fc",
  purple_background: "#f3ebf9",
  pink_background: "#fae9f1",
  red_background: "#fce9e7",
}

export const FONT_FAMILY =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"

export const MONOSPACE_FONT =
  '"SFMono-Regular", Menlo, Consolas, "PT Mono", "Liberation Mono", Courier, monospace'

export const TEXT_STYLES: Record<string, StyleProps> = {
  PAGE_TITLE: {
    fontSize: "2.5em",
    lineHeight: 1.2,
    fontWeight: "700",
  },
  DEFAULT: {
    fontSize: "1em",
    lineHeight: 1.5,
  },
  H1: {
    fontSize: "1.875em",
    lineHeight: 1.3,
    fontWeight: 600,
  },
  H2: {
    fontSize: "1.5em",
    lineHeight: 1.3,
    fontWeight: 600,
  },
  H3: {
    fontSize: "1.25em",
    lineHeight: 1.3,
    fontWeight: 600,
  },
  H4: {
    fontSize: "1em",
    lineHeight: 1.3,
    fontWeight: 600,
  },
  TABLE: {
    fontSize: "0.875em",
    lineHeight: "1.25em",
  },
}

/** Select tag colors (extracted from Notion, 2026-02-28) */
export const SelectTagColors: Record<string, { bg: string; text: string }> = {
  default: { bg: "rgba(42, 28, 0, 0.07)", text: "rgb(44, 44, 43)" },
  gray: { bg: "rgba(42, 28, 0, 0.07)", text: "rgb(73, 72, 70)" },
  brown: { bg: "rgba(139, 46, 0, 0.09)", text: "rgb(100, 71, 58)" },
  orange: { bg: "rgba(245, 93, 0, 0.13)", text: "rgb(147, 70, 30)" },
  yellow: { bg: "rgba(233, 168, 0, 0.14)", text: "rgb(131, 94, 34)" },
  green: { bg: "rgba(0, 96, 38, 0.157)", text: "rgb(42, 83, 60)" },
  blue: { bg: "rgba(0, 120, 223, 0.13)", text: "rgb(39, 76, 119)" },
  purple: { bg: "rgba(92, 0, 163, 0.14)", text: "rgb(85, 59, 105)" },
  pink: { bg: "rgba(193, 0, 96, 0.11)", text: "rgb(126, 49, 84)" },
  red: { bg: "rgba(228, 31, 0, 0.12)", text: "rgb(143, 49, 43)" },
}

export const DEFAULT_ASSET_BASE_URL = "https://notionto.email"

export const REFRESH_ICON_SVG =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.0385 19.5C9.94473 19.5 8.17129 18.7736 6.71817 17.3207C5.26506 15.8679 4.5385 14.0948 4.5385 12.0015C4.5385 9.90821 5.26506 8.13464 6.71817 6.68081C8.17129 5.22696 9.94473 4.50003 12.0385 4.50003C13.2077 4.50003 14.3141 4.75997 15.3577 5.27986C16.4013 5.79972 17.2692 6.53338 17.9615 7.48083V4.50003H19.4615V10.6154H13.3462V9.11541H17.2962C16.7692 8.15002 16.0385 7.38944 15.1039 6.83366C14.1692 6.27789 13.1474 6.00001 12.0385 6.00001C10.3718 6.00001 8.95514 6.58334 7.78848 7.75001C6.62181 8.91667 6.03848 10.3333 6.03848 12C6.03848 13.6667 6.62181 15.0833 7.78848 16.25C8.95514 17.4167 10.3718 18 12.0385 18C13.3218 18 14.4801 17.6333 15.5135 16.9C16.5468 16.1667 17.2718 15.2 17.6885 14H19.2692C18.8154 15.632 17.9214 16.9567 16.5875 17.974C15.2535 18.9913 13.7372 19.5 12.0385 19.5Z" fill="rgba(55,53,47,0.5)"/></svg>'
