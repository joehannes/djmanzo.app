/**
 * The record shop (website version 3): one long shop the visitor walks along
 * sideways, room by room, each room with one thing to do. The rooms are also
 * the shop's navigation: dividers in a record crate, the current one
 * standing up.
 *
 * Don Ramón keeps the shop. He says one line in each room and then lets the
 * visitor be.
 */

export type RoomId = "counter" | "crates" | "world" | "practice" | "makers" | "cafe" | "wishes" | "window" | "till";

export interface Room {
  id: RoomId;
  /** The word on its divider. */
  name: string;
  /** The one thing to do there. */
  verb: string;
  /** Its painting in `public/shop/art/`. */
  art: string;
  /** What Don Ramón says there. */
  line: string;
}

export const ROOMS: Room[] = [
  { id: "counter", name: "Counter", verb: "Play", art: "front", line: "Looking for something, or just looking?" },
  { id: "crates", name: "Crates", verb: "Dig", art: "crates", line: "Every sleeve is a place and a way of moving. Pull one out." },
  { id: "world", name: "The World", verb: "Travel", art: "backroom", line: "The whole world, side A. Put the needle down anywhere." },
  { id: "practice", name: "Practice", verb: "Learn", art: "crates", line: "Nobody claps in the practice room. That's how you know it's working." },
  { id: "makers", name: "Makers", verb: "Browse", art: "makers", line: "Made by DJs, given away by DJs. Everything up here is free." },
  { id: "cafe", name: "Café", verb: "Talk", art: "cafe", line: "Ask the question everyone's thinking. Somebody here has asked it before." },
  { id: "wishes", name: "Wishes", verb: "Wish", art: "wishes", line: "You take requests all night. Here you can make one." },
  { id: "window", name: "Window", verb: "Save", art: "window", line: "No countdowns in this window. The price is fair on a Tuesday too." },
  { id: "till", name: "Till", verb: "Take it home", art: "till", line: "The single is free, for ever. The album is for when you need more." },
];

export const ROOM_BY_ID = Object.fromEntries(ROOMS.map((r) => [r.id, r])) as Record<RoomId, Room>;

/** Who the visitor said they were, at the counter. */
export type Visitor = "dj" | "karaoke" | "curious";

export const ANSWERS: { id: Visitor; label: string; reply: string; groove: string }[] = [
  { id: "dj", label: "DJ software", reply: "Then hear it before anything else. The band on the counter plays whatever you give them.", groove: "house" },
  { id: "karaoke", label: "Karaoke for my place", reply: "Then you'll want a voice. Wake up Voz, the one with the microphone.", groove: "pop" },
  { id: "curious", label: "Just looking", reply: "Best kind of customer. Touch anything; it all plays.", groove: "merengue" },
];

const KEY = "djmanzo.shop";

export function rememberVisitor(v: Visitor) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ visitor: v }));
  } catch {
    // A private window keeps nothing; the shop still works.
  }
}

export function recallVisitor(): Visitor | null {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "null")?.visitor;
    return v === "dj" || v === "karaoke" || v === "curious" ? v : null;
  } catch {
    return null;
  }
}
