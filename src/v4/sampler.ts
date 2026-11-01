/**
 * The sounds recorded for the site (`tools/suno/`): the booth's pads by their
 * own ids, and the site's small sounds as `ui-…`. Each is served as
 * `/v4/sampler/<id>.m4a` and `.webm`; `sampler.json` lists those whose files
 * are in, and `tools/suno/import.sh` writes it from what is served.
 */
import IDS from "./booth/sampler.json";

export const RECORDED: ReadonlySet<string> = new Set(IDS as string[]);
export const SAMPLER_BASE = "/v4/sampler";
