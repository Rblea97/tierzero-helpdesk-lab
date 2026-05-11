import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Ticket
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { QueueMetrics } from "../../domain/types";

interface MetricCard {
  delta: string;
  icon: LucideIcon;
  label: string;
  tone: "good" | "neutral" | "warn";
  value: string;
}

export function MetricStrip({ metrics }: { metrics: QueueMetrics }) {
  const metricCards: MetricCard[] = [
    {
      label: "Open Tickets",
      value: metrics.openTickets.toString(),
      delta: "Active queue",
      icon: Ticket,
      tone: "neutral"
    },
    {
      label: "High Priority",
      value: metrics.highPriority.toString(),
      delta: "Needs attention",
      icon: AlertTriangle,
      tone: metrics.highPriority > 0 ? "warn" : "good"
    },
    {
      label: "Pending User",
      value: metrics.pendingUser.toString(),
      delta: "Waiting on requester",
      icon: Clock3,
      tone: "neutral"
    },
    {
      label: "Escalated",
      value: metrics.escalated.toString(),
      delta: "Tier 2 handoff",
      icon: ShieldCheck,
      tone: metrics.escalated > 0 ? "warn" : "good"
    },
    {
      label: "Closed",
      value: metrics.closed.toString(),
      delta: "Resolved in demo",
      icon: CheckCircle2,
      tone: "good"
    }
  ];

  return (
    <section className="grid grid-cols-2 gap-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm xl:grid-cols-5">
      {metricCards.map((metric, index) => (
        <div
          className={`flex min-h-24 items-center gap-3 p-4 ${
            index > 0 ? "border-slate-200" : ""
          } ${index % 2 === 1 ? "border-l" : ""} ${
            index > 1 ? "border-t" : ""
          } ${index > 0 ? "xl:border-l xl:border-t-0" : ""}`}
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
