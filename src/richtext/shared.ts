import type { RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints"

export const defaultAnnotations: RichTextItemResponse["annotations"] = {
  bold: false,
  italic: false,
  strikethrough: false,
  underline: false,
  code: false,
  color: "default",
}
