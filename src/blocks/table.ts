import { isFullBlock } from "@notionhq/client"
import type {
  TableBlockObjectResponse,
  TableRowBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints"
import { el, text } from "../html"
import { Color, ColorMap, TEXT_STYLES } from "../constants"
import { renderRichTexts } from "../richtext"
import type { RenderContext, PageChildrenExtraInfo } from "../types/internal"

function renderTableRow(
  block: TableRowBlockObjectResponse,
  color: Color,
): string {
  if (!block.table_row) return ""

  const columnWidth = `${100 / block.table_row.cells.length}%`

  const cells = block.table_row.cells
    .map((items, index) =>
      el(
        "td",
        {
          style: {
            border: "1px solid rgb(233, 233, 231)",
            maxWidth: "240px",
            height: "100%",
            width: columnWidth,
            verticalAlign: "top",
            padding: "0px",
          },
        },
        el(
          "div",
          { style: { padding: "0.4375em 0.5625em", ...TEXT_STYLES.TABLE } },
          renderRichTexts(items, color),
        ),
      ),
    )
    .join("")

  return el(
    "tr",
    {
      style: {
        boxSizing: "border-box",
        borderSpacing: "0px",
        borderCollapse: "collapse",
      },
    },
    cells,
  )
}

export function renderTable(
  block: TableBlockObjectResponse,
  ctx: RenderContext,
): string {
  const childrenInfo = ctx.extraData[block.id] as PageChildrenExtraInfo | undefined
  if (!childrenInfo) return ""

  const rows = childrenInfo.info.results
    .map((b) => {
      if (!isFullBlock(b) || b.type !== "table_row") return ""
      return renderTableRow(b as TableRowBlockObjectResponse, Color.Default)
    })
    .join("")

  return el(
    "div",
    { style: { paddingTop: "0.5em", paddingBottom: "1.125em" } },
    el(
      "table",
      {
        style: {
          borderCollapse: "collapse",
          width: "100%",
          color: ColorMap.default,
        },
      },
      rows,
    ),
  )
}
