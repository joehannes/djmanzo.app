/**
 * What the site may know about where a visitor is — only after they said
 * yes (WEBSITE.md, "Consent").
 *
 * - `where`: the city, region, country and time zone Cloudflare's edge
 *   reads from the connection (`request.cf`), with the coordinates rounded
 *   to a tenth of a degree. Nothing is stored. Under `wrangler dev` the edge
 *   is simulated, so the answer may be a stand-in or nothing at all.
 * - `weather`: the sky over a point, from MET Norway (the Norwegian
 *   Meteorological Institute; free, commercial use with attribution, and a
 *   User-Agent that says who is asking). The point arrives rounded to two
 *   decimals (about a kilometre) and is never stored; the answer is cached
 *   per point in Cloudflare's cache for as long as MET says it holds, so
 *   no visitor makes MET work twice and no KV write is spent on it.
 */

import { BAND_NAME, band } from "../shared/regions";
import type { Sky, Weather, Where } from "../shared/sense";
import { fail } from "./http";

export type { Sky, Weather, Where };

type Cf = { city?: string; region?: string; country?: string; timezone?: string; latitude?: string; longitude?: string };

const round = (n: number, places: number) => Math.round(n * 10 ** places) / 10 ** places;

export function where(req: Request): Where {
  const cf = (req as Request & { cf?: Cf }).cf;
  const country = cf?.country && cf.country !== "XX" && cf.country !== "T1" ? cf.country : null;
  const lat = Number(cf?.latitude);
  const lon = Number(cf?.longitude);
  const has = Number.isFinite(lat) && Number.isFinite(lon) && cf?.latitude !== undefined;
  const b = country ? band(country) : null;
  return {
    known: !!(cf?.city || country),
    city: cf?.city || null,
    region: cf?.region || null,
    country,
    timezone: cf?.timezone || null,
    lat: has ? round(lat, 1) : null,
    lon: has ? round(lon, 1) : null,
    band: b,
    bandName: b ? BAND_NAME[b as keyof typeof BAND_NAME] : null,
  };
}

export function skyOf(symbol: string): Sky {
  if (symbol.includes("thunder")) return "thunder";
  if (symbol.includes("snow") || symbol.includes("sleet")) return "snow";
  if (symbol.includes("rain")) return "rain";
  if (symbol.startsWith("fog")) return "fog";
  if (symbol.startsWith("cloudy")) return "cloudy";
  if (symbol.startsWith("partlycloudy") || symbol.startsWith("fair")) return "partly";
  return "clear";
}

interface MetForecast {
  properties?: {
    timeseries?: {
      time: string;
      data: {
        instant: { details: Record<string, number> };
        next_1_hours?: { summary: { symbol_code: string }; details?: { precipitation_amount?: number } };
        next_6_hours?: { summary: { symbol_code: string } };
      };
    }[];
  };
}

/** The first hour of MET's compact forecast, in the words the painting uses. */
export function summarise(f: MetForecast): Weather | null {
  const now = f.properties?.timeseries?.[0];
  if (!now) return null;
  const d = now.data.instant.details;
  const symbol = now.data.next_1_hours?.summary.symbol_code ?? now.data.next_6_hours?.summary.symbol_code ?? "cloudy";
  const num = (v: number | undefined) => (typeof v === "number" && Number.isFinite(v) ? v : null);
  return {
    sky: skyOf(symbol),
    symbol,
    night: symbol.endsWith("_night") || symbol.endsWith("_polartwilight"),
    temperature: num(d.air_temperature),
    wind: num(d.wind_speed),
    rain: num(now.data.next_1_hours?.details?.precipitation_amount),
    cloud: num(d.cloud_area_fraction),
    at: now.time,
    credit: "Weather: MET Norway (api.met.no), CC BY 4.0",
  };
}

const MET = "https://api.met.no/weatherapi/locationforecast/2.0/compact";
const AGENT = "djmanzo-website/1 (+https://github.com/joehannes/djmanzo)";

/** A point, rounded so it says where a neighbourhood is and no more; refused if it is not on Earth. */
export function point(lat: unknown, lon: unknown): [number, number] {
  const a = Number(lat);
  const o = Number(lon);
  if (!Number.isFinite(a) || !Number.isFinite(o) || Math.abs(a) > 90 || Math.abs(o) > 180) fail(400, "That is not a place on Earth.");
  return [round(a, 2), round(o, 2)];
}

export async function weather(lat: unknown, lon: unknown, fetcher: typeof fetch = fetch, cache: Cache | null = defaultCache()): Promise<Weather> {
  const [a, o] = point(lat, lon);
  const url = `${MET}?lat=${a}&lon=${o}`;
  const hit = await cache?.match(url);
  const res = hit ?? (await fetcher(url, { headers: { "user-agent": AGENT, accept: "application/json" } }));
  if (!res.ok) fail(502, "The weather service did not answer.");
  if (!hit && cache) {
    // MET says how long a forecast holds; keep it that long, at least ten minutes and at most an hour.
    const until = Date.parse(res.headers.get("expires") ?? "");
    const seconds = Math.min(3600, Math.max(600, Number.isFinite(until) ? Math.round((until - Date.now()) / 1000) : 1800));
    const copy = new Response(res.clone().body, { headers: { "content-type": "application/json", "cache-control": `public, max-age=${seconds}` } });
    await cache.put(url, copy);
  }
  const w = summarise((await res.json()) as MetForecast);
  if (!w) fail(502, "The weather service answered without a forecast.");
  return w;
}

function defaultCache(): Cache | null {
  return typeof caches !== "undefined" ? ((caches as unknown as { default?: Cache }).default ?? null) : null;
}
