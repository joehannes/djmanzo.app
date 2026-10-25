<!--
  What each edition carries, feature by feature — not module by module, so
  the free Hobbyist edition's column is full of what it really has, and the
  Karaoke edition's shows the whole karaoke night, not one tick. Every row
  is a fact (`shared/facts.ts`): grouped by area, its status shown, and
  opened with a press to say what it does and what is not yet proven. What
  is only planned is listed apart, never ticked. "Only the differences"
  hides the rows every edition has.
-->
<script lang="ts">
  import { EDITION_INFO, MODULE_TITLE, type Edition } from "../../../shared/catalog";
  import { AREAS, FACTS, areaOf, carriedBy, type Area, type Fact } from "../../../shared/facts";
  import { ta, tf } from "../i18n/facts.svelte";
  import { i18n } from "../i18n.svelte";
  import { PRICING } from "../i18n/pricing";

  const m = $derived(PRICING[i18n.lang].matrix);

  let { chosen = null, onpick }: { chosen?: Edition | null; onpick?: (e: Edition) => void } = $props();

  /** The named editions, cheapest first; Custom is any of the modules, said under the table. */
  const COLUMNS: Edition[] = ["hobbyist", "autopilot", "karaoke", "apprentice", "pro", "full"];
  let differences = $state(false);
  let open = $state<Set<string>>(new Set());
  let folded = $state<Set<Area>>(new Set());

  const carried = (f: Fact, e: Edition) => carriedBy(f, EDITION_INFO[e].modules);
  const everywhere = (f: Fact) => COLUMNS.every((e) => carried(f, e));
  const groups = $derived(
    AREAS.filter((a) => a.id !== "editions")
      .map((a) => ({ ...ta(a), facts: FACTS.map(tf).filter((f) => f.status !== "planned" && areaOf(f) === a.id && (!differences || !everywhere(f))) }))
      .filter((g) => g.facts.length),
  );
  const planned = $derived(FACTS.filter((f) => f.status === "planned" && f.module !== "foundation").map(tf));
  const count = (e: Edition) => FACTS.filter((f) => f.status !== "planned" && areaOf(f) !== "editions" && carried(f, e)).length;
  const total = FACTS.filter((f) => f.status !== "planned" && areaOf(f) !== "editions").length;

  function toggle(id: string) {
    const next = new Set(open);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    open = next;
  }
  function fold(id: Area) {
    const next = new Set(folded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    folded = next;
  }
  const by = (f: Fact) => (f.module === "foundation" ? "Every edition" : [f.module, ...(f.also ?? [])].map((m) => MODULE_TITLE[m]).join(" or "));
</script>

<div class="matrix-tools">
  <label class="switch"><input type="checkbox" bind:checked={differences} data-differences /> {m.differences}</label>
  <span class="dim small">{m.press} <span class="yes"><svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><circle cx="6" cy="6" r="5" fill="currentColor" /></svg></span> {m.carried} · <span class="part"><svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" stroke-width="1.5" /><path d="M6 1a5 5 0 0 1 0 10z" fill="currentColor" /></svg></span> {m.partBuilt} · <span class="no">—</span> {m.notIn}</span>
</div>

<div class="matrix card" data-matrix>
  <table>
    <thead>
      <tr>
        <th scope="col" class="feat"><span class="sr-only">{m.feature}</span></th>
        {#each COLUMNS as e (e)}
          <th scope="col" class:on={chosen === e} style:--c={EDITION_INFO[e].colour}>
            <button onclick={() => onpick?.(e)} data-column={e}><span class="dot"></span>{EDITION_INFO[e].name}</button>
            <span class="count mono" data-count={e}>{count(e)} / {total}</span>
          </th>
        {/each}
      </tr>
    </thead>
    {#each groups as g (g.id)}
      <tbody data-area={g.id}>
        <tr class="group">
          <th colspan={COLUMNS.length + 1} scope="colgroup">
            <button onclick={() => fold(g.id)} aria-expanded={!folded.has(g.id)}><span class="chev" class:shut={folded.has(g.id)} aria-hidden="true">▾</span>{g.name} <span class="dim mono">{g.facts.length}</span></button>
          </th>
        </tr>
        {#if !folded.has(g.id)}
          {#each g.facts as f (f.id)}
            <tr class="row" class:opened={open.has(f.id)} data-fact={f.id}>
              <th scope="row" class="feat">
                <button onclick={() => toggle(f.id)} aria-expanded={open.has(f.id)}>{f.name}</button>
              </th>
              {#each COLUMNS as e (e)}
                <td class:on={chosen === e}>
                  {#if carried(f, e)}
                    {#if f.status === "part"}<span class="part" title={m.partBuilt} role="img" aria-label={m.partBuilt}><svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" stroke-width="1.5" /><path d="M6 1a5 5 0 0 1 0 10z" fill="currentColor" /></svg></span>{:else}<span class="yes" role="img" aria-label={m.included}><svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><circle cx="6" cy="6" r="5" fill="currentColor" /></svg></span>{/if}
                  {:else}<span class="no" aria-label={m.notIn}>—</span>{/if}
                </td>
              {/each}
            </tr>
            {#if open.has(f.id)}
              <tr class="about">
                <td colspan={COLUMNS.length + 1}>
                  <p>{f.about}</p>
                  {#if f.caveat}<p class="caveat">{f.caveat}</p>{/if}
                  <p class="mono dim tiny">{by(f)} · {f.status === "shipped" ? m.ships : m.partBuilt} · {f.source}</p>
                </td>
              </tr>
            {/if}
          {/each}
        {/if}
      </tbody>
    {/each}
  </table>
</div>
<p class="dim small after">
  {@html m.custom}
  {#if planned.length}{m.planned.replace("{list}", planned.map((f) => f.name).join("; "))}{/if}
</p>

<style>
  .matrix-tools {
    margin-top: 28px !important;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px 24px;
    margin: 0 0 14px;
  }
  .switch {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    cursor: pointer;
  }
  .switch input {
    accent-color: var(--accent);
    width: 18px;
    height: 18px;
  }
  .small {
    font-size: 13px;
  }
  .matrix {
    overflow-x: auto;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    min-width: 760px;
  }
  thead th {
    position: sticky;
    top: 0;
    background: var(--surface);
    z-index: 1;
    padding: 14px 8px 10px;
    vertical-align: bottom;
    border-bottom: 1px solid var(--line);
  }
  thead th button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: 0;
    color: var(--text);
    font: 600 14px/1.2 var(--display);
    cursor: pointer;
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--c);
  }
  .count {
    display: block;
    margin-top: 4px;
    font-size: 11px;
    color: var(--dim);
  }
  th.on,
  td.on {
    background: color-mix(in srgb, var(--accent) 9%, transparent);
  }
  .feat {
    text-align: left;
    width: 34%;
  }
  .row th button {
    background: none;
    border: 0;
    padding: 0;
    color: var(--text);
    font: 500 14px/1.35 var(--body);
    text-align: left;
    cursor: pointer;
    text-decoration: underline dotted color-mix(in srgb, var(--dim) 60%, transparent);
    text-underline-offset: 4px;
  }
  .row th button:hover {
    color: var(--accent);
  }
  .row th,
  .row td {
    padding: 9px 12px;
    border-bottom: 1px solid color-mix(in srgb, var(--line) 70%, transparent);
  }
  .row td {
    text-align: center;
  }
  .row.opened th,
  .row.opened td {
    border-bottom-color: transparent;
  }
  .group th {
    text-align: left;
    padding: 18px 12px 8px;
    background: color-mix(in srgb, var(--accent) 5%, transparent);
    border-bottom: 1px solid var(--line);
  }
  .group button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: 0;
    padding: 0;
    color: var(--accent);
    font: 600 12px/1 var(--mono);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
  }
  .chev {
    transition: transform 0.2s;
  }
  .chev.shut {
    transform: rotate(-90deg);
  }
  .about td {
    padding: 0 12px 14px;
    border-bottom: 1px solid color-mix(in srgb, var(--line) 70%, transparent);
  }
  .about p {
    margin: 0 0 6px;
    max-width: 70ch;
    font-size: 14px;
  }
  .tiny {
    font-size: 11px;
  }
  .yes,
  .part {
    display: inline-flex;
    vertical-align: middle;
  }
  .yes {
    color: var(--accent-2);
  }
  .part {
    color: var(--accent);
  }
  .no {
    color: color-mix(in srgb, var(--dim) 50%, transparent);
  }
  .after {
    margin-top: 12px;
    max-width: 80ch;
  }
</style>
