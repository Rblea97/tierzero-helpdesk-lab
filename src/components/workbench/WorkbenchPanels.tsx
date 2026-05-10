import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  Laptop,
  LockKeyhole
} from "lucide-react";
import { assets, knowledgeBaseArticles, users } from "../../data/mockData";
import type { AuditEvent, Recommendation, Ticket } from "../../domain/types";
import type { NoteTab } from "../../domain/workflow";
import { formatTime, titleCase } from "../../lib/format";
import { Detail, Panel, TabButton } from "../ui/Panel";

export function PrimaryWorkbenchPanels({
  recommendation,
  ticket
}: {
  recommendation: Recommendation;
  ticket: Ticket;
}) {
  return (
    <div className="grid gap-3 xl:grid-cols-[1fr_1fr_0.8fr_0.85fr]">
      <IssuePanel ticket={ticket} />
      <SummaryPanel recommendation={recommendation} />
      <ContextPanel ticket={ticket} />
      <KnowledgePanel
        recommendationId={recommendation.recommendedKbArticleIds[0]}
      />
    </div>
  );
}

export function SecondaryWorkbenchPanels({
  activeTab,
  onTabChange,
  recommendation,
  timeline
}: {
  activeTab: NoteTab;
  onTabChange: (tab: NoteTab) => void;
  recommendation: Recommendation;
  timeline: AuditEvent[];
}) {
  return (
    <div className="grid gap-3 xl:grid-cols-[1fr_1.05fr_0.6fr]">
      <ResponsePanel recommendation={recommendation} />
      <NotesPanel
        activeTab={activeTab}
        escalationSummary={recommendation.escalationSummary}
        internalNotes={recommendation.internalTechnicianNotes}
        onTabChange={onTabChange}
      />
      <div className="flex flex-col gap-3">
        <ChecklistPanel steps={recommendation.tierOneChecklist} />
        <AuditTimeline timeline={timeline} />
      </div>
    </div>
  );
}

function IssuePanel({ ticket }: { ticket: Ticket }) {
  return (
    <Panel title="Issue Description">
      <p className="text-sm leading-7 text-slate-700">{ticket.description}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {issueTags(ticket).map((tag) => (
          <span
            className="rounded bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
            key={tag}
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-5 border-t border-slate-200 pt-4">
        <h3 className="text-sm font-semibold">User Reported Details</h3>
        <dl className="mt-3 grid gap-3 text-sm">
          <Detail label="When did this start?" value="05/10/2026 01:45 PM" />
          <Detail label="Frequency" value="Constant" />
          <Detail label="Business Impact" value={businessImpact(ticket)} />
          <Detail label="Attachments" value="1 screenshot" link />
        </dl>
      </div>
    </Panel>
  );
}

function SummaryPanel({ recommendation }: { recommendation: Recommendation }) {
  return (
    <Panel title="AI Triage Summary">
      <div className="space-y-4">
        {triageFindings(recommendation).map((finding) => (
          <div className="flex gap-3 text-sm text-slate-700" key={finding}>
            <CheckCircle2
              className="mt-0.5 shrink-0 text-emerald-600"
              size={17}
            />
            <span>{finding}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-md border border-amber-300 bg-amber-50 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
          <AlertTriangle size={17} />
          Recommended Next Step
        </p>
        <p className="mt-2 text-sm leading-6 text-amber-950">
          {recommendation.tierOneChecklist[4] ??
            recommendation.tierOneChecklist[0]}
        </p>
      </div>
      <button
        className="mt-5 inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        type="button"
      >
        View Reasoning
        <ChevronDown size={15} />
      </button>
    </Panel>
  );
}

function ContextPanel({ ticket }: { ticket: Ticket }) {
  const requester = users.find((user) => user.id === ticket.requesterId);
  const asset = assets.find((candidate) => candidate.id === ticket.assetId);

  if (!requester) {
    return (
      <Panel title="User & Asset Context">
        <p className="text-sm text-slate-600">
          No requester record is linked to this demo ticket.
        </p>
      </Panel>
    );
  }

  return (
    <Panel title="User & Asset Context">
      <div className="flex gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-sm font-semibold text-slate-800">
          {initials(requester.name)}
        </div>
        <div>
          <p className="font-semibold">{requester.name}</p>
          <p className="text-sm text-slate-500">{requester.role}</p>
          <p className="text-sm text-slate-500">{requester.department}</p>
        </div>
      </div>
      <dl className="mt-5 grid gap-3 border-b border-slate-200 pb-5 text-sm">
        <Detail label="Email" value={requester.email} link />
        <Detail label="Manager" value={requester.manager} link />
        <Detail label="MFA Status" value={titleCase(requester.mfaStatus)} />
      </dl>
      {asset ? (
        <>
          <div className="mt-5 flex gap-3">
            <Laptop className="mt-1 text-slate-500" size={34} />
            <div>
              <p className="font-semibold">{asset.assetTag}</p>
              <p className="text-sm text-slate-500">
                {asset.manufacturer} {asset.model}
              </p>
            </div>
          </div>
          <dl className="mt-4 grid gap-3 text-sm">
            <Detail label="OS" value={asset.operatingSystem} />
            <Detail label="Warranty" value={asset.warrantyEnd} />
            <Detail label="Status" value={titleCase(asset.status)} />
          </dl>
        </>
      ) : (
        <p className="mt-5 text-sm text-slate-600">
          No device record is linked. Continue with user-focused triage.
        </p>
      )}
    </Panel>
  );
}

function KnowledgePanel({ recommendationId }: { recommendationId: string }) {
  const primary = knowledgeBaseArticles.find(
    (article) => article.id === recommendationId
  );
  const options = [
    {
      id: primary?.id ?? "kb-m365-mfa-signin",
      title: primary?.title ?? "",
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
  ];

  return (
    <Panel title="Knowledge Base Recommendations">
      <div className="space-y-2">
        {options.map((option) => (
          <div className="rounded-md border border-slate-200 p-3" key={option.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-slate-500">
                  {option.id.toUpperCase()}
                </p>
                <p className="mt-1 text-sm font-semibold">{option.title}</p>
              </div>
              <span className="text-sm font-semibold text-emerald-700">
                {option.score}%
              </span>
            </div>
          </div>
        ))}
      </div>
      <button
        className="mt-4 text-sm font-semibold text-cyan-700 hover:text-cyan-900"
        type="button"
      >
        View all recommendations
      </button>
    </Panel>
  );
}

function ResponsePanel({ recommendation }: { recommendation: Recommendation }) {
  return (
    <Panel title="Drafted Response (Customer)">
      <div className="min-h-52 rounded-md border border-slate-300 bg-white p-4 text-sm leading-6 text-slate-700">
        <p>{recommendation.userResponseDraft}</p>
        <p className="mt-4">
          Please do not share your password in this ticket. If a password reset
          is needed, I will verify your identity first and submit it for
          technician approval.
        </p>
        <p className="mt-4">Thanks,</p>
        <p>Tier 1 Support</p>
      </div>
      <div className="mt-3 flex h-10 items-center gap-4 rounded-md border border-slate-200 px-3 text-slate-500">
        <LockKeyhole size={16} />
        <span className="text-sm">Safe response mode: no secrets requested</span>
      </div>
      <button
        className="mt-4 h-10 rounded-md border border-cyan-600 px-4 text-sm font-semibold text-cyan-700 hover:bg-cyan-50"
        type="button"
      >
        Save Draft
      </button>
    </Panel>
  );
}

function NotesPanel({
  activeTab,
  escalationSummary,
  internalNotes,
  onTabChange
}: {
  activeTab: NoteTab;
  escalationSummary: string;
  internalNotes: string;
  onTabChange: (tab: NoteTab) => void;
}) {
  return (
    <Panel title="Technician Workspace">
      <div className="flex border-b border-slate-200">
        <TabButton
          active={activeTab === "notes"}
          label="Internal Notes"
          onClick={() => onTabChange("notes")}
        />
        <TabButton
          active={activeTab === "escalation"}
          label="Escalation Summary"
          onClick={() => onTabChange("escalation")}
        />
      </div>
      <div className="mt-4 min-h-28 rounded-md border border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
        {activeTab === "notes" ? internalNotes : escalationSummary}
      </div>
      <p className="mt-4 text-xs text-slate-500">Last saved: 02:12 PM</p>
      <button
        className="mt-3 h-10 rounded-md border border-cyan-600 px-4 text-sm font-semibold text-cyan-700 hover:bg-cyan-50"
        type="button"
      >
        Save Notes
      </button>
    </Panel>
  );
}

function ChecklistPanel({ steps }: { steps: string[] }) {
  return (
    <Panel
      action={
        <span className="text-sm font-semibold text-slate-700">
          {Math.max(steps.length - 1, 0)} / {steps.length}
        </span>
      }
      title="Tier 1 Checklist"
    >
      <div className="space-y-3">
        {steps.map((step, index) => (
          <label className="flex items-start gap-3 text-sm" key={step}>
            <span
              className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border ${
                index < steps.length - 1
                  ? "border-cyan-600 bg-cyan-600 text-white"
                  : "border-slate-300 bg-white text-transparent"
              }`}
            >
              <Check size={14} />
            </span>
            <span
              className={
                index < steps.length - 1 ? "text-slate-700" : "text-slate-500"
              }
            >
              {step}
            </span>
          </label>
        ))}
      </div>
    </Panel>
  );
}

function AuditTimeline({ timeline }: { timeline: AuditEvent[] }) {
  return (
    <Panel title="Audit Timeline">
      <div className="space-y-3">
        {timeline.map((event) => (
          <div
            className="grid grid-cols-[18px_62px_1fr] gap-2 text-xs"
            key={event.id}
          >
            <div className="flex flex-col items-center">
              <span className="mt-1 size-2.5 rounded-full bg-cyan-600" />
              <span className="mt-1 h-full w-px bg-slate-200" />
            </div>
            <span className="text-slate-500">{formatTime(event.timestamp)}</span>
            <div>
              <p className="font-medium text-slate-700">{event.message}</p>
              <p className="mt-1 text-slate-500">{event.actorName}</p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function issueTags(ticket: Ticket): string[] {
  if (ticket.id === "TZ-INC-2026-0043") {
    return ["Printer offline", "Shared device", "Queue issue"];
  }

  if (ticket.id === "TZ-INC-2026-0044") {
    return ["Suspicious email", "Payroll link", "Security review"];
  }

  return ["MFA looping", "Password rejected", "Outlook Desktop"];
}

function businessImpact(ticket: Ticket): string {
  if (ticket.id === "TZ-INC-2026-0043") {
    return "Department printing delayed";
  }

  if (ticket.id === "TZ-INC-2026-0044") {
    return "Potential credential risk";
  }

  return "Cannot access email";
}

function triageFindings(recommendation: Recommendation): string[] {
  if (recommendation.categoryId === "cat-security-phishing") {
    return [
      "Suspicious payroll link reported by user.",
      "Credential harvesting risk should be reviewed.",
      "User interaction status must be confirmed.",
      "Security escalation may be required."
    ];
  }

  if (recommendation.categoryId === "cat-printing") {
    return [
      "Shared printer reported offline.",
      "Impact scope should be confirmed.",
      "Print queue and device display need Tier 1 checks.",
      "Escalate if multiple users are affected."
    ];
  }

  return [
    "Detected MFA re-authentication loop with Outlook.",
    "Password rejection mentioned after MFA prompt.",
    "Likely cached credentials or token issue.",
    "No service outage signal included in this demo scenario."
  ];
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
