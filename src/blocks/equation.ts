import type { EquationBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { el, text } from "../html"
import { MONOSPACE_FONT } from "../constants"
import type { StyleProps } from "../types/style"

const EQUATION_BLOCK_STYLE: StyleProps = {
  margin: "0.25em 0",
  padding: "1em 0",
  width: "100%",
  textAlign: "center",
  fontFamily: MONOSPACE_FONT,
  fontSize: "1em",
  color: "rgb(55, 53, 47)",
}

export function renderEquationBlock(block: EquationBlockObjectResponse): string {
  return el(
    "div",
    { style: EQUATION_BLOCK_STYLE },
    el(
      "p",
      {
        style: {
          margin: 0,
          fontFamily: "inherit",
          fontSize: "inherit",
          textAlign: "center",
        },
      },
      text(block.equation.expression),
    ),
  )
}
