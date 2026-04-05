import type { EquationRichTextItemResponse } from "@notionhq/client/build/src/api-endpoints"
import { el, text } from "../html"
import { Color } from "../constants"
import { buildRichTextStyle } from "./style"
import { hasAnnotations } from "../utils"
import { defaultAnnotations } from "./shared"

export function renderEquation(
  richtext: EquationRichTextItemResponse,
  blockColor: Color,
): string {
  const annotations = hasAnnotations(richtext)
    ? richtext.annotations
    : defaultAnnotations
  const content: string =
    "plain_text" in richtext
      ? String(richtext.plain_text)
      : richtext.equation.expression

  return el("span", { style: buildRichTextStyle(annotations, blockColor) }, text(content))
}
