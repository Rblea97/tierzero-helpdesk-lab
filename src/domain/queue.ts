import type { QueueFilter, QueueMetrics, Ticket } from "./types";

export function getVisibleTickets(
  tickets: Ticket[],
  filter: QueueFilter
): Ticket[] {
  return filter === "all"
    ? tickets
    : tickets.filter((ticket) => ticket.status === filter);
}

export function getQueueMetrics(tickets: Ticket[]): QueueMetrics {
  return {
    openTickets: tickets.filter((ticket) => ticket.status !== "closed").length,
    highPriority: tickets.filter(
      (ticket) => ticket.priority === "high" || ticket.priority === "urgent"
    ).length,
    pendingUser: tickets.filter((ticket) => ticket.status === "pending_user")
      .length,
    escalated: tickets.filter((ticket) => ticket.status === "escalated").length,
    closed: tickets.filter((ticket) => ticket.status === "closed").length
  };
}
