# Functional Help Desk Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-only Tier 1 help desk workflow with ticket intake, queue/status changes, technician actions, dynamic metrics, and audit events.

**Architecture:** Keep the public demo static and deterministic. Put ticket intake, queue metrics, status transitions, and technician action rules in focused domain modules, then wire them into React state and presentation components. Preserve the current triage and workbench layout while making the queue interactive.

**Tech Stack:** React 19, Vite 7, TypeScript, Tailwind CSS, Vitest, ESLint, lucide-react.

---

## File Structure

- Modify `src/domain/types.ts`: add intake, queue, technician action, and expanded status types.
- Create `src/domain/tickets.ts`: ticket ID generation, intake validation, ticket creation.
- Create `src/domain/queue.ts`: queue filtering and metric derivation.
- Create `src/domain/actions.ts`: technician status transitions and audit event generation.
- Modify `src/domain/workflow.ts`: accept generated action events and keep timeline ordering predictable.
- Create `src/domain/tickets.test.ts`: intake and ticket creation tests.
- Create `src/domain/queue.test.ts`: filter and metric tests.
- Create `src/domain/actions.test.ts`: technician action and audit event tests.
- Modify `src/domain/workflow.test.ts`: timeline tests for generated events.
- Modify `src/data/viewData.ts`: status labels, queue filters, and source labels if needed.
- Modify `src/components/dashboard/MetricStrip.tsx`: render queue-derived metrics instead of fixed metrics.
- Create `src/components/workbench/TicketQueue.tsx`: queue list, filter controls, selected ticket callback.
- Create `src/components/workbench/TicketIntake.tsx`: intake form with inline validation.
- Create `src/components/workbench/TechnicianActions.tsx`: action buttons and note input.
- Modify `src/components/workbench/ScenarioSelector.tsx`: remove or convert to a compact sample-ticket selector if still useful.
- Modify `src/components/workbench/WorkbenchPanels.tsx`: pass saved notes and action-driven checklist state where needed.
- Modify `src/App.tsx`: own queue state, selected ticket state, generated audit events, notes, filters, and action callbacks.
- Modify `README.md`: describe the functional live demo after validation passes.
- Modify `docs/DEMO_SCRIPT.md`: add a step-by-step click path for reviewers.
- Modify `ARCHITECTURE.md`: add the queue workflow boundary if the implementation creates the planned domain modules.

## Task 1: Expand Domain Types

**Files:**
- Modify: `src/domain/types.ts`

- [ ] **Step 1: Add status, intake, metric, and action types**

Update the existing status and add new exported interfaces:

```ts
export type TicketStatus =
  | "new"
  | "triaged"
  | "in_progress"
  | "pending_user"
  | "pending_approval"
  | "escalated"
  | "closed";

export interface TicketIntake {
  title: string;
  description: string;
  requesterId: string;
  assetId?: string;
  source: "portal" | "email" | "phone" | "walkup";
  businessImpact: "low" | "medium" | "high";
}

export interface QueueMetrics {
  openTickets: number;
  highPriority: number;
  pendingUser: number;
  escalated: number;
  closed: number;
}

export type QueueFilter = "all" | TicketStatus;

export type TechnicianActionType =
  | "start_work"
  | "save_note"
  | "send_response"
  | "approve_recommendation"
  | "reject_recommendation"
  | "escalate"
  | "close_ticket";

export interface TechnicianAction {
  type: TechnicianActionType;
  note?: string;
  actorName: string;
  timestamp: string;
}
```

- [ ] **Step 2: Expand `AuditEvent.eventType`**

Add these values to the existing union:

```ts
| "ticket_created"
| "status_changed"
| "technician_note_saved"
| "user_response_sent"
| "ticket_escalated"
| "ticket_closed";
```

- [ ] **Step 3: Run typecheck**

Run:

```powershell
pnpm typecheck
```

Expected: this may fail until later tasks update consumers. Keep the exact errors visible for the next task.

## Task 2: Ticket Intake Domain

**Files:**
- Create: `src/domain/tickets.ts`
- Create: `src/domain/tickets.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/domain/tickets.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { sampleTickets } from "../data/mockData";
import { createTicketFromIntake, getNextTicketId, validateTicketIntake } from "./tickets";
import type { TicketIntake } from "./types";

const validIntake: TicketIntake = {
  title: "VPN cannot connect",
  description: "The VPN client says the tunnel could not be established.",
  requesterId: "usr-morgan-chen",
  assetId: "asset-lap-1188",
  source: "portal",
  businessImpact: "medium"
};

describe("ticket intake", () => {
  it("generates the next fictional incident ID from existing tickets", () => {
    expect(getNextTicketId(sampleTickets)).toBe("TZ-INC-2026-0045");
  });

  it("rejects empty title and description without mutating queue state", () => {
    expect(
      validateTicketIntake({
        ...validIntake,
        title: " ",
        description: ""
      })
    ).toEqual({
      valid: false,
      errors: {
        title: "Enter a short issue title.",
        description: "Describe what the requester is experiencing."
      }
    });
  });

  it("creates a new safe ticket from valid intake", () => {
    const ticket = createTicketFromIntake(validIntake, sampleTickets, "2026-05-11T16:00:00.000Z");

    expect(ticket).toMatchObject({
      id: "TZ-INC-2026-0045",
      title: "VPN cannot connect",
      requesterId: "usr-morgan-chen",
      assetId: "asset-lap-1188",
      priority: "medium",
      status: "new",
      source: "portal",
      createdAt: "2026-05-11T16:00:00.000Z",
      updatedAt: "2026-05-11T16:00:00.000Z"
    });
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```powershell
pnpm test -- src/domain/tickets.test.ts
```

Expected: FAIL because `src/domain/tickets.ts` does not exist.

- [ ] **Step 3: Implement ticket intake helpers**

Create `src/domain/tickets.ts`:

```ts
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

function priorityFromImpact(impact: TicketIntake["businessImpact"]): TicketPriority {
  if (impact === "high") {
    return "high";
  }

  if (impact === "low") {
    return "low";
  }

  return "medium";
}
```

- [ ] **Step 4: Run ticket tests**

Run:

```powershell
pnpm test -- src/domain/tickets.test.ts
```

Expected: PASS.

## Task 3: Queue Domain

**Files:**
- Create: `src/domain/queue.ts`
- Create: `src/domain/queue.test.ts`

- [ ] **Step 1: Write failing queue tests**

Create `src/domain/queue.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```powershell
pnpm test -- src/domain/queue.test.ts
```

Expected: FAIL because `src/domain/queue.ts` does not exist.

- [ ] **Step 3: Implement queue helpers**

Create `src/domain/queue.ts`:

```ts
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
```

- [ ] **Step 4: Run queue tests**

Run:

```powershell
pnpm test -- src/domain/queue.test.ts
```

Expected: PASS.

## Task 4: Technician Actions Domain

**Files:**
- Create: `src/domain/actions.ts`
- Create: `src/domain/actions.test.ts`

- [ ] **Step 1: Write failing action tests**

Create `src/domain/actions.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```powershell
pnpm test -- src/domain/actions.test.ts
```

Expected: FAIL because `src/domain/actions.ts` does not exist.

- [ ] **Step 3: Implement action reducer**

Create `src/domain/actions.ts`:

```ts
import type { AuditEvent, TechnicianAction, Ticket, TicketStatus } from "./types";
import { titleCase } from "../lib/format";

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
```

- [ ] **Step 4: Run action tests**

Run:

```powershell
pnpm test -- src/domain/actions.test.ts
```

Expected: PASS.

## Task 5: Timeline Composition

**Files:**
- Modify: `src/domain/workflow.ts`
- Modify: `src/domain/workflow.test.ts`

- [ ] **Step 1: Update tests for generated action events**

Add this test to `src/domain/workflow.test.ts`:

```ts
it("includes generated technician action events after base workflow events", () => {
  const timeline = buildTimeline(sampleTickets[0], "pending", [
    {
      id: "audit-extra",
      ticketId: sampleTickets[0].id,
      actorType: "technician",
      actorName: "Avery Stone",
      eventType: "status_changed",
      message: "Status changed to In Progress.",
      timestamp: "2026-05-11T16:30:00.000Z"
    }
  ]);

  expect(timeline[timeline.length - 1]).toMatchObject({
    id: "audit-extra",
    eventType: "status_changed"
  });
});
```

- [ ] **Step 2: Run workflow test to verify failure**

Run:

```powershell
pnpm test -- src/domain/workflow.test.ts
```

Expected: FAIL because `buildTimeline` accepts only two arguments.

- [ ] **Step 3: Update `buildTimeline` signature**

Change the function signature and return:

```ts
export function buildTimeline(
  ticket: Ticket,
  approvalState: ApprovalState,
  actionEvents: AuditEvent[] = []
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

  return [...baseEvents, ...generatedEvents, ...actionEvents].filter(
    (event) => event.ticketId === ticket.id
  );
}
```

- [ ] **Step 4: Run workflow tests**

Run:

```powershell
pnpm test -- src/domain/workflow.test.ts
```

Expected: PASS.

## Task 6: Queue Metrics UI

**Files:**
- Modify: `src/components/dashboard/MetricStrip.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Inspect current metric component**

Run:

```powershell
Get-Content -LiteralPath 'src\components\dashboard\MetricStrip.tsx'
```

Expected: confirm whether it currently imports static metrics from `viewData.ts`.

- [ ] **Step 2: Make `MetricStrip` accept metrics as props**

Update the component to accept:

```ts
import type { QueueMetrics } from "../../domain/types";

export function MetricStrip({ metrics }: { metrics: QueueMetrics }) {
  const metricCards = [
    { label: "Open Tickets", value: metrics.openTickets.toString() },
    { label: "High Priority", value: metrics.highPriority.toString() },
    { label: "Pending User", value: metrics.pendingUser.toString() },
    { label: "Escalated", value: metrics.escalated.toString() },
    { label: "Closed", value: metrics.closed.toString() }
  ];

  return (
    <section className="grid gap-3 md:grid-cols-5">
      {metricCards.map((metric) => (
        <div className="rounded-md border border-slate-200 bg-white p-4" key={metric.label}>
          <p className="text-xs font-medium uppercase text-slate-500">{metric.label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{metric.value}</p>
        </div>
      ))}
    </section>
  );
}
```

Adapt class names to match the current file instead of forcing an unrelated visual rewrite.

- [ ] **Step 3: Wire basic metrics in `App.tsx`**

Import `getQueueMetrics`, initialize `tickets` from `sampleTickets`, derive metrics, and pass them:

```ts
const [tickets, setTickets] = useState<Ticket[]>(sampleTickets);
const metrics = useMemo(() => getQueueMetrics(tickets), [tickets]);
```

Use:

```tsx
<MetricStrip metrics={metrics} />
```

- [ ] **Step 4: Run checks**

Run:

```powershell
pnpm typecheck
pnpm test
```

Expected: PASS.

## Task 7: Ticket Queue Component

**Files:**
- Create: `src/components/workbench/TicketQueue.tsx`
- Modify: `src/App.tsx`
- Modify: `src/data/viewData.ts`

- [ ] **Step 1: Add queue filter labels**

In `src/data/viewData.ts`, add:

```ts
import type { QueueFilter } from "../domain/types";

export const queueFilters: { id: QueueFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "in_progress", label: "In Progress" },
  { id: "pending_user", label: "Pending User" },
  { id: "escalated", label: "Escalated" },
  { id: "closed", label: "Closed" }
];
```

- [ ] **Step 2: Create `TicketQueue.tsx`**

Create a compact queue component:

```tsx
import { Inbox } from "lucide-react";
import { queueFilters } from "../../data/viewData";
import type { QueueFilter, Ticket } from "../../domain/types";
import { formatTime, titleCase } from "../../lib/format";
import { Panel } from "../ui/Panel";

export function TicketQueue({
  filter,
  onFilterChange,
  onSelectTicket,
  selectedTicketId,
  tickets
}: {
  filter: QueueFilter;
  onFilterChange: (filter: QueueFilter) => void;
  onSelectTicket: (ticketId: string) => void;
  selectedTicketId: string;
  tickets: Ticket[];
}) {
  return (
    <Panel title="Ticket Queue">
      <div className="flex flex-wrap gap-2">
        {queueFilters.map((option) => (
          <button
            className={`h-8 rounded-md border px-3 text-sm font-medium ${
              filter === option.id
                ? "border-cyan-600 bg-cyan-50 text-cyan-800"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
            key={option.id}
            onClick={() => onFilterChange(option.id)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-2">
        {tickets.length === 0 ? (
          <div className="flex items-center gap-2 rounded-md border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            <Inbox size={16} />
            No tickets match this filter.
          </div>
        ) : (
          tickets.map((ticket) => (
            <button
              className={`rounded-md border p-3 text-left ${
                selectedTicketId === ticket.id
                  ? "border-cyan-600 bg-cyan-50"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
              key={ticket.id}
              onClick={() => onSelectTicket(ticket.id)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500">{ticket.id}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{ticket.title}</p>
                </div>
                <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
                  {titleCase(ticket.status)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>{titleCase(ticket.priority)} priority</span>
                <span>{formatTime(ticket.updatedAt)}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </Panel>
  );
}
```

- [ ] **Step 3: Wire queue state in `App.tsx`**

Import `TicketQueue`, `getVisibleTickets`, and `QueueFilter`. Add:

```ts
const [queueFilter, setQueueFilter] = useState<QueueFilter>("all");
const visibleTickets = useMemo(
  () => getVisibleTickets(tickets, queueFilter),
  [tickets, queueFilter]
);
```

Render above the workbench:

```tsx
<TicketQueue
  filter={queueFilter}
  onFilterChange={setQueueFilter}
  onSelectTicket={handleTicketChange}
  selectedTicketId={selectedTicketId}
  tickets={visibleTickets}
/>
```

- [ ] **Step 4: Run checks**

Run:

```powershell
pnpm typecheck
pnpm lint
```

Expected: PASS.

## Task 8: Ticket Intake UI

**Files:**
- Create: `src/components/workbench/TicketIntake.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `TicketIntake.tsx`**

Create:

```tsx
import { FormEvent, useState } from "react";
import { assets, users } from "../../data/mockData";
import type { TicketIntake as TicketIntakeModel } from "../../domain/types";
import { Panel } from "../ui/Panel";

const initialDraft: TicketIntakeModel = {
  title: "",
  description: "",
  requesterId: users[0]?.id ?? "",
  assetId: assets[0]?.id,
  source: "portal",
  businessImpact: "medium"
};

export function TicketIntake({
  errors,
  onSubmit
}: {
  errors: Record<string, string | undefined>;
  onSubmit: (intake: TicketIntakeModel) => boolean;
}) {
  const [draft, setDraft] = useState<TicketIntakeModel>(initialDraft);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const created = onSubmit(draft);

    if (created) {
      setDraft(initialDraft);
    }
  }

  return (
    <Panel title="Ticket Intake">
      <form className="grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700">Requester</span>
          <select
            className="h-10 rounded-md border border-slate-300 px-3"
            onChange={(event) =>
              setDraft((current) => ({ ...current, requesterId: event.target.value }))
            }
            value={draft.requesterId}
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} - {user.department}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700">Linked Asset</span>
          <select
            className="h-10 rounded-md border border-slate-300 px-3"
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                assetId: event.target.value || undefined
              }))
            }
            value={draft.assetId ?? ""}
          >
            <option value="">No linked asset</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.assetTag} - {asset.model}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm md:col-span-2">
          <span className="font-medium text-slate-700">Issue Title</span>
          <input
            className="h-10 rounded-md border border-slate-300 px-3"
            onChange={(event) =>
              setDraft((current) => ({ ...current, title: event.target.value }))
            }
            value={draft.title}
          />
          {errors.title ? <span className="text-xs text-red-700">{errors.title}</span> : null}
        </label>
        <label className="grid gap-1 text-sm md:col-span-2">
          <span className="font-medium text-slate-700">Description</span>
          <textarea
            className="min-h-24 rounded-md border border-slate-300 p-3"
            onChange={(event) =>
              setDraft((current) => ({ ...current, description: event.target.value }))
            }
            value={draft.description}
          />
          {errors.description ? (
            <span className="text-xs text-red-700">{errors.description}</span>
          ) : null}
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700">Source</span>
          <select
            className="h-10 rounded-md border border-slate-300 px-3"
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                source: event.target.value as TicketIntakeModel["source"]
              }))
            }
            value={draft.source}
          >
            <option value="portal">Portal</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="walkup">Walk-up</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700">Business Impact</span>
          <select
            className="h-10 rounded-md border border-slate-300 px-3"
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                businessImpact: event.target.value as TicketIntakeModel["businessImpact"]
              }))
            }
            value={draft.businessImpact}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <div className="md:col-span-2">
          <button
            className="h-10 rounded-md bg-cyan-700 px-4 text-sm font-semibold text-white hover:bg-cyan-800"
            type="submit"
          >
            Create Ticket
          </button>
        </div>
      </form>
    </Panel>
  );
}
```

- [ ] **Step 2: Wire intake in `App.tsx`**

Add state:

```ts
const [intakeErrors, setIntakeErrors] = useState<Record<string, string | undefined>>({});
```

Add handler:

```ts
function handleCreateTicket(intake: TicketIntake): boolean {
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
  return true;
}
```

Render:

```tsx
<TicketIntake errors={intakeErrors} onSubmit={handleCreateTicket} />
```

- [ ] **Step 3: Run checks**

Run:

```powershell
pnpm typecheck
pnpm lint
pnpm test
```

Expected: PASS.

## Task 9: Technician Actions UI

**Files:**
- Create: `src/components/workbench/TechnicianActions.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `TechnicianActions.tsx`**

Create:

```tsx
import { useState } from "react";
import type { TechnicianActionType, Ticket } from "../../domain/types";
import { Panel } from "../ui/Panel";

const actionButtons: { type: TechnicianActionType; label: string }[] = [
  { type: "start_work", label: "Start Work" },
  { type: "send_response", label: "Send Response" },
  { type: "approve_recommendation", label: "Approve" },
  { type: "reject_recommendation", label: "Reject" },
  { type: "escalate", label: "Escalate" },
  { type: "close_ticket", label: "Close" }
];

export function TechnicianActions({
  onAction,
  onSaveNote,
  ticket
}: {
  onAction: (type: TechnicianActionType) => void;
  onSaveNote: (note: string) => void;
  ticket: Ticket;
}) {
  const [note, setNote] = useState("");
  const closed = ticket.status === "closed";

  return (
    <Panel title="Technician Actions">
      <div className="grid gap-2 sm:grid-cols-3">
        {actionButtons.map((action) => (
          <button
            className="h-10 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={closed && action.type !== "save_note"}
            key={action.type}
            onClick={() => onAction(action.type)}
            type="button"
          >
            {action.label}
          </button>
        ))}
      </div>
      <label className="mt-4 grid gap-2 text-sm">
        <span className="font-medium text-slate-700">Internal Note</span>
        <textarea
          className="min-h-24 rounded-md border border-slate-300 p-3"
          onChange={(event) => setNote(event.target.value)}
          placeholder="Document verification, troubleshooting, or escalation context."
          value={note}
        />
      </label>
      <button
        className="mt-3 h-10 rounded-md border border-cyan-600 px-4 text-sm font-semibold text-cyan-700 hover:bg-cyan-50"
        onClick={() => {
          if (note.trim()) {
            onSaveNote(note.trim());
            setNote("");
          }
        }}
        type="button"
      >
        Save Note
      </button>
    </Panel>
  );
}
```

If TypeScript flags the `action.type !== "save_note"` comparison, simplify `disabled={closed}` because save note is not in `actionButtons`.

- [ ] **Step 2: Wire action state in `App.tsx`**

Add:

```ts
const [actionEventsByTicket, setActionEventsByTicket] = useState<Record<string, AuditEvent[]>>({});
const [notesByTicket, setNotesByTicket] = useState<Record<string, string[]>>({});
```

Add helper:

```ts
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
```

Add note handler:

```ts
function handleSaveNote(note: string) {
  setNotesByTicket((current) => ({
    ...current,
    [ticket.id]: [...(current[ticket.id] ?? []), note]
  }));
  recordAction("save_note", note);
}
```

Render:

```tsx
<TechnicianActions
  onAction={(actionType) => recordAction(actionType)}
  onSaveNote={handleSaveNote}
  ticket={ticket}
/>
```

- [ ] **Step 3: Pass generated events into timeline**

Change timeline derivation:

```ts
const timeline = buildTimeline(
  ticket,
  approvalState,
  actionEventsByTicket[ticket.id] ?? []
);
```

- [ ] **Step 4: Run checks**

Run:

```powershell
pnpm typecheck
pnpm test
pnpm lint
```

Expected: PASS.

## Task 10: Integrate Notes and Existing Approval Gate

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/workbench/WorkbenchPanels.tsx`
- Modify: `src/components/workbench/ApprovalGate.tsx` if needed

- [ ] **Step 1: Keep approval gate and action state consistent**

Update approval handlers:

```tsx
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
```

Remove duplicate approve/reject buttons from `TechnicianActions` if the UI feels redundant after this wiring.

- [ ] **Step 2: Show saved internal notes**

Update `SecondaryWorkbenchPanels` props to accept:

```ts
savedNotes: string[];
```

In `NotesPanel`, render saved notes above or below the recommendation note:

```tsx
{savedNotes.length > 0 ? (
  <div className="mb-4 space-y-2">
    {savedNotes.map((note, index) => (
      <p className="rounded-md border border-slate-200 bg-white p-3" key={`${note}-${index}`}>
        {note}
      </p>
    ))}
  </div>
) : null}
```

Pass from `App.tsx`:

```tsx
savedNotes={notesByTicket[ticket.id] ?? []}
```

- [ ] **Step 3: Reset local UI state on ticket change**

Keep existing reset behavior:

```ts
setApprovalState("pending");
setActiveNoteTab("notes");
```

Do not clear saved action events or notes when changing tickets.

- [ ] **Step 4: Run checks**

Run:

```powershell
pnpm typecheck
pnpm test
pnpm lint
```

Expected: PASS.

## Task 11: Documentation Update

**Files:**
- Modify: `README.md`
- Modify: `docs/DEMO_SCRIPT.md`
- Modify: `ARCHITECTURE.md`

- [ ] **Step 1: Update README key features**

Add or adjust bullets so they mention:

```md
- Create fictional support tickets through an interactive intake form
- Work tickets through queue states such as New, In Progress, Pending User, Escalated, and Closed
- Capture technician notes, approvals, escalations, and closure events in the audit timeline
```

- [ ] **Step 2: Update demo workflow**

In `README.md`, describe the new click path:

```md
The demo now lets a reviewer create a fictional ticket, select it from the queue, run deterministic triage, save an internal note, send a safe user response, escalate or close the ticket, and review the audit timeline.
```

- [ ] **Step 3: Update `docs/DEMO_SCRIPT.md`**

Add a short reviewer script:

```md
## Functional Demo Path

1. Open the live demo.
2. Create a fictional VPN or printer ticket from Ticket Intake.
3. Select the new ticket in Ticket Queue.
4. Click Start Work.
5. Save an internal note documenting the first Tier 1 check.
6. Send Response or Escalate depending on the scenario.
7. Confirm the status badge, metrics, and audit timeline changed.
```

- [ ] **Step 4: Update architecture if modules were added**

Add:

```md
## Queue Workflow Boundary

The public demo keeps queue behavior in local domain modules for ticket creation, queue metrics, and technician actions. This keeps React components focused on rendering while preserving a future path to map the same concepts to GLPI tickets, GLPI assets, and n8n workflow events in a private homelab layer.
```

- [ ] **Step 5: Run docs-aware checks**

Run:

```powershell
pnpm lint
pnpm build
```

Expected: PASS.

## Task 12: Browser QA and Final Validation

**Files:**
- No source files unless QA finds issues.

- [ ] **Step 1: Run full local validation**

Run:

```powershell
pnpm typecheck
pnpm test
pnpm lint
pnpm build
```

Expected: all commands PASS.

- [ ] **Step 2: Start local preview**

Run:

```powershell
pnpm dev
```

Expected: Vite starts and prints a localhost URL.

- [ ] **Step 3: Browser QA path**

Use Browser or Playwright to verify:

- Page loads without console errors.
- Existing sample ticket can still be selected.
- New ticket can be created from intake.
- New ticket appears in queue.
- Queue filter works for at least one status.
- Start Work changes status to `In Progress`.
- Saving a note displays it in Technician Workspace.
- Send Response changes status to `Pending User`.
- Escalate or Close changes status and metrics.
- Audit timeline includes action events.
- Mobile viewport has no broken overlapping text.

- [ ] **Step 4: Review git diff**

Run:

```powershell
git status --short
git diff --check
git diff -- README.md ARCHITECTURE.md docs/DEMO_SCRIPT.md src
```

Expected:

- No whitespace errors.
- No private context files.
- No secrets.
- Diff only includes planned files.

- [ ] **Step 5: Commit on feature branch**

Run:

```powershell
git add README.md ARCHITECTURE.md docs/DEMO_SCRIPT.md src
git commit -m "feat: add functional help desk demo workflow"
```

Expected: commit succeeds on a `codex/` feature branch, not `main`.

## Plan Self-Review

- Spec coverage: the plan covers intake, queue filters, status changes, technician actions, generated audit events, metrics, tests, docs, and browser QA.
- Scope control: real GLPI, n8n, Snipe-IT, Zammad, Microsoft 365, Entra, email, auth, and persistence are intentionally excluded.
- Type consistency: new names are `TicketIntake`, `QueueMetrics`, `QueueFilter`, `TechnicianAction`, `TechnicianActionType`, `getNextTicketId`, `createTicketFromIntake`, `getVisibleTickets`, `getQueueMetrics`, and `applyTechnicianAction`.
- Validation: implementation is not complete until typecheck, tests, lint, build, browser QA, and diff review pass.

## Execution Options

Plan complete and saved to `docs/superpowers/plans/2026-05-11-functional-helpdesk-demo.md`. Two execution options:

1. **Subagent-Driven (recommended)** - dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - execute tasks in this session using executing-plans, batch execution with checkpoints for review.

Choose one only after reviewing and approving this plan.
