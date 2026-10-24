/**
 * The sign-in providers' keys, set in Backstage rather than only as Worker
 * secrets, so the owner can switch a provider on, change its keys or switch
 * it off without a deploy.
 *
 * Each provider needs an app registered in the owner's own account there —
 * nobody else can do that step — and asks for the one address on this site
 * it may send people back to. Backstage shows that address and the steps for
 * each provider beside the fields its keys go in.
 *
 * Kept as the payment keys are (`worker/payments.ts`): sealed with AES-GCM
 * in KV (`config:signin`) under a key derived from the Worker's own secret,
 * a value set here winning over the Worker secret of the same name, and a
 * secret shown back only by its last four characters.
 */

import type { AppEnv } from "./env";
import { PROVIDERS, callbackPath } from "./auth";
import { fail } from "./http";
import { RAW, rawOf, sealedRead, sealedWrite } from "./payments";

const ID = /^[\w.\-@:/]{4,200}$/;
const SECRET = /^\S{8,400}$/;

/** What each provider asks for, in the order its console shows it. */
const KEYS: Record<string, { field: string; label: string; secret: boolean; check: RegExp; multiline?: boolean }[]> = {
  apple: [
    { field: "APPLE_CLIENT_ID", label: "Services ID", secret: false, check: /^[\w.\-]{3,200}$/ },
    { field: "APPLE_TEAM_ID", label: "Team ID", secret: false, check: /^[A-Z0-9]{10}$/ },
    { field: "APPLE_KEY_ID", label: "Key ID", secret: false, check: /^[A-Z0-9]{10}$/ },
    { field: "APPLE_PRIVATE_KEY", label: "Private key (.p8, the whole text)", secret: true, check: /^-----BEGIN PRIVATE KEY-----[\s\S]{40,}-----END PRIVATE KEY-----$/, multiline: true },
  ],
  tiktok: [
    { field: "TIKTOK_CLIENT_ID", label: "Client key", secret: false, check: ID },
    { field: "TIKTOK_CLIENT_SECRET", label: "Client secret", secret: true, check: SECRET },
  ],
  line: [
    { field: "LINE_CLIENT_ID", label: "Channel ID", secret: false, check: ID },
    { field: "LINE_CLIENT_SECRET", label: "Channel secret", secret: true, check: SECRET },
  ],
};
const keysOf = (id: string) =>
  KEYS[id] ?? [
    { field: `${id.toUpperCase()}_CLIENT_ID`, label: "Client ID", secret: false, check: ID },
    { field: `${id.toUpperCase()}_CLIENT_SECRET`, label: "Client secret", secret: true, check: SECRET },
  ];

/** Where to register, and what to do there. */
export const GUIDE: Record<string, { console: string; steps: string }> = {
  google: {
    console: "https://console.cloud.google.com/apis/credentials",
    steps: "Create credentials → OAuth client ID → Web application, with the address below as an authorised redirect URI. Then, under OAuth consent screen, publish the app so anyone can sign in, not only test users.",
  },
  apple: {
    console: "https://developer.apple.com/account/resources/identifiers/list/serviceId",
    steps: "Needs the Apple Developer Program. Make an App ID with Sign in with Apple, then a Services ID (its identifier is the Services ID here) with this site's domain and the address below as its return URL. Under Keys, make a key with Sign in with Apple and download the .p8 file once: paste its whole text. The Key ID is beside the key; the Team ID is at the top right of the account.",
  },
  facebook: {
    console: "https://developers.facebook.com/apps",
    steps: "Create an app with the use case \"Authenticate and request data from users with Facebook Login\". Facebook Login → Settings: the address below as a valid OAuth redirect URI. App settings → Basic: App ID and App secret, a privacy policy address (this site's /privacy), then switch the app to Live.",
  },
  instagram: {
    console: "https://developers.facebook.com/apps",
    steps: "Create a Business app and add Instagram → API setup with Instagram business login. Under Business login settings, the address below as the OAuth redirect URI; the Instagram app ID and secret are on that page. Only Instagram professional accounts (creator or business) can sign in, and anyone you have not added as a tester needs Advanced Access for instagram_business_basic, which Meta grants after App Review.",
  },
  microsoft: {
    console: "https://entra.microsoft.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade",
    steps: "New registration: accounts in any organisational directory and personal Microsoft accounts; redirect URI (Web) the address below. The Application (client) ID is on the overview; Certificates & secrets → New client secret, and copy its Value.",
  },
  x: {
    console: "https://developer.x.com/en/portal/dashboard",
    steps: "In your project's app, User authentication settings: OAuth 2.0, type Web App (a confidential client), the address below as the callback URI and this site as the website. Keys and tokens → OAuth 2.0 Client ID and Client Secret.",
  },
  tiktok: {
    console: "https://developers.tiktok.com/apps",
    steps: "Create an app, add the product Login Kit for Web with the address below as its redirect URI. The client key and client secret are on the app's page. Submit the app for review: until it is approved, only the sandbox's test users can sign in.",
  },
  linkedin: {
    console: "https://www.linkedin.com/developers/apps",
    steps: "Create an app (it needs a LinkedIn Page — one for djmanzo will do). Products: add Sign In with LinkedIn using OpenID Connect. Auth: the address below as an authorised redirect URL; the Client ID and Primary Client Secret are there too.",
  },
  twitch: {
    console: "https://dev.twitch.tv/console/apps",
    steps: "Register your application: the address below as the OAuth redirect URL, category Website Integration, client type Confidential. Manage → the Client ID, and New Secret.",
  },
  discord: {
    console: "https://discord.com/developers/applications",
    steps: "New Application → OAuth2: the address below as a redirect; the Client ID, and Reset Secret for the client secret.",
  },
  github: {
    console: "https://github.com/settings/developers",
    steps: "OAuth Apps → New OAuth App, with the address below as the authorization callback URL. The Client ID, and Generate a new client secret.",
  },
  line: {
    console: "https://developers.line.biz/console/",
    steps: "Create a provider, then a LINE Login channel for a web app. LINE Login tab: the address below as the callback URL. Basic settings: the Channel ID and Channel secret. Publish the channel so anyone can sign in.",
  },
  patreon: {
    console: "https://www.patreon.com/portal/registration/register-clients",
    steps: "Create Client, with the address below among its redirect URIs. The Client ID and Client Secret are on the client's card.",
  },
};

/** Every field Backstage may set here. */
export const FIELDS: Record<string, { secret: boolean; check: RegExp }> = Object.fromEntries(
  PROVIDERS.flatMap((p) => keysOf(p.id).map((k) => [k.field, { secret: k.secret, check: k.check }])),
);

interface Settings {
  values: Record<string, string>;
  at: number;
  by: string;
}

const KEY = "config:signin";
const INFO = "signin-v1";

async function read(env: AppEnv): Promise<Settings & { unreadable?: boolean }> {
  const { value, unreadable } = await sealedRead<Settings>(env, KEY, INFO);
  return { values: {}, at: 0, by: "", ...(value ?? {}), ...(unreadable ? { unreadable: true } : {}) };
}

/** A field's new value, "" to clear it (back to the Worker secret), absent to keep it. */
export async function update(given: AppEnv, change: { values?: Record<string, string> }, by: string): Promise<void> {
  const env = rawOf(given);
  const now = await read(env);
  const values = { ...now.values };
  for (const [k, v] of Object.entries(change.values ?? {})) {
    if (!(k in FIELDS)) fail(400, `There is no setting called ${k}.`);
    const value = String(v ?? "").trim();
    if (!value) {
      delete values[k];
      continue;
    }
    if (!FIELDS[k].check.test(value)) fail(400, `That does not look like a ${k.replace(/_/g, " ").toLowerCase()}.`);
    values[k] = value;
  }
  await sealedWrite(env, KEY, INFO, { values, at: Date.now(), by } satisfies Settings);
  cached = null;
}

/** What Backstage is shown: per provider, whether it is offered, where to register, and each key's source. */
export async function view(given: AppEnv, origin: string) {
  const env = rawOf(given);
  const s = await read(env);
  const live = await withSignin(given);
  const secrets = env as unknown as Record<string, string | undefined>;
  return {
    callbackPath: callbackPath(env),
    unreadable: !!s.unreadable,
    at: s.at || null,
    by: s.by || null,
    providers: PROVIDERS.map((p) => {
      const keys = keysOf(p.id).map((k) => {
        const here = s.values[k.field];
        const secret = secrets[k.field];
        const value = here ?? secret ?? "";
        return { field: k.field, label: k.label, multiline: !!k.multiline, set: !!value, from: here ? "backstage" : secret ? "worker secret" : null, shown: !value ? "" : k.secret ? `…${value.slice(-4)}` : value };
      });
      const offered = keysOf(p.id).every((k) => (live as unknown as Record<string, unknown>)[k.field]);
      return { id: p.id, name: p.name, who: p.who ?? null, offered, register: `${origin}${callbackPath(env)}/${p.id}`, ...GUIDE[p.id], keys };
    }),
  };
}

let cached: { at: number; values: Record<string, string>; kv: KVNamespace; root: string } | null = null;

/**
 * The environment with Backstage's sign-in keys laid over the Worker's
 * secrets (and over the payment settings already laid there), for one
 * request; read at most every thirty seconds per Worker.
 */
export async function withSignin(given: AppEnv): Promise<AppEnv> {
  const env = rawOf(given);
  if (!env.KV) return given;
  const root = env.LICENCE_PRIVATE_KEY || env.ADMIN_TOKEN || "";
  if (!cached || cached.kv !== env.KV || cached.root !== root || Date.now() - cached.at > 30_000) cached = { at: Date.now(), values: (await read(env)).values, kv: env.KV, root };
  if (!Object.keys(cached.values).length) return given;
  return { ...given, ...cached.values, [RAW]: env } as AppEnv;
}
