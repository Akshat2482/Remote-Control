import React from "react";
import { Terminal, Code, Globe, MessageSquare, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";

interface SimulatedWorkstationScreenProps {
  activeWindow: "outlook" | "chrome" | "vscode" | "claude";
  onSelectWindow: (win: "outlook" | "chrome" | "vscode" | "claude") => void;
  cursorPos: { x: number; y: number };
  isDraggingCursor: boolean;
  onOpenConnectModal?: () => void;
  selectedMonitor: string;
}

export const SimulatedWorkstationScreen: React.FC<SimulatedWorkstationScreenProps> = ({
  activeWindow,
  onSelectWindow,
  cursorPos,
  isDraggingCursor,
  onOpenConnectModal,
  selectedMonitor,
}) => {
  return (
    <div className="relative w-full h-full bg-[#0a1128] overflow-hidden select-none flex flex-col font-sans">
      {/* Desktop Background Ambient Gradient & Grid */}
      <div className="absolute inset-0 bg-radial from-[#1e3a8a]/40 via-[#0f172a] to-[#020617] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Top Windows Bar / Virtual App Tabs */}
      <div className="relative z-10 flex items-center justify-between px-2 py-1 bg-slate-900/90 backdrop-blur-md border-b border-slate-700/60 text-[10px] text-slate-300 shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectWindow("claude");
            }}
            className={`px-2 py-0.5 rounded flex items-center gap-1 transition-all cursor-pointer ${
              activeWindow === "claude"
                ? "bg-[#d97706]/25 border border-[#d97706]/60 text-amber-200 font-bold"
                : "bg-slate-800/60 hover:bg-slate-800 text-slate-400"
            }`}
          >
            <MessageSquare className="h-2.5 w-2.5 text-amber-400" />
            <span>Claude 3.7</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectWindow("chrome");
            }}
            className={`px-2 py-0.5 rounded flex items-center gap-1 transition-all cursor-pointer ${
              activeWindow === "chrome"
                ? "bg-blue-600/30 border border-blue-500/60 text-blue-200 font-bold"
                : "bg-slate-800/60 hover:bg-slate-800 text-slate-400"
            }`}
          >
            <Globe className="h-2.5 w-2.5 text-blue-400" />
            <span>Chrome</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectWindow("vscode");
            }}
            className={`px-2 py-0.5 rounded flex items-center gap-1 transition-all cursor-pointer ${
              activeWindow === "vscode"
                ? "bg-cyan-600/30 border border-cyan-500/60 text-cyan-200 font-bold"
                : "bg-slate-800/60 hover:bg-slate-800 text-slate-400"
            }`}
          >
            <Code className="h-2.5 w-2.5 text-cyan-400" />
            <span>VS Code</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectWindow("outlook");
            }}
            className={`px-2 py-0.5 rounded flex items-center gap-1 transition-all cursor-pointer ${
              activeWindow === "outlook"
                ? "bg-emerald-600/30 border border-emerald-500/60 text-emerald-200 font-bold"
                : "bg-slate-800/60 hover:bg-slate-800 text-slate-400"
            }`}
          >
            <Terminal className="h-2.5 w-2.5 text-emerald-400" />
            <span>Terminal</span>
          </button>
        </div>

        {onOpenConnectModal && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenConnectModal();
            }}
            className="px-1.5 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 font-mono text-[9px] flex items-center gap-1 active:scale-95 transition-all cursor-pointer shrink-0"
            title="Connect your physical PC to see real live screen stream"
          >
            <ShieldCheck className="h-2.5 w-2.5 text-cyan-400" />
            <span>Connect Real PC</span>
          </button>
        )}
      </div>

      {/* Main Virtual Window Content */}
      <div className="relative z-10 flex-1 min-h-0 p-2 overflow-hidden flex flex-col justify-center">
        {activeWindow === "claude" && (
          <div className="w-full h-full bg-[#1e1e1e] rounded-lg border border-slate-700 shadow-2xl flex flex-col overflow-hidden text-slate-200 text-xs">
            {/* Window titlebar */}
            <div className="h-6 bg-[#2d2d2d] px-2.5 flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-700/80 shrink-0">
              <div className="flex items-center gap-1.5 font-medium">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span>Claude AI — Anthropic (Profile 14)</span>
              </div>
              <div className="flex items-center gap-1 text-[9px]">
                <span className="text-emerald-400">● 3.7 Sonnet</span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400 font-mono">1920×1080</span>
              </div>
            </div>

            {/* Claude Chat Feed */}
            <div className="flex-1 min-h-0 p-2.5 overflow-y-auto space-y-2 font-sans">
              <div className="bg-[#2b2b2b] rounded-lg p-2 border border-slate-700/60 max-w-[90%]">
                <p className="text-[10px] text-amber-300 font-semibold mb-0.5 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Claude 3.7 Sonnet:
                </p>
                <p className="text-[11px] text-slate-200 leading-relaxed">
                  I have completed the task and updated the workstation configurations. All tests pass with zero errors. Standing by for your next directive.
                </p>
              </div>

              <div className="bg-[#181818] rounded-md p-2 font-mono text-[9px] text-emerald-400 border border-slate-800">
                <code>✓ Compilation verified: 0 errors, 0 warnings (14ms)</code>
              </div>
            </div>

            {/* Claude Input Simulator */}
            <div className="p-2 bg-[#252525] border-t border-slate-700/60 flex items-center gap-1.5 shrink-0">
              <div className="flex-1 bg-[#1a1a1a] rounded px-2 py-1 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                <span>Reply to Claude or type &apos;continue&apos;...</span>
                <span className="h-3 w-1 bg-amber-400 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {activeWindow === "chrome" && (
          <div className="w-full h-full bg-[#1f2937] rounded-lg border border-slate-700 shadow-2xl flex flex-col overflow-hidden text-slate-200 text-xs">
            {/* Chrome Window Header */}
            <div className="h-6 bg-[#111827] px-2 flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-1 truncate max-w-[80%]">
                <Globe className="h-3 w-3 text-blue-400 shrink-0" />
                <span className="truncate">Google Chrome — YouTube (Profile 14)</span>
              </div>
              <div className="flex items-center gap-1.5 text-[8px] text-slate-500">
                <span>✕</span>
              </div>
            </div>

            {/* Chrome Omnibox */}
            <div className="px-2 py-1 bg-[#1f2937] border-b border-slate-700/60 flex items-center gap-1.5 text-[10px]">
              <div className="flex-1 bg-[#111827] rounded px-2 py-0.5 text-slate-300 font-mono truncate text-[9px]">
                https://www.youtube.com
              </div>
            </div>

            {/* Browser Content */}
            <div className="flex-1 min-h-0 p-2.5 flex flex-col items-center justify-center text-center bg-black/60">
              <div className="w-12 h-8 rounded bg-red-600 flex items-center justify-center text-white font-bold mb-1 shadow-md">
                ▶
              </div>
              <p className="text-[11px] font-bold text-white">YouTube Media Player</p>
              <p className="text-[9px] text-slate-400">Live Audio & Video Streaming Pipeline Ready</p>
            </div>
          </div>
        )}

        {activeWindow === "vscode" && (
          <div className="w-full h-full bg-[#1e1e1e] rounded-lg border border-slate-700 shadow-2xl flex flex-col overflow-hidden text-slate-200 text-xs font-mono">
            {/* VS Code Titlebar */}
            <div className="h-6 bg-[#323233] px-2 flex items-center justify-between text-[10px] text-slate-300 border-b border-slate-700 shrink-0">
              <div className="flex items-center gap-1.5">
                <Code className="h-3 w-3 text-cyan-400" />
                <span>VS Code — server.ts</span>
              </div>
              <span className="text-emerald-400 text-[9px]">TypeScript</span>
            </div>

            {/* Code Content */}
            <div className="flex-1 min-h-0 p-2 overflow-y-auto text-[9.5px] leading-relaxed text-slate-300 bg-[#1e1e1e]">
              <div className="text-purple-400">import <span className="text-white">&#123; GoogleGenAI &#125;</span> from <span className="text-emerald-300">&quot;@google/genai&quot;</span>;</div>
              <div className="text-purple-400">import <span className="text-white">&#123; WebSocketServer &#125;</span> from <span className="text-emerald-300">&quot;ws&quot;</span>;</div>
              <div className="mt-1 text-slate-500">// JARVIS Real-Time Relay Engine</div>
              <div className="text-cyan-300">const <span className="text-yellow-200">PORT</span> = 3000;</div>
              <div className="text-cyan-300">const <span className="text-yellow-200">ai</span> = <span className="text-blue-400">new</span> GoogleGenAI(&#123; model: <span className="text-emerald-300">&quot;gemini-3.6-flash&quot;</span> &#125;);</div>
              <div className="text-slate-400 mt-1">✓ Cloud Relay Active • Standing by for PC</div>
            </div>
          </div>
        )}

        {activeWindow === "outlook" && (
          <div className="w-full h-full bg-[#0c1017] rounded-lg border border-slate-700 shadow-2xl flex flex-col overflow-hidden text-slate-200 text-xs font-mono">
            {/* Terminal Titlebar */}
            <div className="h-6 bg-[#161b22] px-2 flex items-center justify-between text-[10px] text-slate-300 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-1.5">
                <Terminal className="h-3 w-3 text-emerald-400" />
                <span>Windows PowerShell — pc.py Agent</span>
              </div>
              <span className="text-cyan-400 text-[9px]">Active</span>
            </div>

            {/* Terminal Body */}
            <div className="flex-1 min-h-0 p-2 overflow-y-auto text-[9.5px] leading-relaxed text-emerald-400 bg-black/80 space-y-0.5">
              <p className="text-slate-400">PS C:\Users\JARVIS&gt; python pc.py</p>
              <p className="text-cyan-400">⚡ J.A.R.V.I.S. PC WORKSTATION AGENT ONLINE</p>
              <p className="text-slate-300">[INFO] External Screen Detected: 1920x1080</p>
              <p className="text-slate-300">[INFO] Chrome Profile 14 Synchronized</p>
              <p className="text-amber-400">[RELAY] Cloud Relay WebSocket Link Established (WSS)</p>
              <div className="flex items-center gap-1 text-white mt-1">
                <span>&gt; Standby for voice and mouse directives</span>
                <span className="h-3 w-1 bg-emerald-400 animate-pulse" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Windows 11 Desktop Taskbar at Bottom */}
      <div className="relative z-10 h-6 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-2 flex items-center justify-between shrink-0 text-[10px] text-slate-400">
        <div className="flex items-center gap-2">
          <div className="h-3.5 w-3.5 rounded bg-blue-500/80 flex items-center justify-center text-white font-bold text-[8px]">
            田
          </div>
          <span className="text-[9px] text-slate-400 hidden xs:inline">Windows 11</span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400 font-mono text-[9px] truncate">{selectedMonitor} display</span>
        </div>

        <div className="flex items-center gap-2 text-[9px]">
          <span className="flex items-center gap-1 text-emerald-400 font-mono">
            <CheckCircle2 className="h-2.5 w-2.5" />
            <span>Simulated</span>
          </span>
          <span className="font-mono text-slate-400">12:00 PM</span>
        </div>
      </div>

      {/* Simulated Windows Mouse Cursor */}
      <div
        className="absolute pointer-events-none z-30 transition-transform duration-75 ease-out select-none"
        style={{
          left: `${cursorPos.x}%`,
          top: `${cursorPos.y}%`,
          transform: "translate(-2px, -2px)",
        }}
      >
        <svg className="w-5 h-5 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 0l16 12.279-6.951 1.17 4.325 8.817-3.596 1.734-4.35-8.879-5.428 5.679z" />
        </svg>

        {isDraggingCursor && (
          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 h-6 w-6 rounded-full border border-cyan-400/80 bg-cyan-400/20 animate-ping pointer-events-none" />
        )}
      </div>
    </div>
  );
};
