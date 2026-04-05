import { describe, it, expect } from "vitest"
import { el, text, raw, frag, style, section, row, column, img, a, br } from "../src/html"

describe("text()", () => {
  it("escapes HTML special characters", () => {
    expect(text('<script>alert("xss")</script>')).toBe(
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;",
    )
  })

  it("escapes ampersands", () => {
    expect(text("foo & bar")).toBe("foo &amp; bar")
  })

  it("escapes single quotes", () => {
    expect(text("it's")).toBe("it&#39;s")
  })
})

describe("raw()", () => {
  it("returns HTML without escaping", () => {
    const svg = '<svg width="14"><path d="M0 0" /></svg>'
    expect(raw(svg)).toBe(svg)
  })
})

describe("frag()", () => {
  it("joins children, filtering nullish values", () => {
    expect(frag("a", null, "b", false, "c", undefined)).toBe("abc")
  })

  it("flattens nested arrays", () => {
    expect(frag(["a", "b"], "c")).toBe("abc")
  })

  it("filters empty strings", () => {
    expect(frag("a", "", "b")).toBe("ab")
  })
})

describe("style()", () => {
  it("converts camelCase to kebab-case", () => {
    expect(style({ fontSize: "1em" })).toBe("font-size:1em")
  })

  it("appends px to numeric values", () => {
    expect(style({ marginTop: 16 })).toBe("margin-top:16px")
  })

  it("does not append px to unitless properties", () => {
    expect(style({ lineHeight: 1.5, fontWeight: 600, opacity: 0.7 })).toBe(
      "line-height:1.5;font-weight:600;opacity:0.7",
    )
  })

  it("handles zero without px", () => {
    expect(style({ margin: 0 })).toBe("margin:0")
  })

  it("skips undefined values", () => {
    expect(style({ color: "red", background: undefined })).toBe("color:red")
  })

  it("handles vendor prefixes", () => {
    expect(style({ WebkitTransform: "scale(1)" })).toBe(
      "-webkit-transform:scale(1)",
    )
  })
})

describe("el()", () => {
  it("creates a basic element", () => {
    expect(el("div", {}, "hello")).toBe("<div>hello</div>")
  })

  it("creates void elements (self-closing)", () => {
    expect(el("br", {})).toBe("<br />")
    expect(el("hr", {})).toBe("<hr />")
  })

  it("serializes style props", () => {
    expect(el("div", { style: { color: "red" } }, "hi")).toBe(
      '<div style="color:red">hi</div>',
    )
  })

  it("serializes regular attributes", () => {
    expect(el("a", { href: "https://example.com" }, "link")).toBe(
      '<a href="https://example.com">link</a>',
    )
  })

  it("maps React prop names to HTML attributes", () => {
    expect(el("table", { cellPadding: 0 })).toBe(
      '<table cellpadding="0"></table>',
    )
  })

  it("handles boolean attributes", () => {
    expect(el("input", { disabled: true })).toBe("<input disabled />")
    expect(el("input", { disabled: false })).toBe("<input />")
  })

  it("escapes attribute values", () => {
    expect(el("a", { href: 'test"quote' })).toBe(
      '<a href="test&quot;quote"></a>',
    )
  })
})

describe("section()", () => {
  it("creates a presentation table", () => {
    const html = section({}, row({}, column({}, "cell")))
    expect(html).toContain('role="presentation"')
    expect(html).toContain('cellpadding="0"')
    expect(html).toContain('cellspacing="0"')
    expect(html).toContain("<tbody>")
    expect(html).toContain("<tr>")
    expect(html).toContain("<td>")
    expect(html).toContain("cell")
  })
})

describe("img()", () => {
  it("creates a self-closing img with display:block default", () => {
    const html = img({ src: "test.png", alt: "test" })
    expect(html).toContain("display:block")
    expect(html).toContain('src="test.png"')
    expect(html).toMatch(/<img[^>]*\/>/)
  })
})

describe("a()", () => {
  it("creates a link with target=_blank", () => {
    const html = a({ href: "https://example.com" }, "click")
    expect(html).toContain('target="_blank"')
    expect(html).toContain('href="https://example.com"')
    expect(html).toContain("click")
  })
})

describe("br()", () => {
  it("returns a br tag", () => {
    expect(br()).toBe("<br />")
  })
})
