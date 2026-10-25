import { describe, expect, it } from "vitest";
import { ordered, placeOf, playerSrc, type Video } from "../src/v4/videos";

const list: Video[] = [
  { id: "anywhere001", title: "Anywhere" },
  { id: "karaoke0001", title: "A karaoke night", stage: "karaoke" },
  { id: "oldstage001", title: "Tagged with a Signal Path stage", stage: "confluence" },
  { id: "decktop0001", title: "The deck", stage: "deck" },
];

describe("the owner's videos on the home page", () => {
  it("come in the order of the part of the page each shows; one tagged with a retired stage lands where that stage's subject now is", () => {
    expect(placeOf(list[2])).toBe("stems");
    expect(placeOf(list[0])).toBe("deck");
    expect(ordered(list).map((v) => v.id)).toEqual(["anywhere001", "decktop0001", "oldstage001", "karaoke0001"]);
  });

  it("play from YouTube's no-cookie address, and only the id given", () => {
    expect(playerSrc({ id: "a/b?c", title: "" })).toBe("https://www.youtube-nocookie.com/embed/a%2Fb%3Fc?autoplay=1&rel=0");
  });
});

describe("the owner's video list", () => {
  it("keeps the part of the home page a video is tagged with, and drops a tag that names none", async () => {
    const { handle } = await import("../worker/index");
    const { testEnv } = await import("./kv");
    const exec = { waitUntil: () => {}, passThroughOnException: () => {} } as unknown as ExecutionContext;
    const env = testEnv({ ADMIN_TOKEN: "crew-secret" });
    const put = new Request("https://djmanzo.test/api/admin/videos", {
      method: "PUT",
      headers: { authorization: "Bearer crew-secret", "content-type": "application/json" },
      body: JSON.stringify([
        { id: "mixvideo001", title: "Two decks", stage: "stems" },
        { id: "nowhere0001", title: "Somewhere", stage: "backstage" },
      ]),
    });
    expect((await handle(put, env, exec)).status).toBe(200);
    const got = (await (await handle(new Request("https://djmanzo.test/api/videos"), env, exec)).json()) as Video[];
    expect(got.map((v) => v.stage)).toEqual(["stems", null]);
  });
});
