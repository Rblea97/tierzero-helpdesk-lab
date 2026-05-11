import { describe, expect, it } from "vitest";
import { sampleTickets } from "../data/mockData";
import { getQueueMetrics, getVisibleTickets } from "./queue";

describe("queue domain", () => {
  it("filters tickets by selected status", () => {
    const tickets = [
      sampleTickets[0],
      { ...sampleTickets[1], status: "in_progress" as const },
      { ...sampleTickets[2], status: "closed" as const }
    ];

    expect(getVisibleTickets(tickets, "in_progress")).toEqual([tickets[1]]);
    expect(getVisibleTickets(tickets, "all")).toEqual(tickets);
  });

  it("derives queue metrics from current ticket state", () => {
    const tickets = [
      sampleTickets[0],
      { ...sampleTickets[1], status: "pending_user" as const },
      { ...sampleTickets[2], status: "escalated" as const },
      {
        ...sampleTickets[0],
        id: "TZ-INC-2026-0099",
        priority: "urgent" as const,
        status: "closed" as const
      }
    ];

    expect(getQueueMetrics(tickets)).toEqual({
      openTickets: 3,
      highPriority: 2,
      pendingUser: 1,
      escalated: 1,
      closed: 1
    });
  });
});
