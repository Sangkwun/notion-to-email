import type { BlockObjectResponse, PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { el, img, text } from "../html"
import type { RenderContext } from "../types/internal"
import { notionIconUrl } from "../utils"

const ICON_FILENAME_REGEX = /[^/]+(?=\.[\w]+?$)/

interface IconOptions {
  externalIconSize: number
  emojiIconSize: number
  fileIconSize: number
  block?: BlockObjectResponse
}

type NotionIcon = PageObjectResponse["icon"]

/** Accepts Notion's icon type (emoji | external | file | custom_emoji | icon | null) */
export function renderIconImg(
  icon: NotionIcon,
  ctx: RenderContext,
  options: IconOptions,
): string {
  if (!icon) return ""

  const { externalIconSize, emojiIconSize, fileIconSize, block } = options
  const assetBaseUrl = ctx.assetBaseUrl

  if (icon.type === "external" || icon.type === "icon") {
    let src: string
    if (icon.type === "icon") {
      src = notionIconUrl(assetBaseUrl, icon.icon)
    } else {
      src = icon.external.url
      if (src.includes("https://www.notion.so/icons/")) {
        const match = src.match(ICON_FILENAME_REGEX)
        if (match && match.length > 0) {
          src = `${assetBaseUrl}/icons/${match[0]}.png`
        }
      }
    }
    return img({
      src,
      alt: "icon",
      width: Math.round(externalIconSize),
      height: Math.round(externalIconSize),
      style: {
        width: `${externalIconSize / 16}em`,
        height: `${externalIconSize / 16}em`,
        borderRadius: "0.25em",
      },
    })
  }

  if (icon.type === "emoji") {
    return el(
      "p",
      {
        style: {
          fontSize: `${emojiIconSize / 16}em`,
          padding: "0",
          margin: "0",
          lineHeight: "1",
        },
      },
      text(icon.emoji),
    )
  }

  if (icon.type === "custom_emoji") {
    const customEmoji = icon as { type: "custom_emoji"; custom_emoji: { id: string; name?: string; url?: string } }
    return img({
      src: customEmoji.custom_emoji.url ?? "",
      alt: customEmoji.custom_emoji.name || "custom emoji",
      width: Math.round(emojiIconSize),
      height: Math.round(emojiIconSize),
      style: {
        width: `${emojiIconSize / 16}em`,
        height: `${emojiIconSize / 16}em`,
        borderRadius: "0.25em",
      },
    })
  }

  if (icon.type === "file") {
    const imageUrl = ctx.resolveImageUrl(icon.file.url, {
      blockId: block?.id ?? ctx.page.id,
      blockType: "icon",
      pageId: ctx.page.id,
      isPublicPage: ctx.isPublicPage,
      usage: "icon",
    })
    return img({
      src: imageUrl,
      alt: "image",
      width: Math.round(fileIconSize),
      height: Math.round(fileIconSize),
      style: {
        borderRadius: "0.25em",
        objectFit: "cover",
        objectPosition: "center",
        width: `${fileIconSize / 16}em`,
        height: `${fileIconSize / 16}em`,
      },
    })
  }

  return ""
}
