<!--
  Backstage, for the crew: how the shop is doing, codes to mint, signed
  vouchers to give away, wishes to
  stamp, words to read before they go public, orders waiting on a transfer,
  the blog desk where drafts are written in many languages, and the videos
  the plaza shows. Each is a flight case: open the one you need.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { api, post } from "../../lib/api";
  import { session } from "../../lib/session.svelte";
  import { EDITIONS, MODULES, PLANS, money, type Edition, type Plan } from "../../../shared/catalog";
  import { GENRES } from "../../lib/genres";
  import { href } from "../router";
  import { VIDEO_PLACES } from "../videos";


  let token = $state("");
  let error = $state<string | null>(null);
  let overview = $state<any>(null);

  async function ownerLogin(e: SubmitEvent) {
    e.preventDefault();
    error = null;
    try {
      await post("/api/auth/owner", { token });
      await session.refresh();
      await refresh();
    } catch (e2) {
      error = (e2 as Error).message;
    }
  }

  async function refresh() {
    if (!session.admin) return;
    try {
      overview = await api("/api/admin/overview");
    } catch (e) {
      error = (e as Error).message;
    }
  }
  onMount(refresh);

  // --- Codes --------------------------------------------------------------------
  let kind = $state<"percent" | "fixed" | "voucher">("percent");
  let value = $state(20);
  let edits = $state<Edition[]>([]);
  let plans = $state<Plan[]>([]);
  let grantEdition = $state<Edition>("pro");
  let grantPlan = $state<Plan>("monthly");
  let months = $state(3);
  let mode = $state<"general" | "individual">("general");
  let count = $state(10);
  let prefix = $state("MANZO");
  let exact = $state("");
  let emails = $state("");
  let maxUses = $state<number | null>(null);
  let expires = $state("");
  let campaign = $state("");
  let minted = $state<{ code: string; boundTo: string | null }[]>([]);
  let promos = $state<any[]>([]);

  async function mint(e: SubmitEvent) {
    e.preventDefault();
    error = null;
    try {
      const r = await post("/api/admin/promos", {
        kind,
        value: kind === "fixed" ? Math.round(value * 100) : value,
        grants: kind === "voucher" ? { edition: grantEdition, plan: grantPlan, months: grantPlan === "perpetual" ? undefined : months } : null,
        editions: edits,
        plans,
        maxUses: mode === "general" ? maxUses : 1,
        expires: expires ? new Date(expires).getTime() : null,
        campaign: campaign || null,
        ...(mode === "individual" ? { boundTo: emails } : exact ? { code: exact } : { count, prefix }),
      });
      minted = r.codes;
      await loadPromos();
    } catch (e2) {
      error = (e2 as Error).message;
    }
  }
  async function loadPromos() {
    promos = (await api("/api/admin/promos")).sort((a: any, b: any) => (a.code < b.code ? -1 : 1));
  }
  async function togglePromo(code: string, active: boolean) {
    await api(`/api/admin/promos/${code}`, { method: "PATCH", json: { active } });
    await loadPromos();
  }
  function csv(): string {
    return "code,bound_to\n" + minted.map((m) => `${m.code},${m.boundTo ?? ""}`).join("\n");
  }

  // --- Sign-in with an account people already have (worker/signin.ts) ------------------
  let signView = $state<any>(null);
  let signDraft = $state<Record<string, string>>({});
  let signMsg = $state<string | null>(null);
  async function loadSignin() {
    signView = await api("/api/admin/signin").catch((e) => ((signMsg = (e as Error).message), null));
  }
  async function saveSignin(e: SubmitEvent) {
    e.preventDefault();
    signMsg = null;
    const values = Object.fromEntries(Object.entries(signDraft).filter(([, v]) => v !== undefined && v !== ""));
    try {
      signView = await api("/api/admin/signin", { method: "PUT", json: { values } });
      signDraft = {};
      signMsg = "Saved. The sign-in buttons follow within half a minute, here and in djmanzo.";
    } catch (err) {
      signMsg = (err as Error).message;
    }
  }
  async function clearSignin(key: string) {
    signMsg = null;
    try {
      signView = await api("/api/admin/signin", { method: "PUT", json: { values: { [key]: "" } } });
      signMsg = `${key} cleared here; the Worker secret of that name, if any, is used again.`;
    } catch (err) {
      signMsg = (err as Error).message;
    }
  }

  // --- How the shop takes money (worker/payments.ts) ------------------------------------
  const PAY_FIELDS: { key: string; label: string; secret: boolean; hint: string; area?: boolean }[] = [
    { key: "STRIPE_PUBLISHABLE_KEY", label: "Stripe publishable key", secret: false, hint: "pk_live_… (Stripe → Developers → API keys)" },
    { key: "STRIPE_SECRET_KEY", label: "Stripe secret key", secret: true, hint: "sk_live_… or a restricted rk_live_…" },
    { key: "STRIPE_WEBHOOK_SECRET", label: "Stripe webhook signing secret", secret: true, hint: "whsec_… of the endpoint /api/webhooks/stripe" },
    { key: "PAYPAL_CLIENT_ID", label: "PayPal client id", secret: false, hint: "PayPal developer → Apps & Credentials" },
    { key: "PAYPAL_CLIENT_SECRET", label: "PayPal secret", secret: true, hint: "" },
    { key: "PAYPAL_ENV", label: "PayPal mode", secret: false, hint: "live or sandbox" },
    { key: "BANK_TRANSFER_DETAILS", label: "Bank transfer details", secret: false, hint: "Shown to a buyer who pays by transfer: account holder, IBAN, BIC", area: true },
    { key: "DEMO_MODE", label: "Demo checkout", secret: false, hint: "auto (on until a real way to pay is set), on, or off" },
  ];
  let payView = $state<any>(null);
  let payDraft = $state<Record<string, string>>({});
  let payMsg = $state<string | null>(null);
  let payCheck = $state<any>(null);
  async function loadPayments() {
    payView = await api("/api/admin/payments").catch((e) => ((payMsg = (e as Error).message), null));
  }
  async function savePayments(e: SubmitEvent) {
    e.preventDefault();
    payMsg = null;
    const values = Object.fromEntries(Object.entries(payDraft).filter(([, v]) => v !== undefined && v !== ""));
    try {
      payView = await api("/api/admin/payments", { method: "PUT", json: { values, wallets: payView?.wallets } });
      payDraft = {};
      payMsg = "Saved. The shop uses it within half a minute.";
    } catch (err) {
      payMsg = (err as Error).message;
    }
  }
  async function clearPayment(key: string) {
    payMsg = null;
    try {
      payView = await api("/api/admin/payments", { method: "PUT", json: { values: { [key]: "" } } });
      payMsg = `${key} cleared here; the Worker secret of that name, if any, is used again.`;
    } catch (err) {
      payMsg = (err as Error).message;
    }
  }
  async function checkPayments() {
    payCheck = null;
    try {
      payCheck = await post("/api/admin/payments/check");
    } catch (err) {
      payMsg = (err as Error).message;
    }
  }
  async function registerApplePay() {
    payMsg = null;
    try {
      const r = await post("/api/admin/payments/apple-pay");
      payMsg = `Registered ${r.domain} with Stripe: Apple Pay ${r.applePay ?? "?"}, Google Pay ${r.googlePay ?? "?"}.`;
    } catch (err) {
      payMsg = (err as Error).message;
    }
  }

  // --- A licence, granted straight into an account (checkout.grant) --------------------
  let gWho = $state("");
  let gEdition = $state<Edition>("pro");
  let gModules = $state<string[]>([]);
  let gPlan = $state<"perpetual" | "yearly" | "monthly" | "trial">("perpetual");
  let gMonths = $state(12);
  let gWhy = $state("");
  let granted = $state<{ licence: { id: string; edition: string; plan: string; expires: number | null }; order: { name?: string; email?: string } } | null>(null);
  let grantError = $state<string | null>(null);

  async function grantLicence(e: SubmitEvent) {
    e.preventDefault();
    grantError = null;
    granted = null;
    try {
      granted = await post("/api/admin/licences", { who: gWho, edition: gEdition, modules: gModules, plan: gPlan, months: gMonths, why: gWhy || null });
    } catch (err) {
      grantError = (err as Error).message;
    }
  }

  // --- The crew's password (auth.setAdminPassword) -------------------------------------
  let pwState = $state<{ set: boolean; at: number | null } | null>(null);
  let pw1 = $state("");
  let pw2 = $state("");
  let pwMsg = $state<string | null>(null);
  async function loadPassword() {
    pwState = await api("/api/admin/password").catch(() => null);
  }
  async function setPassword(e: SubmitEvent) {
    e.preventDefault();
    pwMsg = null;
    if (pw1 !== pw2) return void (pwMsg = "The two do not match.");
    try {
      await api("/api/admin/password", { method: "PUT", json: { password: pw1 } });
      pw1 = pw2 = "";
      pwMsg = "Saved. Use it to come in here from now on; the crew token still works.";
      await loadPassword();
    } catch (err) {
      pwMsg = (err as Error).message;
    }
  }

  // --- Signed vouchers (worker/voucher.ts) ----------------------------------------
  let vEdition = $state<Edition>("full");
  let vModules = $state<string[]>([]);
  let vPercent = $state(100);
  let vUntil = $state("");
  let vFor = $state("");
  let vNote = $state("");
  let vCount = $state(1);
  let made = $state<{ id: string; line: string }[]>([]);
  let vouchers = $state<any[]>([]);
  let copied = $state<string | null>(null);

  async function makeVouchers(e: SubmitEvent) {
    e.preventDefault();
    error = null;
    try {
      const r = await post("/api/admin/vouchers", {
        edition: vEdition,
        ...(vEdition === "custom" ? { modules: vModules } : {}),
        percent: vPercent,
        // The last day, to its last second, UTC.
        until: vUntil ? Math.floor(new Date(`${vUntil}T23:59:59Z`).getTime() / 1000) : null,
        for: vFor.split("\n").map((s) => s.trim()).filter(Boolean),
        note: vNote,
        count: vCount,
      });
      made = r.vouchers;
      await loadVouchers();
    } catch (e2) {
      error = (e2 as Error).message;
    }
  }
  async function loadVouchers() {
    vouchers = await api("/api/admin/vouchers");
  }
  async function revoke(id: string) {
    if (!confirm(`Withdraw ${id}? Nobody can take it at the shop after this.`)) return;
    await post(`/api/admin/vouchers/${encodeURIComponent(id)}/revoke`);
    await loadVouchers();
  }
  async function copy(line: string, id: string) {
    await navigator.clipboard.writeText(line);
    copied = id;
  }
  async function copyKept(id: string) {
    const r = await api(`/api/admin/vouchers/${encodeURIComponent(id)}`);
    await copy(r.line, id);
  }

  // --- Wishes ---------------------------------------------------------------------
  let wishes = $state<any[]>([]);
  const STATUSES = ["idea", "considering", "planned", "building", "shipped", "not-planned"];
  async function loadWishes() {
    wishes = await api("/api/wishes");
  }
  async function stampWish(id: string, status: string, note: string) {
    await api(`/api/admin/wishes/${id}`, { method: "PATCH", json: { status, note } });
    await loadWishes();
  }
  async function dropWish(id: string) {
    await api(`/api/admin/wishes/${id}`, { method: "DELETE" });
    await loadWishes();
  }

  // --- Moderation -----------------------------------------------------------------
  let pending = $state<any[]>([]);
  async function loadPending() {
    pending = await api("/api/admin/comments");
  }
  async function moderate(key: string, approve: boolean) {
    await post("/api/admin/comments/moderate", { key, approve });
    await loadPending();
  }

  // --- Outboard and Talkback (§139) ------------------------------------------------
  let packQueue = $state<any[]>([]);
  let crewWork = $state<{ reports: any[]; held: any[]; appeals: any[] }>({ reports: [], held: [], appeals: [] });
  let why = $state<Record<string, string>>({});
  let crewNote = $state<string | null>(null);
  async function loadOutboard() {
    packQueue = await api("/api/admin/outboard/queue");
  }
  async function reviewPack(id: string, version: string, approve: boolean) {
    try {
      await post("/api/admin/outboard/review", { id, version, approve, reason: why[`${id}@${version}`] ?? "" });
      crewNote = null;
      await loadOutboard();
    } catch (e) {
      crewNote = (e as Error).message;
    }
  }
  async function loadCrew() {
    crewWork = await api("/api/admin/crew");
  }
  async function decide(kind: string, target: string, keep: boolean) {
    try {
      await post("/api/admin/crew/decide", { kind, target, keep, reason: why[`${kind}:${target}`] ?? "" });
      crewNote = null;
      await loadCrew();
    } catch (e) {
      crewNote = (e as Error).message;
    }
  }

  // --- Orders ---------------------------------------------------------------------
  let orders = $state<any[]>([]);
  let bankCountry = $state<Record<string, string>>({});
  async function loadOrders() {
    orders = await api("/api/admin/orders");
  }
  async function markPaid(id: string) {
    try {
      const r = await post(`/api/admin/orders/${id}/paid`, { bankCountry: bankCountry[id] || null });
      alert(`Licence ${r.licence.id} issued. ${r.proof.reason}`);
      await loadOrders();
    } catch (e) {
      error = (e as Error).message;
    }
  }

  // --- Blog desk ------------------------------------------------------------------
  let langs = $state<Record<string, string>>({});
  let topic = $state("");
  let angle = $state("");
  let genre = $state("");
  let featured = $state<Edition | "">("");
  let audience = $state("");
  let chosenLangs = $state<string[]>(["en", "es"]);
  let generating = $state(false);
  let genResult = $state<any[] | null>(null);
  let drafts = $state<any[]>([]);
  let editing = $state<any>(null);

  async function loadBlog() {
    langs = await api("/api/blog-languages");
    drafts = await api("/api/admin/blog");
  }
  async function generate(e: SubmitEvent) {
    e.preventDefault();
    generating = true;
    genResult = null;
    try {
      genResult = await post("/api/admin/blog/generate", { topic, angle, genre: genre || undefined, edition: featured || undefined, audience, languages: chosenLangs });
      await loadBlog();
    } catch (e2) {
      error = (e2 as Error).message;
    } finally {
      generating = false;
    }
  }
  async function openDraft(slug: string, lang: string) {
    editing = await api(`/api/admin/blog/${slug}/${lang}`);
  }
  async function saveDraft(publish?: boolean) {
    const p = editing;
    editing = await api(`/api/admin/blog/${p.slug}/${p.lang}`, {
      method: "PATCH",
      json: { title: p.title, excerpt: p.excerpt, body: p.body, tags: p.tags, ...(publish !== undefined ? { published: publish } : {}) },
    });
    await loadBlog();
  }
  async function dropDraft(slug: string, lang: string) {
    if (!confirm(`Delete ${slug} (${lang})?`)) return;
    await api(`/api/admin/blog/${slug}/${lang}`, { method: "DELETE" });
    editing = null;
    await loadBlog();
  }

  // --- Videos ---------------------------------------------------------------------
  type Video = { id: string; title: string; stage?: string | null; genre?: string | null };
  let videos = $state<Video[]>([]);
  let vUrl = $state("");
  let vTitle = $state("");
  let vStage = $state("");
  async function loadVideos() {
    videos = await api("/api/videos");
  }
  async function saveVideos(next: Video[]) {
    videos = await api("/api/admin/videos", { method: "PUT", json: next });
  }
  function ytId(s: string): string {
    try {
      const u = new URL(s);
      return u.hostname === "youtu.be" ? u.pathname.slice(1) : (u.searchParams.get("v") ?? s);
    } catch {
      return s.trim();
    }
  }

  function toggle<T>(list: T[], v: T): T[] {
    return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
  }
</script>

<div class="wrap content backstage" data-backstage>
<header class="head">
  <p class="eyebrow">For the crew</p>
  <h1 class="h1">Backstage</h1>
</header>
{#if !session.admin}
  {#if session.crew}
    <p data-crew-locked>Signed in as {session.user?.name ?? "the crew"}. The crew's password is set, so Backstage asks for it too: once in this browser, for 12 hours.</p>
  {:else}
    <p>Backstage is for the crew. Sign in with an address on the crew list, or with the crew's password or token.</p>
  {/if}
  <form class="inline" onsubmit={ownerLogin}>
    <input type="password" bind:value={token} placeholder="Crew password or token" aria-label="Crew password or token" autocomplete="current-password" data-crew-password />
    <button class="btn primary">Come in</button>
  </form>
  {#if error}<p class="notice">{error}</p>{/if}
  {#if !session.user}<p class="small"><a class="link" href={href("account")}>Or sign in with your account.</a></p>{/if}
{:else}
  {#if error}<p class="notice" role="alert">{error} <button class="link" onclick={() => (error = null)}>dismiss</button></p>{/if}

  {#if overview}
    <div class="stats">
      <div><b>{overview.users}</b><span>people</span></div>
      <div><b>{overview.paid}</b><span>paid orders</span></div>
      <div><b>{Object.entries(overview.revenue).map(([c, v]) => money(v as number, c as "USD")).join(" + ") || "—"}</b><span>taken</span></div>
      <div><b>{overview.licences}</b><span>licences</span></div>
      <div><b>{overview.pendingTransfers}</b><span>transfers waiting</span></div>
      <div><b>{overview.pending}</b><span>to read</span></div>
      <div><b>{overview.wishes}</b><span>wishes</span></div>
      <div><b>{overview.promos}</b><span>codes</span></div>
    </div>
    <p class="small muted">
      Sign-in: {overview.providers.join(", ") || "none connected (demo sign-in on)"} · Payments: {Object.entries(overview.payments).filter(([, v]) => v).map(([k]) => k).join(", ")} ·
      Licences signed with: {overview.signing} · Blog drafts by: {overview.ai}
    </p>
  {/if}

  <details class="case" ontoggle={(e) => (e.currentTarget as HTMLDetailsElement).open && loadPromos()}>
    <summary>🎟️ Promo codes & vouchers</summary>
    <form onsubmit={mint} class="grid">
      <div class="chips" role="radiogroup" aria-label="Kind">
        {#each [["percent", "% off"], ["fixed", "Amount off"], ["voucher", "Voucher (free product)"]] as [k, l] (k)}
          <button type="button" class="chip" role="radio" aria-checked={kind === k} onclick={() => (kind = k as typeof kind)}>{l}</button>
        {/each}
      </div>
      {#if kind === "percent"}<label class="field"><span>Percent off</span><input type="number" min="1" max="100" bind:value={value} /></label>{/if}
      {#if kind === "fixed"}<label class="field"><span>Amount off (in dollars/euros)</span><input type="number" min="1" step="0.01" bind:value={value} /></label>{/if}
      {#if kind === "voucher"}
        <div class="two">
          <label class="field"><span>Grants</span><select bind:value={grantEdition}>{#each EDITIONS as e (e)}<option value={e}>{e}</option>{/each}</select></label>
          <label class="field"><span>Plan</span><select bind:value={grantPlan}>{#each PLANS as p (p)}<option value={p}>{p}</option>{/each}</select></label>
        </div>
        {#if grantPlan !== "perpetual"}<label class="field"><span>Months</span><input type="number" min="1" max="36" bind:value={months} /></label>{/if}
      {:else}
        <fieldset><legend>Only for editions (none = all)</legend><div class="chips">{#each EDITIONS as e (e)}<button type="button" class="chip" aria-pressed={edits.includes(e)} onclick={() => (edits = toggle(edits, e))}>{e}</button>{/each}</div></fieldset>
        <fieldset><legend>Only for plans (none = all)</legend><div class="chips">{#each PLANS as p (p)}<button type="button" class="chip" aria-pressed={plans.includes(p)} onclick={() => (plans = toggle(plans, p))}>{p}</button>{/each}</div></fieldset>
      {/if}
      <div class="chips" role="radiogroup" aria-label="General or individual">
        <button type="button" class="chip" role="radio" aria-checked={mode === "general"} onclick={() => (mode = "general")}>General — anyone may use</button>
        <button type="button" class="chip" role="radio" aria-checked={mode === "individual"} onclick={() => (mode = "individual")}>Individual — one per person</button>
      </div>
      {#if mode === "general"}
        <div class="two">
          <label class="field"><span>Exact code (optional)</span><input type="text" bind:value={exact} placeholder="BACHATA25" /></label>
          <label class="field"><span>…or how many random codes</span><input type="number" min="1" max="500" bind:value={count} disabled={!!exact} /></label>
        </div>
        <div class="two">
          <label class="field"><span>Prefix</span><input type="text" bind:value={prefix} disabled={!!exact} /></label>
          <label class="field"><span>Uses per code (empty = unlimited)</span><input type="number" min="1" bind:value={maxUses} /></label>
        </div>
      {:else}
        <label class="field"><span>E-mail addresses, one per line — each gets its own single-use code</span><textarea bind:value={emails} placeholder="ana@example.com&#10;rafa@example.com"></textarea></label>
      {/if}
      <div class="two">
        <label class="field"><span>Expires (optional)</span><input type="date" bind:value={expires} /></label>
        <label class="field"><span>Campaign (optional)</span><input type="text" bind:value={campaign} placeholder="Summer 2027" /></label>
      </div>
      <button class="btn primary">Mint</button>
    </form>
    {#if minted.length}
      <p><b>{minted.length} minted.</b> <a class="btn quiet" href={"data:text/csv;charset=utf-8," + encodeURIComponent(csv())} download="codes.csv">Download CSV</a></p>
      <ul class="codes">{#each minted as m (m.code)}<li><code>{m.code}</code>{m.boundTo ? ` → ${m.boundTo}` : ""}</li>{/each}</ul>
    {/if}
    {#if promos.length}
      <h3>All codes</h3>
      <div class="scroll">
        <table>
          <thead><tr><th>Code</th><th>Kind</th><th>Used</th><th>For</th><th>Campaign</th><th></th></tr></thead>
          <tbody>
            {#each promos as p (p.code)}
              <tr class:off={!p.a}>
                <td><code>{p.code}</code></td>
                <td>{p.k === "percent" ? `${p.v}%` : p.k === "fixed" ? money(p.v, "USD") : "voucher"}</td>
                <td>{p.u}{p.m != null ? ` / ${p.m}` : ""}</td>
                <td>{p.b ?? "anyone"}</td>
                <td>{p.c ?? ""}</td>
                <td><button class="btn quiet" onclick={() => togglePromo(p.code, !p.a)}>{p.a ? "Switch off" : "Switch on"}</button></td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </details>

  <details class="case" ontoggle={(e) => (e.currentTarget as HTMLDetailsElement).open && loadVouchers()} data-vouchers>
    <summary>🎁 Vouchers</summary>
    <p class="small muted">A signed line to give away: djmanzo reads it by itself and knows it is real. 100 % is a gift — the edition outright; less is a discount at the box office. One held to somebody is taken at the shop, signed in as them.</p>
    <form onsubmit={makeVouchers} class="grid">
      <div class="two">
        <label class="field"><span>Edition</span><select bind:value={vEdition}>{#each EDITIONS.filter((e) => e !== "hobbyist") as e (e)}<option value={e}>{e}</option>{/each}</select></label>
        <label class="field"><span>Percent off (100 = gift)</span><input type="number" min="1" max="100" bind:value={vPercent} /></label>
      </div>
      {#if vEdition === "custom"}
        <fieldset><legend>Modules</legend><div class="chips">{#each MODULES as m (m)}<button type="button" class="chip" aria-pressed={vModules.includes(m)} onclick={() => (vModules = toggle(vModules, m))}>{m}</button>{/each}</div></fieldset>
      {/if}
      <div class="two">
        <label class="field"><span>Last day it can be taken (optional)</span><input type="date" bind:value={vUntil} /></label>
        <label class="field"><span>How many</span><input type="number" min="1" max="50" bind:value={vCount} /></label>
      </div>
      <label class="field"><span>Only for (optional) — one account (github:1234567) or e-mail address per line; empty = anybody</span><textarea bind:value={vFor} placeholder="dj@example.org&#10;github:1234567"></textarea></label>
      <label class="field"><span>Note (optional, shown with it)</span><input type="text" maxlength="280" bind:value={vNote} placeholder="Happy birthday" /></label>
      <button class="btn primary">Make {vCount === 1 ? "a voucher" : `${vCount} vouchers`}</button>
    </form>
    {#if made.length}
      <p><b>{made.length} made.</b> Each line is the voucher: send it as it is.</p>
      <ul class="lines">
        {#each made as m (m.id)}
          <li><b>{m.id}</b> <button class="btn quiet" onclick={() => copy(m.line, m.id)}>{copied === m.id ? "Copied" : "Copy"}</button><code>{m.line}</code></li>
        {/each}
      </ul>
    {/if}
    {#if vouchers.length}
      <h3>All vouchers</h3>
      <div class="scroll">
        <table>
          <thead><tr><th>Voucher</th><th>Edition</th><th>Gives</th><th>For</th><th>Until</th><th>Taken</th><th></th></tr></thead>
          <tbody>
            {#each vouchers as v (v.id)}
              <tr class:off={v.revoked}>
                <td><code>{v.id}</code></td>
                <td>{v.edition}</td>
                <td>{v.percent >= 100 ? "gift" : `${v.percent}%`}</td>
                <td>{v.for ? `${v.for} named` : "anybody"}</td>
                <td>{v.until ? new Date(v.until * 1000).toISOString().slice(0, 10) : ""}</td>
                <td>{v.taken}</td>
                <td>
                  <button class="btn quiet" onclick={() => copyKept(v.id)}>{copied === v.id ? "Copied" : "Copy"}</button>
                  {#if v.revoked}withdrawn{:else}<button class="btn quiet" onclick={() => revoke(v.id)}>Withdraw</button>{/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      <p class="small muted">Withdrawing stops a voucher at the shop; a gift for anybody that djmanzo already wears offline stays worn.</p>
    {/if}
  </details>

  <details class="case" ontoggle={(e) => (e.currentTarget as HTMLDetailsElement).open && loadSignin()} data-signin-keys>
    <summary>🙋 Sign-in</summary>
    <p class="small muted">Which accounts people can sign in with, here and in djmanzo. Each provider needs an app registered in <b>your</b> account there — the link and the steps are under each one — and wants the one address on this site it may send people back to: copy it exactly. Keys set here are kept encrypted and win over the Worker secrets of the same name; empty a field to fall back to the secret.</p>
    {#if signView}
      {#if signView.unreadable}<p class="notice">The kept keys were encrypted under a secret that has since changed; set them again.</p>{/if}
      <p data-signin-offered>Offered now: <b>{signView.providers.filter((p: any) => p.offered).map((p: any) => p.name).join(", ") || "none — the demo sign-in stands in"}</b></p>
      <form onsubmit={saveSignin} class="grid">
        {#each signView.providers as p (p.id)}
          <fieldset data-signin-provider={p.id}>
            <legend>{p.name} {#if p.offered}<span class="ok">✓ offered</span>{:else}<span class="muted">— off</span>{/if}</legend>
            {#if p.who}<p class="small notice">Only {p.who}.</p>{/if}
            <p class="small muted"><a href={p.console} target="_blank" rel="noopener">{p.name}'s developer console ↗</a> · {p.steps}</p>
            <p class="small">Address to register: <code data-signin-register>{p.register}</code></p>
            {#each p.keys as k (k.field)}
              <label class="field">
                <span>{k.label} {#if k.set}<span class="muted">— {k.shown} ({k.from}){#if k.from === "backstage"} <button type="button" class="btn quiet" onclick={() => clearSignin(k.field)}>clear</button>{/if}</span>{/if}</span>
                {#if k.multiline}
                  <textarea bind:value={signDraft[k.field]} placeholder={k.set ? "leave empty to keep it" : "-----BEGIN PRIVATE KEY-----"} rows="4" spellcheck="false"></textarea>
                {:else}
                  <input type={k.field.endsWith("SECRET") ? "password" : "text"} bind:value={signDraft[k.field]} placeholder={k.set ? "leave empty to keep it" : k.label} autocomplete="off" spellcheck="false" data-signin-field={k.field} />
                {/if}
              </label>
            {/each}
          </fieldset>
        {/each}
        <button class="btn primary" data-signin-save>Save</button>
      </form>
    {/if}
    {#if signMsg}<p class="notice" data-signin-msg>{signMsg}</p>{/if}
  </details>

  <details class="case" ontoggle={(e) => (e.currentTarget as HTMLDetailsElement).open && loadPayments()} data-payments>
    <summary>💳 Payments</summary>
    <p class="small muted">How the shop takes money. The recommended setup: one <b>Stripe</b> account (Austria, sole trader) paying out to your Wise EUR IBAN, whose card form takes cards, Apple Pay and Google Pay — and PayPal and EPS once you turn them on in Stripe → Settings → Payment methods. PayPal on its own is an alternative. Keys set here are kept encrypted and win over the Worker secrets of the same name; empty a field to fall back to the secret. SETUP.md, "Payments", walks through it.</p>
    {#if payView}
      <p data-pay-mode>
        Card form: <b>{payView.mode.stripe ?? "off"}</b>{#if payView.mode.stripe && !payView.mode.stripeWebhook} <span class="notice">— add the webhook secret, or a payment the browser never reports is lost</span>{/if} ·
        PayPal: <b>{payView.mode.paypal ?? "off"}</b> · Bank transfer: <b>{payView.mode.transfer ? "on" : "off"}</b>
      </p>
      {#if payView.unreadable}<p class="notice">The kept settings were encrypted under a secret that has since changed; set the keys again.</p>{/if}
      <form onsubmit={savePayments} class="grid">
        {#each PAY_FIELDS as f (f.key)}
          <label class="field">
            <span>{f.label} {#if payView.fields[f.key]?.set}<span class="muted">— {payView.fields[f.key].shown} ({payView.fields[f.key].from}){#if payView.fields[f.key].from === "backstage"} <button type="button" class="btn quiet" onclick={() => clearPayment(f.key)}>clear</button>{/if}</span>{/if}</span>
            {#if f.area}
              <textarea bind:value={payDraft[f.key]} placeholder={f.hint} rows="3"></textarea>
            {:else}
              <input type={f.secret ? "password" : "text"} bind:value={payDraft[f.key]} placeholder={payView.fields[f.key]?.set ? "leave empty to keep it" : f.hint} autocomplete="off" spellcheck="false" data-pay-field={f.key} />
            {/if}
          </label>
        {/each}
        <fieldset><legend>In the card form</legend>
          <label class="mod"><input type="checkbox" bind:checked={payView.wallets.applePay} /> Apple Pay</label>
          <label class="mod"><input type="checkbox" bind:checked={payView.wallets.googlePay} /> Google Pay</label>
        </fieldset>
        <button class="btn primary">Save</button>
      </form>
      <div class="row">
        <button class="btn" onclick={checkPayments} data-pay-check>Check the connections</button>
        <button class="btn" onclick={registerApplePay}>Register this domain for Apple Pay and Google Pay</button>
      </div>
      {#if payCheck}
        <ul class="small" data-pay-checked>
          {#if payCheck.stripe}<li>Stripe: {payCheck.stripe.ok ? `connected (${payCheck.stripe.country ?? "?"}, ${payCheck.stripe.currency ?? "?"}); charges ${payCheck.stripe.charges ? "on" : "not yet on"}, payouts ${payCheck.stripe.payouts ? `on, to ${payCheck.stripe.payoutTo ?? "your bank"}` : "not yet on"}; this domain ${payCheck.stripe.applePayDomain ? `registered (Apple Pay ${payCheck.stripe.applePayDomain.applePay})` : "not registered for Apple Pay"}` : payCheck.stripe.said}</li>{/if}
          {#if payCheck.paypal}<li>PayPal: {payCheck.paypal.ok ? `connected (${payCheck.paypal.mode})` : payCheck.paypal.said}</li>{/if}
          {#if !payCheck.stripe && !payCheck.paypal}<li>Nothing to check: no keys are set.</li>{/if}
        </ul>
      {/if}
    {/if}
    {#if payMsg}<p class="notice" data-pay-msg>{payMsg}</p>{/if}
  </details>

  <details class="case" data-grant>
    <summary>🔑 Grant a licence</summary>
    <p class="small muted">Straight into an account, with nothing to pay or redeem: for a friend, a tester, a refund made good. Name the account by its e-mail address, its id, or a sign-in (github:1234567); they need to have signed in on the site once. djmanzo picks it up at the next sign-in.</p>
    <form onsubmit={grantLicence} class="grid">
      <label class="field"><span>Account</span><input type="text" bind:value={gWho} placeholder="dj@example.org" required data-grant-who /></label>
      <div class="two">
        <label class="field"><span>Edition</span><select bind:value={gEdition} data-grant-edition>{#each EDITIONS.filter((e) => e !== "hobbyist") as e (e)}<option value={e}>{e}</option>{/each}</select></label>
        <label class="field"><span>How</span><select bind:value={gPlan} data-grant-plan><option value="perpetual">bought once, to keep</option><option value="yearly">for a number of months (yearly)</option><option value="monthly">for a number of months (monthly)</option><option value="trial">as a 7-day trial</option></select></label>
      </div>
      {#if gEdition === "custom"}
        <fieldset><legend>Modules</legend><div class="chips">{#each MODULES as m (m)}<button type="button" class="chip" aria-pressed={gModules.includes(m)} onclick={() => (gModules = toggle(gModules, m))}>{m}</button>{/each}</div></fieldset>
      {/if}
      {#if gPlan === "yearly" || gPlan === "monthly"}
        <label class="field"><span>Months</span><input type="number" min="1" max="120" bind:value={gMonths} /></label>
      {/if}
      <label class="field"><span>Why (kept with the order)</span><input type="text" maxlength="280" bind:value={gWhy} placeholder="Beta tester" /></label>
      <button class="btn primary">Grant it</button>
    </form>
    {#if granted}<p class="notice" data-granted>Granted: {granted.licence.edition}, {granted.licence.plan}{granted.licence.expires ? ` until ${new Date(granted.licence.expires).toISOString().slice(0, 10)}` : ", for good"}, to {granted.order.name ?? granted.order.email ?? gWho}.</p>{/if}
    {#if grantError}<p class="notice">{grantError}</p>{/if}
  </details>

  <details class="case" ontoggle={(e) => (e.currentTarget as HTMLDetailsElement).open && loadPassword()} data-password>
    <summary>🔒 The crew's password</summary>
    <p class="small muted">There is no default password. {pwState?.set ? `One is set (since ${new Date(pwState.at ?? 0).toISOString().slice(0, 10)}); setting another replaces it.` : "None is set yet: until one is, signing in with a crew account (the owner's GitHub account or address, or one on ADMIN_EMAILS) opens Backstage on its own."} Once one is set, a crew account asks for it too, once in each browser, for 12 hours; nobody else gets in with it but the crew. It is kept only as a salted hash. The ADMIN_TOKEN secret always opens Backstage too, should the password be forgotten.</p>
    <form onsubmit={setPassword} class="grid">
      <div class="two">
        <label class="field"><span>New password (at least 10 characters)</span><input type="password" minlength="10" bind:value={pw1} autocomplete="new-password" required data-pw-new /></label>
        <label class="field"><span>Again</span><input type="password" minlength="10" bind:value={pw2} autocomplete="new-password" required data-pw-again /></label>
      </div>
      <button class="btn primary">{pwState?.set ? "Change the password" : "Set the password"}</button>
    </form>
    {#if pwMsg}<p class="notice" data-pw-msg>{pwMsg}</p>{/if}
  </details>

  <details class="case" ontoggle={(e) => (e.currentTarget as HTMLDetailsElement).open && loadWishes()}>
    <summary>🧱 Wishes</summary>
    {#each wishes as w (w.id)}
      {@const note = { v: w.note ?? "" }}
      <div class="wish">
        <b>{w.title}</b> <span class="muted small">📌 {w.votes} · {w.author}</span>
        <div class="inline">
          <select value={w.status} onchange={(e) => stampWish(w.id, (e.currentTarget as HTMLSelectElement).value, note.v)}>
            {#each STATUSES as s (s)}<option value={s}>{s}</option>{/each}
          </select>
          <input type="text" value={note.v} oninput={(e) => (note.v = (e.currentTarget as HTMLInputElement).value)} placeholder="A note visitors see" />
          <button class="btn quiet" onclick={() => stampWish(w.id, w.status, note.v)}>Save note</button>
          <button class="btn quiet" onclick={() => dropWish(w.id)}>Remove</button>
        </div>
      </div>
    {/each}
  </details>

  <details class="case" ontoggle={(e) => (e.currentTarget as HTMLDetailsElement).open && loadPending()}>
    <summary>👀 To read before it goes public ({overview?.pending ?? "…"})</summary>
    {#if !pending.length}<p class="muted">Nothing waiting.</p>{/if}
    {#each pending as c (c.key)}
      <div class="wish">
        <span class="muted small">{c.kind} · {c.author}{c.rating ? ` · ${c.rating}★` : ""}</span>
        <p>{c.body}</p>
        {#if c.link}<p><a href={c.link} target="_blank" rel="noopener nofollow">{c.link}</a></p>{/if}
        <button class="btn primary" onclick={() => moderate(c.key, true)}>Publish</button>
        <button class="btn quiet" onclick={() => moderate(c.key, false)}>Delete</button>
      </div>
    {/each}
  </details>

  <details class="case" ontoggle={(e) => (e.currentTarget as HTMLDetailsElement).open && loadOutboard()} data-outboard-queue>
    <summary>📦 Outboard: packs waiting ({packQueue.length})</summary>
    {#if crewNote}<p class="notice" role="alert">{crewNote}</p>{/if}
    {#each packQueue as p (`${p.id}@${p.version}`)}
      <div class="wish" data-queued={p.id}>
        <b>{p.name}</b> {p.version} · {p.kind} · by {p.author} · key <code>{p.fingerprint}</code>
        <p class="small">{p.manifest.description} · licence: {p.manifest.licence} · {Math.round(p.size / 1024)} KB{p.changelog ? ` · new: ${p.changelog}` : ""}</p>
        {#if p.kind === "theme"}<p class="small">Worn on {p.preview.base}. Every colour pair passed its contrast when it was checked.</p>{/if}
        <a class="link small" href={`/outboard/${p.id}`} target="_blank" rel="noopener">See it as its maker does</a>
        <input type="text" bind:value={why[`${p.id}@${p.version}`]} placeholder="If not: why, in a sentence the maker is told" aria-label="Why not" />
        <button class="btn primary" onclick={() => reviewPack(p.id, p.version, true)}>List it</button>
        <button class="btn" onclick={() => reviewPack(p.id, p.version, false)}>Do not list</button>
      </div>
    {:else}
      <p class="muted">Nothing waiting.</p>
    {/each}
  </details>

  <details class="case" ontoggle={(e) => (e.currentTarget as HTMLDetailsElement).open && loadCrew()} data-crew-queue>
    <summary>🚩 Talkback: reports, held posts, appeals ({crewWork.reports.length + crewWork.held.length + crewWork.appeals.length})</summary>
    {#if crewNote}<p class="notice" role="alert">{crewNote}</p>{/if}
    <h4>Held, waiting to be read</h4>
    {#each crewWork.held as h (h.target)}
      <div class="wish" data-held={h.target}>
        <b>{h.title ?? "A comment"}</b> · {h.author}
        <p class="small">{h.body}</p>
        <input type="text" bind:value={why[`${h.kind}:${h.target}`]} placeholder="If removed: why, in a sentence the author is told" aria-label="Why removed" />
        <button class="btn primary" onclick={() => decide(h.kind, h.target, true)}>Let it through</button>
        <button class="btn" onclick={() => decide(h.kind, h.target, false)}>Remove</button>
      </div>
    {:else}
      <p class="muted">Nothing held.</p>
    {/each}
    <h4>Reported</h4>
    {#each crewWork.reports as r (`${r.kind}:${r.target}`)}
      <div class="wish">
        <b>{r.kind}</b> {r.target} · {r.reports} report{r.reports === 1 ? "" : "s"}: {r.reasons}
        {#if r.kind === "post" || r.kind === "comment"}
          <input type="text" bind:value={why[`${r.kind}:${r.target}`]} placeholder="If removed: why" aria-label="Why removed" />
          <button class="btn" onclick={() => decide(r.kind, r.target, true)}>Keep it</button>
          <button class="btn" onclick={() => decide(r.kind, r.target, false)}>Remove</button>
        {:else}
          <span class="small muted">Items are removed from their own page's queue above, with a reason.</span>
        {/if}
      </div>
    {:else}
      <p class="muted">No open reports.</p>
    {/each}
    <h4>Appeals</h4>
    {#each crewWork.appeals as a (a.id)}
      <div class="wish"><b>{a.action}</b> — {a.reason}<p class="small">Their reply: {a.appeal}</p></div>
    {:else}
      <p class="muted">No appeals.</p>
    {/each}
  </details>

  <details class="case" ontoggle={(e) => (e.currentTarget as HTMLDetailsElement).open && loadOrders()}>
    <summary>🧾 Orders</summary>
    <div class="scroll">
      <table>
        <thead><tr><th>When</th><th>What</th><th>Total</th><th>How</th><th>State</th><th></th></tr></thead>
        <tbody>
          {#each orders as o (o.id)}
            <tr>
              <td>{new Date(o.at).toLocaleString()}</td>
              <td>{o.e} · {o.p}</td>
              <td>{money(o.t, o.c)}</td>
              <td>{o.v}</td>
              <td>{o.s}</td>
              <td>
                {#if o.s === "pending" && o.v === "transfer"}
                  <input class="cc" type="text" maxlength="2" placeholder="bank country" bind:value={bankCountry[o.id]} />
                  <button class="btn quiet" onclick={() => markPaid(o.id)}>Mark paid</button>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </details>

  <details class="case" ontoggle={(e) => (e.currentTarget as HTMLDetailsElement).open && loadBlog()}>
    <summary>📻 The blog desk</summary>
    <form onsubmit={generate}>
      <label class="field"><span>Topic</span><input type="text" bind:value={topic} required placeholder="Running a karaoke night at a beach bar" /></label>
      <label class="field"><span>Angle (optional)</span><textarea bind:value={angle} placeholder="Practical: the first hour, getting shy guests to sing, the voice knob"></textarea></label>
      <div class="two">
        <label class="field"><span>Genre (optional)</span><select bind:value={genre}><option value="">—</option>{#each GENRES as g (g.id)}<option value={g.name}>{g.name}</option>{/each}</select></label>
        <label class="field"><span>Edition to feature</span><select bind:value={featured}><option value="">—</option>{#each EDITIONS as e (e)}<option value={e}>{e}</option>{/each}</select></label>
      </div>
      <label class="field"><span>Reader (optional)</span><input type="text" bind:value={audience} placeholder="Bar owners who have never run karaoke" /></label>
      <fieldset><legend>Languages — each is written natively, not translated</legend>
        <div class="chips">{#each Object.entries(langs) as [code, name] (code)}<button type="button" class="chip" aria-pressed={chosenLangs.includes(code)} onclick={() => (chosenLangs = toggle(chosenLangs, code))}>{name.split(" (")[0]}</button>{/each}</div>
      </fieldset>
      <button class="btn primary" disabled={generating}>{generating ? "Writing… (a minute)" : `Draft in ${chosenLangs.length} language${chosenLangs.length === 1 ? "" : "s"}`}</button>
      <p class="small muted">Drafts are saved unpublished. Read each one, fix what is wrong, then publish. The model is told only what djmanzo really does.</p>
    </form>
    {#if genResult}
      <ul>{#each genResult as r (r.lang)}<li>{r.lang}: {r.ok ? `✓ ${r.title}` : `✗ ${r.error}`}</li>{/each}</ul>
    {/if}
    <h3>Posts and drafts</h3>
    <ul class="drafts">
      {#each drafts as d (d.slug + d.lang)}
        <li>
          <button class="link" onclick={() => openDraft(d.slug, d.lang)}>{d.title}</button>
          <span class="muted small">{d.lang} · {d.published ? "published" : "draft"} · {d.source}</span>
        </li>
      {/each}
    </ul>
    {#if editing}
      <div class="editor">
        <label class="field"><span>Title</span><input type="text" bind:value={editing.title} /></label>
        <label class="field"><span>Excerpt</span><input type="text" bind:value={editing.excerpt} /></label>
        <label class="field"><span>Body (markdown)</span><textarea class="body" bind:value={editing.body}></textarea></label>
        <div class="inline">
          <button class="btn" onclick={() => saveDraft()}>Save</button>
          <button class="btn primary" onclick={() => saveDraft(!editing.published)}>{editing.published ? "Unpublish" : "Publish"}</button>
          <button class="btn quiet" onclick={() => dropDraft(editing.slug, editing.lang)}>Delete</button>
          <button class="btn quiet" onclick={() => (editing = null)}>Close</button>
        </div>
      </div>
    {/if}
  </details>

  <details class="case" ontoggle={(e) => (e.currentTarget as HTMLDetailsElement).open && loadVideos()}>
    <summary>🎬 Videos in the plaza and on the Signal Path</summary>
    <p class="small muted">Videos show on the home page under “See it played”, in the order of the part of the page each shows; YouTube is reached only when a visitor presses play.</p>
    <ul>{#each videos as v, i (v.id)}<li>{v.title} <code>{v.id}</code>{#if v.stage} · {VIDEO_PLACES.find((st) => st.id === v.stage)?.name ?? v.stage}{/if} <button class="link" onclick={() => saveVideos(videos.filter((_, j) => j !== i))}>remove</button></li>{/each}</ul>
    <form class="inline" onsubmit={(e) => { e.preventDefault(); void saveVideos([...videos, { id: ytId(vUrl), title: vTitle, stage: vStage || null }]); vUrl = ""; vTitle = ""; vStage = ""; }}>
      <input type="text" bind:value={vUrl} placeholder="YouTube link or id" required />
      <input type="text" bind:value={vTitle} placeholder="Title" required />
      <select bind:value={vStage} aria-label="The part of the home page it shows">
        <option value="">Anywhere (shown first)</option>
        {#each VIDEO_PLACES as st (st.id)}<option value={st.id}>{st.name}</option>{/each}
      </select>
      <button class="btn">Add</button>
    </form>
  </details>
{/if}
</div>

<style>
  /* The island's shared classes, in this site's colours: Backstage was built in the island and keeps its parts. */
  .backstage {
    --primary: var(--accent);
    --on-primary: var(--on-accent);
    --secondary: var(--accent-2);
    --on-secondary: var(--on-accent);
    --ink-soft: var(--dim);
    --surface-2: var(--raised);
    padding-top: calc(var(--bar) + 48px);
    padding-bottom: 80px;
  }
  .head {
    margin-bottom: 24px;
  }
  .backstage :global(.field) {
    display: grid;
    gap: 6px;
    margin-bottom: 12px;
  }
  .backstage :global(.field > span) {
    font-weight: 600;
    font-size: 0.92rem;
  }
  .backstage :global(:is(input[type="text"], input[type="email"], input[type="search"], input[type="number"], input[type="password"], input[type="url"], input[type="date"], select, textarea)) {
    width: 100%;
    min-height: 40px;
    padding: 8px 12px;
    border-radius: 10px;
    border: 1px solid var(--line);
    background: var(--bg);
    color: var(--text);
    font: inherit;
  }
  .backstage :global(textarea) {
    min-height: 110px;
    resize: vertical;
  }
  .backstage :global(:is(input, select, textarea):focus) {
    border-color: var(--accent);
    outline: none;
  }
  .backstage :global(.muted) {
    color: var(--dim);
  }
  .backstage :global(.small) {
    font-size: 0.88rem;
  }
  .backstage :global(.notice) {
    padding: 12px 14px;
    border-radius: 12px;
    border-left: 4px solid var(--accent-2);
    background: color-mix(in srgb, var(--accent-2) 12%, var(--surface));
  }
  .backstage :global(.chips) {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .backstage :global(.btn.quiet) {
    background: transparent;
    border: 1px solid var(--line);
    color: var(--text);
  }

  .inline {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
  }
  .inline input {
    flex: 1;
    min-width: 140px;
  }
  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 8px;
    margin-bottom: 8px;
  }
  .stats div {
    display: grid;
    padding: 10px;
    border-radius: 10px;
    background: var(--surface-2);
  }
  .stats b {
    font-size: 1.3rem;
  }
  .stats span {
    font-size: 12px;
    color: var(--ink-soft);
  }
  .case {
    margin: 10px 0;
    padding: 10px 14px;
    border-radius: 12px;
    border: 2px solid var(--line);
    background: repeating-linear-gradient(45deg, transparent 0 10px, rgba(255, 255, 255, 0.015) 10px 20px);
  }
  .case summary {
    cursor: pointer;
    font-weight: 800;
    font-size: 1.05rem;
  }
  .grid {
    display: grid;
    gap: 10px;
    margin-top: 10px;
  }
  .two {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  fieldset {
    border: 1px solid var(--line);
    border-radius: 10px;
  }
  .codes {
    columns: 2;
    font-size: 14px;
  }
  .scroll {
    overflow-x: auto;
  }
  .lines {
    list-style: none;
    padding: 0;
    display: grid;
    gap: 8px;
  }
  .lines code {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    word-break: break-all;
  }
  tr.off {
    opacity: 0.5;
  }
  .wish {
    padding: 8px 0;
    border-bottom: 1px solid var(--line);
  }
  .cc {
    width: 70px !important;
    min-width: 0 !important;
    display: inline-block;
  }
  .editor .body {
    min-height: 320px;
    font-family: ui-monospace, monospace;
    font-size: 13px;
  }
  .link {
    background: none;
    border: 0;
    padding: 0;
    color: var(--primary);
    text-decoration: underline;
    cursor: pointer;
    font: inherit;
  }
  @media (max-width: 560px) {
    .two {
      grid-template-columns: 1fr;
    }
  }
</style>
