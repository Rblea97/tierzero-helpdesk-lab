import { ChevronDown, UserRound } from "lucide-react";
import type { ApprovalState } from "../../domain/workflow";

export function ApprovalGate({
  approvalState,
  onApprove,
  onReject
}: {
  approvalState: ApprovalState;
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
            <span>
              Medium priority identity workflow requires technician approval.
            </span>
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
