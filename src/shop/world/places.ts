/**
 * The record-earth in the shop's back room: the world laid out as on
 * Gleason's New Standard Map of the World (1892), an azimuthal equidistant
 * map round the North Pole — the pole at the centre, where a record's label
 * and spindle are, the Pacific at the top, Africa and Europe below, and
 * Antarctica as the ice round the rim. On a record the grooves run round
 * the centre too, so the parallels are its grooves.
 *
 * Coordinates here are in units of the disc's radius: x to the right, y
 * down, the pole at (0, 0) and the far south at radius 1.
 */

import { GENRE_BY_ID, type Genre } from "../../lib/genres";

/** Where a genre was born, as its history tells it. */
export interface Place {
  /** A genre the shop's engine can play (`lib/genres.ts`). */
  genre: string;
  /** The place, as a visitor would name it. */
  where: string;
  lat: number;
  lon: number;
}

export const PLACES: Place[] = [
  { genre: "house", where: "Chicago", lat: 41.88, lon: -87.63 },
  { genre: "techno", where: "Detroit", lat: 42.33, lon: -83.05 },
  { genre: "hiphop", where: "The Bronx, New York", lat: 40.84, lon: -73.86 },
  { genre: "disco", where: "Philadelphia and New York", lat: 39.95, lon: -75.17 },
  { genre: "rock", where: "Memphis", lat: 35.15, lon: -90.05 },
  { genre: "pop", where: "Los Angeles", lat: 34.05, lon: -118.24 },
  { genre: "salsa", where: "New York, from Havana's son", lat: 23.11, lon: -82.37 },
  { genre: "dancehall", where: "Kingston", lat: 17.97, lon: -76.79 },
  { genre: "kompa", where: "Port-au-Prince", lat: 18.54, lon: -72.34 },
  { genre: "bachata", where: "Santo Domingo", lat: 18.48, lon: -69.93 },
  { genre: "merengue", where: "The Cibao valley", lat: 19.45, lon: -70.7 },
  { genre: "dembow", where: "Santo Domingo, by way of Kingston and Panama", lat: 18.2, lon: -69.2 },
  { genre: "reggaeton", where: "San Juan", lat: 18.47, lon: -66.11 },
  { genre: "cumbia", where: "Colombia's Caribbean coast", lat: 10.96, lon: -74.8 },
  { genre: "afrobeats", where: "Lagos", lat: 6.52, lon: 3.38 },
  { genre: "dnb", where: "London", lat: 51.51, lon: -0.13 },
  { genre: "lounge", where: "Ibiza's sunsets", lat: 38.98, lon: 1.3 },
];

export const PLACE_BY_GENRE: Record<string, Place> = Object.fromEntries(PLACES.map((p) => [p.genre, p]));

export function genreOf(p: Place): Genre {
  return GENRE_BY_ID[p.genre];
}

/** A point of the earth on the disc (Gleason's layout): radius grows from the pole, longitude 0 points down. */
export function gleason(lat: number, lon: number): { x: number; y: number } {
  const r = (90 - lat) / 180;
  const a = (lon * Math.PI) / 180;
  return { x: r * Math.sin(a), y: r * Math.cos(a) };
}

/** A point on the disc as a radius and an angle (radians, from +x towards +y). */
export function polar(x: number, y: number): { r: number; angle: number } {
  return { r: Math.hypot(x, y), angle: Math.atan2(y, x) };
}

/** Turn a point on the disc by `turn` radians about the centre (in the same sense as `polar`'s angle). */
export function rotate(p: { x: number; y: number }, turn: number): { x: number; y: number } {
  const c = Math.cos(turn);
  const s = Math.sin(turn);
  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c };
}

/**
 * The tonearm: it pivots outside the disc, to its right and above, and its
 * needle sweeps an arc across the record. Like a real one, it cannot reach
 * every point; the record turns under it instead.
 */
const PIVOT = { x: 1.16, y: -0.62 };
export const ARM = {
  pivot: PIVOT,
  length: 1.26,
  /** The arm's angle when it rests beside the record: swung out past the rim. */
  rest: Math.atan2(-PIVOT.y, -PIVOT.x) + 1.15,
};

/** Where the needle is when the arm points at `angle` (radians, from +x towards +y). */
export function needle(angle: number): { x: number; y: number } {
  return { x: ARM.pivot.x + ARM.length * Math.cos(angle), y: ARM.pivot.y + ARM.length * Math.sin(angle) };
}

/** The arm's angle that puts the needle into the groove at radius `r` (0.05 … 1). */
export function armFor(r: number): number {
  const toCentre = Math.atan2(-ARM.pivot.y, -ARM.pivot.x);
  // From pointing at the centre, the needle's distance from the centre grows as the arm swings out towards the rest.
  let lo = toCentre;
  let hi = toCentre + Math.PI / 2;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const n = needle(mid);
    if (Math.hypot(n.x, n.y) < r) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * How to play a place: the arm's angle, and how far to turn the record
 * (radians, added to its current turn) so that the place comes under the
 * needle.
 */
export function cue(p: { x: number; y: number }, currentTurn: number): { arm: number; turn: number } {
  const now = rotate(p, currentTurn);
  const { r, angle } = polar(now.x, now.y);
  const arm = armFor(Math.max(0.06, Math.min(0.98, r)));
  const n = needle(arm);
  let delta = Math.atan2(n.y, n.x) - angle;
  // The short way round.
  delta = Math.atan2(Math.sin(delta), Math.cos(delta));
  return { arm, turn: currentTurn + delta };
}

/** The place nearest the needle, if one is within `reach` (disc units). */
export function under(needlePoint: { x: number; y: number }, turn: number, reach = 0.06): Place | null {
  let best: Place | null = null;
  let bestD = reach;
  for (const p of PLACES) {
    const q = rotate(gleason(p.lat, p.lon), turn);
    const d = Math.hypot(q.x - needlePoint.x, q.y - needlePoint.y);
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return best;
}
