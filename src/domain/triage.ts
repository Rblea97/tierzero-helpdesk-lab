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

function findBestArticle(category: Category): KnowledgeBaseArticle {
  const article = knowledgeBaseArticles.find(
    (candidate) => candidate.categoryId === category.id
  );

  return article ?? knowledgeBaseArticles[0];
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

function hasKeyword(text: string, keyword: string): boolean {
  return text.includes(normalize(keyword));
}

function keywordWeight(keyword: string): number {
  return KEYWORD_WEIGHTS[normalize(keyword)] ?? 5;
}
