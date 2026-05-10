import { Clock3 } from "lucide-react";
import { titleCase } from "../../lib/format";
import type { Recommendation, Ticket } from "../../domain/types";

export function TriageHeader({
  recommendation,
  ticket
}: {
  recommendation: Recommendation;
  ticket: Ticket;
}) {
  return (
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
        <TriageField
          label="Priority"
          value={titleCase(recommendation.priority)}
        />
        <div>
          <p className="text-xs font-semibold text-slate-500">Confidence</p>
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
