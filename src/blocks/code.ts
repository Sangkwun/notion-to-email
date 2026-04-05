import type { CodeBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { el, text } from "../html"
import { MONOSPACE_FONT } from "../constants"
import { renderCaption } from "./caption"
import type { StyleProps } from "../types/style"

const CODE_BLOCK_STYLE: StyleProps = {
  background: "rgb(247, 246, 243)",
  borderRadius: "0.625em",
  padding: "1.5em 1em",
  margin: "0.25em 0",
  width: "100%",
  maxWidth: "100%",
  fontFamily: MONOSPACE_FONT,
  fontSize: "85%",
  whiteSpace: "pre-wrap",
  wordBreak: "break-all",
  overflowWrap: "break-word",
  tabSize: 2,
}

export function renderCode(block: CodeBlockObjectResponse): string {
  const codeText = block.code.rich_text.map((rt) => rt.plain_text).join("")

  return el(
    "div",
    { style: { margin: "0.25em 0" } },
    el(
      "div",
      { style: CODE_BLOCK_STYLE },
      el(
        "p",
        {
          style: {
            margin: 0,
            fontFamily: "inherit",
            fontSize: "inherit",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            color: "inherit",
          },
        },
        text(codeText),
      ),
    ),
    renderCaption(block.code.caption),
  )
}
