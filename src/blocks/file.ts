import type { FileBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { el, section, row, column, a, img, text } from "../html"
import { TEXT_STYLES, DEFAULT_ASSET_BASE_URL } from "../constants"

export function renderFile(
  block: FileBlockObjectResponse,
  assetBaseUrl?: string,
): string {
  const baseUrl = assetBaseUrl ?? DEFAULT_ASSET_BASE_URL
  const fileDownloadURL =
    block.file.type === "file" ? block.file.file.url : block.file.external.url

  const expiryInfo =
    block.file.type === "file"
      ? el(
          "p",
          {
            style: {
              ...TEXT_STYLES.DEFAULT,
              fontSize: "0.75em",
              color: "rgba(55, 53, 47, 0.6)",
              margin: "0",
              width: "fit-content",
              display: "inline-block",
              paddingBottom: "0.25em",
              verticalAlign: "text-top",
              marginLeft: "0.25em",
            },
          },
          text(
            (() => {
              const date = new Date(block.file.file.expiry_time)
              return `Expires ${date.toLocaleString("en-US")}`
            })(),
          ),
        )
      : ""

  return section(
    {
      style: {
        margin: "1px 0",
        padding: "0.1875em 0.125em",
        tableLayout: "auto",
      },
    },
    row(
      {},
      column(
        {
          style: {
            width: "1.5em",
            height: "1.5em",
            paddingRight: "0.125em",
          },
        },
        img({
          style: { width: "1.2375em", height: "1.2375em" },
          src: `${baseUrl}/images/file_black.png`,
        }),
      ),
      column(
        {
          style: { marginRight: "0.125em", verticalAlign: "middle" },
        },
        a(
          {
            href: fileDownloadURL,
            style: { color: "inherit", display: "inline-block" },
          },
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
                margin: "0",
                lineHeight: "1.3em",
              },
            },
            text(block.file.name),
          ),
        ),
        expiryInfo,
      ),
    ),
  )
}
