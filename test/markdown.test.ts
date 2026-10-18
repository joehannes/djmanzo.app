import { describe, expect, it } from "vitest";
import { hasLink, markdown } from "../shared/markdown";

/** Whether the HTML holds any tag other than the ones the Markdown makes, or any script-like attribute. */
function onlyOurs(html: string): boolean {
  const tags = [...html.matchAll(/<(\/?)([a-zA-Z0-9]+)([^>]*)>/g)];
  return tags.every(([, closing, name, attrs]) => {
    if (!["p", "br", "strong", "em", "code", "pre", "blockquote", "ul", "ol", "li", "a"].includes(name)) return false;
    if (closing || name !== "a") return attrs.trim() === "";
    return /^ href="https:\/\/[^"<>]*" rel="nofollow ugc noopener noreferrer" target="_blank"$/.test(attrs);
  });
}

describe("Talkback's Markdown holds only text and its own marks", () => {
  it("makes the marks it knows", () => {
    expect(markdown("**bold** and *it* and `x<y`")).toBe("<p><strong>bold</strong> and <em>it</em> and <code>x&lt;y</code></p>");
    expect(markdown("- one\n- two")).toBe("<ul><li>one</li><li>two</li></ul>");
    expect(markdown("> said")).toBe("<blockquote>said</blockquote>");
    expect(markdown("```\n<b>\n```")).toBe("<pre><code>&lt;b&gt;</code></pre>");
    expect(markdown("[docs](https://example.test/a?b=1&c=2)")).toBe(
      '<p><a href="https://example.test/a?b=1&amp;c=2" rel="nofollow ugc noopener noreferrer" target="_blank">docs</a></p>',
    );
  });

  it("lets no attack through", () => {
    const attacks = [
      "<script>alert(1)</script>",
      "<img src=x onerror=alert(1)>",
      "[x](javascript:alert(1))",
      "[x](https://a.test/\"onmouseover=\"alert(1))",
      '[x](https://a.test/" onclick="alert(1))',
      "https://a.test/<script>",
      "<a href=\"javascript:alert(1)\">x</a>",
      "**<svg onload=alert(1)>**",
      "`</code><script>x</script>`",
      "[<img src=x onerror=1>](https://a.test)",
      "\u0000<script>\u0001",
      "<iframe src=//evil.test>",
      "[x](data:text/html;base64,PHNjcmlwdD4=)",
      "> <style>@import url(//evil.test)</style>",
      "1. <b onclick=x>",
    ];
    for (const a of attacks) {
      const html = markdown(a);
      expect(onlyOurs(html), `${a} → ${html}`).toBe(true);
      expect(html).not.toMatch(/<(script|img|iframe|svg|style|b )/i);
      expect(html).not.toMatch(/href="(?!https:)/);
    }
  });

  it("knows a link when it sees one", () => {
    expect(hasLink("see www.example.test")).toBe(true);
    expect(hasLink("http://x.test")).toBe(true);
    expect(hasLink("no links here")).toBe(false);
  });
});
