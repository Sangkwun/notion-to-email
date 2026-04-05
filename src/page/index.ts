import type {
  PageObjectResponse,
  ListBlockChildrenResponse,
} from "@notionhq/client/build/src/api-endpoints"
import { el, a, img, text } from "../html"
import { FONT_FAMILY, DEFAULT_COLOR, ColorMap } from "../constants"
import { renderCoverWithIcon } from "./cover"
import { renderPageTitle } from "./title"
import { renderChildrenResults } from "../blocks/children"
import { getTitleFromPage } from "../utils"
import type { RenderContext } from "../types/internal"
import type { RenderOptions } from "../types/index"

export function renderPage(
  page: PageObjectResponse,
  children: ListBlockChildrenResponse,
  ctx: RenderContext,
  options?: RenderOptions,
): string {
  const { cover, icon } = page
  const title = getTitleFromPage(page)

  const showNotionButton = options?.header?.showNotionButton !== false
  const notionButtonLabel = options?.header?.notionButtonLabel ?? options?.labels?.viewOnNotion ?? "View on Notion"
  const footer = options?.footer

  const coverHtml = renderCoverWithIcon(cover, icon, ctx)
  const titleHtml = renderPageTitle(title)

  const notionButtonHtml = showNotionButton
    ? a(
        {
          href: page.url,
          style: {
            fontSize: "16px",
            color: "#1F6017",
            borderRadius: "0.25em",
            marginTop: "0.5em",
            display: "inline-block",
            textDecoration: "none",
          },
        },
        img({
          style: {
            width: "1.2em",
            height: "1.2em",
            opacity: 0.6,
            display: "inline-block",
            verticalAlign: "middle",
            paddingRight: "0.3em",
          },
          src: `${ctx.assetBaseUrl}/images/notion-logo.png`,
        }),
        el(
          "span",
          {
            style: {
              fontSize: "0.8em",
              lineHeight: "1.2em",
              color: ColorMap.gray,
              fontWeight: "normal",
              verticalAlign: "middle",
            },
          },
          text(notionButtonLabel),
        ),
      )
    : ""

  const hrHtml = el("hr", {
    style: { width: "100%", border: "none", borderTop: "1px solid #eaeaea", marginTop: "1.5em" },
  })

  const contentHtml = renderChildrenResults(children.results, ctx)

  const footerHtml =
    footer === false
      ? ""
      : footer
        ? el("div", { style: { padding: "24px 0" } }, footer)
        : ""

  const bodyContent = el(
    "div",
    {
      style: {
        margin: "0 auto",
        width: "100%",
        maxWidth: "37.5em",
      },
    },
    coverHtml,
    titleHtml,
    notionButtonHtml,
    hrHtml,
    contentHtml,
    hrHtml,
    footerHtml,
  )

  return [
    "<!DOCTYPE html>",
    el(
      "html",
      {},
      el(
        "head",
        {},
        el("meta", { "http-equiv": "Content-Type", content: "text/html; charset=UTF-8" }),
        el("meta", { name: "viewport", content: "width=device-width, initial-scale=1.0" }),
      ),
      el(
        "body",
        {
          style: {
            backgroundColor: "#ffffff",
            margin: "0",
            lineHeight: "1.5",
            fontFamily: FONT_FAMILY,
            boxSizing: "border-box",
            lineBreak: "anywhere",
            wordBreak: "break-all",
            padding: "24px 16px",
            fontSize: "16px",
            color: DEFAULT_COLOR,
          },
        },
        bodyContent,
      ),
    ),
  ].join("")
}
