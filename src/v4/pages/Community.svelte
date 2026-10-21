<!--
  The forum: Talkback, the working one — communities, threads, votes,
  replies, reports, the crew's decisions — in this site's look, beside the
  feature requests.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import Talkback from "../../signal/aux/Talkback.svelte";
  import { animate } from "../motion";
  import { shared } from "../region.svelte";

  let { rest }: { rest: string[] } = $props();
  let root: HTMLElement;
  onMount(() => animate(root));
</script>

<div bind:this={root} data-aux="talkback">
  <header class="head">
    <div class="bg" aria-hidden="true" style:background-image={`url(${shared("community")})`}></div>
    <div class="wrap">
      <p class="eyebrow">Community</p>
      <h1 class="h1">Ask the question<br />everyone at the gig was thinking.</h1>
      <p class="lead">The craft, the music, the gear, the life around the gigs, and djmanzo itself. Good, related subjects only — kind words, real help, nobody's music but your own.</p>
      <p class="side" data-reveal>Want djmanzo to do something it doesn't? <a href="/wishes">Feature requests</a> are voted on, and the board says what became of each.</p>
    </div>
  </header>
  <div class="wrap content body" data-forum>
    <Talkback {rest} />
  </div>
</div>

<style>
  .head {
    position: relative;
    padding: calc(var(--bar) + 72px) 0 40px;
    overflow: hidden;
    isolation: isolate;
  }
  .bg {
    position: absolute;
    inset: 0;
    z-index: -1;
    background-size: cover;
    background-position: center 30%;
    opacity: 0.38;
    mask-image: linear-gradient(180deg, black 20%, transparent 95%);
  }
  .side {
    margin: 22px 0 0;
    color: var(--dim);
  }
  .side a {
    color: var(--accent);
  }
  .body {
    padding-bottom: 96px;
  }
</style>
