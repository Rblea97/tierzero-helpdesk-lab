import { Inbox } from "lucide-react";
import { queueFilters } from "../../data/viewData";
import type { QueueFilter, Ticket } from "../../domain/types";
import { formatTime, titleCase } from "../../lib/format";
import { Panel } from "../ui/Panel";

export function TicketQueue({
  filter,
  onFilterChange,
  onSelectTicket,
  selectedTicketId,
  tickets
}: {
  filter: QueueFilter;
  onFilterChange: (filter: QueueFilter) => void;
  onSelectTicket: (ticketId: string) => void;
  selectedTicketId: string;
  tickets: Ticket[];
}) {
  return (
    <Panel title="Ticket Queue">
      <div className="flex flex-wrap gap-2">
        {queueFilters.map((option) => (
          <button
            className={`h-8 rounded-md border px-3 text-sm font-medium ${
              filter === option.id
                ? "border-cyan-600 bg-cyan-50 text-cyan-800"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
            key={option.id}
            onClick={() => onFilterChange(option.id)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-3">
        {tickets.length === 0 ? (
          <div className="flex items-center gap-2 rounded-md border border-dashed border-slate-300 p-4 text-sm text-slate-500 md:col-span-3">
            <Inbox size={16} />
            No tickets match this filter.
          </div>
        ) : (
          tickets.map((ticket) => (
            <button
              className={`rounded-md border p-3 text-left ${
                selectedTicketId === ticket.id
                  ? "border-cyan-600 bg-cyan-50"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
              key={ticket.id}
              onClick={() => onSelectTicket(ticket.id)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-500">
                    {ticket.id}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {ticket.title}
                  </p>
                </div>
                <span className="shrink-0 rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
                  {titleCase(ticket.status)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
                <span>{titleCase(ticket.priority)} priority</span>
                <span>{formatTime(ticket.updatedAt)}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </Panel>
  );
}
