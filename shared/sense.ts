/** What `/api/where` and `/api/weather` answer (`worker/sense.ts`), for the Worker and the page alike. */

export interface Where {
  known: boolean;
  city: string | null;
  region: string | null;
  country: string | null;
  timezone: string | null;
  /** A tenth of a degree: a town, not a street. */
  lat: number | null;
  lon: number | null;
  band: number | null;
  bandName: string | null;
}

/** The sky in a word, which is all the painting needs. */
export type Sky = "clear" | "partly" | "cloudy" | "fog" | "rain" | "snow" | "thunder";

export interface Weather {
  sky: Sky;
  /** MET Norway's own symbol, e.g. "lightrainshowers_night". */
  symbol: string;
  night: boolean;
  temperature: number | null;
  wind: number | null;
  rain: number | null;
  cloud: number | null;
  at: string;
  credit: string;
}
