import { describe, expect, it } from "vitest";
import { sampleTickets } from "../data/mockData";
import { buildTimeline } from "./workflow";

describe("buildTimeline", () => {
  it("keeps existing ticket events and appends the generated approval request", () => {
    const timeline = buildTimeline(sampleTickets[0], "pending");

    expect(timeline).toHaveLength(4);
    expect(timeline.map((event) => event.ticketId)).toEqual([
      "TZ-INC-2026-0042",
      "TZ-INC-2026-0042",
      "TZ-INC-2026-0042",
      "TZ-INC-2026-0042"
    ]);
    expect(timeline[timeline.length - 1]).toMatchObject({
      actorType: "workflow",
      eventType: "approval_requested",
      message: "Pending technician approval."
    });
  });

  it("records approved and rejected technician decisions in the workflow event", () => {
    const approvedTimeline = buildTimeline(sampleTickets[0], "approved");
    const rejectedTimeline = buildTimeline(sampleTickets[0], "rejected");

    expect(approvedTimeline[approvedTimeline.length - 1]?.message).toBe(
      "Recommendation approved."
    );
    expect(rejectedTimeline[rejectedTimeline.length - 1]?.message).toBe(
      "Recommendation rejected."
    );
  });

  it("does not leak events from another ticket into the selected ticket timeline", () => {
    const timeline = buildTimeline(sampleTickets[1], "pending");

    expect(timeline).toHaveLength(2);
    expect(timeline.every((event) => event.ticketId === sampleTickets[1].id)).toBe(
      true
    );
  });

  it("includes generated technician action events after base workflow events", () => {
    const timeline = buildTimeline(sampleTickets[0], "pending", [
      {
        id: "audit-extra",
        ticketId: sampleTickets[0].id,
        actorType: "technician",
        actorName: "Avery Stone",
        eventType: "status_changed",
        message: "Status changed to In Progress.",
        timestamp: "2026-05-11T16:30:00.000Z"
      }
    ]);

    expect(timeline[timeline.length - 1]).toMatchObject({
      id: "audit-extra",
      eventType: "status_changed"
    });
  });
});
