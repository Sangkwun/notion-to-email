import { describe, it, expect, vi } from "vitest"
import { renderNotionEmail } from "../src/render"
import type { ExtraData } from "../src/types/internal"
import { block, extraData, ids, list, page, PAGE_URL, rt } from "./fixtures/coverage"

const meeting = (type: "transcription" | "meeting_notes", children: object = {
  summary_block_id: ids.summary,
  notes_block_id: ids.notes,
  transcript_block_id: ids.transcript,
}) =>
  block(ids.transcription, type, {
    title: [rt("Weekly sync")],
    status: "notes_ready",
    children,
    calendar_event: { start_time: "2026-11-20T01:00:00.000Z", end_time: "2026-11-20T01:30:00.000Z" },
  }, true)

describe("meeting notes block", () => {
  it.each(["transcription", "meeting_notes"] as const)("draws %s with title, summary, notes and a Notion link", (type) => {
    const html = renderNotionEmail(page, list([meeting(type)]), extraData)
    expect(html).toContain(">Weekly sync</span>")
    expect(html).toContain(`href="${PAGE_URL}#${ids.transcription.replaceAll("-", "")}"`)
    expect(html).toContain(">Summary</p>")
    expect(html).toContain(">We agreed to ship the renderer fixes this week.</span>")
    expect(html).toContain(">Notes</p>")
    expect(html).toContain(">Send the approval page</span>")
    expect(html).not.toContain("warning.png")
    expect(html.indexOf(">Summary</p>")).toBeLessThan(html.indexOf(">Notes</p>"))
  })

  it("uses custom section labels", () => {
    const html = renderNotionEmail(page, list([meeting("transcription")]), extraData, {
      labels: { meetingSummary: "요약", meetingNotes: "메모" },
    })
    expect(html).toContain(">요약</p>")
    expect(html).toContain(">메모</p>")
  })

  it("leaves out a section that was not fetched and keeps the link", () => {
    const { [ids.notes]: _, ...partial } = extraData
    const html = renderNotionEmail(page, list([meeting("transcription")]), partial as ExtraData)
    expect(html).toContain(">Summary</p>")
    expect(html).not.toContain(">Notes</p>")
    expect(html).toContain(">View on Notion</p>")
  })

  it("leaves out a section that renders nothing", () => {
    const hidden = { ...extraData, [ids.notes]: { type: "page_children", info: list([{ object: "block", id: "partial" }]) } }
    const html = renderNotionEmail(page, list([meeting("transcription")]), hidden as ExtraData)
    expect(html).not.toContain(">Notes</p>")
  })

  it("links to the block on Notion when the sections were not fetched", () => {
    const html = renderNotionEmail(page, list([meeting("meeting_notes")]), {} as ExtraData)
    expect(html).toContain(">Weekly sync</span>")
    expect(html).toContain(`href="${PAGE_URL}#${ids.transcription.replaceAll("-", "")}"`)
    expect(html).toContain(">View on Notion</p>")
    expect(html).not.toContain(">Summary</p>")
  })

  it("names an untitled meeting", () => {
    const html = renderNotionEmail(page, list([block("m", "meeting_notes", {}, false)]), {} as ExtraData)
    expect(html).toContain(">Meeting notes</div>")
  })
})

const notionMock = vi.hoisted(() => ({
  childrenList: vi.fn(),
  pagesRetrieve: vi.fn(),
}))

vi.mock("@notionhq/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@notionhq/client")>()
  return {
    ...actual,
    Client: class {
      pages = { retrieve: notionMock.pagesRetrieve }
      blocks = { children: { list: notionMock.childrenList } }
      databases = { retrieve: vi.fn() }
    },
  }
})

describe("renderFromNotion with meeting notes", () => {
  it("fetches the summary and notes sections but not the transcript", async () => {
    const { renderFromNotion } = await import("../src/render")
    const byId: Record<string, object[]> = {
      [page.id]: [meeting("transcription")],
      [ids.summary]: [block("s-p", "paragraph", { rich_text: [rt("Summary text")], color: "default", icon: null })],
      [ids.notes]: [block("n-p", "paragraph", { rich_text: [rt("Notes text")], color: "default", icon: null })],
    }
    notionMock.pagesRetrieve.mockResolvedValue(page)
    notionMock.childrenList.mockImplementation(async ({ block_id }: { block_id: string }) => {
      if (!(block_id in byId)) throw new Error(`unexpected fetch of ${block_id}`)
      return list(byId[block_id]!)
    })

    const { html } = await renderFromNotion({ pageId: page.id, token: "test" })

    const fetched = notionMock.childrenList.mock.calls.map(([args]) => args.block_id)
    expect(fetched.sort()).toEqual([page.id, ids.summary, ids.notes].sort())
    expect(html).toContain(">Summary text</span>")
    expect(html).toContain(">Notes text</span>")
  })
})
