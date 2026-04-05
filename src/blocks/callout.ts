import type { CalloutBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { el, section, row, column } from "../html"
import { Color, ColorMap, CalloutBackgroundColorMap } from "../constants"
import { renderRichTexts } from "../richtext"
import { renderIconImg } from "./icon-img"
import type { RenderContext } from "../types/internal"
import type { StyleProps } from "../types/style"

function buildCalloutBlockStyle(color: Color): StyleProps {
  const s: StyleProps = {
    margin: "0.25em 0",
    width: "100%",
    padding: "1em",
    borderRadius: "0.625em",
    maxWidth: "100%",
  }
  if (color !== "default") {
    if (color.includes("background")) {
      s.background = CalloutBackgroundColorMap[color]
      if (color === "default_background") {
        s.border = "1px solid #E0E0E0"
      }
    } else {
      s.color = ColorMap[color as Color]
      s.border = "1px solid #E0E0E0"
    }
  } else {
    s.border = "1px solid #E0E0E0"
  }
  return s
}

export function renderCallout(
  block: CalloutBlockObjectResponse,
  ctx: RenderContext,
  renderChildren: (blockId: string, ctx: RenderContext, opts?: { firstNestedList?: boolean; firstNoMarginTop?: boolean }) => string,
): string {
  const calloutColor = block.callout.color as Color
  const textColor = calloutColor.includes("background") ? Color.Default : calloutColor

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
    { style: buildCalloutBlockStyle(calloutColor) },
    section(
      {},
      row(
        {},
        column(
          {
            style: {
              width: "1.5em",
              verticalAlign: "top",
              textAlign: "center",
              paddingRight: "0.5em",
            },
          },
          el(
            "div",
            { style: { height: "1.5em" } },
            renderIconImg(block.callout.icon, ctx, {
              externalIconSize: 24,
              emojiIconSize: 24,
              fileIconSize: 24,
              block,
            }),
          ),
        ),
        column(
          { style: { width: "100%" } },
          renderRichTexts(block.callout.rich_text, textColor),
          childrenHtml,
        ),
      ),
    ),
  )
}
