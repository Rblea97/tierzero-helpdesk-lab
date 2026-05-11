import type { FormEvent } from "react";
import { useState } from "react";
import { assets, users } from "../../data/mockData";
import type { TicketIntake as TicketIntakeModel } from "../../domain/types";
import { Panel } from "../ui/Panel";

const initialDraft: TicketIntakeModel = {
  title: "",
  description: "",
  requesterId: users[0]?.id ?? "",
  assetId: assets[0]?.id,
  source: "portal",
  businessImpact: "medium"
};

export function TicketIntake({
  errors,
  onSubmit
}: {
  errors: Record<string, string | undefined>;
  onSubmit: (intake: TicketIntakeModel) => boolean;
}) {
  const [draft, setDraft] = useState<TicketIntakeModel>(initialDraft);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const created = onSubmit(draft);

    if (created) {
      setDraft(initialDraft);
    }
  }

  return (
    <Panel title="Ticket Intake">
      <form className="grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700">Requester</span>
          <select
            className="h-10 rounded-md border border-slate-300 bg-white px-3"
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                requesterId: event.target.value
              }))
            }
            value={draft.requesterId}
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} - {user.department}
              </option>
            ))}
          </select>
          {errors.requesterId ? (
            <span className="text-xs text-red-700">{errors.requesterId}</span>
          ) : null}
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700">Linked Asset</span>
          <select
            className="h-10 rounded-md border border-slate-300 bg-white px-3"
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                assetId: event.target.value || undefined
              }))
            }
            value={draft.assetId ?? ""}
          >
            <option value="">No linked asset</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.assetTag} - {asset.model}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm md:col-span-2">
          <span className="font-medium text-slate-700">Issue Title</span>
          <input
            className="h-10 rounded-md border border-slate-300 px-3"
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                title: event.target.value
              }))
            }
            value={draft.title}
          />
          {errors.title ? (
            <span className="text-xs text-red-700">{errors.title}</span>
          ) : null}
        </label>
        <label className="grid gap-1 text-sm md:col-span-2">
          <span className="font-medium text-slate-700">Description</span>
          <textarea
            className="min-h-24 rounded-md border border-slate-300 p-3"
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                description: event.target.value
              }))
            }
            value={draft.description}
          />
          {errors.description ? (
            <span className="text-xs text-red-700">{errors.description}</span>
          ) : null}
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700">Source</span>
          <select
            className="h-10 rounded-md border border-slate-300 bg-white px-3"
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                source: event.target.value as TicketIntakeModel["source"]
              }))
            }
            value={draft.source}
          >
            <option value="portal">Portal</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="walkup">Walk-up</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700">Business Impact</span>
          <select
            className="h-10 rounded-md border border-slate-300 bg-white px-3"
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                businessImpact:
                  event.target.value as TicketIntakeModel["businessImpact"]
              }))
            }
            value={draft.businessImpact}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <div className="md:col-span-2">
          <button
            className="h-10 rounded-md bg-cyan-700 px-4 text-sm font-semibold text-white hover:bg-cyan-800"
            type="submit"
          >
            Create Ticket
          </button>
        </div>
      </form>
    </Panel>
  );
}
