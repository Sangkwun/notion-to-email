import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"

function getPathFromUrl(url: string): string {
  return url.split(/[?#]/)[0]!
}

/**
 * Default image URL resolver for public Notion pages.
 * Converts Notion's internal image URLs to their public image API format.
 *
 * For private pages, returns the original URL as-is.
 * Users should provide a custom resolveImageUrl for private page images.
 */
export function defaultResolveImageUrl(
  imageUrl: string,
  page: PageObjectResponse,
  options: {
    width?: number
    blockId?: string
  } = {},
): string {
  try {
    if (!imageUrl) return ""

    // Firebase Storage URLs — pass through
    if (imageUrl.includes("storage.googleapis.com")) {
      return imageUrl
    }

    // Private page — return as-is
    if (!page.public_url) {
      return imageUrl
    }

    // Public page — use Notion's public image API
    const width = options.width ?? 1520
    const urlObj = new URL(getPathFromUrl(imageUrl))
    const pageOrigin = new URL(page.public_url).origin
    const publicImageUrl = new URL(
      `${pageOrigin}/image/${encodeURIComponent(urlObj.toString())}`,
    )
    const spaceID = urlObj.pathname.split("/")[1]

    publicImageUrl.searchParams.set("table", "block")
    publicImageUrl.searchParams.set("id", options.blockId ?? page.id)
    publicImageUrl.searchParams.set("spaceId", spaceID ?? "")
    publicImageUrl.searchParams.set("width", width.toString())
    publicImageUrl.searchParams.set("userId", "")
    publicImageUrl.searchParams.set("cache", "v2")

    return publicImageUrl.toString()
  } catch {
    return ""
  }
}
