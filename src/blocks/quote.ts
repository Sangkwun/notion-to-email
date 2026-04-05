import type { QuoteBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { el, section, row, column } from "../html"
import { Color, isBackgroundColor, ColorMap, CalloutBackgroundColorMap } from "../constants"
import { renderRichTexts } from "../richtext"
import type { RenderContext } from "../types/internal"
import type { StyleProps } from "../types/style"

function getBaseColor(color: Color): Color {
  if (isBackgroundColor(color)) {
    return color.replace("_background", "") as Color
  }
  return color
}

function buildQuoteBlockStyle(color: Color): StyleProps {
  const s: StyleProps = {
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

export function renderQuote(
  block: QuoteBlockObjectResponse,
  ctx: RenderContext,
  renderChildren: (blockId: string, ctx: RenderContext, opts?: { firstNestedList?: boolean; firstNoMarginTop?: boolean }) => string,
): string {
  const quoteColor = block.quote.color as Color
  const borderColor = quoteColor !== "default"
    ? ColorMap[getBaseColor(quoteColor)]!
    : "currentcolor"

  const textColor = quoteColor.includes("background") ? Color.Default : quoteColor

  let childrenHtml = ""
  if (block.has_children && ctx.extraData[block.id]) {
    childrenHtml = el(
      "div",
      { style: { maxWidth: "100%" } },
      renderChildren(block.id, ctx, { firstNoMarginTop: true }),
    )
  }

  return el(
    "div",
    { style: { margin: "0.25em 0" } },
    el(
      "div",
      { style: buildQuoteBlockStyle(quoteColor) },
      section(
        {},
        row(
          {},
          column(
            {
              style: {
                borderLeft: `0.1875em solid ${borderColor}`,
                padding: "0px 0.875em",
              },
            },
            renderRichTexts(block.quote.rich_text, textColor),
            childrenHtml,
          ),
        ),
      ),
    ),
  )
}
