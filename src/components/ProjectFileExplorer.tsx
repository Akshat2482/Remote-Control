import React, { useState } from "react";
import { Folder, FileText, Check, Copy, Download, Code2, ChevronRight, FileCode, Workflow, Settings, Layers } from "lucide-react";
import { JARVIS_PROJECT_FILES } from "../data/jarvisProjectFiles";
import { AndroidProjectFile } from "../types";
import { sfx } from "../utils/audioEffects";

interface ProjectFileExplorerProps {
  onDownloadZip: () => void;
  isZipping: boolean;
}

export const ProjectFileExplorer: React.FC<ProjectFileExplorerProps> = ({
  onDownloadZip,
  isZipping,
}) => {
  const [selectedFile, setSelectedFile] = useState<AndroidProjectFile>(
    JARVIS_PROJECT_FILES[0]
  );
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    sfx.playChirp();
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "workflow":
        return <Workflow className="h-4 w-4 text-purple-400" />;
      case "gradle":
        return <Settings className="h-4 w-4 text-blue-400" />;
      case "kotlin":
        return <FileCode className="h-4 w-4 text-cyan-400" />;
      case "manifest":
        return <Layers className="h-4 w-4 text-amber-400" />;
      default:
        return <FileText className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Top Banner */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span>JARVIS Android Project Codebase</span>
            <span className="rounded bg-cyan-950 px-2 py-0.5 font-mono text-xs text-cyan-400 border border-cyan-800">
              {JARVIS_PROJECT_FILES.length} Files Ready
            </span>
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Every file in this explorer is packaged into <code className="text-cyan-300 font-mono">JARVIS_Android_App.zip</code>.
            Includes Kotlin Compose sources, Android 14 manifest, and GitHub Actions CI workflow.
          </p>
        </div>

        <button
          onClick={onDownloadZip}
          disabled={isZipping}
          className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 font-mono text-xs font-bold text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:bg-cyan-400 disabled:opacity-50 transition-all shrink-0"
        >
          <Download className="h-4 w-4" />
          <span>{isZipping ? "Packing ZIP..." : "Download Entire ZIP (All Files)"}</span>
        </button>
      </div>

      {/* Explorer Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
        {/* Left: File Tree (4 cols) */}
        <div className="border-b border-slate-800 lg:border-b-0 lg:border-r lg:col-span-4 p-4 max-h-[700px] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono text-slate-400">
            <span>PROJECT STRUCTURE</span>
            <span className="text-[10px] text-cyan-400 font-bold">JARVIS</span>
          </div>

          <div className="mt-3 space-y-1">
            {JARVIS_PROJECT_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => {
                    setSelectedFile(file);
                    sfx.playChirp();
                  }}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-left font-mono text-xs transition-all ${
                    isSelected
                      ? "bg-cyan-950/70 text-cyan-300 border border-cyan-700/60 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                      : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {getCategoryIcon(file.category)}
                    <span className="truncate">{file.path}</span>
                  </div>
                  {isSelected && <ChevronRight className="h-3.5 w-3.5 text-cyan-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: File Code & Details (8 cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between p-4 sm:p-6 bg-slate-950">
          <div>
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-white">
                    {selectedFile.path}
                  </span>
                  <span className="rounded bg-slate-900 px-2 py-0.5 font-mono text-[10px] text-cyan-400 border border-slate-800 uppercase">
                    {selectedFile.language}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {selectedFile.description}
                </p>
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-xs text-slate-200 hover:border-cyan-400 hover:text-white transition-colors self-start sm:self-auto shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Body */}
            <div className="mt-4 max-h-[560px] overflow-auto rounded-xl border border-slate-800 bg-[#090d16] p-4">
              <pre className="font-mono text-xs leading-relaxed text-slate-200">
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
