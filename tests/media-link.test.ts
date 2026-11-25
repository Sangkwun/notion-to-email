import { describe, it, expect } from "vitest"
import { renderNotionEmail } from "../src/render"
import type { ExtraData } from "../src/types/internal"
import { block, list, page, PAGE_URL, rt } from "./fixtures/coverage"

const BLOCK_ID = "b2000000-0000-4000-8000-000000000001"
const render = (type: string, payload: object) =>
  renderNotionEmail(page, list([block(BLOCK_ID, type, payload)]), {} as ExtraData)

const uploaded = (name: string) => ({
  type: "file",
  file: {
    url: `https://prod-files-secure.s3.us-west-2.amazonaws.com/s/f/${encodeURIComponent(name)}?X-Amz-Expires=3600`,
    expiry_time: "2026-11-25T10:00:00.000Z",
  },
  caption: [],
})

describe("embed, pdf, audio and link_preview blocks", () => {
  it("draws an embed as a link card with its caption", () => {
    const html = render("embed", { url: "https://codepen.io/team/codepen/pen/PNaGbb", caption: [rt("Demo")] })
    expect(html).toContain('href="https://codepen.io/team/codepen/pen/PNaGbb"')
    expect(html).toContain("/icons/globe_gray.png")
    expect(html).toContain(">Demo</span>")
    expect(html).not.toContain("warning.png")
  })

  it("draws nothing for an embed with no URL yet", () => {
    const html = render("embed", { url: "", caption: [] })
    expect(html).not.toContain("globe_gray.png")
    expect(html).not.toContain("warning.png")
  })

  it("draws a link preview as a link card", () => {
    const html = render("link_preview", { url: "https://github.com/makenotion/notion-sdk-js/pull/600" })
    expect(html).toContain('href="https://github.com/makenotion/notion-sdk-js/pull/600"')
    expect(html).toContain("/icons/link_gray.png")
    expect(html).not.toContain("warning.png")
  })

  it("links an uploaded pdf to its block on Notion and shows the file name", () => {
    const html = render("pdf", uploaded("Quarterly report.pdf"))
    expect(html).toContain(`href="${PAGE_URL}#b2000000000040008000000000000001"`)
    expect(html).toContain(">Quarterly report.pdf</p>")
    expect(html).toContain("/icons/document_gray.png")
    expect(html).not.toContain("X-Amz")
  })

  it("links an external pdf to its URL", () => {
    const html = render("pdf", { type: "external", external: { url: "https://arxiv.org/pdf/1706.03762" }, caption: [] })
    expect(html).toContain('href="https://arxiv.org/pdf/1706.03762"')
    expect(html).not.toContain("warning.png")
  })

  it("links an uploaded audio file to its block on Notion", () => {
    const html = render("audio", uploaded("Interview.m4a"))
    expect(html).toContain(`href="${PAGE_URL}#b2000000000040008000000000000001"`)
    expect(html).toContain(">Interview.m4a</p>")
    expect(html).toContain("/icons/headphones_gray.png")
  })

  it("uses the public URL for the Notion link when the page is shared", () => {
    const shared = { ...page, public_url: "https://team.notion.site/Coverage-1a2b" }
    const html = renderNotionEmail(shared, list([block(BLOCK_ID, "pdf", uploaded("a.pdf"))]), {} as ExtraData)
    expect(html).toContain('href="https://team.notion.site/Coverage-1a2b#b2000000000040008000000000000001"')
  })

  it("uses the localized Notion button label on cards", () => {
    const html = renderNotionEmail(page, list([block(BLOCK_ID, "audio", uploaded("a.m4a"))]), {} as ExtraData, {
      header: { notionButtonLabel: "노션에서 보기" },
    })
    expect(html).toContain(">노션에서 보기</p>")
  })
})
