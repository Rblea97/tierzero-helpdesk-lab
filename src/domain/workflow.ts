import { auditEvents } from "../data/mockData";
import type { AuditEvent, Ticket } from "./types";

export type ApprovalState = "pending" | "approved" | "rejected";
export type NoteTab = "notes" | "escalation";

export function buildTimeline(
  ticket: Ticket,
  approvalState: ApprovalState
): AuditEvent[] {
  const baseEvents = auditEvents.filter((event) => event.ticketId === ticket.id);
  const generatedEvents: AuditEvent[] = [
    {
      id: `${ticket.id}-kb`,
      ticketId: ticket.id,
      actorType: "system",
      actorName: "TierZero Demo",
      eventType: "kb_article_selected",
      message: "Knowledge-base article selected.",
      timestamp: "2026-05-10T14:00:06.000Z"
    },
    {
      id: `${ticket.id}-approval`,
      ticketId: ticket.id,
      actorType: "workflow",
      actorName: "Approval Workflow",
      eventType: "approval_requested",
      message:
        approvalState === "pending"
          ? "Pending technician approval."
          : approvalState === "approved"
            ? "Recommendation approved."
            : "Recommendation rejected.",
      timestamp: "2026-05-10T14:12:00.000Z"
    }
  ];

  return [...baseEvents, ...generatedEvents];
}
