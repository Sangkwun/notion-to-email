/**
 * Email-safe CSS properties.
 * Subset of CSS properties commonly supported by email clients.
 * Uses camelCase keys (converted to kebab-case by style()).
 */
export type StyleProps = {
  [key: string]: string | number | undefined
}

/**
 * CSS properties where numeric values should NOT have 'px' appended.
 * These are unitless in CSS spec.
 */
export const UNITLESS_PROPERTIES = new Set([
  "opacity",
  "lineHeight",
  "fontWeight",
  "zIndex",
  "order",
  "flexGrow",
  "flexShrink",
  "tabSize",
  "orphans",
  "widows",
])
