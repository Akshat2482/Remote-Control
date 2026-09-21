import React from "react";
import { Download, Terminal, Cpu, Lightbulb, GitBranch, Shield, Sparkles, MousePointer } from "lucide-react";
import { ZipGenerationProgress } from "../utils/zipGenerator";

interface NavbarProps {
  activeTab: "simulator" | "remote" | "ideas" | "files" | "github";
  setActiveTab: (tab: "simulator" | "remote" | "ideas" | "files" | "github") => void;
  onDownloadZip: () => void;
  zipProgress: ZipGenerationProgress;
  totalFiles: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onDownloadZip,
  zipProgress,
  totalFiles,
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-cyan-900/40 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-950/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Cpu className="h-6 w-6 animate-pulse" />
            <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-black tracking-wider text-cyan-300">
                J.A.R.V.I.S.
              </span>
              <span className="rounded bg-cyan-950/80 px-2 py-0.5 font-mono text-[10px] font-semibold text-cyan-400 border border-cyan-800/60">
                ANDROID OS v4.2
              </span>
            </div>
            <p className="hidden text-xs text-slate-400 sm:block">
              Jetpack Compose • Kotlin • PC Remote Automation
            </p>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <nav className="flex items-center gap-1 rounded-xl border border-slate-800/80 bg-slate-900/60 p-1">
          <button
            id="tab-remote"
            onClick={() => setActiveTab("remote")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-xs font-semibold transition-all ${
              activeTab === "remote"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <MousePointer className="h-3.5 w-3.5 text-cyan-400" />
            <span>PC Remote & Cursor</span>
            <span className="rounded-full bg-cyan-500/20 px-1.5 py-0.2 text-[9px] text-cyan-300 border border-cyan-500/40 font-bold">
              LIVE
            </span>
          </button>

          <button
            id="tab-simulator"
            onClick={() => setActiveTab("simulator")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-xs font-semibold transition-all ${
              activeTab === "simulator"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>HUD Simulator</span>
          </button>

          <button
            id="tab-ideas"
            onClick={() => setActiveTab("ideas")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-xs font-semibold transition-all ${
              activeTab === "ideas"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Lightbulb className="h-3.5 w-3.5" />
            <span>JARVIS Ideas</span>
            <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[9px] text-amber-300 border border-amber-500/40">
              6+
            </span>
          </button>

          <button
            id="tab-files"
            onClick={() => setActiveTab("files")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-xs font-semibold transition-all ${
              activeTab === "files"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            <span>Code & ZIP</span>
            <span className="rounded-full bg-cyan-950 px-1.5 py-0.2 text-[9px] text-cyan-400 border border-cyan-800">
              {totalFiles}
            </span>
          </button>

          <button
            id="tab-github"
            onClick={() => setActiveTab("github")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-xs font-semibold transition-all ${
              activeTab === "github"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <GitBranch className="h-3.5 w-3.5" />
            <span>GitHub CI/CD</span>
          </button>
        </nav>

        {/* Right: Download Action */}
        <div className="flex items-center gap-3">
          <button
            id="btn-download-zip-top"
            onClick={onDownloadZip}
            disabled={zipProgress.status === "zipping"}
            className="group relative flex items-center gap-2 overflow-hidden rounded-xl border border-cyan-400/50 bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 font-mono text-xs font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:scale-105 hover:border-cyan-300 hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] disabled:opacity-50"
          >
            <Download className={`h-4 w-4 ${zipProgress.status === "zipping" ? "animate-bounce" : "group-hover:-translate-y-0.5 transition-transform"}`} />
            <span>
              {zipProgress.status === "zipping"
                ? `Packing (${zipProgress.percent}%)...`
                : "Download JARVIS.zip"}
            </span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
          </button>
        </div>
      </div>
    </header>
  );
};
