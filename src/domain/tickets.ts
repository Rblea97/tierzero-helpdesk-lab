import type { Ticket, TicketIntake, TicketPriority } from "./types";

export type IntakeValidationResult =
  | { valid: true; errors: Record<string, never> }
  | {
      valid: false;
      errors: {
        title?: string;
        description?: string;
        requesterId?: string;
      };
    };

export function getNextTicketId(tickets: Ticket[]): string {
  const highest = tickets.reduce((max, ticket) => {
    const match = ticket.id.match(/TZ-INC-2026-(\d{4})/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);

  return `TZ-INC-2026-${String(highest + 1).padStart(4, "0")}`;
}

export function validateTicketIntake(
  intake: TicketIntake
): IntakeValidationResult {
  const errors: {
    title?: string;
    description?: string;
    requesterId?: string;
  } = {};

  if (intake.title.trim().length === 0) {
    errors.title = "Enter a short issue title.";
  }

  if (intake.description.trim().length === 0) {
    errors.description = "Describe what the requester is experiencing.";
  }

  if (intake.requesterId.trim().length === 0) {
    errors.requesterId = "Choose a fictional requester.";
  }

  return Object.keys(errors).length === 0
    ? { valid: true, errors: {} }
    : { valid: false, errors };
}

export function createTicketFromIntake(
  intake: TicketIntake,
  existingTickets: Ticket[],
  timestamp: string
): Ticket {
  return {
    id: getNextTicketId(existingTickets),
    title: intake.title.trim(),
    description: intake.description.trim(),
    requesterId: intake.requesterId,
    assetId: intake.assetId,
    priority: priorityFromImpact(intake.businessImpact),
    status: "new",
    source: intake.source,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

function priorityFromImpact(
  impact: TicketIntake["businessImpact"]
): TicketPriority {
  if (impact === "high") {
    return "high";
  }

  if (impact === "low") {
    return "low";
  }

  return "medium";
}
