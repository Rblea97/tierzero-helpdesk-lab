# TierZero Demo Script

This script is written for a 2-3 minute portfolio walkthrough with a recruiter, hiring manager, or IT support supervisor.

## Opening

TierZero is a safe IT help desk operations lab. It shows how a Tier 1 technician can receive a ticket, connect user and device context, use a knowledge base, draft a response, and escalate when needed. The point is not AI replacing support. The point is AI-assisted triage with human approval and auditability.

## Walkthrough

1. Start on the dashboard and point out the operational metrics: open tickets, approval queue, SLA risk, and escalation rate.
2. Select the Microsoft 365 MFA scenario.
3. Show the generated ticket category, priority, confidence score, linked user, linked department, and assigned laptop.
4. Open the recommended knowledge-base article summary and explain that the public demo uses deterministic mock output for safety.
5. Review the Tier 1 checklist and call out the identity verification and escalation criteria.
6. Show the drafted user response, internal technician notes, and Tier 2 escalation summary.
7. Use the approval gate to approve or reject the recommendation.
8. Show the audit timeline updating with the technician decision.

## Hiring Manager Talking Points

- The demo models realistic help desk discipline: documentation, escalation, asset context, and safe approval.
- The public version does not touch real users, credentials, APIs, or production systems.
- The architecture separates mock adapters from future GLPI, n8n, and local-only Ollama integrations.
- The next homelab phase would connect GLPI tickets/assets and n8n workflow events behind the same adapter boundary.

## Close

TierZero is intentionally scoped: a polished public demo first, then a private homelab proof path. That keeps the project understandable to recruiters while still showing credible IT operations architecture.
