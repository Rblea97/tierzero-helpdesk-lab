import { useMemo, useState } from "react";
import { MetricStrip } from "./components/dashboard/MetricStrip";
import { AppShell } from "./components/layout/AppShell";
import { ApprovalGate } from "./components/workbench/ApprovalGate";
import {
  PrimaryWorkbenchPanels,
  SecondaryWorkbenchPanels
} from "./components/workbench/WorkbenchPanels";
import { ScenarioSelector } from "./components/workbench/ScenarioSelector";
import { TriageHeader } from "./components/workbench/TriageHeader";
import { sampleTickets } from "./data/mockData";
import { triageTicket } from "./domain/triage";
import type { Ticket } from "./domain/types";
import { buildTimeline } from "./domain/workflow";
import type { ApprovalState, NoteTab } from "./domain/workflow";

export function App() {
  const [selectedTicketId, setSelectedTicketId] = useState(sampleTickets[0].id);
  const [approvalState, setApprovalState] =
    useState<ApprovalState>("pending");
  const [activeNoteTab, setActiveNoteTab] = useState<NoteTab>("notes");

  const ticket = sampleTickets.find(
    (candidate) => candidate.id === selectedTicketId
  ) as Ticket;
  const recommendation = useMemo(() => triageTicket(ticket), [ticket]);
  const timeline = buildTimeline(ticket, approvalState);

  function handleTicketChange(ticketId: string) {
    setSelectedTicketId(ticketId);
    setApprovalState("pending");
    setActiveNoteTab("notes");
  }

  return (
    <AppShell>
      <MetricStrip />
      <ScenarioSelector onTicketChange={handleTicketChange} ticket={ticket} />
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
