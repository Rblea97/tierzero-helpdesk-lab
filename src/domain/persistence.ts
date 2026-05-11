import type {
  AuditEvent,
  GuidedTriageState,
  QueueFilter,
  Ticket
} from "./types";
import type { ApprovalState } from "./workflow";

export const DEMO_STATE_VERSION = 1;
export const DEMO_STORAGE_KEY = "tierzero-guided-triage-demo-v1";

export interface DemoState {
  version: typeof DEMO_STATE_VERSION;
  tickets: Ticket[];
  selectedTicketId: string;
  queueFilter: QueueFilter;
  approvalState: ApprovalState;
  actionEventsByTicket: Record<string, AuditEvent[]>;
  notesByTicket: Record<string, string[]>;
  triageByTicket: Record<string, GuidedTriageState>;
}

export function serializeDemoState(state: DemoState): string {
  return JSON.stringify(state);
}

export function parseDemoState(raw: string | null): DemoState | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<DemoState>;

    if (parsed.version !== DEMO_STATE_VERSION) {
      return null;
    }

    if (!Array.isArray(parsed.tickets) || typeof parsed.selectedTicketId !== "string") {
      return null;
    }

    return parsed as DemoState;
  } catch {
    return null;
  }
}
