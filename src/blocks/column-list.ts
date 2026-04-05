import type {
  BlockObjectResponse,
  ColumnBlockObjectResponse,
  PartialBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints"
import { el, frag, section, row, column } from "../html"
import type { RenderContext, PageChildrenExtraInfo } from "../types/internal"

export function renderColumnList(
  block: { id: string },
  ctx: RenderContext,
  renderChildrenFromResults: (results: (BlockObjectResponse | PartialBlockObjectResponse)[], ctx: RenderContext) => string,
): string {
  const pageInfo = ctx.extraData[block.id] as PageChildrenExtraInfo | undefined
  if (!pageInfo) return ""
  const info = pageInfo.info

  const cells = info.results
    .map((b, index) => {
      const columnInfo = ctx.extraData[b.id] as PageChildrenExtraInfo | null
      if (!columnInfo) return null

      const widthRatio =
        (b as ColumnBlockObjectResponse).column?.width_ratio ||
        1 / info.results.length
      const contentColumn = column(
        {
          style: {
            width: `${widthRatio * 100}%`,
            verticalAlign: "top",
          },
        },
        renderChildrenFromResults(columnInfo.info.results, ctx),
      )

      const gutter =
        index !== info.results.length - 1
          ? column({ style: { minWidth: "1.5em" } })
          : null

      return frag(contentColumn, gutter)
    })
    .filter(Boolean)
    .join("")

  return el(
    "div",
    { style: { maxWidth: "100%" } },
    section({}, row({}, cells)),
  )
}
