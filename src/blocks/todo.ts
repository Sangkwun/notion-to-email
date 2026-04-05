import type { ToDoBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { el, section, row, column, a, img } from "../html"
import { Color, isBackgroundColor, ColorMap, CalloutBackgroundColorMap } from "../constants"
import { renderRichTexts } from "../richtext"
import type { RenderContext } from "../types/internal"
import type { StyleProps } from "../types/style"

function buildTodoStyle(color: Color): StyleProps {
  const s: StyleProps = {
    margin: "1px 0",
    paddingLeft: "0.125em",
    width: "100%",
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

export function renderTodo(
  block: ToDoBlockObjectResponse,
  ctx: RenderContext,
  renderChildren: (blockId: string, ctx: RenderContext, opts?: { firstNestedList?: boolean; firstNoMarginTop?: boolean }) => string,
): string {
  const isChecked = block.to_do.checked
  const baseUrl = ctx.assetBaseUrl

  // Clone rich text with strikethrough for checked items
  const richText = block.to_do.rich_text.map((rt) => {
    if (isChecked) {
      return {
        ...rt,
        annotations: { ...rt.annotations, strikethrough: true, color: "default" as const },
      }
    }
    return rt
  })

  const checkboxCell = column(
    {
      style: {
        verticalAlign: "top",
        textAlign: "center",
        width: "1.875em",
      },
    },
    el(
      "div",
      { style: { width: "1em", height: "1em", padding: "0.1875em 0.125em" } },
      el(
        "a",
        {
          style: {
            maxHeight: "1.5em",
            margin: "0.25em 0px",
            width: "1em",
            height: "1em",
            backgroundColor: isChecked ? "rgb(35, 131, 226)" : "transparent",
            display: "inline-block",
            textAlign: "center",
            lineHeight: "1em",
          },
        },
        img({
          style: {
            width: isChecked ? "0.875em" : "1em",
            height: isChecked ? "0.875em" : "1em",
            display: "inline-block",
            verticalAlign: "middle",
          },
          src: `${baseUrl}/images/${isChecked ? "check.png" : "checkbox-square.png"}`,
        }),
      ),
    ),
  )

  const contentCell = column(
    {
      style: {
        padding: "0.1875em 0.125em",
        textDecoration: isChecked ? "line-through rgba(55, 53, 47, 0.25)" : "none",
        color: isChecked ? "rgb(134, 142, 150)" : "inherit",
      },
    },
    renderRichTexts(richText, Color.Default),
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
    { style: buildTodoStyle(block.to_do.color as Color) },
    row({}, checkboxCell, contentCell),
    childrenRow,
  )
}
