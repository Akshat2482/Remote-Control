import React, { useRef, useState } from "react";
import {
  Zap,
  FileText,
  Bell,
  BellRing,
  RotateCcw,
  Terminal,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Lock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface SwipableMacroDeckProps {
  onTriggerMacro: (action: string, description: string) => void;
  onExtractOcr: () => void;
  isExtractingOcr: boolean;
  isWatchdogEnabled: boolean;
  onToggleWatchdog: () => void;
  onHaptic: (pattern?: number[]) => void;
  onAudioFeedback: (freq?: number, type?: OscillatorType, duration?: number) => void;
}

export const SwipableMacroDeck: React.FC<SwipableMacroDeckProps> = ({
  onTriggerMacro,
  onExtractOcr,
  isExtractingOcr,
  isWatchdogEnabled,
  onToggleWatchdog,
  onHaptic,
  onAudioFeedback,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePageIndex, setActivePageIndex] = useState(0);

  // Update active dot based on scroll position
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const pageIdx = Math.round(el.scrollLeft / (el.clientWidth * 0.85 || 1));
    setActivePageIndex(Math.min(Math.max(pageIdx, 0), 2));
  };

  const scrollToPage = (index: number) => {
    const el = containerRef.current;
    if (!el) return;
    onHaptic([20]);
    onAudioFeedback(800 + index * 100, "sine", 0.05);
    el.scrollTo({
      left: index * el.clientWidth * 0.92,
      behavior: "smooth",
    });
    setActivePageIndex(index);
  };

  return (
    <div className="w-full shrink-0 mb-1.5 flex flex-col select-none">
      {/* Category Tabs & Swipe Hint */}
      <div className="flex items-center justify-between px-1 mb-1 text-[10px] font-mono text-cyan-900">
        <div className="flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-cyan-600 animate-pulse" />
          <span className="font-bold tracking-wider text-slate-800">QUICK MACROS</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-slate-600 font-medium">
          <span className="opacity-80">Swipe</span>
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                onClick={() => scrollToPage(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activePageIndex === idx
                    ? "w-4 bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                    : "w-1.5 bg-slate-300/80 hover:bg-slate-400"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Horizontally Swipable Deck with Scroll Snap */}
      <div className="relative group">
        {/* Left / Right Quick Chevron Arrows for accessibility */}
        {activePageIndex > 0 && (
          <button
            onClick={() => scrollToPage(activePageIndex - 1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-6 w-6 rounded-full bg-white/80 border border-white/90 backdrop-blur-md text-slate-700 flex items-center justify-center -ml-1 active:scale-90 transition-all shadow-md touch-manipulation cursor-pointer hover:bg-white"
            aria-label="Previous macros"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        )}

        {activePageIndex < 2 && (
          <button
            onClick={() => scrollToPage(activePageIndex + 1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-6 w-6 rounded-full bg-white/80 border border-white/90 backdrop-blur-md text-slate-700 flex items-center justify-center -mr-1 active:scale-90 transition-all shadow-md touch-manipulation cursor-pointer hover:bg-white"
            aria-label="Next macros"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}

        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="w-full flex items-stretch gap-2 overflow-x-auto snap-x snap-mandatory scroll-smooth touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5 px-0.5"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {/* SLIDE 1: Claude & AI Directives */}
          <div className="snap-center shrink-0 w-[92%] xs:w-[88%] rounded-2xl p-2 liquid-glass-card flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[9px] font-mono text-cyan-900 pb-0.5 border-b border-white/40 font-semibold">
              <span className="font-bold flex items-center gap-1 text-slate-800">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
                CLAUDE & AI WORKFLOW
              </span>
              <span className="text-slate-500">1 of 3</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {/* Macro: Continue Claude */}
              <button
                onClick={() => onTriggerMacro("claude_continue", "Continue Claude")}
                className="liquid-glass-pill p-2 rounded-xl flex items-center gap-2 active:scale-95 transition-all touch-manipulation text-left group/btn cursor-pointer"
                title="Send 'continue' + Enter to Claude"
              >
                <div className="h-7 w-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-600 shrink-0 group-hover/btn:bg-cyan-500/25">
                  <Zap className="h-4 w-4 text-cyan-600 animate-pulse" />
                </div>
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="text-[11px] font-bold text-slate-900 truncate">Continue</div>
                  <div className="text-[9px] text-cyan-700 font-mono truncate">Type &apos;continue&apos; ↵</div>
                </div>
              </button>

              {/* OCR Screen Text Extractor */}
              <button
                onClick={onExtractOcr}
                disabled={isExtractingOcr}
                className="liquid-glass-pill p-2 rounded-xl flex items-center gap-2 active:scale-95 transition-all touch-manipulation text-left group/btn cursor-pointer"
                title="Extract text/code from screen via Gemini"
              >
                <div className="h-7 w-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-600 shrink-0 group-hover/btn:bg-blue-500/25">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="text-[11px] font-bold text-slate-900 truncate">
                    {isExtractingOcr ? "Scanning..." : "OCR Text"}
                  </div>
                  <div className="text-[9px] text-slate-600 font-mono truncate">Copy to Phone</div>
                </div>
              </button>

              {/* Claude Watchdog Toggle */}
              <button
                onClick={onToggleWatchdog}
                className={`p-2 rounded-xl flex items-center gap-2 active:scale-95 transition-all touch-manipulation text-left cursor-pointer ${
                  isWatchdogEnabled
                    ? "liquid-glass-active text-cyan-950 font-bold border-cyan-400"
                    : "liquid-glass-pill text-slate-700"
                }`}
                title="Auto-alert & vibrate when Claude finishes generating"
              >
                <div
                  className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isWatchdogEnabled
                      ? "bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                      : "bg-white/80 border border-slate-200 text-slate-600"
                  }`}
                >
                  {isWatchdogEnabled ? (
                    <BellRing className="h-4 w-4 animate-bounce" />
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="text-[11px] font-bold text-slate-900 truncate">Watchdog</div>
                  <div className="text-[9px] text-cyan-800 font-mono truncate">
                    {isWatchdogEnabled ? "ACTIVE (Vibrates)" : "Disabled"}
                  </div>
                </div>
              </button>

              {/* Macro: Restart Dev Server */}
              <button
                onClick={() => onTriggerMacro("restart_server", "Restart Dev Server")}
                className="liquid-glass-pill p-2 rounded-xl flex items-center gap-2 active:scale-95 transition-all touch-manipulation text-left group/btn cursor-pointer"
                title="Ctrl+C & npm run dev"
              >
                <div className="h-7 w-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shrink-0 group-hover/btn:bg-emerald-500/25">
                  <RotateCcw className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="text-[11px] font-bold text-slate-900 truncate">Restart Dev</div>
                  <div className="text-[9px] text-emerald-700 font-mono truncate">npm run dev</div>
                </div>
              </button>
            </div>
          </div>

          {/* SLIDE 2: Workstation & Terminal Macros */}
          <div className="snap-center shrink-0 w-[92%] xs:w-[88%] rounded-2xl p-2 liquid-glass-card flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[9px] font-mono text-indigo-900 pb-0.5 border-b border-white/40 font-semibold">
              <span className="font-bold flex items-center gap-1 text-slate-800">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                WORKSTATION & GIT
              </span>
              <span className="text-slate-500">2 of 3</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {/* Macro: Git Commit & Push */}
              <button
                onClick={() => onTriggerMacro("git_quick_push", "Git Commit & Push")}
                className="liquid-glass-pill p-2 rounded-xl flex items-center gap-2 active:scale-95 transition-all touch-manipulation text-left group/btn cursor-pointer"
                title="Git commit and push changes"
              >
                <div className="h-7 w-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-600 shrink-0 group-hover/btn:bg-indigo-500/25">
                  <Terminal className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="text-[11px] font-bold text-slate-900 truncate">Git Push</div>
                  <div className="text-[9px] text-indigo-700 font-mono truncate">add . &amp;&amp; push</div>
                </div>
              </button>

              {/* Macro: Emergency Kill */}
              <button
                onClick={() => onTriggerMacro("emergency_kill", "Emergency Kill (Ctrl+C)")}
                className="liquid-glass-pill p-2 rounded-xl flex items-center gap-2 active:scale-95 transition-all touch-manipulation text-left group/btn cursor-pointer"
                title="Send double Ctrl+C to terminate running task"
              >
                <div className="h-7 w-7 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-600 shrink-0 group-hover/btn:bg-rose-500/25">
                  <X className="h-4 w-4 text-rose-600" />
                </div>
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="text-[11px] font-bold text-rose-800 truncate">Kill Task</div>
                  <div className="text-[9px] text-rose-700 font-mono truncate">Ctrl+C ×2</div>
                </div>
              </button>

              {/* Macro: Lock Workstation */}
              <button
                onClick={() => onTriggerMacro("lock_pc", "Lock Workstation")}
                className="liquid-glass-pill p-2 rounded-xl flex items-center gap-2 active:scale-95 transition-all touch-manipulation text-left group/btn cursor-pointer"
                title="Lock Windows PC Screen"
              >
                <div className="h-7 w-7 rounded-lg bg-slate-300/40 border border-slate-400/40 flex items-center justify-center text-slate-700 shrink-0 group-hover/btn:bg-slate-300/60">
                  <Lock className="h-4 w-4 text-slate-700" />
                </div>
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="text-[11px] font-bold text-slate-900 truncate">Lock PC</div>
                  <div className="text-[9px] text-slate-600 font-mono truncate">Win + L</div>
                </div>
              </button>

              {/* Macro: Paste Clipboard */}
              <button
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    if (text) {
                      onTriggerMacro("paste_text", `Pasted clipboard (${text.substring(0, 15)}...)`);
                    }
                  } catch {
                    onTriggerMacro("paste_text", "Paste text");
                  }
                }}
                className="liquid-glass-pill p-2 rounded-xl flex items-center gap-2 active:scale-95 transition-all touch-manipulation text-left group/btn cursor-pointer"
                title="Paste phone clipboard directly to PC"
              >
                <div className="h-7 w-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-600 shrink-0 group-hover/btn:bg-cyan-500/25">
                  <Terminal className="h-4 w-4 text-cyan-600" />
                </div>
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="text-[11px] font-bold text-slate-900 truncate">Paste to PC</div>
                  <div className="text-[9px] text-cyan-700 font-mono truncate">Phone ➔ PC</div>
                </div>
              </button>
            </div>
          </div>

          {/* SLIDE 3: Media & Audio Controls */}
          <div className="snap-center shrink-0 w-[92%] xs:w-[88%] rounded-2xl p-2 liquid-glass-card flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[9px] font-mono text-teal-900 pb-0.5 border-b border-white/40 font-semibold">
              <span className="font-bold flex items-center gap-1 text-slate-800">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
                MEDIA & SYSTEM AUDIO
              </span>
              <span className="text-slate-500">3 of 3</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {/* Play / Pause */}
              <button
                onClick={() => onTriggerMacro("play_pause", "Play/Pause Media")}
                className="liquid-glass-pill p-2 rounded-xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all touch-manipulation cursor-pointer group/btn"
                title="Media Play/Pause"
              >
                <div className="flex items-center gap-0.5 text-cyan-600">
                  <Play className="h-4 w-4" />
                  <Pause className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-900 truncate">Play/Pause</span>
              </button>

              {/* Volume Up */}
              <button
                onClick={() => onTriggerMacro("volume_up", "Volume Up")}
                className="liquid-glass-pill p-2 rounded-xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all touch-manipulation cursor-pointer group/btn"
                title="Volume Up"
              >
                <Volume2 className="h-4 w-4 text-cyan-600" />
                <span className="text-[10px] font-bold text-slate-900 truncate">Vol +</span>
              </button>

              {/* Volume Down */}
              <button
                onClick={() => onTriggerMacro("volume_down", "Volume Down")}
                className="liquid-glass-pill p-2 rounded-xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all touch-manipulation cursor-pointer group/btn"
                title="Volume Down"
              >
                <Volume2 className="h-4 w-4 text-cyan-600" />
                <span className="text-[10px] font-bold text-slate-900 truncate">Vol -</span>
              </button>

              {/* Mute Audio */}
              <button
                onClick={() => onTriggerMacro("volume_mute", "Mute/Unmute Audio")}
                className="liquid-glass-pill p-2 rounded-xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all touch-manipulation cursor-pointer group/btn"
                title="Mute Audio"
              >
                <VolumeX className="h-4 w-4 text-slate-600" />
                <span className="text-[10px] font-bold text-slate-800 truncate">Mute</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
