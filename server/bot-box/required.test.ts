import { afterEach, describe, expect, it, vi } from "vitest";

import { boxedSpawn } from "../procs.ts";
import { startBotBoxAtBoot } from "./boot.ts";
import { BotBox, botBox, type WrappedSpawn } from "./box.ts";

afterEach(() => vi.restoreAllMocks());

describe("required bot sandbox", () => {
  it("refuses to start when the sandbox is unavailable", async () => {
    const box = new BotBox();
    vi.spyOn(box, "start").mockResolvedValue({ box: "off", reason: "no-bwrap", tools: null });
    vi.spyOn(box, "enabled").mockReturnValue(false);
    await expect(startBotBoxAtBoot({ box, dataDir: "/fixture", port: 8799, env: { OMB_BOT_BOX: "required" }, selfCheck: false }))
      .rejects.toThrow("The required bot sandbox is unavailable (no-bwrap)");
  });

  it("starts normally when the required sandbox is available", async () => {
    const box = new BotBox();
    vi.spyOn(box, "start").mockResolvedValue({ box: "bwrap", reason: null, tools: { bwrap: "/fixture/bwrap", socat: null } });
    vi.spyOn(box, "enabled").mockReturnValue(true);
    await expect(startBotBoxAtBoot({ box, dataDir: "/fixture", port: 8799, env: { OMB_BOT_BOX: "required" }, selfCheck: false }))
      .resolves.toBeUndefined();
  });

  it("does not change existing optional sandbox startup", async () => {
    const box = new BotBox();
    vi.spyOn(box, "start").mockResolvedValue({ box: "off", reason: "no-bwrap", tools: null });
    vi.spyOn(box, "enabled").mockReturnValue(false);
    await expect(startBotBoxAtBoot({ box, dataDir: "/fixture", port: 8799, env: { OMB_BOT_BOX: "1" }, selfCheck: false }))
      .resolves.toBeUndefined();
  });

  it("refuses unboxed or shared-network bot spawns", () => {
    vi.spyOn(botBox, "required").mockReturnValue(true);
    vi.spyOn(botBox, "enabled").mockReturnValue(true);
    const wrap = vi.spyOn(botBox, "wrap").mockReturnValue(null);
    const command = { command: "/bin/true", args: [] };
    expect(() => boxedSpawn(command, { box: false }, "bot")).toThrow(/cannot be bypassed/);
    expect(() => boxedSpawn(command, { box: { net: "shared" } }, "bot")).toThrow(/cannot be bypassed/);
    expect(wrap).not.toHaveBeenCalled();
    expect(() => boxedSpawn(command, {}, "bot")).toThrow(/sandbox is unavailable/);
    expect(boxedSpawn(command, {}, "openmausbot")).toBeNull();
  });

  it("uses the isolated wrapper for a bot and fails closed if it stops", () => {
    vi.spyOn(botBox, "required").mockReturnValue(true);
    const enabled = vi.spyOn(botBox, "enabled").mockReturnValue(true);
    const wrapped = { command: "/fixture/bwrap" } as WrappedSpawn;
    const wrap = vi.spyOn(botBox, "wrap").mockReturnValue(wrapped);
    const command = { command: "/bin/true", args: [] };
    expect(boxedSpawn(command, {}, "bot")).toBe(wrapped);
    expect(wrap).toHaveBeenCalledOnce();
    enabled.mockReturnValue(false);
    expect(() => boxedSpawn(command, {}, "bot")).toThrow(/sandbox is unavailable/);
  });
});
