/**
 * Which system the visitor is downloading for, shared by the bar's system
 * menu and the main Download button: the bar sets it and calls the button to
 * attention (`pulse`), the button offers that system's files.
 */

import { osOf, systemOf, type System } from "./download";

/** `pulse`: when the bar last called the main button to attention (`performance.now()`), 0 for never. */
export const choice = $state<{ os: System; pulse: number }>({ os: "mac", pulse: 0 });

let started = false;

/** The visitor's own system, once. */
export function start() {
  if (started) return;
  started = true;
  choice.os = systemOf(osOf(navigator.userAgent));
}

/** Switch to `os` and call the main Download button to attention. */
export function chooseSystem(os: System) {
  choice.os = os;
  choice.pulse = performance.now();
}
