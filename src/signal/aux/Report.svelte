<!--
  Report: on everything (DSA Art. 16). Says what happens next — the crew
  reads it, and nothing is removed without a reason its author is told.
-->
<script lang="ts">
  import { api } from "../../lib/api";
  import type { Standing } from "./routes";

  let { kind, target, standing }: { kind: "item" | "post" | "comment" | "profile"; target: string; standing: Standing | null } = $props();
  let open = $state(false);
  let reason = $state("");
  let said = $state<string | null>(null);

  async function send() {
    try {
      await api("/api/report", { method: "POST", json: { kind, target, reason } });
      said = "Reported. The crew reads every report; nothing is removed without a reason its author is told.";
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
      <input type="text" bind:value={reason} maxlength="600" placeholder="What is wrong with it?" aria-label="What is wrong with it" />
      <button class="quiet" disabled={reason.trim().length < 4}>Send report</button>
      <button type="button" class="link" onclick={() => (open = false)}>Cancel</button>
    </form>
  {:else}
    <button class="link" onclick={() => (open = true)} data-report>Report</button>
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
