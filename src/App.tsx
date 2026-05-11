import { useEffect, useMemo, useState } from "react";
import { AutomationBlueprint } from "./components/workbench/AutomationBlueprint";
import { GuidedTriageConsole } from "./components/workbench/GuidedTriageConsole";
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
import {
  applyTechnicianAction,
  validateTechnicianAction
} from "./domain/actions";
import {
  buildEscalationHandoff,
  createInitialGuidedTriage,
  toggleChecklistStep,
  updateTriageFact
} from "./domain/guidedTriage";
import {
  DEMO_STORAGE_KEY,
  parseDemoState,
  serializeDemoState
} from "./domain/persistence";
import { getQueueMetrics, getVisibleTickets } from "./domain/queue";
import {
  createTicketFromIntake,
  validateTicketIntake
} from "./domain/tickets";
import { triageTicket } from "./domain/triage";
import type {
  AuditEvent,
  GuidedTriageState,
  QueueFilter,
  TechnicianAction,
  TechnicianActionType,
  Ticket,
  TicketIntake as TicketIntakeModel,
  TriageFactKey
} from "./domain/types";
import { buildTimeline } from "./domain/workflow";
import type { ApprovalState, NoteTab } from "./domain/workflow";

export function App() {
  const restoredState = useMemo(() => loadStoredDemoState(), []);
  const [tickets, setTickets] = useState<Ticket[]>(
    restoredState?.tickets ?? sampleTickets
  );
  const [selectedTicketId, setSelectedTicketId] = useState(
    restoredState?.selectedTicketId ?? sampleTickets[0].id
  );
  const [queueFilter, setQueueFilter] = useState<QueueFilter>(
    restoredState?.queueFilter ?? "all"
  );
  const [intakeErrors, setIntakeErrors] = useState<
    Record<string, string | undefined>
  >({});
  const [approvalState, setApprovalState] =
    useState<ApprovalState>(restoredState?.approvalState ?? "pending");
  const [activeNoteTab, setActiveNoteTab] = useState<NoteTab>("notes");
  const [actionEventsByTicket, setActionEventsByTicket] = useState<
    Record<string, AuditEvent[]>
  >(restoredState?.actionEventsByTicket ?? {});
  const [notesByTicket, setNotesByTicket] = useState<Record<string, string[]>>(
    restoredState?.notesByTicket ?? {}
  );
  const [triageByTicket, setTriageByTicket] = useState<
    Record<string, GuidedTriageState>
  >(restoredState?.triageByTicket ?? {});

  const ticket = tickets.find(
    (candidate) => candidate.id === selectedTicketId
  ) ?? tickets[0];
  const metrics = useMemo(() => getQueueMetrics(tickets), [tickets]);
  const visibleTickets = useMemo(
    () => getVisibleTickets(tickets, queueFilter),
    [tickets, queueFilter]
  );
  const recommendation = useMemo(() => triageTicket(ticket), [ticket]);
  const triageState = useMemo(
    () =>
      triageByTicket[ticket.id] ??
      createInitialGuidedTriage(ticket, recommendation),
    [recommendation, ticket, triageByTicket]
  );
  const timeline = buildTimeline(
    ticket,
    approvalState,
    actionEventsByTicket[ticket.id] ?? []
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      DEMO_STORAGE_KEY,
      serializeDemoState({
        version: 1,
        tickets,
        selectedTicketId,
        queueFilter,
        approvalState,
        actionEventsByTicket,
        notesByTicket,
        triageByTicket
      })
    );
  }, [
    actionEventsByTicket,
    approvalState,
    notesByTicket,
    queueFilter,
    selectedTicketId,
    tickets,
    triageByTicket
  ]);

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
    setTriageByTicket((current) => ({
      ...current,
      [newTicket.id]: createInitialGuidedTriage(
        newTicket,
        triageTicket(newTicket)
      )
    }));

    return true;
  }

  function recordAction(
    actionType: TechnicianActionType,
    details?: Pick<TechnicianAction, "note" | "resolutionCategory">
  ) {
    const action: TechnicianAction = {
      type: actionType,
      note: details?.note,
      resolutionCategory: details?.resolutionCategory,
      actorName: "Avery Stone",
      timestamp: new Date().toISOString()
    };
    const validation = validateTechnicianAction(action);

    if (!validation.valid) {
      return validation;
    }

    const result = applyTechnicianAction(ticket, action);

    setTickets((current) =>
      current.map((candidate) =>
        candidate.id === result.ticket.id ? result.ticket : candidate
      )
    );
    setActionEventsByTicket((current) => ({
      ...current,
      [ticket.id]: [...(current[ticket.id] ?? []), result.auditEvent]
    }));

    if (action.type === "send_response" && action.note) {
      setTriageByTicket((current) => {
        const currentTriage = current[ticket.id] ?? triageState;

        return {
          ...current,
          [ticket.id]: {
            ...currentTriage,
            responseHistory: [
              ...currentTriage.responseHistory,
              {
                message: action.note ?? "",
                timestamp: action.timestamp
              }
            ]
          }
        };
      });
    }

    if (action.type === "escalate" && action.note) {
      setTriageByTicket((current) => {
        const currentTriage = current[ticket.id] ?? triageState;

        return {
          ...current,
          [ticket.id]: {
            ...currentTriage,
            handoff: buildEscalationHandoff(
              ticket,
              recommendation,
              currentTriage,
              action.note ?? "",
              action.timestamp
            )
          }
        };
      });
    }

    if (
      action.type === "close_ticket" &&
      action.note &&
      action.resolutionCategory
    ) {
      setTriageByTicket((current) => {
        const currentTriage = current[ticket.id] ?? triageState;

        return {
          ...current,
          [ticket.id]: {
            ...currentTriage,
            resolution: {
              category: action.resolutionCategory ?? "resolved",
              notes: action.note ?? "",
              timestamp: action.timestamp
            }
          }
        };
      });
    }

    return { valid: true } as const;
  }

  function handleSaveNote(note: string) {
    setNotesByTicket((current) => ({
      ...current,
      [ticket.id]: [...(current[ticket.id] ?? []), note]
    }));
    recordAction("save_note", { note });
  }

  function handleFactChange(key: TriageFactKey, value: string) {
    setTriageByTicket((current) => ({
      ...current,
      [ticket.id]: updateTriageFact(
        current[ticket.id] ?? triageState,
        key,
        value
      )
    }));
  }

  function handleToggleChecklist(stepIndex: number) {
    setTriageByTicket((current) => ({
      ...current,
      [ticket.id]: toggleChecklistStep(current[ticket.id] ?? triageState, stepIndex)
    }));
  }

  function handleResetDemo() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(DEMO_STORAGE_KEY);
    }

    setTickets(sampleTickets);
    setSelectedTicketId(sampleTickets[0].id);
    setQueueFilter("all");
    setApprovalState("pending");
    setActiveNoteTab("notes");
    setActionEventsByTicket({});
    setNotesByTicket({});
    setTriageByTicket({});
    setIntakeErrors({});
  }

  return (
    <AppShell onResetDemo={handleResetDemo}>
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
      <GuidedTriageConsole
        onFactChange={handleFactChange}
        onToggleChecklist={handleToggleChecklist}
        recommendation={recommendation}
        state={triageState}
      />
      <TechnicianActions
        onAction={recordAction}
        onSaveNote={handleSaveNote}
        responseDraft={recommendation.userResponseDraft}
        ticket={ticket}
      />
      <AutomationBlueprint />
      <SecondaryWorkbenchPanels
        activeTab={activeNoteTab}
        onTabChange={setActiveNoteTab}
        recommendation={recommendation}
        savedNotes={notesByTicket[ticket.id] ?? []}
        triageState={triageState}
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

function loadStoredDemoState() {
  if (typeof window === "undefined") {
    return null;
  }

  return parseDemoState(window.localStorage.getItem(DEMO_STORAGE_KEY));
}
