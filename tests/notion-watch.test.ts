/**
 * The weekly watch (scripts/notion-watch.mjs) must fail when the email loses any
 * block of the reference page. This builds the reference page in memory from the
 * same block requests scripts/reference-page.mjs sends, shaped like the API's
 * responses, and checks that the watch passes on it and fails when any block,
 * or a mention's text, goes missing.
 */
import { describe, it, expect } from "vitest"
import type {
  ListBlockChildrenResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints"
// @ts-expect-error -- plain JavaScript module without types
import * as reference from "../scripts/reference-page.mjs"
// @ts-expect-error -- plain JavaScript module without types
import { findProblems, visibleLines } from "../scripts/watch-check.mjs"
import { renderNotionEmail } from "../src/render"
import type { ExtraData } from "../src/types/internal"

type Json = Record<string, any>

const PAGE_ID = "10000000-0000-4000-8000-000000000001"
const CHILD_PAGE_ID = "10000000-0000-4000-8000-000000000002"
const DATABASE_ID = "10000000-0000-4000-8000-000000000003"
const USER_ID = "10000000-0000-4000-8000-000000000004"
const TITLES: Record<string, string> = {
  [PAGE_ID]: reference.TITLE,
  [CHILD_PAGE_ID]: reference.CHILD_PAGE,
  [DATABASE_ID]: reference.DATABASE,
}
const notionUrl = (id: string) => `https://www.notion.so/${id.replaceAll("-", "")}`

const annotations = { bold: false, italic: false, strikethrough: false, underline: false, code: false, color: "default" }

/** Rich text request items → response items, as the API fills them in */
function richText(items: Json[]): Json[] {
  return items.map((item) => {
    const base = { ...item, annotations: { ...annotations, ...item.annotations } }
    if (item.type === "text") return { ...base, plain_text: item.text.content, href: item.text.link?.url ?? null }
    if (item.type === "equation") return { ...base, plain_text: item.equation.expression, href: null }
    const mention = item.mention
    if (mention.type === "page" || mention.type === "database") {
      const id = mention[mention.type].id
      return { ...base, plain_text: TITLES[id], href: notionUrl(id) }
    }
    if (mention.type === "user") {
      return { ...base, mention: { type: "user", user: { object: "user", id: USER_ID, name: "Watch Bot" } }, plain_text: "@Watch Bot", href: null }
    }
    return { ...base, plain_text: mention.date.start, href: null }
  })
}

let nextId = 100
const list = (results: Json[]) =>
  ({ object: "list", results, next_cursor: null, has_more: false, type: "block", block: {} }) as unknown as ListBlockChildrenResponse

const childPage = {
  object: "page",
  id: CHILD_PAGE_ID,
  url: notionUrl(CHILD_PAGE_ID),
  public_url: null,
  icon: { type: "emoji", emoji: "📄" },
  cover: null,
  properties: { title: { id: "title", type: "title", title: richText([{ type: "text", text: { content: reference.CHILD_PAGE, link: null } }]) } },
}

/** A block request → the block the API returns, with its children put in extraData */
function toResponse(request: Json, extraData: Json): Json {
  const { children, ...payload } = request[request.type]
  const id = `20000000-0000-4000-8000-${String(nextId++).padStart(12, "0")}`
  for (const key of ["rich_text", "caption"]) if (payload[key]) payload[key] = richText(payload[key])
  if (request.type === "table_row") payload.cells = payload.cells.map(richText)
  if (request.type === "file") payload.name = "dummy.pdf"
  if (request.type.startsWith("heading_")) payload.is_toggleable ??= false
  const block = { object: "block", id, type: request.type, has_children: !!children?.length, in_trash: false, [request.type]: { color: "default", ...payload } }
  if (children?.length) {
    extraData[id] = { type: "page_children", info: list(children.map((child: Json) => toResponse(child, extraData))) }
  }
  if (request.type === "link_to_page") extraData[id] = { type: "page", info: childPage }
  if (request.type === "bookmark") extraData[id] = { type: "bookmark", info: { ogTitle: "Block", requestUrl: payload.url } }
  return block
}

/** The reference page's blocks as the API lists them: the child page and database come first */
function referenceBlocks(extraData: Json): Json[] {
  nextId = 100
  const requests = reference.blocks({ pageId: PAGE_ID, childPageId: CHILD_PAGE_ID, databaseId: DATABASE_ID, userId: USER_ID })
  const childPageBlock = { object: "block", id: CHILD_PAGE_ID, type: "child_page", has_children: false, in_trash: false, child_page: { title: reference.CHILD_PAGE } }
  const databaseBlock = { object: "block", id: DATABASE_ID, type: "child_database", has_children: false, in_trash: false, child_database: { title: reference.DATABASE } }
  extraData[CHILD_PAGE_ID] = { type: "page", info: childPage }
  extraData[DATABASE_ID] = { type: "database", info: { object: "database", id: DATABASE_ID, title: richText([{ type: "text", text: { content: reference.DATABASE, link: null } }]) } }
  return [childPageBlock, databaseBlock, ...requests.map((request: Json) => toResponse(request, extraData))]
}

const page = {
  object: "page",
  id: PAGE_ID,
  url: notionUrl(PAGE_ID),
  public_url: null,
  icon: { type: "icon", icon: { name: "pizza", color: "blue" } },
  cover: { type: "external", external: { url: "https://raw.githubusercontent.com/Sangkwun/notion-to-email/main/assets/preview.png" } },
  properties: { title: { id: "title", type: "title", title: richText([{ type: "text", text: { content: reference.TITLE, link: null } }]) } },
} as unknown as PageObjectResponse

function watch(transform: (blocks: Json[]) => Json[] = (blocks) => blocks): string[] {
  const extraData: Json = {}
  const blocks = transform(referenceBlocks(extraData))
  extraData.page_root_blocks = { type: "page_children", info: list(blocks) }
  const placeholders: string[] = []
  const html = renderNotionEmail(page, list(blocks), extraData as ExtraData, {
    onUnsupportedBlock: (blockType) => {
      placeholders.push(blockType)
      return ""
    },
  })
  return findProblems(html, placeholders, { expectedLines: reference.EXPECTED_LINES, expectedHtml: reference.EXPECTED_HTML })
}

describe("weekly watch on the reference page", () => {
  it("passes when every block renders", () => {
    expect(watch()).toEqual([])
  })

  // A divider has no text to check
  const checked = referenceBlocks({}).map((block, index) => ({ index, type: block.type as string })).filter(({ type }) => type !== "divider")

  it.each(checked)("fails when block $index ($type) is missing", ({ index }) => {
    expect(watch((blocks) => blocks.filter((_, i) => i !== index))).not.toEqual([])
  })

  it.each(["user", "date"])("fails when the %s mention is missing", (type) => {
    const problems = watch((blocks) =>
      blocks.map((block) =>
        block.type === "paragraph"
          ? { ...block, paragraph: { ...block.paragraph, rich_text: block.paragraph.rich_text.filter((item: Json) => item.mention?.type !== type) } }
          : block,
      ),
    )
    expect(problems).not.toEqual([])
  })
})

describe("visibleLines", () => {
  it("puts each block and table cell on its own line", () => {
    expect(visibleLines("<table><tr><td><span>a </span><span>b</span></td><td>c &amp; d</td></tr></table><p>e</p>")).toEqual(["a b", "c & d", "e"])
  })
})
