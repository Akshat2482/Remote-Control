import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Shield, RefreshCw, Send, Volume2, Cpu, Zap, Wifi, BatteryCharging, AlertTriangle, CheckCircle2 } from "lucide-react";
import { sfx, speakAsJarvis } from "../utils/audioEffects";
import { SystemTelemetry, JarvisChatMessage } from "../types";

interface PhoneSimulatorProps {
  onTriggerGitHubGuide: () => void;
  onOpenIdeas: () => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  onTriggerGitHubGuide,
  onOpenIdeas,
}) => {
  const [telemetry, setTelemetry] = useState<SystemTelemetry>({
    reactorPower: 98,
    coreTemp: 36.4,
    neuralLatency: 14,
    securityLevel: "Nominal",
    speechState: "Idle",
    activeProtocol: "Mark 85 Standard",
  });

  const [inputQuery, setInputQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<JarvisChatMessage[]>([
    {
      id: "1",
      sender: "jarvis",
      text: "Greetings, sir. All J.A.R.V.I.S. subsystems are operational. The Android project ZIP is ready for GitHub compilation.",
      timestamp: "10:42 AM",
    },
  ]);

  const [logs, setLogs] = useState<string[]>([
    "[JARVIS-OS] Android 14 API 34 runtime initialized",
    "[COMPOSE] Holographic HUD rendering at 60 FPS",
    "[CI/CD] GitHub Actions workflow validated (.github/workflows/android-build.yml)",
    "[ARC-CORE] Telemetry streaming nominal (98% power)",
  ]);

  const recognitionRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);

  // Initialize Speech Recognition if supported in browser
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          setIsListening(true);
          setTelemetry((t) => ({ ...t, speechState: "Listening" }));
          sfx.playChirp();
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setIsListening(false);
          setTelemetry((t) => ({ ...t, speechState: "Processing" }));
          executeDirective(transcript, true);
        };

        recognition.onerror = () => {
          setIsListening(false);
          setTelemetry((t) => ({ ...t, speechState: "Idle" }));
        };

        recognition.onend = () => {
          setIsListening(false);
          setTelemetry((t) => ({ ...t, speechState: "Idle" }));
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Arc Reactor Hologram Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let angle = 0;
    let pulse = 0;

    const render = () => {
      angle += 0.015;
      pulse = Math.sin(Date.now() * 0.003) * 0.2 + 0.8;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const r = canvas.width * 0.42;

      // Outer cyan glow ring
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 229, 255, ${0.2 * pulse})`;
      ctx.lineWidth = 4;
      ctx.stroke();

      // Segmented rotating ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      const segments = 8;
      for (let i = 0; i < segments; i++) {
        ctx.beginPath();
        const start = (i * Math.PI * 2) / segments;
        const end = start + (Math.PI * 2) / segments * 0.65;
        ctx.arc(0, 0, r * 0.82, start, end);
        ctx.strokeStyle = i % 2 === 0 ? "#00E5FF" : "#38BDF8";
        ctx.lineWidth = 5;
        ctx.shadowColor = "#00E5FF";
        ctx.shadowBlur = 10 * pulse;
        ctx.stroke();
      }
      ctx.restore();

      // Counter-rotating inner ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-angle * 1.5);
      const innerSegs = 6;
      for (let i = 0; i < innerSegs; i++) {
        ctx.beginPath();
        const start = (i * Math.PI * 2) / innerSegs;
        const end = start + (Math.PI * 2) / innerSegs * 0.5;
        ctx.arc(0, 0, r * 0.58, start, end);
        ctx.strokeStyle = "#38BDF8";
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      ctx.restore();

      // Glowing triangular core energy
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle * 0.5);
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const theta = (i * 2 * Math.PI) / 3 - Math.PI / 2;
        const x = Math.cos(theta) * (r * 0.35);
        const y = Math.sin(theta) * (r * 0.35);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = "#00E5FF";
      ctx.lineWidth = 2.5;
      ctx.shadowColor = "#00E5FF";
      ctx.shadowBlur = 16 * pulse;
      ctx.stroke();
      ctx.fillStyle = `rgba(0, 229, 255, ${0.12 * pulse})`;
      ctx.fill();
      ctx.restore();

      // Central core orb
      ctx.beginPath();
      ctx.arc(cx, cy, 14 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.shadowColor = "#00E5FF";
      ctx.shadowBlur = 20;
      ctx.fill();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error(e);
        }
      } else {
        // Fallback if browser doesn't support Web Speech
        executeDirective("Report status and verify system");
      }
    }
  };

  const simCounter = useRef(0);
  const genUniqueSimId = (sender: "user" | "jarvis") => {
    simCounter.current += 1;
    return `${sender}-${Date.now()}-${simCounter.current}-${Math.random().toString(36).substring(2, 7)}`;
  };

  const executeDirective = async (queryText: string, isSpoken: boolean = false) => {
    if (!queryText.trim()) return;
    sfx.playChirp();

    const userMsg: JarvisChatMessage = {
      id: genUniqueSimId("user"),
      sender: "user",
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setTelemetry((t) => ({ ...t, speechState: "Processing" }));

    // Check for direct local action triggers
    const lower = queryText.toLowerCase();
    let actionTriggered = "";

    if (lower.includes("sentry") || lower.includes("lockdown")) {
      sfx.playAlert();
      setTelemetry((t) => ({
        ...t,
        securityLevel: t.securityLevel === "Nominal" ? "Lockdown" : "Nominal",
        activeProtocol: "Code Red Sentry Protocol",
      }));
      actionTriggered = "SENTRY_ENGAGED";
    } else if (lower.includes("mark 85") || lower.includes("armor")) {
      sfx.playReactorHum();
      setTelemetry((t) => ({
        ...t,
        activeProtocol: "Mark 85 Armor Matrix",
        reactorPower: 100,
        coreTemp: 38.2,
      }));
      actionTriggered = "MARK_85_ENGAGED";
    } else if (lower.includes("diagnostic") || lower.includes("health")) {
      sfx.playChirp();
      setTelemetry((t) => ({
        ...t,
        reactorPower: Math.floor(96 + Math.random() * 4),
        coreTemp: +(36.2 + Math.random() * 0.6).toFixed(1),
        neuralLatency: Math.floor(11 + Math.random() * 6),
      }));
    } else if (lower.includes("github") || lower.includes("build") || lower.includes("apk")) {
      sfx.playChirp();
      onTriggerGitHubGuide();
    }

    try {
      // Call server backend
      const res = await fetch("/api/jarvis/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: queryText,
          systemState: telemetry,
        }),
      });

      const data = await res.json();
      const replyText = data.text || "Directives synchronized, sir.";

      const jarvisMsg: JarvisChatMessage = {
        id: genUniqueSimId("jarvis"),
        sender: "jarvis",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actionTriggered,
      };

      setMessages((prev) => [...prev, jarvisMsg]);

      setLogs((l) => [
        `[DIRECTIVE] "${queryText}" -> ${replyText.slice(0, 40)}...`,
        ...l.slice(0, 8),
      ]);

      setTelemetry((t) => ({ ...t, speechState: "Idle" }));
      setIsSpeaking(false);
    } catch {
      const fallbackReply = "All systems operational, sir. GitHub build pipeline ready.";
      setMessages((prev) => [
        ...prev,
        {
          id: genUniqueSimId("jarvis"),
          sender: "jarvis",
          text: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setTelemetry((t) => ({ ...t, speechState: "Idle" }));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 lg:p-6">
      <div className="grid w-full max-w-6xl grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Col: The Android Phone Simulator Frame (5 cols) */}
        <div className="flex justify-center lg:col-span-5">
          <div className="relative w-[360px] sm:w-[380px] rounded-[48px] border-[10px] border-slate-800/90 bg-slate-950 p-4 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_50px_rgba(6,182,212,0.2)]">
            {/* Phone Speaker & Camera Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-slate-900 border border-slate-700/60 flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-900" />
              </div>
              <div className="h-1.5 w-12 rounded-full bg-slate-800" />
            </div>

            {/* Phone Screen Canvas */}
            <div className="mt-4 flex h-[680px] flex-col justify-between overflow-hidden rounded-[36px] border border-cyan-900/40 bg-gradient-to-b from-[#070b12] via-[#05080f] to-[#04060a] p-4 text-white">
              {/* Top Android Status Bar */}
              <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400/80 pb-2 border-b border-cyan-950">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white">10:42</span>
                  <span className="text-[10px] text-cyan-500">• STARK OS</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wifi className="h-3 w-3 text-cyan-400" />
                  <div className="flex items-center gap-1">
                    <BatteryCharging className="h-3 w-3 text-cyan-300" />
                    <span>{telemetry.reactorPower}%</span>
                  </div>
                </div>
              </div>

              {/* HUD Header */}
              <div className="mt-2 flex items-center justify-between">
                <div>
                  <h3 className="font-mono text-sm font-black tracking-wider text-cyan-300">
                    J.A.R.V.I.S. HUD
                  </h3>
                  <p className="text-[9px] font-mono tracking-widest text-cyan-500">
                    TACTICAL DEFENSE PROTOCOL
                  </p>
                </div>
                <div
                  className={`flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                    telemetry.securityLevel === "Nominal"
                      ? "bg-cyan-950/80 text-cyan-300 border border-cyan-700/60"
                      : "bg-red-950/90 text-amber-300 border border-red-600 animate-pulse"
                  }`}
                >
                  <Shield className="h-3 w-3" />
                  <span>{telemetry.securityLevel}</span>
                </div>
              </div>

              {/* Central Arc Reactor Canvas */}
              <div className="relative my-auto flex flex-col items-center justify-center">
                <div
                  className="relative cursor-pointer group"
                  onClick={toggleMic}
                  title="Click to speak or trigger voice command"
                >
                  <canvas
                    ref={canvasRef}
                    width={220}
                    height={220}
                    className="h-[210px] w-[210px]"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="font-mono text-2xl font-black tracking-wider text-white drop-shadow-[0_0_10px_#00E5FF]">
                      {telemetry.reactorPower}%
                    </span>
                    <span className="text-[9px] font-mono font-bold tracking-widest text-cyan-400">
                      ARC REACTOR
                    </span>
                  </div>
                </div>

                {/* Voice Status Indicator Pill */}
                <div className="mt-2 flex items-center gap-2 rounded-full border border-cyan-800/60 bg-slate-900/80 px-3 py-1 font-mono text-[11px]">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      isListening
                        ? "bg-red-400 animate-ping"
                        : isSpeaking
                        ? "bg-cyan-400 animate-bounce"
                        : "bg-cyan-500"
                    }`}
                  />
                  <span className="text-cyan-300">
                    {isListening
                      ? "Listening to voice..."
                      : isSpeaking
                      ? "JARVIS speaking..."
                      : telemetry.speechState === "Processing"
                      ? "Analyzing neural matrix..."
                      : "Voice standby ('Hey JARVIS')"}
                  </span>
                </div>
              </div>

              {/* Chat & Response Stream Bubble */}
              <div className="my-2 max-h-36 overflow-y-auto rounded-xl border border-cyan-900/40 bg-slate-900/70 p-2.5 font-mono text-xs">
                {messages.slice(-2).map((msg, idx) => (
                  <div key={msg.id ? `${msg.id}-${idx}` : `sim-msg-${idx}`} className="mb-2 last:mb-0">
                    <div className="flex items-center justify-between text-[9px] text-cyan-500">
                      <span className="font-bold">
                        {msg.sender === "user" ? "STARK (SIR)" : "J.A.R.V.I.S."}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className={`mt-0.5 text-xs ${msg.sender === "user" ? "text-cyan-200" : "text-white"}`}>
                      {msg.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Quick Directive Command Chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {[
                  "Status Report",
                  "Sentry Protocol",
                  "Mark 85 Matrix",
                  "Verify GitHub CI",
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => executeDirective(chip)}
                    className="whitespace-nowrap rounded-lg border border-cyan-800/50 bg-cyan-950/40 px-2.5 py-1 text-[10px] font-mono text-cyan-300 hover:border-cyan-400 hover:bg-cyan-900/40 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Bottom Interactive Bar: Text input & Giant Arc Mic Button */}
              <div className="mt-2 flex items-center gap-2 pt-2 border-t border-cyan-950">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && executeDirective(inputQuery)}
                    placeholder="Enter tactical command..."
                    className="w-full rounded-xl border border-cyan-900/60 bg-slate-950/80 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                  <button
                    onClick={() => executeDirective(inputQuery)}
                    className="absolute right-1.5 top-1.5 rounded-lg p-1 text-cyan-400 hover:bg-cyan-950 hover:text-white"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Main Mic trigger button */}
                <button
                  onClick={toggleMic}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border shadow-lg transition-all ${
                    isListening
                      ? "border-red-400 bg-red-600 text-white shadow-[0_0_20px_#ef4444] animate-pulse"
                      : "border-cyan-400 bg-gradient-to-tr from-cyan-600 to-blue-600 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:scale-105"
                  }`}
                  title={isListening ? "Listening..." : "Click to speak"}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5 text-slate-950" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Android Architecture & Live Telemetry Panel (7 cols) */}
        <div className="flex flex-col justify-between space-y-4 lg:col-span-7">
          {/* Quick Overview Card */}
          <div className="rounded-2xl border border-cyan-900/40 bg-slate-900/60 p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Android 14 Application Spec
                </span>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  J.A.R.V.I.S. Mobile OS
                </h2>
              </div>
              <span className="rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-3 py-1 font-mono text-xs font-semibold text-emerald-300">
                ✓ GitHub Actions CI Ready
              </span>
            </div>

            {/* Telemetry Dashboard Metrics */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono">
              <div className="rounded-xl border border-cyan-950 bg-slate-950/70 p-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Zap className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Arc Core</span>
                </div>
                <div className="mt-1 text-xl font-black text-cyan-300">
                  {telemetry.reactorPower}%
                </div>
                <span className="text-[10px] text-slate-500">Nominal Output</span>
              </div>

              <div className="rounded-xl border border-cyan-950 bg-slate-950/70 p-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Cpu className="h-3.5 w-3.5 text-blue-400" />
                  <span>Neural Net</span>
                </div>
                <div className="mt-1 text-xl font-black text-blue-300">
                  {telemetry.neuralLatency}ms
                </div>
                <span className="text-[10px] text-slate-500">Edge Latency</span>
              </div>

              <div className="rounded-xl border border-cyan-950 bg-slate-950/70 p-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Shield className="h-3.5 w-3.5 text-amber-400" />
                  <span>Security</span>
                </div>
                <div className="mt-1 text-base font-bold text-amber-300 truncate">
                  {telemetry.securityLevel}
                </div>
                <span className="text-[10px] text-slate-500">Stark Sentry</span>
              </div>

              <div className="rounded-xl border border-cyan-950 bg-slate-950/70 p-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Voice Synth</span>
                </div>
                <div className="mt-1 text-base font-bold text-emerald-300">
                  British AI
                </div>
                <span className="text-[10px] text-slate-500">TextToSpeech</span>
              </div>
            </div>

            {/* Android Stack Checklist */}
            <div className="mt-5 space-y-2 text-xs">
              <div className="flex items-start gap-2.5 rounded-lg border border-slate-800/80 bg-slate-950/50 p-3">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">
                    GitHub Actions Automation (.github/workflows/android-build.yml):
                  </span>
                  <p className="text-slate-400 mt-0.5">
                    Pre-configured with JDK 17, Gradle 8.5, and Ubuntu runner. Automatically compiles <code className="text-cyan-300 font-mono">app-debug.apk</code> and uploads it as a workflow artifact.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-lg border border-slate-800/80 bg-slate-950/50 p-3">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">
                    Modern Jetpack Compose UI:
                  </span>
                  <p className="text-slate-400 mt-0.5">
                    100% declarative Kotlin Compose code with animated Arc Reactor Canvas, Stark Industries dark theme, and sensor telemetry observers.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-lg border border-slate-800/80 bg-slate-950/50 p-3">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">
                    Voice Recognition & TTS Integration:
                  </span>
                  <p className="text-slate-400 mt-0.5">
                    Includes <code className="text-cyan-300 font-mono">android.speech.SpeechRecognizer</code> and <code className="text-cyan-300 font-mono">android.speech.tts.TextToSpeech</code> with custom British AI personality parsing.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                id="btn-trigger-ideas"
                onClick={onOpenIdeas}
                className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-950/30 px-4 py-2.5 font-mono text-xs font-bold text-cyan-300 hover:bg-cyan-900/40 transition-colors"
              >
                <span>Explore JARVIS Feature Ideas</span>
                <span className="rounded bg-cyan-800 px-1.5 py-0.5 text-[10px]">6 Categories</span>
              </button>

              <button
                id="btn-view-ci-guide"
                onClick={onTriggerGitHubGuide}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 font-mono text-xs font-bold text-white hover:bg-slate-700 transition-colors"
              >
                <span>How to Build in GitHub</span>
              </button>
            </div>
          </div>

          {/* System Console Telemetry Log */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-900 text-slate-400">
              <span className="text-[11px] text-cyan-400 font-bold">
                J.A.R.V.I.S. SUBSYSTEM TELEMETRY STREAM
              </span>
              <span className="text-[10px] text-emerald-400">● LIVE</span>
            </div>
            <div className="mt-2 space-y-1 text-slate-300 max-h-32 overflow-y-auto">
              {logs.map((log, i) => (
                <div key={i} className="leading-relaxed flex items-center gap-2">
                  <span className="text-slate-600 text-[10px]">{i + 1}.</span>
                  <span className={log.includes("CMD") ? "text-cyan-300" : "text-slate-400"}>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
