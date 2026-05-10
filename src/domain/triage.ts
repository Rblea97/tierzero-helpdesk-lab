import {
  categories,
  knowledgeBaseArticles,
  users
} from "../data/mockData";
import type {
  Category,
  KnowledgeBaseArticle,
  Recommendation,
  Ticket
} from "./types";

const FALLBACK_CONFIDENCE = 63;

export function triageTicket(ticket: Ticket): Recommendation {
  const category = findBestCategory(ticket);
  const article = findBestArticle(category);
  const requester = users.find((user) => user.id === ticket.requesterId);
  const requesterFirstName = requester?.name.split(" ")[0] ?? "there";

  return {
    id: `rec-${ticket.id.toLowerCase()}`,
    ticketId: ticket.id,
    categoryId: category.id,
    categoryName: category.name,
    summary: summarizeTicket(ticket, category),
    confidence: calculateConfidence(ticket, category),
    priority: category.defaultPriority,
    recommendedKbArticleIds: [article.id],
    tierOneChecklist: article.tierOneSteps,
    userResponseDraft: personalizeResponse(
      article.userResponseTemplate,
      requesterFirstName
    ),
    internalTechnicianNotes: article.internalNotesTemplate,
    escalationSummary: buildEscalationSummary(ticket, category, article),
    safetyFlags: article.safetyNotes,
    requiresHumanApproval: true,
    createdAt: new Date("2026-05-10T14:00:05.000Z").toISOString()
  };
}

function findBestCategory(ticket: Ticket): Category {
  const text = normalize(`${ticket.title} ${ticket.description}`);
  const scoredCategories = categories.map((category) => ({
    category,
    score: category.keywords.filter((keyword) =>
      text.includes(normalize(keyword))
    ).length
  }));

  const bestMatch = scoredCategories.sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    return left.category.name.localeCompare(right.category.name);
  })[0];

  return bestMatch.score > 0 ? bestMatch.category : categories[0];
}

function findBestArticle(category: Category): KnowledgeBaseArticle {
  const article = knowledgeBaseArticles.find(
    (candidate) => candidate.categoryId === category.id
  );

  return article ?? knowledgeBaseArticles[0];
}

function calculateConfidence(ticket: Ticket, category: Category): number {
  const text = normalize(`${ticket.title} ${ticket.description}`);
  const matchedKeywords = category.keywords.filter((keyword) =>
    text.includes(normalize(keyword))
  ).length;

  return Math.min(94, FALLBACK_CONFIDENCE + matchedKeywords * 8);
}

function summarizeTicket(ticket: Ticket, category: Category): string {
  return `${ticket.title} was classified as ${category.name} based on the request text and known Tier 1 support patterns.`;
}

function personalizeResponse(template: string, firstName: string): string {
  return template.replace("Jordan", firstName);
}

function buildEscalationSummary(
  ticket: Ticket,
  category: Category,
  article: KnowledgeBaseArticle
): string {
  return [
    `Ticket ${ticket.id} may require escalation to ${category.parentCategory}.`,
    `Review criteria: ${article.escalationCriteria.join(", ")}.`,
    `Original report: ${ticket.description}`
  ].join(" ");
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9 ]/g, " ");
}
