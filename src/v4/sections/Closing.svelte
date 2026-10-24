<!--
  The last screen: the download, for every system, with the truth about
  each, and where to go if you want more than the free edition. The files
  are the newest release's own (`/api/download`), the visitor's system
  first; one download for every edition, which a licence unlocks.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { STATUS_LINE } from "../../../shared/facts";
  import { shared } from "../region.svelte";
  import { href } from "../router";
  import { SYSTEM_NAME, filesFor, latest, osOf, sizeOf, type Latest } from "../download";
  import { t, tOr } from "../i18n.svelte";
  import DownloadButton from "../DownloadButton.svelte";

  const OSES = ["mac", "linux", "windows"] as const;
  let release = $state<(Latest & { error?: string }) | null>(null);
  let mine = $state<string>("other");
  const order = $derived([...OSES].sort((a, b) => Number(b === mine) - Number(a === mine)));

  onMount(() => {
    mine = osOf(navigator.userAgent);
    void latest().then((r) => (release = r));
  });
</script>

<section class="closing" id="download" aria-labelledby="dl-title">
  <div class="img" data-parallax="0.3" style:background-image={`url(${shared("download")})`} aria-hidden="true"></div>
  <div class="shade" aria-hidden="true"></div>
  <div class="wrap inner">
    <p class="eyebrow" data-reveal>{t("closing.eyebrow")}</p>
    <h2 class="h1" id="dl-title" data-split>{t("closing.t1")}<br />{t("closing.t2")}</h2>
    <p class="lead" data-reveal>
      {t("closing.lead")}
      {#if release?.version}<span class="mono">{t("closing.newest", { v: release.version })}</span>{/if}
    </p>
    <div class="oses" data-reveal>
      {#each order as os (os)}
        {@const files = release ? filesFor(release.files, os) : []}
        <div class="os card" class:mine={os === mine} data-os={os}>
          <b>{SYSTEM_NAME[os]}{#if os === mine}<span class="you">{t("closing.yours")}</span>{/if}</b>
          <small>{t(`note.${os}`)}</small>
          {#if files.length}
            <ul class="files">
              {#each files as f (f.name)}
                <li><a href={f.href} data-file={f.name}>{tOr(`kind.${f.key}`, f.label)} <span class="mono dim">{sizeOf(f.size)}</span></a></li>
              {/each}
            </ul>
          {:else if release?.error}
            <small class="dim" data-download-error>{t("dl.unfetched")}</small>
          {:else if release}
            <small class="dim">{t("closing.next")}</small>
          {/if}
        </div>
      {/each}
    </div>
    <div class="ctas" data-reveal>
      <DownloadButton />
      <a class="btn ghost" href={href("account")}>{t("closing.account")}</a>
      <a class="btn ghost" href={href("pricing")}>{t("closing.compare")}</a>
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
  .os:hover,
  .os.mine {
    border-color: var(--accent);
  }
  .you {
    margin-left: 8px;
    padding: 2px 8px;
    border-radius: 99px;
    background: var(--accent);
    color: var(--bg);
    font: 600 11px/1.4 var(--body, inherit);
    vertical-align: middle;
  }
  .files {
    list-style: none;
    margin: 6px 0 0;
    padding: 0;
    display: grid;
    gap: 4px;
  }
  .files a {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    font-size: 14px;
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
