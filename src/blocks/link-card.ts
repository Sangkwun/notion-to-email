import type { RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints"
import { el, section, row, column, a, img, text } from "../html"
import { ColorMap } from "../constants"
import { renderCaption } from "./caption"
import type { RenderContext } from "../types/internal"
import { notionIconUrl } from "../utils"

type MediaSource =
  | { type: "external"; external: { url: string } }
  | { type: "file"; file: { url: string } }

/** Link to a block on the Notion page (for content email can't show, such as uploaded files) */
export function notionBlockUrl(ctx: RenderContext, blockId: string): string {
  return `${ctx.page.public_url || ctx.page.url}#${blockId.replaceAll("-", "")}`
}

export function viewOnNotionLabel(ctx: RenderContext): string {
  return ctx.options.labels?.viewOnNotion ?? ctx.options.header?.notionButtonLabel ?? "View on Notion"
}

/**
 * Last path segment of a URL, decoded ("…/Quarterly%20report.pdf?X-Amz…" → "Quarterly report.pdf").
 * Null when there is none, so callers never show the signed URL itself.
 */
export function fileNameFromUrl(url: string): string | null {
  try {
    const segment = new URL(url).pathname.split("/").filter(Boolean).pop()
    return segment ? decodeURIComponent(segment) : null
  } catch {
    return null
  }
}

/** Notion icon PNG used as a card icon (same files as native page icons) */
export function cardIconSrc(ctx: RenderContext, name: string): string {
  return notionIconUrl(ctx.assetBaseUrl, { name, color: "gray" })
}

/** Bordered card that links to href. Draws nothing when href is empty (a block with no URL yet). */
export function renderLinkCard(options: {
  href: string
  iconSrc: string
  title: string
  subtitle?: string
  caption?: RichTextItemResponse[]
}): string {
  const { href, iconSrc, title, subtitle, caption } = options
  if (!href) return ""

  // Links sit inside the cells: Windows Outlook ignores an <a> wrapped around a table
  const linkStyle = { display: "block", color: ColorMap.default, textDecoration: "none" }

  const iconCell = column(
    { style: { width: "1.25em", padding: "0.75em 0 0.75em 0.875em", verticalAlign: "middle" } },
    a(
      { href, style: linkStyle },
      img({
        src: iconSrc,
        alt: "",
        width: 20,
        height: 20,
        style: { display: "block", width: "1.25em", height: "1.25em" },
      }),
    ),
  )

  const textCell = column(
    { style: { padding: "0.75em 0.875em 0.75em 0.625em", verticalAlign: "middle" } },
    a(
      { href, style: linkStyle },
      el(
      "p",
      {
        style: {
          margin: "0",
          fontSize: "0.875em",
          lineHeight: "1.25em",
          maxHeight: "2.5em",
          overflow: "hidden",
          wordBreak: "break-all",
          color: "rgb(55, 53, 47)",
        },
      },
      text(title),
      ),
      subtitle
        ? el(
            "p",
            {
              style: {
                margin: "0.125em 0 0",
                fontSize: "0.75em",
                lineHeight: "1em",
                color: "rgba(55, 53, 47, 0.6)",
              },
            },
            text(subtitle),
          )
        : null,
    ),
  )

  return el(
    "div",
    { style: { margin: "0.25em 0" } },
    section(
      {
        style: {
          border: "1px solid rgba(55, 53, 47, 0.16)",
          borderRadius: "0.625em",
          width: "100%",
        },
      },
      row({}, iconCell, textCell),
    ),
    caption ? renderCaption(caption) : null,
  )
}

/**
 * Card for a video/pdf/audio block that email can't play.
 * Uploaded files link to the block on Notion because their URLs expire after an hour.
 */
export function renderMediaCard(
  source: MediaSource & { caption?: RichTextItemResponse[] },
  blockId: string,
  iconName: string,
  ctx: RenderContext,
): string {
  if (source.type === "file") {
    const name = fileNameFromUrl(source.file.url)
    return renderLinkCard({
      href: notionBlockUrl(ctx, blockId),
      iconSrc: cardIconSrc(ctx, iconName),
      title: name ?? viewOnNotionLabel(ctx),
      subtitle: name ? viewOnNotionLabel(ctx) : undefined,
      caption: source.caption,
    })
  }
  return renderLinkCard({
    href: source.external.url,
    iconSrc: cardIconSrc(ctx, iconName),
    title: source.external.url,
    caption: source.caption,
  })
}
