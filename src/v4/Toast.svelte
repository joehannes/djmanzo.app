<!--
  A line in the corner after coming back from a provider: signed in with
  whom, or why a sign-in did not finish, on whatever page the visitor
  returned to. The account page and the shop's checkout say it in place, so
  it stays quiet there. It goes by itself after a while, or with ×.
-->
<script lang="ts">
  import { session } from "../lib/session.svelte";
  import { href, type Route } from "./router";
  import { i18n } from "./i18n.svelte";
  import { ACCOUNT } from "./i18n/account";
  import { BITS } from "./i18n/bits";
  import { fill } from "./i18n/sections";

  let { route }: { route: Route } = $props();
  let gone = $state(false);

  const said = $derived(session.returned);
  const a = $derived(ACCOUNT[i18n.lang]);
  const w = $derived(BITS[i18n.lang]);
  /** The pages that show it in place: the account always, the shop while signed out (its sign-in is on the page). */
  const inPlace = $derived(route.page === "account" || (route.page === "pricing" && said?.kind === "failed"));
  const show = $derived(!!said && !gone && !inPlace);

  $effect(() => {
    if (!show || said?.kind === "failed") return;
    const t = setTimeout(() => (gone = true), 6000);
    return () => clearTimeout(t);
  });
</script>

{#if show && said}
  <div class="toast" class:bad={said.kind === "failed"} role={said.kind === "failed" ? "alert" : "status"} data-toast>
    {#if said.kind === "failed"}
      <p><b>{a.signin.notFinished}</b> {said.failure ? a.failures[said.failure] : a.signin.fallback} <a href={href("account")}>{w.toast.again}</a></p>
    {:else if said.kind === "linked"}
      <p>{fill(a.linked, { p: said.provider ?? "" })}</p>
    {:else}
      <p>{session.user ? fill(w.toast.signedInAs, { p: said.provider ?? "", name: session.user.name }) : fill(a.signedIn, { p: said.provider ?? "" })} <a href={href("account")}>{w.toast.account}</a></p>
    {/if}
    <button aria-label={w.shot.close} onclick={() => (gone = true)}>×</button>
  </div>
{/if}

<style>
  .toast {
    position: fixed;
    left: 50%;
    top: calc(var(--bar) + 12px);
    translate: -50% 0;
    z-index: 60;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    max-width: min(560px, calc(100vw - 32px));
    padding: 12px 14px 12px 16px;
    border-radius: 12px;
    background: color-mix(in srgb, var(--accent-2) 14%, var(--surface));
    border: 1px solid color-mix(in srgb, var(--accent-2) 50%, var(--line));
    box-shadow: 0 18px 40px -12px rgba(0, 0, 0, 0.6);
    animation: drop 0.35s ease-out;
  }
  .toast.bad {
    background: color-mix(in srgb, #ff5a5a 14%, var(--surface));
    border-color: color-mix(in srgb, #ff5a5a 50%, var(--line));
  }
  p {
    margin: 0;
    font-size: 14px;
  }
  a {
    color: var(--accent);
  }
  button {
    background: none;
    border: 0;
    color: var(--dim);
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
  }
  @keyframes drop {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .toast {
      animation: none;
    }
  }
</style>
