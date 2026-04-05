# notion-to-email

**Write in Notion. Send as email.**

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

Give it a Notion page ID, get back email HTML that works in Gmail, Outlook, and Apple Mail.

```typescript
import { renderFromNotion } from 'notion-to-email'

const { html, title } = await renderFromNotion({
  pageId: 'your-page-id',
  token: 'your-notion-token',
})

// Pass html to SES, SendGrid, Nodemailer, etc.
```

## Install

```bash
npm install notion-to-email @notionhq/client
```

`@notionhq/client` is a peer dependency. Requires Node 18+.

## Usage

### Library

```typescript
import { renderFromNotion } from 'notion-to-email'

const result = await renderFromNotion({
  pageId: 'your-page-id',
  token: 'your-notion-token',
})

result.html   // Full HTML email document
result.title  // Page title
result.icon   // Page icon (emoji or URL)
result.url    // Notion page URL
```

### CLI

```bash
# Output HTML to stdout
npx notion-to-email <page-id> --token secret_xxx

# Save to file
npx notion-to-email <page-id> -o email.html

# Use environment variable
export NOTION_TOKEN=secret_xxx
npx notion-to-email <page-id>

# Notion URL works too
npx notion-to-email https://notion.so/My-Page-abc123
```

### Claude Code skill

```bash
claude plugin add https://github.com/Sangkwun/notion-to-email

# Then in Claude Code:
/notion-to-email <page-id>
```

## Options

```typescript
await renderFromNotion({
  pageId: 'your-page-id',
  token: 'your-token',
  options: {
    // Proxy private page images through your own CDN
    resolveImageUrl: (url, context) => {
      // context: { blockId, blockType, pageId, isPublicPage, usage }
      return `https://your-cdn.com/proxy?url=${encodeURIComponent(url)}`
    },

    header: {
      showNotionButton: true,          // Show "View on Notion" button (default: true)
      notionButtonLabel: 'Open in Notion',
    },

    footer: '<p>Sent via My App</p>',  // HTML string, or false to disable

    // 'hide' | 'placeholder' | ((blockType) => string)
    onUnsupportedBlock: 'placeholder',

    labels: {
      viewOnNotion: 'View on Notion',
      unsupportedBlock: 'View on Notion',
    },
  },
})
```

### Pre-fetched data

When you need control over the fetch process — for example, to upload images to your own storage before rendering:

```typescript
import { renderNotionEmail } from 'notion-to-email'
import type { ExtraData } from 'notion-to-email'

const html = renderNotionEmail(page, children, extraData, options)
```

## Supported Blocks

| Block Type | Status |
|---|---|
| Paragraph | ✅ |
| Heading 1–4 | ✅ |
| Bulleted / Numbered List | ✅ |
| To-Do | ✅ |
| Toggle | ✅ |
| Quote | ✅ |
| Callout | ✅ |
| Divider | ✅ |
| Code | ✅ |
| Equation | ✅ |
| Image | ✅ |
| Video (YouTube) | ✅ |
| File | ✅ |
| Bookmark | ✅ |
| Table | ✅ |
| Column List | ✅ |
| Child Page | ✅ |
| Child Database | ✅ |
| Synced Block | ✅ |
| Link to Page | ✅ |
| Table of Contents | ✅ |

Rich text: **bold**, *italic*, ~~strikethrough~~, `code`, underline, colors, links, mentions

## Used By

<a href="https://notionto.email">
  <img src="https://notionto.email/images/notion-to-email.png" alt="notionto.email" width="24" height="24" style="vertical-align: middle" />
  <strong>notionto.email</strong>
</a> — Send Notion pages as beautiful emails

## License

MIT
