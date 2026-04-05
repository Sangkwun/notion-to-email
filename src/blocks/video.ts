import type { VideoBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { el, a, img } from "../html"
import { renderNotSupported, NotSupportedType } from "./not-supported"
import type { RenderContext } from "../types/internal"

export function renderVideo(
  block: VideoBlockObjectResponse,
  ctx: RenderContext,
): string {
  if (block.video.type === "external") {
    try {
      const url = new URL(block.video.external.url)
      if (url.origin.includes("youtube.com")) {
        const videoId = url.searchParams.get("v")
        if (videoId) {
          return el(
            "div",
            { style: { margin: "0.25em 0", lineHeight: 0 } },
            a(
              { href: block.video.external.url },
              img({
                src: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
                alt: "image",
                width: "100%",
                height: "auto",
                style: {
                  objectFit: "cover",
                  objectPosition: "center",
                },
              }),
            ),
          )
        }
      }
    } catch {
      // fall through to not supported
    }
  }
  return renderNotSupported(NotSupportedType.NOT_SUPPORTED, ctx, block.type)
}
