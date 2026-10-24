<!--
  Signing in, on this site: the providers the Worker has keys for, each with
  its own mark, coming back to the page the visitor left from. A sign-in
  that did not finish says why (`session.returned`), here where it was
  started, with the buttons to try again beside it. With no provider set
  up, the demo sign-in, labelled as one.
-->
<script lang="ts">
  import { session } from "../lib/session.svelte";
  import { profile } from "../lib/profile.svelte";
  import { BRANDS } from "./brands";

  let {
    why = "Sign in with an account you already have. djmanzo keeps no password: the provider says who you are, and your licences are tied to that account.",
    back,
    compact = false,
  }: { why?: string; back?: string; compact?: boolean } = $props();

  let name = $state(profile.p.name);
  let busy = $state(false);
  let error = $state<string | null>(null);

  async function demo(e: SubmitEvent) {
    e.preventDefault();
    busy = true;
    error = null;
    try {
      await session.demoSignIn(name || "Guest DJ");
    } catch (err) {
      error = (err as Error).message;
    } finally {
      busy = false;
    }
  }
</script>

<div class="signin" class:compact data-signin>
  {#if session.returned?.kind === "failed"}
    <p class="failed" role="alert" data-signin-failed><b>That sign-in did not finish.</b> {session.returned.why}</p>
  {/if}
  {#if why}<p class="why">{why}</p>{/if}
  {#if session.providers.length}
    <div class="providers">
      {#each session.providers as p (p.id)}
        {@const b = BRANDS[p.id]}
        <a class="provider" href={session.signInUrl(p.id, back)} style:--brand={b ? `#${b.hex}` : "var(--accent)"} data-provider={p.id}>
          {#if b}<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d={b.path} fill="currentColor" /></svg>{/if}
          <span>Continue with {p.name}</span>
        </a>
      {/each}
    </div>
  {/if}
  {#if !session.providers.length || session.demo}
    <div class="demo">
      <p>
        <b>Demo sign-in.</b>
        {session.providers.length ? "The shop is in demo mode" : "No sign-in provider is connected to this site yet"}: walk through everything with a name, no password, and nothing is charged. A demo account's licences are marked as demo and unlock nothing in djmanzo.
      </p>
      <form onsubmit={demo}>
        <input type="text" bind:value={name} placeholder="Your DJ name" aria-label="Your DJ name" maxlength="40" />
        <button class="btn primary small" disabled={busy}>{busy ? "…" : "Sign in for the demo"}</button>
      </form>
    </div>
  {/if}
  {#if error}<p class="failed" role="alert">{error}</p>{/if}
</div>

<style>
  .signin {
    display: grid;
    gap: 14px;
  }
  .why {
    margin: 0;
    color: var(--dim);
  }
  .providers {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 10px;
  }
  .compact .providers {
    grid-template-columns: 1fr;
  }
  .provider {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 48px;
    padding: 0 16px;
    border-radius: 10px;
    border: 1px solid color-mix(in srgb, var(--brand) 55%, var(--line));
    background: color-mix(in srgb, var(--brand) 14%, var(--surface));
    color: var(--text);
    font-weight: 600;
    text-decoration: none;
    transition:
      background-color 0.2s,
      transform 0.15s;
  }
  .provider:hover {
    background: color-mix(in srgb, var(--brand) 26%, var(--surface));
  }
  .provider:active {
    transform: translateY(1px);
  }
  .provider svg {
    flex: none;
    color: color-mix(in srgb, var(--brand) 40%, var(--text));
  }
  .failed {
    margin: 0;
    padding: 12px 14px;
    border-radius: 10px;
    border: 1px solid color-mix(in srgb, #ff5a5a 50%, var(--line));
    background: color-mix(in srgb, #ff5a5a 12%, var(--surface));
  }
  .demo {
    padding: 14px;
    border-radius: 12px;
    border: 1px dashed var(--line);
    font-size: 14px;
    color: var(--dim);
  }
  .demo p {
    margin: 0 0 10px;
  }
  .demo b {
    color: var(--text);
  }
  form {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  input {
    flex: 1;
    min-width: 180px;
    font: inherit;
    padding: 9px 12px;
    border-radius: 9px;
    border: 1px solid var(--line);
    background: var(--bg);
    color: var(--text);
  }
</style>
