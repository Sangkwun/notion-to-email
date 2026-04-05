import type { TextRichTextItemResponse, RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints"
import { el, text, a, br, frag } from "../html"
import { Color } from "../constants"
import { buildRichTextStyle } from "./style"
import { hasAnnotations } from "../utils"
import { defaultAnnotations } from "./shared"

/**
 * Preserves whitespace in text by converting spaces to non-breaking spaces where needed.
 * Prevents HTML whitespace collapsing in email clients.
 */
function preserveWhitespace(t: string): string {
  if (t.trim() === "") {
    return t.replace(/ /g, "\u00A0")
  }
  return t
    .replace(/^ +/, (match) => "\u00A0".repeat(match.length))
    .replace(/ +$/, (match) => "\u00A0".repeat(match.length))
    .replace(/  +/g, (match) => "\u00A0".repeat(match.length))
}

function renderTextWithLineBreaks(content: string): string {
  const lines = content.split("\n")
  return lines
    .map((line, index) =>
      frag(
        text(preserveWhitespace(line)),
        index < lines.length - 1 ? br() : null,
      ),
    )
    .join("")
}

export function renderTextRichText(
  richtext: TextRichTextItemResponse,
  blockColor: Color,
): string {
  const annotations = hasAnnotations(richtext)
    ? richtext.annotations
    : defaultAnnotations
  const href: string | null =
    "href" in richtext && typeof richtext.href === "string"
      ? richtext.href
      : null
  const content = richtext.text.content
  const s = buildRichTextStyle(annotations, blockColor)

  if (href) {
    return a(
      {
        href,
        style: {
          borderBottom: "0.5px solid rgba(55,53,47,.4)",
          color: "inherit",
          opacity: 0.7,
        },
      },
      el("span", { style: s }, renderTextWithLineBreaks(content)),
    )
  }

  return el("span", { style: s }, renderTextWithLineBreaks(content))
}
