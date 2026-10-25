import { mount } from "svelte";
import App from "./App.svelte";
import { fromHash, parse, signalStage } from "./router";

// Older addresses become this site's: a Signal Path stage (`/#/amp`) the page and section that show the same, the
// preview's and the island's hash pages (`#/pricing`, `#/backstage`) paths.
const stage = signalStage(location.hash);
const older = stage ?? fromHash(location.hash);
if (older) history.replaceState(null, "", stage ? older : older + location.search);
// The words the Worker rendered give way to the site, except on a page that is only words (the blog, the legal pages),
// which the site shows inside its own frame.
if (parse(location.pathname).page !== "read") document.getElementById("static")?.remove();
mount(App, { target: document.getElementById("app")! });
