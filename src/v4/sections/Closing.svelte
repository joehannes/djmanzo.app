<!--
  The last screen: the download, for every system, with the truth about
  each, and where to go if you want more than the free edition.
-->
<script lang="ts">
  import { STATUS_LINE } from "../../../shared/facts";
  import { shared } from "../region.svelte";
  import { href } from "../router";
  import { RELEASES, downloadLabel } from "../download";
</script>

<section class="closing" id="download" aria-labelledby="dl-title">
  <div class="img" data-parallax="0.3" style:background-image={`url(${shared("download")})`} aria-hidden="true"></div>
  <div class="shade" aria-hidden="true"></div>
  <div class="wrap inner">
    <p class="eyebrow" data-reveal>Download</p>
    <h2 class="h1" id="dl-title" data-reveal>Your next night<br />starts free.</h2>
    <div class="oses" data-reveal>
      {#each ["mac", "linux", "windows"] as const as os (os)}
        {@const d = downloadLabel(os)}
        <a class="os card" href={RELEASES} data-os={os}>
          <b>{d.label.replace("Download for ", "")}</b>
          <small>{d.note}</small>
        </a>
      {/each}
    </div>
    <div class="ctas" data-reveal>
      <a class="btn primary" href={RELEASES}>All downloads and release notes</a>
      <a class="btn ghost" href={href("pricing")}>Compare editions</a>
    </div>
    <p class="status-line" data-reveal>{STATUS_LINE}</p>
  </div>
</section>

<style>
  .closing {
    position: relative;
    overflow: hidden;
    isolation: isolate;
    padding: clamp(96px, 14vw, 180px) 0;
  }
  .img {
    position: absolute;
    inset: -15% 0;
    z-index: -2;
    background-size: cover;
    background-position: center;
  }
  .shade {
    position: absolute;
    inset: 0;
    z-index: -1;
    background:
      radial-gradient(ellipse at 20% 60%, color-mix(in srgb, var(--bg) 70%, transparent), var(--bg) 85%),
      linear-gradient(180deg, var(--bg), transparent 30%, transparent 70%, var(--bg));
  }
  .oses {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-top: 40px;
    max-width: 880px;
  }
  @media (max-width: 760px) {
    .oses {
      grid-template-columns: 1fr;
    }
  }
  .os {
    display: grid;
    gap: 6px;
    padding: 18px;
    text-decoration: none;
    background: color-mix(in srgb, var(--surface) 75%, transparent);
    backdrop-filter: blur(10px);
    transition: border-color 0.2s;
  }
  .os:hover {
    border-color: var(--accent);
  }
  .os b {
    font: 600 18px/1.2 var(--display);
  }
  .os small {
    color: var(--dim);
    font-size: 13px;
  }
  .ctas {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 24px;
  }
  .status-line {
    margin: 28px 0 0;
    max-width: 44rem;
    color: var(--dim);
    font-size: 13px;
  }
</style>
