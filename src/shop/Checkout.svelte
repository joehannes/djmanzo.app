<!--
  Paying. Card (Stripe), PayPal, a bank transfer, or — while the shop is in
  demo mode — a rehearsal that runs the very same checks without money.

  The regional price is proven here: the card's country and the billing
  address are read by the Worker, and if they do not back the price the
  buyer chose, the Worker says which price they do back and asks again.
  Nobody is charged a price they did not see.
-->
<script lang="ts">
  import { untrack } from "svelte";
  import { ApiError, post } from "../lib/api";
  import { catalog } from "../lib/catalog.svelte";
  import { session } from "../lib/session.svelte";
  import { countries, flag } from "../lib/countries";
  import type { Edition, Module, Plan } from "../../shared/catalog";
  import { i18n } from "../v4/i18n.svelte";
  import { PRICING } from "../v4/i18n/pricing";

  const w = $derived(PRICING[i18n.lang].checkout);
  const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));

  interface Props {
    edition: Edition;
    modules: Module[];
    plan: Exclude<Plan, "trial">;
    country: string;
    promo: string;
    /** A signed discount voucher's line, brought from /redeem. */
    voucher?: string;
    /** Bought for someone else: a gift voucher instead of a licence. */
    gift?: { for: string | null; note: string | null } | null;
    total: number;
    display: string;
    ondone: (r: { licence?: { id: string; edition: string; modules?: string[]; plan: string; expires: number | null; demo?: boolean }; gift?: { id: string; line: string; edition: string; rehearsal?: boolean } }) => void;
  }
  let { edition, modules, plan, country, promo, voucher = "", gift = null, total, display, ondone }: Props = $props();

  type Method = "card" | "paypal" | "transfer" | "demo";
  const pay = $derived(catalog.data?.pay);
  const methods = $derived(
    ([pay?.stripe && "card", pay?.paypal && "paypal", pay?.transfer && "transfer", pay?.demo && "demo"].filter(Boolean) as Method[]),
  );
  let method = $state<Method | null>(null);
  $effect(() => {
    if (!method || !methods.includes(method)) method = methods[0] ?? null;
  });

  let busy = $state(false);
  let error = $state<string | null>(null);
  let confirmHigher = $state<{ reason: string; display: string } | null>(null);
  let transfer = $state<{ instructions: string; reference: string; display: string } | null>(null);
  const list = countries();

  // Demo: the two countries a real payment would carry, typed in.
  let demoCard = $state(untrack(() => country));
  let demoBilling = $state(untrack(() => country));

  const input = $derived({ edition, modules, plan, country, promo: promo || null, voucher: voucher || null, gift });

  function handle(e: unknown) {
    if (e instanceof ApiError && e.status === 409 && e.data.needsConfirm) {
      confirmHigher = { reason: e.message, display: String(e.data.display) };
      return;
    }
    error = (e as Error).message;
  }

  async function free() {
    busy = true;
    error = null;
    try {
      ondone(await post("/api/checkout/free", input));
    } catch (e) {
      handle(e);
    } finally {
      busy = false;
    }
  }

  async function demo(acceptHigher = false) {
    busy = true;
    error = null;
    try {
      ondone(await post("/api/checkout/demo", { ...input, instrument: demoCard, billing: demoBilling, acceptHigher }));
      confirmHigher = null;
    } catch (e) {
      handle(e);
    } finally {
      busy = false;
    }
  }

  async function bank() {
    busy = true;
    error = null;
    try {
      const r = await post("/api/checkout/transfer", { ...input, billing: demoBilling });
      transfer = { instructions: r.instructions, reference: r.reference, display: r.display };
    } catch (e) {
      handle(e);
    } finally {
      busy = false;
    }
  }

  // --- Stripe -----------------------------------------------------------------

  function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement("script");
      s.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(w.noForm));
      document.head.appendChild(s);
    });
  }

  let cardHost = $state<HTMLDivElement>();
  let addressHost = $state<HTMLDivElement>();
  let stripe: any = null;
  let elements: any = null;

  $effect(() => {
    if (method !== "card" || !pay?.stripe || !cardHost || !addressHost || total <= 0) return;
    let cancelled = false;
    void (async () => {
      try {
        await loadScript("https://js.stripe.com/v3/");
        if (cancelled) return;
        stripe = (window as any).Stripe(pay.stripe!.key);
        const currency = (catalog.data?.visitor.currency ?? "USD").toLowerCase();
        elements = stripe.elements({
          mode: plan === "perpetual" ? "payment" : "subscription",
          amount: total,
          currency,
          paymentMethodCreation: "manual",
          appearance: { theme: document.documentElement.dataset.day === "1" ? "stripe" : "night" },
        });
        // The wallets the crew allowed in Backstage; the rest of the methods are Stripe's dashboard's to turn on.
        const w = pay.stripe!.wallets ?? { applePay: true, googlePay: true };
        elements.create("payment", { wallets: { applePay: w.applePay ? "auto" : "never", googlePay: w.googlePay ? "auto" : "never" } }).mount(cardHost);
        elements.create("address", { mode: "billing", defaultValues: { address: { country } } }).mount(addressHost);
      } catch (e) {
        error = (e as Error).message;
      }
    })();
    return () => {
      cancelled = true;
      elements = null;
    };
  });

  async function card(acceptHigher = false) {
    if (!stripe || !elements) return;
    busy = true;
    error = null;
    try {
      const { error: submitError } = await elements.submit();
      if (submitError) throw new Error(submitError.message);
      const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({ elements });
      if (pmError) throw new Error(pmError.message);
      let r = await post("/api/checkout/stripe", { ...input, paymentMethod: paymentMethod.id, acceptHigher });
      if (r.requiresAction) {
        const { error: actionError } = await stripe.handleNextAction({ clientSecret: r.clientSecret });
        if (actionError) throw new Error(actionError.message);
        r = await post("/api/checkout/stripe/finalize", { order: r.order.id });
      }
      confirmHigher = null;
      ondone(r);
    } catch (e) {
      handle(e);
    } finally {
      busy = false;
    }
  }

  // --- PayPal -----------------------------------------------------------------

  let paypalHost = $state<HTMLDivElement>();
  let paypalOrder: string | null = null;

  $effect(() => {
    if (method !== "paypal" || !pay?.paypal || !paypalHost || total <= 0) return;
    const host = paypalHost;
    host.innerHTML = "";
    const currency = catalog.data?.visitor.currency ?? "USD";
    void loadScript(`https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(pay.paypal.clientId)}&intent=authorize&currency=${currency}`)
      .then(() => {
        (window as any).paypal
          .Buttons({
            createOrder: async () => {
              const r = await post("/api/checkout/paypal", input);
              paypalOrder = r.order;
              return r.paypalOrder;
            },
            onApprove: async () => {
              try {
                ondone(await post("/api/checkout/paypal/capture", { order: paypalOrder }));
              } catch (e) {
                handle(e);
              }
            },
            onError: (e: Error) => (error = e.message || "PayPal could not finish."),
          })
          .render(host);
      })
      .catch((e) => (error = (e as Error).message));
  });

  const LABEL = $derived(w.method as Record<Method, string>);
</script>

{#if !session.user}
  <!-- The parent shows sign-in; nothing to pay with yet. -->
{:else if total === 0}
  <button class="btn primary" onclick={free} disabled={busy}>{w.nothing}</button>
{:else if transfer}
  <div class="notice ok">
    <p><b>{fill(w.waiting, { reference: transfer.reference, amount: transfer.display })}</b></p>
    <pre>{transfer.instructions}</pre>
    <p class="small">{@html fill(w.reference, { reference: transfer.reference })}</p>
  </div>
{:else}
  <div class="methods" role="radiogroup" aria-label={w.methodsAria}>
    {#each methods as m (m)}
      <button class="chip" role="radio" aria-checked={method === m} onclick={() => (method = m)}>{LABEL[m]}</button>
    {/each}
  </div>

  {#if method === "demo"}
    <div class="demo">
      <p class="small">{w.demoAbout}</p>
      <div class="two">
        <label class="field"><span>{w.cardIn}</span>
          <select bind:value={demoCard}>{#each list as c (c.code)}<option value={c.code}>{flag(c.code)} {c.name}</option>{/each}</select>
        </label>
        <label class="field"><span>{w.billingIn}</span>
          <select bind:value={demoBilling}>{#each list as c (c.code)}<option value={c.code}>{flag(c.code)} {c.name}</option>{/each}</select>
        </label>
      </div>
      <button class="btn primary" onclick={() => demo()} disabled={busy}>{busy ? "…" : fill(w.rehearse, { amount: display })}</button>
    </div>
  {:else if method === "card"}
    <div bind:this={cardHost} class="stripe"></div>
    <div bind:this={addressHost} class="stripe"></div>
    <button class="btn primary" onclick={() => card()} disabled={busy}>{busy ? "…" : fill(w.payAmount, { amount: display })}</button>
    <p class="small muted">{w.cardNote}</p>
  {:else if method === "paypal"}
    <p class="small muted">{w.paypalNote}</p>
    <div bind:this={paypalHost}></div>
  {:else if method === "transfer"}
    <label class="field"><span>{w.billingIn}</span>
      <select bind:value={demoBilling}>{#each list as c (c.code)}<option value={c.code}>{flag(c.code)} {c.name}</option>{/each}</select>
    </label>
    <button class="btn primary" onclick={bank} disabled={busy}>{w.bank}</button>
  {:else}
    <p class="notice">{w.noWay}</p>
  {/if}

  {#if confirmHigher}
    <div class="notice" role="alert">
      <p>{confirmHigher.reason}</p>
      <button class="btn primary" onclick={() => (method === "card" ? card(true) : demo(true))} disabled={busy}>{fill(w.payInstead, { amount: confirmHigher.display })}</button>
      <button class="btn quiet" onclick={() => (confirmHigher = null)}>{w.notNow}</button>
    </div>
  {/if}
{/if}
{#if error}<p class="notice" role="alert">{error}</p>{/if}

<style>
  .methods {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
  }
  .two {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .stripe {
    margin-bottom: 12px;
  }
  pre {
    white-space: pre-wrap;
    font: inherit;
    background: rgba(0, 0, 0, 0.2);
    padding: 10px;
    border-radius: 8px;
  }
  .notice {
    margin-top: 10px;
  }
  @media (max-width: 560px) {
    .two {
      grid-template-columns: 1fr;
    }
  }
</style>
