<!--
  After a download: "Have fun, enjoy!", and what comes with the file — any
  edition free for seven days, the Hobbyist edition free for ever, the rest
  locked after the trial until a licence is bought. It floats at the foot of
  the page, solid over whatever is behind it, and goes by itself after a
  while unless the pointer or the keyboard is on it, or with × or Escape.
-->
<script lang="ts">
  import { choice } from "./dlchoice.svelte";
  import { t } from "./i18n.svelte";
  import { href } from "./router";
  import { TRIAL_DAYS } from "../../shared/catalog";

  /** How long it stays when left alone, in ms. */
  const STAYS = 20_000;

  let shown = $state(0);
  let held = $state(false);
  let card = $state<HTMLElement>();

  /** The download last answered: one that has gone by itself does not come back. */
  let seen = 0;
  $effect(() => {
    const n = choice.downloaded;
    if (!n || n === seen) return;
    seen = n;
    shown = n;
  });

  $effect(() => {
    if (!shown || held) return;
    const timer = setTimeout(() => (shown = 0), STAYS);
    return () => clearTimeout(timer);
  });

  $effect(() => {
    if (!shown) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && (shown = 0);
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  });

  const close = () => (shown = 0);
</script>

{#if shown}
  <div
    class="enjoy"
    role="status"
    aria-live="polite"
    bind:this={card}
    onpointerenter={() => (held = true)}
    onpointerleave={() => (held = false)}
    onfocusin={() => (held = true)}
    onfocusout={(e) => (held = !!card?.contains(e.relatedTarget as Node))}
    data-enjoy
    data-trial-days={TRIAL_DAYS}
  >
    <svg class="disc" viewBox="0 0 48 48" width="44" height="44" aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="#111" />
      <circle cx="24" cy="24" r="17" fill="none" stroke="rgb(255 255 255 / 0.08)" stroke-width="1" />
      <circle cx="24" cy="24" r="12.5" fill="none" stroke="rgb(255 255 255 / 0.08)" stroke-width="1" />
      <circle cx="24" cy="24" r="8" fill="var(--accent)" />
      <path d="M24 16a8 8 0 0 1 8 8" fill="none" stroke="var(--on-accent)" stroke-width="1.6" stroke-linecap="round" opacity="0.5" />
      <circle cx="24" cy="24" r="1.6" fill="#111" />
    </svg>
    <div class="words">
      <p class="title">{t("dl.thanks.title")}</p>
      <p class="body">{t("dl.thanks.body")}</p>
      <p class="how">{t("dl.thanks.how")}</p>
      <a class="btn primary small" href={href("pricing")} onclick={close} data-enjoy-editions>{t("dl.thanks.editions")}</a>
    </div>
    <button class="x" aria-label={t("dl.thanks.close")} title={t("dl.thanks.close")} onclick={close} data-enjoy-close>×</button>
  </div>
{/if}

<style>
  .enjoy {
    position: fixed;
    z-index: 70;
    left: 50%;
    bottom: 24px;
    translate: -50% 0;
    width: min(460px, calc(100vw - 32px));
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 14px;
    align-items: start;
    padding-block: 16px;
    padding-inline: 16px 10px;
    border-radius: 16px;
    /* Solid, whatever is behind it: the look's raised surface over its page colour. */
    background: linear-gradient(var(--raised, var(--surface)), var(--raised, var(--surface))), var(--bg);
    border: 1px solid color-mix(in srgb, var(--accent) 55%, var(--line));
    box-shadow:
      0 24px 60px rgb(0 0 0 / 0.6),
      0 0 0 4px color-mix(in srgb, var(--accent) 14%, transparent);
    color: var(--text);
    animation: rise 0.45s cubic-bezier(0.2, 0.9, 0.3, 1.2);
  }
  .disc {
    animation: spin 1.8s linear infinite;
  }
  .words {
    display: grid;
    gap: 6px;
    justify-items: start;
    min-width: 0;
  }
  .title {
    margin: 2px 0 0;
    font: 700 1.25rem/1.15 var(--display);
    color: var(--accent);
  }
  .body {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
  }
  .how {
    margin: 0 0 6px;
    font-size: 12.5px;
    color: var(--dim);
  }
  .x {
    width: 30px;
    height: 30px;
    border: 0;
    border-radius: 50%;
    background: color-mix(in srgb, var(--text) 8%, transparent);
    color: var(--text);
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
  }
  .x:hover,
  .x:focus-visible {
    background: color-mix(in srgb, var(--text) 16%, transparent);
  }
  /* On a phone it sits above the assistant's key in the corner. */
  @media (max-width: 640px) {
    .enjoy {
      bottom: 84px;
    }
  }
  @keyframes rise {
    from {
      opacity: 0;
      transform: translateY(18px) scale(0.97);
    }
  }
  @keyframes spin {
    to {
      transform: rotate(1turn);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .enjoy,
    .disc {
      animation: none;
    }
  }
</style>
