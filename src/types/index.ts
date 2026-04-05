/**
 * Public API types for notion-to-email
 */
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"

export type { StyleProps } from "./style"

/** Options for renderFromNotion */
export interface RenderFromNotionOptions {
  /** Notion page ID */
  pageId: string
  /** Notion integration token */
  token: string
  /** Render options */
  options?: RenderOptions
}

/** Render options */
export interface RenderOptions {
  /**
   * Custom image URL resolver.
   * Public pages have a default implementation using Notion's public image API.
   * Override for private pages or custom CDN.
   */
  resolveImageUrl?: (url: string, context: ImageContext) => string

  /** Page header options */
  header?: {
    /** Show "View on Notion" button (default: true) */
    showNotionButton?: boolean
    /** Custom label for the button */
    notionButtonLabel?: string
  }

  /** Footer HTML string, or false to disable */
  footer?: string | false

  /** How to handle unsupported block types */
  onUnsupportedBlock?: "hide" | "placeholder" | ((blockType: string) => string)

  /** Custom labels (default: English) */
  labels?: {
    viewOnNotion?: string
    unsupportedBlock?: string
  }
}

/** Context passed to resolveImageUrl callback */
export interface ImageContext {
  blockId: string
  blockType: string
  pageId: string
  isPublicPage: boolean
  usage: "image" | "cover" | "icon" | "file"
}

/** Result from renderFromNotion */
export interface RenderResult {
  /** Full HTML email document */
  html: string
  /** Page title */
  title: string
  /** Page icon (emoji or URL) */
  icon: string | null
  /** Notion page URL */
  url: string
  /** Whether the page is publicly shared */
  isPublicPage: boolean
}

/** Bookmark metadata (subset of OG data) */
export interface BookmarkOgData {
  ogTitle?: string
  ogDescription?: string
  ogImage?: Array<{ url: string; width?: string; height?: string }>
  favicon?: string
  ogUrl?: string
  requestUrl?: string
}

/** Page icon types */
export interface EmojiIcon {
  type: "emoji"
  emoji: string
}

export interface ExternalIcon {
  type: "external"
  external: { url: string }
}

export interface FileIcon {
  type: "file"
  file: { url: string; expiry_time: string }
}

export interface CustomEmojiIcon {
  type: "custom_emoji"
  custom_emoji: { id: string; name?: string; url?: string }
}

export type Icon = EmojiIcon | ExternalIcon | FileIcon | CustomEmojiIcon | null
export type Cover = ExternalIcon | FileIcon | null
