/**
 * The controllers djmanzo has a mapping for, and the ones it is going to,
 * searchable by maker and model. Every name here is in the facts
 * (`shared/facts.ts`: `mapped` and `hardware`), and a test holds that, so
 * this list can never promise a controller the application does not have.
 */

import { FACT_BY_ID } from "../../shared/facts";

export interface Device {
  maker: string;
  /** As the fact names it. */
  model: string;
  kind: "Controller" | "Player" | "Pad grid" | "Generic" | "Turntables";
  status: "mapped" | "planned";
}

export const DEVICES: Device[] = [
  { maker: "Pioneer DJ", model: "DDJ-400", kind: "Controller", status: "mapped" },
  { maker: "Pioneer DJ", model: "FLX4", kind: "Controller", status: "mapped" },
  { maker: "Pioneer DJ", model: "DDJ-200", kind: "Controller", status: "mapped" },
  { maker: "Pioneer DJ", model: "DDJ-SR", kind: "Controller", status: "mapped" },
  { maker: "Pioneer DJ", model: "CDJ-3000", kind: "Player", status: "mapped" },
  { maker: "Denon DJ", model: "MC4000", kind: "Controller", status: "mapped" },
  { maker: "Hercules", model: "Inpulse 300", kind: "Controller", status: "mapped" },
  { maker: "Numark", model: "DJ2GO", kind: "Controller", status: "mapped" },
  { maker: "Reloop", model: "Mixon 4", kind: "Controller", status: "mapped" },
  { maker: "Roland", model: "DJ-707M", kind: "Controller", status: "mapped" },
  { maker: "Novation", model: "Launchpad Mini MK3", kind: "Pad grid", status: "mapped" },
  { maker: "Any", model: "generic two-deck mapping", kind: "Generic", status: "mapped" },
  { maker: "Hercules", model: "Inpulse 500", kind: "Controller", status: "planned" },
  { maker: "Native Instruments", model: "Traktor Kontrol S2", kind: "Controller", status: "planned" },
  { maker: "Native Instruments", model: "S4", kind: "Controller", status: "planned" },
  { maker: "Pioneer DJ", model: "larger DDJs", kind: "Controller", status: "planned" },
  { maker: "Denon DJ and Rane", model: "Denon and Rane", kind: "Controller", status: "planned" },
];

/** What a device's status means, with the fact's own caveat. */
export const STATUS_WORDS = {
  mapped: { label: "Mapping ships", caveat: FACT_BY_ID.mapped?.caveat ?? "" },
  planned: { label: "Planned", caveat: "Not in djmanzo yet." },
};

export function search(q: string, list: Device[] = DEVICES): Device[] {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  return list.filter((d) => words.every((w) => `${d.maker} ${d.model} ${d.kind}`.toLowerCase().includes(w)));
}
