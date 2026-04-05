import type { LinkToPageBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { el, section, row, column, a, img, text } from "../html"
import { Color, TEXT_STYLES } from "../constants"
import { renderRichTexts } from "../richtext"
import { renderIconImg } from "./icon-img"
import { renderNotSupported, NotSupportedType } from "./not-supported"
import { getTitleFromPage } from "../utils"
import type { RenderContext, PageExtraInfo } from "../types/internal"

export function renderLinkToPage(
  block: LinkToPageBlockObjectResponse,
  ctx: RenderContext,
): string {
  if (block.link_to_page.type === "page_id") {
    const pageInfo = ctx.extraData[block.id] as PageExtraInfo | undefined
    const childPagePublicURL = pageInfo?.info.public_url || pageInfo?.info.url || ctx.page.url
    const title = pageInfo ? getTitleFromPage(pageInfo.info) : []
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

    const titleContent =
      title.length === 0
        ? text("Untitled")
        : renderRichTexts(title, Color.Default)

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
          titleContent,
        ),
      ),
    )

    return section(
      { style: { margin: "1px 0", padding: "0.1875em 0.125em" } },
      row({}, iconCell, contentCell),
    )
  }

  return renderNotSupported(NotSupportedType.NOT_SUPPORTED, ctx, block.type)
}
