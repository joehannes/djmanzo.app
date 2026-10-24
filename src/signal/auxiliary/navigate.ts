/** Open one of the sends' pages from code, as a link to it would (`Signal.svelte` follows popstate). */
export function navigate(path: string): void {
  history.pushState(null, "", path);
  dispatchEvent(new PopStateEvent("popstate"));
}
