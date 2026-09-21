import React, { useState } from "react";
import { Sparkles, Code2, Check, Copy, Layers, Cpu, Compass, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { JARVIS_IDEAS } from "../data/jarvisIdeas";
import { JarvisIdea } from "../types";
import { sfx } from "../utils/audioEffects";

export const IdeaLab: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [ideas, setIdeas] = useState<JarvisIdea[]>(JARVIS_IDEAS);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    "All",
    "Vision & HUD",
    "Voice & Audio",
    "Automation",
    "Security",
    "IoT & Hardware",
    "Edge AI",
  ];

  const filteredIdeas =
    selectedCategory === "All"
      ? ideas
      : ideas.filter((item) => item.category === selectedCategory);

  const handleCopyCode = (id: string, code: string) => {
    sfx.playChirp();
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateCustomIdea = async () => {
    if (!customPrompt.trim()) return;
    setIsGenerating(true);
    sfx.playChirp();

    try {
      const res = await fetch("/api/jarvis/generate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: customPrompt }),
      });

      const data = await res.json();
      if (data.ideas && Array.isArray(data.ideas)) {
        const mapped: JarvisIdea[] = data.ideas.map((item: any, idx: number) => ({
          id: `custom-${Date.now()}-${idx}`,
          title: item.title || "Custom JARVIS Module",
          category: (item.category as any) || "Edge AI",
          badge: "AI Brainstorm",
          description: item.description || "Custom AI-generated capability for JARVIS Android.",
          keyCapabilities: item.keyCapabilities || [
            "Seamless integration into Jetpack Compose HUD",
            "Background worker automation with Coroutines",
            "GitHub Actions CI/CD compatible",
          ],
          androidComponents: item.techStack ? item.techStack.split("+").map((s: string) => s.trim()) : ["androidx.compose.ui", "kotlinx.coroutines"],
          kotlinSnippet: `// Custom Generated Android Module: ${item.title}
class JarvisCustomExtension {
    suspend fun executeProtocol() = withContext(Dispatchers.Default) {
        println("Executing: ${item.title}")
    }
}`,
          difficulty: "Advanced",
        }));

        setIdeas((prev) => [...mapped, ...prev]);
        setCustomPrompt("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header Banner */}
      <div className="mb-8 rounded-3xl border border-cyan-900/40 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md border border-cyan-700 bg-cyan-950 px-2.5 py-0.5 font-mono text-xs font-bold text-cyan-400">
                ARCHITECTURE BLUEPRINT
              </span>
              <span className="text-xs font-mono text-slate-400">
                Android 14 • Kotlin • Jetpack Compose
              </span>
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
              J.A.R.V.I.S. Feature & Architecture Ideas
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
              Transform this base Android app into an astonishing real-life assistant.
              Explore production-grade modules ranging from CameraX Augmented Reality HUDs to on-device wake words and IoT command protocols.
            </p>
          </div>

          {/* AI Idea Generator Input */}
          <div className="w-full md:w-80 shrink-0 rounded-2xl border border-cyan-800/60 bg-slate-950/80 p-4 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300">
              <Sparkles className="h-4 w-4 text-cyan-400 animate-spin" />
              <span>Brainstorm with JARVIS AI</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Type any concept to generate Android architecture & Kotlin snippets:
            </p>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerateCustomIdea()}
                placeholder="e.g. Smart ring gesture control..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
              <button
                onClick={handleGenerateCustomIdea}
                disabled={isGenerating || !customPrompt.trim()}
                className="shrink-0 rounded-xl bg-cyan-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-50 transition-colors"
              >
                {isGenerating ? "..." : "Generate"}
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-slate-800/80 pt-4">
          <span className="text-xs font-mono text-slate-500 mr-2">Filter Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3 py-1 text-xs font-mono font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)] font-bold"
                  : "bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredIdeas.map((idea) => (
          <div
            key={idea.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg hover:border-cyan-500/40 transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <span className="rounded-md border border-cyan-800/60 bg-cyan-950/60 px-2 py-0.5 font-mono text-[10px] font-semibold text-cyan-400">
                  {idea.category}
                </span>
                <span
                  className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    idea.difficulty === "Cutting-Edge"
                      ? "bg-purple-950 text-purple-300 border border-purple-800"
                      : idea.difficulty === "Advanced"
                      ? "bg-amber-950 text-amber-300 border border-amber-800"
                      : "bg-blue-950 text-blue-300 border border-blue-800"
                  }`}
                >
                  {idea.difficulty}
                </span>
              </div>

              <h3 className="mt-3 text-lg font-bold text-white tracking-tight">
                {idea.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                {idea.description}
              </p>

              {/* Key Capabilities */}
              <div className="mt-4">
                <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  Key Capabilities:
                </span>
                <ul className="mt-1.5 space-y-1 text-xs text-slate-400">
                  {idea.keyCapabilities.map((cap, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-cyan-400">›</span>
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Android Stack Badges */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {idea.androidComponents.map((comp, i) => (
                  <span
                    key={i}
                    className="rounded bg-slate-950 px-2 py-0.5 font-mono text-[10px] text-slate-400 border border-slate-800"
                  >
                    {comp}
                  </span>
                ))}
              </div>
            </div>

            {/* Kotlin Code Snippet */}
            <div className="mt-5 pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between pb-1.5">
                <span className="font-mono text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <Code2 className="h-3 w-3 text-cyan-400" />
                  <span>Kotlin Architecture</span>
                </span>
                <button
                  onClick={() => handleCopyCode(idea.id, idea.kotlinSnippet)}
                  className="flex items-center gap-1 font-mono text-[10px] text-cyan-400 hover:text-cyan-300"
                >
                  {copiedId === idea.id ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy Snippet</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 p-2.5 font-mono text-[10px] leading-relaxed text-cyan-200/90 no-scrollbar">
                <code>{idea.kotlinSnippet}</code>
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
