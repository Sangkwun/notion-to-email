import { describe, it, expect } from "vitest"
import type { RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints"
import { renderRichText } from "../src/richtext"
import { Color } from "../src/constants"
import { mention } from "./fixtures/coverage"

const render = (item: object) => renderRichText(item as RichTextItemResponse, Color.Default)

describe("mentions", () => {
  it("links a page mention's title to its Notion URL", () => {
    const html = render(
      mention({ type: "page", page: { id: "p1" } }, "Project plan", "https://www.notion.so/p1"),
    )
    expect(html).toContain('href="https://www.notion.so/p1"')
    expect(html).toContain(">Project plan</span>")
  })

  it("links a database mention's title to its Notion URL", () => {
    const html = render(
      mention({ type: "database", database: { id: "d1" } }, "Tasks", "https://www.notion.so/d1"),
    )
    expect(html).toContain('href="https://www.notion.so/d1"')
    expect(html).toContain(">Tasks</span>")
  })

  it("shows a link mention's title and links its URL", () => {
    const html = render(
      mention(
        { type: "link_mention", link_mention: { href: "https://github.com/a/b", title: "a/b" } },
        "https://github.com/a/b",
        "https://github.com/a/b",
      ),
    )
    expect(html).toContain('href="https://github.com/a/b"')
    expect(html).toContain(">a/b</span>")
  })

  it("falls back to the URL when a link mention has no title", () => {
    const html = render(
      mention({ type: "link_mention", link_mention: { href: "https://example.com/x" } }, ""),
    )
    expect(html).toContain('href="https://example.com/x"')
    expect(html).toContain(">https://example.com/x</span>")
  })

  it("links a link preview mention", () => {
    const html = render(
      mention({ type: "link_preview", link_preview: { url: "https://figma.com/f" } }, "https://figma.com/f"),
    )
    expect(html).toContain('href="https://figma.com/f"')
    expect(html).toContain(">https://figma.com/f</span>")
  })

  it("draws a custom emoji inline with pixel size", () => {
    const html = render(
      mention({ type: "custom_emoji", custom_emoji: { id: "e1", name: "bufo", url: "https://example.com/bufo.png" } }, ":bufo:"),
    )
    expect(html).toMatch(/^<img [^>]*src="https:\/\/example.com\/bufo.png"/)
    expect(html).toContain('alt=":bufo:"')
    expect(html).toContain('width="16"')
    expect(html).toContain('height="16"')
    expect(html).toContain("display:inline-block")
  })

  it("keeps the link on a linked custom emoji", () => {
    const item = mention({ type: "custom_emoji", custom_emoji: { id: "e1", name: "bufo", url: "https://example.com/bufo.png" } }, ":bufo:", "https://example.com/")
    expect(render(item)).toMatch(/^<a [^>]*href="https:\/\/example.com\/"[^>]*><img /)
  })

  it("shows a template mention's text", () => {
    const html = render(
      mention({ type: "template_mention", template_mention: { type: "template_mention_date", template_mention_date: "today" } }, "@Today"),
    )
    expect(html).toContain(">@Today</span>")
    expect(html).not.toContain("<a ")
  })

  it("shows an unknown mention type's text and link instead of dropping it", () => {
    const html = render(mention({ type: "agent", agent: { id: "a1" } }, "@Helper", "https://www.notion.so/agent"))
    expect(html).toContain('href="https://www.notion.so/agent"')
    expect(html).toContain(">@Helper</span>")
  })

  it("escapes mention text", () => {
    const html = render(mention({ type: "page", page: { id: "p1" } }, "<b>x</b>", "https://www.notion.so/p1"))
    expect(html).toContain("&lt;b&gt;x&lt;/b&gt;")
  })

  it("keeps user and date mentions as before", () => {
    expect(render(mention({ type: "user", user: { object: "user", id: "u1", name: "Alex" } }, "@Alex"))).toContain(">Alex</span>")
    // Noon UTC falls on the same date from UTC-11 to UTC+11, so the server's time zone doesn't matter
    expect(render(mention({ type: "date", date: { start: "2026-11-25T12:00:00.000Z", end: null } }, "Nov 25"))).toContain("November 25, 2026")
  })
})
