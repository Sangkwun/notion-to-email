import type {
  Heading1BlockObjectResponse,
  Heading2BlockObjectResponse,
  Heading3BlockObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints"
import type { Heading4BlockObjectResponse } from "../types/heading4"
import { el, section, row, column, a, img } from "../html"
import { Color, isBackgroundColor, ColorMap, CalloutBackgroundColorMap, TEXT_STYLES, DEFAULT_ASSET_BASE_URL } from "../constants"
import { renderRichTexts } from "../richtext"
import type { StyleProps } from "../types/style"

type HeadingType = "heading_1" | "heading_2" | "heading_3" | "heading_4"

const headingStyle: Record<HeadingType, StyleProps> = {
  heading_1: { marginLeft: "0", marginTop: "2em", marginBottom: "0.5em", lineHeight: "1em", maxWidth: "100%" },
  heading_2: { marginLeft: "0", marginTop: "1.4em", marginBottom: "1px", lineHeight: "1em", maxWidth: "100%" },
  heading_3: { marginLeft: "0", marginTop: "1em", marginBottom: "1px", lineHeight: "1em", maxWidth: "100%" },
  heading_4: { marginLeft: "0", marginTop: "0.75em", marginBottom: "1px", lineHeight: "1em", maxWidth: "100%" },
}

const headingTextStyle: Record<HeadingType, StyleProps> = {
  heading_1: TEXT_STYLES.H1!,
  heading_2: TEXT_STYLES.H2!,
  heading_3: TEXT_STYLES.H3!,
  heading_4: TEXT_STYLES.H4!,
}

function buildTextStyle(blockType: HeadingType, color: Color): StyleProps {
  const s: StyleProps = {
    ...headingTextStyle[blockType],
    margin: "0",
    padding: blockType === "heading_1" ? "0.1875em 0.125em 0em" : "0.1875em 0.125em",
  }
  if (color !== "default") {
    if (color.includes("background")) {
      s.background = CalloutBackgroundColorMap[color]
    } else {
      s.color = ColorMap[color as Color]
    }
  }
  return s
}

type HeadingBlock =
  | Heading1BlockObjectResponse
  | Heading2BlockObjectResponse
  | Heading3BlockObjectResponse
  | Heading4BlockObjectResponse

export function renderHeading(
  block: HeadingBlock,
  page: { url: string; public_url: string | null },
  noMarginTop?: boolean,
  assetBaseUrl?: string,
): string {
  let headingType: HeadingType
  let color: Color
  let richText: RichTextItemResponse[]
  let isToggleable = false

  if ("heading_1" in block) {
    headingType = "heading_1"; color = (block as Heading1BlockObjectResponse).heading_1.color as Color
    richText = (block as Heading1BlockObjectResponse).heading_1.rich_text
    isToggleable = (block as Heading1BlockObjectResponse).heading_1.is_toggleable
  } else if ("heading_2" in block) {
    headingType = "heading_2"; color = (block as Heading2BlockObjectResponse).heading_2.color as Color
    richText = (block as Heading2BlockObjectResponse).heading_2.rich_text
    isToggleable = (block as Heading2BlockObjectResponse).heading_2.is_toggleable
  } else if ("heading_3" in block) {
    headingType = "heading_3"; color = (block as Heading3BlockObjectResponse).heading_3.color as Color
    richText = (block as Heading3BlockObjectResponse).heading_3.rich_text
    isToggleable = (block as Heading3BlockObjectResponse).heading_3.is_toggleable
  } else if ("heading_4" in block) {
    const h4 = block as Heading4BlockObjectResponse
    headingType = "heading_4"; color = h4.heading_4.color as Color
    richText = h4.heading_4.rich_text; isToggleable = h4.heading_4.is_toggleable
  } else {
    return ""
  }

  const textColor = color.includes("background") ? Color.Default : color
  const headingContent = el(
    "div",
    { style: buildTextStyle(headingType, color) },
    renderRichTexts(richText, textColor),
  )

  const containerStyle: StyleProps = {
    ...headingStyle[headingType],
    ...(noMarginTop ? { marginTop: "0" } : {}),
  }

  if (isToggleable) {
    const baseUrl = assetBaseUrl ?? DEFAULT_ASSET_BASE_URL
    const toggleLink = page.public_url || `${page.url}?pvs=4#${block.id.replaceAll("-", "")}`
    return section(
      { style: containerStyle },
      row(
        {},
        column(
          {
            style: {
              verticalAlign: "top",
              width: "1.25em",
              height: "1.5em",
              textAlign: "center",
              padding: "0.1875em 0.125em",
            },
          },
          a(
            { href: toggleLink, style: { textDecoration: "none", color: ColorMap.default } },
            img({
              style: { padding: "0.5em 0.375em", width: "0.6875em", height: "0.6875em" },
              src: `${baseUrl}/images/triangle.png`,
            }),
          ),
        ),
        column({ style: { width: "100%" } }, headingContent),
      ),
    )
  }

  return el("div", { style: containerStyle }, headingContent)
}
