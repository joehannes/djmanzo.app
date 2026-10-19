// The words the Worker rendered (worker/seo.ts) give way to the painting, which opens the same place.
// A blog post is not a place on the Signal Path: it stays a page to read, and the painting is not loaded.
if (!/^\/blog(\/|$)/.test(location.pathname)) {
  document.getElementById("static")?.remove();
  const [{ mount }, { default: Signal }] = await Promise.all([import("svelte"), import("./Signal.svelte"), import("./signal.css")]);
  mount(Signal, { target: document.getElementById("signal")! });
}

export {};
