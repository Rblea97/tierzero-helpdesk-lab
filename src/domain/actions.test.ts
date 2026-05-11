import { describe, expect, it } from "vitest";
import { sampleTickets } from "../data/mockData";
import { applyTechnicianAction } from "./actions";

const timestamp = "2026-05-11T16:30:00.000Z";

describe("technician actions", () => {
  it("starts work and appends a status audit event", () => {
    const result = applyTechnicianAction(sampleTickets[0], {
      type: "start_work",
      actorName: "Avery Stone",
      timestamp
    });

    expect(result.ticket.status).toBe("in_progress");
    expect(result.auditEvent).toMatchObject({
      ticketId: sampleTickets[0].id,
      actorType: "technician",
      actorName: "Avery Stone",
      eventType: "status_changed",
      message: "Status changed to In Progress."
    });
  });

  it("saves internal notes without changing ticket status", () => {
    const result = applyTechnicianAction(sampleTickets[0], {
      type: "save_note",
      note: "Verified requester identity and confirmed MFA method is available.",
      actorName: "Avery Stone",
      timestamp
    });

    expect(result.ticket.status).toBe(sampleTickets[0].status);
    expect(result.auditEvent).toMatchObject({
      eventType: "technician_note_saved",
      message: "Internal note saved."
    });
  });

  it("records approval decisions without changing queue status", () => {
    const approved = applyTechnicianAction(sampleTickets[0], {
      type: "approve_recommendation",
      actorName: "Avery Stone",
      timestamp
    });
    const rejected = applyTechnicianAction(sampleTickets[0], {
      type: "reject_recommendation",
      actorName: "Avery Stone",
      timestamp
    });

    expect(approved.ticket.status).toBe(sampleTickets[0].status);
    expect(approved.auditEvent.eventType).toBe("technician_approved");
    expect(rejected.ticket.status).toBe(sampleTickets[0].status);
    expect(rejected.auditEvent.eventType).toBe("technician_rejected");
  });

  it("escalates and closes tickets with specific audit events", () => {
    const escalated = applyTechnicianAction(sampleTickets[2], {
      type: "escalate",
      actorName: "Avery Stone",
      timestamp
    });
    const closed = applyTechnicianAction(sampleTickets[1], {
      type: "close_ticket",
      actorName: "Avery Stone",
      timestamp
    });

    expect(escalated.ticket.status).toBe("escalated");
    expect(escalated.auditEvent.eventType).toBe("ticket_escalated");
    expect(closed.ticket.status).toBe("closed");
    expect(closed.auditEvent.eventType).toBe("ticket_closed");
  });
});
