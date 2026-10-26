<!--
  Where the site writes to a buyer — the receipt, the licence key, word of a
  payment under way — settled before anything is paid (`worker/mail.ts`).
  The address their sign-in provider vouched for is confirmed by saying so;
  another by the six-digit code sent to it. `ready` is true once it is
  settled, and the checkout waits for it.
-->
<script lang="ts">
  import { post } from "../lib/api";
  import { session } from "../lib/session.svelte";
  import { i18n } from "../v4/i18n.svelte";
  import { STATUS } from "../v4/i18n/status";

  let { ready = $bindable(false) }: { ready?: boolean } = $props();

  const w = $derived(STATUS[i18n.lang].contact);
  const fill = (s: string, vars: Record<string, string>) => s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? vars[k] : m));

  const contact = $derived(session.user?.contact ?? null);
  const settled = $derived(!!contact && (!!contact.confirmed || !session.mail));
  let changing = $state(false);
  let email = $state(session.user?.contact?.email ?? session.user?.email ?? "");
  let pending = $state<string | null>(null);
  let code = $state("");
  let busy = $state(false);
  let error = $state<string | null>(null);

  $effect(() => {
    ready = settled && !changing;
  });

  /** The address the provider vouched for, typed as it is: one press confirms it. */
  const vouched = $derived(!!session.user?.email && email.trim().toLowerCase() === session.user.email.toLowerCase());

  async function ask() {
    busy = true;
    error = null;
    try {
      const r = await post<{ sent: boolean; pending?: string }>("/api/me/contact", { email, lang: i18n.lang });
      if (r.sent) pending = r.pending ?? email;
      else {
        changing = false;
        await session.refresh();
      }
    } catch (e) {
      error = (e as Error).message;
    } finally {
      busy = false;
    }
  }

  async function confirm(e: SubmitEvent) {
    e.preventDefault();
    busy = true;
    error = null;
    try {
      await post("/api/me/contact/confirm", { code });
      pending = null;
      code = "";
      changing = false;
      await session.refresh();
    } catch (e2) {
      error = (e2 as Error).message;
    } finally {
      busy = false;
    }
  }
</script>

<div class="contact" data-contact>
  {#if settled && !changing}
    <p class="small" data-contact-ready>
      📧 {fill(w.ready, { email: contact!.email })}
      <button class="linkish" onclick={() => ((changing = true), (email = contact!.email))} data-contact-change>{w.change}</button>
    </p>
    {#if !contact!.confirmed}<p class="small dim">{w.unconfirmed}</p>{/if}
  {:else if pending}
    <form class="step" onsubmit={confirm}>
      <h4>{w.title}</h4>
      <p class="small">{fill(w.sentTo, { email: pending })}</p>
      <div class="row">
        <input type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" bind:value={code} placeholder="000000" aria-label={w.code} data-contact-code required />
        <button class="btn primary" disabled={busy || code.replace(/\D/g, "").length !== 6} data-contact-confirm>{w.confirm}</button>
      </div>
      <button type="button" class="linkish small" onclick={ask} disabled={busy}>{w.again}</button>
    </form>
  {:else}
    <div class="step">
      <h4>{w.title}</h4>
      <p class="small dim">{w.lead}</p>
      <div class="row">
        <input type="email" bind:value={email} placeholder="you@example.org" aria-label={w.address} autocomplete="email" data-contact-email />
        <button class="btn primary" onclick={ask} disabled={busy || !email.includes("@")} data-contact-ask>{vouched || !session.mail ? w.useThis : w.send}</button>
      </div>
      {#if !session.mail}<p class="small dim">{w.noMail}</p>{/if}
    </div>
  {/if}
  {#if error}<p class="notice" role="alert">{error}</p>{/if}
</div>

<style>
  .contact {
    margin: 4px 0 14px;
  }
  .step {
    display: grid;
    gap: 8px;
    padding: 14px;
    border: 1px solid var(--line);
    border-radius: 12px;
    background: color-mix(in srgb, var(--accent) 6%, transparent);
  }
  h4 {
    margin: 0;
    font-size: 15px;
  }
  .row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .row input {
    flex: 1 1 200px;
    font: inherit;
    padding: 9px 12px;
    border-radius: 9px;
    border: 1px solid var(--line);
    background: var(--bg);
    color: var(--text);
  }
  .linkish {
    background: none;
    border: 0;
    padding: 0;
    color: var(--accent);
    cursor: pointer;
    font: inherit;
    text-decoration: underline;
    justify-self: start;
  }
  .small {
    font-size: 13px;
    margin: 0;
  }
</style>
