import type {
  PageObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints"
import type { StyleProps } from "./types/style"
import {
  Color,
  isBackgroundColor,
  ColorMap,
  CalloutBackgroundColorMap,
} from "./constants"

/** Extract page title as RichTextItemResponse array */
export function getTitleFromPage(page: PageObjectResponse): RichTextItemResponse[] {
  if (!page.properties) return []
  for (const key of Object.keys(page.properties)) {
    const prop = page.properties[key]
    if (prop && "type" in prop && prop.type === "title" && "title" in prop) {
      return (prop.title as RichTextItemResponse[]) ?? []
    }
  }
  return []
}

/** Extract page title as plain text string */
export function getPageTitle(page: PageObjectResponse): string {
  return getTitleFromPage(page).map((rt) => rt.plain_text).join("") || "Untitled"
}

/** Extract page icon as emoji string or URL */
export function extractPageIcon(page: PageObjectResponse): string | null {
  const icon = page.icon
  if (!icon) return null
  if (icon.type === "emoji") return icon.emoji
  if (icon.type === "external") return icon.external.url
  if (icon.type === "file") return icon.file.url
  return null
}

/** Apply Notion color to a style object (shared pattern across all blocks) */
export function applyColorStyle(s: StyleProps, color: Color): void {
  if (color === Color.Default) return
  if (isBackgroundColor(color)) {
    s.background = CalloutBackgroundColorMap[color]
  } else {
    s.color = ColorMap[color]
  }
}

/** Check if a rich text item has annotations */
export function hasAnnotations(
  richtext: Record<string, unknown>,
): richtext is Record<string, unknown> & { annotations: import("@notionhq/client/build/src/api-endpoints").RichTextItemResponse["annotations"] } {
  return "annotations" in richtext
}
