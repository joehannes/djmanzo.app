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
  /** Ed25519 private key, PKCS#8, base64. Signs every licence. */
  LICENCE_PRIVATE_KEY: string;

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
}

export type AppEnv = Omit<Env, keyof Secrets> & Partial<Secrets>;
