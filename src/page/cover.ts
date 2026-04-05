import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { el, img } from "../html"
import { renderIconImg } from "../blocks/icon-img"
import type { RenderContext } from "../types/internal"

type NotionCover = PageObjectResponse["cover"]
type NotionIcon = PageObjectResponse["icon"]

export function renderCoverImage(
  cover: NotionCover,
  ctx: RenderContext,
): string {
  if (!cover) return ""

  if (cover.type === "external" && cover.external?.url) {
    return img({
      src: cover.external.url,
      alt: "Cover",
      width: "100%",
      style: {
        maxHeight: "12.5em",
        objectFit: "cover",
        objectPosition: "center",
      },
    })
  }

  if (cover.type === "file" && cover.file?.url) {
    const imageUrl = ctx.resolveImageUrl(cover.file.url, {
      blockId: ctx.page.id,
      blockType: "cover",
      pageId: ctx.page.id,
      isPublicPage: ctx.isPublicPage,
      usage: "cover",
    })
    return img({
      src: imageUrl,
      alt: "Cover",
      width: "100%",
      style: {
        maxHeight: "16.0625em",
        objectFit: "cover",
        objectPosition: "center",
      },
    })
  }

  return ""
}

function getIconOverlapSize(icon: NotionIcon): number {
  if (!icon) return 0
  if (icon.type === "external") return 0.75
  if (icon.type === "emoji" || icon.type === "custom_emoji") return 1.4625
  if (icon.type === "file") return 2.331
  return 0
}

function getCoverHeight(cover: NotionCover): number {
  if (!cover) return 0
  if (cover.type === "external") return 12.5
  return 16.0625
}

export function renderCoverWithIcon(
  cover: NotionCover,
  icon: NotionIcon,
  ctx: RenderContext,
): string {
  if (cover && !icon) {
    return renderCoverImage(cover, ctx)
  }

  if (!cover && icon) {
    return renderIconImg(icon, ctx, {
      externalIconSize: 40,
      emojiIconSize: 78,
      fileIconSize: 124.32,
    })
  }

  if (cover && icon) {
    const coverHeight = getCoverHeight(cover)
    const overlapSize = getIconOverlapSize(icon)
    const wrapperHeight = `${coverHeight - overlapSize}em`

    return el(
      "div",
      {},
      el(
        "div",
        { style: { height: wrapperHeight, overflow: "visible" } },
        renderCoverImage(cover, ctx),
      ),
      el(
        "div",
        { style: { paddingLeft: "0.625em" } },
        renderIconImg(icon, ctx, {
          externalIconSize: 40,
          emojiIconSize: 78,
          fileIconSize: 124.32,
        }),
      ),
    )
  }

  return ""
}
