/**
 * Where the sun is, for a time and a place: NOAA's solar calculator
 * (Meeus's low-precision formulas), good to a minute or two away from the
 * poles. Written out here rather than taken from a package: it is a page of
 * arithmetic, and it is what puts the real sunrise at Afterglow.
 */

const RAD = Math.PI / 180;
const DAY = 86_400_000;

interface Solar {
  /** Declination, radians. */
  decl: number;
  /** Equation of time, minutes. */
  eqTime: number;
}

function solar(ms: number): Solar {
  const jc = (ms / DAY + 2440587.5 - 2451545) / 36525;
  const l0 = (280.46646 + jc * (36000.76983 + jc * 0.0003032)) % 360;
  const m = 357.52911 + jc * (35999.05029 - 0.0001537 * jc);
  const e = 0.016708634 - jc * (0.000042037 + 0.0000001267 * jc);
  const c = Math.sin(m * RAD) * (1.914602 - jc * (0.004817 + 0.000014 * jc)) + Math.sin(2 * m * RAD) * (0.019993 - 0.000101 * jc) + Math.sin(3 * m * RAD) * 0.000289;
  const omega = 125.04 - 1934.136 * jc;
  const lambda = l0 + c - 0.00569 - 0.00478 * Math.sin(omega * RAD);
  const obliq = 23 + (26 + (21.448 - jc * (46.815 + jc * (0.00059 - jc * 0.001813))) / 60) / 60 + 0.00256 * Math.cos(omega * RAD);
  const decl = Math.asin(Math.sin(obliq * RAD) * Math.sin(lambda * RAD));
  const y = Math.tan((obliq / 2) * RAD) ** 2;
  const eqTime =
    4 /
    RAD *
    (y * Math.sin(2 * l0 * RAD) - 2 * e * Math.sin(m * RAD) + 4 * e * y * Math.sin(m * RAD) * Math.cos(2 * l0 * RAD) - 0.5 * y * y * Math.sin(4 * l0 * RAD) - 1.25 * e * e * Math.sin(2 * m * RAD));
  return { decl, eqTime };
}

/** The sun's height over the horizon, in degrees. */
export function sunAltitude(at: Date, lat: number, lon: number): number {
  const ms = at.getTime();
  const { decl, eqTime } = solar(ms);
  const minutes = (((ms % DAY) + DAY) % DAY) / 60_000;
  const trueSolar = (((minutes + eqTime + 4 * lon) % 1440) + 1440) % 1440;
  const hourAngle = trueSolar / 4 - 180;
  const cosZenith = Math.sin(lat * RAD) * Math.sin(decl) + Math.cos(lat * RAD) * Math.cos(decl) * Math.cos(hourAngle * RAD);
  return 90 - Math.acos(Math.max(-1, Math.min(1, cosZenith))) / RAD;
}

export interface SunTimes {
  /** null where the sun does not rise or set that day (polar day or night). */
  rise: Date | null;
  set: Date | null;
}

/** Sunrise and sunset on the day `at` falls on, at that place (its own solar day, not the browser's). */
export function sunTimes(at: Date, lat: number, lon: number): SunTimes {
  // The place's calendar day, by its longitude, and midnight UTC of it.
  const local = at.getTime() + (lon / 15) * 3_600_000;
  const midnight = Math.floor(local / DAY) * DAY;
  // The formulas at that day's solar noon, once roughly and once again.
  let noon = midnight + (720 - 4 * lon) * 60_000;
  let s = solar(noon);
  noon = midnight + (720 - 4 * lon - s.eqTime) * 60_000;
  s = solar(noon);
  const cosH = Math.cos(90.833 * RAD) / (Math.cos(lat * RAD) * Math.cos(s.decl)) - Math.tan(lat * RAD) * Math.tan(s.decl);
  if (cosH > 1 || cosH < -1) return { rise: null, set: null };
  const h = Math.acos(cosH) / RAD;
  return { rise: new Date(noon - h * 4 * 60_000), set: new Date(noon + h * 4 * 60_000) };
}

/** 0 at night, 1 in daylight, and the twilight in between: civil and nautical, by the sun's height. */
export function daylightAt(at: Date, lat: number, lon: number): number {
  const alt = sunAltitude(at, lat, lon);
  const k = Math.max(0, Math.min(1, (alt + 12) / 18));
  return k * k * (3 - 2 * k);
}
