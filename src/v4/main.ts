import { mount } from "svelte";
import App from "./App.svelte";
import { fromHash, parse, signalStage } from "./router";

// Older addresses: a Signal Path stage (`/#/amp`) goes to the Signal Path; the preview's hash pages (`#/pricing`) become paths.
const stage = signalStage(location.hash);
if (stage) location.replace(stage);
else {
  const older = fromHash(location.hash);
  if (older) history.replaceState(null, "", older + location.search);
  // The words the Worker rendered give way to the site, except on a page that is only words (the blog, the legal pages),
  // which the site shows inside its own frame.
  if (parse(location.pathname).page !== "read") document.getElementById("static")?.remove();
  mount(App, { target: document.getElementById("app")! });
}
