import { useEffect, useRef, useState } from "react";
import {
  Maximize,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  Clock3,
  Type,
} from "lucide-react";

export default function Teleprompter({ script, settings }) {
  const panelRef = useRef(null);
  const viewportRef = useRef(null);
  const frameRef = useRef(null);
  const lastTimeRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const content = script?.content || "";
  const hasContent = Boolean(content.trim());
  const words = hasContent ? content.trim().split(/\s+/).length : 0;

  const estimatedSeconds = Math.max(1, (words / 130) * 60);

  const estimatedLabel =
    estimatedSeconds >= 60
      ? `${Math.floor(estimatedSeconds / 60)}m ${Math.round(
          estimatedSeconds % 60,
        )}s`
      : `${Math.round(estimatedSeconds)}s`;

  // Cancel any pending animation frame.
  function cancelAnimation() {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }

  // Restart scrolling from the beginning.
  function reset() {
    setPlaying(false);
    cancelAnimation();
    lastTimeRef.current = null;

    if (viewportRef.current) {
      viewportRef.current.scrollTop = 0;
    }

    setProgress(0);
  }

  // Play or pause without jumping the scroll position.
  function togglePlayback() {
    lastTimeRef.current = null;
    setPlaying((current) => !current);
  }

  // Toggle fullscreen on the complete teleprompter panel.
  async function toggleFullscreen() {
    const element = panelRef.current;

    if (!element) return;

    try {
      if (document.fullscreenElement === element) {
        await document.exitFullscreen();
      } else if (!document.fullscreenElement) {
        await element.requestFullscreen();
      } else {
        await document.exitFullscreen();
        await element.requestFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen could not be opened:", error);
    }
  }

  // Recalculate dimensions continuously while scrolling.
  useEffect(() => {
    if (!playing) {
      cancelAnimation();
      lastTimeRef.current = null;
      return;
    }

    function animate(timestamp) {
      const viewport = viewportRef.current;

      if (!viewport) {
        frameRef.current = null;
        setPlaying(false);
        return;
      }

      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }

      const delta = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);

      lastTimeRef.current = timestamp;

      // Read the current dimensions on every frame.
      // These may change when entering or leaving fullscreen.
      const maxScroll = Math.max(
        0,
        viewport.scrollHeight - viewport.clientHeight,
      );

      if (maxScroll <= 0) {
        viewport.scrollTop = 0;
        setProgress(0);
        frameRef.current = null;
        setPlaying(false);
        return;
      }

      const durationSeconds = Math.max(1, Number(settings.duration) * 60 || 1);

      const speed = Math.max(0.1, Number(settings.speed) || 1);

      const pixelsPerSecond = (maxScroll / durationSeconds) * speed;

      const nextScrollTop = Math.min(
        viewport.scrollTop + pixelsPerSecond * delta,
        maxScroll,
      );

      viewport.scrollTop = nextScrollTop;

      const nextProgress = Math.min(100, (nextScrollTop / maxScroll) * 100);

      setProgress(nextProgress);

      if (nextScrollTop >= maxScroll - 1) {
        viewport.scrollTop = maxScroll;
        setProgress(100);
        frameRef.current = null;
        lastTimeRef.current = null;
        setPlaying(false);
        return;
      }

      frameRef.current = requestAnimationFrame(animate);
    }

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimation();
      lastTimeRef.current = null;
    };
  }, [
    playing,
    settings.duration,
    settings.speed,
    settings.fontSize,
    settings.lineHeight,
    content,
  ]);

  // Keep the animation timing stable when fullscreen changes.
  useEffect(() => {
    function handleFullscreenChange() {
      lastTimeRef.current = null;

      // Allow the browser to finish its fullscreen layout update
      // before the next animation frame reads the dimensions.
      if (viewportRef.current) {
        const viewport = viewportRef.current;
        const maxScroll = Math.max(
          0,
          viewport.scrollHeight - viewport.clientHeight,
        );

        if (maxScroll > 0) {
          setProgress(Math.min(100, (viewport.scrollTop / maxScroll) * 100));
        }
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Keyboard shortcuts.
  useEffect(() => {
    function onKeyDown(event) {
      const target = event.target;
      const tag = target?.tagName;

      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target?.isContentEditable
      ) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        lastTimeRef.current = null;
        setPlaying((current) => !current);
      }

      if (event.key.toLowerCase() === "r") {
        reset();
      }

      if (event.key === "Escape" && document.fullscreenElement) {
        document.exitFullscreen().catch((error) => {
          console.error("Could not exit fullscreen:", error);
        });
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <section
      ref={panelRef}
      className="teleprompter-panel flex min-w-0 flex-col gap-5 bg-white text-slate-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Type size={19} />
            </span>

            <h2 className="text-base font-bold tracking-tight sm:text-lg">
              Live teleprompter
            </h2>
          </div>

          <p className="mt-1 pl-11 text-sm text-slate-500">
            Read at your own pace.
          </p>
        </div>

        <button
          type="button"
          onClick={toggleFullscreen}
          title="Toggle fullscreen"
          aria-label="Toggle fullscreen"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
        >
          <Maximize size={18} />
        </button>
      </div>

      {/* Preview stage */}
      <div className="teleprompter-stage overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-inner">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <span
              className={`size-2 rounded-full ${
                playing ? "animate-pulse bg-emerald-400" : "bg-slate-500"
              }`}
            />

            <span className="text-[10px] font-bold tracking-[0.16em] text-slate-300">
              {playing ? "SCROLLING" : "PREVIEW"}
            </span>
          </div>

          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock3 size={13} />
            {estimatedLabel} read
          </span>
        </div>

        <div className="teleprompter-reading-area relative min-h-0">
          {/* Reading guides */}
          <div className="pointer-events-none absolute inset-x-0 top-[22%] z-10 border-t border-rose-400/40" />
          <div className="pointer-events-none absolute inset-x-0 top-[66%] z-10 border-t border-rose-400/40" />

          {/* Reading viewport */}
          <div
            ref={viewportRef}
            aria-label="Teleprompter reading area"
            className="teleprompter-viewport h-[360px] overflow-y-auto overscroll-contain px-5 py-16 text-center text-slate-100 sm:h-[440px] sm:px-8 sm:py-20 lg:h-[520px] lg:px-10"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#475569 transparent",
            }}
          >
            <div
              className="mx-auto max-w-2xl whitespace-pre-wrap break-words font-medium tracking-wide"
              style={{
                fontSize: `clamp(20px, ${settings.fontSize}px, 56px)`,
                lineHeight: settings.lineHeight,
                transform: settings.mirror ? "scaleX(-1)" : "none",
              }}
            >
              {hasContent ? (
                content
              ) : (
                <span className="font-normal text-slate-500">
                  Your script will appear here.
                  {"\n\n"}
                  Add your content in the editor to get started.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div
          className="h-1 w-full bg-white/10"
          role="progressbar"
          aria-label="Reading progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          <div
            className="h-full bg-indigo-400 transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-3 text-xs text-slate-400 sm:px-5">
          <span>{words} words</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
      </div>

      {/* Playback controls */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1.5fr_1fr]">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 active:scale-[0.98]"
        >
          <RotateCcw size={16} />
          Restart
        </button>

        <button
          type="button"
          onClick={togglePlayback}
          disabled={!hasContent}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {playing ? <Pause size={19} /> : <Play size={19} />}
          {playing ? "Pause reading" : "Start reading"}
        </button>

        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 active:scale-[0.98]"
        >
          <SkipBack size={16} />
          Beginning
        </button>
      </div>

      {/* Keyboard shortcuts */}
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-400">
        <span className="flex items-center gap-2">
          <kbd className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-slate-600">
            Space
          </kbd>
          Play / pause
        </span>

        <span className="flex items-center gap-2">
          <kbd className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-slate-600">
            R
          </kbd>
          Restart
        </span>

        <span className="flex items-center gap-2">
          <kbd className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-slate-600">
            Esc
          </kbd>
          Exit fullscreen
        </span>
      </div>

      {/* Fullscreen layout: use named classes, not DOM position selectors. */}
      <style>{`
        .teleprompter-panel:fullscreen {
          box-sizing: border-box;
          width: 100%;
          height: 100%;
          height: 100dvh;
          min-height: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: clamp(12px, 2vw, 28px);
          background: #ffffff;
        }

        .teleprompter-panel:fullscreen .teleprompter-stage {
          flex: 1 1 0;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }

        .teleprompter-panel:fullscreen .teleprompter-reading-area {
          flex: 1 1 0;
          min-height: 0;
        }

        .teleprompter-panel:fullscreen .teleprompter-viewport {
          height: 100%;
          min-height: 0;
          max-height: none;
          overscroll-behavior: contain;
        }

        .teleprompter-panel:fullscreen > div:nth-of-type(3),
        .teleprompter-panel:fullscreen > div:nth-of-type(4) {
          flex-shrink: 0;
        }

        @media (max-width: 640px) {
          .teleprompter-panel:fullscreen {
            gap: 10px;
            padding: 12px;
          }
        }
      `}</style>
    </section>
  );
}
