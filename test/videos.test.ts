import { describe, expect, it } from "vitest";
import { playerSrc, videoFor, type Video } from "../src/signal/videos";

const list: Video[] = [
  { id: "plaza000001", title: "In the plaza only" },
  { id: "mixanygenre", title: "Two decks", stage: "confluence" },
  { id: "mixbachata1", title: "Two decks, bachata", stage: "confluence", genre: "bachata" },
  { id: "karaoke0001", title: "A karaoke night", stage: "voice", genre: "edm" },
];

describe("the owner's video in a stage", () => {
  it("is the one made for the visitor's style, else the stage's general one", () => {
    expect(videoFor(list, "confluence", "bachata")?.id).toBe("mixbachata1");
    expect(videoFor(list, "confluence", "house")?.id).toBe("mixanygenre");
  });

  it("is another style's rather than none, and none where the stage has none", () => {
    expect(videoFor(list, "voice", "house")?.id).toBe("karaoke0001");
    expect(videoFor(list, "amp", "house")).toBeNull();
  });

  it("plays from YouTube's no-cookie address, and only the id given", () => {
    expect(playerSrc({ id: "a/b?c", title: "" })).toBe("https://www.youtube-nocookie.com/embed/a%2Fb%3Fc?autoplay=1&rel=0");
  });
});

describe("the owner's video list", () => {
  it("keeps the stage a video is tagged with, and drops one that names no stage", async () => {
    const { handle } = await import("../worker/index");
    const { testEnv } = await import("./kv");
    const exec = { waitUntil: () => {}, passThroughOnException: () => {} } as unknown as ExecutionContext;
    const env = testEnv({ ADMIN_TOKEN: "crew-secret" });
    const put = new Request("https://djmanzo.test/api/admin/videos", {
      method: "PUT",
      headers: { authorization: "Bearer crew-secret", "content-type": "application/json" },
      body: JSON.stringify([
        { id: "mixvideo001", title: "Two decks", stage: "confluence" },
        { id: "nowhere0001", title: "Somewhere", stage: "backstage" },
      ]),
    });
    expect((await handle(put, env, exec)).status).toBe(200);
    const list = (await (await handle(new Request("https://djmanzo.test/api/videos"), env, exec)).json()) as Video[];
    expect(list.map((v) => v.stage)).toEqual(["confluence", null]);
  });
});
