import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Command,
  Menu,
  Search,
  X,
  FileText,
  Clock3,
  AlignLeft,
} from "lucide-react";

import Sidebar from "./components/Sidebar";
import ScriptEditor from "./components/ScriptEditor";
import SettingsPanel from "./components/SettingsPanel";
import Teleprompter from "./components/Teleprompter";
import useLocalScripts from "./hooks/useLocalScripts";

const initialSettings = {
  duration: 2,
  speed: 1,
  fontSize: 30,
  lineHeight: 1.6,
  mirror: false,
};

export default function App() {
  const { scripts, saveScript, deleteScript, createScript } = useLocalScripts();

  const [activeId, setActiveId] = useState(() => {
    try {
      return localStorage.getItem("promptflow-active") || "welcome";
    } catch {
      return "welcome";
    }
  });

  const [settings, setSettings] = useState(initialSettings);
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(true);
  const [draft, setDraft] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeScript =
    draft?.id === activeId
      ? draft
      : scripts.find((script) => script.id === activeId);

  useEffect(() => {
    if (!activeScript && scripts.length > 0) {
      setActiveId(scripts[0].id);
    }
  }, [activeScript, scripts]);

  useEffect(() => {
    try {
      localStorage.setItem("promptflow-active", activeId);
    } catch {
      // Storage may be unavailable.
    }
  }, [activeId]);

  const wordCount = useMemo(() => {
    const content = activeScript?.content.trim() || "";
    return content ? content.split(/\s+/).length : 0;
  }, [activeScript?.content]);

  const estimatedMinutes = Math.max(1, Math.ceil(wordCount / 130));

  function handleCreate() {
    if (draft && !draft.title.trim() && !draft.content.trim()) {
      return;
    }

    const script = createScript();
    setDraft(script);
    setActiveId(script.id);
    setMobileOpen(false);
  }

  function handleDelete(id) {
    const script = scripts.find((item) => item.id === id);
    if (!script) return;

    if (!window.confirm(`Delete "${script.title}"?`)) return;

    deleteScript(id);

    if (activeId === id) {
      const nextScript = scripts.find((item) => item.id !== id);
      setActiveId(nextScript?.id || "");
      setDraft(null);
    }
  }

  function handleScriptChange(updatedScript) {
    const updated = {
      ...updatedScript,
      updatedAt: Date.now(),
    };

    if (draft?.id === updated.id) {
      setDraft(updated);

      if (updated.title.trim() || updated.content.trim()) {
        saveScript(updated);
        setDraft(null);
      }

      return;
    }

    saveScript(updated);
  }

  function handleSelect(id) {
    setDraft(null);
    setActiveId(id);
    setMobileOpen(false);
  }

  const filteredScripts = scripts.filter((script) =>
    script.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 md:flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[280px] transform transition-transform duration-300 md:sticky md:top-0 md:h-screen md:shrink-0 md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full overflow-y-auto border-r border-slate-200 bg-white">
          <div className="flex items-center justify-end px-4 pt-3 md:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          <Sidebar
            scripts={filteredScripts}
            activeId={activeId}
            onSelect={handleSelect}
            onCreate={handleCreate}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Main content */}
      <main className="min-w-0 flex-1">
        {/* Top navigation */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
          <div className="flex min-h-[68px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="Open navigation"
                onClick={() => setMobileOpen(true)}
                className="shrink-0 rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 md:hidden"
              >
                <Menu size={20} />
              </button>

              <div className="min-w-0 text-sm">
                <div className="text-slate-400">Workspace</div>
                <div className="max-w-[180px] truncate font-semibold text-slate-800 sm:max-w-xs">
                  {activeScript?.title || "No script selected"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="hidden w-48 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 sm:flex lg:w-64">
                <Search size={16} className="shrink-0 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search scripts..."
                  aria-label="Search scripts"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
                <kbd className="rounded border border-slate-200 bg-white px-1.5 text-xs text-slate-400">
                  /
                </kbd>
              </label>

              <div className="hidden items-center gap-1.5 text-xs font-medium text-emerald-700 sm:flex">
                <Check size={15} />
                {saved ? "Saved locally" : "Saving..."}
              </div>

              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 font-bold text-indigo-700 ring-1 ring-indigo-200">
                P
              </div>
            </div>
          </div>

          {/* Search on small screens */}
          <div className="px-4 pb-3 sm:hidden">
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
              <Search size={16} className="text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search scripts..."
                aria-label="Search scripts"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </label>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          {/* Welcome section */}
          <section className="mb-7 flex flex-col gap-5 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold tracking-wide text-indigo-700">
                <Command size={14} />
                YOUR PERSONAL STUDIO
              </div>

              <h1 className="max-w-2xl text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
                Good ideas deserve a great delivery.
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Prepare your script, find your rhythm, and speak with
                confidence.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 active:scale-[0.98]"
            >
              <span className="text-lg leading-none">+</span>
              New script
            </button>
          </section>

          {/* Stats */}
          <section className="mb-7 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
            <StatCard
              icon={<FileText size={19} />}
              label="Total scripts"
              value={scripts.length}
              detail="Saved in this browser"
            />
            <StatCard
              icon={<AlignLeft size={19} />}
              label="Words in current script"
              value={wordCount}
              detail="Updates as you type"
            />
            <StatCard
              icon={<Clock3 size={19} />}
              label="Estimated speaking time"
              value={`${estimatedMinutes} min`}
              detail="At approximately 130 words/min"
            />
          </section>

          {/* Editor and teleprompter */}
          {activeScript ? (
            <section className="grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
              <div className="flex min-w-0 flex-col gap-5">
                <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                  <ScriptEditor
                    script={activeScript}
                    onChange={handleScriptChange}
                    wordCount={wordCount}
                    duration={estimatedMinutes}
                  />
                </div>

                <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                  <SettingsPanel
                    settings={settings}
                    setSettings={setSettings}
                  />
                </div>
              </div>

              <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5 xl:sticky xl:top-[88px]">
                <Teleprompter
                  key={activeScript.id}
                  script={activeScript}
                  settings={settings}
                />
              </div>
            </section>
          ) : (
            <section className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <FileText size={26} />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                No scripts yet
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Create a script to start using your teleprompter.
              </p>
              <button
                type="button"
                onClick={handleCreate}
                className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Create your first script
              </button>
            </section>
          )}

          <footer className="mt-8 flex flex-col gap-2 border-t border-slate-200 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <span>PromptFlow · Your words, your pace.</span>
            <span>Private by default · Stored on this device</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, detail }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            {value}
          </p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-400">{detail}</p>
    </div>
  );
}
