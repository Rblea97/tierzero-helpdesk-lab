import { GitBranch } from "lucide-react";
import { Panel } from "../ui/Panel";

const steps = [
  "Ticket created",
  "Classify category and priority",
  "Match KB article",
  "Draft response and handoff",
  "Wait for human approval",
  "Update ticket and audit"
];

export function AutomationBlueprint() {
  return (
    <Panel title="Automation Blueprint">
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {steps.map((step, index) => (
          <div
            className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm"
            key={step}
          >
            <div className="mb-3 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>STEP {index + 1}</span>
              <GitBranch size={14} />
            </div>
            <p className="font-medium text-slate-800">{step}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">
        Public demo mode simulates this n8n-style workflow in the browser. A
        private homelab can later map these steps to GLPI tickets, assets,
        knowledge-base articles, approvals, and audit events.
      </p>
    </Panel>
  );
}
