import { describe, it, expect } from "vitest"
import type {
  ListBlockChildrenResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints"
import { renderNotionEmail } from "../src/render"
import type { ExtraData } from "../src/types/internal"

// Outlook for Windows ignores CSS `width` on <img> and falls back to the
// image file's own size (e.g. the 64px checkbox). Every icon sized in em
// must also carry pixel width/height attributes.

const rt = (content: string) => ({
  type: "text",
  text: { content, link: null },
  annotations: {
    bold: false,
    italic: false,
    strikethrough: false,
    underline: false,
    code: false,
    color: "default",
  },
  plain_text: content,
  href: null,
})

const block = (id: string, type: string, payload: object, hasChildren = false) => ({
  object: "block",
  id,
  type,
  has_children: hasChildren,
  [type]: payload,
})

const page = {
  object: "page",
  id: "page-1",
  url: "https://www.notion.so/page-1",
  public_url: null,
  cover: null,
  icon: { type: "external", external: { url: "https://example.com/page-icon.png" } },
  properties: { title: { id: "title", type: "title", title: [rt("Title")] } },
} as unknown as PageObjectResponse

const results = [
  block("todo-open", "to_do", { rich_text: [rt("open")], checked: false, color: "default" }),
  block("todo-done", "to_do", { rich_text: [rt("done")], checked: true, color: "default" }),
  block("toggle-1", "toggle", { rich_text: [rt("toggle")], color: "default" }),
  block("heading-1", "heading_1", { rich_text: [rt("heading")], color: "default", is_toggleable: true }),
  block("child-page-1", "child_page", { title: "Child" }),
  block("child-page-2", "child_page", { title: "Parent" }, true),
  block("link-to-page-1", "link_to_page", { type: "page_id", page_id: "other-page" }),
  block("file-1", "file", {
    type: "external",
    external: { url: "https://example.com/a.pdf" },
    caption: [],
    name: "a.pdf",
  }),
  block("bookmark-1", "bookmark", { url: "https://example.com/post", caption: [] }),
  block("db-1", "child_database", { title: "DB" }),
  block("breadcrumb-1", "breadcrumb", {}),
  block("callout-1", "callout", {
    rich_text: [rt("callout")],
    color: "gray_background",
    icon: { type: "external", external: { url: "https://example.com/callout-icon.png" } },
  }),
  block("callout-2", "callout", {
    rich_text: [rt("custom emoji")],
    color: "default",
    icon: { type: "custom_emoji", custom_emoji: { id: "e1", name: "party", url: "https://example.com/custom-emoji.png" } },
  }),
  block("callout-3", "callout", {
    rich_text: [rt("file icon")],
    color: "default",
    icon: { type: "file", file: { url: "https://example.com/file-icon.png", expiry_time: "2030-01-01T00:00:00.000Z" } },
  }),
  block("video-1", "video", { type: "external", external: { url: "https://vimeo.com/1" }, caption: [] }),
  block("embed-1", "embed", { url: "https://codepen.io/pen/1", caption: [] }),
  block("pdf-1", "pdf", { type: "external", external: { url: "https://example.com/a.pdf" }, caption: [] }),
  block("audio-1", "audio", { type: "external", external: { url: "https://example.com/a.mp3" }, caption: [] }),
  block("link-preview-1", "link_preview", { url: "https://github.com/a/b/pull/1" }),
  block("tab-1", "tab", {}, true),
  block("callout-4", "callout", {
    rich_text: [rt("native icon")],
    color: "default",
    icon: { type: "icon", icon: { name: "light-bulb", color: "yellow" } },
  }),
]

const children = {
  object: "list",
  results,
  next_cursor: null,
  has_more: false,
  type: "block",
  block: {},
} as unknown as ListBlockChildrenResponse

const extraData = {
  "tab-1": {
    type: "page_children",
    info: {
      results: [
        block("tab-1-item", "paragraph", {
          rich_text: [rt("tab")],
          color: "default",
          icon: { type: "icon", icon: { name: "bookmark", color: "red" } },
        }),
      ],
    },
  },
  "bookmark-1": {
    type: "bookmark",
    info: { requestUrl: "https://example.com/post", ogTitle: "Post", favicon: "/favicon.ico" },
  },
} as unknown as ExtraData

// All icons sit in 16px text, so the pixel attribute must equal the CSS em size × 16.
const BASE_FONT_PX = 16

function cssPx(style: string, prop: "width" | "height"): number | null {
  const m = style.match(new RegExp(`(?:^|;)\\s*${prop}:\\s*([\\d.]+)(em|px)`))
  if (!m) return null
  const value = Number(m[1])
  return Math.round(m[2] === "em" ? value * BASE_FONT_PX : value)
}

describe("fixed-size icons", () => {
  const html = renderNotionEmail(page, children, extraData)
  const fixedImgs = (html.match(/<img\b[^>]*>/g) ?? [])
    .map((tag) => ({ tag, style: tag.match(/style="([^"]*)"/)?.[1] ?? "" }))
    .filter(({ style }) => cssPx(style, "width") !== null)

  it("covers every icon in the fixture", () => {
    const expected: Record<string, number> = {
      "checkbox-square.png": 1,
      "check.png": 1,
      "triangle.png": 2, // toggle + toggleable heading
      "page-empty.png": 2, // child page + link to page
      "page.png": 1,
      "warning.png": 1,
      "file_black.png": 1,
      "table.png": 1,
      "notion-logo.png": 1,
      "favicon.ico": 1,
      "page-icon.png": 1,
      "callout-icon.png": 1,
      "custom-emoji.png": 1,
      "file-icon.png": 1,
      "light-bulb_yellow.png": 1,
      "playback-play-button_gray.png": 1,
      "globe_gray.png": 1,
      "document_gray.png": 1,
      "headphones_gray.png": 1,
      "link_gray.png": 1,
      "bookmark_red.png": 1,
    }
    for (const [name, count] of Object.entries(expected)) {
      expect(fixedImgs.filter(({ tag }) => tag.includes(name)), name).toHaveLength(count)
    }
  })

  it("gives each icon width/height attributes equal to its CSS size", () => {
    for (const { tag, style } of fixedImgs) {
      expect(tag.match(/\swidth="(\d+)"/)?.[1], tag).toBe(String(cssPx(style, "width")))
      expect(tag.match(/\sheight="(\d+)"/)?.[1], tag).toBe(String(cssPx(style, "height")))
    }
  })
})
