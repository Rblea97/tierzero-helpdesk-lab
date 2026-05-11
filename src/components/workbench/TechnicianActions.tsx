import { CornerUpRight, Lock, Play, Save, Send } from "lucide-react";
import { useState } from "react";
import type { TechnicianActionType, Ticket } from "../../domain/types";
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
  ticket
}: {
  onAction: (type: TechnicianActionType) => void;
  onSaveNote: (note: string) => void;
  ticket: Ticket;
}) {
  const [note, setNote] = useState("");
  const closed = ticket.status === "closed";
  const canSaveNote = note.trim().length > 0;

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
              onClick={() => onAction(action.type)}
              type="button"
            >
              <Icon size={16} />
              {action.label}
            </button>
          );
        })}
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
