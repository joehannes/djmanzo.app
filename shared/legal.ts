/**
 * The words of the site's own pages (Austria's ECG §5 and MedienG §25, the
 * GDPR, the EU's Digital Services Act), held once: the Signal Path shows them
 * (`src/signal/auxiliary/Legal.svelte`) and the Worker renders them for whoever
 * reads the page without running it (`worker/seo.ts`). Written for the owner
 * to read over: they say what this site actually does.
 *
 * A line may name `{contact}`, link one of the site's own pages as
 * `[words](/path)`, and set words in *italics*; `legalHtml` makes that HTML.
 */

export interface Clause {
  head: string;
  text: string;
}

export const IMPRINT_WHAT = "The website of djmanzo, a DJ and karaoke application: its shop, its marketplace (Outboard) and its discussion space (Talkback).";
export const IMPRINT_MISSING = "The imprint is being completed. Until it is, nobody can post, comment, vote or upload here; reading is open.";
/** Who to write to when the imprint is not filled in yet. */
export const NO_CONTACT = "the address in the imprint, once it is filled in";

export const SCREENING = "A new account's posts may be read first by an AI screen (Claude), which can only let a post through or hold it for a person: it never removes anything. People decide.";

export const TERMS_INTRO = "By posting, commenting, rating or uploading here you agree to these terms. They are short on purpose.";
export const TERMS: Clause[] = [
  { head: "Yours stays yours.", text: "What you post or upload remains your work. You let this site show it and, for packs, hand it out under the licence you named, free, for as long as it is listed." },
  { head: "Only what is yours to share.", text: "No music, samples or stems of other people's records, and nothing you have no right to give away. Packs need a licence that lets them be shared (MIT, Apache-2.0, a Creative Commons licence, CC0)." },
  { head: "Everything here is free.", text: "Nothing is sold in Outboard and the site takes nothing. A maker may link to their own page on an official donation platform; any money goes between you and them, not through djmanzo." },
  { head: "The rules apply.", text: "See the [community rules](/rules). Anything can be reported." },
  { head: "Removal, with reasons.", text: "The crew may hold or remove a post, comment, item or page that breaks these terms or the law. You are always told why, and you can reply; the crew reads it." },
  { head: "Packs are checked, not guaranteed.", text: "Each is checked as djmanzo checks one before it installs it, and djmanzo checks it again. Install what you trust." },
  { head: "Leaving.", text: "Ask at {contact} and your account, posts and uploads are removed." },
];

export const PRIVACY_INTRO = "What this site keeps about you, and why. It shows no adverts and runs no one else's trackers.";
export const PRIVACY: Clause[] = [
  { head: "When you sign in:", text: "what the provider (Google, Apple, GitHub, Microsoft or Discord) tells it — your name, your e-mail address and an id — to know you next time and to tie licences and posts to you. Kept in Cloudflare's storage until you ask for it to be removed." },
  { head: "What you write:", text: "posts, comments, votes, ratings, reports and uploads, with when you wrote them, shown as you meant them to be." },
  { head: "Your address on the internet:", text: "used, scrambled, to count requests so the site cannot be flooded. Not kept beyond that." },
  { head: "What you look at here:", text: "the pages you open and how long, how far down the home page you scroll, what you search for and ask the assistant, and what you press, so the crew can make what people look for easier to find. Kept without knowing who you are: no cookie and nothing stored in your browser; your visit is a scrambled key made from that day's secret, your address and your browser's name, which cannot be turned back into either and changes every day. Anything shaped like an e-mail address or a phone number is taken out of what you type. With your country, language and the kind of device, kept 90 days, read only by the crew. A browser set to Global Privacy Control or Do Not Track sends none of it." },
  { head: "The AI screen:", text: "a new account's post may be sent to Anthropic's Claude to be read before a person does. Under Anthropic's commercial terms, what is sent this way is not used to train its models." },
  { head: "What you allowed on the Signal Path", text: "(roughly where you are, your own location) stays in your browser; *Forget me* removes it." },
  { head: "Purchases:", text: "handled by the payment provider; this site keeps the order and the licence." },
];
export const PRIVACY_OUTRO = "To see, correct or remove what is kept about you, write to {contact}.";

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/** One line of these pages as HTML: escaped first, then its own few marks. */
export function legalHtml(text: string, contact: string): string {
  return escapeHtml(text)
    .replace(/\[([^\]]+)\]\((\/[a-z/-]*)\)/g, '<a class="link" href="$2">$1</a>')
    .replace(/\*([^*]+)\*/g, "<i>$1</i>")
    .replace(/\{contact\}/g, escapeHtml(contact));
}
