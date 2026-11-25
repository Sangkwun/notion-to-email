import type { VideoBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { el, a, img } from "../html"
import { renderCaption } from "./caption"
import { renderMediaCard } from "./link-card"
import type { RenderContext } from "../types/internal"

const YOUTUBE_ID = /^[\w-]{11}$/

/**
 * Video ID from a YouTube URL: youtube.com/watch?v=, youtu.be/, /shorts/, /embed/, /live/
 * (any youtube.com subdomain such as www., m., music., and youtube-nocookie.com).
 */
export function youtubeVideoId(rawUrl: string): string | null {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return null
  }
  const host = url.hostname
  let id: string | null | undefined = null
  if (host === "youtu.be") {
    id = url.pathname.split("/")[1]
  } else if (/(^|\.)youtube(-nocookie)?\.com$/.test(host)) {
    id = url.searchParams.get("v") || url.pathname.match(/^\/(?:shorts|embed|live|v)\/([^/]+)/)?.[1]
  }
  return id && YOUTUBE_ID.test(id) ? id : null
}

export function renderVideo(
  block: VideoBlockObjectResponse,
  ctx: RenderContext,
): string {
  const videoId =
    block.video.type === "external" ? youtubeVideoId(block.video.external.url) : null

  if (block.video.type === "external" && videoId) {
    return el(
      "div",
      { style: { margin: "0.25em 0" } },
      el(
        "div",
        { style: { lineHeight: 0 } },
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
      ),
      renderCaption(block.video.caption),
    )
  }

  return renderMediaCard(block.video, block.id, "playback-play-button", ctx)
}
