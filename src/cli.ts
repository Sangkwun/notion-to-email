#!/usr/bin/env node

import { parseArgs } from "node:util"
import { writeFile } from "node:fs/promises"
import { renderFromNotion } from "./render"

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    token: { type: "string", short: "t" },
    output: { type: "string", short: "o" },
    help: { type: "boolean", short: "h" },
  },
})

if (values.help || positionals.length === 0) {
  console.log(`Usage: notion-to-email <page-id> [options]

Arguments:
  page-id              Notion page ID or URL

Options:
  -t, --token <token>  Notion API token (or set NOTION_TOKEN env var)
  -o, --output <file>  Write HTML to file instead of stdout
  -h, --help           Show this help message

Examples:
  notion-to-email abc123 --token secret_xxx
  NOTION_TOKEN=secret_xxx notion-to-email abc123
  notion-to-email abc123 -o email.html
  notion-to-email https://notion.so/My-Page-abc123`)
  process.exit(0)
}

async function main() {
  const input = positionals[0]!
  const token = values.token || process.env.NOTION_TOKEN

  if (!token) {
    console.error("Error: No Notion token provided. Use --token or set NOTION_TOKEN env var.")
    process.exit(1)
  }

  // Extract page ID from URL if needed
  const pageId = extractPageId(input)

  const { html, title } = await renderFromNotion({ pageId, token })

  if (values.output) {
    await writeFile(values.output, html, "utf-8")
    console.error(`Written to ${values.output} (${title})`)
  } else {
    process.stdout.write(html)
  }
}

function extractPageId(input: string): string {
  try {
    const url = new URL(input)
    const path = url.pathname.replace(/\/+$/, "").split("/").pop() || ""
    const match = path.match(/([a-f0-9]{32})$/i)
    if (match) return match[1].toLowerCase()
  } catch {
    // Not a URL, treat as raw page ID
  }

  const clean = input.replace(/-/g, "")
  if (/^[a-f0-9]{32}$/i.test(clean)) return clean.toLowerCase()

  return input
}

main().catch((err) => {
  console.error(`Error: ${err.message}`)
  process.exit(1)
})
