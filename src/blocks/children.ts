import { isFullBlock } from "@notionhq/client"
import type {
  BlockObjectResponse,
  PartialBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints"
import { asHeading4Block } from "../types/heading4"
import { renderParagraph } from "./paragraph"
import { renderImage } from "./image"
import { renderHeading } from "./heading"
import { renderList } from "./list"
import { renderTodo } from "./todo"
import { renderToggle } from "./toggle"
import { renderDivider } from "./divider"
import { renderQuote } from "./quote"
import { renderCallout } from "./callout"
import { renderBookmark } from "./bookmark"
import { renderTable } from "./table"
import { renderColumnList } from "./column-list"
import { renderChildPage } from "./child-page"
import { renderChildDatabase } from "./child-database"
import { renderVideo } from "./video"
import { renderFile } from "./file"
import { renderSyncedBlock } from "./synced-block"
import { renderLinkToPage } from "./link-to-page"
import { renderCode } from "./code"
import { renderEquationBlock } from "./equation"
import { renderTableOfContents } from "./table-of-contents"
import { renderNotSupported, NotSupportedType } from "./not-supported"
import type { RenderContext, PageChildrenExtraInfo } from "../types/internal"

/** Render children of a block (used for blocks with has_children) */
function renderBlockChildren(
  blockId: string,
  ctx: RenderContext,
  opts?: { firstNestedList?: boolean; firstNoMarginTop?: boolean },
): string {
  const childrenInfo = ctx.extraData[blockId] as PageChildrenExtraInfo | undefined
  if (!childrenInfo) return ""
  return renderChildrenResults(childrenInfo.info.results, ctx, opts?.firstNoMarginTop, opts?.firstNestedList)
}

/** Main render function: renders a list of blocks */
export function renderChildrenResults(
  results: (BlockObjectResponse | PartialBlockObjectResponse)[],
  ctx: RenderContext,
  firstNoMarginTop?: boolean,
  firstNestedList?: boolean,
): string {
  let numberedCount = 1
  const parts: string[] = []

  for (let index = 0; index < results.length; index++) {
    const block = results[index]!
    if (!isFullBlock(block)) continue

    if (block.type === "numbered_list_item") {
      parts.push(
        renderList(block, ctx, renderBlockChildren, numberedCount, index === 0 && firstNestedList),
      )
      numberedCount += 1
      continue
    } else {
      numberedCount = 1
    }

    if (block.type === "paragraph") {
      parts.push(renderParagraph(block, ctx, renderBlockChildren))
    } else if (block.type === "image") {
      parts.push(renderImage(block, ctx))
    } else if (
      block.type === "heading_1" ||
      block.type === "heading_2" ||
      block.type === "heading_3"
    ) {
      parts.push(
        renderHeading(block, ctx.page, index === 0 && firstNoMarginTop, ctx.assetBaseUrl),
      )
    } else {
      const h4 = asHeading4Block(block)
      if (h4) {
        parts.push(
          renderHeading(h4, ctx.page, index === 0 && firstNoMarginTop, ctx.assetBaseUrl),
        )
      } else if (block.type === "bulleted_list_item") {
        parts.push(
          renderList(block, ctx, renderBlockChildren, undefined, index === 0 && firstNestedList),
        )
      } else if (block.type === "table") {
        parts.push(renderTable(block, ctx))
      } else if (block.type === "bookmark") {
        parts.push(renderBookmark(block, ctx))
      } else if (block.type === "child_page") {
        parts.push(renderChildPage(block, ctx))
      } else if (block.type === "column_list") {
        parts.push(renderColumnList(block, ctx, renderChildrenResults))
      } else if (block.type === "to_do") {
        parts.push(renderTodo(block, ctx, renderBlockChildren))
      } else if (block.type === "toggle") {
        parts.push(renderToggle(block, ctx, renderBlockChildren))
      } else if (block.type === "divider") {
        parts.push(renderDivider())
      } else if (block.type === "quote") {
        parts.push(renderQuote(block, ctx, renderBlockChildren))
      } else if (block.type === "callout") {
        parts.push(renderCallout(block, ctx, renderBlockChildren))
      } else if (block.type === "child_database") {
        parts.push(renderChildDatabase(block, ctx))
      } else if (block.type === "video") {
        parts.push(renderVideo(block, ctx))
      } else if (block.type === "file") {
        parts.push(renderFile(block, ctx.assetBaseUrl))
      } else if (block.type === "synced_block") {
        parts.push(renderSyncedBlock(block, ctx, renderChildrenResults))
      } else if (block.type === "link_to_page") {
        parts.push(renderLinkToPage(block, ctx))
      } else if (block.type === "code") {
        parts.push(renderCode(block))
      } else if (block.type === "equation") {
        parts.push(renderEquationBlock(block))
      } else if (block.type === "table_of_contents") {
        parts.push(renderTableOfContents(block, ctx))
      } else {
        parts.push(
          renderNotSupported(NotSupportedType.NOT_SUPPORTED, ctx, block.type),
        )
      }
    }
  }

  return parts.join("")
}
