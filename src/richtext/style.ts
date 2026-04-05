import type { RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints"
import type { StyleProps } from "../types/style"
import {
  Color,
  isBackgroundColor,
  ColorMap,
  HighlightBackgroundColorMap,
} from "../constants"

export function buildRichTextStyle(
  annotation: RichTextItemResponse["annotations"],
  blockColor: Color,
): StyleProps {
  const s: StyleProps = {
    margin: "0",
  }

  // Apply block color (or default color to prevent inheritance from parent)
  if (blockColor !== "default") {
    const color = blockColor as Color
    if (isBackgroundColor(color)) {
      s.background = HighlightBackgroundColorMap[color]
    } else {
      s.color = ColorMap[blockColor]
    }
  } else {
    s.color = ColorMap.default
  }

  // Annotation color overrides block color
  if (annotation.color !== "default") {
    const color = annotation.color as Color
    if (isBackgroundColor(color)) {
      s.background = HighlightBackgroundColorMap[color]
    } else {
      s.color = ColorMap[annotation.color as Color]
    }
  }

  if (annotation.bold) s.fontWeight = "600"
  if (annotation.italic) s.fontStyle = "italic"
  if (annotation.strikethrough) s.textDecoration = "line-through"
  if (annotation.underline) s.textDecoration = "underline"
  if (annotation.code) {
    s.fontFamily = "monospace"
    if (!s.background || s.background === "transparent") {
      s.background = "rgba(135,131,120,.15)"
    }
    s.borderRadius = "0.375em"
    s.fontSize = "0.85em"
    s.padding = "0.2em 0.4em"
  }

  return s
}
