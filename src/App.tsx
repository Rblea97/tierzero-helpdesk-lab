import { sampleTickets } from "./data/mockData";
import { triageTicket } from "./domain/triage";

const featuredTicket = sampleTickets[0];
const featuredRecommendation = triageTicket(featuredTicket);

export function App() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 text-slate-950">
      <section className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
            TierZero
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight">
            AI-assisted help desk operations lab
          </h1>
          <p className="max-w-2xl text-lg text-slate-600">
            A public portfolio demo for realistic Tier 1 ticket triage, asset
            context, knowledge-base recommendations, human approval, and audit
            discipline.
          </p>
        </div>

        <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-slate-500">Sample ticket</p>
            <p className="mt-1 text-xl font-semibold">{featuredTicket.id}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Category</p>
            <p className="mt-1 text-xl font-semibold">
              {featuredRecommendation.categoryName}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Confidence</p>
            <p className="mt-1 text-xl font-semibold">
              {featuredRecommendation.confidence}%
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">{featuredTicket.title}</h2>
          <p className="mt-2 text-slate-600">{featuredTicket.description}</p>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-slate-700">
            {featuredRecommendation.tierOneChecklist.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
