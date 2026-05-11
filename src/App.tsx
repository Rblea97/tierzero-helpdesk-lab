import { useMemo, useState } from "react";
import { MetricStrip } from "./components/dashboard/MetricStrip";
import { AppShell } from "./components/layout/AppShell";
import { ApprovalGate } from "./components/workbench/ApprovalGate";
import {
  PrimaryWorkbenchPanels,
  SecondaryWorkbenchPanels
} from "./components/workbench/WorkbenchPanels";
import { TicketIntake } from "./components/workbench/TicketIntake";
import { TicketQueue } from "./components/workbench/TicketQueue";
import { TriageHeader } from "./components/workbench/TriageHeader";
import { sampleTickets } from "./data/mockData";
import { getQueueMetrics, getVisibleTickets } from "./domain/queue";
import {
  createTicketFromIntake,
  validateTicketIntake
} from "./domain/tickets";
import { triageTicket } from "./domain/triage";
import type {
  QueueFilter,
  Ticket,
  TicketIntake as TicketIntakeModel
} from "./domain/types";
import { buildTimeline } from "./domain/workflow";
import type { ApprovalState, NoteTab } from "./domain/workflow";

export function App() {
  const [tickets, setTickets] = useState<Ticket[]>(sampleTickets);
  const [selectedTicketId, setSelectedTicketId] = useState(sampleTickets[0].id);
  const [queueFilter, setQueueFilter] = useState<QueueFilter>("all");
  const [intakeErrors, setIntakeErrors] = useState<
    Record<string, string | undefined>
  >({});
  const [approvalState, setApprovalState] =
    useState<ApprovalState>("pending");
  const [activeNoteTab, setActiveNoteTab] = useState<NoteTab>("notes");

  const ticket = tickets.find(
    (candidate) => candidate.id === selectedTicketId
  ) ?? tickets[0];
  const metrics = useMemo(() => getQueueMetrics(tickets), [tickets]);
  const visibleTickets = useMemo(
    () => getVisibleTickets(tickets, queueFilter),
    [tickets, queueFilter]
  );
  const recommendation = useMemo(() => triageTicket(ticket), [ticket]);
  const timeline = buildTimeline(ticket, approvalState);

  function handleTicketChange(ticketId: string) {
    setSelectedTicketId(ticketId);
    setApprovalState("pending");
    setActiveNoteTab("notes");
  }

  function handleCreateTicket(intake: TicketIntakeModel): boolean {
    const validation = validateTicketIntake(intake);

    if (!validation.valid) {
      setIntakeErrors(validation.errors);
      return false;
    }

    const timestamp = new Date().toISOString();
    const newTicket = createTicketFromIntake(intake, tickets, timestamp);

    setTickets((current) => [...current, newTicket]);
    setSelectedTicketId(newTicket.id);
    setQueueFilter("all");
    setIntakeErrors({});
    setApprovalState("pending");
    setActiveNoteTab("notes");

    return true;
  }

  return (
    <AppShell>
      <MetricStrip metrics={metrics} />
      <TicketIntake errors={intakeErrors} onSubmit={handleCreateTicket} />
      <TicketQueue
        filter={queueFilter}
        onFilterChange={setQueueFilter}
        onSelectTicket={handleTicketChange}
        selectedTicketId={selectedTicketId}
        tickets={visibleTickets}
      />
      <TriageHeader recommendation={recommendation} ticket={ticket} />
      <PrimaryWorkbenchPanels
        recommendation={recommendation}
        ticket={ticket}
      />
      <SecondaryWorkbenchPanels
        activeTab={activeNoteTab}
        onTabChange={setActiveNoteTab}
        recommendation={recommendation}
        timeline={timeline}
      />
      <ApprovalGate
        approvalState={approvalState}
        onApprove={() => setApprovalState("approved")}
        onReject={() => setApprovalState("rejected")}
      />
    </AppShell>
  );
}
