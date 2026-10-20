/**
 * `/redeem`: taking a signed voucher at the shop (DIRECTIVE §135).
 *
 * djmanzo opens `/redeem?voucher=<line>` in the browser for a discount, or
 * for a gift held to an e-mail address, which djmanzo cannot check itself. A
 * small page of the Worker's own, readable without script:
 *
 * - a voucher that is not one, was withdrawn in Backstage or is past its
 *   last day is refused, in a sentence;
 * - a **discount** says what it takes off and goes on to the box office with
 *   the voucher in hand (`checkout.quote` applies it, never on top of another
 *   discount);
 * - a **gift** asks the visitor to sign in, checks it is for them, and on
 *   *Take it* records the take and issues the edition as a purchase is
 *   issued — so djmanzo's own sign-in then fetches a licence that carries it.
 *   A gift for anybody can be taken here too, though djmanzo wears those
 *   offline without asking.
 *
 * After a sign-in the page comes back as `/redeem?id=<id>`: a line is too
 * long to ride along as a return address, and every voucher shown here has
 * a record by then.
 */

import { EDITION_INFO, MODULE_TITLE, listPrice, money, type Module } from "../shared/catalog";
import { escapeHtml as esc } from "../shared/legal";
import type { AppEnv } from "./env";
import { enabledProviders, whoami } from "./auth";
import { accountsOf, issue } from "./checkout";
import { SECURITY_HEADERS, randomId } from "./http";
import type { Order, User } from "./store";
import * as voucher from "./voucher";

function page(title: string, body: string, status = 200): Response {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>${esc(title)} — djmanzo</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<style>
  :root { color-scheme: dark; --bg: #06233a; --surface: #0d3b5c; --primary: #ffb703; --ink: #fdf6e3; --soft: rgba(253, 246, 227, 0.72); }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: var(--bg); color: var(--ink); font: 17px/1.5 Figtree, system-ui, sans-serif; }
  main { box-sizing: border-box; width: min(560px, 100% - 32px); margin: 32px 0; padding: 24px; border-radius: 14px; background: var(--surface); }
  h1 { margin: 0 0 8px; font-size: 1.5rem; }
  p { margin: 10px 0; }
  .soft { color: var(--soft); font-size: 15px; }
  .row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
  .btn { display: inline-block; padding: 10px 16px; border: 2px solid var(--primary); border-radius: 10px; background: none; color: var(--ink); font: inherit; font-weight: 700; text-decoration: none; cursor: pointer; }
  .btn.primary { background: var(--primary); color: var(--bg); }
  a { color: var(--primary); }
  blockquote { margin: 12px 0; padding-left: 12px; border-left: 3px solid var(--primary); font-style: italic; }
</style>
</head>
<body><main>${body}</main></body>
</html>`;
  return new Response(html, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", ...SECURITY_HEADERS } });
}

const SHOP = `<p class="soft"><a href="/island/#/taquilla">The box office</a> · <a href="/">djmanzo</a></p>`;
const refuse = (sentence: string, status: number) => page("Not a voucher to take", `<h1>This voucher cannot be taken</h1><p>${esc(sentence)}</p>${SHOP}`, status);

/** What a voucher is for, in words: "djmanzo Full", or Custom with its modules. */
function what(p: voucher.VoucherPayload): string {
  const name = `djmanzo ${EDITION_INFO[p.edition].name}`;
  if (p.edition !== "custom") return name;
  return `${name} (${(p.modules ?? "").split(",").map((m) => MODULE_TITLE[m as Module] ?? m).join(", ")})`;
}

const note = (p: voucher.VoucherPayload) => (p.note ? `<blockquote>${esc(p.note)}</blockquote>` : "");
const until = (p: voucher.VoucherPayload) => (p.until ? `<p class="soft">It can be taken until ${new Date(p.until * 1000).toISOString().slice(0, 10)}.</p>` : "");

/** The voucher a request names, read and checked: by its line, or by the id of one with a record here. */
async function voucherOf(env: AppEnv, line: string | null, id: string | null): Promise<{ read: voucher.Read; line: string }> {
  let l = line ?? "";
  if (!l && id) l = (await voucher.record(env, id))?.line ?? "";
  if (!l) return { read: { refused: "No voucher came with this address." }, line: l };
  return { read: await voucher.readVoucher(l, await voucher.trustedKeys(env)), line: l };
}

function signIn(env: AppEnv, id: string, sentence: string): string {
  const back = encodeURIComponent(`/redeem?id=${encodeURIComponent(id)}`);
  const providers = enabledProviders(env);
  const buttons = providers.map((p) => `<a class="btn" href="/auth/start/${esc(p.id)}?return=${back}">Sign in with ${esc(p.name)}</a>`).join("");
  return `<p>${esc(sentence)}</p>${providers.length ? `<div class="row">${buttons}</div>` : `<p class="soft">Signing in is not set up on this site yet; the gift waits.</p>`}`;
}

/** Whether this person may take this gift now: null when they may, else what to show instead. */
function giftBlock(env: AppEnv, p: voucher.VoucherPayload, r: voucher.VoucherRecord, user: User | null): string | null {
  if (!user) {
    const held = p.for?.length ? " It was made for somebody: sign in with the account or address it was sent to." : "";
    return signIn(env, p.id, `Sign in, and the gift goes to your account; djmanzo then picks it up when it signs in with the same one.${held}`);
  }
  const accounts = accountsOf(user);
  if (!accounts.length) return signIn(env, p.id, "A gift needs an account a provider vouches for — a demo or crew sign-in cannot hold a licence.");
  if (!voucher.allows(p, { account: accounts, email: user.email })) {
    return signIn(env, p.id, `This gift was made for somebody else. You are signed in as ${user.name}${user.email ? ` (${user.email})` : ""}; sign in with the account or address it was sent to.`);
  }
  if (r.taken.some((t) => t.uid === user.id)) return `<p>It is already yours. In djmanzo, open <b>Settings → Licence</b> and sign in with the same account.</p>`;
  return null;
}

/** `GET /redeem?voucher=<line>` (or `?id=<id>`, back from a sign-in). */
export async function show(req: Request, env: AppEnv): Promise<Response> {
  const url = new URL(req.url);
  const { read, line } = await voucherOf(env, url.searchParams.get("voucher"), url.searchParams.get("id"));
  if (!read.payload) return refuse(read.refused, 400);
  const p = read.payload;
  const { record, refused } = await voucher.standing(env, p, line);
  if (refused) return refuse(refused, 410);

  if (voucher.gives(p) === "discount") {
    const list = listPrice(p.edition, "perpetual", (p.modules ?? "").split(","));
    const off = list - Math.round((list * p.percent) / 100);
    const to = `/island/?voucher=${encodeURIComponent(record.line)}#/taquilla`;
    return page(
      `${p.percent} % off`,
      `<h1>${p.percent} % off ${esc(what(p))}</h1>${note(p)}
<p>Bought once, ${esc(what(p))} is ${money(list, "USD")}; with this voucher, ${money(off, "USD")}. A regional or student price that is lower still applies instead — discounts do not stack.</p>
${p.for?.length ? `<p class="soft">It was made for somebody: the box office asks you to sign in with the account or address it was sent to.</p>` : ""}${until(p)}
<div class="row"><a class="btn primary" href="${esc(to)}">On to the box office</a></div>${SHOP}`,
    );
  }

  const user = await whoami(req, env);
  const blocked = giftBlock(env, p, record, user);
  return page(
    "A gift",
    `<h1>A gift: ${esc(what(p))}</h1>${note(p)}<p>To keep: the edition, bought once, with nothing to pay.</p>${until(p)}
${blocked ?? `<form method="post" action="/redeem"><input type="hidden" name="id" value="${esc(p.id)}" /><p>It goes to <b>${esc(user!.name)}</b>${user!.email ? ` (${esc(user!.email)})` : ""}.</p><div class="row"><button class="btn primary">Take it</button></div></form>`}${SHOP}`,
  );
}

/** `POST /redeem` (a form: `id`, or `voucher`): take a gift, once per person, and issue it as a purchase is issued. */
export async function takeGift(req: Request, env: AppEnv): Promise<Response> {
  const form = new URLSearchParams(await req.text());
  const { read, line } = await voucherOf(env, form.get("voucher"), form.get("id"));
  if (!read.payload) return refuse(read.refused, 400);
  const p = read.payload;
  if (voucher.gives(p) !== "gift") return refuse("That voucher takes money off at the box office; it is not a gift to take here.", 400);
  const { record, refused } = await voucher.standing(env, p, line);
  if (refused) return refuse(refused, 410);
  const user = await whoami(req, env);
  const blocked = giftBlock(env, p, record, user);
  if (blocked) return page("A gift", `<h1>A gift: ${esc(what(p))}</h1>${blocked}${SHOP}`, user ? 403 : 401);
  const u = user!;
  const modules = p.edition === "custom" ? ((p.modules ?? "").split(",") as Module[]) : undefined;
  const list = listPrice(p.edition, "perpetual", modules);
  const order: Order = {
    id: `o_${randomId(12)}`,
    uid: u.id,
    edition: p.edition,
    ...(modules ? { modules } : {}),
    plan: "perpetual",
    currency: "USD",
    base: list,
    regional: list,
    discount: list,
    total: 0,
    band: 1,
    claimedBand: 1,
    proof: { reason: `A gift voucher, ${p.id}.` },
    promo: null,
    voucher: p.id,
    provider: "voucher",
    status: "pending",
    renews: false,
    createdAt: Date.now(),
    email: u.email,
    name: u.name,
  };
  await issue(env, order, u);
  return page(
    "It's yours",
    `<h1>It's yours: ${esc(what(p))}</h1><p>Bought once, to keep, on your account.</p>
<p>In djmanzo, open <b>Settings → Licence</b> and sign in with the same account you used here; djmanzo fetches the licence by itself and keeps working offline.</p>
<div class="row"><a class="btn" href="/island/#/pase">See it in your pass</a></div>${SHOP}`,
  );
}
