<!--
  The footer: everything one click away, the honest status line, and the
  other versions of the site, still there.
-->
<script lang="ts">
  import { STATUS_LINE } from "../../shared/facts";
  import { region, skin } from "./region.svelte";
  import { href } from "./router";
  import { RELEASES } from "./download";
</script>

<footer class="foot">
  <div class="wrap grid">
    <div class="about">
      <p class="brand">djmanzo</p>
      <p class="dim small">{STATUS_LINE}</p>
      <p class="dim small mono look" data-look>Look: {skin().name} · {skin().region}{region.country ? ` · ${region.country}` : ""}</p>
    </div>
    <nav aria-label="Product">
      <h2>Product</h2>
      <a href={href("features")}>Every feature</a>
      <a href={href("pricing")}>Pricing and editions</a>
      <a href={RELEASES}>Download and release notes</a>
      <a href="/api/outboard/packs.json">Pack index for djmanzo</a>
    </nav>
    <nav aria-label="Community">
      <h2>Community</h2>
      <a href={href("market")}>Marketplace</a>
      <a href={href("community")}>Forum</a>
      <a href={href("wishes")}>Feature requests</a>
      <a href="/blog">Journal</a>
    </nav>
    <nav aria-label="Account">
      <h2>Account</h2>
      <a href={href("account")}>Sign in and licences</a>
      <a href="https://github.com/joehannes/djmanzo">Source on GitHub</a>
    </nav>
    <nav aria-label="Legal">
      <h2>Legal</h2>
      <a href="/imprint">Imprint</a>
      <a href="/terms">Terms</a>
      <a href="/privacy">Privacy</a>
      <a href="/rules">Community rules</a>
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
