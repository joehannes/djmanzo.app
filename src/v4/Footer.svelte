<!--
  The footer: everything one click away, the honest status line, and the
  other versions of the site, still there.
-->
<script lang="ts">
  import { STATUS_LINE } from "../../shared/facts";
  import { region, skin } from "./region.svelte";
  import { href } from "./router";
  import { RELEASES } from "./download";
  import { t } from "./i18n.svelte";
</script>

<footer class="foot">
  <div class="wrap grid">
    <div class="about">
      <p class="brand">djmanzo</p>
      <p class="dim small">{STATUS_LINE}</p>
      <p class="dim small mono look" data-look>{t("foot.look")}: {skin().name} · {skin().region}{region.country ? ` · ${region.country}` : ""}</p>
    </div>
    <nav aria-label={t("foot.product")}>
      <h2>{t("foot.product")}</h2>
      <a href={href("features")}>{t("foot.features")}</a>
      <a href={href("pricing")}>{t("foot.pricing")}</a>
      <a href={RELEASES}>{t("foot.download")}</a>
      <a href="/api/outboard/packs.json">{t("foot.packs")}</a>
    </nav>
    <nav aria-label={t("foot.community")}>
      <h2>{t("foot.community")}</h2>
      <a href={href("market")}>{t("foot.market")}</a>
      <a href={href("community")}>{t("foot.forum")}</a>
      <a href={href("wishes")}>{t("foot.wishes")}</a>
      <a href="/blog">{t("foot.journal")}</a>
    </nav>
    <nav aria-label={t("foot.account")}>
      <h2>{t("foot.account")}</h2>
      <a href={href("account")}>{t("foot.signin")}</a>
      <!-- The app's own source is private; the website's is open. -->
      <a href="https://github.com/joehannes/djmanzo.app">{t("foot.source")}</a>
    </nav>
    <nav aria-label={t("foot.legal")}>
      <h2>{t("foot.legal")}</h2>
      <a href="/imprint">{t("foot.imprint")}</a>
      <a href="/terms">{t("foot.terms")}</a>
      <a href="/privacy">{t("foot.privacy")}</a>
      <a href="/rules">{t("foot.rules")}</a>
    </nav>
  </div>
</footer>

<style>
  .foot {
    border-top: 1px solid var(--line);
    padding: 64px 0 48px;
    background: color-mix(in srgb, var(--surface) 60%, var(--bg));
  }
  .grid {
    display: grid;
    grid-template-columns: 1.6fr repeat(5, 1fr);
    gap: 32px;
  }
  @media (max-width: 980px) {
    .grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .about {
      grid-column: 1 / -1;
    }
  }
  .brand {
    font: 700 22px/1 var(--display);
    letter-spacing: -0.03em;
    margin: 0 0 12px;
  }
  .small {
    font-size: 13px;
    max-width: 30rem;
    margin: 0 0 10px;
  }
  .look {
    font-size: 11px;
  }
  h2 {
    font: 500 11px/1 var(--mono);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--dim);
    margin: 4px 0 14px;
  }
  nav {
    display: grid;
    gap: 9px;
    align-content: start;
  }
  nav a {
    color: color-mix(in srgb, var(--text) 85%, transparent);
    text-decoration: none;
    font-size: 14px;
  }
  nav a:hover {
    color: var(--accent);
  }
</style>
