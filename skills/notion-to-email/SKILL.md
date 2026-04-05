---
name: notion-to-email
description: Render a Notion page to email-compatible HTML. Outputs HTML that works in Gmail, Outlook, and Apple Mail.
argument-hint: <page-id-or-url>
allowed-tools: Bash Read Write
---

# Notion to Email

Convert a Notion page to email HTML using the `notion-to-email` CLI.

## Prerequisites

The `NOTION_TOKEN` environment variable must be set, or the user must provide a `--token` flag.

## Instructions

Given a Notion page ID or URL from $ARGUMENTS:

1. Run the CLI to render the page:

```bash
npx notion-to-email $ARGUMENTS -o /tmp/notion-email-output.html
```

2. If the command succeeds, read the output file and show the user:
   - The page title (from CLI stderr output)
   - The HTML file path
   - A brief summary of the content

3. If the user wants to modify the HTML, edit `/tmp/notion-email-output.html` directly.

4. If no page ID is provided in $ARGUMENTS, ask the user for one.

## Error Handling

- If `NOTION_TOKEN` is not set, tell the user to set it: `export NOTION_TOKEN=secret_xxx`
- If the page ID is invalid, ask the user to double-check
- If `notion-to-email` is not installed, suggest: `npm install -g notion-to-email @notionhq/client`
