import type {
  PageObjectResponse,
  ListBlockChildrenResponse,
} from "@notionhq/client/build/src/api-endpoints"
import type { RenderFromNotionOptions, RenderResult, RenderOptions, ImageContext } from "./types/index"
import type { RenderContext, ExtraData } from "./types/internal"
import { DEFAULT_ASSET_BASE_URL } from "./constants"
import { defaultResolveImageUrl } from "./image"
import { renderPage } from "./page/index"

function createResolveImageUrl(
  page: PageObjectResponse,
  userResolver?: RenderOptions["resolveImageUrl"],
): (url: string, context: ImageContext) => string {
  return (url: string, context: ImageContext) => {
    if (userResolver) {
      return userResolver(url, context)
    }
    // Pass blockId so Notion's image API can resolve the correct image
    return defaultResolveImageUrl(url, page, {
      width: 1520,
      blockId: context.blockId,
    })
  }
}

/**
 * Render pre-fetched Notion page data to email-compatible HTML.
 * Use this when you need control over the fetch process (e.g., image URL replacement).
 */
export function renderNotionEmail(
  page: PageObjectResponse,
  children: ListBlockChildrenResponse,
  extraData: ExtraData,
  options?: RenderOptions,
): string {
  const ctx: RenderContext = {
    page,
    extraData,
    options: {
      ...options,
      onUnsupportedBlock: options?.onUnsupportedBlock ?? "placeholder",
    },
    resolveImageUrl: createResolveImageUrl(page, options?.resolveImageUrl),
    assetBaseUrl: DEFAULT_ASSET_BASE_URL,
    isPublicPage: !!page.public_url,
  }

  return renderPage(page, children, ctx, options)
}

/**
 * Render a Notion page to email-compatible HTML.
 * Fetches the page and all required data automatically.
 */
export async function renderFromNotion(
  input: RenderFromNotionOptions,
): Promise<RenderResult> {
  const { fetchAndRender } = await import("./fetch")
  return fetchAndRender(input)
}
