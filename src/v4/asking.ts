/**
 * Any page can hand the visitor's words to the assistant: a search that found
 * nothing, say. The assistant opens and answers them as if typed there
 * (`Assistant.svelte` listens), from the AI or from the facts.
 */
export const ASK_EVENT = "djmanzo:ask";

export function askAbout(text: string) {
  dispatchEvent(new CustomEvent<string>(ASK_EVENT, { detail: text }));
}
