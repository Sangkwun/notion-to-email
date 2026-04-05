import type { RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints"
import { el } from "../html"
import { Color } from "../constants"
import { renderRichTexts } from "../richtext"

export function renderCaption(caption: RichTextItemResponse[]): string {
  if (!caption || caption.length === 0) return ""
  return el(
    "span",
    {
      style: {
        fontSize: "14px",
        paddingTop: "6px",
        paddingBottom: "6px",
        paddingLeft: "2px",
      },
    },
    renderRichTexts(caption, Color.Gray),
  )
}
