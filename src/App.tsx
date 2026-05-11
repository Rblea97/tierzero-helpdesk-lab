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
import { TechnicianActions } from "./components/workbench/TechnicianActions";
import { TriageHeader } from "./components/workbench/TriageHeader";
import { sampleTickets } from "./data/mockData";
import { applyTechnicianAction } from "./domain/actions";
import { getQueueMetrics, getVisibleTickets } from "./domain/queue";
import {
  createTicketFromIntake,
  validateTicketIntake
} from "./domain/tickets";
import { triageTicket } from "./domain/triage";
import type {
  AuditEvent,
  QueueFilter,
  TechnicianActionType,
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
  const [actionEventsByTicket, setActionEventsByTicket] = useState<
    Record<string, AuditEvent[]>
  >({});
  const [notesByTicket, setNotesByTicket] = useState<Record<string, string[]>>(
    {}
  );

  const ticket = tickets.find(
    (candidate) => candidate.id === selectedTicketId
  ) ?? tickets[0];
  const metrics = useMemo(() => getQueueMetrics(tickets), [tickets]);
  const visibleTickets = useMemo(
    () => getVisibleTickets(tickets, queueFilter),
    [tickets, queueFilter]
  );
  const recommendation = useMemo(() => triageTicket(ticket), [ticket]);
  const timeline = buildTimeline(
    ticket,
    approvalState,
    actionEventsByTicket[ticket.id] ?? []
  );

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

  function recordAction(actionType: TechnicianActionType, note?: string) {
    const result = applyTechnicianAction(ticket, {
      type: actionType,
      note,
      actorName: "Avery Stone",
      timestamp: new Date().toISOString()
    });

    setTickets((current) =>
      current.map((candidate) =>
        candidate.id === result.ticket.id ? result.ticket : candidate
      )
    );
    setActionEventsByTicket((current) => ({
      ...current,
      [ticket.id]: [...(current[ticket.id] ?? []), result.auditEvent]
    }));
  }

  function handleSaveNote(note: string) {
    setNotesByTicket((current) => ({
      ...current,
      [ticket.id]: [...(current[ticket.id] ?? []), note]
    }));
    recordAction("save_note", note);
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
      <TechnicianActions
        onAction={recordAction}
        onSaveNote={handleSaveNote}
        ticket={ticket}
      />
      <SecondaryWorkbenchPanels
        activeTab={activeNoteTab}
        onTabChange={setActiveNoteTab}
        recommendation={recommendation}
        savedNotes={notesByTicket[ticket.id] ?? []}
        timeline={timeline}
      />
      <ApprovalGate
        approvalState={approvalState}
        onApprove={() => {
          setApprovalState("approved");
          recordAction("approve_recommendation");
        }}
        onReject={() => {
          setApprovalState("rejected");
          recordAction("reject_recommendation");
        }}
      />
    </AppShell>
  );
}
