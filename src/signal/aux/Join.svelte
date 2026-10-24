<!--
  What stands between a visitor and taking part, said plainly: the site not
  yet open for writing, signing in, or the demo sign-in that cannot.
-->
<script lang="ts">
  import { session } from "../../lib/session.svelte";
  import type { Standing } from "./routes";
  let { standing, doing = "take part" }: { standing: Standing | null; doing?: string } = $props();
  const providers = $derived(session.providers.filter((p) => p.id !== "demo"));
</script>

{#if !standing}
  <p class="note">…</p>
{:else if standing.closed}
  <p class="note" data-closed>{standing.closed}</p>
{:else if !standing.signedIn || !standing.vouched}
  <div class="join" data-join>
    <p>{standing.signedIn ? "The demo sign-in cannot" : "Sign in to"} {doing}{standing.signedIn ? ": sign in with an account a provider vouches for." : "."}</p>
    {#each providers as p (p.id)}
      <a class="go" href={session.signInUrl(p.id)}>Continue with {p.name}</a>
    {:else}
      <p class="note">No sign-in provider is connected to this site yet.</p>
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
