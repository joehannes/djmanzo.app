import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { FACTS } from "../shared/facts";
import { jsonForScript, plain, render } from "../worker/seo";
import { escapeHtml } from "../shared/legal";
import { testEnv } from "./kv";
import { browser, crew, openSite, person } from "./people";

const TEMPLATE = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const ASSETS = { fetch: async () => new Response(TEMPLATE, { headers: { "content-type": "text/html" } }) };
const site = (extra: Record<string, unknown> = {}) => openSite({ ASSETS, DOWNLOAD_BASE: "https://github.com/joehannes/djmanzo/releases/latest", ...extra });
const fixture = (name: string) => new Uint8Array(readFileSync(new URL(`./fixtures/packs/${name}.djpack`, import.meta.url)));

/** A page as a crawler reads it: status, its head's parts, its JSON-LD, its words. */
async function read(env: never, path: string) {
  const { res } = await browser(env)(path);
  const html = await res.text();
  const meta = (attr: string, name: string) => html.match(new RegExp(`<meta ${attr}="${name}" content="([^"]*)"`))?.[1] ?? null;
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  return {
    status: res.status,
    robots: res.headers.get("x-robots-tag"),
    html,
    title: html.match(/<title>([^<]*)<\/title>/)?.[1] ?? null,
    description: meta("name", "description"),
    canonical: html.match(/<link rel="canonical" href="([^"]*)"/)?.[1] ?? null,
    og: (p: string) => meta("property", `og:${p}`),
    blocks,
    ld: blocks.map((b) => JSON.parse(b) as Record<string, any>),
    words: html.match(/<main id="static">([\s\S]*?)<\/main>/)?.[1] ?? "",
  };
}

const ofType = (ld: Record<string, any>[], type: string) => ld.find((j) => j["@type"] === type);

async function member(env: never, name: string) {
  const p = await person(env, name, 30);
  const first = await p.call("/api/talkback/posts", { method: "POST", json: { community: "mixing", title: `${name} says hello`, body: "Glad to be here." } });
  await crew(env)("/api/admin/crew/decide", { method: "POST", json: { kind: "post", target: first.data.id, keep: true } });
  return p;
}

describe("the home page, as a search engine reads it", () => {
  it("names djmanzo, what anyone can have of it, and everything that ships, in words", async () => {
    const env = site();
    const page = await read(env, "/");
    expect(page.status).toBe(200);
    expect(page.title).toBe("djmanzo — DJ and karaoke software for macOS and Linux");
    expect(page.canonical).toBe("https://djmanzo.test/");
    expect(page.og("image")).toBe("https://djmanzo.test/shots/share.jpg");
    const app = ofType(page.ld, "SoftwareApplication")!;
    expect(app).toMatchObject({ "@context": "https://schema.org", name: "djmanzo", operatingSystem: "macOS, Linux", applicationCategory: "MultimediaApplication" });
    // Only what can be had today: the free edition.
    expect(app.offers).toMatchObject({ price: "0", priceCurrency: "USD" });
    for (const f of FACTS) {
      if (f.status === "shipped") expect(page.words, f.id).toContain(escapeHtml(f.name));
      // Nothing planned is offered as done.
      else if (f.status === "planned") expect(page.words, f.id).not.toContain(`<b>${escapeHtml(f.name)}.</b>`);
    }
    expect(page.words).toContain('href="/outboard"');
    // One head, not two: the template's own block is replaced, not added to.
    expect(page.html.match(/<title>/g)).toHaveLength(1);
    expect(page.html.match(/name="description"/g)).toHaveLength(1);
  });

  it("keeps working when the database is not ready: the page still opens", async () => {
    const broken = { prepare: () => ({ bind: () => broken.prepare(), all: async () => Promise.reject(new Error("no such table: items")), first: async () => Promise.reject(new Error("no such table: items")) }) };
    const env = site({ DB: broken });
    const page = await read(env, "/outboard");
    expect(page.status).toBe(200);
    expect(page.html).toContain('<div id="app"></div>');
  });
});

describe("Outboard's pages", () => {
  it("give a listed item its own page, rated, and keep a waiting one out of sight", async () => {
    const env = site();
    const maker = await person(env, "Moss Maker");
    const up = await maker.call("/api/outboard/upload", { method: "POST", body: fixture("good-theme"), headers: { "content-type": "application/zip" } });
    const id = up.data.id as string;

    // Waiting for the crew: not there for anyone else, and not to be indexed.
    const waiting = await read(env, `/outboard/${id}`);
    expect(waiting.status).toBe(404);
    expect(waiting.robots).toBe("noindex");
    expect(waiting.html).toContain('<meta name="robots" content="noindex" />');
    expect(waiting.canonical).toBeNull();
    expect(await (await browser(env)("/sitemap.xml")).res.text()).not.toContain(id);

    await crew(env)("/api/admin/outboard/review", { method: "POST", json: { id, version: up.data.version, approve: true } });
    const fan = await person(env, "A Fan");
    await fan.call(`/api/outboard/items/${id}/rating`, { method: "POST", json: { stars: 4, review: "Calm on the eyes." } });

    const page = await read(env, `/outboard/${id}`);
    expect(page.status).toBe(200);
    // The maker as the pack names them; the page links their account's page.
    expect(page.title).toBe("Moss — a theme for djmanzo, by A Maker");
    expect(page.canonical).toBe(`https://djmanzo.test/outboard/${id}`);
    const work = ofType(page.ld, "CreativeWork")!;
    expect(work.aggregateRating).toMatchObject({ ratingValue: 4, ratingCount: 1, bestRating: 5 });
    expect(work.author.url).toBe(`https://djmanzo.test/outboard/maker/${maker.user.id}`);
    expect(ofType(page.ld, "BreadcrumbList")!.itemListElement).toHaveLength(3);
    expect(page.words).toContain("Calm on the eyes.");
    expect(page.words).toContain("/api/outboard/packs.json");

    const list = await read(env, "/outboard");
    expect(list.words).toContain(`href="/outboard/${id}"`);
    const sitemap = await (await browser(env)("/sitemap.xml")).res.text();
    expect(sitemap).toContain(`<loc>https://djmanzo.test/outboard/${id}</loc>`);
    expect(sitemap).toContain(`<loc>https://djmanzo.test/outboard/maker/${maker.user.id}</loc>`);
    expect((await read(env, `/outboard/maker/${maker.user.id}`)).status).toBe(200);
  });
});

describe("Talkback's pages", () => {
  it("give a live post its own page, with its comments, and nothing breaks out of the structured data", async () => {
    const env = site();
    const ana = await member(env, "Ana");
    const ben = await member(env, "Ben");
    const attack = '</script><script>alert("x")</script>';
    const p = await ana.call("/api/talkback/posts", { method: "POST", json: { community: "mixing", title: "Echo out or cut?", body: `Which **first**? ${attack}\n\n- echo\n- cut` } });
    expect(p.data.status).toBe("live");
    await ben.call(`/api/talkback/posts/${p.data.id}/comments`, { method: "POST", json: { body: "Echo, on the last phrase." } });

    const page = await read(env, `/talkback/${p.data.id}`);
    expect(page.status).toBe(200);
    expect(page.canonical).toBe(`https://djmanzo.test/talkback/${p.data.id}`);
    // The words arrive whole in the JSON-LD, and no block holds a way out of its <script>.
    for (const b of page.blocks) expect(b).not.toMatch(/<\/?script/i);
    const forum = ofType(page.ld, "DiscussionForumPosting")!;
    expect(forum.headline).toBe("Echo out or cut?");
    expect(forum.text).toContain(attack);
    expect(forum.comment).toHaveLength(1);
    expect(forum.comment[0]).toMatchObject({ text: "Echo, on the last phrase.", author: { name: "Ben" } });
    // And in the page's words it is text, not markup.
    expect(page.words).not.toContain("<script>");
    expect(page.words).toContain("&lt;/script&gt;");
    expect(page.words).toContain("<strong>first</strong>");
    expect(page.words).toContain('href="/talkback/c/mixing"');

    expect((await read(env, "/talkback/c/mixing")).words).toContain(`href="/talkback/${p.data.id}"`);
    expect((await read(env, "/talkback/c/nowhere")).status).toBe(404);
  });

  it("keep a held post and a removed one out of sight, and out of the sitemap", async () => {
    const env = site();
    const fresh = await person(env, "Fresh", 0);
    const held = await fresh.call("/api/talkback/posts", { method: "POST", json: { community: "mixing", title: "Waiting", body: "For the crew." } });
    expect(held.data.status).toBe("held");
    const heldPage = await read(env, `/talkback/${held.data.id}`);
    expect(heldPage.status).toBe(404);
    expect(heldPage.robots).toBe("noindex");

    const ana = await member(env, "Ana");
    const gone = await ana.call("/api/talkback/posts", { method: "POST", json: { community: "mixing", title: "To be removed", body: "Soon." } });
    await crew(env)("/api/admin/crew/decide", { method: "POST", json: { kind: "post", target: gone.data.id, keep: false, reason: "Off topic (rule 1)." } });
    const removed = await read(env, `/talkback/${gone.data.id}`);
    expect(removed.status).toBe(410);
    expect(removed.robots).toBe("noindex");
    expect(removed.words).not.toContain("Soon.");

    const sitemap = await (await browser(env)("/sitemap.xml")).res.text();
    expect(sitemap).not.toContain(held.data.id);
    expect(sitemap).not.toContain(gone.data.id);
    expect(sitemap).toContain("<loc>https://djmanzo.test/talkback/c/mixing</loc>");
  });
});

describe("the site's own pages", () => {
  it("say who runs the site, or that it is being completed, in the same words as the page", async () => {
    const env = site();
    const imprint = await read(env, "/imprint");
    expect(imprint.words).toContain("The Owner");
    expect(imprint.words).toContain("mailto:owner@example.test");
    const terms = await read(env, "/terms");
    expect(terms.words).toContain('<a class="link" href="/rules">community rules</a>');
    expect(terms.words).toContain("Ask at owner@example.test");
    expect((await read(env, "/privacy")).words).toContain("<i>Forget me</i>");

    const unfinished = testEnv({ ASSETS });
    expect((await read(unfinished, "/imprint")).words).toContain("The imprint is being completed");
    expect((await read(unfinished, "/terms")).words).toContain("Ask at the address in the imprint, once it is filled in");
  });
});

describe("the blog", () => {
  it("gives each published post its address, in each of its languages, and keeps drafts out", async () => {
    const env = site();
    const write = (json: Record<string, unknown>) => crew(env)("/api/admin/blog", { method: "POST", json });
    await write({ title: "Reading the room", slug: "reading-the-room", lang: "en", excerpt: "What a floor tells you.", body: "## Watch\n\nThe **floor** speaks.", published: true });
    await write({ title: "Den Raum lesen", slug: "reading-the-room", lang: "de", excerpt: "Was der Floor sagt.", body: "Der **Floor** spricht.", published: true });
    await write({ title: "Not yet", slug: "not-yet", lang: "en", excerpt: "", body: "Draft.", published: false });

    const en = await read(env, "/blog/reading-the-room");
    expect(en.status).toBe(200);
    expect(en.canonical).toBe("https://djmanzo.test/blog/reading-the-room");
    expect(en.html).toContain('<link rel="alternate" hreflang="de" href="https://djmanzo.test/blog/reading-the-room?lang=de" />');
    expect(ofType(en.ld, "BlogPosting")).toMatchObject({ headline: "Reading the room", inLanguage: "en" });
    expect(en.words).toContain("<strong>floor</strong>");
    expect(en.words).toContain("Written by");

    const de = await read(env, "/blog/reading-the-room?lang=de");
    expect(de.canonical).toBe("https://djmanzo.test/blog/reading-the-room?lang=de");
    expect(de.html).toContain('<html lang="de">');

    expect((await read(env, "/blog/not-yet")).status).toBe(404);
    const sitemap = await (await browser(env)("/sitemap.xml")).res.text();
    expect(sitemap).toContain("<loc>https://djmanzo.test/blog/reading-the-room?lang=de</loc>");
    expect(sitemap).toContain('hreflang="de" href="https://djmanzo.test/blog/reading-the-room?lang=de"');
    expect(sitemap).not.toContain("not-yet");
    expect((await read(env, "/blog")).words).toContain('href="/blog/reading-the-room"');
  });
});

describe("for crawlers", () => {
  it("robots.txt keeps them out of the API and points at the sitemap", async () => {
    const text = await (await browser(site())("/robots.txt")).res.text();
    expect(text).toContain("Disallow: /api/");
    expect(text).toContain("Sitemap: https://djmanzo.test/sitemap.xml");
  });

  it("an address that names nothing is not a page", async () => {
    const env = site();
    for (const path of ["/outboard/a/b/c", "/talkback/c/x/y", "/blog/a/b"]) expect((await read(env, path)).status, path).toBe(404);
  });

  it("writes JSON that cannot end a script, and descriptions without Markdown", () => {
    const s = jsonForScript({ t: "</script><!-- \u2028 & >" });
    expect(s).not.toMatch(/[<>&\u2028]/);
    expect(JSON.parse(s).t).toBe("</script><!-- \u2028 & >");
    expect(plain("## Hi\n\nSee [the **docs**](https://x.test) and `code`.")).toBe("Hi See the docs and code.");
    expect(plain("word ".repeat(100), 40).length).toBeLessThanOrEqual(40);
    expect(() => render("<html></html>", { status: 200, title: "", description: "", path: "/", jsonld: [], body: "" }, "https://x.test")).toThrow(/seo/);
  });
});
