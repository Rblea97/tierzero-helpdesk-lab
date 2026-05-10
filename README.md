# TierZero: AI-Assisted IT Help Desk Operations Lab

TierZero is a realistic help desk operations lab that shows how Tier 1 support teams can triage tickets, connect user and device context, recommend knowledge-base steps, draft responses, and escalate safely with human approval.

## Live Demo

The public demo will be a static web app with fictional sample data and simulated recommendations. It will not require login, expose API keys, or connect to real user accounts.

## What This Demonstrates

- Intake and triage for realistic IT support tickets
- User, department, and device context linked to each ticket
- Knowledge-base recommendations and Tier 1 troubleshooting checklists
- Human approval before sensitive or automated actions
- Internal notes, user-facing response drafts, and escalation summaries
- Audit timeline for ticket events, recommendations, approvals, and escalations

## Planned Stack

- **React + Vite + TypeScript:** fast static public demo with clean component boundaries
- **Tailwind CSS:** consistent, responsive interface without heavy UI dependencies
- **Static mock data:** safe recruiter-facing demo with no secrets or production systems
- **GLPI:** planned homelab ITSM platform for tickets, assets, users, and knowledge base
- **n8n:** planned visual workflow automation for approval and triage flows
- **Ollama:** optional local-only model runtime for private lab experiments

## MVP Scope

The first version will include:

- Public dashboard
- Sample ticket intake
- Category, priority, and confidence output
- Linked fictional user and asset records
- Knowledge-base recommendation
- Tier 1 checklist
- User response draft
- Internal technician notes
- Escalation summary
- Safety note
- Human approval gate
- Audit timeline
- Architecture page explaining how the demo maps to real tools

## Safety Model

TierZero is designed to show safe IT operations:

- No real user data
- No public API keys
- No real password resets or account changes
- No exposed homelab services
- Simulated public recommendations for reliability and privacy
- Human approval required before sensitive actions
- Audit events for all important workflow decisions

## Real-Tool Roadmap

After the public demo is complete, the homelab version will add:

1. GLPI for ITSM, asset management, users, categories, and knowledge base.
2. n8n for visual workflow automation.
3. Optional local Ollama integration for private classification and summarization tests.
4. Optional ServiceNow or Jira Service Management comparison notes.
5. Optional monitoring/audit dashboard using Grafana and Loki.

Windows Server, Active Directory, and Microsoft 365/Entra integration are optional advanced modules, not MVP requirements.

## Documentation

- [Architecture](ARCHITECTURE.md)
- [Implementation Plan](docs/IMPLEMENTATION_PLAN.md)

## License

MIT License. See [LICENSE](LICENSE).
