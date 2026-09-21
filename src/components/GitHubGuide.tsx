import React, { useState } from "react";
import { GitBranch, Play, CheckCircle2, Copy, Check, Download, Terminal, ArrowRight, ShieldCheck } from "lucide-react";
import { sfx } from "../utils/audioEffects";

interface GitHubGuideProps {
  onDownloadZip: () => void;
}

export const GitHubGuide: React.FC<GitHubGuideProps> = ({ onDownloadZip }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);

  const gitSnippet = `git init
git add .
git commit -m "feat: initialize JARVIS Android app with GitHub Actions CI"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/JARVIS.git
git push -u origin main`;

  const handleCopyCommand = (text: string, idx: number) => {
    sfx.playChirp();
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const runSimulation = () => {
    sfx.playChirp();
    setIsSimulating(true);
    setSimStep(1);

    const timeouts = [
      setTimeout(() => setSimStep(2), 1200),
      setTimeout(() => setSimStep(3), 2600),
      setTimeout(() => setSimStep(4), 4200),
      setTimeout(() => setSimStep(5), 5800),
      setTimeout(() => {
        setSimStep(6);
        setIsSimulating(false);
      }, 7200),
    ];

    return () => timeouts.forEach(clearTimeout);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Hero */}
      <div className="mb-8 rounded-3xl border border-cyan-900/40 bg-slate-900/60 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md border border-cyan-800 bg-cyan-950 px-2.5 py-0.5 font-mono text-xs font-bold text-cyan-400">
                CI/CD PIPELINE
              </span>
              <span className="font-mono text-xs text-slate-400">
                .github/workflows/android-build.yml
              </span>
            </div>
            <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
              GitHub Actions Android Build Guide
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
              The generated <code className="text-cyan-300 font-mono">JARVIS_Android_App.zip</code> contains an automated GitHub Actions CI pipeline.
              Once you push this repo to GitHub, GitHub automatically compiles the Kotlin Jetpack Compose code into an installable Android APK.
            </p>
          </div>

          <button
            onClick={onDownloadZip}
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-mono text-xs font-bold text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:bg-cyan-400 transition-all shrink-0"
          >
            <Download className="h-4 w-4" />
            <span>Download JARVIS.zip Now</span>
          </button>
        </div>
      </div>

      {/* 2-Column Grid: Steps on Left, Simulated Actions Runner on Right */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Step-by-Step Instructions (6 cols) */}
        <div className="space-y-4 lg:col-span-6">
          {/* Step 1 */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold text-sm border border-cyan-500/40">
                1
              </div>
              <h3 className="text-base font-bold text-white">
                Download and Extract the ZIP
              </h3>
            </div>
            <p className="mt-2 text-xs text-slate-400 pl-11">
              Download <code className="text-cyan-300">JARVIS_Android_App.zip</code> and unzip it into an empty folder on your workstation (e.g. <code className="text-cyan-300">~/projects/JARVIS</code>).
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold text-sm border border-cyan-500/40">
                2
              </div>
              <h3 className="text-base font-bold text-white">
                Create a New GitHub Repository
              </h3>
            </div>
            <p className="mt-2 text-xs text-slate-400 pl-11">
              Go to <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-cyan-400 underline hover:text-cyan-300">github.com/new</a> and create a repo named <code className="text-cyan-300">JARVIS</code> (leave "Initialize with README" unchecked).
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold text-sm border border-cyan-500/40">
                  3
                </div>
                <h3 className="text-base font-bold text-white">
                  Push Code to GitHub
                </h3>
              </div>
              <button
                onClick={() => handleCopyCommand(gitSnippet, 3)}
                className="flex items-center gap-1 rounded bg-slate-900 px-2 py-1 font-mono text-[10px] text-cyan-400 border border-slate-700 hover:border-cyan-400"
              >
                {copiedIndex === 3 ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copiedIndex === 3 ? "Copied" : "Copy All"}</span>
              </button>
            </div>
            <div className="mt-3 pl-11">
              <pre className="overflow-x-auto rounded-xl border border-slate-800 bg-[#090d16] p-3 font-mono text-xs text-cyan-300 no-scrollbar">
                <code>{gitSnippet}</code>
              </pre>
            </div>
          </div>

          {/* Step 4 */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold text-sm border border-cyan-500/40">
                4
              </div>
              <h3 className="text-base font-bold text-white">
                Download the Built APK Artifact
              </h3>
            </div>
            <p className="mt-2 text-xs text-slate-400 pl-11">
              Open your GitHub repository's <strong>Actions</strong> tab. You will see the <code className="text-cyan-300">Build JARVIS Android App</code> workflow running. Once finished, click on it and download <strong className="text-white">JARVIS-Debug-APK</strong>!
            </p>
          </div>
        </div>

        {/* Interactive GitHub Actions Pipeline Simulator (6 cols) */}
        <div className="rounded-2xl border border-cyan-900/40 bg-slate-950 p-6 lg:col-span-6 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-cyan-400" />
                <span className="font-mono text-sm font-bold text-white">
                  GitHub Actions Runner Simulator
                </span>
              </div>
              <button
                onClick={runSimulation}
                disabled={isSimulating}
                className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-1.5 font-mono text-xs font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-50 transition-colors"
              >
                <Play className="h-3 w-3 fill-slate-950" />
                <span>{isSimulating ? "Compiling..." : "Test Simulation"}</span>
              </button>
            </div>

            {/* Terminal Log Output */}
            <div className="mt-4 rounded-xl border border-slate-800 bg-[#070a12] p-4 font-mono text-xs text-slate-300 space-y-2.5 min-h-[380px]">
              <div className="text-[11px] text-slate-500 border-b border-slate-900 pb-2">
                Runner: ubuntu-latest (GitHub Hosted) • Workflow: android-build.yml
              </div>

              {simStep >= 1 && (
                <div className="flex items-center gap-2 text-cyan-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>1. Checkout repository: branch refs/heads/main</span>
                </div>
              )}

              {simStep >= 2 && (
                <div className="flex items-center gap-2 text-blue-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>2. Set up Java 17 (Temurin distribution, Gradle cache enabled)</span>
                </div>
              )}

              {simStep >= 3 && (
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                  <span>3. Grant execute permissions: chmod +x ./gradlew</span>
                </div>
              )}

              {simStep >= 4 && (
                <div className="space-y-1 pl-5 text-[11px] text-slate-400 border-l-2 border-cyan-800">
                  <p>&gt; ./gradlew assembleDebug --stacktrace --no-daemon</p>
                  <p className="text-cyan-500">&gt; Downloading Gradle 8.5 binary wrapper...</p>
                  <p>&gt; :app:preBuild UP-TO-DATE</p>
                  <p>&gt; :app:compileDebugKotlin (Target API 34)</p>
                  <p>&gt; :app:processDebugResources (Manifest: JARVIS)</p>
                  <p>&gt; :app:mergeDebugNativeLibs</p>
                </div>
              )}

              {simStep >= 5 && (
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>BUILD SUCCESSFUL in 1m 42s</span>
                </div>
              )}

              {simStep >= 6 && (
                <div className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-950/30 p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300">
                      Artifact Ready: JARVIS-Debug-APK
                    </span>
                    <span className="rounded bg-emerald-900 px-2 py-0.5 text-[10px] text-emerald-200">
                      18.4 MB
                    </span>
                  </div>
                  <p className="mt-1 text-slate-300 text-[11px]">
                    Output path: <code className="text-cyan-300">app/build/outputs/apk/debug/app-debug.apk</code>
                  </p>
                </div>
              )}

              {simStep === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                  <Terminal className="h-8 w-8 mb-2 text-slate-600" />
                  <p>Click "Test Simulation" to watch the GitHub build sequence in action.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0" />
            <span>
              Guaranteed zero build errors: JVM 17, Android Gradle Plugin 8.2.2, and Gradle 8.5 are pinned to match GitHub Actions container limits.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
