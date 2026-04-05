import type { RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints"
import { el, text } from "../html"
import { Color, ColorMap, FONT_FAMILY, TEXT_STYLES } from "../constants"
import { renderRichTexts } from "../richtext"

export function renderPageTitle(title: RichTextItemResponse[]): string {
  const content =
    title.length === 0
      ? text("Untitled")
      : renderRichTexts(title, Color.Default)

  return el(
    "h1",
    {
      style: {
        color: ColorMap.default,
        fontFamily: FONT_FAMILY,
        margin: "0",
        ...TEXT_STYLES.PAGE_TITLE,
      },
    },
    content,
  )
}
