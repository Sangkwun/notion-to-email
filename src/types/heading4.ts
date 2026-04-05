import type { RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints"

/**
 * Notion API returns heading_4 blocks but @notionhq/client SDK
 * does not have a type definition for it yet.
 */
export interface Heading4BlockObjectResponse {
  type: "heading_4"
  heading_4: {
    rich_text: RichTextItemResponse[]
    color: string
    is_toggleable: boolean
  }
  parent:
    | { type: "page_id"; page_id: string }
    | { type: "block_id"; block_id: string }
    | { type: "database_id"; database_id: string }
    | { type: "workspace"; workspace: true }
  object: "block"
  id: string
  created_time: string
  created_by: { id: string; object: "user" }
  last_edited_time: string
  last_edited_by: { id: string; object: "user" }
  has_children: boolean
  archived: boolean
  in_trash: boolean
}

export function asHeading4Block(
  block: { type: string },
): Heading4BlockObjectResponse | null {
  if (block.type === "heading_4") {
    return block as Heading4BlockObjectResponse
  }
  return null
}
