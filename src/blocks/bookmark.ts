import type { BookmarkBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { el, section, row, column, a, img, text } from "../html"
import { ColorMap } from "../constants"
import { renderCaption } from "./caption"
import type { RenderContext, BookmarkExtraInfo } from "../types/internal"

function renderFavicon(favicon: string, origin: string): string {
  let src = favicon
  if (favicon.startsWith("//")) {
    src = "https:" + favicon
  } else if (!favicon.startsWith("http")) {
    src = origin + (favicon.startsWith("/") ? "" : "/") + favicon
  }
  return img({
    style: { width: "1em", height: "1em" },
    src,
  })
}

export function renderBookmark(
  block: BookmarkBlockObjectResponse,
  ctx: RenderContext,
): string {
  const extraInfo = ctx.extraData[block.id] as BookmarkExtraInfo | undefined
  const ogObject = extraInfo?.info
  const origin =
    ogObject && ogObject.requestUrl
      ? new URL(ogObject.requestUrl).origin
      : ""
  const image = ogObject?.ogImage?.find(
    (img: { url: string; type?: string }) => !img.type || img.type !== "svg",
  )

  const titleEl = el(
    "p",
    {
      style: {
        margin: "0px",
        fontSize: "0.875em",
        lineHeight: "1.25em",
        color: "rgb(55, 53, 47)",
        textOverflow: "ellipsis",
        maxHeight: "1.25em",
        overflow: "hidden",
        marginBottom: "0.125em",
      },
    },
    text(ogObject?.ogTitle ?? ""),
  )

  const descEl = el(
    "p",
    {
      style: {
        margin: "0px",
        fontSize: "0.75em",
        lineHeight: "1em",
        maxHeight: "3em",
        color: "rgba(55, 53, 47, 0.6)",
        height: "3em",
        wordBreak: "break-all",
        textOverflow: "ellipsis",
        overflow: "hidden",
      },
    },
    text(ogObject?.ogDescription ?? ""),
  )

  const faviconCell =
    ogObject?.favicon && !ogObject.favicon.includes(".svg")
      ? column(
          { style: { width: "1em", height: "1em", paddingRight: "0.375em" } },
          renderFavicon(ogObject.favicon, origin),
        )
      : ""

  const urlCell = column(
    { style: { width: "100%", height: "1em", margin: "0.375em" } },
    el(
      "p",
      {
        style: {
          fontSize: "0.75em",
          lineHeight: "1em",
          maxHeight: "1em",
          color: "rgb(55, 53, 47)",
          overflow: "hidden",
          margin: "0px",
        },
      },
      text(block.bookmark.url),
    ),
  )

  const urlRow = el(
    "table",
    {
      role: "presentation",
      cellPadding: 0,
      cellSpacing: 0,
      border: 0,
      style: { width: "100%", marginTop: "0.375em" },
    },
    el("tbody", {}, el("tr", {}, faviconCell, urlCell)),
  )

  const textColumn = column(
    {
      style: {
        width: image ? "60%" : "100%",
        maxHeight: "6.625em",
        padding: "0.75em 0.875em 0.875em",
        verticalAlign: "top",
      },
    },
    titleEl,
    descEl,
    urlRow,
  )

  const imageColumn = image
    ? column(
        { style: { width: "40%" } },
        img({
          style: {
            width: "100%",
            height: "6.625em",
            objectFit: "cover",
            objectPosition: "center",
            borderRadius: "0 0.625em 0.625em 0",
          },
          src: image.url,
        }),
      )
    : ""

  return el(
    "div",
    { style: { margin: "0.25em 0" } },
    a(
      {
        href: block.bookmark.url,
        style: { width: "100%", color: ColorMap.default },
      },
      section(
        {
          style: {
            border: "1px solid rgba(55, 53, 47, 0.16)",
            borderRadius: "0.625em",
            overflow: "hidden",
            width: "100%",
            maxHeight: "6.625em",
          },
        },
        row({}, textColumn, imageColumn),
      ),
    ),
    renderCaption(block.bookmark.caption),
  )
}
