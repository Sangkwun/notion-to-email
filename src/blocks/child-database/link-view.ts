import type {
  ChildDatabaseBlockObjectResponse,
  DatabaseObjectResponse,
} from "@notionhq/client/build/src/api-endpoints"
import { section, row, column, a, img, text } from "../../html"
import type { RenderContext } from "../../types/internal"

export function renderDatabaseLinkView(
  block: ChildDatabaseBlockObjectResponse,
  ctx: RenderContext,
  databaseInfo?: DatabaseObjectResponse,
): string {
  const childDatabasePublicURL = databaseInfo?.url || ctx.page.public_url || ctx.page.url

  return section(
    { style: { margin: "1px 0", padding: "0.1875em 0.125em" } },
    row(
      {},
      column(
        {
          style: {
            width: "1.5em",
            height: "1.5em",
            paddingRight: "0.125em",
            verticalAlign: "middle",
          },
        },
        img({
          style: { width: "1.2375em", height: "1.2375em" },
          src: `${ctx.assetBaseUrl}/images/table.png`,
        }),
      ),
      column(
        { style: { marginRight: "0.125em", verticalAlign: "middle" } },
        a(
          {
            href: childDatabasePublicURL,
            style: {
              color: "inherit",
              textDecoration: "none",
              fontSize: "1em",
              fontWeight: 500,
              lineHeight: "1.5em",
              borderBottom: "1px solid rgba(55, 53, 47, 0.16)",
            },
          },
          text(block.child_database.title || "Untitled"),
        ),
      ),
    ),
  )
}
