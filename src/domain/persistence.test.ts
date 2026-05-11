import { describe, expect, it } from "vitest";
import { sampleTickets } from "../data/mockData";
import { serializeDemoState, parseDemoState } from "./persistence";
import type { DemoState } from "./persistence";

const demoState: DemoState = {
  version: 1,
  tickets: sampleTickets,
  selectedTicketId: sampleTickets[0].id,
  queueFilter: "all",
  approvalState: "pending",
  actionEventsByTicket: {},
  notesByTicket: {},
  triageByTicket: {}
};

describe("demo persistence", () => {
  it("round-trips supported demo state as JSON", () => {
    expect(parseDemoState(serializeDemoState(demoState))).toEqual(demoState);
  });

  it("returns null for corrupted or unsupported storage payloads", () => {
    expect(parseDemoState("not-json")).toBeNull();
    expect(parseDemoState(JSON.stringify({ ...demoState, version: 999 }))).toBeNull();
  });
});
