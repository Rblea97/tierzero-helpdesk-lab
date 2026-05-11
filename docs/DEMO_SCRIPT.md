# TierZero Demo Script

This script is written for a 2-3 minute portfolio walkthrough with a recruiter, hiring manager, or IT support supervisor.

## Opening

TierZero is a safe IT help desk operations lab. It shows how a Tier 1 technician can receive a ticket, collect the facts a real ticket needs, connect user and device context, use a knowledge base, draft a response, escalate when needed, and close with documentation. The point is not AI replacing support. The point is AI-assisted triage with human approval and auditability.

## Walkthrough

1. Start on the dashboard and point out the operational metrics: open tickets, high priority, pending user, escalated, and closed.
2. Create a fictional VPN or printer ticket from Ticket Intake.
3. Select the new ticket in Ticket Queue and show that the workbench updates to that ticket.
4. Show the generated ticket category, priority, confidence score, linked user, linked department, and assigned asset.
5. Open the recommended knowledge-base article summary and explain that the public demo uses deterministic mock output for safety.
6. Fill the guided triage fields: scope, exact error, impact, verification, and attempted fixes.
7. Complete several Tier 1 checklist steps and point out the progress counter.
8. Click Start Work and point out the status change and audit event.
9. Save an internal note documenting the first Tier 1 check.
10. Click Send Response, then show the ticket moving to Pending User.
11. For a security or unresolved scenario, add an escalation reason and click Escalate to produce a handoff package.
12. For a resolved scenario, add resolution notes, choose a closure category, and close the ticket.
13. Refresh the page to show the browser persisted the demo state, then use Reset Demo if needed.
14. Confirm the status badge, metrics, saved note, handoff or closure details, and audit timeline changed.

## Functional Demo Path

1. Open the live demo.
2. Create a fictional VPN or printer ticket from Ticket Intake.
3. Select the new ticket in Ticket Queue.
4. Fill required triage facts and complete checklist items.
5. Click Start Work.
6. Save an internal note documenting the first Tier 1 check.
7. Send Response, Escalate, or Close depending on the scenario.
8. Refresh the page to confirm the demo state persists.
9. Confirm the status badge, metrics, handoff or closure details, and audit timeline changed.

## Scenario-Specific Triage Path

1. Use **Reset Demo** to start from the seed queue.
2. Create a ticket titled `VPN will not connect before shift handoff`.
3. Use this description: `The VPN client fails with an authentication error. The user can sign in to Microsoft 365, but cannot reach the shared drive needed for a 2 PM finance deadline.`
4. Confirm TierZero classifies it as **VPN / Remote Access**, not generic Microsoft 365 authentication.
5. Fill the required facts, start work, review the VPN KB recommendation, send the drafted response, and refresh to show browser-local persistence.
6. Reset the demo before ending the presentation.

## Hiring Manager Talking Points

- The demo models realistic help desk discipline: documentation, escalation, asset context, and safe approval.
- The public version does not touch real users, credentials, APIs, or production systems.
- The guided triage console shows ticketing basics: impact, scope, exact error, verification, attempted fixes, notes, and resolution.
- The automation blueprint shows how the same workflow can map to n8n, GLPI tickets/assets, and future local-only model tooling.
- The architecture separates mock adapters from future GLPI, n8n, and local-only Ollama integrations.

## Close

TierZero is intentionally scoped: a polished public demo first, then a private homelab proof path. That keeps the project understandable to recruiters while still showing credible IT operations architecture.
