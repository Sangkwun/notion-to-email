import type {
  TableOfContentsBlockObjectResponse,
  BlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints"
import { el, text } from "../html"
import { Color, ColorMap } from "../constants"
import { asHeading4Block } from "../types/heading4"
import type { RenderContext, PageChildrenExtraInfo } from "../types/internal"
import type { StyleProps } from "../types/style"

const TOC_ITEM_STYLE: StyleProps = {
  fontSize: "0.875em",
  lineHeight: 1.3,
  padding: "0.125em 0",
  margin: 0,
}

function getIndentStyle(level: 1 | 2 | 3 | 4): StyleProps {
  if (level === 1) return {}
  if (level === 2) return { paddingLeft: "1.5em" }
  if (level === 3) return { paddingLeft: "3em" }
  return { paddingLeft: "4.5em" }
}

interface HeadingInfo {
  id: string
  level: 1 | 2 | 3 | 4
  text: string
}

function extractHeadings(
  blocks: BlockObjectResponse[],
  extraData: RenderContext["extraData"],
): HeadingInfo[] {
  const headings: HeadingInfo[] = []
  for (const block of blocks) {
    const h4 = asHeading4Block(block)
    if (h4) {
      headings.push({
        id: h4.id,
        level: 4,
        text: h4.heading_4.rich_text.map((rt) => rt.plain_text).join(""),
      })
    } else if (
      block.type === "heading_1" ||
      block.type === "heading_2" ||
      block.type === "heading_3"
    ) {
      const level = parseInt(block.type.split("_")[1]!) as 1 | 2 | 3
      let t = ""
      if (block.type === "heading_1") t = block.heading_1.rich_text.map((rt) => rt.plain_text).join("")
      else if (block.type === "heading_2") t = block.heading_2.rich_text.map((rt) => rt.plain_text).join("")
      else t = block.heading_3.rich_text.map((rt) => rt.plain_text).join("")
      headings.push({ id: block.id, level, text: t })
    }
    if (block.has_children && extraData[block.id]) {
      const childrenInfo = extraData[block.id] as PageChildrenExtraInfo
      if (childrenInfo.info?.results) {
        headings.push(
          ...extractHeadings(childrenInfo.info.results as BlockObjectResponse[], extraData),
        )
      }
    }
  }
  return headings
}

export function renderTableOfContents(
  block: TableOfContentsBlockObjectResponse,
  ctx: RenderContext,
): string {
  const pageBlocks = ctx.extraData["page_root_blocks"] as PageChildrenExtraInfo | undefined
  const headings = pageBlocks?.info?.results
    ? extractHeadings(pageBlocks.info.results as BlockObjectResponse[], ctx.extraData)
    : []

  const color = (block.table_of_contents.color as Color) || "default"

  const items =
    headings.length > 0
      ? headings
          .map((h) =>
            el(
              "p",
              {
                style: {
                  ...TOC_ITEM_STYLE,
                  ...getIndentStyle(h.level),
                  color: "inherit",
                },
              },
              text(h.text),
            ),
          )
          .join("")
      : el(
          "p",
          {
            style: {
              ...TOC_ITEM_STYLE,
              color: "rgba(55, 53, 47, 0.4)",
              fontStyle: "italic",
            },
          },
          text("No headings found"),
        )

  return el(
    "div",
    {
      style: {
        margin: "0.25em 0",
        width: "100%",
        color: ColorMap[color],
      },
    },
    items,
  )
}
