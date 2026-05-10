# TierZero Architecture

## Overview

TierZero uses a two-layer architecture:

1. **Public demo layer:** a safe, static web app that simulates help desk operations with fictional data.
2. **Homelab proof layer:** an optional local stack that can connect to real open-source ITSM and workflow tools.

This split keeps the public portfolio demo easy to review while preserving a credible path toward real IT operations tooling.

## Public Demo Layer

The public demo is the first deliverable. It will run as a static React/Vite app and use deterministic mock data.

```text
Ticket Intake
  -> Triage Engine
  -> User and Asset Lookup
  -> Knowledge Base Match
  -> Recommendation Builder
  -> Human Approval Gate
  -> Audit Timeline
```

The demo intentionally avoids live backend dependencies. This makes it safe to host publicly on GitHub Pages, Cloudflare Pages, Netlify, or Vercel.

## Homelab Proof Layer

The homelab layer is planned after the public demo is working.

```text
GLPI
  -> tickets
  -> users
  -> assets
  -> categories
  -> knowledge base

n8n
  -> workflow automation
  -> approval routing
  -> event orchestration

Optional Ollama
  -> local-only classification
  -> local-only summarization
```

The homelab stack is not publicly exposed by default.

## Tool Decisions

### GLPI

GLPI is the preferred ITSM platform for the lab because it combines tickets, assets, users, categories, and knowledge-base workflows in one open-source platform. That makes it a strong fit for entry-level IT/help desk realism.

### n8n

n8n is the preferred workflow automation tool because visual workflows are easier to explain to non-technical reviewers and useful for operations-style automation.

### Static Public Demo

The public demo uses simulated output instead of live API calls. This protects credentials, avoids reliability issues, and keeps the live demo simple for recruiters.

## Core Domain Objects

- `User`
- `Asset`
- `Ticket`
- `Category`
- `KnowledgeBaseArticle`
- `Recommendation`
- `WorkflowRun`
- `AuditEvent`
- `Approval`
- `Escalation`

## Adapter Boundary

The application will keep integration logic behind adapters so the public demo can use mock data and the homelab can later use real tools.

```text
HelpDeskAdapter
AssetAdapter
KnowledgeBaseAdapter
RecommendationAdapter
WorkflowAdapter
AuditAdapter
```

Initial adapters will use mock data. Later adapters can connect to GLPI, n8n, and local-only model tooling.

## Safety Principles

- The public demo uses fictional data only.
- Recommendations are assistive, not authoritative.
- Sensitive actions require human approval.
- No public workflow performs real account or device changes.
- Every recommendation, approval, rejection, and escalation produces an audit event.

## Non-Goals

- Replacing a production ITSM system
- Exposing a homelab publicly
- Performing real account changes
- Requiring Windows Server for the MVP
- Building remote monitoring and management into the first release
- Adding vector search before simpler search proves insufficient
