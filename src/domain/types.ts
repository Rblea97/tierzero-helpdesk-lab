export type AccountStatus = "active" | "locked" | "disabled";
export type MfaStatus = "registered" | "not_registered" | "needs_review";
export type AssetStatus = "assigned" | "in_repair" | "retired" | "available";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketStatus =
  | "new"
  | "triaged"
  | "in_progress"
  | "pending_user"
  | "pending_approval"
  | "escalated"
  | "closed";

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  manager: string;
  accountStatus: AccountStatus;
  mfaStatus: MfaStatus;
  groups: string[];
  escalationContact: string;
}

export interface Asset {
  id: string;
  assetTag: string;
  type: "laptop" | "desktop" | "printer" | "mobile" | "network";
  manufacturer: string;
  model: string;
  operatingSystem: string;
  status: AssetStatus;
  warrantyEnd: string;
  assignedUserId?: string;
  assignedTechnicianId?: string;
}

export interface Category {
  id: string;
  name: string;
  parentCategory: string;
  defaultPriority: TicketPriority;
  keywords: string[];
  escalationRules: string[];
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  requesterId: string;
  assetId?: string;
  categoryId?: string;
  priority: TicketPriority;
  status: TicketStatus;
  source: "portal" | "email" | "phone" | "walkup";
  createdAt: string;
  updatedAt: string;
}

export interface TicketIntake {
  title: string;
  description: string;
  requesterId: string;
  assetId?: string;
  source: "portal" | "email" | "phone" | "walkup";
  businessImpact: "low" | "medium" | "high";
}

export interface QueueMetrics {
  openTickets: number;
  highPriority: number;
  pendingUser: number;
  escalated: number;
  closed: number;
}

export type QueueFilter = "all" | TicketStatus;

export type TechnicianActionType =
  | "start_work"
  | "save_note"
  | "send_response"
  | "approve_recommendation"
  | "reject_recommendation"
  | "escalate"
  | "close_ticket";

export interface TechnicianAction {
  type: TechnicianActionType;
  note?: string;
  actorName: string;
  timestamp: string;
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  categoryId: string;
  symptoms: string[];
  tierOneSteps: string[];
  userResponseTemplate: string;
  internalNotesTemplate: string;
  escalationCriteria: string[];
  safetyNotes: string[];
}

export interface Recommendation {
  id: string;
  ticketId: string;
  categoryId: string;
  categoryName: string;
  summary: string;
  confidence: number;
  priority: TicketPriority;
  recommendedKbArticleIds: string[];
  tierOneChecklist: string[];
  userResponseDraft: string;
  internalTechnicianNotes: string;
  escalationSummary: string;
  safetyFlags: string[];
  requiresHumanApproval: boolean;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  ticketId: string;
  actorType: "system" | "technician" | "workflow";
  actorName: string;
  eventType:
    | "ticket_received"
    | "classification_generated"
    | "kb_article_selected"
    | "approval_requested"
    | "technician_approved"
    | "technician_rejected"
    | "ticket_created"
    | "status_changed"
    | "technician_note_saved"
    | "user_response_sent"
    | "ticket_escalated"
    | "ticket_closed"
    | "escalation_generated"
    | "workflow_completed";
  message: string;
  timestamp: string;
}
