/**
 * The little Markdown Talkback is written in, made into HTML that can hold
 * nothing but text: every character a person typed is escaped first, and
 * only these marks become tags — paragraphs and line breaks, **bold**,
 * *italic*, `code`, fenced code blocks, quotes, lists, and links that are
 * https and nothing else. No raw HTML ever passes. The page puts the result
 * in with `{@html}`, so this file is the whole of what keeps a post from
 * being a script; its tests feed it the usual attacks.
 */

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** A link's address, if it is one a post may carry: https, no credentials. */
export function safeUrl(raw: string): string | null {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  if (u.protocol !== "https:" || u.username || u.password) return null;
  return u.toString();
}

const LINK_REL = 'rel="nofollow ugc noopener noreferrer" target="_blank"';

/** The inline marks, on text already escaped. */
function inline(escaped: string): string {
  const codes: string[] = [];
  // Code first, so nothing inside it is read as a mark.
  let s = escaped.replace(/`([^`\n]+)`/g, (_, c: string) => {
    codes.push(`<code>${c}</code>`);
    return `\u0000${codes.length - 1}\u0000`;
  });
  const links: string[] = [];
  const keep = (html: string) => {
    links.push(html);
    return `\u0001${links.length - 1}\u0001`;
  };
  // [text](https://…): the address is read back from its escaped form and checked.
  s = s.replace(/\[([^\]\n]{1,200})\]\((https:\/\/[^\s)]{1,500})\)/g, (all, label: string, href: string) => {
    const url = safeUrl(unescape(href));
    return url ? keep(`<a href="${escape(url)}" ${LINK_REL}>${label}</a>`) : all;
  });
  // A bare https address.
  s = s.replace(/(^|[\s(])(https:\/\/[^\s<]{1,500}?)(?=[.,;:!?)]*(\s|$))/g, (all, before: string, href: string) => {
    const url = safeUrl(unescape(href));
    return url ? `${before}${keep(`<a href="${escape(url)}" ${LINK_REL}>${href}</a>`)}` : all;
  });
  s = s.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*\w])\*([^*\n]+)\*(?!\w)/g, "$1<em>$2</em>");
  s = s.replace(/(^|[^_\w])_([^_\n]+)_(?!\w)/g, "$1<em>$2</em>");
  s = s.replace(/\u0001(\d+)\u0001/g, (_, i: string) => links[Number(i)]);
  return s.replace(/\u0000(\d+)\u0000/g, (_, i: string) => codes[Number(i)]).replace(/\n/g, "<br>");
}

/** Undo `escape`, to read an address back before checking it. */
function unescape(s: string): string {
  return s.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&");
}

/** Talkback's Markdown, as HTML that holds only text and the marks above. */
export function markdown(source: string): string {
  const lines = source.replace(/\r\n?/g, "\n").replace(/[\u0000\u0001]/g, "").split("\n");
  const out: string[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) out.push(`<p>${inline(escape(para.join("\n")))}</p>`);
    para = [];
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^```/.test(line)) {
      flush();
      const code: string[] = [];
      while (++i < lines.length && !/^```/.test(lines[i])) code.push(lines[i]);
      out.push(`<pre><code>${escape(code.join("\n"))}</code></pre>`);
      continue;
    }
    if (/^\s*$/.test(line)) {
      flush();
      continue;
    }
    if (/^>\s?/.test(line)) {
      flush();
      const quote: string[] = [];
      for (; i < lines.length && /^>\s?/.test(lines[i]); i++) quote.push(lines[i].replace(/^>\s?/, ""));
      i--;
      out.push(`<blockquote>${inline(escape(quote.join("\n")))}</blockquote>`);
      continue;
    }
    const bullet = /^\s*[-*]\s+/;
    const number = /^\s*\d{1,3}[.)]\s+/;
    if (bullet.test(line) || number.test(line)) {
      flush();
      const ordered = number.test(line);
      const marker = ordered ? number : bullet;
      const items: string[] = [];
      for (; i < lines.length && marker.test(lines[i]); i++) items.push(`<li>${inline(escape(lines[i].replace(marker, "")))}</li>`);
      i--;
      out.push(ordered ? `<ol>${items.join("")}</ol>` : `<ul>${items.join("")}</ul>`);
      continue;
    }
    para.push(line);
  }
  flush();
  return out.join("\n");
}

/** Whether a text carries a link of any kind: a new account's posts may not. */
export const hasLink = (s: string) => /(https?:\/\/|www\.)\S/i.test(s);
