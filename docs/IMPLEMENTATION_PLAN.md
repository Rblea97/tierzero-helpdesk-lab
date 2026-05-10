# TierZero Implementation Plan

## Goal

Build the public portfolio demo first, then add the real-tool homelab path after the demo clearly communicates realistic Tier 1 help desk operations.

## Phase 1: Project Foundation

- Initialize the frontend project with React, Vite, TypeScript, and Tailwind CSS.
- Add linting, formatting, and basic test tooling.
- Create the initial folder structure.
- Add public-facing documentation, architecture notes, and license.

## Phase 2: Mock Domain Data

- Create fictional users, departments, managers, and account states.
- Create fictional assets with asset tags, device types, warranty status, and assigned users.
- Create sample tickets for common Tier 1 scenarios.
- Create knowledge-base articles and troubleshooting checklists.
- Create audit event examples.

## Phase 3: Demo Workflow

- Build the dashboard view.
- Build ticket intake and sample scenario selection.
- Generate realistic ticket IDs.
- Classify ticket category, priority, and confidence using deterministic logic.
- Link tickets to user and asset context.
- Recommend a knowledge-base article.
- Produce Tier 1 troubleshooting steps.
- Produce user-facing response and internal technician notes.
- Produce escalation summary and safety note.
- Add approve/reject behavior and audit timeline updates.

## Phase 4: Portfolio Polish

- Add architecture page inside the demo.
- Add screenshots and a short demo script.
- Update README with live demo link, setup steps, and project explanation.
- Add a "Challenges and Solutions" section after implementation decisions are known.

## Phase 5: Homelab Proof Path

- Add Docker/Podman Compose notes for GLPI and n8n.
- Add sample n8n workflow exports.
- Add GLPI setup notes and screenshots.
- Add adapter design notes for future GLPI and n8n integration.
- Add optional local Ollama notes only after the core demo is complete.

## Validation

Before a public release:

- Run TypeScript checks.
- Run linting.
- Run unit tests for triage behavior.
- Validate the main demo flow in a browser.
- Check responsive layout on desktop and mobile widths.
- Review the repo for secrets and non-public planning artifacts.
- Confirm README can be scanned in under 60 seconds.

## Initial Demo Scenarios

- Microsoft 365 / Outlook MFA issue
- Printer offline
- VPN connection failure
- Phishing report
- New user onboarding
- Software install request

## Out of Scope for MVP

- Windows Server or Active Directory
- Real Entra ID or Microsoft Graph integration
- Public backend APIs
- Live LLM calls in the public demo
- Real GLPI or n8n calls from the public demo
- MeshCentral or RMM workflows
- Vector search
