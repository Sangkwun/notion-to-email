import { el } from "../html"

export function renderDivider(): string {
  return el("hr", {
    style: {
      width: "100%",
      border: "none",
      borderTop: "1px solid #eaeaea",
    },
  })
}
