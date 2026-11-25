import { describe, it, expect } from "vitest"
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { renderNotionEmail } from "../src/render"
import { extractPageIcon } from "../src/utils"
import type { ExtraData } from "../src/types/internal"
import { block, list, page, rt } from "./fixtures/coverage"

// Since 2026-03-25 the API returns native Notion icons as { type: "icon", icon: { name, color } }
// on every API version, with no URL (https://developers.notion.com/reference/emoji-and-icon#icon).

const render = (results: object[], extraData = {} as ExtraData, p = page) =>
  renderNotionEmail(p, list(results), extraData)

describe("native Notion icons", () => {
  it("draws the page header icon from the PNG copy of Notion's icon set", () => {
    const html = render([])
    expect(html).toContain('src="https://notionto.email/icons/pizza_blue.png"')
    expect(html).toMatch(/<img [^>]*pizza_blue\.png" alt="icon" width="40" height="40"/)
  })

  it("draws a callout icon", () => {
    const html = render([
      block("c1", "callout", {
        rich_text: [rt("tip")],
        color: "default",
        icon: { type: "icon", icon: { name: "light-bulb", color: "yellow" } },
      }),
    ])
    expect(html).toMatch(/<img [^>]*light-bulb_yellow\.png" alt="icon" width="24" height="24"/)
  })

  it("draws a child page's icon", () => {
    const child = { ...page, id: "child", icon: { type: "icon", icon: { name: "document", color: "lightgray" } } }
    const html = render(
      [block("cp", "child_page", { title: "Child" })],
      { cp: { type: "page", info: child } } as unknown as ExtraData,
    )
    expect(html).toMatch(/<img [^>]*document_lightgray\.png" alt="icon" width="20" height="20"/)
  })

  it("uses gray when the icon has no color", () => {
    const p = { ...page, icon: { type: "icon", icon: { name: "pizza" } } } as unknown as PageObjectResponse
    expect(render([], {} as ExtraData, p)).toContain("/icons/pizza_gray.png")
  })

  it("keeps name and color inside the file name", () => {
    const p = { ...page, icon: { type: "icon", icon: { name: "a/../b", color: "gray?x#y" } } } as unknown as PageObjectResponse
    expect(extractPageIcon(p)).toBe("https://notionto.email/icons/a%2F..%2Fb_gray%3Fx%23y.png")
  })

  it("returns the icon URL from extractPageIcon", () => {
    expect(extractPageIcon(page)).toBe("https://notionto.email/icons/pizza_blue.png")
  })
})
