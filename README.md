# notion-to-email

**Write in Notion. Send as email.**

Lightweight library that converts Notion pages into email-compatible HTML — table-based layouts, inline styles, zero runtime dependencies.

<p align="center">
  <img src="assets/preview.png" alt="notion-to-email preview" width="700" />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/notion-to-email"><img src="https://img.shields.io/npm/v/notion-to-email" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/notion-to-email"><img src="https://img.shields.io/npm/dm/notion-to-email" alt="npm downloads" /></a>
  <img src="https://img.shields.io/bundlephobia/minzip/notion-to-email" alt="bundle size" />
  <a href="https://github.com/Sangkwun/notion-to-email/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/notion-to-email" alt="license" /></a>
</p>

---

## Why?

Notion is a great writing tool. But turning a Notion page into an email that renders correctly across Gmail, Outlook, and Apple Mail is painful. This library handles the hard parts:

- **Email-safe HTML** — `<table>` layouts, inline styles, no CSS classes
- **23+ block types** — headings, lists, callouts, code blocks, images, tables, bookmarks, and more
- **Just 3 lines of code** — provide a page ID and token, get back a complete HTML email

## Quick Start

```bash
npm install notion-to-email @notionhq/client
```

```typescript
import { renderFromNotion } from 'notion-to-email'

const { html, title } = await renderFromNotion({
  pageId: 'your-page-id',
  token: 'your-notion-token',
})

// html → ready-to-send email HTML
// title → page title for the subject line
```

That's it. The library fetches the page, resolves images, and returns a complete `<!DOCTYPE html>` document.

## Options

```typescript
const result = await renderFromNotion({
  pageId: 'your-page-id',
  token: 'your-token',
  options: {
    // Custom image URL resolver (useful for private pages)
    resolveImageUrl: (url, context) => {
      // context: { blockId, blockType, pageId, isPublicPage, usage }
      return `https://your-cdn.com/proxy?url=${encodeURIComponent(url)}`
    },

    // Header
    header: {
      showNotionButton: true,
      notionButtonLabel: 'Open in Notion',
    },

    // Footer (HTML string or false to disable)
    footer: '<p>Sent via My App</p>',

    // Unsupported block handling
    onUnsupportedBlock: 'placeholder', // 'hide' | 'placeholder' | ((blockType) => string)
  },
})
```

### Advanced: Pre-fetched Data

If you need control over the fetch process (e.g., uploading images to your own storage before rendering):

```typescript
import { renderNotionEmail } from 'notion-to-email'
import type { ExtraData } from 'notion-to-email'

// Fetch and process data yourself
const html = renderNotionEmail(page, children, extraData, options)
```

## Supported Blocks

| Block | | Block | |
|---|---|---|---|
| Paragraph | ✅ | Image | ✅ |
| Heading 1–4 | ✅ | Video (YouTube) | ✅ |
| Bulleted List | ✅ | File | ✅ |
| Numbered List | ✅ | Bookmark | ✅ |
| To-Do | ✅ | Table | ✅ |
| Toggle | ✅ | Column List | ✅ |
| Quote | ✅ | Child Page | ✅ |
| Callout | ✅ | Child Database | ✅ |
| Divider | ✅ | Synced Block | ✅ |
| Code | ✅ | Link to Page | ✅ |
| Equation | ✅ | Table of Contents | ✅ |

Rich text annotations are fully supported: **bold**, *italic*, ~~strikethrough~~, `code`, <u>underline</u>, colors, and links.

## How It Works

1. Fetches the Notion page and all child blocks via the Notion API
2. Collects additional data (bookmark OG metadata, database info, nested children)
3. Renders each block to email-safe HTML using a lightweight string-based builder (~33KB, no react-email dependency)
4. Returns a complete HTML document ready to send

## Used By

<a href="https://notionto.email">
  <img src="https://notionto.email/images/notion-to-email.png" alt="notionto.email" width="32" height="32" />
  <strong>notionto.email</strong>
</a> — Convert Notion pages to beautiful emails in one click.

## License

MIT
