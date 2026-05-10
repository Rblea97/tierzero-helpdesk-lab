import {
  AlertTriangle,
  Archive,
  Bell,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  FileText,
  Gauge,
  Laptop,
  LayoutDashboard,
  LockKeyhole,
  MonitorCheck,
  Play,
  Search,
  Settings,
  ShieldCheck,
  Ticket,
  UserRound,
  Users
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  assets,
  auditEvents,
  knowledgeBaseArticles,
  sampleTickets,
  users
} from "./data/mockData";
import { triageTicket } from "./domain/triage";
import type { AuditEvent, Ticket as SupportTicket } from "./domain/types";

const navItems = [
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

const metrics = [
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

const scenarioDescriptions: Record<string, string> = {
  "TZ-INC-2026-0042":
    "User cannot access Outlook on desktop. MFA prompt loops or password rejected.",
  "TZ-INC-2026-0043":
    "Shared department printer appears offline and jobs are stuck in queue.",
  "TZ-INC-2026-0044":
    "User reports a suspicious payroll link and needs security triage."
};

export function App() {
  const [selectedTicketId, setSelectedTicketId] = useState(sampleTickets[0].id);
  const [approvalState, setApprovalState] = useState<
    "pending" | "approved" | "rejected"
  >("pending");
  const [activeNoteTab, setActiveNoteTab] = useState<"notes" | "escalation">(
    "notes"
  );

  const ticket = sampleTickets.find(
    (candidate) => candidate.id === selectedTicketId
  ) as SupportTicket;
  const recommendation = useMemo(() => triageTicket(ticket), [ticket]);
  const timeline = buildTimeline(ticket, approvalState);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-cyan-950/60 bg-slate-950 text-slate-300 lg:flex lg:flex-col">
          <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
            <div className="flex size-8 items-center justify-center rounded bg-cyan-500/15 text-cyan-300">
              <Gauge size={20} />
            </div>
            <span className="text-xl font-semibold text-white">TierZero</span>
          </div>

          <nav className="flex-1 space-y-1 px-2 py-4">
            {navItems.map((item) => (
              <button
                className={`flex h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm transition ${
                  item.active
                    ? "bg-cyan-500/18 text-cyan-100"
                    : "text-slate-300 hover:bg-white/6 hover:text-white"
                }`}
                key={item.label}
                type="button"
              >
                <item.icon size={18} />
                <span className="flex-1">{item.label}</span>
                {item.count ? (
                  <span className="rounded-full bg-cyan-300 px-2 py-0.5 text-xs font-semibold text-slate-950">
                    {item.count}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>

          <div className="space-y-4 border-t border-white/10 p-4 text-xs">
            <div>
              <div className="flex items-center justify-between text-slate-400">
                <span>LAB STATUS</span>
                <ChevronDown size={14} />
              </div>
              <div className="mt-3 flex items-center gap-2 text-slate-200">
                <span className="size-2 rounded-full bg-emerald-400" />
                Online
              </div>
            </div>
            <div>
              <p className="text-slate-400">ENVIRONMENT</p>
              <p className="mt-1 text-slate-200">Public Demo v0.1</p>
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <TopBar />

          <div className="mx-auto flex max-w-[1480px] flex-col gap-3 p-3 sm:p-4">
            <MetricStrip />

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-semibold">
                    Ticket Intake / Scenario Selector
                  </h2>
                  <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center">
                    <select
                      aria-label="Select demo scenario"
                      className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 md:w-80"
                      onChange={(event) => {
                        setSelectedTicketId(event.target.value);
                        setApprovalState("pending");
                      }}
                      value={selectedTicketId}
                    >
                      {sampleTickets.map((candidate) => (
                        <option key={candidate.id} value={candidate.id}>
                          {scenarioLabel(candidate)}
                        </option>
                      ))}
                    </select>
                    <p className="text-sm italic text-slate-500">
                      {scenarioDescriptions[ticket.id]}
                    </p>
                  </div>
                </div>
                <button
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-cyan-600 px-4 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50"
                  type="button"
                >
                  Load Scenario
                  <Play size={15} />
                </button>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr_1fr_1fr] lg:items-center">
                <div>
                  <h2 className="text-lg font-semibold">Triage Workbench</h2>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-xl font-semibold">{ticket.id}</p>
                    <span className="rounded border border-cyan-300 bg-cyan-50 px-2 py-0.5 text-xs font-semibold text-cyan-700">
                      New
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Created: May 10, 2026 02:00 PM &nbsp; Channel: Portal
                  </p>
                </div>
                <TriageField label="Category" value={recommendation.categoryName} />
                <TriageField label="Priority" value={titleCase(recommendation.priority)} />
                <div>
                  <p className="text-xs font-semibold text-slate-500">
                    Confidence
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-2xl font-semibold text-emerald-700">
                      {recommendation.confidence}%
                    </span>
                    <div className="h-2 w-24 rounded-full bg-slate-200">
                      <div
                        className="h-2 rounded-full bg-emerald-600"
                        style={{ width: `${recommendation.confidence}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">SLA</p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-semibold">
                    <Clock3 size={16} />
                    4h 12m left
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Due: May 10, 2026 06:12 PM
                  </p>
                </div>
              </div>
            </section>

            <div className="grid gap-3 xl:grid-cols-[1fr_1fr_0.8fr_0.85fr]">
              <IssuePanel ticket={ticket} />
              <SummaryPanel recommendation={recommendation} />
              <ContextPanel />
              <KnowledgePanel recommendationId={recommendation.recommendedKbArticleIds[0]} />
            </div>

            <div className="grid gap-3 xl:grid-cols-[1fr_1.05fr_0.6fr]">
              <ResponsePanel recommendation={recommendation} />
              <NotesPanel
                activeTab={activeNoteTab}
                escalationSummary={recommendation.escalationSummary}
                internalNotes={recommendation.internalTechnicianNotes}
                onTabChange={setActiveNoteTab}
              />
              <div className="flex flex-col gap-3">
                <ChecklistPanel steps={recommendation.tierOneChecklist} />
                <AuditTimeline timeline={timeline} />
              </div>
            </div>

            <ApprovalGate
              approvalState={approvalState}
              onApprove={() => setApprovalState("approved")}
              onReject={() => setApprovalState("rejected")}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function TopBar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-4 text-white shadow-sm">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded bg-cyan-500/15 text-cyan-300 lg:hidden">
          <Gauge size={18} />
        </div>
        <p className="truncate text-sm font-semibold text-white sm:hidden">
          TierZero
        </p>
        <p className="hidden truncate text-sm font-medium text-slate-300 sm:block">
          AI-Assisted IT Help Desk Operations Lab
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden h-10 items-center gap-2 rounded-md bg-white/8 px-3 text-sm text-slate-300 md:flex">
          <Search size={17} />
          <span className="w-28 text-slate-400">Search</span>
          <kbd className="rounded border border-white/10 px-1.5 py-0.5 text-xs text-slate-400">
            Ctrl K
          </kbd>
        </div>
        <button
          aria-label="Notifications"
          className="relative flex size-10 items-center justify-center rounded-md text-slate-300 hover:bg-white/8"
          type="button"
        >
          <Bell size={19} />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-cyan-300" />
        </button>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-cyan-50 text-sm font-semibold text-slate-900">
            AR
          </div>
          <div className="hidden text-sm md:block">
            <p className="font-semibold">Alex Rivera</p>
            <p className="text-xs text-slate-400">Tier 1 Analyst</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function MetricStrip() {
  return (
    <section className="grid grid-cols-2 gap-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm xl:grid-cols-6">
      {metrics.map((metric, index) => (
        <div
          className={`flex min-h-24 items-center gap-3 p-4 ${
            index > 0 ? "border-slate-200" : ""
          } ${
            index % 2 === 1 ? "border-l" : ""
          } ${
            index > 1 ? "border-t" : ""
          } ${
            index > 0 ? "xl:border-l xl:border-t-0" : ""
          }`}
          key={metric.label}
        >
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <metric.icon size={21} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">{metric.label}</p>
            <p className="mt-1 text-2xl font-semibold">{metric.value}</p>
            <p
              className={`mt-1 text-xs ${
                metric.tone === "good"
                  ? "text-emerald-700"
                  : metric.tone === "warn"
                    ? "text-amber-700"
                    : "text-slate-500"
              }`}
            >
              {metric.delta}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}

function TriageField({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-slate-200 lg:border-l lg:pl-6">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-base font-medium text-slate-900">{value}</p>
    </div>
  );
}

function IssuePanel({ ticket }: { ticket: SupportTicket }) {
  return (
    <Panel title="Issue Description">
      <p className="text-sm leading-7 text-slate-700">{ticket.description}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {["MFA looping", "Password rejected", "Outlook Desktop"].map((tag) => (
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
          <Detail label="Business Impact" value="Cannot access email" />
          <Detail label="Attachments" value="1 screenshot" link />
        </dl>
      </div>
    </Panel>
  );
}

function SummaryPanel({
  recommendation
}: {
  recommendation: ReturnType<typeof triageTicket>;
}) {
  const findings = [
    "Detected MFA re-authentication loop with Outlook.",
    "Password rejection mentioned after MFA prompt.",
    "Likely cached credentials or token issue.",
    "No service outage signal included in this demo scenario."
  ];

  return (
    <Panel title="AI Triage Summary">
      <div className="space-y-4">
        {findings.map((finding) => (
          <div className="flex gap-3 text-sm text-slate-700" key={finding}>
            <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={17} />
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
          {recommendation.tierOneChecklist[4]}
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

function ContextPanel() {
  const requester = users[0];
  const asset = assets[0];

  return (
    <Panel title="User & Asset Context">
      <div className="flex gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-sm font-semibold text-slate-800">
          JL
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
    </Panel>
  );
}

function KnowledgePanel({ recommendationId }: { recommendationId: string }) {
  const primary = knowledgeBaseArticles.find(
    (article) => article.id === recommendationId
  );
  const options = [
    { id: primary?.id ?? "kb-m365-mfa-signin", title: primary?.title ?? "", score: 92 },
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
                <p className="text-xs text-slate-500">{option.id.toUpperCase()}</p>
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

function ResponsePanel({
  recommendation
}: {
  recommendation: ReturnType<typeof triageTicket>;
}) {
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
  activeTab: "notes" | "escalation";
  escalationSummary: string;
  internalNotes: string;
  onTabChange: (tab: "notes" | "escalation") => void;
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
            <span className={index < steps.length - 1 ? "text-slate-700" : "text-slate-500"}>
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
          <div className="grid grid-cols-[18px_62px_1fr] gap-2 text-xs" key={event.id}>
            <div className="flex flex-col items-center">
              <span className="mt-1 size-2.5 rounded-full bg-cyan-600" />
              <span className="mt-1 h-full w-px bg-slate-200" />
            </div>
            <span className="text-slate-500">
              {formatTime(event.timestamp)}
            </span>
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

function ApprovalGate({
  approvalState,
  onApprove,
  onReject
}: {
  approvalState: "pending" | "approved" | "rejected";
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <section className="rounded-lg border border-amber-300 bg-white p-4 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-center">
        <div>
          <h2 className="text-sm font-semibold">Approval Gate</h2>
          <div className="mt-2 flex items-center gap-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
            <UserRound size={18} />
            <span>Medium priority identity workflow requires technician approval.</span>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500">Approver</p>
          <div className="mt-2 flex h-10 items-center justify-between rounded-md border border-slate-300 px-3 text-sm">
            Taylor Morgan (Tier 2)
            <ChevronDown size={16} />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="h-10 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            onClick={onReject}
            type="button"
          >
            Reject
          </button>
          <button
            className="h-10 rounded-md border border-amber-600 bg-amber-50 px-4 text-sm font-semibold text-amber-800 hover:bg-amber-100"
            onClick={onApprove}
            type="button"
          >
            {approvalState === "approved"
              ? "Approved"
              : approvalState === "rejected"
                ? "Rejected"
                : "Request Approval"}
          </button>
        </div>
      </div>
    </section>
  );
}

function Panel({
  action,
  children,
  title
}: {
  action?: React.ReactNode;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Detail({
  label,
  link,
  value
}: {
  label: string;
  link?: boolean;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className={link ? "font-medium text-cyan-700" : "text-slate-700"}>
        {value}
      </dd>
    </div>
  );
}

function TabButton({
  active,
  label,
  onClick
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`h-10 border-b-2 px-4 text-sm font-semibold ${
        active
          ? "border-cyan-600 text-cyan-700"
          : "border-transparent text-slate-500 hover:text-slate-700"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function buildTimeline(
  ticket: SupportTicket,
  approvalState: "pending" | "approved" | "rejected"
): AuditEvent[] {
  const baseEvents = auditEvents.filter((event) => event.ticketId === ticket.id);
  const generatedEvents: AuditEvent[] = [
    {
      id: `${ticket.id}-kb`,
      ticketId: ticket.id,
      actorType: "system",
      actorName: "TierZero Demo",
      eventType: "kb_article_selected",
      message: "Knowledge-base article selected.",
      timestamp: "2026-05-10T14:00:06.000Z"
    },
    {
      id: `${ticket.id}-approval`,
      ticketId: ticket.id,
      actorType: "workflow",
      actorName: "Approval Workflow",
      eventType: "approval_requested",
      message:
        approvalState === "pending"
          ? "Pending technician approval."
          : approvalState === "approved"
            ? "Recommendation approved."
            : "Recommendation rejected.",
      timestamp: "2026-05-10T14:12:00.000Z"
    }
  ];

  return [...baseEvents, ...generatedEvents];
}

function scenarioLabel(ticket: SupportTicket): string {
  if (ticket.id === "TZ-INC-2026-0042") {
    return "Outlook MFA / Password Issue";
  }

  if (ticket.id === "TZ-INC-2026-0043") {
    return "Printer Offline";
  }

  return "Phishing Report";
}

function titleCase(value: string): string {
  return value
    .split("_")
    .map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`)
    .join(" ");
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}
