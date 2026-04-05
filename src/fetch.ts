import { Client, isFullBlock, isFullPage } from "@notionhq/client"
import type {
  BlockObjectResponse,
  DatabaseObjectResponse,
  ListBlockChildrenResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints"
import type { RenderFromNotionOptions, RenderResult } from "./types/index"
import type { ExtraData } from "./types/internal"
import { renderNotionEmail } from "./render"
import { getPageTitle, extractPageIcon } from "./utils"

/** Fetch a Notion page and all supplementary data, then render to HTML */
export async function fetchAndRender(
  input: RenderFromNotionOptions,
): Promise<RenderResult> {
  const notion = new Client({ auth: input.token })

  // 1. Fetch page
  const pageResponse = await notion.pages.retrieve({ page_id: input.pageId })
  if (!isFullPage(pageResponse)) {
    throw new Error("Could not retrieve full page data")
  }
  const page = pageResponse as PageObjectResponse

  // 2. Fetch children blocks
  const children = await fetchAllChildren(notion, input.pageId)

  // 3. Collect extra data
  const extraData: ExtraData = {}

  // Store root blocks for table-of-contents
  extraData["page_root_blocks"] = {
    type: "page_children",
    info: children,
  }

  // Recursively fetch extra data for blocks
  await collectExtraData(
    notion,
    children.results.filter(isFullBlock) as BlockObjectResponse[],
    extraData,
  )

  // 4. Render
  const html = renderNotionEmail(page, children, extraData, input.options)

  // 5. Extract metadata
  const title = getPageTitle(page)
  const icon = extractPageIcon(page)

  return { html, title, icon, url: page.url, isPublicPage: !!page.public_url }
}

async function fetchAllChildren(
  notion: Client,
  blockId: string,
): Promise<ListBlockChildrenResponse> {
  let results: ListBlockChildrenResponse["results"] = []
  let cursor: string | undefined

  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    })
    results = results.concat(response.results)
    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined
  } while (cursor)

  return {
    object: "list",
    results,
    has_more: false,
    next_cursor: null,
    type: "block",
    block: {},
  } as ListBlockChildrenResponse
}

const MAX_DEPTH = 10

async function collectExtraData(
  notion: Client,
  blocks: BlockObjectResponse[],
  extraData: ExtraData,
  depth: number = 0,
): Promise<void> {
  if (depth >= MAX_DEPTH) return
  const tasks: Promise<void>[] = []

  for (const block of blocks) {
    // Blocks with children: paragraph, list items, todo, toggle, quote, callout, synced_block, column_list
    // Skip child_page and child_database — they store page/database info, not block children
    if (block.has_children && block.type !== "child_page" && block.type !== "child_database") {
      tasks.push(
        (async () => {
          const children = await fetchAllChildren(notion, block.id)
          extraData[block.id] = { type: "page_children", info: children }

          // Recurse into children
          const childBlocks = children.results.filter(isFullBlock) as BlockObjectResponse[]
          await collectExtraData(notion, childBlocks, extraData, depth + 1)
        })(),
      )
    }

    // Bookmark: fetch OG data
    if (block.type === "bookmark") {
      tasks.push(
        (async () => {
          try {
            // Simple fetch of title/description from HTML
            const url = block.bookmark.url
            const response = await fetch(url, {
              headers: { "User-Agent": "notion-to-email/1.0" },
              signal: AbortSignal.timeout(5000),
            })
            const html = await response.text()
            // Match OG tags regardless of attribute order
            const ogTitle = html.match(/<meta[^>]*(?:property=["']og:title["'][^>]*content=["']([^"']*)["']|content=["']([^"']*)["'][^>]*property=["']og:title["'])/)
            const ogDescription = html.match(/<meta[^>]*(?:property=["']og:description["'][^>]*content=["']([^"']*)["']|content=["']([^"']*)["'][^>]*property=["']og:description["'])/)
            const ogImage = html.match(/<meta[^>]*(?:property=["']og:image["'][^>]*content=["']([^"']*)["']|content=["']([^"']*)["'][^>]*property=["']og:image["'])/)
            const favicon = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']*)["']/)
            const titleTag = html.match(/<title[^>]*>([^<]*)<\/title>/)

            const origin = new URL(url).origin
            const resolveUrl = (u: string | undefined) => {
              if (!u) return u
              if (u.startsWith("http")) return u
              if (u.startsWith("//")) return "https:" + u
              return origin + (u.startsWith("/") ? "" : "/") + u
            }
            const rawOgImage = ogImage?.[1] ?? ogImage?.[2]

            extraData[block.id] = {
              type: "bookmark",
              info: {
                ogTitle: ogTitle?.[1] ?? ogTitle?.[2] ?? titleTag?.[1] ?? url,
                ogDescription: ogDescription?.[1] ?? ogDescription?.[2] ?? "",
                ogImage: rawOgImage ? [{ url: resolveUrl(rawOgImage)! }] : undefined,
                favicon: resolveUrl(favicon?.[1]),
                requestUrl: url,
              },
            }
          } catch {
            extraData[block.id] = {
              type: "bookmark",
              info: {
                ogTitle: block.bookmark.url,
                requestUrl: block.bookmark.url,
              },
            }
          }
        })(),
      )
    }

    // Child page: fetch page info
    if (block.type === "child_page") {
      tasks.push(
        (async () => {
          try {
            const pageInfo = await notion.pages.retrieve({ page_id: block.id })
            if (isFullPage(pageInfo)) {
              extraData[block.id] = { type: "page", info: pageInfo as PageObjectResponse }
            }
          } catch {
            // Ignore - will render without icon
          }
        })(),
      )
    }

    // Child database: fetch database info
    if (block.type === "child_database") {
      tasks.push(
        (async () => {
          try {
            const dbInfo = await notion.databases.retrieve({ database_id: block.id })
            extraData[block.id] = { type: "database", info: dbInfo as DatabaseObjectResponse }
          } catch {
            // Ignore
          }
        })(),
      )
    }

    // Link to page: fetch linked page info
    if (block.type === "link_to_page" && block.link_to_page.type === "page_id") {
      const pageId = (block.link_to_page as { type: "page_id"; page_id: string }).page_id
      tasks.push(
        (async () => {
          try {
            const pageInfo = await notion.pages.retrieve({
              page_id: pageId,
            })
            if (isFullPage(pageInfo)) {
              extraData[block.id] = { type: "page", info: pageInfo as PageObjectResponse }
            }
          } catch {
            // Ignore
          }
        })(),
      )
    }
  }

  await Promise.all(tasks)
}

