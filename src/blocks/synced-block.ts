import type {
  BlockObjectResponse,
  PartialBlockObjectResponse,
  SyncedBlockBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints"
import type { RenderContext, PageChildrenExtraInfo } from "../types/internal"

export function renderSyncedBlock(
  block: SyncedBlockBlockObjectResponse,
  ctx: RenderContext,
  renderChildrenFromResults: (results: (BlockObjectResponse | PartialBlockObjectResponse)[], ctx: RenderContext) => string,
): string {
  const info = ctx.extraData[block.id] as PageChildrenExtraInfo | undefined
  if (!info) return ""
  return renderChildrenFromResults(info.info.results, ctx)
}
