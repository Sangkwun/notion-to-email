// Weekly watch: render the reference Notion page through the real API and fail when
// the email loses content. scripts/reference-page.mjs builds the page and lists what
// must come out of it.
//
//   npm run build
//   NOTION_TOKEN=... REFERENCE_PAGE_ID=... node scripts/notion-watch.mjs
//
// Fails when rendering throws, when any block falls back to the "not supported"
// placeholder, or when expected text or HTML is missing from the email.

import { renderFromNotion } from "../dist/index.js"
import { EXPECTED_HTML, EXPECTED_TEXT } from "./reference-page.mjs"

const token = process.env.NOTION_TOKEN
const pageId = process.env.REFERENCE_PAGE_ID
if (!token || !pageId) {
  console.error("Set NOTION_TOKEN and REFERENCE_PAGE_ID")
  process.exit(1)
}

const placeholders = []
const { html } = await renderFromNotion({
  pageId,
  token,
  options: {
    onUnsupportedBlock: (blockType) => {
      placeholders.push(blockType)
      return ""
    },
  },
})

const ENTITIES = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" }
const visibleText = html
  .replace(/<[^>]+>/g, "")
  .replace(/&(amp|lt|gt|quot|#39);/g, (entity) => ENTITIES[entity])
  .replace(/\s+/g, " ")

const missingText = EXPECTED_TEXT.filter((expected) =>
  typeof expected === "string" ? !visibleText.includes(expected) : !expected.test(visibleText),
)
const missingHtml = EXPECTED_HTML.filter((expected) => !html.includes(expected))

const problems = [
  ...placeholders.map((blockType) => `placeholder for block type: ${blockType}`),
  ...missingText.map((expected) => `missing text: ${expected}`),
  ...missingHtml.map((expected) => `missing HTML: ${expected}`),
]

if (problems.length > 0) {
  console.error(`The reference page lost content in the email (${problems.length}):`)
  for (const problem of problems) console.error(`- ${problem}`)
  process.exit(1)
}

console.log(
  `OK: ${EXPECTED_TEXT.length} texts and ${EXPECTED_HTML.length} HTML strings found, no placeholders (${(html.length / 1024).toFixed(1)} KB)`,
)
