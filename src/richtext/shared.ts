import type { RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints"
import { a } from "../html"

export const defaultAnnotations: RichTextItemResponse["annotations"] = {
  bold: false,
  italic: false,
  strikethrough: false,
  underline: false,
  code: false,
  color: "default",
}

/** Wrap inline content in a link styled like Notion's inline links */
export function inlineLink(href: string, content: string): string {
  return a(
    {
      href,
      style: {
        borderBottom: "0.5px solid rgba(55,53,47,.4)",
        color: "inherit",
        opacity: 0.7,
      },
    },
    content,
  )
}
