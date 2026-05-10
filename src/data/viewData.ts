import {
  AlertTriangle,
  Archive,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileText,
  LayoutDashboard,
  MonitorCheck,
  Settings,
  ShieldCheck,
  Ticket,
  Users
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Ticket as SupportTicket } from "../domain/types";

export interface NavItem {
  active?: boolean;
  count?: number;
  icon: LucideIcon;
  label: string;
}

export interface Metric {
  delta: string;
  icon: LucideIcon;
  label: string;
  tone: "good" | "neutral" | "warn";
  value: string;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Intake / Scenarios", icon: FileText },
  { label: "Workbench", icon: MonitorCheck, count: 2 },
  { label: "Tickets", icon: Ticket },
  { label: "Users", icon: Users },
  { label: "Assets", icon: Archive },
  { label: "Knowledge Base", icon: BookOpen },
  { label: "Approvals", icon: ClipboardCheck },
  { label: "Audit Trail", icon: ShieldCheck },
  { label: "Settings", icon: Settings }
];

export const metrics: Metric[] = [
  {
    label: "Open Tickets",
    value: "12",
    delta: "2 vs yesterday",
    icon: Ticket,
    tone: "neutral"
  },
  {
    label: "AI Resolutions",
    value: "7",
    delta: "58% of closed",
    icon: MonitorCheck,
    tone: "good"
  },
  {
    label: "Avg. Handle Time",
    value: "18m",
    delta: "4m vs yesterday",
    icon: Clock3,
    tone: "good"
  },
  {
    label: "First Contact Res.",
    value: "73%",
    delta: "6% vs yesterday",
    icon: CheckCircle2,
    tone: "neutral"
  },
  {
    label: "Escalations",
    value: "2",
    delta: "1 vs yesterday",
    icon: AlertTriangle,
    tone: "warn"
  },
  {
    label: "SLA Breaches",
    value: "0",
    delta: "On track",
    icon: ShieldCheck,
    tone: "good"
  }
];

export const scenarioDescriptions: Record<string, string> = {
  "TZ-INC-2026-0042":
    "User cannot access Outlook on desktop. MFA prompt loops or password rejected.",
  "TZ-INC-2026-0043":
    "Shared department printer appears offline and jobs are stuck in queue.",
  "TZ-INC-2026-0044":
    "User reports a suspicious payroll link and needs security triage."
};

export function scenarioLabel(ticket: SupportTicket): string {
  if (ticket.id === "TZ-INC-2026-0042") {
    return "Outlook MFA / Password Issue";
  }

  if (ticket.id === "TZ-INC-2026-0043") {
    return "Printer Offline";
  }

  return "Phishing Report";
}
