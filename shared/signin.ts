/**
 * Why a sign-in did not finish, as the page says it. The Worker puts the
 * word in the address it sends the person back to (`?signin=failed&why=…`),
 * on the page they started from, and the page reads it from here — so a
 * sign-in that fails says so, rather than leaving the visitor on the front
 * page knowing nothing.
 */
export const FAILURES = {
  expired: "The sign-in took longer than ten minutes, or was started in another browser. Start it again.",
  refused: "The provider did not let the sign-in through — it was cancelled there, or the site's app at the provider is not set up for this address.",
  token: "The provider would not swap its answer for a sign-in. The site's app at the provider may name a different callback address.",
  profile: "The provider did not say who you are.",
  taken: "That account already belongs to another djmanzo account. Sign in with it to use that one.",
} as const;

export type Failure = keyof typeof FAILURES;

/** The providers' names as the pages write them. */
export const PROVIDER_NAME: Record<string, string> = {
  google: "Google",
  apple: "Apple",
  github: "GitHub",
  discord: "Discord",
  facebook: "Facebook",
  patreon: "Patreon",
  microsoft: "Microsoft",
  instagram: "Instagram",
  x: "X",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  twitch: "Twitch",
  line: "LINE",
  demo: "the demo sign-in",
  owner: "the crew's token",
};
