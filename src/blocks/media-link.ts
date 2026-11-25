import type {
  AudioBlockObjectResponse,
  EmbedBlockObjectResponse,
  LinkPreviewBlockObjectResponse,
  PdfBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints"
import { cardIconSrc, renderLinkCard, renderMediaCard } from "./link-card"
import type { RenderContext } from "../types/internal"

/** Embeds and link previews can't run in email; link to what they show */
export function renderEmbed(
  block: EmbedBlockObjectResponse | LinkPreviewBlockObjectResponse,
  ctx: RenderContext,
): string {
  if (block.type === "embed") {
    return renderLinkCard({
      href: block.embed.url,
      iconSrc: cardIconSrc(ctx, "globe"),
      title: block.embed.url,
      caption: block.embed.caption,
    })
  }
  return renderLinkCard({
    href: block.link_preview.url,
    iconSrc: cardIconSrc(ctx, "link"),
    title: block.link_preview.url,
  })
}

export function renderPdf(block: PdfBlockObjectResponse, ctx: RenderContext): string {
  return renderMediaCard(block.pdf, block.id, "document", ctx)
}

export function renderAudio(block: AudioBlockObjectResponse, ctx: RenderContext): string {
  return renderMediaCard(block.audio, block.id, "headphones", ctx)
}
