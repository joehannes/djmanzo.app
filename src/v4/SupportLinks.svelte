<!--
  Where people can support you: a few words about yourself and up to six
  pages on the official platforms (Patreon, Ko-fi, Liberapay, GitHub
  Sponsors, Buy Me a Coffee, Open Collective, PayPal.me), shown on your
  profile, your packs and beside your name in the forum. A Patreon page
  that came from connecting Patreon is marked as verified. djmanzo handles
  no money and takes nothing: these are your own pages.
-->
<script lang="ts">
  import { api } from "../lib/api";
  import { session } from "../lib/session.svelte";
  import { DONATION_PLATFORMS, MOST_LINKS, donationLink } from "../../shared/outboard";
  import { BRANDS, brandOf } from "./brands";

  let about = $state("");
  let links = $state<string[]>([""]);
  let saved = $state<string | null>(null);
  let busy = $state(false);
  let loadedFor: string | null = null;

  $effect(() => {
    const uid = session.user?.id;
    if (!uid || uid === loadedFor) return;
    loadedFor = uid;
    api<{ about: string; links: { url: string }[] }>(`/api/outboard/makers/${encodeURIComponent(uid)}`)
      .then((m) => {
        about = m.about ?? "";
        links = m.links?.length ? m.links.map((l) => l.url) : [""];
      })
      .catch(() => {});
  });

  async function save(e: SubmitEvent) {
    e.preventDefault();
    busy = true;
    saved = null;
    try {
      await api("/api/outboard/profile", { method: "PUT", json: { about, links: links.map((l) => l.trim()).filter(Boolean) } });
      saved = "Saved. It shows on your profile, your packs and beside your name in the forum.";
    } catch (err) {
      saved = (err as Error).message;
    } finally {
      busy = false;
    }
  }
</script>

{#if session.user?.patreon}
  {@const b = BRANDS.patreon}
  <p class="verified"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d={b.path} fill="currentColor" /></svg> <a href={session.user.patreon} rel="noopener noreferrer" target="_blank">{session.user.patreon.replace("https://www.", "")}</a> <span class="tag">verified by Patreon</span></p>
{/if}
<form onsubmit={save} data-support>
  <label class="field"><span>A few words about you</span><textarea bind:value={about} maxlength="400" rows="3" placeholder="Where you play, what you make, what the support pays for."></textarea></label>
  {#each links as _, i (i)}
    {@const found = links[i].trim() ? donationLink(links[i]) : null}
    {@const b = found ? brandOf(found.platform) : undefined}
    <div class="link">
      <span class="mark" class:ok={!!found} style:--brand={b ? `#${b.hex}` : "var(--line)"} aria-hidden="true">
        {#if b}<svg viewBox="0 0 24 24" width="16" height="16"><path d={b.path} fill="currentColor" /></svg>{:else}+{/if}
      </span>
      <input type="url" bind:value={links[i]} placeholder="https://ko-fi.com/yourname" aria-label="Support page {i + 1}" />
      {#if links.length > 1}<button type="button" class="x" aria-label="Remove" onclick={() => (links = links.filter((_, j) => j !== i))}>×</button>{/if}
    </div>
    {#if links[i].trim() && !found}<p class="bad small">Not a page on one of the platforms below.</p>{/if}
  {/each}
  {#if links.length < MOST_LINKS}<button type="button" class="more" onclick={() => (links = [...links, ""])}>+ Another page</button>{/if}
  <p class="dim small">
    {#each DONATION_PLATFORMS as p, i (p.name)}{@const b = brandOf(p.name)}{#if b}<svg class="inline" viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path d={b.path} fill="currentColor" /></svg>{/if}{p.name}{i < DONATION_PLATFORMS.length - 1 ? " · " : ""}{/each}
  </p>
  <button class="btn primary small" disabled={busy || session.user?.demo}>{busy ? "…" : "Save"}</button>
  {#if session.user?.demo}<p class="dim small">A demo account cannot publish a profile.</p>{/if}
  {#if saved}<p class="note small" role="status">{saved}</p>{/if}
</form>

<style>
  form {
    display: grid;
    gap: 10px;
  }
  .field {
    display: grid;
    gap: 4px;
    font-size: 14px;
  }
  textarea,
  input {
    font: inherit;
    padding: 9px 12px;
    border-radius: 9px;
    border: 1px solid var(--line);
    background: var(--bg);
    color: var(--text);
    min-width: 0;
  }
  .link {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .link input {
    flex: 1;
  }
  .mark {
    flex: none;
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 8px;
    border: 1px solid var(--brand);
    color: var(--dim);
  }
  .mark.ok {
    color: var(--text);
    background: color-mix(in srgb, var(--brand) 22%, transparent);
  }
  .x,
  .more {
    background: none;
    border: 1px solid var(--line);
    color: var(--text);
    border-radius: 8px;
    cursor: pointer;
    font: inherit;
  }
  .x {
    width: 34px;
    height: 34px;
  }
  .more {
    justify-self: start;
    padding: 6px 12px;
    font-size: 14px;
  }
  .small {
    font-size: 13px;
    margin: 0;
  }
  .bad {
    color: #ff8a8a;
  }
  .inline {
    vertical-align: -1px;
    margin-right: 3px;
  }
  .verified {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 12px;
  }
  .verified a {
    color: var(--accent);
  }
  .tag {
    padding: 2px 8px;
    border-radius: 999px;
    border: 1px solid #f96854;
    font: 500 11px/1.6 var(--mono);
    text-transform: uppercase;
    color: #ffb4a8;
  }
  .note {
    padding: 10px 12px;
    border-radius: 9px;
    background: color-mix(in srgb, var(--accent) 10%, var(--surface));
    border: 1px solid color-mix(in srgb, var(--accent) 35%, var(--line));
  }
</style>
