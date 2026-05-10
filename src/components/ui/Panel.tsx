import type { ReactNode } from "react";

export function Panel({
  action,
  children,
  title
}: {
  action?: ReactNode;
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Detail({
  label,
  link,
  value
}: {
  label: string;
  link?: boolean;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className={link ? "font-medium text-cyan-700" : "text-slate-700"}>
        {value}
      </dd>
    </div>
  );
}

export function TabButton({
  active,
  label,
  onClick
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`h-10 border-b-2 px-4 text-sm font-semibold ${
        active
          ? "border-cyan-600 text-cyan-700"
          : "border-transparent text-slate-500 hover:text-slate-700"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
