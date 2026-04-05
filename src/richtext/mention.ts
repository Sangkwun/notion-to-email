import type { MentionRichTextItemResponse } from "@notionhq/client/build/src/api-endpoints"
import { el, text, frag } from "../html"
import { Color, TEXT_STYLES } from "../constants"
import { buildRichTextStyle } from "./style"
import { hasAnnotations } from "../utils"
import { defaultAnnotations } from "./shared"

function renderMentionUser(
  richtext: MentionRichTextItemResponse,
  blockColor: Color,
): string {
  if (richtext.mention.type !== "user") return ""
  const annotations = hasAnnotations(richtext)
    ? richtext.annotations
    : defaultAnnotations
  const userName =
    richtext.mention.user && "name" in richtext.mention.user
      ? richtext.mention.user.name
      : "User"

  return frag(
    el(
      "span",
      {
        style: {
          ...buildRichTextStyle(annotations, blockColor),
          opacity: 0.65,
        },
      },
      text("@"),
    ),
    el(
      "span",
      { style: buildRichTextStyle(annotations, blockColor) },
      text(userName ?? "User"),
    ),
  )
}

function renderMentionDate(
  richtext: MentionRichTextItemResponse,
  blockColor: Color,
): string {
  if (richtext.mention.type !== "date") return ""
  const date = new Date(richtext.mention.date.start)
  const annotations = hasAnnotations(richtext)
    ? richtext.annotations
    : defaultAnnotations

  return frag(
    el(
      "span",
      {
        style: {
          ...TEXT_STYLES.DEFAULT,
          opacity: "0.65",
        },
      },
      text("@"),
    ),
    el(
      "span",
      { style: buildRichTextStyle(annotations, blockColor) },
      text(date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })),
    ),
  )
}

export function renderMention(
  richtext: MentionRichTextItemResponse,
  blockColor: Color,
): string {
  if (richtext.mention.type === "user") {
    return renderMentionUser(richtext, blockColor)
  }
  if (richtext.mention.type === "date") {
    return renderMentionDate(richtext, blockColor)
  }
  return ""
}
