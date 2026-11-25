/**
 * A page that uses the Notion API shapes the renderer used to skip or replace
 * with a placeholder: inline mentions, native icons, non-watch YouTube URLs and
 * other videos, embed/pdf/audio/link_preview, tabs and meeting notes.
 *
 * Shapes follow https://developers.notion.com/reference/block and
 * https://developers.notion.com/reference/rich-text.
 */
import type {
  ListBlockChildrenResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints"
import type { ExtraData } from "../../src/types/internal"

const annotations = {
  bold: false,
  italic: false,
  strikethrough: false,
  underline: false,
  code: false,
  color: "default",
}

export const rt = (content: string, href: string | null = null) => ({
  type: "text",
  text: { content, link: href ? { url: href } : null },
  annotations,
  plain_text: content,
  href,
})

export const mention = (mentionValue: object, plainText: string, href: string | null = null) => ({
  type: "mention",
  mention: mentionValue,
  annotations,
  plain_text: plainText,
  href,
})

export const block = (id: string, type: string, payload: object, hasChildren = false) => ({
  object: "block",
  id,
  type,
  has_children: hasChildren,
  in_trash: false,
  [type]: payload,
})

export const list = (results: object[]) =>
  ({
    object: "list",
    results,
    next_cursor: null,
    has_more: false,
    type: "block",
    block: {},
  }) as unknown as ListBlockChildrenResponse

const children = (results: object[]) => ({ type: "page_children", info: list(results) })

const S3 = "https://prod-files-secure.s3.us-west-2.amazonaws.com/9a1b2c3d-space/0f4e5d6c-file"
const S3_QUERY = "?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=3600"
const uploaded = (fileName: string) => ({
  type: "file",
  file: { url: `${S3}/${encodeURIComponent(fileName)}${S3_QUERY}`, expiry_time: "2026-11-25T10:00:00.000Z" },
  caption: [],
})
const external = (url: string) => ({ type: "external", external: { url }, caption: [] })

export const PAGE_ID = "1a2b3c4d-0000-4000-8000-00000000c0de"
export const PAGE_URL = "https://www.notion.so/Coverage-fixture-1a2b3c4d00004000800000000000c0de"

export const page = {
  object: "page",
  id: PAGE_ID,
  url: PAGE_URL,
  public_url: null,
  cover: null,
  icon: { type: "icon", icon: { name: "pizza", color: "blue" } },
  properties: { title: { id: "title", type: "title", title: [rt("Notion coverage fixture")] } },
} as unknown as PageObjectResponse

const YT = "aqz-KE-bpKQ"

export const ids = {
  mentions: "b0000000-0000-4000-8000-000000000001",
  callout: "b0000000-0000-4000-8000-000000000002",
  ytWatch: "b0000000-0000-4000-8000-000000000003",
  ytShort: "b0000000-0000-4000-8000-000000000004",
  ytShorts: "b0000000-0000-4000-8000-000000000005",
  ytEmbed: "b0000000-0000-4000-8000-000000000006",
  vimeo: "b0000000-0000-4000-8000-000000000007",
  videoFile: "b0000000-0000-4000-8000-000000000008",
  embed: "b0000000-0000-4000-8000-000000000009",
  pdfFile: "b0000000-0000-4000-8000-00000000000a",
  pdfExternal: "b0000000-0000-4000-8000-00000000000b",
  audioFile: "b0000000-0000-4000-8000-00000000000c",
  linkPreview: "b0000000-0000-4000-8000-00000000000d",
  tab: "b0000000-0000-4000-8000-00000000000e",
  tabOverview: "b0000000-0000-4000-8000-00000000000f",
  tabDetails: "b0000000-0000-4000-8000-000000000010",
  transcription: "b0000000-0000-4000-8000-000000000011",
  summary: "b0000000-0000-4000-8000-000000000012",
  notes: "b0000000-0000-4000-8000-000000000013",
  transcript: "b0000000-0000-4000-8000-000000000014",
  meetingNotes: "b0000000-0000-4000-8000-000000000015",
}

const h2 = (id: string, title: string) => block(id, "heading_2", { rich_text: [rt(title)], color: "default", is_toggleable: false })

const meeting = {
  title: [rt("Weekly sync")],
  status: "notes_ready",
  children: { summary_block_id: ids.summary, notes_block_id: ids.notes, transcript_block_id: ids.transcript },
  calendar_event: { start_time: "2026-11-20T01:00:00.000Z", end_time: "2026-11-20T01:30:00.000Z" },
  recording: { start_time: "2026-11-20T01:00:00.000Z", end_time: "2026-11-20T01:30:00.000Z" },
}

export const results = [
  h2("h-mentions", "1. Mentions"),
  block(ids.mentions, "paragraph", {
    color: "default",
    icon: null,
    rich_text: [
      rt("Page "),
      mention({ type: "page", page: { id: "2f1c0000-0000-4000-8000-000000000001" } }, "Project plan", "https://www.notion.so/2f1c0000000040008000000000000001"),
      rt(", database "),
      mention({ type: "database", database: { id: "2f1c0000-0000-4000-8000-000000000002" } }, "Tasks", "https://www.notion.so/2f1c0000000040008000000000000002"),
      rt(", link "),
      mention(
        { type: "link_mention", link_mention: { href: "https://github.com/makenotion/notion-sdk-js", title: "notion-sdk-js", icon_url: "https://github.com/favicon.ico" } },
        "https://github.com/makenotion/notion-sdk-js",
        "https://github.com/makenotion/notion-sdk-js",
      ),
      rt(", preview "),
      mention({ type: "link_preview", link_preview: { url: "https://www.figma.com/file/abc/Design" } }, "https://www.figma.com/file/abc/Design", "https://www.figma.com/file/abc/Design"),
      rt(", emoji "),
      mention({ type: "custom_emoji", custom_emoji: { id: "e1", name: "bufo", url: "https://notionto.email/icons/pizza_orange.png" } }, ":bufo:"),
      rt(", template "),
      mention({ type: "template_mention", template_mention: { type: "template_mention_date", template_mention_date: "today" } }, "@Today"),
      rt(", user "),
      mention({ type: "user", user: { object: "user", id: "u1", name: "Alex Kim" } }, "@Alex Kim"),
      rt(", date "),
      mention({ type: "date", date: { start: "2026-11-25", end: null, time_zone: null } }, "November 25, 2026"),
    ],
  }),

  h2("h-icons", "3. Native icons"),
  block(ids.callout, "callout", {
    rich_text: [rt("Callout with a native Notion icon")],
    color: "yellow_background",
    icon: { type: "icon", icon: { name: "light-bulb", color: "yellow" } },
  }),

  h2("h-videos", "5. Videos"),
  block(ids.ytWatch, "video", external(`https://www.youtube.com/watch?v=${YT}`)),
  block(ids.ytShort, "video", external(`https://youtu.be/${YT}?si=abc`)),
  block(ids.ytShorts, "video", external(`https://www.youtube.com/shorts/${YT}`)),
  block(ids.ytEmbed, "video", external(`https://www.youtube.com/embed/${YT}`)),
  block(ids.vimeo, "video", external("https://vimeo.com/76979871")),
  block(ids.videoFile, "video", uploaded("Product demo.mp4")),

  h2("h-media", "6. Embed, PDF, audio, link preview"),
  block(ids.embed, "embed", { url: "https://codepen.io/team/codepen/pen/PNaGbb", caption: [rt("CodePen example")] }),
  block(ids.pdfFile, "pdf", uploaded("Quarterly report.pdf")),
  block(ids.pdfExternal, "pdf", external("https://arxiv.org/pdf/1706.03762")),
  block(ids.audioFile, "audio", uploaded("Interview.m4a")),
  block(ids.linkPreview, "link_preview", { url: "https://github.com/makenotion/notion-sdk-js/pull/600" }),

  h2("h-tabs", "7. Tabs"),
  block(ids.tab, "tab", {}, true),

  h2("h-meeting", "10. Meeting notes"),
  block(ids.transcription, "transcription", meeting, true),
  block(ids.meetingNotes, "meeting_notes", { ...meeting, title: [rt("Design review")], children: {} }, false),
]

export const pageChildren = list(results)

export const extraData = {
  [ids.tab]: children([
    block(ids.tabOverview, "paragraph", { rich_text: [rt("Overview")], color: "default", icon: { type: "emoji", emoji: "📋" } }, true),
    block(ids.tabDetails, "paragraph", { rich_text: [rt("Details")], color: "default", icon: { type: "icon", icon: { name: "document", color: "gray" } } }, true),
  ]),
  [ids.tabOverview]: children([
    block("t1-p", "paragraph", { rich_text: [rt("Content of the first tab.")], color: "default", icon: null }),
  ]),
  [ids.tabDetails]: children([
    block("t2-li1", "bulleted_list_item", { rich_text: [rt("Second tab, first point")], color: "default" }),
    block("t2-li2", "bulleted_list_item", { rich_text: [rt("Second tab, second point")], color: "default" }),
  ]),
  [ids.summary]: children([
    block("s-p", "paragraph", { rich_text: [rt("We agreed to ship the renderer fixes this week.")], color: "default", icon: null }),
  ]),
  [ids.notes]: children([
    block("n-todo", "to_do", { rich_text: [rt("Send the approval page")], checked: false, color: "default" }),
  ]),
} as unknown as ExtraData
