import { describe, it, expect } from "vitest"
import { renderNotionEmail } from "../src/render"
import type { ExtraData } from "../src/types/internal"
import { block, extraData, ids, list, page } from "./fixtures/coverage"

const tab = block(ids.tab, "tab", {}, true)

describe("tab block", () => {
  const html = renderNotionEmail(page, list([tab]), extraData)

  it("draws every tab's label and content in order", () => {
    const order = ["Overview", "Content of the first tab.", "Details", "Second tab, first point", "Second tab, second point"]
    const positions = order.map((s) => html.indexOf(`>${s}</span>`))
    for (const p of positions) expect(p).toBeGreaterThan(-1)
    expect([...positions].sort((a, b) => a - b)).toEqual(positions)
  })

  it("draws tab icons", () => {
    expect(html).toContain("📋")
    expect(html).toMatch(/<img [^>]*document_gray\.png" alt="icon" width="20" height="20"/)
  })

  it("does not show a placeholder", () => {
    expect(html).not.toContain("warning.png")
  })

  it("draws nothing for an empty tab block", () => {
    expect(renderNotionEmail(page, list([block(ids.tab, "tab", {}, false)]), {} as ExtraData)).not.toContain("warning.png")
  })

  it("links a tab whose content was not fetched instead of dropping it", () => {
    const { [ids.tabDetails]: _, ...partial } = extraData
    const html = renderNotionEmail(page, list([tab]), partial as ExtraData)
    expect(html).toContain(">Details</span>")
    expect(html).toContain(`#${ids.tabDetails.replaceAll("-", "")}"`)
    expect(html).toContain(">View on Notion</p>")
  })

  it("falls back to the placeholder when the tab's children were not fetched", () => {
    const bare = renderNotionEmail(page, list([tab]), {} as ExtraData)
    expect(bare).toContain("warning.png")
    expect(bare).toContain("tab View on Notion")
  })
})
