import type { ToggleBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { section, row, column, a, img } from "../html"
import { Color, isBackgroundColor, ColorMap, CalloutBackgroundColorMap } from "../constants"
import { renderRichTexts } from "../richtext"
import type { RenderContext } from "../types/internal"
import type { StyleProps } from "../types/style"

function buildToggleBlockStyle(color: Color): StyleProps {
  const s: StyleProps = {
    margin: "1px 0",
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

export function renderToggle(
  block: ToggleBlockObjectResponse,
  ctx: RenderContext,
  renderChildren: (blockId: string, ctx: RenderContext, opts?: { firstNestedList?: boolean; firstNoMarginTop?: boolean }) => string,
): string {
  const page = ctx.page
  const baseUrl = ctx.assetBaseUrl
  const toggleLink = page.public_url || `${page.url}?pvs=4#${block.id.replaceAll("-", "")}`

  const iconCell = column(
    {
      style: {
        verticalAlign: "top",
        width: "1.25em",
        height: "1.5em",
        textAlign: "center",
        padding: "0.1875em 0.125em",
      },
    },
    a(
      { href: toggleLink, style: { textDecoration: "none", color: ColorMap.default } },
      img({
        style: { padding: "0.5em 0.375em", width: "0.6875em", height: "0.6875em" },
        src: `${baseUrl}/images/triangle.png`,
      }),
    ),
  )

  const contentCell = column(
    { style: { width: "100%" } },
    a(
      { href: toggleLink, style: { textDecoration: "none", color: ColorMap.default } },
      renderRichTexts(block.toggle.rich_text, Color.Default),
    ),
  )

  let childrenRow: string | null = null
  if (block.has_children && ctx.extraData[block.id]) {
    childrenRow = row(
      {},
      column(
        { colSpan: 2, style: { paddingLeft: "1.5em" } },
        renderChildren(block.id, ctx),
      ),
    )
  }

  return section(
    { style: buildToggleBlockStyle(block[block.type].color as Color) },
    row({}, iconCell, contentCell),
    childrenRow,
  )
}
