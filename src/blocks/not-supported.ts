import { el, section, row, column, a, img, text } from "../html"
import { TEXT_STYLES } from "../constants"
import type { RenderContext } from "../types/internal"

export enum NotSupportedType {
  PRIVATE_PAGE,
  SVG_IMAGE,
  NOT_SUPPORTED,
}

const ICON_BY_TYPE: Record<NotSupportedType, string> = {
  [NotSupportedType.PRIVATE_PAGE]: "disabled_visible.png",
  [NotSupportedType.SVG_IMAGE]: "polyline.png",
  [NotSupportedType.NOT_SUPPORTED]: "warning.png",
}

const REASON_BY_TYPE: Record<NotSupportedType, string> = {
  [NotSupportedType.PRIVATE_PAGE]: "Please set the public setting in Notion.",
  [NotSupportedType.SVG_IMAGE]: "SVG image is not available.",
  [NotSupportedType.NOT_SUPPORTED]: "View on Notion",
}

export function renderNotSupported(
  type: NotSupportedType,
  ctx: RenderContext,
  blockType?: string,
): string {
  const onUnsupported = ctx.options.onUnsupportedBlock
  if (onUnsupported === "hide") return ""
  if (typeof onUnsupported === "function") {
    return onUnsupported(blockType ?? "unknown")
  }

  const baseUrl = ctx.assetBaseUrl
  const label = ctx.options.labels?.unsupportedBlock ?? REASON_BY_TYPE[type]
  const prefix = type === NotSupportedType.NOT_SUPPORTED && blockType ? `${blockType} ` : ""

  return a(
    { href: ctx.page.url },
    section(
      {
        style: {
          border: "1px solid #1F601750",
          borderRadius: "0.25em",
          padding: "1em 0.75em",
          margin: "1px 0",
        },
      },
      row(
        {},
        column(
          {
            style: {
              width: "1.2em",
              height: "1.2em",
              paddingRight: "0.5em",
              verticalAlign: "top",
            },
          },
          img({
            src: `${baseUrl}/images/${ICON_BY_TYPE[type]}`,
            alt: "Not supported",
            style: {
              width: "1.2em",
              height: "1.2em",
              objectFit: "contain",
              objectPosition: "center",
            },
          }),
        ),
        column(
          {},
          el(
            "p",
            {
              style: {
                margin: "0px",
                color: "#1F6017",
                ...TEXT_STYLES.DEFAULT,
                fontSize: "0.8em",
                maxHeight: "1.5em",
                textOverflow: "ellipsis",
                overflow: "hidden",
              },
            },
            text(prefix + label),
          ),
        ),
      ),
    ),
  )
}
