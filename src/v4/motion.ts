/**
 * The site's motion, all GSAP: things rise into place as they scroll into
 * view, photographs drift at their own depth (parallax), and the hero leans
 * with the pointer. Nothing moves for a visitor who asked for less motion,
 * and nothing is hidden from one whose browser runs no script.
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { micTap, needle, scratch } from "./sfx.svelte";

gsap.registerPlugin(ScrollTrigger, SplitText);

export { gsap, ScrollTrigger };

export const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Bring `[data-reveal]` elements in as they arrive, and move
 * `[data-parallax="0.2"]` ones against the scroll by that much of their size.
 */
export function animate(root: HTMLElement): () => void {
  // The booth's small sounds answer the visitor's own presses, motion or not.
  const press = (e: Event) => {
    const t = (e.target as HTMLElement | null)?.closest<HTMLElement>("a.btn.primary, button.btn.primary, [data-file], [data-sound]");
    if (!t) return;
    const kind = t.dataset.sound;
    if (kind === "scratch") scratch();
    else if (kind === "mic") micTap();
    else needle();
  };
  root.addEventListener("click", press);
  if (reduced()) return () => root.removeEventListener("click", press);
  const splits: SplitText[] = [];
  const ctx = gsap.context(() => {
    // Headings rise word by word, like faders pushed up in turn.
    for (const h of root.querySelectorAll<HTMLElement>("[data-split]")) {
      const split = new SplitText(h, { type: "words", wordsClass: "split-word" });
      splits.push(split);
      gsap.from(split.words, { yPercent: 110, opacity: 0, duration: 0.7, ease: "back.out(1.6)", stagger: 0.06, scrollTrigger: { trigger: h, start: "top 88%", once: true } });
    }
    // A karaoke section says hello the way a host does: tapping the microphone.
    for (const k of root.querySelectorAll<HTMLElement>("[data-mic-on-arrival]")) {
      ScrollTrigger.create({ trigger: k, start: "top 70%", once: true, onEnter: () => micTap() });
    }
    const reveal = gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-reveal]"));
    gsap.set(reveal, { opacity: 0, y: 26 });
    ScrollTrigger.batch(reveal, {
      start: "top 90%",
      once: true,
      onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.07, overwrite: true }),
    });
    for (const el of root.querySelectorAll<HTMLElement>("[data-parallax]")) {
      const k = Number(el.dataset.parallax) || 0.15;
      gsap.fromTo(
        el,
        { yPercent: -k * 50 },
        { yPercent: k * 50, ease: "none", scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true } },
      );
    }
  }, root);
  // Images arriving late change the page's height.
  const refresh = () => ScrollTrigger.refresh();
  addEventListener("load", refresh, { once: true });
  return () => {
    root.removeEventListener("click", press);
    removeEventListener("load", refresh);
    for (const sp of splits) sp.revert();
    ctx.revert();
  };
}

/** The pointer's position over `el`, -1..1 each way, for things that lean with it. */
export function lean(el: HTMLElement, targets: { el: HTMLElement; depth: number }[]): () => void {
  if (reduced() || matchMedia("(pointer: coarse)").matches) return () => {};
  const movers = targets.map((t) => ({ x: gsap.quickTo(t.el, "x", { duration: 0.9, ease: "power3.out" }), y: gsap.quickTo(t.el, "y", { duration: 0.9, ease: "power3.out" }), depth: t.depth }));
  const move = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
    for (const m of movers) {
      m.x(-nx * m.depth);
      m.y(-ny * m.depth);
    }
  };
  el.addEventListener("pointermove", move);
  return () => el.removeEventListener("pointermove", move);
}
