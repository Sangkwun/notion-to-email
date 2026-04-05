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
```

Pass `html` straight to SES, SendGrid, or Nodemailer.

## No react-email needed

react-email generates excessive wrapper elements when converting Notion blocks to email. For the same page:

| | react-email | notion-to-email |
|---|---|---|
| Approach | JSX → `renderToStaticMarkup` | Direct string generation |
| Unnecessary wrappers | Many nested `<div>`s | None |
| Runtime deps | react, react-dom, @react-email/* | None |

## Supported Blocks

Paragraph, Heading 1–4, Bulleted/Numbered List, To-Do, Toggle, Quote, Callout, Divider, Code, Equation, Image, Video (YouTube), File, Bookmark, Table, Column List, Child Page, Child Database, Synced Block, Link to Page, Table of Contents

Rich text: **bold**, *italic*, ~~strikethrough~~, `code`, underline, colors, links, mentions

## Options

```typescript
await renderFromNotion({
  pageId: 'your-page-id',
  token: 'your-token',
  options: {
    // Proxy private page images through your own CDN
    resolveImageUrl: (url, context) => {
      return `https://your-cdn.com/proxy?url=${encodeURIComponent(url)}`
    },

    header: {
      showNotionButton: true,
      notionButtonLabel: 'Open in Notion',
    },

    // HTML string or false to disable
    footer: '<p>Sent via My App</p>',

    // 'hide' | 'placeholder' | ((blockType) => string)
    onUnsupportedBlock: 'placeholder',
  },
})
```

### Pre-fetched data

When you need control over the fetch process (e.g., uploading images to your own storage before rendering):

```typescript
import { renderNotionEmail } from 'notion-to-email'
import type { ExtraData } from 'notion-to-email'

const html = renderNotionEmail(page, children, extraData, options)
```

## Install

```bash
npm install notion-to-email @notionhq/client
```

`@notionhq/client` is a peer dependency. Requires Node 18+.

## Used By

<a href="https://notionto.email">
  <img src="https://notionto.email/images/notion-to-email.png" alt="notionto.email" width="24" height="24" style="vertical-align: middle" />
  <strong>notionto.email</strong>
</a>

## License

MIT
