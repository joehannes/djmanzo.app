<!--
  Your pass: who you are on the island, your licences, the line that carries
  them into djmanzo on a computer that cannot sign in itself, the passport of
  places you have visited — and what the island remembers about you, with
  the means to make it forget.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { api, post } from "../lib/api";
  import { session } from "../lib/session.svelte";
  import { profile } from "../lib/profile.svelte";
  import { PLACES, type PlaceId } from "../lib/places";
  import { GENRE_BY_ID } from "../lib/genres";
  import { EDITION_INFO, MODULE_TITLE, type Edition, type Module } from "../../shared/catalog";
  import SignIn from "../shop/SignIn.svelte";

  let { go }: { go: (id: PlaceId) => void } = $props();

  interface Lic {
    id: string;
    edition: string;
    modules?: string[];
    plan: string;
    status: string;
    expires: number | null;
    inForce: boolean;
    demo: boolean;
  }
  let licences = $state<Lic[]>([]);
  let line = $state<{ licence?: string; refused?: string; account?: string } | null>(null);
  let copied = $state(false);
  let prizeMsg = $state<string | null>(null);

  const stampable = PLACES.filter((p) => p.stamp);
  const NEED = 7;

  async function loadLicences() {
    if (!session.user) return;
    try {
      licences = await api("/api/me/licences");
    } catch {
      licences = [];
    }
  }

  async function showLine() {
    copied = false;
    try {
      line = await api("/api/me/licence-line");
    } catch (e) {
      line = { refused: (e as Error).message };
    }
  }

  async function copyLine() {
    if (!line?.licence) return;
    await navigator.clipboard.writeText(line.licence);
    copied = true;
  }

  async function claim() {
    prizeMsg = null;
    try {
      const r = await post("/api/journey/reward", { stamps: profile.p.stamps });
      profile.set("prize", r.code);
    } catch (e) {
      prizeMsg = (e as Error).message;
    }
  }

  onMount(async () => {
    if (!session.loaded) await session.refresh();
    await loadLicences();
  });

  $effect(() => {
    if (session.user) void loadLicences();
  });

  const date = (t: number) => new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
</script>

{#if !session.user}
  <SignIn why="Sign in to see your licences, carry them into djmanzo, and claim the island's prize." />
{:else}
  <section class="who">
    {#if session.user.avatar}<img src={session.user.avatar} alt="" />{/if}
    <div>
      <b>{session.user.name}</b>{#if session.user.demo}<span class="badge">demo account</span>{/if}
      <span class="muted small">{session.user.email ?? "no e-mail shared"} · signed in with {session.user.providers.join(", ") || "the crew's token"}</span>
    </div>
    <button class="btn quiet" onclick={() => session.signOut()}>Sign out</button>
  </section>

  <h2>Your licences</h2>
  {#if licences.length}
    <ul class="lics">
      {#each licences as l (l.id)}
        <li class:off={!l.inForce}>
          <b>djmanzo {EDITION_INFO[l.edition as Edition]?.name ?? l.edition}</b>{#if l.modules?.length && l.edition === "custom"} ({l.modules.map((m) => MODULE_TITLE[m as Module] ?? m).join(", ")}){/if} — {l.plan === "perpetual" ? "bought once" : l.plan === "trial" ? "a free trial" : l.plan}
          {#if l.demo}<span class="badge">demo</span>{/if}
          <span class="muted small">{l.inForce ? (l.expires ? `until ${date(l.expires)}` : "bought once, kept for ever") : `ended (${l.status})`}</span>
        </li>
      {/each}
    </ul>
    <p class="small">To use a licence: in djmanzo, <b>Settings → Licence</b>, sign in with the account you use here. djmanzo fetches it by itself and keeps working offline.</p>
    <p class="small">A computer that cannot sign in takes the licence as one line of text, pasted in the same place.</p>
    <button class="btn quiet" onclick={showLine} data-licence-line>Show my licence line</button>
    {#if line?.licence}
      <textarea class="line" readonly rows="3" aria-label="Your licence line">{line.licence}</textarea>
      <button class="btn" onclick={copyLine}>{copied ? "Copied" : "Copy it"}</button>
      <p class="small muted">It names your {line.account?.split(":")[0]} account and is checked by djmanzo offline; anyone you give it to gets your licence.</p>
    {:else if line?.refused}
      <p class="notice">{line.refused}</p>
    {/if}
  {:else}
    <p class="muted">None yet. <button class="link" onclick={() => go("taquilla")}>The box office is at the harbour.</button></p>
  {/if}
{/if}


<h2>Your passport</h2>
<div class="stamps">
  {#each stampable as p (p.id)}
    {@const has = profile.p.stamps.includes(p.id)}
    <button class="stamp" class:has onclick={() => go(p.id)} aria-label="{p.name}{has ? ', visited' : ', not yet visited'}">
      <span aria-hidden="true">{p.emoji}</span>
      <small>{p.name}</small>
    </button>
  {/each}
</div>
{#if profile.p.prize}
  <p class="notice ok">Your prize: <b class="prize">{profile.p.prize}</b> — 15 % off once, for 30 days, for your account only. Use it at the box office.</p>
{:else if profile.p.stamps.length >= NEED}
  {#if session.user && !session.user.demo}
    <button class="btn primary" onclick={claim}>🎁 Claim the island's prize</button>
  {:else}
    <p class="small">You've seen enough of the island to earn its prize — sign in with a real account to claim it.</p>
  {/if}
{:else}
  <p class="small">Visit {NEED - profile.p.stamps.length} more {NEED - profile.p.stamps.length === 1 ? "place" : "places"} and the island has a prize for you.</p>
{/if}
{#if prizeMsg}<p class="notice">{prizeMsg}</p>{/if}

<h2>What the island knows about you</h2>
<ul class="known">
  <li>Name: {profile.p.name || "—"}</li>
  <li>You: {profile.p.role ?? "—"}</li>
  <li>Music: {profile.p.genres.map((g) => GENRE_BY_ID[g]?.name).join(", ") || "—"}</li>
  <li>Rooms: {profile.p.venues.join(", ") || "—"}</li>
  <li>Gear: {profile.p.gear.join(", ") || "—"}</li>
</ul>
<p class="small muted">Kept in this browser{session.user ? " and copied to your account, so another browser knows it too" : ""}. Nothing else is tracked.</p>
<button class="btn quiet" onclick={() => profile.reset()}>Forget all of it</button>

<style>
  .line {
    width: 100%;
    font-family: ui-monospace, monospace;
    font-size: 12px;
    word-break: break-all;
  }
  .who {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  .who img {
    width: 48px;
    height: 48px;
    border-radius: 50%;
  }
  .who div {
    display: grid;
    flex: 1;
  }
  .badge {
    margin-left: 8px;
    padding: 1px 8px;
    border-radius: 999px;
    background: var(--secondary);
    color: var(--on-secondary);
    font-size: 11px;
    font-weight: 800;
  }
  .lics {
    list-style: none;
    padding: 0;
    display: grid;
    gap: 10px;
  }
  .lics > li {
    display: grid;
    gap: 2px;
    padding: 12px;
    border-radius: 12px;
    background: var(--surface-2);
  }
  .lics li.off {
    opacity: 0.6;
  }
  .stamps {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(92px, 1fr));
    gap: 10px;
  }
  .stamp {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 10px 6px;
    border-radius: 50%;
    aspect-ratio: 1;
    justify-content: center;
    border: 3px dashed var(--line);
    background: transparent;
    cursor: pointer;
    opacity: 0.55;
  }
  .stamp span {
    font-size: 26px;
  }
  .stamp small {
    font-size: 10.5px;
    font-weight: 800;
    text-align: center;
    line-height: 1.1;
  }
  .stamp.has {
    opacity: 1;
    border: 3px solid var(--secondary);
    rotate: -8deg;
    color: var(--secondary);
  }
  .prize {
    font-size: 1.2rem;
    letter-spacing: 0.06em;
  }
  .known {
    padding-left: 18px;
  }
  .link {
    background: none;
    border: 0;
    padding: 0;
    color: var(--primary);
    text-decoration: underline;
    cursor: pointer;
    font: inherit;
  }
  h2 {
    margin-top: 20px;
  }
</style>
