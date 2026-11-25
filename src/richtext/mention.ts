import type {
  MentionRichTextItemResponse,
  RichTextItemResponseCommon,
} from "@notionhq/client/build/src/api-endpoints"
import { el, img, text, frag } from "../html"
import { Color, TEXT_STYLES } from "../constants"
import { buildRichTextStyle } from "./style"
import { hasAnnotations } from "../utils"
import { defaultAnnotations, inlineLink } from "./shared"

type MentionItem = RichTextItemResponseCommon & MentionRichTextItemResponse

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

function renderCustomEmoji(
  richtext: MentionItem,
  blockColor: Color,
): string {
  if (richtext.mention.type !== "custom_emoji") return ""
  const { name, url } = richtext.mention.custom_emoji
  if (!url) return renderMentionText(richtext.plain_text, richtext.href, richtext, blockColor)
  const emoji = img({
    src: url,
    alt: name ? `:${name}:` : richtext.plain_text,
    width: 16,
    height: 16,
    style: {
      display: "inline-block",
      width: "1em",
      height: "1em",
      verticalAlign: "-0.125em",
    },
  })
  return richtext.href ? inlineLink(richtext.href, emoji) : emoji
}

/** Render a mention as its text, linked when it has a target */
function renderMentionText(
  label: string,
  href: string | null | undefined,
  richtext: MentionItem,
  blockColor: Color,
): string {
  const annotations = hasAnnotations(richtext)
    ? richtext.annotations
    : defaultAnnotations
  const span = el("span", { style: buildRichTextStyle(annotations, blockColor) }, text(label))
  return href ? inlineLink(href, span) : span
}

export function renderMention(
  richtext: MentionItem,
  blockColor: Color,
): string {
  const mention = richtext.mention
  switch (mention.type) {
    case "user":
      return renderMentionUser(richtext, blockColor)
    case "date":
      return renderMentionDate(richtext, blockColor)
    case "custom_emoji":
      return renderCustomEmoji(richtext, blockColor)
    case "page":
    case "database":
      return renderMentionText(richtext.plain_text || "Untitled", richtext.href, richtext, blockColor)
    case "link_mention":
      return renderMentionText(
        mention.link_mention.title || richtext.plain_text || mention.link_mention.href,
        mention.link_mention.href,
        richtext,
        blockColor,
      )
    case "link_preview":
      return renderMentionText(
        richtext.plain_text || mention.link_preview.url,
        mention.link_preview.url,
        richtext,
        blockColor,
      )
    case "template_mention":
      return renderMentionText(richtext.plain_text, null, richtext, blockColor)
    default:
      // Mention types newer than this renderer still carry their visible text
      return renderMentionText(richtext.plain_text ?? "", richtext.href, richtext, blockColor)
  }
}
