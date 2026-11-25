import { describe, it, expect } from "vitest"
import { renderNotionEmail } from "../src/render"
import { youtubeVideoId } from "../src/blocks/video"
import type { ExtraData } from "../src/types/internal"
import { block, list, page, PAGE_URL } from "./fixtures/coverage"

const ID = "aqz-KE-bpKQ"
const render = (payload: object, id = "b1000000-0000-4000-8000-000000000001") =>
  renderNotionEmail(page, list([block(id, "video", { caption: [], ...payload })]), {} as ExtraData)

describe("youtubeVideoId", () => {
  it.each([
    `https://www.youtube.com/watch?v=${ID}`,
    `https://youtube.com/watch?v=${ID}&t=42s`,
    `https://m.youtube.com/watch?v=${ID}`,
    `https://youtu.be/${ID}`,
    `https://youtu.be/${ID}?si=abc`,
    `https://www.youtube.com/shorts/${ID}`,
    `https://www.youtube.com/embed/${ID}?start=10`,
    `https://www.youtube-nocookie.com/embed/${ID}`,
    `https://www.youtube.com/live/${ID}`,
    `https://music.youtube.com/watch?v=${ID}`,
    `https://www.youtube.com/embed/${ID}?v=`,
  ])("finds the ID in %s", (url) => {
    expect(youtubeVideoId(url)).toBe(ID)
  })

  it.each([
    "https://vimeo.com/76979871",
    "https://www.youtube.com/@BlenderOfficial",
    "https://www.youtube.com/playlist?list=PL123",
    "https://youtu.be/",
    `https://notyoutube.com/watch?v=${ID}`,
    "not a url",
  ])("returns null for %s", (url) => {
    expect(youtubeVideoId(url)).toBeNull()
  })
})

describe("video block", () => {
  it.each(["https://youtu.be/", "https://www.youtube.com/shorts/", "https://www.youtube.com/embed/"])(
    "draws a thumbnail for %s URLs",
    (prefix) => {
      const html = render({ type: "external", external: { url: `${prefix}${ID}` } })
      expect(html).toContain(`src="https://i.ytimg.com/vi/${ID}/hqdefault.jpg"`)
      expect(html).not.toContain("warning.png")
    },
  )

  it("draws other external videos as a link card with a play icon", () => {
    const html = render({ type: "external", external: { url: "https://vimeo.com/76979871" } })
    expect(html).toContain('href="https://vimeo.com/76979871"')
    expect(html).toContain("/icons/playback-play-button_gray.png")
    expect(html).toContain(">https://vimeo.com/76979871</p>")
    expect(html).not.toContain("warning.png")
  })

  it("links an uploaded video to its block on Notion, not to the expiring file URL", () => {
    const html = render({
      type: "file",
      file: {
        url: "https://prod-files-secure.s3.us-west-2.amazonaws.com/s/f/Product%20demo.mp4?X-Amz-Expires=3600",
        expiry_time: "2026-11-25T10:00:00.000Z",
      },
    })
    expect(html).toContain(`href="${PAGE_URL}#b1000000000040008000000000000001"`)
    expect(html).toContain(">Product demo.mp4</p>")
    expect(html).toContain(">View on Notion</p>")
    expect(html).not.toContain("X-Amz")
  })

  it("never shows the signed file URL when the file name can't be read", () => {
    const html = render({
      type: "file",
      file: { url: "https://prod-files-secure.s3.us-west-2.amazonaws.com/s/f/100%_report.mp4?X-Amz-Signature=abc", expiry_time: "" },
    })
    expect(html).not.toContain("X-Amz")
    expect(html).toContain(">View on Notion</p>")
  })

  it("draws nothing for a video block with no URL yet", () => {
    const html = render({ type: "external", external: { url: "" } })
    expect(html).not.toContain("playback-play-button")
    expect(html).not.toContain("warning.png")
  })

  it("puts the card's links inside the table cells for Outlook", () => {
    const html = render({ type: "external", external: { url: "https://vimeo.com/76979871" } })
    expect(html).not.toMatch(/<a [^>]*><table/)
    expect(html.match(/<a [^>]*href="https:\/\/vimeo.com\/76979871"/g)).toHaveLength(2)
  })

  it("renders the caption", () => {
    const html = render({
      type: "external",
      external: { url: `https://youtu.be/${ID}` },
      caption: [{ type: "text", text: { content: "Trailer", link: null }, annotations: { bold: false, italic: false, strikethrough: false, underline: false, code: false, color: "default" }, plain_text: "Trailer", href: null }],
    })
    expect(html).toContain(">Trailer</span>")
  })
})
