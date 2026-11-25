import type {
  BlockObjectResponse,
  MeetingNotesBlockObjectResponse,
  PartialBlockObjectResponse,
  TranscriptionBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints"
import { el, text } from "../html"
import { Color, TEXT_STYLES } from "../constants"
import { renderRichTexts } from "../richtext"
import { notionBlockUrl, renderLinkCard, viewOnNotionLabel } from "./link-card"
import { pageChildren } from "../utils"
import type { RenderContext } from "../types/internal"

type RenderResults = (
  results: (BlockObjectResponse | PartialBlockObjectResponse)[],
  ctx: RenderContext,
  firstNoMarginTop?: boolean,
) => string

/** AI meeting notes: `transcription` before API version 2026-03-11, `meeting_notes` from it */
export type MeetingNotesBlock = TranscriptionBlockObjectResponse | MeetingNotesBlockObjectResponse

export function meetingNotesOf(block: MeetingNotesBlock) {
  return block.type === "transcription" ? block.transcription : block.meeting_notes
}

/**
 * Title, then the summary and notes sections, then a link to the block on Notion.
 * The sections are blocks pointed to by children.summary_block_id / notes_block_id,
 * read from extraData[<id>] (https://developers.notion.com/reference/block#meeting-notes).
 * The transcript is left out; the link reaches it and any section that was not fetched.
 * The meeting date is left out because its day depends on the reader's time zone.
 */
export function renderMeetingNotes(
  block: MeetingNotesBlock,
  ctx: RenderContext,
  renderChildrenResults: RenderResults,
): string {
  const notes = meetingNotesOf(block)
  const title = notes.title ?? []

  const sections = [
    { id: notes.children?.summary_block_id, label: ctx.options.labels?.meetingSummary ?? "Summary" },
    { id: notes.children?.notes_block_id, label: ctx.options.labels?.meetingNotes ?? "Notes" },
  ]
    .map(({ id, label }) => {
      const content = id ? pageChildren(ctx, id) : undefined
      const body = content ? renderChildrenResults(content, ctx, true) : ""
      if (!body) return null
      return el(
        "div",
        { style: { marginTop: "0.75em" } },
        el(
          "p",
          { style: { margin: "0 0 0.25em", fontSize: "0.875em", fontWeight: 600, color: "rgba(55, 53, 47, 0.65)" } },
          text(label),
        ),
        body,
      )
    })
    .filter((s): s is string => s !== null)

  return el(
    "div",
    {
      style: {
        margin: "0.25em 0",
        padding: "1em",
        border: "1px solid #E0E0E0",
        borderRadius: "0.625em",
      },
    },
    el(
      "div",
      { style: { ...TEXT_STYLES.H3, margin: "0" } },
      title.length > 0 ? renderRichTexts(title, Color.Default) : text("Meeting notes"),
    ),
    ...sections,
    el(
      "div",
      { style: { marginTop: "0.75em" } },
      renderLinkCard({
        href: notionBlockUrl(ctx, block.id),
        iconSrc: `${ctx.assetBaseUrl}/images/notion-logo.png`,
        title: viewOnNotionLabel(ctx),
      }),
    ),
  )
}
