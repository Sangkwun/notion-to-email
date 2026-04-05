/**
 * Internal types used within the renderer.
 * Not part of the public API.
 */
import type {
  BlockObjectResponse,
  DatabaseObjectResponse,
  ListBlockChildrenResponse,
  PageObjectResponse,
  PartialBlockObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints"
import type {
  DataSourceObjectResponse,
  QueryDataSourceResponse,
} from "@notionhq/client/build/src/api-endpoints/data-sources"
import type { BookmarkOgData, Icon, RenderOptions } from "./index"

/** Render context passed through the component tree */
export interface RenderContext {
  page: PageObjectResponse
  extraData: ExtraData
  options: Required<Pick<RenderOptions, "onUnsupportedBlock">> & RenderOptions
  resolveImageUrl: (url: string, context: import("./index").ImageContext) => string
  assetBaseUrl: string
}

// --- Extra data types ---

export type BookmarkExtraInfo = {
  type: "bookmark"
  info: BookmarkOgData
}

export type PageExtraInfo = {
  type: "page"
  info: PageObjectResponse
}

export type DatabaseExtraInfo = {
  type: "database"
  info: DatabaseObjectResponse
}

export type DatabaseQueryExtraInfo = {
  type: "database_query"
  viewType: "table" | "link"
  info: DatabaseObjectResponse
  dataSource: DataSourceObjectResponse
  rows: QueryDataSourceResponse
}

export type PageChildrenExtraInfo = {
  type: "page_children"
  info: ListBlockChildrenResponse
}

export type BlockExtraInfo = {
  type: "block"
  info: BlockObjectResponse
}

export type PagePathInfo = {
  type: "page_path"
  path: {
    id: string
    title: RichTextItemResponse[]
    icon: Icon
    url: string
  }[]
}

export type ExtraInfo =
  | BookmarkExtraInfo
  | PageChildrenExtraInfo
  | PageExtraInfo
  | BlockExtraInfo
  | PagePathInfo
  | DatabaseExtraInfo
  | DatabaseQueryExtraInfo

/** Map of block ID → extra info */
export type ExtraData = Record<string, ExtraInfo>

/** Column blocks structure */
export interface ColumnBlocks {
  type: "column_list"
  block: (PartialBlockObjectResponse | BlockObjectResponse)[]
  columns: ListBlockChildrenResponse[]
}
