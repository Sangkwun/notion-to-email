import type { ChildDatabaseBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { renderDatabaseLinkView } from "./link-view"
import { el } from "../../html"
import type { RenderContext, DatabaseExtraInfo, DatabaseQueryExtraInfo } from "../../types/internal"

export function renderChildDatabase(
  block: ChildDatabaseBlockObjectResponse,
  ctx: RenderContext,
): string {
  const extraInfo = ctx.extraData[block.id]

  // database_query type: render selected view
  if (extraInfo?.type === "database_query") {
    const queryInfo = extraInfo as DatabaseQueryExtraInfo
    const viewType = queryInfo.viewType ?? "link"
    const content = renderDatabaseLinkView(block, ctx, queryInfo.info)
    return wrapDatabaseBlock(block.id, viewType, content)
  }

  // Default: database type or no extra info → link view
  const databaseInfo =
    extraInfo?.type === "database" ? (extraInfo as DatabaseExtraInfo) : undefined

  const content = renderDatabaseLinkView(block, ctx, databaseInfo?.info)
  return wrapDatabaseBlock(block.id, "link", content)
}

function wrapDatabaseBlock(blockId: string, viewType: string, content: string): string {
  return el(
    "section",
    {
      "data-block-id": blockId,
      "data-block-type": "child_database",
      "data-view-type": viewType,
      style: { position: "relative" },
    },
    content,
  )
}
