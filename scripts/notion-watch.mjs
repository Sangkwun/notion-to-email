// Weekly watch: render the reference Notion page through the real API and fail when
// the email loses content. scripts/reference-page.mjs builds the page and lists what
// must come out of it.
//
//   npm run build
//   NOTION_TOKEN=... REFERENCE_PAGE_ID=... node scripts/notion-watch.mjs
//
// Fails when rendering throws, when any block falls back to the "not supported"
// placeholder, or when an expected line or HTML string is missing from the email
// (see scripts/watch-check.mjs).

import { renderFromNotion } from "../dist/index.js"
import { EXPECTED_HTML, EXPECTED_LINES } from "./reference-page.mjs"
import { findProblems } from "./watch-check.mjs"

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

const problems = findProblems(html, placeholders, {
  expectedLines: EXPECTED_LINES,
  expectedHtml: EXPECTED_HTML,
})

if (problems.length > 0) {
  console.error(`The reference page lost content in the email (${problems.length}):`)
  for (const problem of problems) console.error(`- ${problem}`)
  process.exit(1)
}

console.log(
  `OK: ${EXPECTED_LINES.length} lines and ${EXPECTED_HTML.length} HTML strings found, no placeholders (${(html.length / 1024).toFixed(1)} KB)`,
)
