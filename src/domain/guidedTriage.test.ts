import { describe, expect, it } from "vitest";
import { sampleTickets } from "../data/mockData";
import { triageTicket } from "./triage";
import {
  buildAiAssist,
  buildEscalationHandoff,
  createInitialGuidedTriage,
  getGuidedTriageCompletion,
  toggleChecklistStep,
  updateTriageFact
} from "./guidedTriage";

describe("guided triage", () => {
  it("starts each ticket with required Tier 1 fact prompts", () => {
    const state = createInitialGuidedTriage(sampleTickets[0], triageTicket(sampleTickets[0]));

    expect(state.ticketId).toBe(sampleTickets[0].id);
    expect(Object.keys(state.facts)).toEqual([
      "scope",
      "errorMessage",
      "businessImpact",
      "verificationStatus",
      "attemptedFixes"
    ]);
    expect(state.checklistCompleted).toEqual([]);
  });

  it("tracks facts and checklist progress without mutating prior state", () => {
    const initial = createInitialGuidedTriage(
      sampleTickets[1],
      triageTicket(sampleTickets[1])
    );
    const withFact = updateTriageFact(initial, "scope", "Finance users on floor 2");
    const withChecklist = toggleChecklistStep(withFact, 0);

    expect(initial.facts.scope.value).toBe("");
    expect(withFact.facts.scope.value).toBe("Finance users on floor 2");
    expect(withChecklist.checklistCompleted).toEqual([0]);
    expect(getGuidedTriageCompletion(withChecklist)).toMatchObject({
      requiredFacts: 1,
      totalRequiredFacts: 5,
      completedChecklistItems: 1
    });
  });

  it("builds AI assist suggestions from ticket progress and recommendations", () => {
    const recommendation = triageTicket(sampleTickets[2]);
    const state = createInitialGuidedTriage(sampleTickets[2], recommendation);
    const assist = buildAiAssist(recommendation, state);

    expect(assist.nextQuestion).toContain("scope");
    expect(assist.kbMatch).toBe("Phishing report handling");
    expect(assist.safetyFlags).toContain("Do not paste suspicious links into public tools.");
  });

  it("creates a Tier 2 handoff package from collected facts", () => {
    const ticket = sampleTickets[0];
    const recommendation = triageTicket(ticket);
    const state = updateTriageFact(
      createInitialGuidedTriage(ticket, recommendation),
      "verificationStatus",
      "Requester identity verified with manager callback."
    );

    const handoff = buildEscalationHandoff(
      ticket,
      recommendation,
      state,
      "Repeated MFA loop after identity verification.",
      "2026-05-11T19:30:00.000Z"
    );

    expect(handoff).toMatchObject({
      reason: "Repeated MFA loop after identity verification.",
      escalationGroup: "Identity and Access",
      timestamp: "2026-05-11T19:30:00.000Z"
    });
    expect(handoff.summary).toContain("Requester identity verified");
  });
});
