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
easiest place to set them is **Backstage → 🙋 Sign-in**: each provider's
fields, the exact address to register with it, its console and its steps,
with no deploy; a value set there wins over a Worker secret of the same
name, and a secret is shown back only by its last four characters. The
same names also work as Worker secrets (`npx wrangler secret put …`).
The address to register with every provider is
`https://<site>/callback/<provider>` (today
`https://djmanzo.johannes-neugschwentner.workers.dev/callback/google`, and
so on); Backstage shows each one.

| Provider | Names |
|---|---|
| Google | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| Apple | `APPLE_CLIENT_ID` (the Services ID), `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY` (the whole text of the .p8 file; needs the paid Apple Developer Program) |
| Facebook | `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET` (the App ID and App secret) |
| Instagram | `INSTAGRAM_CLIENT_ID`, `INSTAGRAM_CLIENT_SECRET` (professional accounts only) |
| Microsoft | `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET` |
| X | `X_CLIENT_ID`, `X_CLIENT_SECRET` (OAuth 2.0) |
| TikTok | `TIKTOK_CLIENT_ID` (TikTok's client key), `TIKTOK_CLIENT_SECRET` |
| LinkedIn | `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET` |
| Twitch | `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET` |
| Discord | `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` |
| GitHub | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (github.com → Settings → Developer settings → OAuth Apps) |
| LINE | `LINE_CLIENT_ID` (the Channel ID), `LINE_CLIENT_SECRET` (the Channel secret) |
| Patreon | `PATREON_CLIENT_ID`, `PATREON_CLIENT_SECRET`, `PATREON_CAMPAIGN_ID` |

`TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET` (Cloudflare dashboard → Turnstile)
put a bot check in front of new accounts.

`ADMIN_EMAILS` (comma-separated) and `ADMIN_TOKEN` open the admin pages.

**Backstage, the admin pages**, are at `https://<site>/backstage`
(`/admin` leads there too). The Account page also links there when you
are signed in as crew. There are four ways in:

- **The crew password.** There is no default password. Once you are in,
  set one under *🔒 The crew's password* (at least 10 characters), and
  change it there whenever you like. It is kept only as a salted PBKDF2
  hash. One address gets ten wrong tries per quarter of an hour; right ones do not count.
- **`ADMIN_TOKEN`**, a Worker secret you choose. It works in the same field
  as the password, and it is the way back in if the password is forgotten.
  Set or change it with `npx wrangler secret put ADMIN_TOKEN`, or in
  Cloudflare → Workers → djmanzo → Settings → Variables and Secrets.
  `crew-secret` is only the local test setting in `wrangler.jsonc`'s
  `test` environment, never the live site's.
- **Signing in** with an account whose verified e-mail address is in
  `ADMIN_EMAILS`.
- **Signing in as the owner**: the GitHub account in `ADMIN_GITHUB_IDS`, or
  an account whose e-mail address hashes to one in `ADMIN_EMAIL_HASHES`
  (both in `wrangler.jsonc`).

Anyone else, signed in or not, is turned away from Backstage and from every
`/api/admin/…` call. **Once a crew password is set, the crew's own accounts
are no longer a key on their own**: signed in with one of them, Backstage
asks for the password too, once in each browser, and stays open there for
12 hours. The browser that sets the password has just given it, so it stays
in. The password or `ADMIN_TOKEN` on their own still open Backstage (as an
"Owner" account) for when no crew account is to hand.

## 3. Selling

| What | Secrets |
|---|---|
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`. The webhook endpoint to register in Stripe is `https://<site>/api/webhooks/stripe` |
| PayPal | `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_ENV` (`live` or `sandbox`) |
| Bank transfer | `BANK_TRANSFER_DETAILS` (shown at checkout) |
| Signing licences | `LICENCE_PRIVATE_KEY`: the Ed25519 key whose public half is `DJMANZO_LICENCE_KEY`. Without it the site signs with the development key, which only djmanzo's debug builds believe |
| The imprint | `IMPRINT_NAME`, `IMPRINT_ADDRESS`, `IMPRINT_EMAIL` (required by law before selling in the EU) |
| How many computers at once | `MAX_ACTIVATIONS`, a variable: how many computers one person may have djmanzo activated on at once (3 when unset). They see and remove them on their account page |

### Payments: the setup for an Austrian sole trader with a Wise account

Everything in the table above can also be set in **Backstage → 💳
Payments**, without a deploy. Keys set there are kept encrypted (AES-GCM,
under a key derived from `LICENCE_PRIVATE_KEY`, or `ADMIN_TOKEN` when that
is unset). They win over the Worker secrets of the same name, and the shop
uses them within half a minute. Backstage shows a secret only as its last
four characters. *Check the connections* asks Stripe and PayPal whether
the keys work, whether charges and payouts are on, and where payouts go.

**Recommended: Stripe, paying out to Wise.** One Stripe account takes
cards, Apple Pay and Google Pay in one card form, and also PayPal and EPS
(the Austrian bank-transfer button) once they are switched on. All of it
pays out to your Wise EUR IBAN.

1. Open a Stripe account at stripe.com as an **individual / sole trader
   (Einzelunternehmen) in Austria**, verified with your Austrian passport.
2. Under *Settings → Payouts*, add your **Wise EUR account's IBAN** (Wise
   shows it under the EUR balance). Stripe accepts Wise, but counts it as a
   non-standard account and warns that such payouts fail more often, so
   check that a small first payout arrives.
3. Under *Settings → Payment methods*, turn on **Cards, Apple Pay, Google
   Pay, PayPal and EPS**. PayPal on Stripe is open to EU businesses and asks
   you to connect, or create, a PayPal Business account during onboarding.
   PayPal payments then reach the Stripe balance and pay out to Wise with
   the rest.
4. Under *Developers → API keys*, copy the publishable and secret keys
   into Backstage → 💳 Payments.
5. Under *Developers → Webhooks*, add the endpoint
   `https://<site>/api/webhooks/stripe` for `payment_intent.succeeded`,
   `invoice.paid`, `customer.subscription.deleted` and `charge.refunded`.
   Put its signing secret (`whsec_…`) in Backstage too.
6. In Backstage, press **Register this domain for Apple Pay and Google
   Pay**. Apple Pay shows in the card form only on a domain registered with
   Stripe.
7. Press **Check the connections**, then buy something small with a real
   card and refund it from Stripe's dashboard.

**PayPal on its own** (the PayPal button that is not inside the card form)
is also wired: a PayPal Business account, then an app under
developer.paypal.com → *Apps & Credentials*, whose client id and secret go
in Backstage with mode `live`. Withdraw from PayPal to Wise. You need it
only if you want PayPal's own button as well as the one in Stripe's form.

**Taxes: worth an hour with a Steuerberater.** As an Austrian
*Kleinunternehmer* (under €55,000 a year) you charge no Austrian VAT. Sales
of software to consumers in other EU countries stay under Austrian rules
until they pass €10,000 a year across the EU; past that you charge the
buyer's country's VAT through the EU's One-Stop-Shop (OSS). Consumers
outside the EU can bring their own rules, the United Kingdom's among them.
When this becomes a burden, a *merchant of record* sells in your name and
files every country's tax: **Stripe Managed Payments** (Austria is
eligible, still in preview, about 3.5 % on top of Stripe's fees), or
**Paddle** (about 5 % + $0.50, with cards, Apple Pay, Google Pay and
PayPal in its own checkout). The site's checkout would then hand over to
theirs. That is a change to make when sales justify it, not before.

## 4. Downloads from GitHub

djmanzo's releases are on **joehannes/djmanzo, which is private**, so its
release pages and files open for nobody but its collaborators. The site
therefore lists the newest release itself (`GET /api/download`, the home
page's download screen) and hands out each file at `/download/<file>`; the
in-app updater is pointed there too. One download serves every edition — a
licence unlocks the rest — so a buyer and a Hobbyist get the same file:

| What | Where |
|---|---|
| `GITHUB_RELEASES_TOKEN` | secret: a **fine-grained** personal access token for joehannes/djmanzo only, *Contents: read*, nothing else. The site lists the latest release with it and streams the asset to the visitor, so the token never leaves the Worker; it also reads djmanzo's `contracts/release-notes.json` for the release notes page (`/releases`). Without it GitHub allows 60 unauthenticated requests an hour |

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
