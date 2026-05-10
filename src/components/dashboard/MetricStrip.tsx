import { metrics } from "../../data/viewData";

export function MetricStrip() {
  return (
    <section className="grid grid-cols-2 gap-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm xl:grid-cols-6">
      {metrics.map((metric, index) => (
        <div
          className={`flex min-h-24 items-center gap-3 p-4 ${
            index > 0 ? "border-slate-200" : ""
          } ${index % 2 === 1 ? "border-l" : ""} ${
            index > 1 ? "border-t" : ""
          } ${index > 0 ? "xl:border-l xl:border-t-0" : ""}`}
          key={metric.label}
        >
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <metric.icon size={21} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">{metric.label}</p>
            <p className="mt-1 text-2xl font-semibold">{metric.value}</p>
            <p
              className={`mt-1 text-xs ${
                metric.tone === "good"
                  ? "text-emerald-700"
                  : metric.tone === "warn"
                    ? "text-amber-700"
                    : "text-slate-500"
              }`}
            >
              {metric.delta}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}
