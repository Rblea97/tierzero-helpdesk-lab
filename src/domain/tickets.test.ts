import { describe, expect, it } from "vitest";
import { sampleTickets } from "../data/mockData";
import {
  createTicketFromIntake,
  getNextTicketId,
  validateTicketIntake
} from "./tickets";
import type { TicketIntake } from "./types";

const validIntake: TicketIntake = {
  title: "VPN cannot connect",
  description: "The VPN client says the tunnel could not be established.",
  requesterId: "usr-morgan-chen",
  assetId: "asset-lap-1188",
  source: "portal",
  businessImpact: "medium"
};

describe("ticket intake", () => {
  it("generates the next fictional incident ID from existing tickets", () => {
    expect(getNextTicketId(sampleTickets)).toBe("TZ-INC-2026-0045");
  });

  it("rejects empty title and description without mutating queue state", () => {
    expect(
      validateTicketIntake({
        ...validIntake,
        title: " ",
        description: ""
      })
    ).toEqual({
      valid: false,
      errors: {
        title: "Enter a short issue title.",
        description: "Describe what the requester is experiencing."
      }
    });
  });

  it("creates a new safe ticket from valid intake", () => {
    const ticket = createTicketFromIntake(
      validIntake,
      sampleTickets,
      "2026-05-11T16:00:00.000Z"
    );

    expect(ticket).toMatchObject({
      id: "TZ-INC-2026-0045",
      title: "VPN cannot connect",
      requesterId: "usr-morgan-chen",
      assetId: "asset-lap-1188",
      priority: "medium",
      status: "new",
      source: "portal",
      createdAt: "2026-05-11T16:00:00.000Z",
      updatedAt: "2026-05-11T16:00:00.000Z"
    });
  });
});
