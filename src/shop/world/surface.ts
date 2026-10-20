/**
 * The record-earth's surface, painted once onto a canvas: an ocean cut with
 * grooves, Gleason's graticule (a parallel every 15°, a meridian every 15°),
 * the land from Natural Earth (public domain, through `world-atlas`) laid
 * out round the pole, the southern ice as the rim, and the record's label
 * at the pole with its spindle hole.
 */

import { geoPath, geoProjection } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { MultiPolygon, Polygon } from "geojson";
import land50 from "world-atlas/land-50m.json";

/** Gleason's layout as a d3 projection: the pole at the centre, longitude 0 pointing down, the far south at radius π. */
function gleasonRaw(lambda: number, phi: number): [number, number] {
  const r = Math.PI / 2 - phi;
  return [r * Math.sin(lambda), -r * Math.cos(lambda)];
}

const radiusOf = (lat: number) => (90 - lat) / 180;

/**
 * The projection the land is painted with, for a disc of radius `R` pixels
 * centred on the origin. It must put every place where `places.ts`'s
 * `gleason` puts its pin, or the pins float off their countries.
 */
export function gleasonProjection(R: number) {
  // d3 centres a projection on (0°, 0°) unless told otherwise; Gleason's centre is the pole.
  return geoProjection(gleasonRaw).center([0, 90]).scale(R / Math.PI).translate([0, 0]).precision(0.2);
}

export interface SurfaceColours {
  sea: string;
  seaDeep: string;
  land: string;
  coast: string;
  lines: string;
  label: string;
  labelInk: string;
}

export const COLOURS: SurfaceColours = {
  sea: "#145266",
  seaDeep: "#082a36",
  land: "#d8c08a",
  coast: "#6b4e22",
  lines: "rgba(245, 226, 180, 0.22)",
  label: "#f3e7cf",
  labelInk: "#3a2614",
};

/** Paint the record-earth on a square canvas of `size` pixels. */
export async function paintSurface(size = 2048, c: SurfaceColours = COLOURS): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const g = canvas.getContext("2d")!;
  const R = size / 2;
  g.translate(R, R);

  // The sea, deeper towards the rim.
  const sea = g.createRadialGradient(0, 0, R * 0.05, 0, 0, R);
  sea.addColorStop(0, c.sea);
  sea.addColorStop(1, c.seaDeep);
  g.fillStyle = sea;
  g.beginPath();
  g.arc(0, 0, R, 0, Math.PI * 2);
  g.fill();

  // The grooves: fine rings all the way out, each a little lighter or darker than the last.
  for (let r = R * 0.085, i = 0; r < R * 0.985; r += 2.3, i++) {
    g.strokeStyle = i % 2 ? "rgba(0, 0, 0, 0.16)" : "rgba(255, 255, 255, 0.045)";
    g.lineWidth = 1.1;
    g.beginPath();
    g.arc(0, 0, r, 0, Math.PI * 2);
    g.stroke();
  }

  // The land, round the pole as Gleason drew it. Antarctica is the rim, painted below as ice.
  const projection = gleasonProjection(R);
  const path = geoPath(projection, g);
  const topology = land50 as unknown as Topology<{ land: GeometryCollection }>;
  const land = feature(topology, topology.objects.land) as unknown as { features: { geometry: MultiPolygon | Polygon }[] };
  const polygons: Polygon[] = [];
  for (const f of land.features) {
    const coords = f.geometry.type === "MultiPolygon" ? f.geometry.coordinates : [f.geometry.coordinates];
    for (const poly of coords) {
      const maxLat = Math.max(...poly[0].map((p) => p[1]));
      if (maxLat > -58) polygons.push({ type: "Polygon", coordinates: poly });
    }
  }
  g.save();
  g.shadowColor = "rgba(0, 0, 0, 0.35)";
  g.shadowBlur = R * 0.012;
  g.fillStyle = c.land;
  for (const poly of polygons) {
    g.beginPath();
    path(poly);
    g.fill();
  }
  g.restore();
  // Paper grain on the land, and the coast drawn in ink.
  g.save();
  g.globalCompositeOperation = "source-atop";
  for (let i = 0; i < 9000; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * R;
    g.fillStyle = Math.random() < 0.5 ? "rgba(107, 78, 34, 0.08)" : "rgba(255, 250, 235, 0.08)";
    g.fillRect(Math.cos(a) * r, Math.sin(a) * r, 2, 2);
  }
  g.restore();
  g.strokeStyle = c.coast;
  g.lineWidth = R * 0.0028;
  for (const poly of polygons) {
    g.beginPath();
    path(poly);
    g.stroke();
  }

  // Gleason's graticule: parallels every 15°, the equator and tropics a little stronger; meridians every 15°.
  g.strokeStyle = c.lines;
  for (let lat = 75; lat > -75; lat -= 15) {
    g.lineWidth = lat === 0 ? 3 : 1.6;
    g.beginPath();
    g.arc(0, 0, radiusOf(lat) * R, 0, Math.PI * 2);
    g.stroke();
  }
  g.setLineDash([R * 0.012, R * 0.01]);
  for (const lat of [23.44, -23.44, 66.56]) {
    g.lineWidth = 1.4;
    g.beginPath();
    g.arc(0, 0, radiusOf(lat) * R, 0, Math.PI * 2);
    g.stroke();
  }
  g.setLineDash([]);
  g.lineWidth = 1.3;
  for (let lon = 0; lon < 360; lon += 15) {
    const a = (lon * Math.PI) / 180;
    g.beginPath();
    g.moveTo(Math.sin(a) * R * 0.085, Math.cos(a) * R * 0.085);
    g.lineTo(Math.sin(a) * R * 0.86, Math.cos(a) * R * 0.86);
    g.stroke();
  }

  // The southern ice: the rim, with a ragged inner edge.
  g.save();
  g.beginPath();
  const steps = 720;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const wobble = Math.sin(a * 7) * 0.006 + Math.sin(a * 23 + 1) * 0.004 + Math.sin(a * 61 + 2) * 0.0025;
    const r = (0.865 + wobble) * R;
    if (i === 0) g.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  g.arc(0, 0, R * 0.985, Math.PI * 2, 0, true);
  g.closePath();
  const ice = g.createRadialGradient(0, 0, R * 0.86, 0, 0, R * 0.985);
  ice.addColorStop(0, "#f6fbff");
  ice.addColorStop(1, "#bcd8e6");
  g.fillStyle = ice;
  g.fill();
  g.restore();

  // The record's own edge.
  g.lineWidth = R * 0.03;
  g.strokeStyle = "#141110";
  g.beginPath();
  g.arc(0, 0, R * 0.985, 0, Math.PI * 2);
  g.stroke();

  // The label at the pole, and the spindle.
  try {
    await document.fonts.load(`${Math.round(R * 0.03)}px Bungee`);
  } catch {
    // The label still reads in the fallback face.
  }
  const lr = R * 0.08;
  g.fillStyle = c.label;
  g.beginPath();
  g.arc(0, 0, lr, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "rgba(58, 38, 20, 0.5)";
  g.lineWidth = R * 0.002;
  g.beginPath();
  g.arc(0, 0, lr * 0.92, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = c.labelInk;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = `${Math.round(lr * 0.36)}px Bungee, system-ui, sans-serif`;
  g.fillText("djmanzo", 0, -lr * 0.42);
  g.font = `${Math.round(lr * 0.16)}px Figtree, system-ui, sans-serif`;
  g.fillText("THE WORLD · SIDE A", 0, lr * 0.45);
  g.fillStyle = "#0c0a09";
  g.beginPath();
  g.arc(0, 0, lr * 0.09, 0, Math.PI * 2);
  g.fill();

  return canvas;
}
