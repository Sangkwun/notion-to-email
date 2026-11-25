// The checks of the weekly watch (scripts/notion-watch.mjs), kept apart so
// tests/notion-watch.test.ts can run them on a mocked reference page.

const ENTITIES = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" }

// Tags that open or close a block or a table cell. Each becomes a line break, so a block
// that renders nothing can't borrow the text of the block next to it.
const BLOCK_TAG = /<\/?(p|div|td|th|tr|tbody|table|ul|ol|li|section|blockquote|h[1-6])\b[^>]*>|<br\s*\/?>/gi

/** The email's visible text, one line per block or table cell, spaces collapsed */
export function visibleLines(html) {
  return html
    .replace(BLOCK_TAG, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&(amp|lt|gt|quot|#39);/g, (entity) => ENTITIES[entity])
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
}

const describe = (value) => (typeof value === "string" ? JSON.stringify(value) : String(value))

/**
 * Everything the email lost.
 * - expectedLines: [line, count?] — at least `count` (default 1) visible lines must equal the
 *   string or match the regex. Whole lines, so one block's text can't stand in for another's.
 * - expectedHtml: [html, count?] — the HTML must hold the string at least `count` times.
 */
export function findProblems(html, placeholders, { expectedLines, expectedHtml }) {
  const lines = visibleLines(html)
  const problems = placeholders.map((blockType) => `placeholder for block type: ${blockType}`)

  for (const [expected, count = 1] of expectedLines) {
    const found = lines.filter((line) =>
      typeof expected === "string" ? line === expected : expected.test(line),
    ).length
    if (found < count) problems.push(`line ${describe(expected)}: found ${found}, expected ${count}`)
  }
  for (const [expected, count = 1] of expectedHtml) {
    const found = html.split(expected).length - 1
    if (found < count) problems.push(`HTML ${describe(expected)}: found ${found}, expected ${count}`)
  }
  return problems
}
