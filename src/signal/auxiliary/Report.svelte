<!--
  Report: on everything (DSA Art. 16). Says what happens next — the crew
  reads it, and nothing is removed without a reason its author is told.
-->
<script lang="ts">
  import { api } from "../../lib/api";
  import type { Standing } from "./routes";
  import { i18n } from "../../v4/i18n.svelte";
  import { TALKBACK } from "../../v4/i18n/talkback";

  let { kind, target, standing }: { kind: "item" | "post" | "comment" | "profile"; target: string; standing: Standing | null } = $props();
  let open = $state(false);
  let reason = $state("");
  let said = $state<string | null>(null);
  const w = $derived(TALKBACK[i18n.lang].report);

  async function send() {
    try {
      await api("/api/report", { method: "POST", json: { kind, target, reason } });
      said = w.done;
      open = false;
    } catch (e) {
      said = (e as Error).message;
    }
  }
</script>

{#if standing?.vouched && !standing.closed}
  {#if said}
    <span class="note" role="status">{said}</span>
  {:else if open}
    <form class="report" onsubmit={(e) => { e.preventDefault(); void send(); }} data-report-form>
      <input type="text" bind:value={reason} maxlength="600" placeholder={w.placeholder} aria-label={w.aria} />
      <button class="quiet" disabled={reason.trim().length < 4}>{w.send}</button>
      <button type="button" class="link" onclick={() => (open = false)}>{w.cancel}</button>
    </form>
  {:else}
    <button class="link" onclick={() => (open = true)} data-report>{w.report}</button>
  {/if}
{/if}

<style>
  .report {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }
</style>
