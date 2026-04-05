import { StyleProps, UNITLESS_PROPERTIES } from "./types/style"

// --- Text helpers ---

const ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}

/** Escape HTML special characters in text content */
export function text(content: string): string {
  return content.replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]!)
}

/** Insert raw HTML without escaping */
export function raw(html: string): string {
  return html
}

/** Join children, filtering out null/undefined/false/empty */
export function frag(
  ...children: (string | null | undefined | false | (string | null | undefined | false)[])[]
): string {
  return children
    .flat()
    .filter((c): c is string => typeof c === "string" && c !== "")
    .join("")
}

// --- Style serialization ---

/** Convert camelCase to kebab-case: fontSize → font-size */
function camelToKebab(str: string): string {
  // Handle vendor prefixes: WebkitTransform → -webkit-transform
  if (str.startsWith("Webkit") || str.startsWith("Moz") || str.startsWith("ms")) {
    str = str.charAt(0).toLowerCase() + str.slice(1)
    return "-" + str.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())
  }
  return str.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())
}

/** Convert a StyleProps object to an inline CSS string */
export function style(props: StyleProps): string {
  const parts: string[] = []
  for (const key in props) {
    const value = props[key]
    if (value === undefined) continue

    const cssKey = camelToKebab(key)
    let cssValue: string
    if (typeof value === "number") {
      cssValue = UNITLESS_PROPERTIES.has(key) ? String(value) : value === 0 ? "0" : `${value}px`
    } else {
      cssValue = value
    }
    parts.push(`${cssKey}:${cssValue}`)
  }
  return parts.join(";")
}

// --- HTML attribute helpers ---

/** React prop name → HTML attribute name mapping */
const ATTR_MAP: Record<string, string> = {
  cellPadding: "cellpadding",
  cellSpacing: "cellspacing",
  colSpan: "colspan",
  rowSpan: "rowspan",
  className: "class",
  htmlFor: "for",
  tabIndex: "tabindex",
}

type Attrs = Record<string, string | number | boolean | StyleProps | undefined>

const UNSAFE_URL_RE = /^\s*(javascript|data|vbscript)\s*:/i

/** Sanitize URL: block unsafe schemes */
function sanitizeUrl(url: string): string {
  return UNSAFE_URL_RE.test(url) ? "" : url
}

const URL_ATTRS = new Set(["href", "src", "action", "formaction", "poster"])

function serializeAttrs(attrs: Attrs): string {
  const parts: string[] = []
  for (const key in attrs) {
    const value = attrs[key]
    if (value === undefined || value === false) continue

    const htmlKey = ATTR_MAP[key] ?? key

    if (key === "style" && typeof value === "object") {
      const s = style(value as StyleProps)
      if (s) parts.push(`style="${s.replace(/"/g, "'")}"`)

    } else if (value === true) {
      parts.push(htmlKey)
    } else {
      const strValue = String(value)
      const safeValue = URL_ATTRS.has(htmlKey) ? sanitizeUrl(strValue) : strValue
      parts.push(`${htmlKey}="${text(safeValue)}"`)
    }
  }
  return parts.length > 0 ? " " + parts.join(" ") : ""
}

// --- Element builders ---

const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
])

/** Create an HTML element */
export function el(
  tag: string,
  attrs: Attrs = {},
  ...children: (string | null | undefined | false)[]
): string {
  const attrStr = serializeAttrs(attrs)
  if (VOID_ELEMENTS.has(tag)) {
    return `<${tag}${attrStr} />`
  }
  const inner = frag(...children)
  return `<${tag}${attrStr}>${inner}</${tag}>`
}

// --- Email layout helpers ---

/** <table role="presentation"> wrapper for email layouts */
export function section(
  attrs: Attrs = {},
  ...children: (string | null | undefined | false)[]
): string {
  return el(
    "table",
    {
      role: "presentation",
      cellPadding: 0,
      cellSpacing: 0,
      border: 0,
      width: "100%",
      ...attrs,
    },
    el("tbody", {}, ...children),
  )
}

/** <tr> shorthand */
export function row(
  attrs: Attrs = {},
  ...children: (string | null | undefined | false)[]
): string {
  return el("tr", attrs, ...children)
}

/** <td> shorthand */
export function column(
  attrs: Attrs = {},
  ...children: (string | null | undefined | false)[]
): string {
  return el("td", attrs, ...children)
}

/** Multi-column layout: creates a table row with columns of specified widths */
export function columns(
  widths: string[],
  contents: (string | null | undefined | false)[],
  attrs: Attrs = {},
): string {
  const cells = widths.map((width, i) =>
    column({ style: { width }, valign: "top" }, contents[i] ?? ""),
  )
  return section(attrs, row({}, ...cells))
}

/** <img> with display:block default (prevents email client spacing) */
export function img(attrs: Attrs = {}): string {
  return el("img", {
    style: { display: "block" },
    ...attrs,
  })
}

/** <a> with email-safe defaults */
export function a(
  attrs: Attrs = {},
  ...children: (string | null | undefined | false)[]
): string {
  return el(
    "a",
    {
      target: "_blank",
      ...attrs,
    },
    ...children,
  )
}

/** <br /> */
export function br(): string {
  return "<br />"
}
