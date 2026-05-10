import { Play } from "lucide-react";
import { sampleTickets } from "../../data/mockData";
import { scenarioDescriptions, scenarioLabel } from "../../data/viewData";
import type { Ticket } from "../../domain/types";

export function ScenarioSelector({
  onTicketChange,
  ticket
}: {
  onTicketChange: (ticketId: string) => void;
  ticket: Ticket;
}) {
  return (
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
              onChange={(event) => onTicketChange(event.target.value)}
              value={ticket.id}
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
  );
}
