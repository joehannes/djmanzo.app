# djmanzo's website

The website of [djmanzo](https://github.com/joehannes/djmanzo), the DJ and
karaoke application: the site that presents it, sells it, keeps a DJ's
account and licences, serves the application's licence protocol, and runs
its marketplace (Outboard) and forum (Talkback). One Cloudflare Worker with
KV, D1 and R2, live at https://djmanzo.johannes-neugschwentner.workers.dev.

**Read [`docs/WEBSITE.md`](docs/WEBSITE.md) first.** It is the whole story:
what each page is for, what the owner asked for, what has been proven and
what has not.

## Getting it

```
git clone --recurse-submodules https://github.com/joehannes/djmanzo.app.git
```

`app/` is djmanzo itself, a submodule pinned to a commit of its `main`. The
website reads the application only from there: its screenshots, its themes
and skins, its licence service's test vectors, the documents the site's
facts are checked against, and (for `npm run packs`) its pack format.
Moving the pin is a decision: `git -C app fetch && git -C app checkout <commit>`,
then `npm run facts:drift` and the tests.

## Working on it

```
npm ci
npm run build            # svelte-check, then vite build: confirm "✓ built"
npm test                 # vitest
npx playwright test      # the browser journeys, against wrangler dev --env test
npm run facts:drift      # what changed in djmanzo since the facts were read
npm run shots            # app/docs/screenshots and screenshots/ → public/shots/app
npm run deploy           # build, then wrangler deploy
```

`npm run build` is `svelte-check && vite build`: a type error leaves the
previous bundle in `dist/`, and the browser tests then pass against stale
code. Confirm `✓ built` before trusting them. Where Chromium is
pre-installed, set `DJMANZO_CHROMIUM` to it.

## Rules that hold here as they do in djmanzo

- No GPL or AGPL code.
- Every claim about the application is a fact from `shared/facts.ts`, with
  its status and caveat, read against `app/`'s documents.
- Pictures of the application come only from `app/docs/screenshots/` and
  `screenshots/`, described in their READMEs.
- No model identifier in a commit message, a comment or a document.
