# Scenario-Specific Triage Intelligence Design

## Summary

TierZero's next MVP slice improves the credibility of the Guided Triage Console by making ticket classification and guidance scenario-specific. The public demo remains static, fictional, and browser-local, but the workflow should feel like a realistic Tier 1 support shift across common categories: Microsoft 365 authentication, VPN/remote access, printing, phishing, and onboarding/service requests.

The immediate live-demo issue is that a VPN ticket mentioning "sign in" can classify as Microsoft 365 / Authentication because broad authentication keywords tie with VPN keywords. This slice fixes that class of issue and carries the chosen category consistently through KB matches, checklist steps, drafted responses, safety flags, notes, and escalation handoff text.

## Goals

- Correctly classify common Tier 1 scenarios even when ticket text contains broad overlapping terms such as "login" or "sign in".
- Prefer specific signals, such as `vpn`, `printer`, `phishing`, and `new hire`, over generic authentication language.
- Keep all recommendations deterministic, fictional, and browser-local.
- Make the visible demo read like real ITSM work: requester, category, priority, SLA, KB article, internal note, safety flag, escalation group, and audit event.
- Add tests that protect the live-demo path and common ambiguous scenario wording.

## Non-Goals

- No real GLPI, ServiceNow, Jira Service Management, Zendesk, n8n, email, directory, or identity-provider integration.
- No backend, database, credentials, external API calls, or real user data.
- No manager dashboard in this slice.
- No broad UI redesign. The existing Guided Triage Console stays the primary experience.

## Architecture

The triage domain remains the source of truth for deterministic recommendations. `triageTicket` should still return the existing `Recommendation` shape, but category selection should use weighted scenario scoring instead of raw keyword counts plus alphabetical tie-breaks.

The workbench UI should continue consuming `Recommendation` without learning scoring internals. Category-specific display copy should live in small helper functions or existing mock-data structures, so scenario copy is easy to review and test without introducing a backend.

## Data Flow

1. A user creates or selects a demo ticket.
2. `triageTicket(ticket)` normalizes title and description text.
3. Weighted category scoring chooses the best scenario.
4. The matched category selects its primary KB article.
5. The recommendation drives the triage checklist, AI Assist, KB panel, response draft, internal notes, safety flags, and escalation summary.
6. Technician actions continue using the persisted browser-local workflow state.

## Classification Rules

- Specific scenario terms carry more weight than broad auth terms.
- Category tie-breaks should use explicit category specificity, not alphabetical names.
- Fallback behavior remains safe and human-approved when no category matches.
- Confidence should still be simple and explainable; it can use the weighted score while preserving a conservative floor and ceiling.

Key ambiguous examples this slice must handle:

- "VPN client fails with authentication error. User can sign in to Microsoft 365 but cannot reach shared drive." -> VPN / Remote Access
- "Suspicious payroll link asks me to sign in." -> Security / Phishing Report
- "Printer login prompt appears but printer is offline." -> Printing
- "New hire needs laptop, VPN, and payroll software access." -> New User Onboarding
- "Outlook asks for MFA and password is rejected." -> Microsoft 365 / Authentication

## UI Behavior

- The Knowledge Base Recommendations panel should show category-relevant adjacent articles rather than M365 fallbacks for every scenario.
- The Drafted Response panel should append category-specific safety guidance:
  - M365/auth: verify identity before reset; never ask for passwords.
  - VPN: do not bypass MFA or conditional access; collect exact client error.
  - Printing: do not remove shared printer configuration without approval.
  - Phishing: do not click, forward broadly, or paste suspicious links into public tools.
  - Onboarding: confirm manager approval and required access list before provisioning.
- AI Triage Summary, technician notes, escalation summaries, and AI Assist should remain consistent with the selected category.

## Testing

- Unit tests for weighted classification and confidence around ambiguous tickets.
- Unit tests for category-specific KB recommendation lists and response safety copy.
- Existing workflow, persistence, and technician-action tests should keep passing.
- Browser QA after implementation should create a VPN ticket with M365 sign-in wording, verify VPN-specific guidance, send response/start work, refresh for persistence, reset demo, check mobile layout, and confirm no console warnings or errors.

## Documentation

Update the README and demo script lightly so reviewers understand the live demo now demonstrates scenario-specific Tier 1 decision support, not generic dashboard routing.
