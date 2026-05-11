import { Bot, Check, ClipboardCheck, ShieldCheck } from "lucide-react";
import type { GuidedTriageState, Recommendation, TriageFactKey } from "../../domain/types";
import {
  buildAiAssist,
  getGuidedTriageCompletion
} from "../../domain/guidedTriage";
import { Panel } from "../ui/Panel";

const factOrder: TriageFactKey[] = [
  "scope",
  "errorMessage",
  "businessImpact",
  "verificationStatus",
  "attemptedFixes"
];

export function GuidedTriageConsole({
  onFactChange,
  onToggleChecklist,
  recommendation,
  state
}: {
  onFactChange: (key: TriageFactKey, value: string) => void;
  onToggleChecklist: (stepIndex: number) => void;
  recommendation: Recommendation;
  state: GuidedTriageState;
}) {
  const assist = buildAiAssist(recommendation, state);
  const completion = getGuidedTriageCompletion(
    state,
    recommendation.tierOneChecklist.length
  );

  return (
    <div className="grid gap-3 xl:grid-cols-[1.1fr_0.9fr]">
      <Panel
        action={
          <span className="text-sm font-semibold text-slate-700">
            {completion.requiredFacts}/{completion.totalRequiredFacts} facts
          </span>
        }
        title="Guided Triage Console"
      >
        <div className="grid gap-3 lg:grid-cols-2">
          {factOrder.map((key) => {
            const fact = state.facts[key];

            return (
              <label className="grid gap-1 text-sm" key={key}>
                <span className="font-medium text-slate-700">{fact.label}</span>
                <span className="text-xs leading-5 text-slate-500">{fact.prompt}</span>
                <textarea
                  className="min-h-24 rounded-md border border-slate-300 p-3"
                  onChange={(event) => onFactChange(key, event.target.value)}
                  value={fact.value}
                />
              </label>
            );
          })}
        </div>
      </Panel>

      <div className="grid gap-3">
        <Panel
          action={
            <span className="text-sm font-semibold text-slate-700">
              {completion.completedChecklistItems}/{completion.totalChecklistItems}
            </span>
          }
          title="Interactive Tier 1 Checklist"
        >
          <div className="space-y-3">
            {recommendation.tierOneChecklist.map((step, index) => {
              const checked = state.checklistCompleted.includes(index);

              return (
                <label className="flex items-start gap-3 text-sm" key={step}>
                  <button
                    aria-pressed={checked}
                    className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border ${
                      checked
                        ? "border-cyan-600 bg-cyan-600 text-white"
                        : "border-slate-300 bg-white text-transparent"
                    }`}
                    onClick={() => onToggleChecklist(index)}
                    type="button"
                  >
                    <Check size={14} />
                  </button>
                  <span className={checked ? "text-slate-700" : "text-slate-500"}>
                    {step}
                  </span>
                </label>
              );
            })}
          </div>
        </Panel>

        <Panel title="AI Assist">
          <div className="space-y-4 text-sm text-slate-700">
            <div className="flex gap-3">
              <Bot className="mt-0.5 shrink-0 text-cyan-700" size={18} />
              <p>{assist.nextQuestion}</p>
            </div>
            <div className="flex gap-3">
              <ClipboardCheck className="mt-0.5 shrink-0 text-emerald-700" size={18} />
              <p>
                KB match: <span className="font-semibold">{assist.kbMatch}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 shrink-0 text-amber-700" size={18} />
              <p>{assist.safetyFlags[0] ?? "No safety flags for this scenario."}</p>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
