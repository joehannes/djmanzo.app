/**
 * The site as a search engine, a link preview or a reader without script
 * sees it. The Signal Path is painted in the browser; every page with an
 * address of its own (the map, Outboard's items and makers, Talkback's
 * communities and posts, the site's own pages, the blog) is also rendered
 * here, into the same `index.html`: its own title, description, canonical
 * address, Open Graph and Twitter tags, structured data (JSON-LD), and its
 * real words and links in `<main id="static">`. The page's script takes that
 * away and opens the same place in the painting; the blog, which the Signal
 * Path does not show, stays a page to read.
 *
 * Nothing here is personal: it renders as a visitor nobody knows. What is
 * held for the crew, pending or removed answers 404 (410 once removed) and
 * asks not to be indexed. `/robots.txt` and `/sitemap.xml` list only what
 * anyone may read.
 */

import { COMING_KINDS, LISTED_KINDS } from "../shared/outboard";
import { COMMUNITIES, COMMUNITY_BY_ID, RULES, TRUST } from "../shared/talkback";
import { IMPRINT_MISSING, IMPRINT_WHAT, NO_CONTACT, PRIVACY, PRIVACY_INTRO, PRIVACY_OUTRO, SCREENING, TERMS, TERMS_INTRO, escapeHtml as esc, legalHtml } from "../shared/legal";
import { markdown as talkMarkdown } from "../shared/markdown";
import { FACTS, STATUS_LINE } from "../shared/facts";
import { EDITION_INFO } from "../shared/catalog";
import { markdown as blogMarkdown } from "../src/lib/markdown";
import { SUBTITLE, TITLE } from "../src/signal/aux/routes";
import type { AppEnv } from "./env";
import { HttpError, SECURITY_HEADERS } from "./http";
import * as blog from "./blog";
import * as market from "./market";
import * as people from "./people";
import * as talkback from "./talkback";

const SITE = "djmanzo";
const SHARE_IMAGE = "/shots/share.jpg";
const DEFAULT_DESCRIPTION = "djmanzo, a DJ and karaoke application for macOS and Linux — followed from the groove of a record to the bodies on the floor.";

/** What one page says about itself. */
export interface Page {
  status: number;
  title: string;
  description: string;
  /** Its canonical address: a path, with `?lang=` for a blog post in another language. */
  path: string;
  type?: "website" | "article" | "profile";
  /** Not to be indexed: a page that is not there, or not public. */
  noindex?: boolean;
  lang?: string;
  /** Other languages of the same page, for `hreflang`. */
  alternates?: { lang: string; path: string }[];
  jsonld: Record<string, unknown>[];
  /** The page's words, as HTML, for `<main id="static">`. */
  body: string;
}

// --- Writing it into the page -------------------------------------------------------

/** JSON for a `<script>` block: no `<`, `>` or `&` survive to end it early, nor the two line separators. */
export function jsonForScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/** Words for a description: Markdown's marks taken off, one line, at most `n` characters, cut at a word. */
export function plain(text: string, n = 160): string {
  const flat = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, "")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (flat.length <= n) return flat;
  const cut = flat.slice(0, n - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), n * 0.6)).trimEnd()}…`;
}

/** The page's head, as the template's `<!--seo-->` block is replaced by it. */
function head(page: Page, origin: string): string {
  const url = origin + page.path;
  const title = page.title;
  const lines = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(page.description)}" />`,
    page.noindex ? `<meta name="robots" content="noindex" />` : `<link rel="canonical" href="${esc(url)}" />`,
    ...(page.alternates ?? []).map((a) => `<link rel="alternate" hreflang="${esc(a.lang)}" href="${esc(origin + a.path)}" />`),
    `<meta property="og:site_name" content="${SITE}" />`,
    `<meta property="og:type" content="${page.type ?? "website"}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(page.description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(origin + SHARE_IMAGE)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(page.description)}" />`,
    `<meta name="twitter:image" content="${esc(origin + SHARE_IMAGE)}" />`,
    ...page.jsonld.map((j) => `<script type="application/ld+json">${jsonForScript({ "@context": "https://schema.org", ...j })}</script>`),
  ];
  return lines.join("\n    ");
}

/** `index.html` with this page in it: its head between `<!--seo-->` and `<!--/seo-->`, its words before the app. */
export function render(template: string, page: Page, origin: string): string {
  const open = template.indexOf("<!--seo-->");
  const close = template.indexOf("<!--/seo-->");
  if (open < 0 || close < open) throw new Error("index.html has lost its <!--seo--> block");
  const withHead = template.slice(0, open) + head(page, origin) + template.slice(close + "<!--/seo-->".length);
  const lang = page.lang ?? "en";
  return withHead
    .replace(/<html lang="[^"]*">/, `<html lang="${esc(lang)}">`)
    .replace(/<div id="(app|signal)"><\/div>/, (mount) => `<main id="static">\n${frame(page.body)}\n</main>\n    ${mount}`);
}

/** Every page's way about: home, the sends, the blog; and the site's own pages. */
function frame(body: string): string {
  return [
    `<nav aria-label="The site"><a href="/">djmanzo</a> · <a href="/outboard">Outboard</a> · <a href="/talkback">Talkback</a> · <a href="/blog">Blog</a></nav>`,
    body,
    `<footer><a href="/imprint">Imprint</a> · <a href="/terms">Terms</a> · <a href="/rules">Community rules</a> · <a href="/privacy">Privacy</a></footer>`,
  ].join("\n");
}

const iso = (ms: number) => new Date(ms).toISOString();

function crumbs(origin: string, trail: [string, string][]): Record<string, unknown> {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: origin + path })),
  };
}

function notFound(path: string, status = 404): Page {
  return {
    status,
    title: `Not here — ${SITE}`,
    description: "This page is not here, or not any more.",
    path,
    noindex: true,
    jsonld: [],
    body: `<h1>Not here</h1>\n<p>This page is not here${status === 410 ? " any more: it was removed, with reasons given to the person who wrote it" : ""}.</p>`,
  };
}

/** A page whose data turns out not to exist answers as such; any other failure is the caller's. */
async function orMissing(path: string, build: () => Promise<Page>): Promise<Page> {
  try {
    return await build();
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) return notFound(path);
    throw e;
  }
}

// --- The pages ------------------------------------------------------------------------

function home(env: AppEnv, origin: string): Page {
  const free = EDITION_INFO.hobbyist;
  return {
    status: 200,
    title: `${SITE} — DJ and karaoke software for macOS and Linux`,
    description: DEFAULT_DESCRIPTION,
    path: "/",
    jsonld: [
      { "@type": "WebSite", name: SITE, url: `${origin}/` },
      {
        "@type": "SoftwareApplication",
        name: SITE,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "macOS, Linux",
        description: STATUS_LINE,
        url: `${origin}/`,
        image: origin + SHARE_IMAGE,
        downloadUrl: env.DOWNLOAD_BASE || undefined,
        // Only what anyone can have today: the Hobbyist edition, free for ever.
        offers: { "@type": "Offer", name: `${free.name} edition`, description: free.tagline, price: "0", priceCurrency: "USD" },
      },
    ],
    body: [
      `<h1>djmanzo</h1>`,
      `<p>DJ and karaoke software for macOS and Linux: live stems, an assistant that explains its suggestions and can take over the mix, a karaoke night built in, and a Hobbyist edition that is free, for ever.</p>`,
      `<p>${esc(STATUS_LINE)}</p>`,
      `<h2>What it does</h2>`,
      // Only what ships, in the facts' own words: what is planned is not offered to a search engine as done.
      `<ul>${FACTS.filter((f) => f.status === "shipped").map((f) => `<li><b>${esc(f.name)}.</b> ${esc(f.about)}</li>`).join("")}</ul>`,
      `<h2>Beside it</h2>`,
      `<ul>`,
      `<li><a href="/pricing">Editions and pricing</a> — seven editions of one download, priced for where you are.</li>`,
      `<li><a href="/outboard">Outboard</a> — ${esc(SUBTITLE.outboard)}</li>`,
      `<li><a href="/talkback">Talkback</a> — ${esc(SUBTITLE.talkback)}</li>`,
      `<li><a href="/blog">The blog</a> — articles about DJing and djmanzo.</li>`,
      `<li><a href="/island/">The island</a> — your pass and licences, the wishlist, honest comparisons.</li>`,
      `<li><a href="/signal/">The Signal Path</a> and <a href="/shop/">the record shop</a> — earlier versions of this site.</li>`,
      env.DOWNLOAD_BASE ? `<li><a href="${esc(env.DOWNLOAD_BASE)}">Download djmanzo</a></li>` : "",
      `</ul>`,
    ].join("\n"),
  };
}

const kindName = (kind: string) => ({ theme: "theme", skin: "skin", visuals: "visuals pack" })[kind] ?? kind;
const stars = (mean: number | null, count: number) => (count ? `${mean!.toFixed(1)} ★ from ${count} rating${count === 1 ? "" : "s"}` : "not rated yet");

async function outboard(env: AppEnv, origin: string): Promise<Page> {
  const cards = env.DB ? await market.listing(env) : [];
  return {
    status: 200,
    title: `Outboard — themes, skins and visuals for ${SITE}`,
    description: SUBTITLE.outboard,
    path: "/outboard",
    jsonld: [
      {
        "@type": "CollectionPage",
        name: "Outboard",
        description: SUBTITLE.outboard,
        url: `${origin}/outboard`,
        mainEntity: { "@type": "ItemList", itemListElement: cards.slice(0, 100).map((c, i) => ({ "@type": "ListItem", position: i + 1, url: `${origin}/outboard/${c.id}`, name: c.name })) },
      },
      crumbs(origin, [[SITE, "/"], ["Outboard", "/outboard"]]),
    ],
    body: [
      `<h1>Outboard</h1>`,
      `<p>${esc(SUBTITLE.outboard)}</p>`,
      ...LISTED_KINDS.map((k) => {
        const of = cards.filter((c) => c.kind === k.kind);
        return `<h2>${esc(k.name)}</h2>\n<p>${esc(k.what)}</p>\n${of.length ? `<ul>${of.map((c) => `<li><a href="/outboard/${esc(c.id)}">${esc(c.name)}</a> by ${esc(c.author)} — ${esc(stars(c.rating.mean, c.rating.count))}</li>`).join("")}</ul>` : "<p>None listed yet.</p>"}`;
      }),
      `<h2>Coming</h2>`,
      `<ul>${COMING_KINDS.map((k) => `<li><b>${esc(k.name)}</b> — ${esc(k.what)}</li>`).join("")}</ul>`,
    ].join("\n"),
  };
}

async function outboardItem(env: AppEnv, origin: string, id: string): Promise<Page> {
  const path = `/outboard/${encodeURIComponent(id)}`;
  if (!env.DB) return notFound(path);
  return orMissing(path, async () => {
    const it = await market.item(env, id, null, false);
    const kind = kindName(it.kind);
    const description = plain(it.description || `A ${kind} for djmanzo, by ${it.author}. Free, under ${it.licence}.`);
    const reviews = (it.reviews as { stars: number; review: string; created: number }[]).filter((r) => r.review);
    return {
      status: 200,
      title: `${it.name} — a ${kind} for ${SITE}, by ${it.author}`,
      description,
      path,
      jsonld: [
        {
          "@type": "CreativeWork",
          name: it.name,
          description,
          url: origin + path,
          genre: kind,
          author: { "@type": "Person", name: it.author, url: `${origin}/outboard/maker/${encodeURIComponent(it.owner)}` },
          license: it.licence,
          version: it.version ?? undefined,
          dateModified: iso(it.updated),
          isAccessibleForFree: true,
          ...(it.rating.count
            ? { aggregateRating: { "@type": "AggregateRating", ratingValue: Number(it.rating.mean!.toFixed(2)), ratingCount: it.rating.count, bestRating: 5, worstRating: 1 } }
            : {}),
        },
        crumbs(origin, [[SITE, "/"], ["Outboard", "/outboard"], [it.name, path]]),
      ],
      body: [
        `<h1>${esc(it.name)}</h1>`,
        `<p>A ${esc(kind)} for djmanzo, by <a href="/outboard/maker/${esc(encodeURIComponent(it.owner))}">${esc(it.author)}</a> · ${esc(it.licence)}${it.version ? ` · version ${esc(it.version)}` : ""} · ${esc(stars(it.rating.mean, it.rating.count))}</p>`,
        it.description ? `<p>${esc(it.description)}</p>` : "",
        `<p>Free. In djmanzo: Settings → From packs → Browse packs…, add <code>${esc(origin)}/api/outboard/packs.json</code>, and install it from there. djmanzo checks it again before it does.</p>`,
        `<h2>Versions</h2>`,
        `<ul>${(it.versions as unknown as { version: string; changelog: string }[]).map((v) => `<li>${esc(v.version)}${v.changelog ? ` — ${esc(v.changelog)}` : ""}</li>`).join("")}</ul>`,
        reviews.length ? `<h2>What people say</h2>\n<ul>${reviews.map((r) => `<li>${"★".repeat(r.stars)} ${esc(r.review)}</li>`).join("")}</ul>` : "",
      ].join("\n"),
    };
  });
}

async function outboardMaker(env: AppEnv, origin: string, uid: string): Promise<Page> {
  const path = `/outboard/maker/${encodeURIComponent(uid)}`;
  if (!env.DB) return notFound(path);
  const m = await market.maker(env, uid);
  if (!m.name || !m.items.length) return notFound(path);
  return {
    status: 200,
    title: `${m.name} — a maker in Outboard, for ${SITE}`,
    description: plain(m.about || `${m.items.length} free pack${m.items.length === 1 ? "" : "s"} for djmanzo by ${m.name}.`),
    path,
    type: "profile",
    jsonld: [
      { "@type": "ProfilePage", url: origin + path, mainEntity: { "@type": "Person", name: m.name, description: m.about || undefined } },
      crumbs(origin, [[SITE, "/"], ["Outboard", "/outboard"], [m.name, path]]),
    ],
    body: [
      `<h1>${esc(m.name)}</h1>`,
      m.about ? `<p>${esc(m.about)}</p>` : "",
      `<ul>${m.items.map((c) => `<li><a href="/outboard/${esc(c.id)}">${esc(c.name)}</a> — a ${esc(kindName(c.kind))}</li>`).join("")}</ul>`,
      (m.links as { url: string; platform: string }[]).length
        ? `<p>Support ${esc(m.name)}: ${(m.links as { url: string; platform: string }[]).map((l) => `<a href="${esc(l.url)}" rel="nofollow ugc noopener noreferrer">${esc(l.platform)}</a>`).join(" · ")}</p>`
        : "",
    ].join("\n"),
  };
}

const postLine = (p: { id: string; title: string; author: string; comments: number }) =>
  `<li><a href="/talkback/${esc(p.id)}">${esc(p.title)}</a> — ${esc(p.author)}, ${p.comments} comment${p.comments === 1 ? "" : "s"}</li>`;

async function talkbackHome(env: AppEnv, origin: string): Promise<Page> {
  const communities = env.DB ? await talkback.communities(env) : COMMUNITIES.map((c) => ({ ...c, posts: 0 }));
  const recent = env.DB ? (await talkback.posts(env, { sort: "hot" })).slice(0, 30) : [];
  const groups = [...new Set(communities.map((c) => c.group))];
  return {
    status: 200,
    title: `Talkback — the DJs' discussion space, at ${SITE}`,
    description: SUBTITLE.talkback,
    path: "/talkback",
    jsonld: [{ "@type": "CollectionPage", name: "Talkback", description: SUBTITLE.talkback, url: `${origin}/talkback` }, crumbs(origin, [[SITE, "/"], ["Talkback", "/talkback"]])],
    body: [
      `<h1>Talkback</h1>`,
      `<p>${esc(SUBTITLE.talkback)}</p>`,
      ...groups.map(
        (g) =>
          `<h2>${esc(g)}</h2>\n<ul>${communities
            .filter((c) => c.group === g)
            .map((c) => `<li><a href="/talkback/c/${esc(c.id)}">${esc(c.name)}</a> — ${esc(c.about)}</li>`)
            .join("")}</ul>`,
      ),
      recent.length ? `<h2>Talked about now</h2>\n<ul>${recent.map(postLine).join("")}</ul>` : "",
    ].join("\n"),
  };
}

async function talkbackCommunity(env: AppEnv, origin: string, id: string): Promise<Page> {
  const c = COMMUNITY_BY_ID[id];
  const path = `/talkback/c/${encodeURIComponent(id)}`;
  if (!c) return notFound(path);
  const list = env.DB ? await talkback.posts(env, { community: id, sort: "hot" }) : [];
  return {
    status: 200,
    title: `${c.name} — Talkback, at ${SITE}`,
    description: c.about,
    path,
    jsonld: [
      { "@type": "CollectionPage", name: c.name, description: c.about, url: origin + path },
      crumbs(origin, [[SITE, "/"], ["Talkback", "/talkback"], [c.name, path]]),
    ],
    body: [`<h1>${esc(c.name)}</h1>`, `<p>${esc(c.about)}</p>`, list.length ? `<ul>${list.map(postLine).join("")}</ul>` : "<p>Nothing posted here yet.</p>"].join("\n"),
  };
}

async function talkbackPost(env: AppEnv, origin: string, id: string): Promise<Page> {
  const path = `/talkback/${encodeURIComponent(id)}`;
  if (!env.DB) return notFound(path);
  return orMissing(path, async () => {
    const { post, comments } = await talkback.thread(env, id, null);
    if (post.status === "removed") return notFound(path, 410);
    const c = COMMUNITY_BY_ID[post.community];
    const live = comments.filter((x) => x.status === "live");
    const description = plain(post.body) || post.title;
    return {
      status: 200,
      title: `${post.title} — ${c?.name ?? "Talkback"}, at ${SITE}`,
      description,
      path,
      type: "article",
      jsonld: [
        {
          "@type": "DiscussionForumPosting",
          headline: post.title,
          text: plain(post.body, 2000),
          url: origin + path,
          datePublished: iso(post.created),
          author: { "@type": "Person", name: post.author },
          interactionStatistic: [
            { "@type": "InteractionCounter", interactionType: "https://schema.org/LikeAction", userInteractionCount: Math.max(0, post.score) },
            { "@type": "InteractionCounter", interactionType: "https://schema.org/CommentAction", userInteractionCount: live.length },
          ],
          comment: live.slice(0, 50).map((x) => ({ "@type": "Comment", text: plain(x.body, 2000), datePublished: iso(x.created), author: { "@type": "Person", name: x.author } })),
        },
        crumbs(origin, [[SITE, "/"], ["Talkback", "/talkback"], ...(c ? ([[c.name, `/talkback/c/${c.id}`]] as [string, string][]) : []), [post.title, path]]),
      ],
      body: [
        `<article>`,
        `<h1>${esc(post.title)}</h1>`,
        `<p>${c ? `<a href="/talkback/c/${esc(c.id)}">${esc(c.name)}</a> · ` : ""}${esc(post.author)} · <time datetime="${iso(post.created)}">${iso(post.created).slice(0, 10)}</time>${post.item ? ` · about <a href="/outboard/${esc(post.item)}">an item in Outboard</a>` : ""}</p>`,
        talkMarkdown(post.body),
        `</article>`,
        live.length ? `<h2>${live.length} comment${live.length === 1 ? "" : "s"}</h2>\n<ul>${live.map((x) => `<li><b>${esc(x.author)}</b>${talkMarkdown(x.body)}</li>`).join("")}</ul>` : "",
      ].join("\n"),
    };
  });
}

function legal(env: AppEnv, origin: string, id: "imprint" | "terms" | "rules" | "privacy"): Page {
  const imprint = people.imprint(env);
  const contact = imprint ? imprint.email : NO_CONTACT;
  const html = (t: string) => legalHtml(t, contact);
  const words: Record<typeof id, string> = {
    imprint: imprint
      ? `<dl><dt>Run by</dt><dd>${esc(imprint.name)}</dd><dt>Address</dt><dd>${esc(imprint.address)}</dd><dt>E-mail</dt><dd><a href="mailto:${esc(imprint.email)}">${esc(imprint.email)}</a></dd><dt>What it is</dt><dd>${esc(IMPRINT_WHAT)}</dd></dl>`
      : `<p>${esc(IMPRINT_MISSING)}</p>`,
    rules: `<ol>${RULES.map((r) => `<li>${esc(r)}</li>`).join("")}</ol>\n<h2>How a new account grows in</h2>\n<ul>${TRUST.map((t) => `<li><b>${esc(t.name)}.</b> ${esc(t.about)}</li>`).join("")}</ul>\n<p>${esc(SCREENING)}</p>`,
    terms: `<p>${esc(TERMS_INTRO)}</p>\n<ol>${TERMS.map((c) => `<li><b>${esc(c.head)}</b> ${html(c.text)}</li>`).join("")}</ol>`,
    privacy: `<p>${esc(PRIVACY_INTRO)}</p>\n<ul>${PRIVACY.map((c) => `<li><b>${esc(c.head)}</b> ${html(c.text)}</li>`).join("")}</ul>\n<p>${html(PRIVACY_OUTRO)}</p>`,
  };
  return {
    status: 200,
    title: `${TITLE[id]} — ${SITE}`,
    description: SUBTITLE[id],
    path: `/${id}`,
    jsonld: [{ "@type": "WebPage", name: TITLE[id], description: SUBTITLE[id], url: `${origin}/${id}` }],
    body: `<h1>${esc(TITLE[id])}</h1>\n<p>${esc(SUBTITLE[id])}</p>\n${words[id]}`,
  };
}

const blogPath = (slug: string, lang: string) => `/blog/${encodeURIComponent(slug)}${lang === "en" ? "" : `?lang=${encodeURIComponent(lang)}`}`;

async function blogHome(env: AppEnv, origin: string, lang: string): Promise<Page> {
  const list = await blog.posts(env, { lang });
  return {
    status: 200,
    title: `The blog — ${SITE}`,
    description: "Articles about DJing, karaoke nights and djmanzo, each saying how it was written.",
    path: "/blog",
    jsonld: [{ "@type": "Blog", name: `The ${SITE} blog`, url: `${origin}/blog`, blogPost: list.slice(0, 50).map((p) => ({ "@type": "BlogPosting", headline: p.title, url: origin + blogPath(p.slug, p.lang) })) }],
    body: [`<h1>The blog</h1>`, list.length ? `<ul>${list.map((p) => `<li><a href="${esc(blogPath(p.slug, p.lang))}">${esc(p.title)}</a> — ${esc(p.excerpt)}</li>`).join("")}</ul>` : "<p>Nothing published yet.</p>"].join("\n"),
  };
}

async function blogPost(env: AppEnv, origin: string, slug: string, lang: string): Promise<Page> {
  return orMissing(blogPath(slug, lang), async () => {
    const p = await blog.post(env, slug, lang);
    const path = blogPath(p.slug, p.lang);
    const written = p.source.startsWith("ai:") ? `Drafted by an AI model${p.source.endsWith("+human") ? ", edited" : ""} and published by ${p.author}.` : `Written by ${p.author}.`;
    return {
      status: 200,
      title: `${p.title} — ${SITE}`,
      description: plain(p.excerpt || p.body),
      path,
      type: "article",
      lang: p.lang,
      alternates: p.languages.length > 1 ? [...p.languages.map((l) => ({ lang: l, path: blogPath(p.slug, l) })), { lang: "x-default", path: blogPath(p.slug, "en") }] : undefined,
      jsonld: [
        {
          "@type": "BlogPosting",
          headline: p.title,
          description: plain(p.excerpt || p.body),
          url: origin + path,
          inLanguage: p.lang,
          datePublished: iso(p.createdAt),
          dateModified: iso(p.updatedAt),
          author: { "@type": "Person", name: p.author },
          keywords: p.tags.length ? p.tags.join(", ") : undefined,
          image: p.cover && /^https:\/\//.test(p.cover) ? p.cover : origin + SHARE_IMAGE,
        },
        crumbs(origin, [[SITE, "/"], ["Blog", "/blog"], [p.title, path]]),
      ],
      body: [
        `<article>`,
        `<h1>${esc(p.title)}</h1>`,
        `<p class="byline"><time datetime="${iso(p.createdAt)}">${iso(p.createdAt).slice(0, 10)}</time> · ${esc(written)}</p>`,
        blogMarkdown(p.body),
        `</article>`,
        `<p><a href="/">The Signal Path</a> — what djmanzo is, followed from the groove to the floor.</p>`,
      ].join("\n"),
    };
  });
}

/** The page at this path, or null when it is none of these. */
export async function pageFor(env: AppEnv, url: URL): Promise<Page | null> {
  const origin = url.origin;
  const parts = url.pathname.split("/").filter(Boolean).map(decodeURIComponent);
  const [first, second, third] = parts;
  if (!parts.length) return home(env, origin);
  if (first === "outboard") {
    if (parts.length === 1) return outboard(env, origin);
    if (second === "maker" && third && parts.length === 3) return outboardMaker(env, origin, third);
    if (parts.length === 2) return outboardItem(env, origin, second);
    return notFound(url.pathname);
  }
  if (first === "talkback") {
    if (parts.length === 1) return talkbackHome(env, origin);
    if (second === "c" && third && parts.length === 3) return talkbackCommunity(env, origin, third);
    if (parts.length === 2) return talkbackPost(env, origin, second);
    return notFound(url.pathname);
  }
  if ((first === "imprint" || first === "terms" || first === "rules" || first === "privacy") && parts.length === 1) return legal(env, origin, first);
  if (first === "blog") {
    const lang = url.searchParams.get("lang") || "en";
    if (parts.length === 1) return blogHome(env, origin, lang);
    if (parts.length === 2) return blogPost(env, origin, second, lang);
    return notFound(url.pathname);
  }
  return null;
}

/** The rendered page as a response, or null to leave the request to the static files. */
export async function serve(req: Request, env: AppEnv): Promise<Response | null> {
  const url = new URL(req.url);
  const page = await pageFor(env, url);
  if (!page) return null;
  const template = await (await env.ASSETS.fetch(new Request(`${url.origin}/`))).text();
  return new Response(render(template, page, url.origin), {
    status: page.status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      // Nothing personal is in it; a minute or two old is fine.
      "cache-control": page.status === 200 ? "public, max-age=120" : "no-store",
      ...(page.noindex ? { "x-robots-tag": "noindex" } : {}),
      ...SECURITY_HEADERS,
    },
  });
}

// --- For crawlers -----------------------------------------------------------------------

export function robots(origin: string): Response {
  const lines = ["User-agent: *", "Allow: /", "Disallow: /api/", "Disallow: /auth/", "Disallow: /login/", "Disallow: /callback/", "", `Sitemap: ${origin}/sitemap.xml`, ""];
  return new Response(lines.join("\n"), { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } });
}

const xml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Everything anyone may read, with when it last changed where that is known. */
export async function sitemap(env: AppEnv, origin: string): Promise<Response> {
  type Entry = { path: string; lastmod?: number; alternates?: { lang: string; path: string }[] };
  const entries: Entry[] = ["/", "/outboard", "/talkback", "/blog", "/imprint", "/terms", "/rules", "/privacy", "/island/"].map((path) => ({ path }));
  entries.push(...COMMUNITIES.map((c) => ({ path: `/talkback/c/${c.id}` })));
  if (env.DB) {
    const items = await market.listing(env);
    entries.push(...items.map((c) => ({ path: `/outboard/${c.id}`, lastmod: c.updated })));
    entries.push(...[...new Set(items.map((c) => c.owner))].map((uid) => ({ path: `/outboard/maker/${encodeURIComponent(uid)}` })));
    const { results } = await env.DB.prepare("SELECT id, created FROM posts WHERE status = 'live' ORDER BY created DESC LIMIT 1000").all<{ id: string; created: number }>();
    entries.push(...results.map((p) => ({ path: `/talkback/${p.id}`, lastmod: p.created })));
  }
  const published = await blog.posts(env, {});
  const bySlug = new Map<string, typeof published>();
  for (const p of published) bySlug.set(p.slug, [...(bySlug.get(p.slug) ?? []), p]);
  for (const versions of bySlug.values()) {
    const alternates = versions.length > 1 ? versions.map((v) => ({ lang: v.lang, path: blogPath(v.slug, v.lang) })) : undefined;
    entries.push(...versions.map((v) => ({ path: blogPath(v.slug, v.lang), lastmod: v.updatedAt, alternates })));
  }
  const body = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
    ...entries.map(
      (e) =>
        `<url><loc>${xml(origin + e.path)}</loc>${e.lastmod ? `<lastmod>${iso(e.lastmod)}</lastmod>` : ""}${(e.alternates ?? []).map((a) => `<xhtml:link rel="alternate" hreflang="${xml(a.lang)}" href="${xml(origin + a.path)}"/>`).join("")}</url>`,
    ),
    `</urlset>`,
  ].join("\n");
  return new Response(body, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
