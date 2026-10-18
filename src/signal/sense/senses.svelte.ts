/**
 * What the Signal Path senses about the visitor's night — only what they
 * allowed (WEBSITE.md, "Consent").
 *
 * - **Roughly where** (`where`): the city and time zone Cloudflare's edge
 *   reads from the connection, for "Tonight in Linz" and the weather over
 *   the town.
 * - **Exactly where** (`gps`): the browser's location, rounded to about a
 *   kilometre the moment it arrives, for the real sunset and the sky over the
 *   street. It stays in this tab; only the rounded point goes out, to ask
 *   for the weather, and is not kept there either.
 *
 * Each is asked separately, and nothing optional runs before a yes. The
 * answers are remembered in this browser so the visitor is not asked again;
 * "Forget me" removes them with everything else the path remembers.
 */

import type { Sky, Weather, Where } from "../../../shared/sense";
import { api } from "../../lib/api";
import { daylightAt, sunTimes, type SunTimes } from "./sun";

export type Sense = "where" | "gps";
type Choice = boolean | null;
type Consent = Record<Sense, Choice>;

const KEY = "djmanzo.consent";
const WEATHER = "djmanzo.weather";

function load(): Consent {
  try {
    const c = JSON.parse(localStorage.getItem(KEY) ?? "null") as Partial<Consent> | null;
    return { where: c?.where ?? null, gps: c?.gps ?? null };
  } catch {
    return { where: null, gps: null };
  }
}

/** The light by the clock alone, where the visitor shared no place: the island's day. */
function byClock(d: Date): number {
  const h = d.getHours() + d.getMinutes() / 60;
  if (h < 5 || h >= 20) return 0;
  if (h < 7) return (h - 5) / 2;
  if (h < 17) return 1;
  return 1 - (h - 17) / 3;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

const SKIES: Sky[] = ["clear", "partly", "cloudy", "fog", "rain", "snow", "thunder"];

class Senses {
  consent = $state<Consent>(load());
  place = $state<Where | null>(null);
  /** The visitor's own point, rounded to two decimals, in memory only. */
  point = $state<[number, number] | null>(null);
  weather = $state<Weather | null>(null);
  now = $state(new Date());
  busy = $state<Sense | null>(null);
  note = $state<string | null>(null);
  /** `?sky=rain` shows a sky without asking anyone where they are: for previews and tests. */
  private readonly forced: Sky | null = typeof location !== "undefined" ? (SKIES.find((s) => s === new URLSearchParams(location.search).get("sky")) ?? null) : null;

  constructor() {
    if (typeof window === "undefined") return;
    setInterval(() => (this.now = new Date()), 60_000);
    if (this.consent.where) void this.readWhere();
    if (this.consent.gps) void this.readGps();
  }

  /** The best point there is: the visitor's own, else the town the edge read. */
  get at(): [number, number] | null {
    if (this.point) return this.point;
    if (this.place?.lat != null && this.place.lon != null) return [this.place.lat, this.place.lon];
    return null;
  }

  get city(): string | null {
    return this.place?.city ?? null;
  }

  /** 0 night … 1 day: by the sun where the visitor is, or by their clock. */
  get daylight(): number {
    const at = this.at;
    return at ? daylightAt(this.now, at[0], at[1]) : byClock(this.now);
  }

  get sky(): Sky | null {
    return this.forced ?? this.weather?.sky ?? null;
  }

  /** Today's sunrise and sunset where the visitor is; null without a place. */
  get sun(): SunTimes | null {
    const at = this.at;
    return at ? sunTimes(this.now, at[0], at[1]) : null;
  }

  /** The next sunrise from now, where the visitor is. */
  get nextSunrise(): Date | null {
    const at = this.at;
    if (!at) return null;
    const today = sunTimes(this.now, at[0], at[1]).rise;
    if (today && today > this.now) return today;
    return sunTimes(new Date(this.now.getTime() + 86_400_000), at[0], at[1]).rise;
  }

  async allow(what: Sense): Promise<void> {
    this.consent = { ...this.consent, [what]: true };
    this.save();
    if (what === "where") await this.readWhere();
    else await this.readGps();
  }

  decline(what: Sense): void {
    this.consent = { ...this.consent, [what]: false };
    this.save();
    if (what === "gps") this.point = null;
    if (what === "where") this.place = null;
  }

  forget(): void {
    this.consent = { where: null, gps: null };
    this.place = null;
    this.point = null;
    this.weather = null;
    this.note = null;
    try {
      localStorage.removeItem(KEY);
      sessionStorage.removeItem(WEATHER);
    } catch {
      /* nothing was kept */
    }
  }

  private async readWhere() {
    this.busy = "where";
    try {
      this.place = await api<Where>("/api/where");
      await this.readWeather();
    } catch {
      this.note = "Where you are could not be read just now.";
    } finally {
      this.busy = null;
    }
  }

  private readGps(): Promise<void> {
    if (!("geolocation" in navigator)) {
      this.note = "This browser cannot tell where it is.";
      return Promise.resolve();
    }
    this.busy = "gps";
    return new Promise((done) =>
      navigator.geolocation.getCurrentPosition(
        async (p) => {
          this.point = [round2(p.coords.latitude), round2(p.coords.longitude)];
          await this.readWeather();
          this.busy = null;
          done();
        },
        () => {
          // Refused in the browser: the visitor's no counts as a no here too.
          this.consent = { ...this.consent, gps: false };
          this.save();
          this.note = "The browser kept your location to itself; the night goes by your clock.";
          this.busy = null;
          done();
        },
        { enableHighAccuracy: false, maximumAge: 30 * 60_000, timeout: 15_000 },
      ),
    );
  }

  private async readWeather() {
    const at = this.at;
    if (!at) return;
    const key = `${at[0]},${at[1]}`;
    try {
      const kept = JSON.parse(sessionStorage.getItem(WEATHER) ?? "null") as { key: string; when: number; w: Weather } | null;
      if (kept && kept.key === key && Date.now() - kept.when < 30 * 60_000) {
        this.weather = kept.w;
        return;
      }
    } catch {
      /* read it again */
    }
    try {
      this.weather = await api<Weather>(`/api/weather?lat=${at[0]}&lon=${at[1]}`);
      sessionStorage.setItem(WEATHER, JSON.stringify({ key, when: Date.now(), w: this.weather }));
    } catch {
      /* no weather: the painting goes by the light alone */
    }
  }

  private save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.consent));
    } catch {
      /* a private window: asked again next time */
    }
  }
}

export const senses = new Senses();

/** "21:40" in the visitor's own clock. */
export function clock(d: Date): string {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
