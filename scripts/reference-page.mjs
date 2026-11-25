// The reference Notion page that the weekly watch (scripts/notion-watch.mjs) renders.
//
// Build it once under a page the integration can edit:
//   NOTION_TOKEN=... node scripts/reference-page.mjs <parent page id>
// then put the printed page ID in .github/workflows/notion-watch.yml.
//
// The page holds every block, mention and icon shape the API can create.
// Left out, with the reason:
// - tab, meeting_notes / transcription, link_mention, link_preview, template_mention:
//   the API can't create them.
//   tests/fixtures/coverage.ts covers how they render.
// - breadcrumb, template, unsupported: the renderer draws a placeholder for them on purpose.
// - Files uploaded to Notion: external URLs cover the same block types.

import { Client } from "@notionhq/client"

const TITLE = "notion-to-email watch reference"
const CHILD_PAGE = "WATCH child page"
const DATABASE = "WATCH database"

/**
 * Text that must appear in the rendered email once tags are removed.
 * A block that renders to nothing, or a mention that loses its text, fails the watch.
 */
export const EXPECTED_TEXT = [
  "WATCH heading 1",
  "WATCH heading 2",
  "WATCH heading 3",
  "WATCH heading 4",
  // A toggle heading links to Notion instead of drawing its content, on purpose
  "WATCH toggle heading",
  "WATCH paragraph bold italic code colored link",
  "WATCH mention-page " + TITLE,
  "WATCH mention-child-page " + CHILD_PAGE,
  "WATCH mention-database " + DATABASE,
  /WATCH mention-user @\S/,
  /WATCH mention-date \S/,
  "WATCH bullet",
  "WATCH bullet child",
  "WATCH numbered one",
  "WATCH numbered two",
  "WATCH numbered child",
  "WATCH todo done",
  "WATCH todo open",
  "WATCH toggle",
  "WATCH toggle child",
  "WATCH quote",
  "WATCH quote child",
  "WATCH callout emoji",
  "WATCH callout icon",
  "WATCH callout child",
  "WATCH code",
  "WATCH code caption",
  "WATCH table header",
  "WATCH table cell",
  "WATCH column one",
  "WATCH column two",
  "WATCH synced",
  "WATCH bookmark caption",
  "WATCH embed caption",
  "WATCH image caption",
  "WATCH video youtube watch",
  "WATCH video youtu.be",
  "WATCH video shorts",
  "WATCH video vimeo",
  "WATCH video file",
  "WATCH pdf caption",
  "WATCH audio caption",
  CHILD_PAGE,
  DATABASE,
]

/** Strings that must appear in the rendered HTML itself */
export const EXPECTED_HTML = [
  // Native Notion icons on the page and on a callout
  "/icons/pizza_blue.png",
  "/icons/light-bulb_yellow.png",
  // External file block links to the file
  "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf?watch=file",
]

const rt = (content, annotations = {}, link = null) => ({
  type: "text",
  text: { content, link: link ? { url: link } : null },
  annotations,
})
const mention = (value) => ({ type: "mention", mention: value })
const text = (content) => [rt(content)]
const block = (type, payload) => ({ type, [type]: payload })
const p = (content, children) => block("paragraph", { rich_text: text(content), ...(children && { children }) })
const media = (type, url, caption) => block(type, { type: "external", external: { url }, caption: text(caption) })

function blocks({ pageId, childPageId, databaseId, userId }) {
  return [
    block("heading_1", { rich_text: text("WATCH heading 1") }),
    block("heading_2", { rich_text: text("WATCH heading 2") }),
    block("heading_3", { rich_text: text("WATCH heading 3") }),
    block("heading_4", { rich_text: text("WATCH heading 4") }),
    block("heading_2", {
      rich_text: text("WATCH toggle heading"),
      is_toggleable: true,
      children: [p("WATCH toggle heading child")],
    }),
    block("table_of_contents", {}),
    block("paragraph", {
      rich_text: [
        rt("WATCH paragraph "),
        rt("bold", { bold: true }),
        rt(" "),
        rt("italic", { italic: true }),
        rt(" "),
        rt("code", { code: true }),
        rt(" "),
        rt("colored", { color: "red_background" }),
        rt(" "),
        rt("link", {}, "https://developers.notion.com"),
        rt(" "),
        { type: "equation", equation: { expression: "e^{i\\pi}+1=0" } },
      ],
    }),
    block("paragraph", { rich_text: [rt("WATCH mention-page "), mention({ type: "page", page: { id: pageId } })] }),
    block("paragraph", {
      rich_text: [rt("WATCH mention-child-page "), mention({ type: "page", page: { id: childPageId } })],
    }),
    block("paragraph", {
      rich_text: [rt("WATCH mention-database "), mention({ type: "database", database: { id: databaseId } })],
    }),
    block("paragraph", { rich_text: [rt("WATCH mention-user "), mention({ type: "user", user: { id: userId } })] }),
    block("paragraph", {
      rich_text: [
        rt("WATCH mention-date "),
        mention({ type: "date", date: { start: "2026-01-15T09:00:00.000+09:00", end: "2026-01-16" } }),
      ],
    }),
    block("bulleted_list_item", { rich_text: text("WATCH bullet"), children: [block("bulleted_list_item", { rich_text: text("WATCH bullet child") })] }),
    block("numbered_list_item", { rich_text: text("WATCH numbered one") }),
    block("numbered_list_item", {
      rich_text: text("WATCH numbered two"),
      children: [block("numbered_list_item", { rich_text: text("WATCH numbered child") })],
    }),
    block("to_do", { rich_text: text("WATCH todo done"), checked: true }),
    block("to_do", { rich_text: text("WATCH todo open"), checked: false }),
    block("toggle", { rich_text: text("WATCH toggle"), children: [p("WATCH toggle child")] }),
    block("quote", { rich_text: text("WATCH quote"), children: [p("WATCH quote child")] }),
    block("callout", { rich_text: text("WATCH callout emoji"), icon: { type: "emoji", emoji: "💡" }, color: "gray_background" }),
    block("callout", {
      rich_text: text("WATCH callout icon"),
      icon: { type: "icon", icon: { name: "light-bulb", color: "yellow" } },
      children: [p("WATCH callout child")],
    }),
    block("divider", {}),
    block("code", { rich_text: text("const watch = 'WATCH code'"), language: "javascript", caption: text("WATCH code caption") }),
    block("equation", { expression: "\\int_0^1 x^2\\,dx = \\frac{1}{3}" }),
    block("table", {
      table_width: 2,
      has_column_header: true,
      has_row_header: false,
      children: [
        block("table_row", { cells: [text("WATCH table header"), text("B")] }),
        block("table_row", { cells: [text("WATCH table cell"), text("2")] }),
      ],
    }),
    block("column_list", {
      children: [
        block("column", { children: [p("WATCH column one")] }),
        block("column", { children: [p("WATCH column two")] }),
      ],
    }),
    block("synced_block", { synced_from: null, children: [p("WATCH synced")] }),
    block("bookmark", { url: "https://developers.notion.com/reference/block", caption: text("WATCH bookmark caption") }),
    block("embed", { url: "https://www.openstreetmap.org/export/embed.html?bbox=126.97,37.56,126.99,37.58", caption: text("WATCH embed caption") }),
    media("image", "https://raw.githubusercontent.com/Sangkwun/notion-to-email/main/assets/preview.png", "WATCH image caption"),
    media("video", "https://www.youtube.com/watch?v=jNQXAC9IVRw", "WATCH video youtube watch"),
    media("video", "https://youtu.be/jNQXAC9IVRw", "WATCH video youtu.be"),
    media("video", "https://www.youtube.com/shorts/jNQXAC9IVRw", "WATCH video shorts"),
    media("video", "https://vimeo.com/76979871", "WATCH video vimeo"),
    media("video", "https://download.samplelib.com/mp4/sample-5s.mp4", "WATCH video file"),
    media("pdf", "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", "WATCH pdf caption"),
    media("audio", "https://download.samplelib.com/mp3/sample-3s.mp3", "WATCH audio caption"),
    media("file", "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf?watch=file", "WATCH file caption"),
    block("link_to_page", { type: "page_id", page_id: childPageId }),
  ]
}

async function main() {
  const parentId = process.argv[2]
  const token = process.env.NOTION_TOKEN
  if (!parentId || !token) {
    console.error("Usage: NOTION_TOKEN=... node scripts/reference-page.mjs <parent page id>")
    process.exit(1)
  }
  const notion = new Client({ auth: token })

  const page = await notion.pages.create({
    parent: { page_id: parentId },
    icon: { type: "icon", icon: { name: "pizza", color: "blue" } },
    cover: { type: "external", external: { url: "https://raw.githubusercontent.com/Sangkwun/notion-to-email/main/assets/preview.png" } },
    properties: { title: { title: text(TITLE) } },
  })
  try {
    const childPage = await notion.pages.create({
      parent: { page_id: page.id },
      icon: { type: "emoji", emoji: "📄" },
      properties: { title: { title: text(CHILD_PAGE) } },
    })
    const database = await notion.databases.create({
      parent: { type: "page_id", page_id: page.id },
      title: text(DATABASE),
      is_inline: true,
      initial_data_source: { properties: { Name: { title: {} } } },
    })
    const me = await notion.users.me({})

    await notion.blocks.children.append({
      block_id: page.id,
      children: blocks({ pageId: page.id, childPageId: childPage.id, databaseId: database.id, userId: me.id }),
    })
  } catch (error) {
    // Leave no half-built page behind
    await notion.pages.update({ page_id: page.id, in_trash: true })
    throw error
  }

  console.log(page.id)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
