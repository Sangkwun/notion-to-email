# notion-to-email

Convert Notion pages to email-compatible HTML.

<p align="center">
  <img src="assets/preview.png" alt="notion-to-email preview" width="700" />
</p>

## Features

- Renders Notion pages as email-safe HTML (table-based layouts, inline styles)
- Supports 23+ block types: paragraphs, headings, lists, callouts, code, images, tables, bookmarks, and more
- Zero runtime dependencies (only `@notionhq/client` as peer dependency)
- Automatic data fetching — just provide a page ID and token
- Public page image URL resolution built-in
- Custom image URL resolver for private pages
- Configurable headers, footers, and labels
- TypeScript-first with full type definitions
- Dual ESM/CJS output, ~32KB minified

## Installation

```bash
npm install notion-to-email @notionhq/client
```

## Usage

```typescript
import { renderFromNotion } from 'notion-to-email'

const result = await renderFromNotion({
  pageId: 'your-page-id',
  token: 'your-notion-integration-token',
})

console.log(result.html)   // Full HTML email document
console.log(result.title)  // Page title
console.log(result.icon)   // Page icon (emoji or URL)
console.log(result.url)    // Notion page URL
```

### Options

```typescript
const result = await renderFromNotion({
  pageId: 'your-page-id',
  token: 'your-token',
  options: {
    // Custom image URL resolver (for private pages)
    resolveImageUrl: (url, context) => {
      // context: { blockId, blockType, pageId, isPublicPage, usage }
      return `https://your-cdn.com/proxy?url=${encodeURIComponent(url)}`
    },

    // Page header
    header: {
      showNotionButton: true,        // Show "View on Notion" button (default: true)
      notionButtonLabel: 'Open in Notion',
    },

    // Footer HTML or false to disable
    footer: '<p>Sent by My App</p>',

    // Unsupported block handling
    onUnsupportedBlock: 'placeholder', // 'hide' | 'placeholder' | ((blockType) => string)

    // Custom labels
    labels: {
      viewOnNotion: 'View on Notion',
      unsupportedBlock: 'View on Notion',
    },
  },
})
```

## Supported Block Types

| Block Type | Status |
|------------|--------|
| Paragraph | ✅ |
| Heading 1-4 | ✅ |
| Bulleted List | ✅ |
| Numbered List | ✅ |
| To-Do | ✅ |
| Toggle | ✅ |
| Quote | ✅ |
| Callout | ✅ |
| Divider | ✅ |
| Image | ✅ |
| Code | ✅ |
| Equation | ✅ |
| Video (YouTube) | ✅ |
| File | ✅ |
| Bookmark | ✅ |
| Table | ✅ |
| Column List | ✅ |
| Child Page | ✅ |
| Child Database (Link View) | ✅ |
| Synced Block | ✅ |
| Link to Page | ✅ |
| Table of Contents | ✅ |

## License

MIT
