/**
 * Secrets the Worker reads, set with `wrangler secret put`. Every one is
 * optional: a provider whose keys are missing is simply not offered, and
 * with no payment provider at all the shop runs in demo mode and says so.
 */
export interface Secrets {
  /** Extra school e-mail domains, comma-separated, whose verified addresses get the student price. */
  STUDENT_DOMAINS?: string;
  /** Comma-separated e-mail addresses whose sign-in opens Backstage. */
  ADMIN_EMAILS: string;
  /** A bearer token that opens Backstage before any sign-in provider exists. */
  ADMIN_TOKEN: string;
  /** Ed25519 private key, PKCS#8, base64. Signs every licence, and every voucher (`worker/voucher.ts`). */
  LICENCE_PRIVATE_KEY: string;
  /**
   * A variable: more public keys (raw 32 bytes, base64, comma-separated)
   * whose vouchers `/redeem` believes besides the shop's own — for a gift
   * signed outside this site with a key the owner trusts.
   */
  DJMANZO_GIFT_KEYS: string;

  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  /** Sign in with Apple: the Services ID, the team, and the key made for it (a .p8, PEM or bare base64). */
  APPLE_CLIENT_ID: string;
  APPLE_TEAM_ID: string;
  APPLE_KEY_ID: string;
  APPLE_PRIVATE_KEY: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
  FACEBOOK_CLIENT_ID: string;
  FACEBOOK_CLIENT_SECRET: string;
  MICROSOFT_CLIENT_ID: string;
  MICROSOFT_CLIENT_SECRET: string;
  /** Patreon: a sign-in, and the way a person shows their own Patreon page as verified. */
  PATREON_CLIENT_ID: string;
  PATREON_CLIENT_SECRET: string;
  /** A variable: djmanzo's own Patreon campaign id, so its patrons are marked as supporters. */
  PATREON_CAMPAIGN_ID: string;
  /** A variable: djmanzo's own account on GitHub Sponsors (a login), so its sponsors who sign in with GitHub are marked as supporters. */
  GITHUB_SPONSORS_LOGIN: string;
  /** Read-only, joehannes/djmanzo only: lets the site hand out a private repository's release files (`worker/update.ts`). */
  GITHUB_RELEASES_TOKEN?: string;
  /** Ko-fi's webhook verification token (Ko-fi → Settings → API), for /api/webhooks/kofi. */
  KOFI_VERIFICATION_TOKEN: string;
  /** Buy Me a Coffee's webhook secret, for /api/webhooks/buymeacoffee. */
  BUYMEACOFFEE_WEBHOOK_SECRET: string;
  /**
   * A variable: the callback path a provider app was registered with, when it
   * is the one used until 18 October (`/auth/callback`). Unset: `/callback`.
   */
  OAUTH_CALLBACK_PATH: string;

  STRIPE_SECRET_KEY: string;
  STRIPE_PUBLISHABLE_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  PAYPAL_CLIENT_ID: string;
  PAYPAL_CLIENT_SECRET: string;
  /** "live" or "sandbox" (the default). */
  PAYPAL_ENV: string;
  /** Bank details shown for a manual transfer; the transfer option is offered only when set. */
  BANK_TRANSFER_DETAILS: string;

  /** When set, blog drafts are written by Claude (otherwise by Workers AI), and the Signal Path's guide speaks. */
  ANTHROPIC_API_KEY: string;
  /** The workspace a key made outside any workspace spends from (`wrkspc_…`); a key made inside one needs none. */
  ANTHROPIC_WORKSPACE_ID: string;
  /** The model the guide speaks through; without one, the newest the key can use (`worker/model.ts`). */
  GUIDE_MODEL: string;
  /** The model that drafts blog posts; the same rule. */
  BLOG_MODEL: string;
  /** How many guide turns a day the site pays for, all visitors together (default 400). */
  GUIDE_DAILY: string;
  /** The model that screens new accounts' posts in Talkback; the same rule as the guide's. */
  MOD_MODEL: string;
  /** How many posts a day Claude screens, all together (default 200). */
  MOD_DAILY: string;
  /**
   * Who speaks for the guide, screens posts and drafts the blog: "claude" (only
   * with a key, and only when set to it), "off", or by default Workers AI
   * within its free daily allowance (`worker/model.ts`).
   */
  AI_PROVIDER: string;
  /** The Workers AI model; without one, the default in `worker/model.ts`. */
  WORKERS_AI_MODEL: string;
  /** The neurons a day this site may spend of Workers AI's free 10,000 (default 6,000). */
  AI_NEURONS_DAILY: string;

  /**
   * The imprint (Austria's ECG §5 and MedienG §25), set as variables. Until
   * all three are set nobody can upload, post, comment or vote (the owner's
   * choice, 18 October): a site that hosts what others write must say who
   * runs it.
   */
  IMPRINT_NAME: string;
  IMPRINT_ADDRESS: string;
  IMPRINT_EMAIL: string;
  /** Turnstile, when set: a new account proves it is a person before posting. */
  TURNSTILE_SITE_KEY: string;
  TURNSTILE_SECRET: string;
  /** The owner's own donation page, offered as "Support djmanzo" when set. */
  SUPPORT_URL: string;
}

/** Bindings that exist once the owner has made them: D1 for Outboard and Talkback, R2 for their files. */
export interface Optional {
  DB: D1Database;
  /** The bucket `djmanzo-media`: packs and pictures. Until R2 is enabled, uploads stay closed (the owner's choice). */
  MEDIA: R2Bucket;
}

export type AppEnv = Omit<Env, keyof Secrets> & Partial<Secrets> & Partial<Optional>;
