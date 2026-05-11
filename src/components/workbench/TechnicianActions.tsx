import { CornerUpRight, Lock, Play, Save, Send } from "lucide-react";
import { useState } from "react";
import type {
  TechnicianAction,
  TechnicianActionType,
  Ticket
} from "../../domain/types";
import { Panel } from "../ui/Panel";

const actionButtons: {
  icon: typeof Play;
  type: Exclude<
    TechnicianActionType,
    "approve_recommendation" | "reject_recommendation" | "save_note"
  >;
  label: string;
}[] = [
  { icon: Play, type: "start_work", label: "Start Work" },
  { icon: Send, type: "send_response", label: "Send Response" },
  { icon: CornerUpRight, type: "escalate", label: "Escalate" },
  { icon: Lock, type: "close_ticket", label: "Close" }
];

export function TechnicianActions({
  onAction,
  onSaveNote,
  responseDraft,
  ticket
}: {
  onAction: (
    type: TechnicianActionType,
    details?: Pick<TechnicianAction, "note" | "resolutionCategory">
  ) => { valid: true } | { valid: false; message: string };
  onSaveNote: (note: string) => void;
  responseDraft: string;
  ticket: Ticket;
}) {
  const [note, setNote] = useState("");
  const [escalationReason, setEscalationReason] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [resolutionCategory, setResolutionCategory] =
    useState<NonNullable<TechnicianAction["resolutionCategory"]>>("resolved");
  const [actionMessage, setActionMessage] = useState<string | undefined>();
  const closed = ticket.status === "closed";
  const canSaveNote = note.trim().length > 0;

  function handleAction(type: TechnicianActionType) {
    const result = onAction(type, detailsForAction(type));
    setActionMessage(result.valid ? undefined : result.message);

    if (result.valid && type === "escalate") {
      setEscalationReason("");
    }

    if (result.valid && type === "close_ticket") {
      setResolutionNote("");
      setResolutionCategory("resolved");
    }
  }

  function detailsForAction(
    type: TechnicianActionType
  ): Pick<TechnicianAction, "note" | "resolutionCategory"> | undefined {
    if (type === "send_response") {
      return { note: responseDraft };
    }

    if (type === "escalate") {
      return { note: escalationReason };
    }

    if (type === "close_ticket") {
      return {
        note: resolutionNote,
        resolutionCategory
      };
    }

    return undefined;
  }

  return (
    <Panel title="Technician Actions">
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {actionButtons.map((action) => {
          const Icon = action.icon;

          return (
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={closed}
              key={action.type}
              onClick={() => handleAction(action.type)}
              type="button"
            >
              <Icon size={16} />
              {action.label}
            </button>
          );
        })}
      </div>
      {actionMessage ? (
        <p className="mt-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {actionMessage}
        </p>
      ) : null}
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-slate-700">Escalation Reason</span>
          <textarea
            className="min-h-20 rounded-md border border-slate-300 p-3"
            onChange={(event) => setEscalationReason(event.target.value)}
            placeholder="Why Tier 2 or security needs this handoff."
            value={escalationReason}
          />
        </label>
        <div className="grid gap-2 text-sm">
          <label className="grid gap-2">
            <span className="font-medium text-slate-700">Resolution Category</span>
            <select
              className="h-10 rounded-md border border-slate-300 bg-white px-3"
              onChange={(event) =>
                setResolutionCategory(
                  event.target.value as NonNullable<
                    TechnicianAction["resolutionCategory"]
                  >
                )
              }
              value={resolutionCategory}
            >
              <option value="resolved">Resolved</option>
              <option value="user_confirmed">User Confirmed</option>
              <option value="no_fault_found">No Fault Found</option>
              <option value="duplicate">Duplicate</option>
            </select>
          </label>
          <label className="grid gap-2">
            <span className="font-medium text-slate-700">Resolution Notes</span>
            <textarea
              className="min-h-20 rounded-md border border-slate-300 p-3"
              onChange={(event) => setResolutionNote(event.target.value)}
              placeholder="What fixed the issue and how the user confirmed it."
              value={resolutionNote}
            />
          </label>
        </div>
      </div>
      <label className="mt-4 grid gap-2 text-sm">
        <span className="font-medium text-slate-700">Internal Note</span>
        <textarea
          className="min-h-24 rounded-md border border-slate-300 p-3"
          onChange={(event) => setNote(event.target.value)}
          placeholder="Document verification, troubleshooting, or escalation context."
          value={note}
        />
      </label>
      <button
        className="mt-3 inline-flex h-10 items-center gap-2 rounded-md border border-cyan-600 px-4 text-sm font-semibold text-cyan-700 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!canSaveNote}
        onClick={() => {
          const trimmedNote = note.trim();

          if (trimmedNote.length > 0) {
            onSaveNote(trimmedNote);
            setActionMessage(undefined);
            setNote("");
          }
        }}
        type="button"
      >
        <Save size={16} />
        Save Note
      </button>
    </Panel>
  );
}
