/**
 * The djmanzo website's Worker: the API under `/api`, sign-in under
 * `/auth`, djmanzo's licence protocol, and the pages (static assets) for
 * everything else — the Signal Path at `/`, the island at `/island/`.
 */

import { CHEAPEST_WITH, EDITION_INFO, FOUNDATION, MARKET, MODULES, MODULE_PRICE, MODULE_TITLE, NAMED, PLANS, PLAN_INFO, PRO_MONTH, REASON, TRIAL_DAYS, listPrice } from "../shared/catalog";
import { FACTS, STATUS_LINE } from "../shared/facts";
import { STAGE_BY_ID } from "../src/stages/script";
import { COMING_KINDS, LISTED_KINDS } from "../shared/outboard";
import { COMMUNITIES, FLAIRS, RULES, TRUST } from "../shared/talkback";
import { BAND_NAME, BAND_SHARE, STUDENT_SHARE, band, currencyFor } from "../shared/regions";
import type { AppEnv } from "./env";
import * as auth from "./auth";
import * as blog from "./blog";
import * as checkout from "./checkout";
import * as community from "./community";
import * as applicence from "./applicence";
import * as activations from "./activations";
import * as guide from "./guide";
import * as market from "./market";
import { seedOnce, seedThreadsOnce } from "./seed";
import * as support from "./support";
import * as moderation from "./moderation";
import * as people from "./people";
import * as talkback from "./talkback";
import * as sense from "./sense";
import * as seo from "./seo";
import * as model from "./model";
import * as promo from "./promo";
import * as redeem from "./redeem";
import * as update from "./update";
import * as releaseNotes from "./notes";
import * as voucher from "./voucher";
import { inForce, keys } from "./licence";
import { HttpError, body, brake, clientIp, country, fail, json, text, unb64url } from "./http";
import { get, list, put, saveLicence, type Licence, type Order, type Promo, type User, type Video } from "./store";

type Handler = (ctx: Ctx) => Promise<Response | unknown>;

interface Ctx {
  req: Request;
  env: AppEnv;
  url: URL;
  params: Record<string, string>;
  exec: ExecutionContext;
}

const routes: { method: string; pattern: RegExp; keys: string[]; handler: Handler }[] = [];

/**
 * What djmanzo itself calls, from no web page: the only mutating requests
 * that may arrive from another origin (`worker/applicence.ts`).
 */
const APP_CALLS = ["/licence", "/renew", "/signout"];

function route(method: string, path: string, handler: Handler) {
  const keys: string[] = [];
  const pattern = new RegExp(
    "^" +
      path.replace(/:([a-zA-Z]+)/g, (_, k) => {
        keys.push(k);
        return "([^/]+)";
      }) +
      "/?$",
  );
  routes.push({ method, pattern, keys, handler });
}

const user = (c: Ctx) => auth.whoami(c.req, c.env);
const needUser = (c: Ctx) => auth.required(c.req, c.env);
const needAdmin = (c: Ctx) => auth.adminRequired(c.req, c.env);

// --- Sign-in -----------------------------------------------------------------

route("GET", "/auth/start/:provider", (c) => auth.start(c.req, c.env, c.params.provider));
// One address per provider for the browser and djmanzo alike; Apple posts its answer.
route("GET", "/callback/:provider", (c) => auth.callback(c.req, c.env, c.params.provider));
route("POST", "/callback/:provider", (c) => auth.callback(c.req, c.env, c.params.provider));
// The address used until 18 October, which a provider app registered then still names.
route("GET", "/auth/callback/:provider", (c) => auth.callback(c.req, c.env, c.params.provider));
route("POST", "/auth/callback/:provider", (c) => auth.callback(c.req, c.env, c.params.provider));
// For the crew: which sign-ins are offered, and the address to register at each provider.
route("GET", "/api/auth/check", async (c) => {
  await needAdmin(c);
  return { callbackPath: auth.callbackPath(c.env), providers: auth.check(c.env, c.url.origin) };
});
route("POST", "/api/auth/demo", async (c) => auth.demoSignIn(c.req, c.env, (await body<{ name?: string }>(c.req)).name ?? ""));
route("POST", "/api/auth/owner", async (c) => auth.ownerSignIn(c.req, c.env, (await body<{ token?: string }>(c.req)).token ?? ""));
route("POST", "/api/auth/signout", (c) => auth.signOut(c.req, c.env));

route("GET", "/api/me", async (c) => {
  const u = await user(c);
  // Where they support djmanzo, as each platform said (worker/support.ts).
  const supports = u ? await support.supportsDjmanzo(c.env, u) : [];
  return {
    user: u ? { ...auth.publicUser(u, c.env), supports, supporter: supports.length > 0 } : null,
    admin: await auth.isAdmin(c.req, c.env, u),
    providers: auth.enabledProviders(c.env),
    demo: auth.demoMode(c.env),
  };
});

route("GET", "/api/me/licences", async (c) => {
  const u = await needUser(c);
  return (await checkout.userLicences(c.env, u.id)).map((l) => ({ ...l, inForce: inForce(l) }));
});
// The licence line to paste into djmanzo, for a machine that cannot sign in itself.
route("GET", "/api/me/licence-line", async (c) => applicence.lineFor(c.env, await needUser(c)));
// The computers djmanzo is activated on, and removing one (`worker/activations.ts`).
route("GET", "/api/me/activations", async (c) => activations.view(await activations.activationsOf(c.env, (await needUser(c)).id), activations.most(c.env)));
route("DELETE", "/api/me/activations/:id", async (c) => {
  const u = await needUser(c);
  return activations.view(await activations.remove(c.env, u.id, c.params.id), activations.most(c.env));
});
route("GET", "/api/me/orders", async (c) => {
  const u = await needUser(c);
  const keys = await list<{ u: string }>(c.env.KV, "order:", 5000);
  const mine = keys.filter((k) => k.metadata?.u === u.id).map((k) => k.name);
  return (await Promise.all(mine.map((k) => get<Order>(c.env.KV, k)))).filter(Boolean);
});
route("GET", "/api/me/profile", async (c) => get(c.env.KV, `profile:${(await needUser(c)).id}`));
route("PUT", "/api/me/profile", async (c) => community.saveProfile(c.env, await needUser(c), await body(c.req, 9000)));

// --- The catalogue and a quote ---------------------------------------------

route("GET", "/api/catalog", async (c) => {
  const where = country(c.req);
  return {
    editions: EDITION_INFO,
    modules: MODULES.map((m) => ({ id: m, title: MODULE_TITLE[m], price: MODULE_PRICE[m], cheapest: CHEAPEST_WITH[m] })),
    foundation: FOUNDATION,
    plans: PLAN_INFO,
    prices: Object.fromEntries(NAMED.map((e) => [e, Object.fromEntries(PLANS.map((p) => [p, listPrice(e, p)]))])),
    reasons: REASON,
    facts: FACTS,
    status: STATUS_LINE,
    market: MARKET,
    proMonth: PRO_MONTH,
    bands: { share: BAND_SHARE, name: BAND_NAME },
    studentShare: STUDENT_SHARE,
    trialDays: TRIAL_DAYS,
    visitor: { country: where, band: band(where), currency: currencyFor(where) },
    pay: {
      demo: auth.demoMode(c.env),
      stripe: c.env.STRIPE_PUBLISHABLE_KEY && c.env.STRIPE_SECRET_KEY ? { key: c.env.STRIPE_PUBLISHABLE_KEY } : null,
      paypal: c.env.PAYPAL_CLIENT_ID && c.env.PAYPAL_CLIENT_SECRET ? { clientId: c.env.PAYPAL_CLIENT_ID } : null,
      transfer: !!c.env.BANK_TRANSFER_DETAILS,
    },
    major: Number(c.env.MAJOR_VERSION || 1),
    // The download screen, which lists the newest release's installers (`worker/update.ts`).
    downloads: new URL(c.env.DOWNLOAD_BASE || "/#download", c.url.origin).href,
    // Where djmanzo asks for updates, in the Tauri updater's own template (`worker/update.ts`).
    updates: `${c.url.origin}/api/update/{{target}}/{{arch}}/{{current_version}}`,
  };
});

route("POST", "/api/quote", async (c) => checkout.quote(c.env, await user(c), checkout.checkInput(await body(c.req))));

// --- Paying ------------------------------------------------------------------

route("POST", "/api/checkout/demo", async (c) => {
  const input = await body<Record<string, unknown>>(c.req);
  return checkout.demoCheckout(c.env, await needUser(c), {
    ...checkout.checkInput(input),
    instrument: text(input.instrument, 2).toUpperCase(),
    billing: text(input.billing, 2).toUpperCase(),
    acceptHigher: !!input.acceptHigher,
  });
});
route("POST", "/api/trial", async (c) => checkout.startTrial(c.env, await needUser(c), String((await body<{ edition?: string }>(c.req)).edition || "")));
route("GET", "/api/trial", async (c) => ({ had: await get(c.env.KV, `trial:${(await needUser(c)).id}`) }));
route("POST", "/api/checkout/free", async (c) => checkout.freeCheckout(c.env, await needUser(c), checkout.checkInput(await body(c.req))));
route("POST", "/api/redeem", async (c) => checkout.redeem(c.env, await needUser(c), String((await body<{ code?: string }>(c.req)).code || "")));
route("POST", "/api/checkout/stripe", async (c) => {
  const input = await body<Record<string, unknown>>(c.req);
  return checkout.stripeConfirm(c.env, await needUser(c), c.url.origin, {
    ...checkout.checkInput(input),
    paymentMethod: String(input.paymentMethod || ""),
    acceptHigher: !!input.acceptHigher,
  });
});
route("POST", "/api/checkout/stripe/finalize", async (c) => checkout.stripeFinalize(c.env, await needUser(c), String((await body<{ order?: string }>(c.req)).order || "")));
route("POST", "/api/webhooks/stripe", (c) => checkout.stripeWebhook(c.env, c.req));
route("POST", "/api/webhooks/kofi", (c) => support.kofi(c.env, c.req));
route("POST", "/api/webhooks/buymeacoffee", (c) => support.buymeacoffee(c.env, c.req));
route("POST", "/api/checkout/paypal", async (c) => checkout.paypalCreate(c.env, await needUser(c), checkout.checkInput(await body(c.req))));
route("POST", "/api/checkout/paypal/capture", async (c) => {
  const b = await body<{ order?: string; acceptHigher?: boolean }>(c.req);
  return checkout.paypalCapture(c.env, await needUser(c), String(b.order || ""), !!b.acceptHigher);
});
route("POST", "/api/checkout/transfer", async (c) => {
  const input = await body<Record<string, unknown>>(c.req);
  return checkout.transferCheckout(c.env, await needUser(c), { ...checkout.checkInput(input), billing: text(input.billing, 2).toUpperCase() });
});

// --- djmanzo, the application: its own licence protocol (`worker/applicence.ts`) --

route("GET", "/login/:provider", (c) => auth.start(c.req, c.env, c.params.provider, applicence.appLogin(c.url)));
route("POST", "/licence", (c) => applicence.licence(c.env, c.req));
route("POST", "/renew", (c) => applicence.renew(c.env, c.req));
route("POST", "/signout", (c) => applicence.signout(c.env, c.req));
// `standard` is what a release is built with (DJMANZO_LICENCE_KEY): the same 32 bytes in plain base64.
route("GET", "/api/licence/public-key", async (c) => {
  const raw = (await keys(c.env)).publicRaw;
  return { alg: "Ed25519", key: raw, standard: btoa(String.fromCharCode(...unb64url(raw))), development: !c.env.LICENCE_PRIVATE_KEY };
});
// Taking a signed voucher (`worker/redeem.ts`): djmanzo opens this in the browser.
route("GET", "/redeem", (c) => redeem.show(c.req, c.env));
route("POST", "/redeem", (c) => redeem.takeGift(c.req, c.env));
// Whether there is a newer djmanzo, for its updater (`worker/update.ts`).
route("GET", "/api/update/:target/:arch/:current", (c) => update.check(c.env, c.params.target, c.params.arch, c.params.current, c.url.origin));
// The newest release's installers, and one of its files (`worker/update.ts`).
route("GET", "/api/download", (c) => update.downloads(c.env, c.url.origin));
route("GET", "/api/releases", (c) => update.recent(c.env));
route("GET", "/api/release-notes", (c) => releaseNotes.notes(c.env));
route("GET", "/download/latest/:key", (c) => update.newest(c.env, c.params.key));
route("GET", "/download/:file", (c) => update.file(c.env, decodeURIComponent(c.params.file)));

// --- The community -------------------------------------------------------------

route("GET", "/api/wishes", async (c) => {
  c.exec.waitUntil(community.seedWishes(c.env));
  return community.wishes(c.env);
});
route("GET", "/api/wishes/:id", (c) => community.wish(c.env, c.params.id));
route("POST", "/api/wishes", async (c) => community.addWish(c.env, c.req, await user(c), await body(c.req)));
route("POST", "/api/wishes/:id/vote", async (c) => community.vote(c.env, c.req, await user(c), c.params.id));

route("GET", "/api/comments", (c) =>
  community.comments(c.env, (c.url.searchParams.get("kind") as never) || "comment", { station: c.url.searchParams.get("station"), limit: 60 }),
);
route("POST", "/api/comments", async (c) => community.addComment(c.env, c.req, await user(c), await body(c.req)));
route("GET", "/api/videos", async (c) => (await get<Video[]>(c.env.KV, "config:videos")) ?? []);

route("POST", "/api/journey/reward", async (c) => community.claimReward(c.env, await needUser(c), (await body<{ stamps?: string[] }>(c.req)).stamps ?? []));

route("GET", "/api/blog", (c) => blog.posts(c.env, { lang: c.url.searchParams.get("lang") || "en" }));
route("GET", "/api/blog/:slug", (c) => blog.post(c.env, c.params.slug, c.url.searchParams.get("lang") || "en"));
route("GET", "/api/blog-languages", async () => blog.LANGUAGES);

// --- Outboard, the marketplace, and Talkback, the discussion space (§139) ---------------

const contributor = (c: Ctx) => people.contributor(c.req, c.env);

route("GET", "/api/imprint", async (c) => ({ imprint: people.imprint(c.env), support: c.env.SUPPORT_URL || null }));

route("GET", "/api/outboard", async (c) => {
  await seedOnce(c.env, c.url.origin);
  return { kinds: LISTED_KINDS, coming: COMING_KINDS, standing: await people.standing(c.req, c.env) };
});
route("GET", "/api/outboard/items", async (c) => {
  await seedOnce(c.env, c.url.origin);
  return market.listing(c.env, c.url.searchParams.get("kind"), c.url.searchParams.get("q"));
});
route("GET", "/api/outboard/packs.json", async (c) => {
  await seedOnce(c.env, c.url.origin);
  return market.index(c.env, c.url.origin);
});
route("GET", "/api/outboard/items/:id", async (c) => {
  const u = await user(c);
  return market.item(c.env, c.params.id, u?.id ?? null, await auth.isAdmin(c.req, c.env, u));
});
route("GET", "/api/outboard/items/:id/v/:file", async (c) => {
  if (!c.params.file.endsWith(".djpack")) fail(404, "No such version.");
  return market.download(c.env, c.params.id, c.params.file.slice(0, -".djpack".length), (await user(c))?.id ?? null);
});
route("GET", "/api/outboard/makers/:uid", (c) => market.maker(c.env, c.params.uid));
route("POST", "/api/outboard/upload", async (c) => {
  const who = await contributor(c);
  const size = Number(c.req.headers.get("content-length") || 0);
  if (size > market.MOST_UPLOAD) fail(413, `A pack is at most ${market.MOST_UPLOAD / 1024 / 1024} MB.`);
  const bytes = new Uint8Array(await c.req.arrayBuffer());
  return market.upload(c.env, who, bytes, c.url.searchParams.get("changelog") ?? "");
});
route("POST", "/api/outboard/items/:id/rating", async (c) => {
  const b = await body<{ stars?: number; review?: string }>(c.req);
  return market.rate(c.env, await contributor(c), c.params.id, Number(b.stars), String(b.review ?? ""));
});
route("PUT", "/api/outboard/profile", async (c) => {
  const b = await body<{ about?: string; links?: unknown }>(c.req);
  return market.setProfile(c.env, await contributor(c), String(b.about ?? ""), b.links);
});

route("POST", "/api/report", async (c) => {
  const b = await body<{ kind?: string; target?: string; reason?: string }>(c.req);
  return moderation.report(c.env, await contributor(c), String(b.kind), String(b.target), String(b.reason ?? ""));
});
route("GET", "/api/me/notices", async (c) => moderation.notices(c.env, (await needUser(c)).id));
route("POST", "/api/me/notices/:id/appeal", async (c) => moderation.appeal(c.env, await needUser(c), c.params.id, String((await body<{ text?: string }>(c.req)).text ?? "")));

route("GET", "/api/talkback", async (c) => {
  await seedThreadsOnce(c.env);
  const u = await user(c);
  return {
    communities: c.env.DB ? await talkback.communities(c.env) : COMMUNITIES.map((x) => ({ ...x, posts: 0 })),
    flairs: FLAIRS,
    rules: RULES,
    trust: TRUST,
    turnstile: c.env.TURNSTILE_SITE_KEY || null,
    standing: await people.standing(c.req, c.env),
    me: u && c.env.DB && people.vouched(u) ? await talkback.standing(c.env, u) : null,
  };
});
route("GET", "/api/talkback/posts", async (c) => {
  await seedThreadsOnce(c.env);
  return talkback.posts(c.env, {
    community: c.url.searchParams.get("c"),
    sort: c.url.searchParams.get("sort"),
    q: c.url.searchParams.get("q"),
    item: c.url.searchParams.get("item"),
    uid: (await user(c))?.id ?? null,
  });
});
route("GET", "/api/talkback/posts/:id", async (c) => talkback.thread(c.env, c.params.id, (await user(c))?.id ?? null));
route("POST", "/api/talkback/posts", async (c) => talkback.post(c.env, c.req, await contributor(c), await body(c.req)));
route("POST", "/api/talkback/posts/:id/comments", async (c) => talkback.comment(c.env, await contributor(c), c.params.id, await body(c.req)));
route("POST", "/api/talkback/posts/:id/answer", async (c) => {
  const u = await user(c);
  const admin = await auth.isAdmin(c.req, c.env, u);
  if (!u && !admin) fail(401, "Sign in first.");
  const b = await body<{ comment?: string | null }>(c.req);
  return talkback.answer(c.env, u?.id ?? null, c.params.id, b.comment ? String(b.comment) : null, admin);
});
route("POST", "/api/talkback/vote", async (c) => {
  const b = await body<{ kind?: string; id?: string; value?: number }>(c.req);
  return talkback.vote(c.env, await contributor(c), String(b.kind), String(b.id), Number(b.value));
});

route("GET", "/api/admin/outboard/queue", async (c) => {
  await needAdmin(c);
  return market.queue(c.env);
});
route("POST", "/api/admin/outboard/review", async (c) => {
  await needAdmin(c);
  const b = await body<{ id?: string; version?: string; approve?: boolean; reason?: string }>(c.req);
  return market.review(c.env, String(b.id), String(b.version), b.approve === true, String(b.reason ?? ""));
});
route("POST", "/api/admin/outboard/remove", async (c) => {
  await needAdmin(c);
  const b = await body<{ id?: string; reason?: string }>(c.req);
  return market.remove(c.env, String(b.id), String(b.reason ?? ""));
});
route("GET", "/api/admin/crew", async (c) => {
  await needAdmin(c);
  return moderation.crewQueue(c.env);
});
route("POST", "/api/admin/crew/decide", async (c) => {
  await needAdmin(c);
  const b = await body<{ kind?: string; target?: string; keep?: boolean; reason?: string }>(c.req);
  return moderation.decide(c.env, String(b.kind), String(b.target), b.keep === true, String(b.reason ?? ""));
});
route("POST", "/api/admin/talkback/promote", async (c) => {
  await needAdmin(c);
  return talkback.promote(c.env, c.req, c.url.origin, String((await body<{ id?: string }>(c.req)).id));
});

// --- The Signal Path: where, the sky, and the guide ---------------------------------

// Asked for only after the visitor said yes; nothing here is stored.
route("GET", "/api/where", async (c) => sense.where(c.req));
route("GET", "/api/weather", async (c) => {
  await brake(c.env.KV, `weather:${clientIp(c.req)}`, 30, 3600);
  return sense.weather(c.url.searchParams.get("lat"), c.url.searchParams.get("lon"));
});
route("GET", "/api/guide", async (c) => ({ on: model.provider(c.env) !== "off", by: model.provider(c.env) }));
route("POST", "/api/guide", async (c) => guide.guide(c.env, c.req, await body(c.req, 48 * 1024)));

// --- Backstage -----------------------------------------------------------------

route("GET", "/api/admin/overview", async (c) => {
  await needAdmin(c);
  const [orders, licences, users, wishes, pendingT, pendingC, pendingS, promos] = await Promise.all([
    list<{ s: string; t: number; c: string; at: number; e: string; p: string; v: string }>(c.env.KV, "order:", 10000),
    list<{ s: string; d: boolean; e: string }>(c.env.KV, "licence:", 10000),
    list(c.env.KV, "user:", 10000),
    list(c.env.KV, "wish:", 5000),
    community.comments(c.env, "testimonial", { pending: true }),
    community.comments(c.env, "comment", { pending: true }),
    community.comments(c.env, "sample", { pending: true }),
    list(c.env.KV, "promo:", 10000),
  ]);
  const paid = orders.filter((o) => o.metadata?.s === "paid" && o.metadata?.v !== "demo");
  const revenue: Record<string, number> = {};
  for (const o of paid) revenue[o.metadata!.c] = (revenue[o.metadata!.c] || 0) + o.metadata!.t;
  const byEdition: Record<string, number> = {};
  for (const l of licences) if (!l.metadata?.d) byEdition[l.metadata?.e ?? "?"] = (byEdition[l.metadata?.e ?? "?"] || 0) + 1;
  return {
    orders: orders.length,
    paid: paid.length,
    demoOrders: orders.filter((o) => o.metadata?.v === "demo").length,
    pendingTransfers: orders.filter((o) => o.metadata?.s === "pending" && o.metadata?.v === "transfer").length,
    revenue,
    licences: licences.length,
    byEdition,
    users: users.length,
    wishes: wishes.length,
    pending: pendingT.length + pendingC.length + pendingS.length,
    promos: promos.length,
    ai: model.provider(c.env),
    signing: c.env.LICENCE_PRIVATE_KEY ? "secret" : "development key in KV",
    providers: auth.enabledProviders(c.env).map((p) => p.id),
    payments: { stripe: !!c.env.STRIPE_SECRET_KEY, paypal: !!c.env.PAYPAL_CLIENT_ID, transfer: !!c.env.BANK_TRANSFER_DETAILS, demo: auth.demoMode(c.env) },
  };
});

route("GET", "/api/admin/promos", async (c) => {
  await needAdmin(c);
  const keys = await list<ReturnType<typeof promo.meta>>(c.env.KV, "promo:", 10000);
  return keys.map((k) => ({ code: k.name.slice(6), ...k.metadata }));
});
route("GET", "/api/admin/promos/:code", async (c) => {
  await needAdmin(c);
  return get<Promo>(c.env.KV, `promo:${promo.normalise(c.params.code)}`);
});
route("POST", "/api/admin/promos", async (c) => {
  const admin = await needAdmin(c);
  const b = await body<promo.PromoSpec & { count?: number; prefix?: string; code?: string; boundTo?: string[] | string }>(c.req);
  const boundTo = typeof b.boundTo === "string" ? b.boundTo.split(/[\s,;]+/) : b.boundTo;
  const made = await promo.mint(c.env, b, { count: b.count, prefix: b.prefix, code: b.code, boundTo, by: admin.name });
  return { made: made.length, codes: made.map((p) => ({ code: p.code, boundTo: p.boundTo })) };
});
route("PATCH", "/api/admin/promos/:code", async (c) => {
  await needAdmin(c);
  const p = await get<Promo>(c.env.KV, `promo:${promo.normalise(c.params.code)}`);
  if (!p) fail(404, "No such code.");
  const b = await body<{ active?: boolean; maxUses?: number | null; expires?: number | null; note?: string }>(c.req);
  if (b.active !== undefined) p.active = !!b.active;
  if (b.maxUses !== undefined) p.maxUses = b.maxUses;
  if (b.expires !== undefined) p.expires = b.expires;
  if (b.note !== undefined) p.note = text(b.note, 200);
  await put(c.env.KV, `promo:${p.code}`, p, undefined, promo.meta(p));
  return p;
});
route("DELETE", "/api/admin/promos/:code", async (c) => {
  await needAdmin(c);
  await c.env.KV.delete(`promo:${promo.normalise(c.params.code)}`);
  return { ok: true };
});

// Signed vouchers (`worker/voucher.ts`): made here, given away, taken at /redeem or read by djmanzo itself.
route("GET", "/api/admin/vouchers", async (c) => {
  await needAdmin(c);
  const keys = await list<ReturnType<typeof voucher.meta>>(c.env.KV, "voucher:", 10000);
  return keys
    .map((k) => ({ id: k.name.slice(8), edition: k.metadata?.e, percent: k.metadata?.p, made: k.metadata?.m ?? null, issued: k.metadata?.i, until: k.metadata?.u ?? null, for: k.metadata?.f ?? 0, taken: k.metadata?.t ?? 0, revoked: !!k.metadata?.r }))
    .sort((a, b) => Number(b.issued) - Number(a.issued));
});
route("GET", "/api/admin/vouchers/:id", async (c) => {
  await needAdmin(c);
  return voucher.record(c.env, c.params.id);
});
route("POST", "/api/admin/vouchers", async (c) => {
  const admin = await needAdmin(c);
  const made = await voucher.make(c.env, await body<voucher.VoucherSpec>(c.req), admin.name);
  return { vouchers: made.map((r) => ({ id: r.payload.id, line: r.line })) };
});
route("POST", "/api/admin/vouchers/:id/revoke", async (c) => {
  await needAdmin(c);
  const r = await voucher.record(c.env, c.params.id);
  if (!r) fail(404, "No such voucher.");
  r.revoked = true;
  await voucher.save(c.env, r);
  return { id: r.payload.id, revoked: true };
});

route("PATCH", "/api/admin/wishes/:id", async (c) => {
  await needAdmin(c);
  const b = await body<{ status?: string; note?: string }>(c.req);
  return community.setWishStatus(c.env, c.params.id, b.status as never, b.note);
});
route("DELETE", "/api/admin/wishes/:id", async (c) => {
  await needAdmin(c);
  await c.env.KV.delete(`wish:${c.params.id}`);
  return { ok: true };
});

route("GET", "/api/admin/comments", async (c) => {
  await needAdmin(c);
  const [t, m, s] = await Promise.all((["testimonial", "comment", "sample"] as const).map((k) => community.comments(c.env, k, { pending: true })));
  return [...t, ...m, ...s];
});
route("POST", "/api/admin/comments/moderate", async (c) => {
  await needAdmin(c);
  const b = await body<{ key?: string; approve?: boolean }>(c.req);
  return community.moderate(c.env, String(b.key || ""), !!b.approve);
});

route("GET", "/api/admin/orders", async (c) => {
  await needAdmin(c);
  const keys = await list<Record<string, unknown>>(c.env.KV, "order:", 10000);
  return keys
    .map((k) => ({ id: k.name.slice(6), ...(k.metadata ?? {}) }) as { id: string; at?: number })
    .sort((a, b) => Number(b.at) - Number(a.at))
    .slice(0, 500);
});
route("GET", "/api/admin/orders/:id", async (c) => {
  await needAdmin(c);
  return get<Order>(c.env.KV, `order:${c.params.id}`);
});
route("POST", "/api/admin/orders/:id/paid", async (c) => {
  await needAdmin(c);
  const b = await body<{ bankCountry?: string }>(c.req);
  return checkout.markPaid(c.env, c.params.id, b.bankCountry ? text(b.bankCountry, 2).toUpperCase() : null);
});
route("POST", "/api/admin/licences/:id/revoke", async (c) => {
  await needAdmin(c);
  const l = await get<Licence>(c.env.KV, `licence:${c.params.id}`);
  if (!l) fail(404, "No such licence.");
  l.status = "revoked";
  await saveLicence(c.env.KV, l);
  return l;
});
route("PATCH", "/api/admin/users/:id", async (c) => {
  await needAdmin(c);
  const u = await get<User>(c.env.KV, `user:${c.params.id}`);
  if (!u) fail(404, "No such account.");
  const b = await body<{ student?: boolean }>(c.req);
  if (typeof b.student === "boolean") u.student = b.student;
  await put(c.env.KV, `user:${u.id}`, u);
  return u;
});
route("GET", "/api/admin/users/:id", async (c) => {
  await needAdmin(c);
  const u = await get<User>(c.env.KV, `user:${c.params.id}`);
  return u ? { ...u, licences: await checkout.userLicences(c.env, u.id) } : null;
});

route("PUT", "/api/admin/videos", async (c) => {
  await needAdmin(c);
  const b = await body<Video[]>(c.req);
  const clean = (Array.isArray(b) ? b : [])
    .filter((v) => /^[A-Za-z0-9_-]{6,20}$/.test(String(v.id)))
    .slice(0, 60)
    .map((v) => ({ id: v.id, title: text(v.title, 120), edition: v.edition ?? null, genre: v.genre ? text(v.genre, 30) : null, stage: v.stage && v.stage in STAGE_BY_ID ? v.stage : null }));
  await put(c.env.KV, "config:videos", clean);
  return clean;
});

route("GET", "/api/admin/blog", async (c) => {
  await needAdmin(c);
  return blog.posts(c.env, { drafts: true });
});
route("GET", "/api/admin/blog/:slug/:lang", async (c) => {
  await needAdmin(c);
  return blog.post(c.env, c.params.slug, c.params.lang, true);
});
route("POST", "/api/admin/blog/generate", async (c) => {
  const admin = await needAdmin(c);
  return blog.generate(c.env, await body(c.req), admin.name);
});
route("POST", "/api/admin/blog", async (c) => {
  const admin = await needAdmin(c);
  return blog.writePost(c.env, await body(c.req, 128 * 1024), admin.name);
});
route("PATCH", "/api/admin/blog/:slug/:lang", async (c) => {
  await needAdmin(c);
  return blog.editPost(c.env, c.params.slug, c.params.lang, await body(c.req, 128 * 1024));
});
route("DELETE", "/api/admin/blog/:slug/:lang", async (c) => {
  await needAdmin(c);
  return blog.deletePost(c.env, c.params.slug, c.params.lang);
});

// --- For crawlers (worker/seo.ts) -------------------------------------------------------

route("GET", "/robots.txt", async (c) => seo.robots(c.url.origin));
route("GET", "/sitemap.xml", (c) => seo.sitemap(c.env, c.url.origin));

// --- Dispatch ------------------------------------------------------------------

export async function handle(req: Request, env: AppEnv, exec: ExecutionContext): Promise<Response> {
  const url = new URL(req.url);
  // The professional site was previewed at /v4/ before it became the site; old links still land
  // (the browser keeps an old #/pricing, and the page turns it into /pricing). Its pictures stay at /v4/art/.
  if (url.pathname === "/v4" || url.pathname === "/v4/" || url.pathname === "/v4/index.html") return Response.redirect(`${url.origin}/${url.search}`, 301);
  // Mutating requests from a browser must come from this site.
  if (req.method !== "GET" && req.method !== "HEAD" && !url.pathname.startsWith("/api/webhooks/")) {
    const origin = req.headers.get("origin");
    if (origin && origin !== url.origin && !APP_CALLS.some((p) => url.pathname.startsWith(p))) {
      return json({ error: "Cross-site request refused." }, 403);
    }
  }
  for (const r of routes) {
    if (r.method !== req.method) continue;
    const m = url.pathname.match(r.pattern);
    if (!m) continue;
    const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
    try {
      const out = await r.handler({ req, env, url, params, exec });
      return out instanceof Response ? out : json(out ?? null);
    } catch (e) {
      if (e instanceof HttpError) return json({ error: e.message, ...(e.extra ?? {}) }, e.status);
      console.error(JSON.stringify({ at: url.pathname, error: String((e as Error)?.stack ?? e) }));
      return json({ error: "Something went wrong on our side." }, 500);
    }
  }
  if (["/api/", "/auth/", "/login/", "/callback/"].some((p) => url.pathname.startsWith(p)) || APP_CALLS.includes(url.pathname)) return json({ error: "No such thing." }, 404);
  // A page with an address of its own, rendered with its words; the painting opens over it.
  if (req.method === "GET") {
    try {
      const page = await seo.serve(req, env);
      if (page) return page;
    } catch (e) {
      // The page still opens without its rendered words.
      console.error(JSON.stringify({ at: url.pathname, seo: String((e as Error)?.stack ?? e) }));
    }
  }
  return env.ASSETS.fetch(req);
}

export default {
  fetch: (req, env, ctx) => handle(req, env as unknown as AppEnv, ctx),
} satisfies ExportedHandler<Env>;
