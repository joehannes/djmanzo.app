/**
 * Outboard, the marketplace (§134, ADR-0012): what may be listed, what is
 * coming, how ratings are read, and where a maker may ask for support. Read
 * by the Worker and the page alike.
 */

/** The kinds this djmanzo installs today: what Outboard lists. */
export const LISTED_KINDS = [
  { kind: "theme", name: "Themes", what: "Fourteen colours for a dark room and a light one, every pair you read held to its contrast, worn on one of djmanzo's themes." },
  { kind: "skin", name: "Skins", what: "SVG tiles drawn faintly over a theme: still, drifting or breathing with the bass. A tile can only draw." },
  { kind: "visuals", name: "Visuals", what: "Looks for the projector, layered from djmanzo's own effects and MilkDrop presets." },
] as const;

export type ListedKind = (typeof LISTED_KINDS)[number]["kind"];

/** Kinds asked for and not yet installable: shown as coming, never offered (MARKETPLACE.md). */
export const COMING_KINDS = [
  { name: "Controller mappings", what: "A controller's table, for one djmanzo has no mapping for yet." },
  { name: "Knowledge packs", what: "A genre's or a night's shape, for the assistant." },
  { name: "DJ techniques", what: "Moves the autopilot can perform and the teacher can teach." },
  { name: "Lessons", what: "More of the Apprentice course." },
  { name: "Karaoke screens", what: "How the singers' screen looks." },
  { name: "Layouts", what: "Where everything sits on screen; a file that cannot run code." },
  { name: "FX presets", what: "Effect chains, saved and shared." },
  { name: "Settings packs", what: "Only settings that are safe to share: no paths, accounts or keys." },
  { name: "Audio plugins", what: "Native code, so only from reviewed makers, marked as code, and run apart from the audio." },
] as const;

/** How many ratings a mean leans towards the middle until it has its own. */
export const PRIOR_RATINGS = 10;
/** The middle it leans towards. */
export const PRIOR_MEAN = 3.5;

/**
 * A rating to sort by: the mean, drawn towards the middle while there are
 * few, so three fives do not outrank two hundred fours.
 */
export function bayesian(sum: number, count: number): number {
  return (PRIOR_RATINGS * PRIOR_MEAN + sum) / (PRIOR_RATINGS + count);
}

/** Official donation pages a maker may link to: djmanzo handles no money and takes nothing. */
export const DONATION_PLATFORMS = [
  { name: "Ko-fi", hosts: ["ko-fi.com"], path: /^\/[A-Za-z0-9_]{2,40}\/?$/ },
  { name: "Liberapay", hosts: ["liberapay.com"], path: /^\/[A-Za-z0-9_.-]{2,40}\/?$/ },
  { name: "GitHub Sponsors", hosts: ["github.com"], path: /^\/sponsors\/[A-Za-z0-9-]{1,39}\/?$/ },
  { name: "Buy Me a Coffee", hosts: ["buymeacoffee.com", "www.buymeacoffee.com"], path: /^\/[A-Za-z0-9_]{2,40}\/?$/ },
  { name: "Open Collective", hosts: ["opencollective.com"], path: /^\/[A-Za-z0-9-]{2,60}\/?$/ },
  { name: "Patreon", hosts: ["patreon.com", "www.patreon.com"], path: /^\/[A-Za-z0-9_]{2,60}\/?$/ },
  { name: "PayPal.me", hosts: ["paypal.me", "www.paypal.me"], path: /^\/[A-Za-z0-9]{2,40}\/?$/ },
] as const;

/** The most donation links a maker shows. */
export const MOST_LINKS = 3;

/** A link to a maker's own page on an official platform, made plain; anything else is refused. */
export function donationLink(text: string): { url: string; platform: string } | null {
  let u: URL;
  try {
    u = new URL(text.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "https:" || u.username || u.password || u.port) return null;
  const platform = DONATION_PLATFORMS.find((p) => (p.hosts as readonly string[]).includes(u.hostname) && p.path.test(u.pathname));
  if (!platform) return null;
  return { url: `https://${u.hostname}${u.pathname}`, platform: platform.name };
}
