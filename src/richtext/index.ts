import type {
  RichTextItemResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints"
import { Color } from "../constants"
import { renderTextRichText } from "./text"
import { renderEquation } from "./equation"
import { renderMention } from "./mention"

export function renderRichText(
  richtext: RichTextItemResponse,
  blockColor: Color,
): string {
  if (richtext.type === "mention") {
    return renderMention(richtext, blockColor)
  }
  if (richtext.type === "equation") {
    return renderEquation(richtext, blockColor)
  }
  return renderTextRichText(richtext, blockColor)
}

/** Render an array of rich text items */
export function renderRichTexts(
  items: RichTextItemResponse[],
  blockColor: Color,
): string {
  return items.map((item) => renderRichText(item, blockColor)).join("")
}

export { buildRichTextStyle } from "./style"
