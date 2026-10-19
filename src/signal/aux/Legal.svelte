<!--
  The pages a site that hosts others' words must have (Austria's ECG §5 and
  MedienG §25, the GDPR, the EU's Digital Services Act). Written for the
  owner to read over: they say what this site actually does.
-->
<script lang="ts">
  import { api } from "../../lib/api";
  import { RULES, TRUST } from "../../../shared/talkback";
  import type { AuxId } from "./routes";

  let { page }: { page: AuxId } = $props();
  let imprint = $state<{ name: string; address: string; email: string } | null | undefined>(undefined);
  $effect(() => {
    void api<{ imprint: typeof imprint }>("/api/imprint").then((r) => (imprint = r.imprint)).catch(() => (imprint = null));
  });
  const contact = $derived(imprint ? imprint.email : "the address in the imprint, once it is filled in");
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
      <dd>The website of djmanzo, a DJ and karaoke application: its shop, its marketplace (Outboard) and its discussion space (Talkback).</dd>
    </dl>
  {:else}
    <p data-imprint-missing>The imprint is being completed. Until it is, nobody can post, comment, vote or upload here; reading is open.</p>
  {/if}
{:else if page === "rules"}
  <ol class="rules">
    {#each RULES as r, i (i)}<li>{r}</li>{/each}
  </ol>
  <h2>How a new account grows in</h2>
  <ul>
    {#each TRUST as t (t.level)}<li><b>{t.name}.</b> {t.about}</li>{/each}
  </ul>
  <p>A new account's posts may be read first by an AI screen (Claude), which can only let a post through or hold it for a person: it never removes anything. People decide.</p>
{:else if page === "terms"}
  <p>By posting, commenting, rating or uploading here you agree to these terms. They are short on purpose.</p>
  <ol>
    <li><b>Yours stays yours.</b> What you post or upload remains your work. You let this site show it and, for packs, hand it out under the licence you named, free, for as long as it is listed.</li>
    <li><b>Only what is yours to share.</b> No music, samples or stems of other people's records, and nothing you have no right to give away. Packs need a licence that lets them be shared (MIT, Apache-2.0, a Creative Commons licence, CC0).</li>
    <li><b>Everything here is free.</b> Nothing is sold in Outboard and the site takes nothing. A maker may link to their own page on an official donation platform; any money goes between you and them, not through djmanzo.</li>
    <li><b>The rules apply.</b> See the <a class="link" href="#/rules">community rules</a>. Anything can be reported.</li>
    <li><b>Removal, with reasons.</b> The crew may hold or remove a post, comment, item or page that breaks these terms or the law. You are always told why, and you can reply; the crew reads it.</li>
    <li><b>Packs are checked, not guaranteed.</b> Each is checked as djmanzo checks one before it installs it, and djmanzo checks it again. Install what you trust.</li>
    <li><b>Leaving.</b> Ask at {contact} and your account, posts and uploads are removed.</li>
  </ol>
{:else if page === "privacy"}
  <p>What this site keeps about you, and why. It shows no adverts and runs no trackers.</p>
  <ul>
    <li><b>When you sign in:</b> what the provider (Google, Apple, GitHub, Microsoft or Discord) tells it — your name, your e-mail address and an id — to know you next time and to tie licences and posts to you. Kept in Cloudflare's storage until you ask for it to be removed.</li>
    <li><b>What you write:</b> posts, comments, votes, ratings, reports and uploads, with when you wrote them, shown as you meant them to be.</li>
    <li><b>Your address on the internet:</b> used, scrambled, to count requests so the site cannot be flooded. Not kept beyond that.</li>
    <li><b>The AI screen:</b> a new account's post may be sent to Anthropic's Claude to be read before a person does. Under Anthropic's commercial terms, what is sent this way is not used to train its models.</li>
    <li><b>What you allowed on the Signal Path</b> (roughly where you are, your own location) stays in your browser; <i>Forget me</i> removes it.</li>
    <li><b>Purchases:</b> handled by the payment provider; this site keeps the order and the licence.</li>
  </ul>
  <p>To see, correct or remove what is kept about you, write to {contact}.</p>
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
