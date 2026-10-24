<!--
  The account, on this site: signing in (and why a sign-in did not finish),
  the accounts connected to it, the licences and how they reach djmanzo,
  the free trial and vouchers, orders, the pages where people can support
  you (Patreon and the others), and what the crew has said about anything
  you posted. Everything the island's pass did, without leaving the site.
-->
<script lang="ts">
  /** Where someone can support djmanzo, as /api/me names them (worker/support.ts). */
  const SUPPORT_PLATFORM: Record<string, string> = { patreon: "Patreon", github: "GitHub Sponsors", kofi: "Ko-fi", buymeacoffee: "Buy Me a Coffee" };
  import { onMount } from "svelte";
  import { api, post } from "../../lib/api";
  import { session } from "../../lib/session.svelte";
  import { EDITION_INFO, MODULE_TITLE, money, type Edition, type Module } from "../../../shared/catalog";
  import { PROVIDER_NAME } from "../../../shared/signin";
  import SignIn from "../SignIn.svelte";
  import SupportLinks from "../SupportLinks.svelte";
  import { BRANDS } from "../brands";
  import { RELEASES } from "../download";
  import { href } from "../router";
  import { shared } from "../region.svelte";
  import { t } from "../i18n.svelte";

  interface Lic {
    id: string;
    edition: string;
    modules?: string[];
    plan: string;
    status: string;
    expires: number | null;
    inForce: boolean;
    demo: boolean;
  }
  interface OrderRow {
    id: string;
    edition: string;
    plan: string;
    total: number;
    currency: string;
    status: string;
    provider: string;
    createdAt: number;
  }
  interface Notice {
    id: string;
    kind: string;
    action: string;
    reason: string;
    appeal: string | null;
    created: number;
  }
  interface Check {
    callbackPath: string;
    providers: { id: string; name: string; offered: boolean; missing: string[]; register: string; alsoServed: string }[];
  }

  let licences = $state<Lic[] | null>(null);
  /** Gifts this account bought (`/api/me/gifts`): each voucher line, and whether it has been taken. */
  interface GiftRow {
    id: string;
    line: string;
    edition: Edition;
    for: string[];
    note: string | null;
    taken: boolean;
    rehearsal: boolean;
  }
  let gifts = $state<GiftRow[]>([]);
  let giftCopied = $state<string | null>(null);
  async function copyGift(g: GiftRow) {
    try {
      await navigator.clipboard.writeText(`${location.origin}/redeem?voucher=${encodeURIComponent(g.line)}`);
      giftCopied = g.id;
    } catch {
      // The link is on the page to copy by hand.
    }
  }
  let orders = $state<OrderRow[]>([]);
  let notices = $state<Notice[]>([]);
  let trialHad = $state<unknown>(null);
  let line = $state<{ licence?: string; refused?: string; account?: string } | null>(null);
  let copied = $state(false);
  let voucher = $state("");
  let voucherMsg = $state<string | null>(null);
  let check = $state<Check | null>(null);
  interface Computer {
    id: string;
    name: string;
    os: string;
    account: string;
    created: number;
    seen: number;
  }
  let computers = $state<{ most: number; activations: Computer[] } | null>(null);
  let removing = $state<string | null>(null);
  const day = (s: number) => new Date(s * 1000).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  const OS_NAME: Record<string, string> = { linux: "Linux", macos: "macOS", windows: "Windows" };

  async function removeComputer(c: Computer) {
    if (!confirm(`Remove "${c.name}"? djmanzo there goes back to the free Hobbyist edition the next time it is online and started again.`)) return;
    removing = c.id;
    try {
      computers = await api<{ most: number; activations: Computer[] }>(`/api/me/activations/${encodeURIComponent(c.id)}`, { method: "DELETE" });
    } finally {
      removing = null;
    }
  }
  let loadedFor: string | null = null;

  async function load() {
    const uid = session.user?.id ?? null;
    if (!uid || loadedFor === uid) return;
    loadedFor = uid;
    const [l, o, n, t] = await Promise.allSettled([api<Lic[]>("/api/me/licences"), api<OrderRow[]>("/api/me/orders"), api<Notice[]>("/api/me/notices"), api<{ had: unknown }>("/api/trial")]);
    licences = l.status === "fulfilled" ? l.value : [];
    orders = o.status === "fulfilled" ? o.value.sort((a, b) => b.createdAt - a.createdAt) : [];
    notices = n.status === "fulfilled" ? n.value : [];
    trialHad = t.status === "fulfilled" ? t.value.had : null;
    computers = await api<{ most: number; activations: Computer[] }>("/api/me/activations").catch(() => ({ most: 3, activations: [] }));
    gifts = await api<GiftRow[]>("/api/me/gifts").catch(() => []);
    if (session.admin) check = await api<Check>("/api/auth/check").catch(() => null);
  }

  $effect(() => {
    if (session.user) void load();
  });

  async function showLine() {
    copied = false;
    try {
      line = await api("/api/me/licence-line");
    } catch (e) {
      line = { refused: (e as Error).message };
    }
  }

  async function copyLine() {
    if (!line?.licence) return;
    await navigator.clipboard.writeText(line.licence);
    copied = true;
  }

  async function redeem(e: SubmitEvent) {
    e.preventDefault();
    voucherMsg = null;
    try {
      const r = await post("/api/redeem", { code: voucher.trim() });
      voucherMsg = `Redeemed: djmanzo ${EDITION_INFO[r.licence.edition as Edition]?.name ?? r.licence.edition}. It is in your licences below.`;
      voucher = "";
      loadedFor = null;
      void load();
    } catch (err) {
      voucherMsg = (err as Error).message;
    }
  }

  async function signOut() {
    await session.signOut();
    licences = null;
    loadedFor = null;
  }

  const date = (t: number) => new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  const planWords = (p: string) => (p === "perpetual" ? "bought once" : p === "trial" ? "a free trial" : p === "monthly" ? "monthly" : p === "yearly" ? "yearly" : p);
  /** Providers that can still be connected to this account. */
  const connectable = $derived(session.providers.filter((p) => !session.user?.providers.includes(p.id)));

  onMount(() => {
    if (!session.loaded) void session.refresh();
  });
</script>

<div class="account" data-account>
  <header class="head">
    <div class="bg" aria-hidden="true" style:background-image={`url(${shared("download")})`}></div>
    <div class="wrap">
      <p class="eyebrow">Your account</p>
      {#if session.user}
        <div class="who">
          {#if session.user.avatar}<img src={session.user.avatar} alt="" width="72" height="72" />{:else}<span class="avatar" aria-hidden="true">{session.user.name.slice(0, 1)}</span>{/if}
          <div>
            <h1 class="h2" data-account-name>{session.user.name}</h1>
            <p class="dim">
              {session.user.email ?? "No e-mail address shared"}
              {#if session.user.demo}<span class="tag">demo account</span>{/if}
              {#each session.user.supports ?? [] as p (p)}<span class="tag gold" data-supports={p}>Supports djmanzo on {SUPPORT_PLATFORM[p] ?? p}</span>{/each}
              {#if session.user.githubSponsors}<a class="tag" href={session.user.githubSponsors} rel="noopener">Your GitHub Sponsors page, verified</a>{/if}
            </p>
          </div>
          <button class="btn ghost small out" onclick={signOut} data-signout>Sign out</button>
        </div>
      {:else}
        <h1 class="h1">Sign in.<br />Your licences follow.</h1>
        <p class="lead">One account for the shop, the marketplace, the forum and djmanzo itself. Buy here, sign in to djmanzo with the same account, and it fetches your licence by itself — and keeps working offline.</p>
      {/if}
    </div>
  </header>

  <div class="wrap body">
    {#if !session.loaded}
      <p class="dim">Looking you up…</p>
    {:else if !session.user}
      <section class="card pad">
        <SignIn back="/account" />
      </section>
      <ul class="why-sign">
        <li><b>Licences</b><span>What you bought or are trying, kept with your account and fetched by djmanzo when you sign in there.</span></li>
        <li><b>The marketplace</b><span>Upload packs, rate them, and keep the name of what you made.</span></li>
        <li><b>The forum</b><span>Ask, answer, vote. New accounts start gently; the crew reads what is held.</span></li>
        <li><b>Support</b><span>Show your Patreon, Ko-fi or other tip jar on your packs and your profile.</span></li>
      </ul>
    {:else}
      {#if session.returned && session.returned.kind !== "failed"}
        <p class="ok" role="status" data-signin-ok>{session.returned.kind === "linked" ? `${session.returned.provider} is connected to your account.` : `Signed in with ${session.returned.provider}.`}</p>
      {/if}
      {#if session.returned?.kind === "failed"}
        <p class="failed" role="alert" data-signin-failed><b>That did not finish.</b> {session.returned.why}</p>
      {/if}

      <div class="grid">
        <section class="card pad lic" aria-labelledby="lic-h">
          <h2 class="h3" id="lic-h">Your licences</h2>
          {#if licences === null}
            <p class="dim">Fetching…</p>
          {:else if licences.length}
            <ul class="lics" data-licences>
              {#each licences as l (l.id)}
                <li class:off={!l.inForce} style:--c={EDITION_INFO[l.edition as Edition]?.colour ?? "var(--accent)"}>
                  <span class="dot" aria-hidden="true"></span>
                  <div>
                    <b>djmanzo {EDITION_INFO[l.edition as Edition]?.name ?? l.edition}</b>
                    {#if l.modules?.length && l.edition === "custom"}<span class="dim"> — {l.modules.map((m) => MODULE_TITLE[m as Module] ?? m).join(", ")}</span>{/if}
                    <p class="dim small">{planWords(l.plan)} · {l.inForce ? (l.expires ? `until ${date(l.expires)}` : "kept for ever") : `ended (${l.status})`}{l.demo ? " · demo, unlocks nothing" : ""}</p>
                  </div>
                </li>
              {/each}
            </ul>
          {:else}
            <p>None yet. The Hobbyist edition needs none: it is free, for ever.</p>
            <div class="row">
              <a class="btn primary small" href={href("pricing")}>See the editions</a>
              <a class="btn ghost small" href={RELEASES}>Download djmanzo</a>
            </div>
          {/if}

          <h3 class="mono small-h">Your computers</h3>
          {#if computers}
            <p class="dim small" data-activations-count>
              djmanzo is activated on {computers.activations.length} of the {computers.most} computers a licence can be on at once. Signing in again on one of them keeps its place. To activate another, remove one you no longer use: djmanzo there goes back to the free Hobbyist edition the next time it is online and started again. Offline, an activated djmanzo keeps working.
            </p>
            {#if computers.activations.length}
              <ul class="computers" data-activations>
                {#each computers.activations as c (c.id)}
                  <li data-activation={c.id}>
                    <div>
                      <b>{c.name}</b>
                      <p class="dim small">{OS_NAME[c.os] ?? c.os} · through {PROVIDER_NAME[c.account.split(":")[0]] ?? c.account.split(":")[0]} · since {day(c.created)} · last seen {day(c.seen)}</p>
                    </div>
                    <button class="btn ghost small" disabled={removing === c.id} onclick={() => removeComputer(c)} data-remove-activation={c.id}>{removing === c.id ? "Removing…" : "Remove"}</button>
                  </li>
                {/each}
              </ul>
            {/if}
          {/if}

          <h3 class="mono small-h">In djmanzo</h3>
          <ol class="steps">
            <li>Open <b>Settings → Licence</b> and sign in with {session.user.providers.filter((p) => p !== "demo" && p !== "owner").map((p) => PROVIDER_NAME[p] ?? p).join(" or ") || "the same account"}.</li>
            <li>djmanzo fetches the licence by itself, checks its signature offline and renews it in the background.</li>
            <li>A computer that cannot sign in takes the licence as one line of text, pasted in the same place.</li>
          </ol>
          <button class="btn ghost small" onclick={showLine} data-licence-line>Show my licence line</button>
          {#if line?.licence}
            <textarea class="line mono" readonly rows="3" aria-label="Your licence line">{line.licence}</textarea>
            <div class="row"><button class="btn primary small" onclick={copyLine}>{copied ? "Copied" : "Copy it"}</button></div>
            <p class="dim small">It names your {PROVIDER_NAME[line.account?.split(":")[0] ?? ""] ?? ""} account and is checked by djmanzo offline. Anyone you give it to gets your licence.</p>
          {:else if line?.refused}
            <p class="note">{line.refused}</p>
          {/if}
        </section>

        {#if gifts.length}
          <section class="card pad" aria-labelledby="gift-h" data-gifts>
            <h2 class="h3" id="gift-h">🎁 {t("gift.mine")}</h2>
            <ul class="gifts">
              {#each gifts as g (g.id)}
                <li data-gift={g.id}>
                  <b>djmanzo {EDITION_INFO[g.edition]?.name ?? g.edition}</b>
                  <span class="dim">{g.for.length ? t("gift.forWhom", { who: g.for.join(", ") }) : t("gift.anyone")} · {g.taken ? t("gift.taken") : t("gift.waiting")}</span>
                  {#if g.rehearsal}<span class="dim small">{t("gift.rehearsal")}</span>{/if}
                  {#if !g.taken && !g.rehearsal}
                    <span class="copyrow"><input type="text" readonly value={`${location.origin}/redeem?voucher=${encodeURIComponent(g.line)}`} /><button class="btn ghost small" onclick={() => copyGift(g)}>{giftCopied === g.id ? t("gift.copied") : t("gift.copy")}</button></span>
                  {/if}
                </li>
              {/each}
            </ul>
          </section>
        {/if}

        <section class="card pad" aria-labelledby="try-h">
          <h2 class="h3" id="try-h">Try, or redeem</h2>
          {#if trialHad}
            <p class="dim">You have had your free week. Anything you buy now starts at once.</p>
          {:else}
            <p>Seven days of any edition, Full included, free, once per account. Then djmanzo becomes the Hobbyist edition and nothing you made is lost.</p>
            <a class="btn ghost small" href={`${href("pricing")}#checkout`}>Choose an edition to try</a>
          {/if}
          <form class="voucher" onsubmit={redeem}>
            <label for="voucher" class="mono small-h">A voucher or a gift code</label>
            <div class="row">
              <input id="voucher" type="text" bind:value={voucher} placeholder="GIFT-… or djmanzo-voucher-1.…" autocomplete="off" spellcheck="false" />
              <button class="btn primary small" disabled={!voucher.trim()}>Redeem</button>
            </div>
            {#if voucherMsg}<p class="note" role="status">{voucherMsg}</p>{/if}
          </form>
        </section>

        <section class="card pad" aria-labelledby="con-h">
          <h2 class="h3" id="con-h">Connected accounts</h2>
          <p class="dim small">Sign in with any of these and it is the same djmanzo account, with the same licences.</p>
          <ul class="chips">
            {#each session.user.providers as p (p)}
              {@const b = BRANDS[p]}
              <li class="chip on">{#if b}<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d={b.path} fill="currentColor" /></svg>{/if}{p === "demo" ? "Demo" : p === "owner" ? "Crew token" : (PROVIDER_NAME[p] ?? p)}</li>
            {/each}
          </ul>
          {#if connectable.length && !session.user.demo}
            <p class="small-h mono">Connect another</p>
            <div class="row wrap-row">
              {#each connectable as p (p.id)}
                <a class="btn ghost small" href={session.signInUrl(p.id, "/account", true)} data-connect={p.id}>{p.name}</a>
              {/each}
            </div>
            {#if connectable.some((p) => p.id === "patreon")}
              <p class="dim small">Connecting Patreon shows your own Patreon page as verified on your profile and your packs{session.user.supporter ? "" : ", and marks you as a supporter if you support djmanzo there"}.</p>
            {/if}
            {#if connectable.some((p) => p.id === "github")}
              <p class="dim small">Connecting GitHub does the same for GitHub Sponsors: your own Sponsors page, verified, and a supporter's mark if you sponsor djmanzo.</p>
            {/if}
          {/if}
          {#if !session.user.demo && !(session.user.supports ?? []).some((p) => p === "kofi" || p === "buymeacoffee")}
            <p class="dim small" data-support-email>Support djmanzo on Ko-fi or Buy Me a Coffee with the address this account has{session.user.email ? ` (${session.user.email})` : ""}, and this page marks you a supporter by itself.</p>
          {/if}
        </section>

        <section class="card pad support" aria-labelledby="sup-h">
          <h2 class="h3" id="sup-h">Where people can support you</h2>
          <SupportLinks />
        </section>

        {#if orders.length}
          <section class="card pad wide" aria-labelledby="ord-h">
            <h2 class="h3" id="ord-h">Orders</h2>
            <table class="orders">
              <thead><tr><th scope="col">Date</th><th scope="col">Edition</th><th scope="col">Plan</th><th scope="col">Paid with</th><th scope="col">Total</th><th scope="col">Status</th></tr></thead>
              <tbody>
                {#each orders as o (o.id)}
                  <tr><td>{date(o.createdAt)}</td><td>{EDITION_INFO[o.edition as Edition]?.name ?? o.edition}</td><td>{planWords(o.plan)}</td><td>{o.provider}</td><td class="mono">{money(o.total, o.currency as never)}</td><td>{o.status}</td></tr>
                {/each}
              </tbody>
            </table>
          </section>
        {/if}

        {#if notices.length}
          <section class="card pad wide" aria-labelledby="not-h">
            <h2 class="h3" id="not-h">From the crew</h2>
            <ul class="notices">
              {#each notices as n (n.id)}
                <li><b>{n.action === "removed" ? "Removed" : n.action === "kept" ? "Kept" : n.action}</b> — your {n.kind}, {date(n.created)}: {n.reason}{#if n.appeal}<span class="dim"> · you replied</span>{/if}</li>
              {/each}
            </ul>
          </section>
        {/if}

        <section class="card pad wide links" aria-label="Yours elsewhere on the site">
          <a href={`/outboard/maker/${session.user.id}`}>Your profile and packs →</a>
          <a href={href("community")}>The forum →</a>
          <a href={href("wishes")}>Feature requests →</a>
          {#if session.admin}<a href="/island/#/backstage">Backstage (crew) →</a>{/if}
        </section>

        {#if check}
          <section class="card pad wide" aria-labelledby="chk-h" data-signin-check>
            <h2 class="h3" id="chk-h">Sign-in check <span class="tag">crew</span></h2>
            <p class="dim small">The address to register at each provider is the one thing a sign-in that "does nothing" almost always comes down to. This site asks providers to send people back to <code>{check.callbackPath}/&lt;provider&gt;</code>, and serves the other form too.</p>
            <table class="orders">
              <thead><tr><th scope="col">Provider</th><th scope="col">Offered</th><th scope="col">Register this callback</th><th scope="col">Missing</th></tr></thead>
              <tbody>
                {#each check.providers as p (p.id)}
                  <tr><td>{p.name}</td><td>{p.offered ? "yes" : "no"}</td><td class="mono small">{p.register}</td><td class="mono small">{p.missing.join(", ") || "—"}</td></tr>
                {/each}
              </tbody>
            </table>
          </section>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .computers {
    list-style: none;
    margin: 8px 0 16px;
    padding: 0;
    display: grid;
    gap: 8px;
  }
  .computers li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border: 1px solid var(--line);
    border-radius: 10px;
  }
  .computers p {
    margin: 2px 0 0;
  }
  .head {
    position: relative;
    padding: calc(var(--bar) + 64px) 0 36px;
    overflow: hidden;
    isolation: isolate;
  }
  .bg {
    position: absolute;
    inset: 0;
    z-index: -1;
    background-size: cover;
    background-position: center;
    opacity: 0.3;
    mask-image: linear-gradient(180deg, black 10%, transparent 95%);
  }
  .who {
    display: flex;
    align-items: center;
    gap: 18px;
    flex-wrap: wrap;
  }
  .who img,
  .avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--accent);
  }
  .avatar {
    display: grid;
    place-items: center;
    background: var(--raised);
    font: 600 30px/1 var(--display);
  }
  .who p {
    margin: 6px 0 0;
  }
  .out {
    margin-left: auto;
  }
  .tag {
    display: inline-block;
    margin-left: 8px;
    padding: 2px 8px;
    border-radius: 999px;
    border: 1px solid var(--line);
    font: 500 11px/1.6 var(--mono);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--dim);
  }
  .tag.gold {
    border-color: #f96854;
    color: #ffb4a8;
  }
  .body {
    padding-bottom: 96px;
  }
  .pad {
    padding: clamp(18px, 3vw, 28px);
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }
  .lic {
    grid-row: span 2;
  }
  .wide {
    grid-column: 1 / -1;
  }
  @media (max-width: 860px) {
    .grid {
      grid-template-columns: 1fr;
    }
    .lic {
      grid-row: auto;
    }
  }
  h2 {
    margin-bottom: 12px;
  }
  .small-h {
    display: block;
    margin: 20px 0 8px;
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--dim);
  }
  .small {
    font-size: 13px;
  }
  .row {
    display: flex;
    gap: 8px;
    margin-top: 10px;
  }
  .wrap-row {
    flex-wrap: wrap;
  }
  .lics,
  .notices {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 10px;
  }
  .lics li {
    display: flex;
    gap: 12px;
    align-items: baseline;
    padding: 12px 14px;
    border-radius: 10px;
    background: color-mix(in srgb, var(--c) 10%, var(--bg));
    border: 1px solid color-mix(in srgb, var(--c) 40%, var(--line));
  }
  .lics li.off {
    opacity: 0.55;
  }
  .lics p {
    margin: 2px 0 0;
  }
  .dot {
    flex: none;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--c);
  }
  .steps {
    margin: 0 0 14px;
    padding-left: 20px;
    color: var(--dim);
  }
  .steps b {
    color: var(--text);
  }
  .line {
    width: 100%;
    margin-top: 10px;
    font-size: 12px;
    padding: 10px;
    border-radius: 9px;
    border: 1px solid var(--line);
    background: var(--bg);
    color: var(--text);
    word-break: break-all;
  }
  input {
    flex: 1;
    min-width: 0;
    font: inherit;
    padding: 9px 12px;
    border-radius: 9px;
    border: 1px solid var(--line);
    background: var(--bg);
    color: var(--text);
  }
  .note {
    margin: 10px 0 0;
    padding: 10px 12px;
    border-radius: 9px;
    background: color-mix(in srgb, var(--accent) 10%, var(--surface));
    border: 1px solid color-mix(in srgb, var(--accent) 35%, var(--line));
    font-size: 14px;
  }
  .ok,
  .failed {
    margin: 0 0 18px;
    padding: 12px 14px;
    border-radius: 10px;
  }
  .ok {
    border: 1px solid color-mix(in srgb, var(--accent-2) 50%, var(--line));
    background: color-mix(in srgb, var(--accent-2) 10%, var(--surface));
  }
  .failed {
    border: 1px solid color-mix(in srgb, #ff5a5a 50%, var(--line));
    background: color-mix(in srgb, #ff5a5a 12%, var(--surface));
  }
  .chips {
    list-style: none;
    padding: 0;
    margin: 12px 0 0;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .orders {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  .orders th,
  .orders td {
    text-align: left;
    padding: 8px 10px;
    border-bottom: 1px solid var(--line);
  }
  .orders thead th {
    font: 500 11px/1 var(--mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--dim);
  }
  .wide:has(.orders) {
    overflow-x: auto;
  }
  .links {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 28px;
  }
  .links a {
    color: var(--accent);
    text-decoration: none;
    font-weight: 600;
  }
  .why-sign {
    list-style: none;
    padding: 0;
    margin: 24px 0 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 12px;
  }
  .why-sign li {
    display: grid;
    gap: 4px;
    padding: 16px;
    border-radius: 12px;
    border: 1px solid var(--line);
  }
  .why-sign span {
    color: var(--dim);
    font-size: 14px;
  }
  code {
    font-family: var(--mono);
  }
  .gifts {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 12px;
  }
  .gifts li {
    display: grid;
    gap: 4px;
  }
  .copyrow {
    display: flex;
    gap: 8px;
  }
  .copyrow input {
    flex: 1;
    min-width: 0;
    font: 12px/1.4 var(--mono);
  }
</style>
