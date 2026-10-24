import { describe, expect, it } from "vitest";
import { point, skyOf, summarise, weather, where } from "../worker/sense";
import { handle } from "../worker/index";
import { testEnv } from "./kv";

const exec = { waitUntil: () => {}, passThroughOnException: () => {} } as unknown as ExecutionContext;

function withCf(cf: Record<string, string>): Request {
  const req = new Request("https://djmanzo.test/api/where");
  Object.defineProperty(req, "cf", { value: cf });
  return req;
}

// The first hour of a real MET Norway compact answer, trimmed.
const MET = {
  properties: {
    timeseries: [
      {
        time: "2026-10-17T20:00:00Z",
        data: {
          instant: { details: { air_temperature: 9.4, cloud_area_fraction: 96.1, wind_speed: 3.2, relative_humidity: 88 } },
          next_1_hours: { summary: { symbol_code: "lightrainshowers_night" }, details: { precipitation_amount: 0.4 } },
          next_6_hours: { summary: { symbol_code: "rain" } },
        },
      },
    ],
  },
};

describe("where a visitor is, from the edge", () => {
  it("reads the city, the time zone and a coarse point, and the price band", () => {
    const w = where(withCf({ city: "Linz", region: "Upper Austria", country: "AT", timezone: "Europe/Vienna", latitude: "48.30639", longitude: "14.28611" }));
    expect(w).toMatchObject({ known: true, city: "Linz", country: "AT", timezone: "Europe/Vienna", lat: 48.3, lon: 14.3, band: 1 });
  });

  it("knows nothing where the edge read nothing, and nothing from Tor or an unknown country", () => {
    expect(where(new Request("https://djmanzo.test/"))).toMatchObject({ known: false, city: null, country: null, lat: null, band: null });
    expect(where(withCf({ country: "T1" })).country).toBeNull();
  });

  it("is served at /api/where", async () => {
    const res = await handle(withCf({ city: "Santo Domingo", country: "DO", latitude: "18.4861", longitude: "-69.9312" }), testEnv(), exec);
    expect(await res.json()).toMatchObject({ city: "Santo Domingo", band: 2, lat: 18.5, lon: -69.9 });
  });
});

describe("the sky over a point", () => {
  it("names the sky in a word from MET's symbol", () => {
    expect(skyOf("clearsky_night")).toBe("clear");
    expect(skyOf("fair_day")).toBe("partly");
    expect(skyOf("partlycloudy_polartwilight")).toBe("partly");
    expect(skyOf("cloudy")).toBe("cloudy");
    expect(skyOf("fog")).toBe("fog");
    expect(skyOf("heavyrainshowers_day")).toBe("rain");
    expect(skyOf("lightsleet")).toBe("snow");
    expect(skyOf("snowshowersandthunder_night")).toBe("thunder");
  });

  it("summarises the first hour", () => {
    expect(summarise(MET)).toMatchObject({ sky: "rain", night: true, temperature: 9.4, rain: 0.4, cloud: 96.1 });
    expect(summarise({})).toBeNull();
  });

  it("rounds a point to about a kilometre before it leaves, and refuses one that is not on Earth", () => {
    expect(point("48.306391", "14.286112")).toEqual([48.31, 14.29]);
    expect(() => point("91", "0")).toThrow();
    expect(() => point("x", "0")).toThrow();
  });

  it("asks MET once per point, says who is asking, and answers the second visitor from the cache", async () => {
    const asked: { url: string; agent: string | null }[] = [];
    const fake = (async (url: string, init?: RequestInit) => {
      asked.push({ url, agent: new Headers(init?.headers).get("user-agent") });
      return new Response(JSON.stringify(MET), { headers: { "content-type": "application/json", expires: new Date(Date.now() + 1800_000).toUTCString() } });
    }) as unknown as typeof fetch;
    const store = new Map<string, Response>();
    const cache = {
      match: async (k: string) => store.get(k)?.clone(),
      put: async (k: string, r: Response) => void store.set(k, r),
    } as unknown as Cache;

    const a = await weather("48.306391", "14.286112", fake, cache);
    const b = await weather("48.3071", "14.2858", fake, cache);
    expect(a.sky).toBe("rain");
    expect(b).toEqual(a);
    expect(asked).toHaveLength(1);
    expect(asked[0].url).toContain("lat=48.31&lon=14.29");
    expect(asked[0].agent).toMatch(/djmanzo/);
  });
});
