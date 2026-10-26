<!--
  Where an order stands once the checkout is done, said plainly: what
  happened, where the buyer stands, and what happens next — paid, waiting
  for a bank transfer, or paid and still being cleared by the bank. Whatever
  the state, djmanzo can be downloaded and started now; a licence not yet
  paid for arrives in the account by itself, and djmanzo picks it up.
-->
<script lang="ts">
  import { money, type Currency } from "../../shared/catalog";
  import { i18n } from "../v4/i18n.svelte";
  import { STATUS, type State } from "../v4/i18n/status";

  interface Order {
    id: string;
    total: number;
    currency: Currency;
    email?: string | null;
    method?: string | null;
    mailed?: Partial<Record<State | "receipt", number>>;
  }
  interface Props {
    done: { order: Order; licence?: unknown; processing?: boolean; instructions?: string; reference?: string; display?: string; mailedTo?: string | null };
    edition: string;
    plan: string;
    days: number;
    releases: string;
    ontrial: () => void;
    onback: () => void;
  }
  let { done, edition, plan, days, releases, ontrial, onback }: Props = $props();

  const w = $derived(STATUS[i18n.lang].status);
  const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));

  const stage = $derived<State>(done.licence ? "paid" : done.instructions ? "waiting" : "processing");
  const amount = $derived(done.display ?? money(done.order.total, done.order.currency));
  const method = $derived(done.order.method ?? "—");
  const mailedTo = $derived(done.mailedTo ?? ((stage === "paid" ? done.order.mailed?.receipt : done.order.mailed?.[stage]) ? (done.order.email ?? null) : null));
  const vars = $derived({ edition, plan, amount, method, order: done.order.id, reference: done.reference ?? done.order.id, days, email: mailedTo ?? "" });

  let copied = $state(false);
  async function copy() {
    await navigator.clipboard?.writeText(done.instructions ?? "").catch(() => {});
    copied = true;
    setTimeout(() => (copied = false), 1600);
  }
</script>

<div class="order-status card" data-done data-status={stage}>
  <p class="eyebrow"><span class="dot {stage}"></span>{w.eyebrow[stage]}</p>
  <h2 class="h2">{fill(w.title[stage], vars)}</h2>

  <section>
    <h3>{w.happenedTitle}</h3>
    <p>{fill(w.happened[stage], vars)} <span class="mono dim">{fill(w.order, vars)}</span></p>
  </section>

  <section>
    <h3>{w.standTitle}</h3>
    <p>{fill(w.stand[stage], vars)}</p>
    {#if stage === "waiting" && done.instructions}
      <div class="bank">
        <pre data-status-bank>{done.instructions}</pre>
        <button class="btn ghost small" onclick={copy}>{copied ? w.copied : w.copy}</button>
      </div>
    {/if}
  </section>

  <section>
    <h3>{w.nextTitle}</h3>
    <ol>
      {#if stage === "paid"}
        <li>{w.nextPaid1}</li>
        <li>{w.nextPaid2}</li>
      {:else}
        <li>{fill(w.nextWait1, vars)}</li>
        <li>{w.nextWait2}</li>
      {/if}
      <li data-status-mail>{mailedTo ? fill(w.mailed[stage], vars) : w.notMailed}</li>
    </ol>
  </section>

  <div class="row">
    <a class="btn primary" href={releases} data-track="status:download">{w.download}</a>
    {#if stage !== "paid"}<button class="btn ghost" onclick={ontrial} data-track="status:trial" data-status-trial>{w.trial}</button>{/if}
    <a class="btn ghost" href="/account">{w.account}</a>
    <button class="btn quiet" onclick={onback}>←</button>
  </div>
</div>

<style>
  .order-status {
    display: grid;
    gap: 14px;
    padding: 26px;
  }
  .eyebrow {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #22c55e;
  }
  .dot.waiting,
  .dot.processing {
    background: #eab308;
  }
  section h3 {
    margin: 0 0 4px;
    font-size: 13px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--dim);
  }
  section p,
  ol {
    margin: 0;
  }
  ol {
    padding-left: 20px;
    display: grid;
    gap: 6px;
  }
  .bank {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    margin-top: 8px;
    flex-wrap: wrap;
  }
  pre {
    margin: 0;
    padding: 12px;
    border-radius: 10px;
    background: var(--raised);
    white-space: pre-wrap;
    font-size: 14px;
    flex: 1 1 260px;
  }
  .row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
</style>
