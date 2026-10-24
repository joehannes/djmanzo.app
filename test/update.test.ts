import { afterEach, describe, expect, it, vi } from "vitest";
import { RELEASES, compare, parse } from "../worker/update";
import { browser } from "./people";
import { testEnv } from "./kv";

afterEach(() => vi.unstubAllGlobals());

const MANIFEST = "https://github.com/joehannes/djmanzo/releases/download/v1.4.0/latest.json";

/** GitHub, played here: one release, its manifest, and a count of what was asked. */
function github(release: Record<string, unknown> | null, manifest: unknown = null) {
  const asked: string[] = [];
  vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
    const u = String(url);
    asked.push(u);
    if (u === RELEASES) {
      expect(new Headers(init?.headers).get("user-agent")).toBeTruthy();
      return release ? Response.json(release) : new Response("{}", { status: 404 });
    }
    if (u === MANIFEST && manifest) return Response.json(manifest);
    throw new Error(`unexpected fetch ${u}`);
  });
  return asked;
}

const release = (over: Record<string, unknown> = {}) => ({
  tag_name: "v1.4.0",
  body: "  Stems in the booth.\n\nAnd more.  ",
  html_url: "https://github.com/joehannes/djmanzo/releases/tag/v1.4.0",
  published_at: "2026-10-19T10:00:00Z",
  draft: false,
  prerelease: false,
  assets: [{ name: "latest.json", browser_download_url: MANIFEST }],
  ...over,
});
const manifest = {
  version: "1.4.0",
  platforms: {
    "linux-x86_64": { signature: "c2lnbmF0dXJl", url: "https://github.com/joehannes/djmanzo/releases/download/v1.4.0/djmanzo_1.4.0_amd64.AppImage.tar.gz" },
    "darwin-aarch64": { signature: "c2lnbmF0dXJlMg==", url: "https://github.com/joehannes/djmanzo/releases/download/v1.4.0/djmanzo.app.tar.gz" },
  },
};

describe("versions, compared as semver has it", () => {
  const cmp = (a: string, b: string) => Math.sign(compare(parse(a)!, parse(b)!));
  it("by major, minor and patch, as numbers", () => {
    expect(cmp("1.10.0", "1.9.9")).toBe(1);
    expect(cmp("2.0.0", "1.99.99")).toBe(1);
    expect(cmp("v1.4.2", "1.4.2")).toBe(0);
  });
  it("a release outranks its pre-releases, which go in order", () => {
    expect(cmp("1.4.0-beta.2", "1.4.0")).toBe(-1);
    expect(cmp("1.4.0-beta.2", "1.4.0-beta.11")).toBe(-1);
    expect(cmp("1.4.0-alpha", "1.4.0-alpha.1")).toBe(-1);
    expect(cmp("1.4.0-alpha.1", "1.4.0-beta")).toBe(-1);
    expect(cmp("1.4.0-1", "1.4.0-alpha")).toBe(-1);
  });
  it("ignores build metadata and refuses what is not a version", () => {
    expect(cmp("1.4.0+abc", "1.4.0")).toBe(0);
    for (const s of ["1.4", "1.4.0.1", "01.4.0", "latest", ""]) expect(parse(s), s).toBeNull();
  });
});

describe("GET /api/update/:target/:arch/:current", () => {
  it("answers 204 when djmanzo is up to date, or newer", async () => {
    github(release(), manifest);
    const web = browser(testEnv());
    expect((await web("/api/update/linux/x86_64/1.4.0")).status).toBe(204);
    expect((await web("/api/update/linux/x86_64/1.5.0-beta.1")).status).toBe(204);
  });

  it("offers a newer version of the same major with what the updater installs, for this platform", async () => {
    github(release(), manifest);
    const r = await browser(testEnv())("/api/update/linux/x86_64/1.3.2");
    expect(r.status).toBe(200);
    expect(r.data).toEqual({
      version: "1.4.0",
      notes: "Stems in the booth.\n\nAnd more.",
      pub_date: "2026-10-19T10:00:00Z",
      page: "https://github.com/joehannes/djmanzo/releases/tag/v1.4.0",
      url: manifest.platforms["linux-x86_64"].url,
      signature: "c2lnbmF0dXJl",
    });
    expect((await browser(testEnv())("/api/update/darwin/aarch64/1.4.0-rc.1")).data.signature).toBe("c2lnbmF0dXJlMg==");
  });

  it("offers a new major version as a download only, never to install", async () => {
    github(release({ tag_name: "v2.0.0" }), { ...manifest, version: "2.0.0" });
    const r = await browser(testEnv())("/api/update/linux/x86_64/1.9.0");
    expect(r.status).toBe(200);
    expect(r.data).toMatchObject({ version: "2.0.0", page: expect.stringContaining("github.com") });
    expect(r.data.url).toBeUndefined();
    expect(r.data.signature).toBeUndefined();
  });

  it("offers a download only when the release has no updater manifest, or none for this platform", async () => {
    github(release({ assets: [] }));
    const none = await browser(testEnv())("/api/update/linux/x86_64/1.3.0");
    expect(none.status).toBe(200);
    expect(none.data.url).toBeUndefined();
    github(release(), manifest);
    const windows = await browser(testEnv())("/api/update/windows/x86_64/1.3.0");
    expect(windows.status).toBe(200);
    expect(windows.data).toMatchObject({ version: "1.4.0" });
    expect(windows.data.url).toBeUndefined();
  });

  it("never offers a draft or a pre-release, and says nothing when there is no release", async () => {
    github(release({ prerelease: true }), manifest);
    expect((await browser(testEnv())("/api/update/linux/x86_64/1.0.0")).status).toBe(204);
    github(release({ draft: true }), manifest);
    expect((await browser(testEnv())("/api/update/linux/x86_64/1.0.0")).status).toBe(204);
    github(null);
    expect((await browser(testEnv())("/api/update/linux/x86_64/1.0.0")).status).toBe(204);
  });

  it("asks GitHub once in ten minutes, and keeps the notes to 4000 characters", async () => {
    const asked = github(release({ body: "x".repeat(9000) }), manifest);
    const env = testEnv();
    const web = browser(env);
    const first = await web("/api/update/linux/x86_64/1.0.0");
    expect(first.data.notes).toHaveLength(4000);
    await web("/api/update/darwin/aarch64/1.0.0");
    await web("/api/update/linux/x86_64/1.4.0");
    expect(asked.filter((u) => u === RELEASES)).toHaveLength(1);
    expect(asked.filter((u) => u === MANIFEST)).toHaveLength(1);
  });

  it("refuses what is not a version or a platform, and says so when GitHub does not answer", async () => {
    github(release(), manifest);
    expect((await browser(testEnv())("/api/update/linux/x86_64/latest")).status).toBe(400);
    expect((await browser(testEnv())("/api/update/Linux%20OS/x86_64/1.0.0")).status).toBe(400);
    vi.stubGlobal("fetch", async () => new Response("rate limited", { status: 403 }));
    expect((await browser(testEnv())("/api/update/linux/x86_64/1.0.0")).status).toBe(502);
  });

  it("is named in the catalogue, in the updater's own template", async () => {
    const r = await browser(testEnv())("/api/catalog");
    expect(r.data.updates).toBe("https://djmanzo.test/api/update/{{target}}/{{arch}}/{{current_version}}");
  });
});
