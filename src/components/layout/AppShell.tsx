import { Bell, ChevronDown, Gauge, Search } from "lucide-react";
import type { ReactNode } from "react";
import { navItems } from "../../data/viewData";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="flex min-h-screen">
        <SideNav />
        <section className="min-w-0 flex-1">
          <TopBar />
          <div className="mx-auto flex max-w-[1480px] flex-col gap-3 p-3 sm:p-4">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}

function SideNav() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-cyan-950/60 bg-slate-950 text-slate-300 lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <div className="flex size-8 items-center justify-center rounded bg-cyan-500/15 text-cyan-300">
          <Gauge size={20} />
        </div>
        <span className="text-xl font-semibold text-white">TierZero</span>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => (
          <button
            className={`flex h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm transition ${
              item.active
                ? "bg-cyan-500/18 text-cyan-100"
                : "text-slate-300 hover:bg-white/6 hover:text-white"
            }`}
            key={item.label}
            type="button"
          >
            <item.icon size={18} />
            <span className="flex-1">{item.label}</span>
            {item.count ? (
              <span className="rounded-full bg-cyan-300 px-2 py-0.5 text-xs font-semibold text-slate-950">
                {item.count}
              </span>
            ) : null}
          </button>
        ))}
      </nav>

      <div className="space-y-4 border-t border-white/10 p-4 text-xs">
        <div>
          <div className="flex items-center justify-between text-slate-400">
            <span>LAB STATUS</span>
            <ChevronDown size={14} />
          </div>
          <div className="mt-3 flex items-center gap-2 text-slate-200">
            <span className="size-2 rounded-full bg-emerald-400" />
            Online
          </div>
        </div>
        <div>
          <p className="text-slate-400">ENVIRONMENT</p>
          <p className="mt-1 text-slate-200">Functional Demo v0.2</p>
        </div>
      </div>
    </aside>
  );
}

function TopBar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-4 text-white shadow-sm">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded bg-cyan-500/15 text-cyan-300 lg:hidden">
          <Gauge size={18} />
        </div>
        <p className="truncate text-sm font-semibold text-white sm:hidden">
          TierZero
        </p>
        <p className="hidden truncate text-sm font-medium text-slate-300 sm:block">
          AI-Assisted IT Help Desk Operations Lab
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden h-10 items-center gap-2 rounded-md bg-white/8 px-3 text-sm text-slate-300 md:flex">
          <Search size={17} />
          <span className="w-28 text-slate-400">Search</span>
          <kbd className="rounded border border-white/10 px-1.5 py-0.5 text-xs text-slate-400">
            Ctrl K
          </kbd>
        </div>
        <button
          aria-label="Notifications"
          className="relative flex size-10 items-center justify-center rounded-md text-slate-300 hover:bg-white/8"
          type="button"
        >
          <Bell size={19} />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-cyan-300" />
        </button>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-cyan-50 text-sm font-semibold text-slate-900">
            AR
          </div>
          <div className="hidden text-sm md:block">
            <p className="font-semibold">Alex Rivera</p>
            <p className="text-xs text-slate-400">Tier 1 Analyst</p>
          </div>
        </div>
      </div>
    </header>
  );
}
