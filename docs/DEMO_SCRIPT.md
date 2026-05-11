# TierZero Demo Script

This script is written for a 2-3 minute portfolio walkthrough with a recruiter, hiring manager, or IT support supervisor.

## Opening

TierZero is a safe IT help desk operations lab. It shows how a Tier 1 technician can receive a ticket, connect user and device context, use a knowledge base, draft a response, and escalate when needed. The point is not AI replacing support. The point is AI-assisted triage with human approval and auditability.

## Walkthrough

1. Start on the dashboard and point out the operational metrics: open tickets, high priority, pending user, escalated, and closed.
2. Create a fictional VPN or printer ticket from Ticket Intake.
3. Select the new ticket in Ticket Queue and show that the workbench updates to that ticket.
4. Show the generated ticket category, priority, confidence score, linked user, linked department, and assigned asset.
5. Open the recommended knowledge-base article summary and explain that the public demo uses deterministic mock output for safety.
6. Click Start Work and point out the status change and audit event.
7. Save an internal note documenting the first Tier 1 check.
8. Click Send Response or Escalate depending on the scenario.
9. Use the approval gate to approve or reject the recommendation if the scenario requires it.
10. Confirm the status badge, metrics, saved note, and audit timeline changed.

## Functional Demo Path

1. Open the live demo.
2. Create a fictional VPN or printer ticket from Ticket Intake.
3. Select the new ticket in Ticket Queue.
4. Click Start Work.
5. Save an internal note documenting the first Tier 1 check.
6. Send Response or Escalate depending on the scenario.
7. Confirm the status badge, metrics, and audit timeline changed.

## Hiring Manager Talking Points

- The demo models realistic help desk discipline: documentation, escalation, asset context, and safe approval.
- The public version does not touch real users, credentials, APIs, or production systems.
- The architecture separates mock adapters from future GLPI, n8n, and local-only Ollama integrations.
- The next homelab phase would connect GLPI tickets/assets and n8n workflow events behind the same adapter boundary.

## Close

TierZero is intentionally scoped: a polished public demo first, then a private homelab proof path. That keeps the project understandable to recruiters while still showing credible IT operations architecture.
