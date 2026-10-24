# The website: Isla Manzo

djmanzo's website presents the application, sells it, and is where a DJ's
account and licences live. It is one Cloudflare Worker with one KV namespace,
in this repository, and it is live at
**https://djmanzo.johannes-neugschwentner.workers.dev**.

> **The front door is the fourth version, the professional site, at
> `/`** (the owner's word, 20 October: "let it become the front page"). It
> is skinned for the visitor's region; see
> [The professional site](#the-professional-site-version-4-the-site-at-).
> Its pages have real paths (`/pricing`, `/outboard/…`, `/talkback/…`), and
> the Worker renders the marketplace's, the forum's, the blog's and the
> legal pages' words into it for search engines. Its preview address
> `/v4/` redirects to `/`, and an old `#/pricing` becomes `/pricing`.
>
> **The earlier versions stay:**
> - **The Signal Path** (the second, DIRECTIVE §139) is at **`/signal/`**:
>   a painted map of the signal's journey whose stages morph into full-screen
>   scenes. [WEBSITE-ART.md](WEBSITE-ART.md) is how it is drawn. Old links
>   to its stages (`/#/amp`) are sent there, and its sends keep their place
>   in the hash there (`/signal/#/outboard/x`).
> - **The island** (the first), described below, is at **`/island/`**, where
>   the pass, the wishlist, the comparisons and Backstage
>   (`/island/#/backstage`) still live.
>
> The code lives in its own repository, **`joehannes/djmanzo_website`**
> (moved out of djmanzo's `website` branch on 21 October, history kept). The
> application is checked out inside it as a submodule at **`app/`**, pinned
> to a commit of djmanzo's `main`: the tests, `npm run shots`,
> `npm run facts:drift` and `npm run packs` read djmanzo from there and from
> nowhere else. Clone with `--recurse-submodules`, or run
> `git submodule update --init` after cloning.
>
> **The third version, the record shop, is previewed at `/shop/`** (the
> owner's word, 19 October, after rating the second 2 of 5): see
> [The record shop](#the-record-shop-version-3-previewed-at-shop). It is
> `noindex` and linked from nowhere until the owner says it replaces `/`.

## The idea

The site is an island, not a set of pages. It follows the application's own
metaphor ([VISUAL-LANGUAGE.md](../app/docs/VISUAL-LANGUAGE.md)): a watershed. Records wait
in the highlands (the record shop), two rivers meet at the booth the way two
decks meet at the mixer, and the river reaches the sea at the harbour (the box
office). Around the island float islets, one per genre, nearer for the music
the visitor names; past them the sea goes on in every direction, and every so
often a cay holds something worth knowing — a technique, a piece of the
culture, a karaoke host's trick.

Navigation uses a DJ's own controls: eight **hot-cue pads** jump to places
(the number keys too), a **crossfader** sets day or night (or follows the
visitor's clock or system), a **platter** is the minimap, and **Play the set**
is a guided tour in an order that depends on what the visitor said. Every
place opens as a record **sleeve** pulled from a crate. The **setlist** is a
plain list of every place, for anyone who would rather not drag a map, and
for screen readers.

**The MC** asks a few questions — name, DJ or karaoke host, genres, rooms,
gear, experience — and the island changes with each answer: the genre's
colours and display face, the loop the island plays, the islets that sail
closer, the order of the tour and the edition the box office opens on. The
genre knowledge (rooms, clothes, art, dances, how its DJs mix, the theme and
skin djmanzo ships for it) is in `src/lib/genres.ts`.

Everything audible is synthesised in the browser from each genre's pattern;
no recordings are used. Screenshots are of the real application.

## The places

| Place | What it is |
|---|---|
| El Muelle | What djmanzo is, honestly, with the real application on screen |
| La Cabina | A playable two-deck mixer: genre grooves, sync, EQ, crossfader, djmanzo's six effects |
| Tienda de Discos | The library's features as a crate to dig; a Camelot wheel |
| La Tarima | Karaoke: timed words, a guide voice, the voice and key knobs, a queue, emoji from the room |
| El Faro | three.js visuals that answer the music, three presets |
| La Taquilla | The shop |
| El Muro | The wishlist, with each wish's status |
| Radio Manzo | The blog, in many languages |
| La Arena | Comparisons with other DJ and karaoke software, including where they are stronger |
| El Tablero | Use cases: kinds of night, each walked through djmanzo's phases, with the edition it needs |
| La Plaza | Testimonials (moderated, none invented), comments, mixes, videos, sharing |
| Tu Pase | Sign-in, licences, the licence line to paste into djmanzo, passport stamps, the island's prize |
| Backstage | The crew's: overview, promo codes and vouchers, signed vouchers, wishes, moderation, orders, the blog desk, videos |

## Editions and prices

What an edition *is* comes from the application: `shared/editions.json`
is written from `dj_core::edition`, and a Rust test
(`crates/dj-core/tests/website_editions.rs`) fails when the two drift. What
it *costs* is [EDITIONS.md](../app/docs/EDITIONS.md)'s: half of what the professional
competitors charge on average, no edition dearer than the same modules
bought one by one, an upgrade the difference between two editions — and the
Hobbyist edition free, for ever, what every trial ends in.

| | Buy once | Monthly | Yearly |
|---|---|---|---|
| Auto-Pilot | $49 | $2.99 | $29.99 |
| Hobbyist | free, for ever | — | — |
| Apprentice | $69 | $4.49 | $44.99 |
| Karaoke | $55 | $3.49 | $34.99 |
| Pro DJ | $119 | $7.49 | $74.99 |
| Full | $149 | $9.49 | $94.99 |
| Custom | the modules chosen: $10, $15, $25, $39, $49 or $55 each | in proportion | |

Buying once is EDITIONS.md's price. **Monthly and yearly** are the owner's
own ask for the website (DIRECTIVE §134) and follow one rule that waits for
the owner's nod: Pro DJ's month is half the professional subscriptions'
average, every other edition's month in the same proportion to its one-time
price, a year ten months. The box office's board shows every reference with
its source, and tests hold the arithmetic (`test/catalog.test.ts`).
A Custom choice that reaches an edition's price is pointed at the edition.

**A free trial**: seven days of any edition, Full included, once per account
(`POST /api/trial`); a trial is a licence whose plan is `trial`.

**Regional prices** follow the World Bank's income groups: high income at
the list price, upper-middle at 60 %, lower-middle at 40 %, low at 30 %. The
group is *claimed* when the visitor picks a country and *proven* at payment:
the card's issuing country **and** the billing address must both be in it,
and where they disagree the higher price applies (`shared/regions.ts`,
`proven`). When the proof does not back the claim, the checkout says what
price it does back and asks before charging it. An IP address only decides
what the site shows first. **Students and teachers** pay half, recognised by
a verified school address (`.edu`, `.ac.xx`, or a domain in
`STUDENT_DOMAINS`) or marked by the crew in Backstage. The two discounts
**never stack**: the larger one applies.

## Paying

| Way | How the regional price is proven |
|---|---|
| Card (Stripe) | The Payment Element makes a payment method; the Worker reads its `card.country` and billing address, then charges or subscribes. 3-D Secure is handled. Renewals, cancellations and refunds arrive by webhook. |
| PayPal | The order is *authorised*, the payer's country read, and only then captured — or voided. Every plan is a prepaid term that does not renew. |
| Bank transfer | The order waits; the crew marks it paid in Backstage with the sending bank's country. |
| Demo | While no payment provider is configured: the same quote, proof and licence, with the countries typed in, and the licence marked demo. |

Promo codes are percent or fixed, general (any number of uses) or
individual (bound to one e-mail, single use); vouchers grant an edition and
plan outright. Backstage mints them one at a time, by the hundred, or one
per address in a list, and exports CSV. Walking the island (seven places)
earns a signed-in visitor an individual 15 % code.

## Accounts and licences

Sign-in is OAuth through Google, Apple, GitHub, Microsoft, Discord or
Facebook — whichever have keys set — with PKCE wherever the provider takes
it, and one callback address per provider, `/callback/<provider>`, for the
browser and the application alike. Apple's client secret is a short ES256
JWT the Worker signs, and Apple answers by posting a form back. Accounts
link by *verified* e-mail. With none configured the site offers a demo
sign-in, labelled; a demo account's purchases unlock nothing in djmanzo.

**djmanzo signs in here with its own protocol** (`worker/applicence.ts`),
the one `dj_app::licence` speaks and `services/licence` defines — the
owner's choice of one Worker for the shop and the licences (18 October):

1. djmanzo opens `/login/<provider>?state&code_challenge&port` in the DJ's
   browser, listening on that port of `127.0.0.1` (RFC 8252 with PKCE).
2. The DJ signs in with the provider; `/callback/<provider>` finds or makes
   their account here — the same one their purchases were made with — and
   sends the browser back to djmanzo's port with a two-minute, one-time
   grant.
3. djmanzo posts the grant and its verifier to `/licence` (and, if asked,
   starts the 7-day trial) and gets a signed licence line and a renewal
   token; `/renew` fetches a fresh line in the background; `/signout`
   forgets the token.

The line is `djmanzo-licence-1.<payload>.<Ed25519 signature>`: the account
(`github:583231`, never an e-mail address), the edition, Custom's modules, a
trial's end, when to renew — and, for a monthly or yearly plan,
`paid_until`, after which and a fortnight's grace djmanzo treats the plan as
lapsed at its next start. What was bought once carries no date. The tests
sign `services/licence`'s own test vectors byte for byte
(`test/applicence.test.ts`), and `dj_app::licence` reads the same
vectors, so the three cannot drift apart unnoticed. Without
`LICENCE_PRIVATE_KEY` the Worker signs with the development key, which only
a debug build of djmanzo believes.

**A release names this site** through the repository variables the release
workflow reads: `DJMANZO_LICENCE_SERVICE` (the site's address) and
`DJMANZO_LICENCE_KEY` (the `standard` field of `/api/licence/public-key`).
Until a release does, djmanzo refuses nothing; a signed-in visitor can copy
their licence line from the pass (`/api/me/licence-line`) and paste it into
Settings → Licence, which works in a build that carries the key.

## Signed vouchers, `/redeem` and updates (§135)

**A signed voucher** is a gift of an edition, or a discount on it, in one
line the crew makes in Backstage → *Vouchers* and gives away
(`worker/voucher.ts`). The line is the application's
(`dj_app::voucher`): `djmanzo-voucher-1.<payload>.<Ed25519 signature>`,
signed with the licence key, so djmanzo tells a real one from a made-up one
with no network. The payload names the voucher (`MANZO-GIFT-7K3QXW`), the
edition (Custom with its modules), the percentage (100 is a gift: the
edition outright; less is a discount at the box office), when it was made,
optionally the last moment it may be taken (`until`), whom it is for
(`for`: accounts as a licence names them, `github:583231`, and e-mail
addresses; none for anybody) and a note. These are not the promo codes'
vouchers, which still work as before; Backstage keeps both.

- **Making them.** `POST /api/admin/vouchers` signs up to fifty at a time
  and keeps `voucher:<id>` for each: the line, who took it, whether it was
  withdrawn. `GET /api/admin/vouchers` lists them newest first with how
  often each was taken; `POST /api/admin/vouchers/<id>/revoke` withdraws one
  at the shop. A gift for anybody that djmanzo already wears offline stays
  worn: withdrawing reaches only the shop.
- **`/redeem?voucher=<line>`** is what djmanzo opens in the browser
  (`worker/redeem.ts`), a small page of the Worker's own. A line that is not
  a voucher, is withdrawn or past its last day is refused in a sentence. A
  **discount** says what it takes off and goes on to the box office
  (`/island/?voucher=…#/taquilla`), where the quote and every checkout take
  `voucher` (a line typed into the promo box counts too): its percentage is
  off the list price, in place of the regional, student and promo
  discounts — whichever is larger applies, never both. A **gift** asks the
  visitor to sign in, checks it is for them, and on *Take it* records the
  take and issues the edition, bought once, as a purchase is issued, so
  djmanzo's own sign-in fetches a licence that carries it. Once per person;
  a demo or crew sign-in cannot take one. After a sign-in the page returns
  as `/redeem?id=<id>`, since a line is too long to ride along.
- **Whose vouchers are believed.** The shop's own key, and any public key in
  `DJMANZO_GIFT_KEYS` (a variable: raw 32 bytes in base64, comma-separated),
  for a gift signed outside the site. It names the desktop side's gift key,
  so that side's `MANZO-GIFT-LT5VUK` is honoured here as djmanzo honours it;
  a voucher first seen under such a key gets its record then.

**Updates.** `GET /api/update/<target>/<arch>/<current>` answers djmanzo's
updater in Tauri's dynamic format (`worker/update.ts`); `/api/catalog`
gives the address as `updates`, in the updater's own template. It reads the
project's latest GitHub release (never a draft or a pre-release), kept in KV
for ten minutes (`cache:release`, and `cache:updater:<tag>` for its
manifest). Nothing newer: 204. Newer within the same major version, with the
release's `latest.json` naming this platform (`linux-x86_64`,
`darwin-aarch64`, …): 200 with `url` and `signature`, which djmanzo checks
against the key it was built with before installing. Newer but no manifest,
or none for this platform: 200 with the version, notes and release `page`
only, which djmanzo offers as a download. A new major version is always the
download only: buying once covers a major version, so it is never installed
by itself. The release of 19 October (0.47.0) carries no `latest.json` yet,
so today every djmanzo older than it is offered the download.

**Proven here:** `test/voucher.test.ts` and `test/update.test.ts` (40
tests): the desktop side's gift line read with its key, a signed line read
back, a changed byte and a wrong key refused, each rule of what a voucher
may say, whom it is for, Backstage behind the crew's door, `/redeem`
refusing and taking, the licence line djmanzo would then fetch, the
discount never stacking, and the updater's answers. Four mutants fail them:
the signature not checked, a new major offered for installing, a gift not
checked against whom it is for, a voucher's discount added to a promo's.
Backstage's form, the two `/redeem` pages and the box office carrying a
voucher were looked at under `wrangler dev`. **Not proven:** djmanzo itself
reading a line this site signed, and the update endpoint against GitHub
from `wrangler dev` (the container refuses the Worker's own request); its
answers are proven against a stand-in GitHub.

## Operating it

```
cd website
npm ci
npm test                      # the Worker's logic: prices, proof, promos, licences, flows
npx svelte-check
npm run build                 # read "✓ built"
npx wrangler deploy
```

`npx wrangler dev` serves it on `http://127.0.0.1:8787`; point a debug build
of djmanzo at it with `DJMANZO_LICENCE_SERVICE=http://127.0.0.1:8787` (without
`LICENCE_PRIVATE_KEY` it signs with the development key debug builds trust).
A running `wrangler dev` does not see a rebuilt `dist/`: restart it.
`node e2e/shoot.mjs URL out.png` takes a screenshot (set `DJMANZO_CHROMIUM`
where a browser is pre-installed).

**A deploy replaces the Worker's plain variables with `wrangler.jsonc`'s**
unless `keep_vars` is set, as it now is: one deploy dropped the two the owner
had set in the dashboard. A variable that matters belongs in `wrangler.jsonc`;
a secret never does.

### The visitor's own country, inside their region's look (21 October)

The owner asked for the site to be styled per region "and origin of the
navigator ... more deeply and detailed and delightfully". Each region's
skin already wears a pattern, a divider, a symbol, a light and a typeface
from the visual culture around its music (`src/v4/looks.ts`). Under it,
44 countries now have a layer of their own (`shared/flavours.ts`): a
welcome in the country's words, the music its floors move to, and its
national colours, worn as a small flag beside the welcome, a two-pixel rule
under the bar and a faint light from the top of the page. A Dominican
visitor reads *¡Bienvenido! Dominican Republic · merengue, bachata and
dembow*; a Berliner *Willkommen!*; a Nigerian *Welcome · Ẹ káàbọ̀*. A country
not listed sees its region alone. The country is the one the region already
reads; nothing else about the visitor is.

### Supporters: Patreon, GitHub Sponsors, Ko-fi, Buy Me a Coffee (21 October)

The owner: "add the integration of patreon & co properly for each user".
Every person keeps up to six pages of their own on the official platforms
(as many as djmanzo signs into a pack, `dj_app::account::MOST`), shown on
their profile, their packs and beside their name in the forum; djmanzo
handles no money for anyone. A person is marked as **supporting djmanzo**
only when a platform says so (`worker/support.ts`), each named on their
account page:

| Platform | How the site knows | What the owner sets |
|---|---|---|
| Patreon | Connecting Patreon names the campaigns they are an active patron of | `PATREON_CLIENT_ID`, `PATREON_CLIENT_SECRET`, and the variable `PATREON_CAMPAIGN_ID` |
| GitHub Sponsors | Signing in or connecting with GitHub asks GitHub whom they sponsor (and whether they have a Sponsors page of their own, then shown as verified) | the variable `GITHUB_SPONSORS_LOGIN`, djmanzo's account there |
| Ko-fi | Ko-fi's webhook to `/api/webhooks/kofi`, with the token Ko-fi shows (Settings → API) | the secret `KOFI_VERIFICATION_TOKEN`, and that address in Ko-fi |
| Buy Me a Coffee | Its webhook to `/api/webhooks/buymeacoffee`, signed with the webhook's secret | the secret `BUYMEACOFFEE_WEBHOOK_SECRET`, and that address in its webhook settings |

A Ko-fi or Buy Me a Coffee payment is kept only as its payer's email
address against the platform, for a year (a membership for forty days, so
until the next month's payment, and at once no longer when a membership is
cancelled), and marks the account whose address a sign-in provider verified
as that one. `test/support.test.ts` covers each, and a wrong token, a
forged signature, someone else's address and a cancelled membership; four
mutants fail it.

### Secrets

Set with `npx wrangler secret put NAME`. None is committed.

| Secret | What it turns on |
|---|---|
| `ADMIN_TOKEN` | Backstage before any sign-in exists (set) |
| `ADMIN_EMAILS` | Comma-separated addresses whose sign-in opens Backstage (set) |
| `LICENCE_PRIVATE_KEY` | The Ed25519 signing key, PKCS#8 base64 (set). **Keep a copy**: a lost key means a new one, a new `PUBLIC_KEYS` entry in the application, and licences re-signed. It signs vouchers too. |
| `GOOGLE_CLIENT_ID` / `_SECRET` (and `GITHUB_`, `DISCORD_`, `FACEBOOK_`, `MICROSOFT_`) | That sign-in, in the browser and from djmanzo. Redirect URI: `https://<site>/callback/<provider>` |
| `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY` | Sign in with Apple: the Services ID, the team, and the key made for it (the `.p8`). Return URL: `https://<site>/callback/apple` |
| `STUDENT_DOMAINS` | Extra school e-mail domains, comma-separated, whose verified addresses get the student price |
| `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` | Card payments. Webhook: `https://<site>/api/webhooks/stripe` for `invoice.paid`, `customer.subscription.deleted`, `payment_intent.succeeded`, `charge.refunded` |
| `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_ENV` (`live` or `sandbox`) | PayPal |
| `BANK_TRANSFER_DETAILS` | The bank transfer option, with these details shown |
| `AI_PROVIDER` | Who speaks for the guide, screens new accounts' posts and drafts the blog. Unset: **Workers AI**, within the free share below (the owner pays for no AI, 19 October). `claude`: Claude, but only with `ANTHROPIC_API_KEY` set and credits on it (a Claude subscription does not fund the API). `off`: the scripted guide, every new post held for the crew, drafts by hand. |
| `WORKERS_AI_MODEL` | The Workers AI model; unset, the default in `worker/model.ts`, a model on the Workers Free plan with JSON mode, asked not to think first (thinking spent the whole allowance before a word of the answer). |
| `AI_NEURONS_DAILY` | How much of Workers AI's free 10,000 neurons a day this site may spend (default 6,000; the account's other projects share the rest). Each reply is counted as Cloudflare reports it; past the share the guide falls back to its scripted questions, new posts wait for the crew and a draft is refused until the next UTC day. On the Workers Free plan use past 10,000 fails rather than costs; on Workers Paid it would be billed, which the share keeps this site from reaching on its own. Measured on 19 October: a guide turn costs about 72 neurons, so about 80 turns a day. |
| `ANTHROPIC_API_KEY` | Claude, used only with `AI_PROVIDER=claude` |
| `ANTHROPIC_WORKSPACE_ID` | Only for a key made outside any workspace: the workspace (`wrkspc_…`, Console → Settings → Workspaces) each request spends from, sent as `anthropic-workspace-id`. Without it such a key is refused and the guide falls back to its scripted questions. A key made inside a workspace needs none. |
| `GUIDE_MODEL`, `BLOG_MODEL`, `MOD_MODEL` | With Claude: which model each speaks through. Unset, the Worker asks the Models API for the newest model the key can use and remembers it for a day (`worker/model.ts`); a smaller model for the guide costs less per visitor. No model is named in the repository. |
| `GUIDE_DAILY` | Guide turns a day, all visitors together (default 400). Each visitor has 30 an hour. |

`DEMO_MODE` (a var) is `auto`: demo while no payment provider is set. With
the first real provider set, the demo checkout and demo sign-in switch off
by themselves.

### The guide, and what the site may know about a visitor

The Signal Path (`/`) asks before it senses anything, one sense at a
time, with a yes and a no of the same weight, and remembers the answer in
the visitor's browser (`djmanzo.consent`); *Your night*, in the corner of
every screen, shows what is known and has *Forget me*, which removes every
`djmanzo.*` entry the browser holds.

| Endpoint | Asked when | What it does |
|---|---|---|
| `GET /api/where` | The visitor allowed *roughly where you are* | City, region, country, time zone and a point rounded to 0.1° from Cloudflare's edge (`request.cf`). Nothing stored. Under `wrangler dev` the edge is simulated (a stand-in town). |
| `GET /api/weather?lat&lon` | A point is known (the town's, or the browser's own location if the visitor allowed that, rounded to 0.01° in the browser) | MET Norway's forecast for the hour, summed up in a word (`clear` … `thunder`). The point is rounded again on arrival and never stored; the answer is kept in Cloudflare's cache for as long as MET says it holds, so no KV write is spent on it. 30 an hour per address. |
| `GET /api/guide` | The page opens the guide | Whether the guide speaks (a key is set). |
| `POST /api/guide` | The visitor answers the guide | One turn: Claude's reply as `{ say, options, actions }`. |

**The guide** (`worker/guide.ts`) is told what djmanzo does only from
`shared/facts.ts`, the catalogue and the stage script, with the house rules
(planned is never shipped; beta, not yet through a real gig; no personal
questions; a scene's roots are history, never a guess about a visitor). Its
system prompt is the same for every visitor and cached. It *proposes*
actions — `set_style`, `set_role`, `go_to`, `show`, `recommend`,
`start_trial`, `open_checkout`, `ask` — and the Worker drops any that names
no real style, stage, screen, edition, role or permission. The page carries
out only the harmless ones by itself (re-dressing the path, noting what the
visitor does, showing a screenshot); going somewhere, asking for a location
and the box office are buttons the visitor presses. The opening line is the
page's own, so a visitor who leaves at once costs nothing. Without a key,
past a cap (30 turns an hour per visitor, `GUIDE_DAILY` a day for everyone),
past forty turns, or on any failure, the page falls back to the scripted
questions and says why. Each paid turn costs two KV writes (the two caps) —
on the free plan's thousand a day, `GUIDE_DAILY` keeps that in bounds.
Nothing a visitor types is stored by the site.

`/?sky=rain` (or `clear`, `partly`, `cloudy`, `fog`, `snow`,
`thunder`) shows that sky without asking anyone where they are — for
previews and the browser tests.

### Pictures and videos of the application

The site shows djmanzo only as it is: screenshots from
[`screenshots/`](../app/docs/screenshots/) and the owner's own videos (§139).

- **Screenshots.** `npm run shots` (`scripts/shots.mjs`) reads the
  folder and its README, encodes every picture as WebP in the Chromium the
  browser tests use, and writes `public/shots/app/` and `shared/shots.json`
  (screen, theme, skin and the README's caption for each), plus
  `public/shots/share.jpg` from the showcase's hero for the page's share
  tags. It stops at a picture the README does not describe or a skin djmanzo
  does not have. Run it after the folder changes and commit what it writes;
  `test/shots.test.ts` fails while the two disagree. A stage names the
  screens that show it (`src/stages/script.ts`); of those, the one pictured
  in the visitor's theme and skin is shown, else djmanzo's own look (Organic
  Base). The guide's `show` offers only screens that are pictured, each
  described. The island shows the same pictures; the older ones it had are gone.
- **Videos.** Backstage → *Videos*: a YouTube link, a title and, if it shows
  one, a stage of the Signal Path. That stage's reveal offers it beside the
  screenshot (*Watch it*); the player comes from `youtube-nocookie.com`, and
  only once the visitor presses it. Untagged videos stay in the island's
  plaza.
- **R2.** Enabled on the account on 19 October; the bucket `djmanzo-media`
  (binding `MEDIA`) holds Outboard's packs. Uploading the owner's videos and
  loops to it is still to be built; until then the videos are YouTube's, and
  the path plays no loops.

### Outboard and Talkback

The marketplace and the discussion space (§139, ADR-0012), on a D1 database
(`djmanzo`, `migrations/`; `npx wrangler d1 migrations apply djmanzo
--remote` after a new migration). Both are pages beside the stages, at
`/#/outboard` and `/#/talkback`, with the site's own pages (`/#/imprint`,
`/#/terms`, `/#/rules`, `/#/privacy`). The map offers them bottom left,
above the stage meter, where the path never runs. Such a page covers the
painting, so the painting stops drawing frames until the map is back (with
the software renderer the browser tests run on, this halved the full
Playwright run, 8.0 to 4.1 minutes).

- **Who may write.** Reading is open to all. Uploading, posting,
  commenting, voting, rating and reporting need an account a provider vouches
  for (not the demo sign-in) **and the imprint filled in**
  (`IMPRINT_NAME`, `IMPRINT_ADDRESS`, `IMPRINT_EMAIL` as variables; the
  owner's choice: closed until then).
- **Outboard** (`worker/market.ts`). A `.djpack` is checked by
  `worker/djpack.ts`, a port of djmanzo's own checker held to its verdicts
  word for word (`test/fixtures/packs/`, written by `dj_app::packs`'s tests;
  one rule is stricter: every tile handed out must only draw). It waits for
  the crew (Backstage → Outboard), who list it or say why not; the maker is
  told. A name stays with the key it was first uploaded under. Listed packs
  are published at `/api/outboard/packs.json` in djmanzo's index format.
  One rating an account, sorted by a mean drawn towards 3.5 while there are
  fewer than ten. A maker's page links only to official donation platforms
  (`shared/outboard.ts`); djmanzo handles no money. Packs are kept in R2
  (binding `MEDIA`, bucket `djmanzo-media`); without the binding the upload
  says so and the rest works.
- **Talkback** (`worker/talkback.ts`, `shared/talkback.ts`). Communities on
  the craft, the music, the gear, gigs and life, and djmanzo; posts in a
  small safe Markdown (`shared/markdown.ts`, everything typed is escaped),
  comments six deep, one vote an account, hot / new / top, full-text search.
  A new account (its first three days, or until a post of its has been
  read) posts three times a day without links; its posts are read first by
  a model's screen (Workers AI within the free share, or Claude with
  `AI_PROVIDER=claude`; `MOD_DAILY`, default 200 a day) or, when it
  hesitates or is not to be had, held for the crew. Turnstile is checked once
  `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET` are set. The crew can carry a
  proposal to the wishlist.
- **Moderation** (`worker/moderation.ts`). *Report* on everything; three
  reports hold a post or comment for the crew; the crew keeps or removes,
  and a removal always carries a statement of reasons the author is told
  (DSA Art. 16–17), who may reply as an appeal. Backstage → Talkback holds
  the queue.
- **Tests.** The Worker's SQL runs on Node's own SQLite (`test/d1.ts`); the
  browser tests use `wrangler dev --env test` (stand-in R2, an imprint and a
  crew token, placeholder ids that reach nothing real) with accounts seeded
  into its local storage (`e2e/seed.ts`).

### Found by search engines and link previews

The Signal Path is painted in the browser, so on its own a crawler or a chat
app's link preview would see one page with almost no words. `worker/seo.ts`
renders every page that has an address of its own into the same
`index.html`, between its `<!--seo-->` markers and in a `<main id="static">`:
its title, description, canonical address, Open Graph and Twitter tags,
structured data (JSON-LD), and its real words and links.

- **The addresses.** `/` (the map: every stage's reveal and the status
  line; `SoftwareApplication` with only the free Hobbyist edition as an
  offer, since nothing paid can be bought yet), `/outboard`, `/outboard/<id>`
  (`CreativeWork` with its rating), `/outboard/maker/<uid>` (`ProfilePage`),
  `/talkback`, `/talkback/c/<community>`, `/talkback/<id>`
  (`DiscussionForumPosting` with its comments), `/imprint`, `/terms`,
  `/rules`, `/privacy`, and `/blog`, `/blog/<slug>` (`BlogPosting`; another
  language is `?lang=de`, each named to the others with `hreflang`). All are
  in `run_worker_first`.
- **In the browser** a head script hides the rendered words and the app
  opens the same place (`src/v4/main.ts`; the Signal Path did the same over
  its painting until 20 October). Outboard,
  Talkback and the site's own pages now keep their paths in the address bar
  (an older `#/outboard` link is rewritten to `/outboard`); a link to one
  opens it without loading the page again, and the back button works. The
  stages keep their `#/groove` addresses. A blog post is not a place on the
  Signal Path, so it stays a page to read and the painting is not loaded.
- **Only what anyone may read.** The render is a visitor nobody knows: a
  pending item or a held post answers 404, a removed post 410, both with
  `noindex`. `/sitemap.xml` lists the pages above, every listed item and its
  maker, the newest thousand live posts, the communities and every published
  post in each of its languages; `/robots.txt` keeps crawlers out of `/api/`
  and the sign-in routes.
- **The words are the app's own.** The legal pages' text lives in
  `shared/legal.ts`, read by both the Worker and the Signal Path; the map's
  is `src/stages/script.ts`'s.
- **When the database fails** the page still opens, without its rendered
  words (the error is logged).
- **Tests.** `test/seo.test.ts` reads each page as a crawler would (status,
  head, parsed JSON-LD, words), including a post whose body tries to close
  the structured data's `<script>`; four mutants (unescaped JSON, a held
  post in the sitemap, a removed post served, the head added rather than
  replaced) were each caught. In the browser, `e2e/boards.spec.ts` opens an
  item and a post by their paths, follows links without a reload (caught
  when the links were let reload), and reads a blog post without the
  painting.

### What KV holds

The key layout is documented at the top of `worker/store.ts`. KV is
eventually consistent: listings can lag a write by up to a minute (a new
wish may take that long to appear on the wall), and a promo code's use count
can run one over its limit across two places in the same second. Both were
accepted rather than paid for with a Durable Object.

## The professional site (version 4, the site at `/`)

The owner asked for a site that looks like what it sells — professional,
stylish, fit for DJs, not comic — built on what the competitors' sites do
well, improved and augmented: an audiovisual, interactive experience with
beautiful photographs, GSAP motion, parallax and WebGL waveforms; a decent
shop, a marketplace and forums; an assistant and a user journey; and a look
adapted to where the visitor is, because European EDM does not look like a
Latin American merengue.

**What the competitors taught.** A research pass over VirtualDJ, Serato,
rekordbox, Traktor, djay, Mixxx and Engine DJ (20 October) ranked what to
take: Download and the price one click from everywhere; a monthly/yearly
toggle that shows the saving; a plans × features matrix, grouped; a free
tier labelled honestly; the real interface on screen; hardware searchable,
with honest support badges; release notes; marketplace cards with author,
rating and downloads; a topic FAQ; a feature-request board. And what to
beat: hidden or USD-only prices, carousels that hide content, a pricing page
that contradicts itself, Linux ignored (only Mixxx has it), and everyone's
brand blue.

**The skins.** Six looks, each a palette, its photographs, the grooves its
deck plays first, its waveform colours, and which of djmanzo's own themes
its screenshots are shown in (`src/v4/skins.ts`): *Club* (Europe: techno,
house, drum & bass), *Tropical* (Latin America and the Caribbean: merengue,
bachata, reggaeton, salsa, cumbia, dembow), *Urban* (North America),
*Afro* (Africa), *Neon* (East and Southeast Asia) and *Studio* (everywhere
else, amber — not blue). The country comes from the edge's reading, as the
prices already do; nothing else about the person is read. A country hears its
own music first within its skin (a Dominican visitor: merengue; a Londoner:
drum & bass). The visitor can change the look at any time (top right), and
the choice is kept in their browser; "Follow my location again" forgets it.
An address can force either, for previews and screenshots: `/?country=DO`,
`/?skin=neon`.

**The site at `/` (20 October).** It took over `index.html`, so the Worker's
renders for search engines (`worker/seo.ts`) now write into it:
- the home page's words are the facts that ship, nothing planned;
- `/outboard/…` and `/talkback/…` open the marketplace and forum in place;
- `/blog/…`, `/imprint`, `/terms`, `/rules` and `/privacy` are shown inside
  the site's frame (`pages/Read.svelte`).

Links between its own pages change the address without loading the page
again, and the back button works. The Signal Path moved to `/signal/`
(`signal/index.html`, `noindex`); the Worker's old `/signal` redirect is
gone, and `/v4/` redirects to `/` instead. The preview's pictures stay at
`/v4/art/`.

The board tests (`e2e/boards.spec.ts`) cover the marketplace and forum on
the new front page: upload, crew review, download of exactly what was
signed, rating, posts, votes, comments, reports, the blog and a phone. The
map's own tests run at `/signal/`. Three mutants were caught:
- no `/v4` redirect;
- old stage links not forwarded;
- the Worker's words not shown in the frame.

**The pages.**

- *Home*, in the order DJ software sites have taught people to read one:
  - the hero: the region's photograph drifting in parallax and leaning with
    the pointer, the promise, Download for the visitor's own system, and a
    deck;
  - proof (platforms, the free tier, openness, beta);
  - stems you can switch;
  - a tour of the real application in tabs, in the visitor's theme;
  - the assistant, karaoke, visuals and learning, each a photograph with the
    facts and their caveats;
  - a hardware search;
  - the marketplace's newest packs and the forum's busiest threads;
  - what is new (GitHub's releases);
  - a grouped FAQ;
  - the download, for each system with the truth about it.
- *Pricing*:
  - buy once / monthly / yearly, with the saving shown;
  - prices for the visitor's country and band, in their currency;
  - a "which one is yours?" finder;
  - the edition cards;
  - the plans × modules matrix;
  - the checkout, which reuses the shop's own (`src/shop/Checkout.svelte`,
    `SignIn.svelte`), with the live quote, promo codes, the trial and
    vouchers;
  - what the others charge, each price linked to its source.
- *Marketplace* and *Community*: Outboard and Talkback themselves, every
  function kept, in this look. Their own path links (`/outboard/…`,
  `/talkback/…`) stay on this page.
- *The assistant*, from every page:
  - it is the site's guide (`/api/guide`, Workers AI);
  - its proposals are buttons, and when it hears what the visitor plays the
    site changes its look;
  - with the AI off or spent, it says so and answers the common questions
    from a script.

**The waveforms.** The decks play patterns (the island's synthesiser), so
every hit is known before it sounds. The waveforms are computed from the
music's own events (`src/v4/wave/model.ts`), so they can show what is
coming ahead of the playhead, as djmanzo's own do. They are drawn by one
fragment shader (`wave/gl.ts`): three bands overlaid for the hero's deck,
four lanes for the stems. A 2D canvas draws them where WebGL 2 is missing.
They draw only while on screen, and hold still for a visitor who asked for
less motion.

**The pictures.** 26 photographs generated for the site with FLUX.2
[klein] 4B on Workers AI (1.4 MB as WebP), three per skin and eight
shared. None shows text, a logo or a real person. FLUX.2 [dev] and Leonardo's
Lucid Origin were priced and set aside: at 2,000–4,000 neurons an image they
would have spent the account's free day in four pictures; klein costs about
150. Pollinations' free FLUX was tried and was clearly worse.

**Every claim is a fact.** Feature text comes from `shared/facts.ts` with
its status and caveat (`FactList.svelte`); the hardware list is held to the
facts by a test; the Download notes match the releases (Apple silicon and
Intel, a karaoke build back to 10.13, Windows built but not yet run by a
person).

**Found while building it:** `regional()` turned a free edition's 0 into 49
cents in any discounted band (a readable .49 price made out of nothing). It
was latent: the Worker's quote refuses the Hobbyist edition outright ("free,
for ever"), and the island's box office never priced it, so no visitor saw or
paid it. The first page to ask `regional()` about the Hobbyist edition was
this one's own bar ("editions from $0.49" for the Dominican Republic). An
earlier commit message said the Worker would have quoted it; that was wrong.
`shared/regions.ts` now keeps free free, and a test covers every band.

**Found in production, and fixed:** asked "I play bachata at weddings,
which edition?", the live assistant (free Workers AI) switched the site to
the Tropical look, correctly, and then recommended "the Wedding edition",
which does not exist. The guide's reply cleaning (`worker/guide.ts`,
`withoutInventedEditions`) now drops any sentence that names an edition
djmanzo does not have, for every page that uses the guide. It is tested, and
the mutant is caught.

**Also fixed in the record shop**, found when its tests ran beside these
under load:
- *The needle can take far longer than meant to land.* The record's turn was
  a GSAP tween, and GSAP's lag smoothing stretches a tween when frames are
  slow. On a software renderer, or a weak device, that made the 1.3-second
  turn take much longer. Moves are now timed by the clock: choppier on a slow
  device, but on time, and they land even with nothing drawn.
- *A link to a room from inside the shop (`/shop/#cafe`) went nowhere.* It
  changed only the hash, and the shop did not listen for that; now it does.
  Without the fix the aisle test fails three runs in four under load: it
  catches it by timing, not every time.

**Proven here:**
- `test/v4.test.ts` (18): skins by country and by what the guide hears;
  contrast at WCAG AA on every skin; kicks where they fall and a stem that
  is off staying silent; addresses; screenshots by theme; hardware against
  the facts.
- `e2e/v4.spec.ts` (11 journeys): the look by country and by choice, kept
  and forgotten; waveforms that follow the look; the deck and its stems; the
  tour and the hardware search; the shop from the finder to a started trial;
  forum links kept on the page; the assistant's scripted answer leading to
  the shop; a phone with nothing sideways; nothing left hidden with less
  motion; older addresses landing; a page of words in the site's frame,
  with the site's own links followed in place.
- Four mutants fail them. Screenshots of every page in three skins and on a
  phone were looked at.

**Not proven:**
- that the music sounds right (no audio device here);
- frame rates on real GPUs and phones (only a software renderer was seen);
- the assistant speaking through the AI in this site (the test site has it
  off).

## Outboard and Talkback on the day they open (21 October)

The owner: "work on the marketplace and forum ... it should be usable at
once ... add default answers to default questions in the forums, default packs
to the marketplace ... mnemonic shortcut packs for different usages ... make
it so those cannot only substitute but complement existing mnemonics".

**Keyboard sets are a kind Outboard lists.** djmanzo's `main` installs
`keys` packs (§133, §137); the site now checks them as djmanzo does
(`worker/keyset.ts`): `keysets::check`'s rules word for word, from lists
djmanzo itself exports (`shared/keyrules.json`, written by
`tools/packsmith rules` from `app/`): the panels, boards, interface verbs,
guides, the action vocabulary, the first words of every mixer action djmanzo
writes, the deck verbs it uses that its vocabulary does not describe
(`sync_toggle`, its argument found by asking the parser), and djmanzo's whole
tree under Space. Where the site cannot run djmanzo's parsers it is stricter,
never looser: an action is held to its verb and the shape of its argument and
parsed whole again when djmanzo installs it; a `uiop` key and a keyboard map
are not taken here. One rule is the site's own: **a set in Outboard adds keys
and takes none of djmanzo's over** (djmanzo would let a set's key win on one
of its own letters). A pack's signed support links (§137: Patreon, Ko-fi, Buy
Me a Coffee, GitHub Sponsors, PayPal, Liberapay) are checked as djmanzo's
installer checks them and shown on its page. Kinds djmanzo installs that the
site cannot check yet (techniques, mappings, knowledge, lessons) are refused
by name rather than as unknown. Migration `0002` lets the table hold every
kind.

**Held to djmanzo by fixtures it writes.** `tools/packsmith fixtures`
makes 28 keys packs, one for each way of being refused, and records
djmanzo's own verdict on each (`test/fixtures/keys/`); `test/keyset.test.ts`
asks the site for the same verdict word for word, with one listed exception
(the takeover rule). Five mutants of the checker fail it.

**The crew's seven sets.** `packs/keys/` holds their sources;
`npm run packs` makes them with djmanzo's own `packs::make_keys`, checks each
again with `packs::check` and with the takeover rule, and writes them, signed
with the crew's key (`PACKSMITH_KEY`, a secret, never committed; public key
`P8Mn9E8HYxPALWdn+taLeHqDMsdZCGU48G22Qbrbs0M=`, fingerprint
`7884 d9c2 6ea7 f5c0`), to `public/packs/crew/` with an `index.json`. The
output is byte for byte the same each time it is made. Each set complements
rather than replaces, within djmanzo's rule that one set is worn at a time:
one that grows out of a set djmanzo ships carries all of that set's keys, and
each adds keys inside djmanzo's own groups where a letter is free:

| Set | On | Grows out of | Adds to djmanzo's groups |
|---|---|---|---|
| Karaoke host: the whole night | `k` | Karaoke host | `s g`, `s r`: the guide vocal under Stems |
| Noche latina | `n` | — | `d t`: tap the grid under Deck |
| Underground: long blends | `u` | — | `m l`, `m L`: the limiter under Mixer |
| Cuts and scratch | `c` | Scratch | — |
| Weddings and parties | `q` | — | — |
| Lights and screens | `i` | — | — |
| Practice drills | `l` | Learning | — |

**They list themselves** (`worker/seed.ts`): the first time Outboard is read
after a deploy whose `index.json` it has not seen, each pack is fetched from
the site's own static files, checked as an upload is, kept in R2 and listed
under the crew's account with no review. A pack already listed is left as it
is; one whose name a maker took first is left out and logged; a file that is
not the one the index names is left out. Wearing more than one set at once
would let a marketplace set sit beside one djmanzo ships instead of carrying
it: that is djmanzo's to do (`commands.rs` keeps one worn set).

**Talkback's first threads** (`shared/talkback-seed.ts`): 28 questions DJs
and karaoke hosts ask, each with the crew's answer, told as
`shared/facts.ts` tells djmanzo, caveats included, and the craft said plainly:
a welcome, which edition, installing on Linux, an old Mac, the Space keys,
importing a library, controllers, Spotify, installing a pack, the whole
karaoke night (guide vocal, lyrics, the guest's song and WhatsApp, music
between singers, phones), the long blend, sync or by ear, Camelot, bachata
into merengue, timecode, a beginners' thread, gain and the limiter, ears,
latency on Linux, lights, a wedding. They are written when Talkback is read
and their words have changed; a thread keeps its votes and replies.

**As the forums DJs use already work** (r/DJs, Discourse): a community's
pinned threads come first; the asker (or the crew) marks the reply that
answered it, which then comes first under the question and marks it
*Answered* in every list (`POST /api/talkback/posts/:id/answer`, migration
`0003`); and while a title is typed, threads that may already answer it are
offered. `test/seed.test.ts` covers the packs listed once, byte for byte
through djmanzo's index, a taken name and a changed file left out, the
threads answered and pinned first, found by search, kept through a rewrite,
and an answer marked only by whoever asked or the crew; six mutants fail it.

**Every pack on GitHub too.** djmanzo's `.github/workflows/release-packs.yml`
(on `main`) attaches every pack Outboard lists to each release, once a day to
the newest, and by hand to any tag, with `outboard-packs.json`, an index in
djmanzo's format naming them there; and it writes the same packs into
`community/packs.json`, the index djmanzo's Marketplace panel reads before a
DJ adds any, so the panel offers them with nothing set up. R2 stays the
site's store; GitHub's releases are the copy that outlives it.

## The record shop (version 3, previewed at `/shop/`)

The owner asked for something playful, interactive and meaningful — real
music, its theory, its places and people — with no wasted space, no
overlays and no extra steps. Five concepts were drawn up
(`v3-concepts/CONCEPTS.md`); the owner chose the mix recommended
there, with one change: the atlas became **a flat earth under a glass dome,
laid out as Gleason's 1892 map, that is also a record**.

**One shop, walked sideways.** Nine rooms side by side, each with one thing
to do. Scrolling is the browser's own, snapping to rooms (a swipe, a
trackpad, the arrow keys); nothing hijacks it. The navigation is a crate of
dividers along the bottom, the current one standing up; the address follows
the room (`/shop/#world`), so any room can be linked. A plain bar along the
top always leads to the ordinary pages: download, editions, the market, the
forum, the wishlist and sign-in. Don Ramón, who keeps the shop, says one line
per room and then lets the visitor be. *Hush* stops whatever plays.

| Room | What a visitor does there |
|---|---|
| Counter | Answers one question (DJ software, karaoke, just looking), remembered for the next visit; wakes the band on the counter one player at a time — drums, percussion, bass, chords and a sung tune — which is what stems are, in five grooves. |
| Crates | Pulls a sleeve from all seventeen genres: its back cover gives where it was born, its tempo, how it is danced and how it is mixed; it plays, and *Find it on the world* walks to the back room and puts the needle on its birthplace. |
| The World | A record-earth on a pedestal under a bell jar: the coastlines on Gleason's layout (the North Pole at the label, Antarctica as the ice at the rim, the parallels as grooves), a pin where each genre was born, a small sun hung over the place where it is noon right now, lighting the day side. Drag the record to turn it, drag the tonearm onto a place, tap a pin, or press a place in the list (keyboard, screen reader, or no WebGL): the record turns the place under the needle, which comes down and plays it. |
| Practice | The Camelot wheel: a bachata on deck A in 8A, a dembow on deck B turned round the wheel — neighbours blend, strangers clash, and the wheel says why. Beside it, two techno records apart in tempo and in step: match them with the pitch fader and a nudge, by ear; a meter confirms it after two seconds together. |
| Makers | The newest packs from Outboard, free, with what may go on the shelf and what is coming. |
| Café | Talkback's busiest threads as tables, and its topics on the board. |
| Wishes | The wishlist as slips on a cork board, the built ones stamped. |
| Window | Every way to pay less, and none a countdown: Hobbyist free, the trial, the regional price for where the visitor is, half for students and teachers, upgrades at the difference, discounts never stacked. |
| Till | The download, and each edition's price for where the visitor is, by plan; trying and buying go to the box office (`/island/#/taquilla`). |

**How it is built.** `shop/index.html` and `src/shop/`, a third Vite page
beside the Signal Path and the island, reusing what they already have: the
island's synthesiser (`lib/audio/engine.ts`, which gained parts that can be
switched off one by one, a pitch fader and a per-deck key shift), its
genres, the catalogue and price code, Outboard's previews and the sun's
formulas. `sound.svelte.ts` makes the shop one record player: whichever room
plays something takes it over. The record-earth (`src/shop/world/`) is
three.js, loaded only when the back room is reached and only if the browser
draws WebGL; it draws only while that room is on screen and something moves,
and drops to fewer pixels and no idle spin if frames come slow. The
paintings in `public/shop/art/` were generated with FLUX.2 [klein]. Licences
are in [RESEARCH.md](../app/docs/RESEARCH.md#the-website-website).

**Proven here:** the arithmetic in `test/shop-world.test.ts` and
`test/shop-practice.test.ts` — Gleason's layout, every place reachable by the
arm and brought exactly under the needle from any turn, the painted
coastline meeting the pins (a mutant without the projection's pole centre
fails it; that was a real defect, found by looking at the painted record),
the Camelot numbers, the beat offset. In a browser (`e2e/shop.spec.ts`, six
journeys): the question and the band, a sleeve that finds its place, the
needle down and lifted, the wheel and the pitch fader, the aisle by
divider, arrow key and address, and every room on a phone without sideways
scrolling; two mutants (the world not listening for a place; the needle
reading the record at the wrong turn) fail them. Screenshots of every room
on desktop and phone were looked at.

**Not proven:** that any of it *sounds* right — this container has no audio
device; the tests check only that what should play is told to and what
should stop does. The record-earth was seen only through a software
renderer, slowly; its frame rate on a real GPU and a phone is unmeasured.

## What has been proven, and what has not

**Proven here:** the Worker's logic (37 tests, the regional rule mutated
twice), the island in a browser (four Playwright journeys, one mutated), the
demo checkout end to end in production — including a refused regional claim
(a US card with a Dominican address) — and **the whole link from a running
djmanzo to the live site**: the application asked for a code, the code was
approved as a buyer, djmanzo fetched the licence, activated it, verified the
production signature offline and showed it; signing out freed the seat on
the site. The test accounts were deleted from production afterwards. (That
was this branch's first sign-in, `dj_app::account`, since folded into
`dj_app::licence`; djmanzo signing in through the protocol the site serves
now is proven against the Worker in tests, not yet from a running djmanzo
against the live site, because no build names it yet.)

**Not proven:** any real payment or real provider sign-in — no keys exist
yet. Blog drafting could not be tried in production: the Cloudflare
account's Workers AI daily allocation was already spent by its other Workers,
and no `ANTHROPIC_API_KEY` is set. The desk reports that failure in words, as
it should.

**The Signal Path's guide has not spoken through Claude** — there is no key
here. What is proven: the Worker's half against a stand-in model (actions
that name nothing real dropped, the caps per visitor and per day, the
fallbacks, the prompt carrying every fact at its status — four mutants fail
those tests), and the page's half in a browser with the guide's answers
played from the page's side (the path re-dressed at once, offers as
buttons, the scripted questions taking over when capped). How Claude
actually talks, and what a turn costs, will be known only once the key is
set. The weather is real: `wrangler dev` asked MET Norway for Linz and got
its answer.

## Activations: a licence on up to three computers (24 October)

The owner's rule: a licence belongs to the person, not to a provider — any
sign-in linked to the same verified e-mail address reaches it — and is
activated on up to `MAX_ACTIVATIONS` computers at once (three unless set).

- `POST /licence` takes `device: {id, name, os}` from djmanzo: a random id
  it keeps beside its licence (never a hardware fingerprint), the
  computer's name and its system. The same id signing in again keeps its
  place, and its old renewal token stops working; a new computer past the
  limit is refused with 409 and a sentence pointing at the account page.
  A djmanzo too old to send a device counts as a new computer each time.
- The account page lists the person's computers (`GET
  /api/me/activations`), each with *Remove* (`DELETE
  /api/me/activations/:id`). Removing one forgets its renewal token, so
  that djmanzo's next `POST /renew` is answered 401 with `revoked: true`,
  and it forgets its licence: the Hobbyist edition from its next start,
  never mid-set. Offline, an activated djmanzo keeps working as before.
- `POST /signout` frees the computer's place too.
- A renewal token from before activations becomes an activation of its own
  at its next renewal, whatever the limit, so nobody signed in is locked out.

Code: `worker/activations.ts`; tests: the two activation cases in
`test/flow.test.ts` (mutation-tested: lifting the limit fails the first;
so does keeping a removed computer's token and skipping the activation
check together).
