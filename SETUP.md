# What the owner sets up by hand

The site runs without any of this, in its labelled **demo mode**: every
checkout and sign-in screen says so, and a demo purchase unlocks nothing in
djmanzo. Each setting below turns one real thing on. None of them belongs in
this repository; it is public.

Set a **secret** with `npx wrangler secret put NAME` (or in the Cloudflare
dashboard: Workers & Pages → djmanzo → Settings → Variables and Secrets →
*Encrypt*). A plain **variable** goes in the same place unencrypted, or in
`wrangler.jsonc`'s `vars` if it may be public. `keep_vars` is on, so what is
set in the dashboard survives a deploy.

## 1. Deploying

| What | Where it goes | Notes |
|---|---|---|
| Cloudflare API token | your machine (`wrangler login`) or a CI secret `CLOUDFLARE_API_TOKEN` | Permissions: Workers Scripts edit, Workers KV edit, D1 edit, R2 edit, Workers AI read |
| Cloudflare account id | CI secret `CLOUDFLARE_ACCOUNT_ID` | Only for deploying from CI; `wrangler login` needs none |
| Read access to djmanzo for `app/` | a deploy key or token wherever `git submodule update` runs | djmanzo is private. The site **builds without** `app/`; only the tests and `npm run facts:drift` read it |

**From this repository, by itself:** `.github/workflows/deploy.yml` builds and
deploys on every push to `main` (and by hand, Actions → Deploy → Run workflow),
database migrations first. It needs the repository secrets
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`; `APP_READ_TOKEN` (read
access to joehannes/djmanzo) adds the unit tests before deploying.

**If the djmanzo Worker is connected to Git in the Cloudflare dashboard**
(Workers & Pages → djmanzo → Settings → Builds), it still points at
joehannes/djmanzo with `website/` as its root, which no longer exists:
disconnect it, or point it at joehannes/djmanzo.app with the root `/` and
build command `npm run build` — and then leave the workflow's secrets unset,
so the site is deployed one way only.

By hand: `npm run deploy`. Database changes: `npx wrangler d1 migrations apply djmanzo --remote`.

## 2. Signing in

Each provider is offered once its client id is set, and never before. The
callback to register with every provider is
`https://<site>/callback` (today `https://djmanzo.johannes-neugschwentner.workers.dev/callback`).

| Provider | Secrets |
|---|---|
| GitHub | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (github.com → Settings → Developer settings → OAuth Apps) |
| Google | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| Microsoft | `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET` |
| Discord | `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` |
| Facebook | `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET` |
| Apple | `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY` (needs the paid Apple Developer account) |
| Patreon | `PATREON_CLIENT_ID`, `PATREON_CLIENT_SECRET`, `PATREON_CAMPAIGN_ID` |

`TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET` (Cloudflare dashboard → Turnstile)
put a bot check in front of new accounts.

`ADMIN_EMAILS` (comma-separated) and `ADMIN_TOKEN` open the admin pages.

## 3. Selling

| What | Secrets |
|---|---|
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`. The webhook endpoint to register in Stripe is `https://<site>/api/webhooks/stripe` |
| PayPal | `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_ENV` (`live` or `sandbox`) |
| Bank transfer | `BANK_TRANSFER_DETAILS` (shown at checkout) |
| Signing licences | `LICENCE_PRIVATE_KEY`: the Ed25519 key whose public half is `DJMANZO_LICENCE_KEY`. Without it the site signs with the development key, which only djmanzo's debug builds believe |
| The imprint | `IMPRINT_NAME`, `IMPRINT_ADDRESS`, `IMPRINT_EMAIL` (required by law before selling in the EU) |
| How many computers at once | `MAX_ACTIVATIONS`, a variable: how many computers one person may have djmanzo activated on at once (3 when unset). They see and remove them on their account page |

## 4. Downloads from GitHub

djmanzo's releases are on **joehannes/djmanzo, which is private**, so its
release pages and files open for nobody but its collaborators. The site
therefore lists the newest release itself (`GET /api/download`, the home
page's download screen) and hands out each file at `/download/<file>`; the
in-app updater is pointed there too. One download serves every edition — a
licence unlocks the rest — so a buyer and a Hobbyist get the same file:

| What | Where |
|---|---|
| `GITHUB_RELEASES_TOKEN` | secret: a **fine-grained** personal access token for joehannes/djmanzo only, *Contents: read*, nothing else. The site lists the latest release with it and streams the asset to the visitor, so the token never leaves the Worker |

The other way is to publish the installers somewhere public (a public
`djmanzo-releases` repository the release workflow also uploads to, or R2).
Either way GitHub serves release assets from its CDN at no cost; what to
avoid is asking GitHub's API on every page view, which is why the site caches
the release list.

## 5. Supporters

`GITHUB_SPONSORS_LOGIN`, `KOFI_VERIFICATION_TOKEN` (webhook `https://<site>/api/webhooks/kofi`),
`BUYMEACOFFEE_WEBHOOK_SECRET` (webhook `https://<site>/api/webhooks/buymeacoffee`), `SUPPORT_URL`; Patreon as above.

## 6. djmanzo's own repository

The application's release workflow reads these **repository variables**
(joehannes/djmanzo → Settings → Secrets and variables → Actions → Variables):

| Variable | Value |
|---|---|
| `DJMANZO_LICENCE_SERVICE` | the site's address |
| `DJMANZO_LICENCE_KEY` | the `standard` field of `<site>/api/licence/public-key` |
| `DJMANZO_MARKETPLACE` | the site's address (where `release-packs.yml` reads Outboard's packs); optional, it falls back to `DJMANZO_LICENCE_SERVICE` |

## 7. AI

The guide and the blog drafts use Workers AI within its free daily allowance.
`ANTHROPIC_API_KEY` (and optionally `ANTHROPIC_WORKSPACE_ID`, `AI_PROVIDER`)
moves them to Claude; it needs API credit, which a Claude subscription does not
include.
