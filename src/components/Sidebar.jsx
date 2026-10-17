import { AudioLines, FileText, Plus, Settings, Trash2 } from "lucide-react";

export default function Sidebar({
  scripts,
  activeId,
  onSelect,
  onCreate,
  onDelete,
}) {
  return (
    <aside className="flex min-h-full flex-col bg-white">
      <div className="flex h-16 shrink-0 items-center gap-3 px-5">
        <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
          <AudioLines size={22} />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900">
          prompt<span className="text-indigo-600">flow</span>
        </span>
      </div>

      <div className="px-4 pt-4">
        <button
          type="button"
          onClick={onCreate}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98]"
        >
          <Plus size={18} />
          New script
        </button>
      </div>

      <div className="px-4 pt-8">
        <p className="px-2 text-[11px] font-bold tracking-[0.14em] text-slate-400">
          WORKSPACE
        </p>

        <div className="mt-3 flex items-center gap-3 rounded-xl bg-indigo-50 px-3 py-3 text-sm font-semibold text-indigo-700">
          <FileText size={18} />
          <span>All scripts</span>
          <span className="ml-auto rounded-lg bg-white px-2 py-0.5 text-xs font-semibold text-indigo-600">
            {scripts.length}
          </span>
        </div>
      </div>

      <div className="px-4 pt-8">
        <div className="flex items-center justify-between px-2">
          <p className="text-[11px] font-bold tracking-[0.14em] text-slate-400">
            YOUR SCRIPTS
          </p>
          <span className="text-xs text-slate-400">{scripts.length}</span>
        </div>

        <div className="mt-3 space-y-1">
          {scripts.length > 0 ? (
            scripts.map((script) => (
              <div
                key={script.id}
                className={`group flex min-w-0 items-center gap-1 rounded-xl transition ${
                  activeId === script.id ? "bg-slate-100" : "hover:bg-slate-50"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(script.id)}
                  title={script.title || "Untitled script"}
                  className={`flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-3 py-3 text-left text-sm ${
                    activeId === script.id
                      ? "font-semibold text-slate-900"
                      : "text-slate-600"
                  }`}
                >
                  <FileText
                    size={17}
                    className={`shrink-0 ${
                      activeId === script.id
                        ? "text-indigo-600"
                        : "text-slate-400"
                    }`}
                  />
                  <span className="truncate">
                    {script.title || "Untitled script"}
                  </span>
                </button>

                <button
                  type="button"
                  title="Delete script"
                  aria-label={`Delete ${script.title || "Untitled script"}`}
                  onClick={() => onDelete(script.id)}
                  className="mr-1 flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          ) : (
            <p className="px-3 py-4 text-sm leading-6 text-slate-400">
              No saved scripts yet. Create one to get started.
            </p>
          )}
        </div>
      </div>

      <div className="mt-auto p-4 pt-8">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
            <Settings size={17} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-700">
              Local workspace
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              Stored on this device
            </p>
          </div>
          <span className="size-2 rounded-full bg-emerald-500" />
        </div>
      </div>
    </aside>
  );
}
