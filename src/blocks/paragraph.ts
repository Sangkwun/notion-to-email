import type { ParagraphBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { el, frag, section, row, column } from "../html"
import { Color, isBackgroundColor, ColorMap, CalloutBackgroundColorMap } from "../constants"
import { renderRichTexts } from "../richtext"
import type { RenderContext } from "../types/internal"
import type { StyleProps } from "../types/style"
import type { PageChildrenExtraInfo } from "../types/internal"

function buildParagraphStyle(color: Color, isEmpty: boolean = false): StyleProps {
  const s: StyleProps = {
    fontSize: "1em",
    lineHeight: "1.5em",
    padding: "0.1875em 0.125em",
    margin: "1px 0px",
    color: "inherit",
    width: "100%",
    maxWidth: "100%",
  }
  if (isEmpty) s.minHeight = "1em"
  if (color !== "default") {
    if (isBackgroundColor(color as Color)) {
      s.background = CalloutBackgroundColorMap[color]
    } else {
      s.color = ColorMap[color as Color]
    }
  }
  return s
}

export function renderParagraph(
  block: ParagraphBlockObjectResponse,
  ctx: RenderContext,
  renderChildren: (blockId: string, ctx: RenderContext, opts?: { firstNestedList?: boolean; firstNoMarginTop?: boolean }) => string,
): string {
  const { paragraph } = block
  const isEmpty = paragraph.rich_text.length === 0
  const color = paragraph.color as Color

  const contentRow = row(
    {},
    column({}, renderRichTexts(paragraph.rich_text, Color.Default)),
  )

  let childrenRow: string | null = null
  if (block.has_children && ctx.extraData[block.id]) {
    childrenRow = row(
      {},
      column(
        { style: { paddingLeft: "1.5em" } },
        renderChildren(block.id, ctx),
      ),
    )
  }

  return section(
    { style: buildParagraphStyle(color, isEmpty) },
    contentRow,
    childrenRow,
  )
}
