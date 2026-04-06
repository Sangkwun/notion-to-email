import type { ImageBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { el, img } from "../html"
import { renderCaption } from "./caption"
import { renderNotSupported, NotSupportedType } from "./not-supported"
import type { RenderContext } from "../types/internal"

export function renderImage(
  block: ImageBlockObjectResponse,
  ctx: RenderContext,
): string {
  // Skip empty image placeholders (no image selected in Notion)
  if (block.image.type === "external" && !block.image.external.url) return ""
  if (block.image.type === "file" && !block.image.file?.url) return ""

  if (block.image.type === "external") {
    if (block.image.external.url.includes(".svg")) {
      return renderNotSupported(NotSupportedType.SVG_IMAGE, ctx)
    }
    return el(
      "div",
      { style: { margin: "0.25em 0" } },
      el("div", { style: { lineHeight: 0 } },
        img({
          src: block.image.external.url,
          alt: "image",
          width: "100%",
          height: "auto",
        }),
      ),
      renderCaption(block.image.caption),
    )
  }

  if (block.image.file?.url.includes(".svg")) {
    return renderNotSupported(NotSupportedType.SVG_IMAGE, ctx)
  }

  const imageUrl = ctx.resolveImageUrl(block.image.file.url, {
    blockId: block.id,
    blockType: "image",
    pageId: ctx.page.id,
    isPublicPage: ctx.isPublicPage,
    usage: "image",
  })

  return el(
    "div",
    { style: { margin: "0.25em 0" } },
    el("div", { style: { lineHeight: 0 } },
      img({
        src: imageUrl,
        alt: "image",
        width: "100%",
        height: "auto",
        style: {
          objectFit: "cover",
          objectPosition: "center",
        },
      }),
    ),
    renderCaption(block.image.caption),
  )
}
