import { describe, it, expect } from "vitest"
import { renderNotionEmail } from "../src/render"
import type { ExtraData } from "../src/types/internal"
import { block, list, mention, page, rt } from "./fixtures/coverage"

const render = (richText: object[]) =>
  renderNotionEmail(page, list([block("t1", "toggle", { rich_text: richText, color: "default" })]), {} as ExtraData)

const anchorsNest = (html: string) => {
  let depth = 0
  for (const tag of html.match(/<\/?a\b/g) ?? []) {
    depth += tag === "<a" ? 1 : -1
    if (depth > 1) return true
  }
  return false
}

describe("toggle label", () => {
  it("links a plain label to Notion", () => {
    const html = render([rt("Plain")])
    expect(html).toMatch(/<a [^>]*href="https:\/\/www.notion.so\/Coverage-fixture-[^"]*"[^>]*><span[^>]*>Plain<\/span><\/a>/)
  })

  it("does not nest a page mention's link inside the toggle's link", () => {
    const html = render([
      rt("See "),
      mention({ type: "page", page: { id: "p1" } }, "Project plan", "https://www.notion.so/p1"),
      rt(" first"),
    ])
    expect(anchorsNest(html)).toBe(false)
    expect(html).toContain('href="https://www.notion.so/p1"')
    expect(html).toContain("> first</span>")
  })

  it("does not nest a text link inside the toggle's link", () => {
    expect(anchorsNest(render([rt("Docs", "https://example.com/docs")]))).toBe(false)
  })
})
