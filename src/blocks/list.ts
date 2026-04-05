import type {
  BulletedListItemBlockObjectResponse,
  NumberedListItemBlockObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints"
import { el, section, row, column } from "../html"
import { Color, isBackgroundColor, ColorMap, CalloutBackgroundColorMap } from "../constants"
import { renderRichTexts } from "../richtext"
import type { RenderContext } from "../types/internal"
import type { StyleProps } from "../types/style"

type ListBlock = BulletedListItemBlockObjectResponse | NumberedListItemBlockObjectResponse

function buildListBlockStyle(color: Color, isFirstNested?: boolean): StyleProps {
  const s: StyleProps = {
    marginTop: isFirstNested ? "0.125em" : "0.0625em",
    marginBottom: "0.0625em",
    width: "100%",
    paddingLeft: "0.125em",
    maxWidth: "100%",
  }
  if (color !== "default") {
    if (isBackgroundColor(color as Color)) {
      s.background = CalloutBackgroundColorMap[color]
    } else {
      s.color = ColorMap[color as Color]
    }
  }
  return s
}

export function renderList(
  block: ListBlock,
  ctx: RenderContext,
  renderChildren: (blockId: string, ctx: RenderContext, opts?: { firstNestedList?: boolean; firstNoMarginTop?: boolean }) => string,
  number?: number,
  isFirstNested?: boolean,
): string {
  const isNumbered = block.type === "numbered_list_item"
  let color: Color
  let richText: RichTextItemResponse[]

  if (block.type === "bulleted_list_item") {
    color = block.bulleted_list_item.color as Color
    richText = block.bulleted_list_item.rich_text
  } else {
    color = block.numbered_list_item.color as Color
    richText = block.numbered_list_item.rich_text
  }

  const bulletCell = column(
    {
      style: {
        verticalAlign: "top",
        width: "1.25em",
        height: "1.5em",
        padding: "0.1875em 0.125em",
        textAlign: "center",
      },
    },
    el(
      "span",
      isNumbered ? {} : { style: { fontSize: "1.5em", lineHeight: 1 } },
      isNumbered ? `${number}.` : "•",
    ),
  )

  const contentCell = column(
    { style: { padding: "0.1875em 0.125em" } },
    renderRichTexts(richText, Color.Default),
  )

  let childrenRow: string | null = null
  if (block.has_children && ctx.extraData[block.id]) {
    childrenRow = row(
      {},
      column(
        { colSpan: 2, style: { paddingLeft: "1.5em" } },
        renderChildren(block.id, ctx, { firstNestedList: true }),
      ),
    )
  }

  return section(
    { style: buildListBlockStyle(color, isFirstNested) },
    row({}, bulletCell, contentCell),
    childrenRow,
  )
}
