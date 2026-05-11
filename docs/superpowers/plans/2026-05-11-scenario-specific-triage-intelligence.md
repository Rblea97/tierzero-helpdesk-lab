# Scenario-Specific Triage Intelligence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make TierZero classify common Tier 1 scenarios correctly and carry the selected scenario through KB matches, response drafts, safety guidance, notes, escalation summaries, tests, and demo documentation.

**Architecture:** Keep `src/domain/triage.ts` as the deterministic recommendation boundary. Add small pure helpers for weighted category scoring and category-specific workbench copy so UI components consume simple, testable data without knowing scoring internals.

**Tech Stack:** React, TypeScript, Vite, Vitest, Tailwind CSS, browser `localStorage`, GitHub Pages static deploy.

---

## File Structure

- Modify `src/domain/triage.ts`: replace raw keyword-count scoring with weighted category scoring and explicit specificity tie-breaks.
- Modify `src/domain/triage.test.ts`: add ambiguous scenario tests for VPN/auth, phishing/auth, printing/auth, onboarding, and confidence behavior.
- Modify `src/data/mockData.ts`: add the missing onboarding KB article and tune category keyword lists only where they improve realistic matching.
- Modify `src/components/workbench/WorkbenchPanels.tsx`: make KB recommendations and response safety text category-specific.
- Create `src/components/workbench/scenarioGuidance.ts`: hold category-specific UI guidance used by the workbench.
- Create `src/components/workbench/scenarioGuidance.test.ts`: test KB option lists and response safety copy.
- Modify `src/domain/guidedTriage.test.ts`: add or adjust AI Assist expectations if category-specific guidance affects visible support text.
- Modify `docs/DEMO_SCRIPT.md`: update live demo path to showcase ambiguous VPN classification and scenario-specific guidance.
- Modify `README.md`: lightly update feature wording to mention scenario-specific Tier 1 decision support.

## Task 1: Protect Weighted Classification With Failing Tests

**Files:**
- Modify: `src/domain/triage.test.ts`

- [ ] **Step 1: Add ambiguous classification tests**

Append these tests inside the existing `describe("triageTicket", () => { ... })` block:

```ts
  it("prefers VPN remote access when the report also mentions sign-in", () => {
    const recommendation = triageTicket({
      ...sampleTickets[0],
      id: "TZ-INC-2026-0100",
      title: "VPN will not connect before shift handoff",
      description:
        "The VPN client fails with an authentication error. The user can sign in to Microsoft 365, but cannot reach the shared drive needed for a 2 PM finance deadline."
    });

    expect(recommendation.categoryName).toBe("VPN / Remote Access");
    expect(recommendation.recommendedKbArticleIds).toEqual([
      "kb-vpn-remote-access"
    ]);
    expect(recommendation.userResponseDraft).toContain("VPN connection issue");
    expect(recommendation.safetyFlags).toContain(
      "Do not bypass MFA or conditional access controls."
    );
  });

  it("prefers phishing when a suspicious link asks the user to sign in", () => {
    const recommendation = triageTicket({
      ...sampleTickets[2],
      id: "TZ-INC-2026-0101",
      title: "Suspicious payroll link asks me to sign in",
      description:
        "I received a suspicious payroll email with a link asking me to login and confirm my password."
    });

    expect(recommendation.categoryName).toBe("Security / Phishing Report");
    expect(recommendation.priority).toBe("high");
    expect(recommendation.recommendedKbArticleIds).toEqual([
      "kb-phishing-report"
    ]);
  });

  it("prefers printing when printer-specific terms overlap with login wording", () => {
    const recommendation = triageTicket({
      ...sampleTickets[1],
      id: "TZ-INC-2026-0102",
      title: "Printer offline and showing login prompt",
      description:
        "The shared finance printer says offline after showing a login prompt on the display."
    });

    expect(recommendation.categoryName).toBe("Printing");
    expect(recommendation.recommendedKbArticleIds).toEqual([
      "kb-printer-offline"
    ]);
  });

  it("classifies new hire access requests as onboarding service requests", () => {
    const recommendation = triageTicket({
      ...sampleTickets[0],
      id: "TZ-SR-2026-0103",
      title: "New hire laptop and access needed",
      description:
        "A new hire starts tomorrow and needs a laptop, VPN, payroll software access, and Microsoft 365 groups."
    });

    expect(recommendation.categoryName).toBe("New User Onboarding");
    expect(recommendation.recommendedKbArticleIds).toEqual([
      "kb-new-user-onboarding"
    ]);
    expect(recommendation.userResponseDraft).toContain("new hire");
  });
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```powershell
pnpm test src/domain/triage.test.ts
```

Expected: at least the new VPN or onboarding test fails because current scoring is count-based and no onboarding KB article exists.

- [ ] **Step 3: Commit the failing tests**

Run:

```powershell
git add src/domain/triage.test.ts
git commit -m "test: cover scenario-specific triage routing"
```

## Task 2: Implement Weighted Scenario Classification

**Files:**
- Modify: `src/domain/triage.ts`
- Modify: `src/data/mockData.ts`

- [ ] **Step 1: Add onboarding KB article**

In `src/data/mockData.ts`, add this article to `knowledgeBaseArticles` after the phishing article:

```ts
  {
    id: "kb-new-user-onboarding",
    title: "New user onboarding access checklist",
    categoryId: "cat-onboarding",
    symptoms: [
      "New hire needs equipment, software, or group access.",
      "Manager or HR requests onboarding before the employee start date.",
      "Access may include Microsoft 365 groups, VPN, printer, or line-of-business apps."
    ],
    tierOneSteps: [
      "Confirm the new hire name, department, manager, and start date.",
      "Verify manager or HR approval is attached to the request.",
      "Confirm required hardware, software, distribution groups, and access roles.",
      "Check whether the asset is assigned or needs imaging before handoff.",
      "Escalate if approvals are missing or the start date is within one business day."
    ],
    userResponseTemplate:
      "Hi Jordan, I can help with the new hire onboarding request. Please confirm the start date, manager approval, required software, and access groups before provisioning begins.",
    internalNotesTemplate:
      "New user onboarding request. Confirm manager or HR approval, start date, hardware assignment, required software, distribution groups, and access roles before fulfillment.",
    escalationCriteria: [
      "Missing manager or HR approval",
      "Start date within one business day",
      "Privileged access requested",
      "Hardware imaging or inventory exception required"
    ],
    safetyNotes: [
      "Do not provision access without documented manager or HR approval.",
      "Do not grant privileged access from a general onboarding ticket."
    ]
  }
```

- [ ] **Step 2: Replace raw scoring helpers**

In `src/domain/triage.ts`, replace `findBestCategory` and `calculateConfidence` with weighted scoring helpers:

```ts
interface CategoryScore {
  category: Category;
  matchedKeywords: number;
  score: number;
  specificity: number;
}

const CATEGORY_SPECIFICITY: Record<string, number> = {
  "cat-security-phishing": 50,
  "cat-onboarding": 45,
  "cat-vpn": 40,
  "cat-printing": 35,
  "cat-m365-auth": 20
};

const KEYWORD_WEIGHTS: Record<string, number> = {
  phishing: 12,
  suspicious: 10,
  attachment: 8,
  link: 7,
  "new hire": 12,
  onboarding: 12,
  laptop: 4,
  access: 4,
  software: 4,
  vpn: 12,
  tunnel: 10,
  remote: 8,
  connection: 6,
  wifi: 5,
  printer: 12,
  print: 8,
  offline: 8,
  toner: 7,
  paper: 7,
  outlook: 10,
  mfa: 8,
  password: 5,
  office: 5,
  "sign in": 3,
  login: 3
};

function findBestCategory(ticket: Ticket): Category {
  const bestMatch = scoreCategories(ticket).sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    if (right.specificity !== left.specificity) {
      return right.specificity - left.specificity;
    }

    return left.category.name.localeCompare(right.category.name);
  })[0];

  return bestMatch.score > 0 ? bestMatch.category : categories[0];
}

function scoreCategories(ticket: Ticket): CategoryScore[] {
  const text = normalize(`${ticket.title} ${ticket.description}`);

  return categories.map((category) => {
    const matchedKeywords = category.keywords.filter((keyword) =>
      hasKeyword(text, keyword)
    );

    return {
      category,
      matchedKeywords: matchedKeywords.length,
      score: matchedKeywords.reduce(
        (total, keyword) => total + keywordWeight(keyword),
        0
      ),
      specificity: CATEGORY_SPECIFICITY[category.id] ?? 0
    };
  });
}

function calculateConfidence(ticket: Ticket, category: Category): number {
  const categoryScore = scoreCategories(ticket).find(
    (candidate) => candidate.category.id === category.id
  );

  if (!categoryScore || categoryScore.score === 0) {
    return FALLBACK_CONFIDENCE;
  }

  return Math.min(
    94,
    FALLBACK_CONFIDENCE +
      categoryScore.matchedKeywords * 4 +
      Math.round(categoryScore.score * 1.5)
  );
}

function hasKeyword(text: string, keyword: string): boolean {
  return text.includes(normalize(keyword));
}

function keywordWeight(keyword: string): number {
  return KEYWORD_WEIGHTS[normalize(keyword)] ?? 5;
}
```

Keep `summarizeTicket`, `personalizeResponse`, `buildEscalationSummary`, and `normalize` in place.

- [ ] **Step 3: Run focused triage tests**

Run:

```powershell
pnpm test src/domain/triage.test.ts
```

Expected: all triage tests pass. If the first existing confidence test fails, update the expected confidence to the new deterministic weighted value shown by Vitest.

- [ ] **Step 4: Commit weighted triage implementation**

Run:

```powershell
git add src/domain/triage.ts src/data/mockData.ts src/domain/triage.test.ts
git commit -m "fix: weight scenario-specific ticket triage"
```

## Task 3: Add Category-Specific Workbench Guidance

**Files:**
- Create: `src/components/workbench/scenarioGuidance.ts`
- Create: `src/components/workbench/scenarioGuidance.test.ts`
- Modify: `src/components/workbench/WorkbenchPanels.tsx`

- [ ] **Step 1: Create scenario guidance helper**

Create `src/components/workbench/scenarioGuidance.ts`:

```ts
export interface KnowledgeOption {
  id: string;
  title: string;
  score: number;
}

export interface ScenarioGuidance {
  knowledgeOptions: KnowledgeOption[];
  responseSafetyText: string;
}

const guidanceByCategory: Record<string, ScenarioGuidance> = {
  "cat-m365-auth": {
    knowledgeOptions: [
      {
        id: "kb-m365-mfa-signin",
        title: "M365 sign-in and MFA troubleshooting",
        score: 92
      },
      {
        id: "kb-m365-cached-creds",
        title: "Clear WAM credentials in Windows 11",
        score: 87
      },
      {
        id: "kb-outlook-password-loop",
        title: "Outlook keeps prompting for password",
        score: 74
      }
    ],
    responseSafetyText:
      "Please do not share your password in this ticket. If a password reset is needed, I will verify your identity first and submit it for technician approval."
  },
  "cat-vpn": {
    knowledgeOptions: [
      {
        id: "kb-vpn-remote-access",
        title: "VPN remote access Tier 1 checklist",
        score: 93
      },
      {
        id: "kb-vpn-client-error",
        title: "Capture VPN client error and gateway details",
        score: 84
      },
      {
        id: "kb-vpn-group-membership",
        title: "Verify VPN group membership and MFA status",
        score: 78
      }
    ],
    responseSafetyText:
      "Please share the exact VPN client error, but do not share your password. I cannot bypass MFA or conditional access controls."
  },
  "cat-printing": {
    knowledgeOptions: [
      {
        id: "kb-printer-offline",
        title: "Printer offline Tier 1 checklist",
        score: 91
      },
      {
        id: "kb-print-queue-stuck",
        title: "Clear stale local print queue entries",
        score: 82
      },
      {
        id: "kb-shared-printer-impact",
        title: "Confirm shared printer scope before escalation",
        score: 76
      }
    ],
    responseSafetyText:
      "Please do not remove shared printer settings or power-cycle shared equipment unless instructed. I will first confirm scope and device status."
  },
  "cat-security-phishing": {
    knowledgeOptions: [
      {
        id: "kb-phishing-report",
        title: "Phishing report handling",
        score: 95
      },
      {
        id: "kb-credential-harvest",
        title: "Credential harvesting escalation checklist",
        score: 88
      },
      {
        id: "kb-email-header-capture",
        title: "Capture suspicious message metadata safely",
        score: 79
      }
    ],
    responseSafetyText:
      "Please do not click links, open attachments, or forward the message broadly. I will document the report and escalate if interaction occurred."
  },
  "cat-onboarding": {
    knowledgeOptions: [
      {
        id: "kb-new-user-onboarding",
        title: "New user onboarding access checklist",
        score: 92
      },
      {
        id: "kb-manager-approval",
        title: "Verify manager approval for access requests",
        score: 85
      },
      {
        id: "kb-device-assignment",
        title: "Confirm laptop assignment and imaging status",
        score: 80
      }
    ],
    responseSafetyText:
      "Please attach manager or HR approval and list only the access needed for the role. Privileged access requires a separate approval path."
  }
};

export function getScenarioGuidance(categoryId: string): ScenarioGuidance {
  return guidanceByCategory[categoryId] ?? guidanceByCategory["cat-m365-auth"];
}
```

- [ ] **Step 2: Create scenario guidance tests**

Create `src/components/workbench/scenarioGuidance.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getScenarioGuidance } from "./scenarioGuidance";

describe("getScenarioGuidance", () => {
  it("returns VPN-specific KB options and response safety text", () => {
    const guidance = getScenarioGuidance("cat-vpn");

    expect(guidance.knowledgeOptions[0]).toEqual({
      id: "kb-vpn-remote-access",
      title: "VPN remote access Tier 1 checklist",
      score: 93
    });
    expect(guidance.responseSafetyText).toContain("VPN client error");
    expect(guidance.responseSafetyText).toContain("cannot bypass MFA");
  });

  it("returns phishing-specific safety guidance", () => {
    const guidance = getScenarioGuidance("cat-security-phishing");

    expect(guidance.knowledgeOptions[0].id).toBe("kb-phishing-report");
    expect(guidance.responseSafetyText).toContain("do not click links");
  });

  it("falls back to M365 guidance for unknown categories", () => {
    const guidance = getScenarioGuidance("unknown-category");

    expect(guidance.knowledgeOptions[0].id).toBe("kb-m365-mfa-signin");
    expect(guidance.responseSafetyText).toContain("password reset");
  });
});
```

- [ ] **Step 3: Wire guidance into workbench panels**

In `src/components/workbench/WorkbenchPanels.tsx`, import the helper:

```ts
import { getScenarioGuidance } from "./scenarioGuidance";
```

Change the primary panels call from:

```tsx
      <KnowledgePanel
        recommendationId={recommendation.recommendedKbArticleIds[0]}
      />
```

to:

```tsx
      <KnowledgePanel recommendation={recommendation} />
```

Replace the `KnowledgePanel` signature and options setup with:

```tsx
function KnowledgePanel({ recommendation }: { recommendation: Recommendation }) {
  const options = getScenarioGuidance(
    recommendation.categoryId
  ).knowledgeOptions.map((option, index) =>
    index === 0
      ? {
          ...option,
          id: recommendation.recommendedKbArticleIds[0] ?? option.id
        }
      : option
  );
```

Keep the existing JSX return body.

In `ResponsePanel`, add:

```tsx
  const guidance = getScenarioGuidance(recommendation.categoryId);
```

Then replace the hard-coded password paragraph with:

```tsx
        <p className="mt-4">{guidance.responseSafetyText}</p>
```

- [ ] **Step 4: Run scenario guidance tests**

Run:

```powershell
pnpm test src/components/workbench/scenarioGuidance.test.ts
```

Expected: all tests pass.

- [ ] **Step 5: Run related UI/domain tests**

Run:

```powershell
pnpm test src/domain/triage.test.ts src/domain/guidedTriage.test.ts src/components/workbench/scenarioGuidance.test.ts
```

Expected: all tests pass.

- [ ] **Step 6: Commit workbench guidance**

Run:

```powershell
git add src/components/workbench/WorkbenchPanels.tsx src/components/workbench/scenarioGuidance.ts src/components/workbench/scenarioGuidance.test.ts
git commit -m "feat: add scenario-specific workbench guidance"
```

## Task 4: Update Portfolio Demo Documentation

**Files:**
- Modify: `docs/DEMO_SCRIPT.md`
- Modify: `README.md`

- [ ] **Step 1: Update demo script**

In `docs/DEMO_SCRIPT.md`, add a short section or update the existing walkthrough to include this path:

```md
### Scenario-Specific Triage Path

1. Use **Reset Demo** to start from the seed queue.
2. Create a ticket titled `VPN will not connect before shift handoff`.
3. Use this description: `The VPN client fails with an authentication error. The user can sign in to Microsoft 365, but cannot reach the shared drive needed for a 2 PM finance deadline.`
4. Confirm TierZero classifies it as **VPN / Remote Access**, not generic Microsoft 365 authentication.
5. Fill the required facts, start work, review the VPN KB recommendation, send the drafted response, and refresh to show browser-local persistence.
6. Reset the demo before ending the presentation.
```

- [ ] **Step 2: Update README feature wording**

In `README.md`, update the feature list or project summary to mention:

```md
- Scenario-specific Tier 1 guidance for M365 authentication, VPN access, printing, phishing reports, and onboarding requests.
```

Keep the README concise and recruiter-facing.

- [ ] **Step 3: Commit documentation**

Run:

```powershell
git add docs/DEMO_SCRIPT.md README.md
git commit -m "docs: describe scenario-specific triage demo"
```

## Task 5: Full Local Validation

**Files:**
- Review all changed files

- [ ] **Step 1: Run typecheck**

Run:

```powershell
pnpm typecheck
```

Expected: exits 0.

- [ ] **Step 2: Run tests**

Run:

```powershell
pnpm test
```

Expected: exits 0.

- [ ] **Step 3: Run lint**

Run:

```powershell
pnpm lint
```

Expected: exits 0.

- [ ] **Step 4: Run build**

Run:

```powershell
pnpm build
```

Expected: exits 0 and writes `dist/`.

- [ ] **Step 5: Review diff for secrets and unrelated changes**

Run:

```powershell
git diff --check
git diff --stat main...HEAD
git diff main...HEAD
```

Expected: no whitespace errors, no secrets, no private local files, no unrelated changes.

## Task 6: Browser QA

**Files:**
- No code edits expected

- [ ] **Step 1: Start local dev server**

Run:

```powershell
pnpm dev -- --host 127.0.0.1
```

Expected: Vite serves the app on a localhost port, usually `http://127.0.0.1:5173/` or the next available port.

- [ ] **Step 2: Validate desktop live-demo path**

Using the in-app browser or Playwright:

1. Open the local Vite URL.
2. Click **Reset Demo**.
3. Create the VPN ticket from Task 4.
4. Confirm the selected category is **VPN / Remote Access**.
5. Confirm the KB panel shows **VPN remote access Tier 1 checklist** first.
6. Confirm the drafted response says **VPN connection issue** and references the exact VPN client error.
7. Fill all required facts.
8. Click **Start Work** and confirm status changes to **In Progress**.
9. Refresh the page and confirm the ticket persists.
10. Click **Reset Demo** and confirm seed state returns.

- [ ] **Step 3: Validate mobile layout**

Set viewport to `390x844` and confirm:

1. Queue, guided triage, panels, and actions stack cleanly.
2. No text overlaps controls.
3. Technician action buttons remain usable.

- [ ] **Step 4: Check browser console**

Expected: no console errors or warnings.

## Task 7: Prepare PR

**Files:**
- No code edits expected unless validation finds defects

- [ ] **Step 1: Commit any validation fixes**

If validation required fixes, commit them with the smallest appropriate conventional commit.

- [ ] **Step 2: Push the branch**

Run:

```powershell
git push -u origin codex/scenario-triage-intelligence
```

- [ ] **Step 3: Open PR**

Open a PR with:

Title:

```md
feat: add scenario-specific triage intelligence
```

Body:

```md
## Why

TierZero's Guided Triage Console needs to demonstrate realistic Tier 1 judgment across common support workflows. The previous scoring could classify a VPN ticket as Microsoft 365 authentication when the description included broad sign-in language.

## What Changed

- Added weighted scenario matching so specific VPN, phishing, printing, and onboarding signals beat broad login wording.
- Added onboarding KB guidance and scenario-specific workbench KB/safety copy.
- Updated the demo script and README to frame the live demo as scenario-specific Tier 1 decision support.

## Validation

- `pnpm typecheck`
- `pnpm test`
- `pnpm lint`
- `pnpm build`
- Local browser QA: VPN ticket creation, classification, KB guidance, drafted response, Start Work, refresh persistence, Reset Demo, mobile layout, console check.
```

- [ ] **Step 4: Wait for CI and deploy after merge**

After PR checks pass and the PR is merged, wait for GitHub Pages deploy and verify:

```md
https://rblea97.github.io/tierzero-helpdesk-lab/
```

The plain live URL should show the updated scenario-specific demo.
