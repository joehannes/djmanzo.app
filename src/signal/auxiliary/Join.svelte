<!--
  What stands between a visitor and taking part, said plainly: the site not
  yet open for writing, signing in, or the demo sign-in that cannot.
-->
<script lang="ts">
  import { session } from "../../lib/session.svelte";
  import type { Standing } from "./routes";
  import { i18n } from "../../v4/i18n.svelte";
  import { TALKBACK, type Doing } from "../../v4/i18n/talkback";
  import { fill } from "../../v4/i18n/sections";
  let { standing, doing = "take" }: { standing: Standing | null; doing?: Doing } = $props();
  const w = $derived(TALKBACK[i18n.lang].join);
  const providers = $derived(session.providers.filter((p) => p.id !== "demo"));
</script>

{#if !standing}
  <p class="note">…</p>
{:else if standing.closed}
  <p class="note" data-closed>{standing.closed}</p>
{:else if !standing.signedIn || !standing.vouched}
  <div class="join" data-join>
    <p>{standing.signedIn ? w.demo[doing] : w.signIn[doing]}</p>
    {#each providers as p (p.id)}
      <a class="go" href={session.signInUrl(p.id)}>{fill(w.continueWith, { p: p.name })}</a>
    {:else}
      <p class="note">{w.noProvider}</p>
    {/each}
  </div>
{/if}

<style>
  .join {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }
  .join p {
    margin: 0;
    flex-basis: 100%;
  }
</style>
