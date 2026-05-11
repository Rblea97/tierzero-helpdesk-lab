# Functional Help Desk Demo Design

## Purpose

TierZero's next slice will turn the public demo from a mostly static workbench into a clickable Tier 1 help desk workflow. A reviewer should be able to create a fictional ticket, see it enter a queue, triage it, update its status, take technician actions, and watch the audit timeline change.

The feature remains a static browser-only demo. It must not require login, store real data, call live APIs, or connect to real help desk systems.

## Audience

The primary audience is entry-level IT support hiring reviewers. The workflow should show practical Tier 1 habits: clear intake, categorization, priority, user and asset context, KB-driven troubleshooting, internal notes, escalation discipline, and human approval.

## Scope

### Included

- A ticket intake form for fictional help desk requests.
- Queue state held in React state for the current browser session.
- Queue filters for `New`, `In Progress`, `Pending User`, `Escalated`, and `Closed`.
- Ticket selection from the queue.
- Technician actions:
  - Start work.
  - Save internal note.
  - Send user response.
  - Approve recommendation.
  - Reject recommendation.
  - Escalate to Tier 2.
  - Close ticket.
- Generated audit events for intake, triage, status changes, notes, responses, approvals, rejections, escalations, and closures.
- Dynamic metrics based on the current queue.
- Focused domain tests for ticket intake, status transitions, technician actions, audit events, and metric calculation.
- README and demo script updates after the feature works.

### Excluded

- Real account changes, password resets, endpoint actions, or email sending.
- Live GLPI, n8n, Snipe-IT, Zammad, ServiceNow, Microsoft 365, or Entra integration.
- Authentication or user persistence.
- Browser storage persistence.
- Drag-and-drop queue management.
- Backend APIs.

## Real-Tool Alignment

The public demo should use concepts that map cleanly to free or open-source IT workflows without depending on them:

- GLPI remains the preferred future homelab target because it combines tickets, users, assets, categories, and knowledge-base workflows.
- n8n remains a future local workflow automation layer for approval routing and event orchestration.
- Snipe-IT and Zammad are useful comparison or alternative tools, but they should not be added to this public slice.

This slice will keep names generic in the UI, while `ARCHITECTURE.md` and README can mention that the mock workflow is shaped to map to GLPI-style ITSM records later.

## Domain Model

The existing `Ticket`, `Recommendation`, and `AuditEvent` concepts will be extended without replacing the current triage logic.

New or expanded concepts:

- `TicketStatus`: expand from the current set to include `in_progress`, `pending_user`, and `resolved` or standardize on `closed`.
- `TechnicianAction`: a typed command describing what the technician did.
- `TicketIntake`: the form input before a ticket exists.
- `QueueMetrics`: counts for open tickets, high-priority tickets, escalated tickets, pending-user tickets, and closed tickets.
- `TicketRecord`: a stateful view of a ticket plus generated recommendation, audit events, and technician note drafts if this proves clearer than spreading state across components.

The implementation should prefer small domain helpers over embedding status rules directly in React components.

## Workflow

1. The app loads with the existing sample tickets in a queue.
2. The user can select any ticket from the queue.
3. The selected ticket appears in the current workbench layout.
4. The user can submit a new fictional request through intake.
5. The app generates the next ticket ID, applies deterministic triage, and appends audit events.
6. The technician can start work, save notes, send a response, approve or reject the recommendation, escalate, or close the ticket.
7. Each action changes ticket state where appropriate and adds an audit event.
8. Queue filters and metrics update from current state.

## UI Design

The first screen should remain the actual operations console, not a landing page.

The likely layout:

- Keep `AppShell`, `MetricStrip`, `TriageHeader`, existing workbench panels, and `ApprovalGate`.
- Replace or supplement `ScenarioSelector` with a queue/intake area.
- Add a compact left or top queue section that shows ticket ID, priority, status, requester, and age.
- Add an intake panel or modal-like inline form that can be opened from the queue area.
- Add technician action controls near the technician workspace and approval gate.

The UI should feel like an operational help desk tool: dense, readable, and repeatable. Avoid decorative hero sections or marketing copy.

## Data Flow

React state in `App.tsx` or a small custom hook should own the queue for this slice:

- Initialize queue from `sampleTickets`.
- Store selected ticket ID.
- Store generated audit events by ticket ID.
- Store technician notes by ticket ID.
- Derive the selected ticket, recommendation, timeline, and metrics.
- Pass typed callbacks to presentation components.

No external state manager is needed.

## Error Handling

The intake form should prevent empty title and description submissions. When a required field is missing, show an inline validation message and keep the draft intact.

If the selected ticket is no longer available because of a state transition or filter, the app should select the first visible ticket or fall back to the first ticket in the queue.

Technician actions should be disabled when they do not apply. For example, closing an already closed ticket should not create duplicate closure events.

## Testing

Tests should focus on domain behavior first:

- Creating a ticket from intake generates a safe fictional ID and `new` status.
- Triage still works for existing categories and new submitted text.
- Status actions produce the correct status transition.
- Technician actions append predictable audit events.
- Queue metrics are derived from ticket state.
- Invalid intake is rejected without mutating the queue.

Browser QA should follow implementation:

- Create a ticket.
- Filter/select it in the queue.
- Move it through at least two statuses.
- Add a note.
- Escalate or close it.
- Confirm the audit timeline and metrics update.

## Documentation Updates

After implementation, update:

- `README.md` key features and demo workflow.
- `docs/DEMO_SCRIPT.md` with a recruiter-friendly click path.
- `ARCHITECTURE.md` only if the implementation introduces a meaningful new boundary such as a queue workflow module.

## Acceptance Criteria

- A reviewer can create a fictional ticket in the live demo.
- The created ticket appears in the queue without reloading.
- Queue status changes visibly affect the workbench and metrics.
- Technician actions append audit events.
- No real credentials, real users, or live external systems are involved.
- Existing static sample scenarios still work.
- Typecheck, tests, lint, and build pass.
