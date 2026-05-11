import { titleCase } from "../lib/format";
import type { AuditEvent, TechnicianAction, Ticket, TicketStatus } from "./types";

export interface TechnicianActionResult {
  ticket: Ticket;
  auditEvent: AuditEvent;
}

export function applyTechnicianAction(
  ticket: Ticket,
  action: TechnicianAction
): TechnicianActionResult {
  const nextStatus = getNextStatus(ticket.status, action.type);
  const updatedTicket: Ticket = {
    ...ticket,
    status: nextStatus,
    updatedAt: action.timestamp
  };

  return {
    ticket: updatedTicket,
    auditEvent: {
      id: `${ticket.id}-${action.type}-${action.timestamp}`,
      ticketId: ticket.id,
      actorType: "technician",
      actorName: action.actorName,
      eventType: getAuditEventType(action.type),
      message: getAuditMessage(action.type, nextStatus),
      timestamp: action.timestamp
    }
  };
}

function getNextStatus(
  currentStatus: TicketStatus,
  actionType: TechnicianAction["type"]
): TicketStatus {
  if (actionType === "start_work") {
    return "in_progress";
  }

  if (actionType === "send_response") {
    return "pending_user";
  }

  if (actionType === "approve_recommendation") {
    return "pending_approval";
  }

  if (actionType === "reject_recommendation") {
    return "in_progress";
  }

  if (actionType === "escalate") {
    return "escalated";
  }

  if (actionType === "close_ticket") {
    return "closed";
  }

  return currentStatus;
}

function getAuditEventType(
  actionType: TechnicianAction["type"]
): AuditEvent["eventType"] {
  if (actionType === "save_note") {
    return "technician_note_saved";
  }

  if (actionType === "send_response") {
    return "user_response_sent";
  }

  if (actionType === "approve_recommendation") {
    return "technician_approved";
  }

  if (actionType === "reject_recommendation") {
    return "technician_rejected";
  }

  if (actionType === "escalate") {
    return "ticket_escalated";
  }

  if (actionType === "close_ticket") {
    return "ticket_closed";
  }

  return "status_changed";
}

function getAuditMessage(
  actionType: TechnicianAction["type"],
  nextStatus: TicketStatus
): string {
  if (actionType === "save_note") {
    return "Internal note saved.";
  }

  if (actionType === "send_response") {
    return "User response sent and ticket moved to Pending User.";
  }

  if (actionType === "approve_recommendation") {
    return "Recommendation approved by technician.";
  }

  if (actionType === "reject_recommendation") {
    return "Recommendation rejected by technician.";
  }

  if (actionType === "escalate") {
    return "Ticket escalated to Tier 2.";
  }

  if (actionType === "close_ticket") {
    return "Ticket closed.";
  }

  return `Status changed to ${titleCase(nextStatus)}.`;
}
