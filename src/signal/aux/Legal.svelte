<!--
  The pages a site that hosts others' words must have (Austria's ECG §5 and
  MedienG §25, the GDPR, the EU's Digital Services Act). Written for the
  owner to read over: they say what this site actually does.
-->
<script lang="ts">
  import { api } from "../../lib/api";
  import { RULES, TRUST } from "../../../shared/talkback";
  import { IMPRINT_MISSING, IMPRINT_WHAT, NO_CONTACT, PRIVACY, PRIVACY_INTRO, PRIVACY_OUTRO, SCREENING, TERMS, TERMS_INTRO, legalHtml } from "../../../shared/legal";
  import type { AuxId } from "./routes";

  let { page }: { page: AuxId } = $props();
  let imprint = $state<{ name: string; address: string; email: string } | null | undefined>(undefined);
  $effect(() => {
    void api<{ imprint: typeof imprint }>("/api/imprint").then((r) => (imprint = r.imprint)).catch(() => (imprint = null));
  });
  const contact = $derived(imprint ? imprint.email : NO_CONTACT);
  // The site's own words (shared/legal.ts), escaped before their few marks are made.
  const html = (text: string) => legalHtml(text, contact);
</script>

{#if page === "imprint"}
  {#if imprint === undefined}
    <p class="note">…</p>
  {:else if imprint}
    <dl class="imprint" data-imprint>
      <dt>Run by</dt>
      <dd>{imprint.name}</dd>
      <dt>Address</dt>
      <dd>{imprint.address}</dd>
      <dt>E-mail</dt>
      <dd><a class="link" href={`mailto:${imprint.email}`}>{imprint.email}</a></dd>
      <dt>What it is</dt>
      <dd>{IMPRINT_WHAT}</dd>
    </dl>
  {:else}
    <p data-imprint-missing>{IMPRINT_MISSING}</p>
  {/if}
{:else if page === "rules"}
  <ol class="rules">
    {#each RULES as r, i (i)}<li>{r}</li>{/each}
  </ol>
  <h2>How a new account grows in</h2>
  <ul>
    {#each TRUST as t (t.level)}<li><b>{t.name}.</b> {t.about}</li>{/each}
  </ul>
  <p>{SCREENING}</p>
{:else if page === "terms"}
  <p>{TERMS_INTRO}</p>
  <ol>
    {#each TERMS as c (c.head)}<li><b>{c.head}</b> {@html html(c.text)}</li>{/each}
  </ol>
{:else if page === "privacy"}
  <p>{PRIVACY_INTRO}</p>
  <ul>
    {#each PRIVACY as c (c.head)}<li><b>{c.head}</b> {@html html(c.text)}</li>{/each}
  </ul>
  <p>{@html html(PRIVACY_OUTRO)}</p>
{/if}

<style>
  .imprint {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 6px 16px;
  }
  .imprint dt {
    opacity: 0.7;
  }
  .imprint dd {
    margin: 0;
  }
  ol,
  ul {
    display: grid;
    gap: 8px;
    padding-left: 20px;
  }
</style>
