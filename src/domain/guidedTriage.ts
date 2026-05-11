import { knowledgeBaseArticles } from "../data/mockData";
import type {
  EscalationHandoff,
  GuidedTriageState,
  Recommendation,
  Ticket,
  TriageFact,
  TriageFactKey
} from "./types";

export interface GuidedTriageCompletion {
  requiredFacts: number;
  totalRequiredFacts: number;
  completedChecklistItems: number;
  totalChecklistItems: number;
}

export interface AiAssistSuggestion {
  nextQuestion: string;
  kbMatch: string;
  responseDraft: string;
  escalationSummary: string;
  safetyFlags: string[];
}

const factTemplates: Record<
  TriageFactKey,
  Omit<TriageFact, "key" | "value">
> = {
  scope: {
    label: "Scope",
    prompt: "Who is affected, and is this one user, one device, or a wider issue?",
    required: true
  },
  errorMessage: {
    label: "Exact Error",
    prompt: "What exact error, prompt, bounce, or device message did the user see?",
    required: true
  },
  businessImpact: {
    label: "Business Impact",
    prompt: "What work is blocked, delayed, or at risk for the requester?",
    required: true
  },
  verificationStatus: {
    label: "Verification",
    prompt: "How was identity, ownership, or request legitimacy verified?",
    required: true
  },
  attemptedFixes: {
    label: "Attempted Fixes",
    prompt: "What Tier 1 checks or fixes were already attempted?",
    required: true
  }
};

export function createInitialGuidedTriage(
  ticket: Ticket,
  recommendation: Recommendation
): GuidedTriageState {
  const facts = Object.fromEntries(
    (Object.keys(factTemplates) as TriageFactKey[]).map((key) => [
      key,
      {
        key,
        ...factTemplates[key],
        value: seedFactValue(key, recommendation)
      }
    ])
  ) as Record<TriageFactKey, TriageFact>;

  return {
    ticketId: ticket.id,
    facts,
    checklistCompleted: [],
    responseHistory: []
  };
}

export function updateTriageFact(
  state: GuidedTriageState,
  key: TriageFactKey,
  value: string
): GuidedTriageState {
  return {
    ...state,
    facts: {
      ...state.facts,
      [key]: {
        ...state.facts[key],
        value
      }
    }
  };
}

export function toggleChecklistStep(
  state: GuidedTriageState,
  stepIndex: number
): GuidedTriageState {
  const completed = state.checklistCompleted.includes(stepIndex)
    ? state.checklistCompleted.filter((index) => index !== stepIndex)
    : [...state.checklistCompleted, stepIndex].sort((left, right) => left - right);

  return {
    ...state,
    checklistCompleted: completed
  };
}

export function getGuidedTriageCompletion(
  state: GuidedTriageState,
  totalChecklistItems = 0
): GuidedTriageCompletion {
  const requiredFacts = Object.values(state.facts).filter(
    (fact) => fact.required && fact.value.trim().length > 0
  ).length;
  const totalRequiredFacts = Object.values(state.facts).filter(
    (fact) => fact.required
  ).length;

  return {
    requiredFacts,
    totalRequiredFacts,
    completedChecklistItems: state.checklistCompleted.length,
    totalChecklistItems
  };
}

export function buildAiAssist(
  recommendation: Recommendation,
  state: GuidedTriageState
): AiAssistSuggestion {
  const nextFact = Object.values(state.facts).find(
    (fact) => fact.required && fact.value.trim().length === 0
  );
  const article = knowledgeBaseArticles.find(
    (candidate) => candidate.id === recommendation.recommendedKbArticleIds[0]
  );

  return {
    nextQuestion: nextFact
      ? `Ask about ${nextFact.label.toLowerCase()}: ${nextFact.prompt}`
      : "All required triage facts are documented. Confirm checklist completion before final action.",
    kbMatch: article?.title ?? "No KB article matched",
    responseDraft: recommendation.userResponseDraft,
    escalationSummary: recommendation.escalationSummary,
    safetyFlags: recommendation.safetyFlags
  };
}

export function buildEscalationHandoff(
  ticket: Ticket,
  recommendation: Recommendation,
  state: GuidedTriageState,
  reason: string,
  timestamp: string
): EscalationHandoff {
  const documentedFacts = Object.values(state.facts)
    .filter((fact) => fact.value.trim().length > 0)
    .map((fact) => `${fact.label}: ${fact.value}`)
    .join(" | ");

  return {
    reason,
    escalationGroup: recommendation.categoryName.split(" / ")[0] === "Microsoft 365"
      ? "Identity and Access"
      : recommendation.categoryName,
    summary: [
      `Ticket ${ticket.id}: ${ticket.title}.`,
      `Reason: ${reason}.`,
      documentedFacts || "No required facts documented yet.",
      recommendation.escalationSummary
    ].join(" "),
    timestamp
  };
}

function seedFactValue(
  key: TriageFactKey,
  recommendation: Recommendation
): string {
  if (key === "businessImpact") {
    return recommendation.priority === "high"
      ? "Potential security or business-critical impact."
      : "";
  }

  return "";
}
