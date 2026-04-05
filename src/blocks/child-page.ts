import type { ChildPageBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { el, section, row, column, a, img, text } from "../html"
import { TEXT_STYLES } from "../constants"
import { renderIconImg } from "./icon-img"
import type { RenderContext, PageExtraInfo } from "../types/internal"

export function renderChildPage(
  block: ChildPageBlockObjectResponse,
  ctx: RenderContext,
): string {
  const pageInfo = ctx.extraData[block.id] as PageExtraInfo | undefined
  const childPagePublicURL = pageInfo?.info.public_url || pageInfo?.info.url || ctx.page.url
  const title = block.child_page.title
  const baseUrl = ctx.assetBaseUrl

  const iconCell = column(
    { style: { width: "1.5em", height: "1.5em", paddingRight: "0.125em" } },
    pageInfo?.info.icon
      ? renderIconImg(pageInfo.info.icon, ctx, {
          externalIconSize: 20,
          emojiIconSize: 20,
          fileIconSize: 20,
          block,
        })
      : img({
          style: { width: "1.2375em", height: "1.2375em" },
          src: `${baseUrl}/images/${block.has_children ? "page.png" : "page-empty.png"}`,
        }),
  )

  const contentCell = column(
    { style: { marginRight: "0.125em", verticalAlign: "middle" } },
    a(
      { href: childPagePublicURL, style: { color: "inherit", width: "fit-content", display: "block" } },
      el(
        "p",
        {
          style: {
            ...TEXT_STYLES.DEFAULT,
            whiteSpace: "pre",
            wordBreak: "break-all",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxHeight: "1.3em",
            width: "fit-content",
            maxWidth: "400px",
            fontWeight: 500,
            margin: "0",
            borderBottom: "1px solid rgba(55, 53, 47, 0.16)",
            lineHeight: "1.3em",
          },
        },
        text(title || "Untitled"),
      ),
    ),
  )

  return section(
    { style: { margin: "1px 0", padding: "0.1875em 0.125em" } },
    row({}, iconCell, contentCell),
  )
}
