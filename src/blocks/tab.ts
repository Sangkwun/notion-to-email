import { isFullBlock } from "@notionhq/client"
import type {
  BlockObjectResponse,
  PartialBlockObjectResponse,
  TabBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints"
import { el, section, row, column } from "../html"
import { Color, TEXT_STYLES } from "../constants"
import { renderRichTexts } from "../richtext"
import { renderIconImg } from "./icon-img"
import { renderNotSupported, NotSupportedType } from "./not-supported"
import { notionBlockUrl, renderLinkCard, viewOnNotionLabel } from "./link-card"
import type { RenderContext } from "../types/internal"
import { pageChildren } from "../utils"

type RenderResults = (
  results: (BlockObjectResponse | PartialBlockObjectResponse)[],
  ctx: RenderContext,
  firstNoMarginTop?: boolean,
) => string

/**
 * Email can't switch tabs, so every tab is drawn in order: its label as a
 * subheading, then its content. Each tab is a paragraph child of the tab block;
 * the paragraph's rich_text and icon are the label, its children the content
 * (https://developers.notion.com/reference/block#tab).
 */
export function renderTab(
  block: TabBlockObjectResponse,
  ctx: RenderContext,
  renderChildrenResults: RenderResults,
): string {
  if (!block.has_children) return ""
  const tabs = pageChildren(ctx, block.id)
  if (!tabs) return renderNotSupported(NotSupportedType.NOT_SUPPORTED, ctx, block.type)

  return el(
    "div",
    { style: { margin: "0.25em 0" } },
    ...tabs.filter(isFullBlock).map((item) => {
      if (item.type !== "paragraph") return renderChildrenResults([item], ctx)
      const content = pageChildren(ctx, item.id)
      let body: string | null = null
      if (content) {
        body = renderChildrenResults(content, ctx, true)
      } else if (item.has_children) {
        // The tab's content was not fetched (fetch depth limit or error): link to it instead of dropping it
        body = renderLinkCard({
          href: notionBlockUrl(ctx, item.id),
          iconSrc: `${ctx.assetBaseUrl}/images/notion-logo.png`,
          title: viewOnNotionLabel(ctx),
        })
      }
      return el(
        "div",
        {},
        renderTabLabel(item.paragraph.rich_text, item.paragraph.icon, item, ctx),
        body ? el("div", { style: { padding: "0.375em 0 0.5em" } }, body) : null,
      )
    }),
  )
}

function renderTabLabel(
  label: Parameters<typeof renderRichTexts>[0],
  icon: Parameters<typeof renderIconImg>[0],
  block: BlockObjectResponse,
  ctx: RenderContext,
): string {
  const iconCell = icon
    ? column(
        { style: { width: "1.25em", paddingRight: "0.375em", verticalAlign: "middle" } },
        renderIconImg(icon, ctx, { externalIconSize: 20, emojiIconSize: 20, fileIconSize: 20, block }),
      )
    : null

  return section(
    {
      style: {
        marginTop: "0.75em",
        borderBottom: "1px solid rgba(55, 53, 47, 0.16)",
      },
    },
    row(
      {},
      iconCell,
      column(
        { style: { padding: "0.25em 0", verticalAlign: "middle" } },
        el(
          "div",
          { style: { ...TEXT_STYLES.H4, margin: "0" } },
          label.length > 0 ? renderRichTexts(label, Color.Default) : "",
        ),
      ),
    ),
  )
}
