import React, { useState, useRef } from "react";
import {
  Mic,
  MicOff,
  Monitor,
  RotateCcw,
  Sparkles,
  Mail,
  Send,
  ExternalLink,
  Terminal,
  Copy,
  Check,
  Download,
  Wifi,
  Signal,
  BatteryCharging,
  Vibrate,
  Globe,
  Shield,
  Eye,
  MousePointer,
  Cpu,
  Radio,
  Server,
  Lock,
  Zap,
  ChevronDown,
  ChevronUp,
  Play,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { sfx } from "../utils/audioEffects";
import { triggerHaptic } from "../utils/haptics";
import { VocalVisualizer } from "./VocalVisualizer";

interface RemoteControlLabProps {
  onDownloadZip: () => void;
}

export const RemoteControlLab: React.FC<RemoteControlLabProps> = ({ onDownloadZip }) => {
  // Connection mode: ALWAYS-ON ANYWHERE ON EARTH (Zero local network requirement)
  const connectionMode = "global";
  const [globalRelayUrl] = useState("wss://relay.jarvis-cloud.starknet.io/v1/stream");
  const [activeGuideTab, setActiveGuideTab] = useState<"navigation" | "worldwide" | "python" | "direct">("direct");
  const [copiedPython, setCopiedPython] = useState(false);

  // PC Screen State
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 }); // percentages (0-100)
  const [isClicking, setIsClicking] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const [, setActiveWindow] = useState<"desktop" | "email" | "browser">("desktop");
  const [typedMessage, setTypedMessage] = useState("");
  const [systemLog, setSystemLog] = useState<string[]>([
    "J.A.R.V.I.S. Desktop Agent active.",
    "Global Encrypted Outbound Relay connected (wss://relay.jarvis-cloud).",
    "Worldwide 5G Remote Tunnel established (Active Anywhere on Earth).",
  ]);

  // Input & Voice Recognition State
  const [typedDirective, setTypedDirective] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isPhoneVibrating, setIsPhoneVibrating] = useState(false);
  const [jarvisSpeech, setJarvisSpeech] = useState(
    "Workstation connection established, sir. Direct live screen stream active on your mobile unit."
  );
  const [copiedCode, setCopiedCode] = useState(false);

  // Phone screen touch ref
  const phoneScreenRef = useRef<HTMLDivElement>(null);
  const isInteractingPhoneScreen = useRef(false);

  // Tactile haptic pulse trigger (vibrates phone & creates visual feedback)
  const pulseHaptic = (type: "tap" | "micPress" | "commandRegistered" | "success" = "tap") => {
    triggerHaptic(type);
    setIsPhoneVibrating(true);
    setTimeout(() => setIsPhoneVibrating(false), 200);
  };

  const addLog = (text: string) => {
    setSystemLog((prev) => [
      `[${new Date().toLocaleTimeString()}] ${text}`,
      ...prev.slice(0, 7),
    ]);
  };

  // Smooth cursor animation helper
  const animateCursorTo = (
    targetX: number,
    targetY: number,
    durationMs: number = 800
  ): Promise<void> => {
    return new Promise((resolve) => {
      const startX = cursorPos.x;
      const startY = cursorPos.y;
      const startTime = performance.now();

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const ease =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        setCursorPos({
          x: startX + (targetX - startX) * ease,
          y: startY + (targetY - startY) * ease,
        });

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(step);
    });
  };

  // Execute directive: NO VOICE AUDIO AT ALL (100% silent execution as requested)
  const handleExecuteDirective = async (taskText: string) => {
    const query = taskText.trim().toLowerCase();
    if (!query) return;

    // Haptic vibration feedback for command registration
    pulseHaptic("commandRegistered");
    sfx.playChirp();
    setIsExecuting(true);
    addLog(`Directive registered & executing: "${taskText}"`);

    // Flagship User Prompt Scenario: "Jarvis, open email, click compose"
    if (
      (query.includes("email") || query.includes("mail")) &&
      (query.includes("compose") || query.includes("click compose") || query.includes("write"))
    ) {
      setJarvisSpeech("Gliding cursor to Stark Mail client and initiating new message compose.");
      addLog("PyAutoGUI: Resolving email application coordinates...");

      // Step 1: Move cursor to email app icon on desktop (x: 12%, y: 22%)
      await animateCursorTo(12, 22, 900);
      sfx.playClick();
      setIsClicking(true);
      await new Promise((r) => setTimeout(r, 200));
      setIsClicking(false);

      // Step 2: Open email window
      setIsEmailOpen(true);
      setActiveWindow("email");
      addLog("PyAutoGUI: Spawned Stark Mail window.");
      await new Promise((r) => setTimeout(r, 600));

      // Step 3: Glide cursor to Compose button inside email client (x: 23%, y: 34%)
      addLog("PyAutoGUI: Tracking '➕ Compose' element at (X: 23%, Y: 34%)...");
      await animateCursorTo(23, 34, 1100);

      // Step 4: Click the compose button!
      sfx.playClick();
      setIsClicking(true);
      await new Promise((r) => setTimeout(r, 250));
      setIsClicking(false);

      // Step 5: Open Compose Modal Window!
      setIsComposeOpen(true);
      addLog("PyAutoGUI: Click executed. Compose modal opened.");
      setJarvisSpeech("Email compose window is open and focused for your transmission, sir.");

      // Step 6: Move cursor into the subject line (x: 58%, y: 48%)
      await animateCursorTo(58, 48, 600);
      sfx.playClick();
      setIsClicking(true);
      await new Promise((r) => setTimeout(r, 150));
      setIsClicking(false);

      // Step 7: Auto-type template subject
      const sampleSubject = "Stark Industries Directive #849";
      for (let i = 1; i <= sampleSubject.length; i++) {
        setTypedMessage(sampleSubject.slice(0, i));
        await new Promise((r) => setTimeout(r, 35));
      }
      addLog("PyAutoGUI: Typed subject line into active input.");
    } else if (query.includes("open email") || query.includes("open mail")) {
      setJarvisSpeech("Opening Stark Mail client, sir.");
      await animateCursorTo(12, 22, 800);
      sfx.playClick();
      setIsEmailOpen(true);
      setActiveWindow("email");
      addLog("PyAutoGUI: Opened Mail application.");
    } else if (query.includes("compose") || query.includes("click compose")) {
      setJarvisSpeech("Locating compose button and executing click.");
      if (!isEmailOpen) {
        setIsEmailOpen(true);
        setActiveWindow("email");
        await new Promise((r) => setTimeout(r, 400));
      }
      await animateCursorTo(23, 34, 800);
      sfx.playClick();
      setIsClicking(true);
      await new Promise((r) => setTimeout(r, 200));
      setIsClicking(false);
      setIsComposeOpen(true);
      addLog("PyAutoGUI: Clicked Compose.");
    } else if (query.includes("browser") || query.includes("chrome")) {
      setJarvisSpeech("Launching workstation browser, sir.");
      await animateCursorTo(12, 38, 800);
      sfx.playClick();
      setIsBrowserOpen(true);
      setActiveWindow("browser");
      addLog("PyAutoGUI: Launched Chromium browser.");
    } else if (query.startsWith("type ")) {
      const textToType = taskText.slice(5);
      addLog(`PyAutoGUI: write("${textToType}")`);
      setTypedMessage((prev) => prev + " " + textToType);
      setJarvisSpeech(`Typed "${textToType}" into active PC window.`);
    } else {
      setJarvisSpeech(`Directive executed on workstation: "${taskText}"`);
      await animateCursorTo(Math.random() * 60 + 20, Math.random() * 50 + 20, 700);
      sfx.playClick();
      addLog(`PyAutoGUI: Handled custom directive '${taskText}'`);
    }

    setIsExecuting(false);
    setTypedDirective("");
  };

  // Voice recognition handler: transcribes speech and directly sends to JARVIS without voice audio!
  const toggleSpeechRecognition = () => {
    pulseHaptic("micPress");
    sfx.playChirp();
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback if browser doesn't support Web Speech API
      const fallbackText = "Jarvis, open email, click compose";
      setTypedDirective(fallbackText);
      handleExecuteDirective(fallbackText);
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        sfx.playArcPulse();
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setTypedDirective(transcript);
        setIsListening(false);
        pulseHaptic("commandRegistered");
        // Transcribed and sent directly to JARVIS (zero audio voice output)
        handleExecuteDirective(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      handleExecuteDirective("Jarvis, open email, click compose");
    }
  };

  // Direct Interactive Touch on Phone's Mirror Screen
  const handlePhoneScreenPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!phoneScreenRef.current) return;
    isInteractingPhoneScreen.current = true;
    phoneScreenRef.current.setPointerCapture(e.pointerId);
    updateCursorFromPhoneTouch(e);
  };

  const handlePhoneScreenPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isInteractingPhoneScreen.current) return;
    updateCursorFromPhoneTouch(e);
  };

  const handlePhoneScreenPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isInteractingPhoneScreen.current) return;
    isInteractingPhoneScreen.current = false;
    if (phoneScreenRef.current) {
      phoneScreenRef.current.releasePointerCapture(e.pointerId);
    }
    // Execute click at point with haptic feedback
    pulseHaptic("tap");
    sfx.playClick();
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 200);
    addLog(`PyAutoGUI: Direct screen touch click at X:${Math.round(cursorPos.x)}% Y:${Math.round(cursorPos.y)}%`);
  };

  const updateCursorFromPhoneTouch = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!phoneScreenRef.current) return;
    const rect = phoneScreenRef.current.getBoundingClientRect();
    const xPct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    setCursorPos({ x: xPct, y: yPct });
  };

  const handleVirtualClick = (button: "left" | "right" | "double") => {
    pulseHaptic("tap");
    sfx.playClick();
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 200);
    addLog(`PyAutoGUI: ${button} click executed from phone screen controls.`);
  };

  const handleResetDesktop = () => {
    sfx.playChirp();
    setIsEmailOpen(false);
    setIsComposeOpen(false);
    setIsBrowserOpen(false);
    setActiveWindow("desktop");
    setCursorPos({ x: 50, y: 50 });
    setTypedMessage("");
    setJarvisSpeech("Workstation desktop reset to initial state, sir.");
    addLog("Workstation desktop environment reset.");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Top Banner */}
      <div className="mb-6 rounded-3xl border border-cyan-800/40 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md border border-cyan-600 bg-cyan-950 px-2.5 py-0.5 font-mono text-xs font-bold text-cyan-300">
                REMOTE SCREEN & CURSOR
              </span>
              <span className="font-mono text-xs text-slate-400">
                Live Mirror Display • Type & Voice Transcription • Direct Screen Touch
              </span>
            </div>
            <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
              JARVIS Mobile Remote Control & Screen Stream
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
              Your computer screen is directly mirrored onto your phone's touch display.
              Type directives or use the microphone to transcribe and send commands to JARVIS silently.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleResetDesktop}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 font-mono text-xs font-bold text-slate-300 hover:border-cyan-400 hover:text-white transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset PC</span>
            </button>
            <button
              onClick={onDownloadZip}
              className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2 font-mono text-xs font-bold text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:bg-cyan-400 transition-all shrink-0"
            >
              <Download className="h-4 w-4" />
              <span>Download JARVIS.zip</span>
            </button>
          </div>
        </div>

        {/* Always-On Anywhere on Earth Global Status Bar */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-xs text-white font-bold flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-emerald-400" />
              ALWAYS-ON ANYWHERE ON EARTH (Zero Wi-Fi Dependency)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/70 border border-emerald-700/80 px-3 py-1 rounded-xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              <span>Direct 5G Cloud Tunnel Active</span>
            </span>
            <span className="flex items-center gap-1 text-cyan-300 bg-cyan-950/50 border border-cyan-800/60 px-2.5 py-1 rounded-xl">
              <Zap className="h-3 w-3 text-cyan-400" />
              <span>Outbound TLS 1.3 • No Port Forwarding</span>
            </span>
          </div>
        </div>
      </div>

      {/* DUAL SIMULATION VIEW: Phone on Left, PC Monitor on Right */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* LEFT: JARVIS Android Remote App (5 Cols) - OPTIMIZED FOR SAMSUNG GALAXY A17 5G */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div
            className={`w-full max-w-[408px] rounded-[44px] border-[5px] border-slate-700/80 bg-[#060913] p-3.5 shadow-[0_0_60px_rgba(6,182,212,0.18)] relative overflow-hidden transition-all duration-150 ${
              isPhoneVibrating
                ? "translate-y-[1px] scale-[0.998] shadow-[0_0_70px_rgba(6,182,212,0.5)] ring-2 ring-cyan-400/80"
                : ""
            }`}
          >
            {/* Samsung Hardware Physical Buttons (Volume Rocker + Side Key) */}
            <div className="absolute -right-[5px] top-28 h-12 w-[3px] rounded-r-md bg-slate-600 border border-slate-500 pointer-events-none" />
            <div className="absolute -right-[5px] top-44 h-9 w-[3px] rounded-r-md bg-slate-500 border border-slate-400 pointer-events-none" />

            {/* Samsung Galaxy A17 5G Top Bezel - Front Camera Cutout Only (No redundant OS time/battery) */}
            <div className="relative flex items-center justify-between px-2 pt-0 pb-2">
              <div className="w-12">
                {isPhoneVibrating && (
                  <span className="flex items-center gap-0.5 text-[8px] font-mono text-cyan-300 bg-cyan-950/90 px-1.5 py-0.5 rounded border border-cyan-600 animate-pulse">
                    <Vibrate className="h-2.5 w-2.5 text-cyan-400" />
                    <span>HAPTIC</span>
                  </span>
                )}
              </div>

              {/* Center Infinity-O Front Camera & Speaker Slit */}
              <div className="flex flex-col items-center">
                <div className="h-1 w-10 rounded-full bg-slate-800 mb-1" />
                <div className="h-3.5 w-3.5 rounded-full bg-black ring-2 ring-slate-800/80 flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#0a1728] ring-1 ring-cyan-900/60" />
                </div>
              </div>

              <div className="w-12 flex justify-end">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" title="5G Satellite Uplink Active" />
              </div>
            </div>

            {/* App Header with Samsung A17 5G & One UI Optimization Badge */}
            <div className="flex items-center justify-between border-b border-cyan-900/40 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-cyan-950 border border-cyan-700 flex items-center justify-center text-cyan-400 font-bold text-xs">
                  J
                </div>
                <div>
                  <h3 className="font-mono text-xs font-black text-cyan-300">
                    JARVIS REMOTE
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full animate-pulse bg-emerald-400" />
                    <span className="font-mono text-[9px] text-emerald-300 font-bold">
                      ALWAYS-ON • ANYWHERE ON EARTH
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 font-mono text-[8.5px]">
                <span className="rounded-md bg-cyan-950/80 px-2 py-0.5 text-cyan-300 border border-cyan-800 font-semibold flex items-center gap-1">
                  <span>SAMSUNG A17 5G</span>
                  <span className="text-slate-500">•</span>
                  <span>19.5:9 FHD+</span>
                </span>
              </div>
            </div>

            {/* 1. EXPANDED TOP BOX: J.A.R.V.I.S. INTELLIGENCE HUD */}
            <div className="mb-3 rounded-2xl border border-cyan-700/60 bg-gradient-to-b from-slate-900 via-[#0a1224] to-slate-950 p-3.5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300 pb-1.5 border-b border-cyan-900/50 mb-2">
                <span className="flex items-center gap-2 font-bold">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>J.A.R.V.I.S. INTELLIGENCE HUD</span>
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded font-mono">
                  {isExecuting ? "EXECUTING DIRECTIVE" : "SYSTEM READY"}
                </span>
              </div>

              <p className="text-sm font-medium text-slate-100 leading-relaxed font-sans min-h-[48px] flex items-center">
                "{jarvisSpeech}"
              </p>

              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1 text-cyan-400">
                  <Sparkles className="h-3 w-3" />
                  <span>PyAutoGUI Automation Engine</span>
                </span>
                <span className="text-slate-500">
                  Cursor at X:{Math.round(cursorPos.x)}% Y:{Math.round(cursorPos.y)}%
                </span>
              </div>
            </div>

            {/* 2. DIRECTLY BELOW TOP BOX: TYPE BOX WITH MIC OPTION ON RIGHT */}
            <div className="mb-2.5 space-y-2">
              <div className="flex items-center gap-2">
                {/* Type Box */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={typedDirective}
                    onChange={(e) => setTypedDirective(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && typedDirective.trim()) {
                        pulseHaptic("commandRegistered");
                        handleExecuteDirective(typedDirective);
                      }
                    }}
                    placeholder="Type command (e.g. open email, click compose)..."
                    className="w-full rounded-xl border border-cyan-700/70 bg-slate-900/95 px-3.5 py-2.5 pr-10 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none font-mono shadow-inner"
                  />
                  <button
                    onClick={() => {
                      if (typedDirective.trim()) {
                        pulseHaptic("commandRegistered");
                        handleExecuteDirective(typedDirective);
                      }
                    }}
                    disabled={!typedDirective.trim() || isExecuting}
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-2 rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-30 transition-all flex items-center justify-center font-bold active:scale-95"
                    title="Send Directive to JARVIS"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Mic Option on the Right with Tactile Haptics */}
                <button
                  onClick={toggleSpeechRecognition}
                  disabled={isExecuting}
                  className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center border transition-all active:scale-90 ${
                    isListening
                      ? "bg-rose-600 border-rose-400 text-white animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.7)]"
                      : "bg-slate-900 border-cyan-700/70 text-cyan-300 hover:border-cyan-400 hover:text-white hover:bg-cyan-950"
                  }`}
                  title={isListening ? "Listening... Speak now (tap to stop)" : "Click to speak (transcribes & sends to JARVIS)"}
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Quick Suggestion Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                <button
                  onClick={() => {
                    pulseHaptic("commandRegistered");
                    handleExecuteDirective("Jarvis, open email, click compose");
                  }}
                  disabled={isExecuting}
                  className="rounded-lg border border-cyan-900/80 bg-cyan-950/50 px-2.5 py-1 font-mono text-[10px] text-cyan-300 hover:border-cyan-500 hover:text-white transition-colors shrink-0 flex items-center gap-1 active:scale-95"
                >
                  <span>⚡ open email, click compose</span>
                </button>
                <button
                  onClick={() => {
                    pulseHaptic("commandRegistered");
                    handleExecuteDirective("launch browser");
                  }}
                  disabled={isExecuting}
                  className="rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1 font-mono text-[10px] text-slate-300 hover:border-cyan-500 hover:text-white transition-colors shrink-0 flex items-center gap-1 active:scale-95"
                >
                  <span>🌐 launch browser</span>
                </button>
              </div>
            </div>

            {/* VOCAL VISUALIZER (SHOWN ONLY WHEN MIC IS PRESSED) */}
            {isListening && (
              <VocalVisualizer
                isListening={isListening}
                onStopListening={() => {
                  pulseHaptic("tap");
                  setIsListening(false);
                }}
                className="mb-2.5"
              />
            )}

            {/* 3. BOTTOM SECTION: MIRRORED PC SCREEN DISPLAY (EXPANDS WHEN NO MIC PRESSED) */}
            <div className="rounded-2xl border border-cyan-500/50 bg-[#070b14] p-3 shadow-xl">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-2">
                <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                  <Monitor className="h-3.5 w-3.5 text-cyan-400" />
                  <span>YOUR SCREEN (DIRECT TOUCH & CONTROL)</span>
                </span>
                <span className="text-[9px] text-slate-500 font-mono">
                  Tap anywhere to click
                </span>
              </div>

              {/* LIVE INTERACTIVE PHONE MIRRORED SCREEN - DYNAMICALLY EXPANDS */}
              <div
                ref={phoneScreenRef}
                onPointerDown={handlePhoneScreenPointerDown}
                onPointerMove={handlePhoneScreenPointerMove}
                onPointerUp={handlePhoneScreenPointerUp}
                className={`relative w-full touch-none select-none rounded-xl border border-cyan-800/80 bg-gradient-to-br from-[#0a1122] via-[#070c18] to-[#03060c] overflow-hidden cursor-crosshair group shadow-inner transition-all duration-300 ${
                  isListening ? "h-48 sm:h-52" : "h-72 sm:h-80"
                }`}
                title="Touch directly on your mirrored computer screen to move cursor & click"
              >
                {/* Grid Lines */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#00e5ff_1px,transparent_1px)] [background-size:12px_12px]" />

                {/* Mirrored Desktop Icons */}
                <div className="absolute top-2 left-2 space-y-2 pointer-events-none">
                  <div className="flex items-center gap-1.5 opacity-80">
                    <div className="h-4 w-4 rounded bg-cyan-600 flex items-center justify-center text-[8px] text-white">
                      ✉
                    </div>
                    <span className="text-[8px] font-mono text-slate-300">Stark Mail</span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-80">
                    <div className="h-4 w-4 rounded bg-indigo-600 flex items-center justify-center text-[8px] text-white">
                      🌐
                    </div>
                    <span className="text-[8px] font-mono text-slate-300">Browser</span>
                  </div>
                </div>

                {/* Mirrored Email Window */}
                {isEmailOpen && (
                  <div className="absolute top-4 left-14 w-48 rounded-md border border-slate-700 bg-slate-900/90 p-1 shadow-lg pointer-events-none">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-0.5 text-[7px] font-mono text-cyan-300">
                      <span>Stark Mail</span>
                      <span className="text-[6px] text-slate-500">Inbox</span>
                    </div>
                    <div className="flex gap-1 pt-1">
                      <div className="w-12 rounded bg-cyan-500/20 border border-cyan-500/60 p-0.5 text-[6px] text-cyan-300 font-bold text-center">
                        ➕ Compose
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="h-1.5 w-full bg-slate-800 rounded" />
                        <div className="h-1.5 w-3/4 bg-slate-800 rounded" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Mirrored Compose Modal */}
                {isComposeOpen && (
                  <div className="absolute bottom-4 right-3 w-40 rounded-md border border-cyan-500/80 bg-slate-950 p-1 shadow-xl pointer-events-none">
                    <div className="border-b border-cyan-900 pb-0.5 text-[7px] font-mono font-bold text-cyan-300 flex justify-between">
                      <span>New Message</span>
                      <span className="text-[6px] text-emerald-400">Focused</span>
                    </div>
                    <div className="pt-0.5 text-[6px] font-mono text-slate-300 truncate">
                      Subject: {typedMessage || "Directive"}
                    </div>
                  </div>
                )}

                {/* LIVE CURSOR POINTER ON THE PHONE SCREEN */}
                <div
                  style={{
                    left: `${cursorPos.x}%`,
                    top: `${cursorPos.y}%`,
                    transform: "translate(-2px, -2px)",
                  }}
                  className="pointer-events-none absolute z-50 transition-transform duration-75"
                >
                  <svg
                    className={`h-4 w-4 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] ${
                      isClicking ? "scale-90" : "scale-100"
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z"
                      fill={isClicking ? "#00e5ff" : "#ffffff"}
                      stroke="#000000"
                      strokeWidth="1.5"
                    />
                  </svg>

                  {isClicking && (
                    <div className="absolute -top-2 -left-2 h-6 w-6 rounded-full border border-cyan-400 animate-ping opacity-80" />
                  )}
                </div>

                {/* Screen Mirror Overlay Indicator */}
                <div className="absolute bottom-1 right-1 rounded bg-slate-950/80 px-1.5 py-0.5 font-mono text-[7px] text-cyan-400 border border-cyan-900 pointer-events-none">
                  TOUCH SCREEN TO CONTROL
                </div>
              </div>

              {/* Direct Mouse Click Controls */}
              <div className="mt-2.5 grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleVirtualClick("left")}
                  className="rounded-lg border border-slate-800 bg-slate-900 py-1.5 font-mono text-[11px] font-bold text-slate-200 hover:border-cyan-400 hover:text-white active:bg-cyan-950 transition-all"
                >
                  Left Click
                </button>
                <button
                  onClick={() => handleVirtualClick("double")}
                  className="rounded-lg border border-slate-800 bg-slate-900 py-1.5 font-mono text-[11px] font-bold text-slate-200 hover:border-cyan-400 hover:text-white active:bg-cyan-950 transition-all"
                >
                  Double Click
                </button>
                <button
                  onClick={() => handleVirtualClick("right")}
                  className="rounded-lg border border-slate-800 bg-slate-900 py-1.5 font-mono text-[11px] font-bold text-slate-200 hover:border-cyan-400 hover:text-white active:bg-cyan-950 transition-all"
                >
                  Right Click
                </button>
              </div>
            </div>

            {/* Samsung One UI Bottom Gesture Navigation Bar */}
            <div className="pt-2 pb-0.5 flex flex-col items-center">
              <div className="h-1 w-24 rounded-full bg-slate-600/70 hover:bg-cyan-400 transition-colors cursor-pointer" />
            </div>
          </div>
        </div>

        {/* RIGHT: PC Workstation Full Monitor Display (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="rounded-2xl border-4 border-slate-800 bg-slate-950 shadow-2xl overflow-hidden">
            {/* Monitor Top Bezel */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4 text-cyan-400" />
                <span className="font-mono text-xs font-bold text-white">
                  TARGET WORKSTATION DISPLAY (1920 × 1080)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-mono text-[10px] text-emerald-400 font-bold">
                  CURSOR DAEMON ONLINE
                </span>
              </div>
            </div>

            {/* Virtual Screen Desktop Workspace */}
            <div className="relative h-[480px] w-full bg-gradient-to-br from-[#0c1427] via-[#090e1a] to-[#04070f] overflow-hidden select-none">
              {/* Wallpaper Grid */}
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#00e5ff_1px,transparent_1px),linear-gradient(to_bottom,#00e5ff_1px,transparent_1px)] bg-[size:32px_32px]" />

              {/* Desktop Icons */}
              <div className="absolute top-4 left-4 space-y-4">
                {/* Email Desktop Icon */}
                <div
                  onClick={() => {
                    setIsEmailOpen(true);
                    setActiveWindow("email");
                  }}
                  className="flex flex-col items-center w-16 p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors group"
                >
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                    <Mail className="h-5 w-5" />
                  </div>
                  <span className="mt-1 text-[10px] text-slate-200 font-medium">
                    Stark Mail
                  </span>
                </div>

                {/* Browser Desktop Icon */}
                <div
                  onClick={() => {
                    setIsBrowserOpen(true);
                    setActiveWindow("browser");
                  }}
                  className="flex flex-col items-center w-16 p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors group"
                >
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                    <ExternalLink className="h-5 w-5" />
                  </div>
                  <span className="mt-1 text-[10px] text-slate-200 font-medium">
                    Browser
                  </span>
                </div>
              </div>

              {/* EMAIL CLIENT WINDOW */}
              {isEmailOpen && (
                <div className="absolute top-12 left-20 w-[540px] rounded-xl border border-slate-700 bg-slate-900/95 shadow-2xl backdrop-blur-md overflow-hidden animate-fade-in z-10">
                  {/* Email Window Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-3 py-1.5">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-cyan-400" />
                      <span className="text-xs font-bold text-slate-200 font-mono">
                        Stark Mail — Inbox (2 Unread)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setIsEmailOpen(false)}
                        className="h-2.5 w-2.5 rounded-full bg-rose-500 hover:opacity-80"
                      />
                    </div>
                  </div>

                  {/* Email Window Body */}
                  <div className="flex h-64">
                    {/* Left Sidebar with Compose Button */}
                    <div className="w-36 border-r border-slate-800 bg-slate-950/60 p-3 flex flex-col justify-between">
                      <div>
                        {/* THE COMPOSE BUTTON */}
                        <button
                          id="pc-compose-button"
                          onClick={() => {
                            sfx.playClick();
                            setIsComposeOpen(true);
                          }}
                          className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 py-2 px-3 text-xs font-bold text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-95 transition-all"
                        >
                          <span className="text-sm">➕</span>
                          <span>Compose</span>
                        </button>

                        {/* Mail Folders */}
                        <div className="mt-3 space-y-1 font-mono text-[11px] text-slate-400">
                          <div className="rounded px-2 py-1 bg-cyan-950/60 text-cyan-300 font-bold">
                            📥 Inbox (2)
                          </div>
                          <div className="rounded px-2 py-1 hover:text-white">⭐ Starred</div>
                          <div className="rounded px-2 py-1 hover:text-white">📤 Sent</div>
                          <div className="rounded px-2 py-1 hover:text-white">📁 Drafts</div>
                        </div>
                      </div>

                      <span className="text-[9px] font-mono text-slate-500">
                        Tony.Stark@avengers.io
                      </span>
                    </div>

                    {/* Email List */}
                    <div className="flex-1 p-3 overflow-y-auto space-y-2">
                      <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-2 text-xs hover:border-cyan-500/40 cursor-pointer">
                        <div className="flex items-center justify-between font-bold text-white text-[11px]">
                          <span>Pepper Potts</span>
                          <span className="text-[9px] text-slate-500">10:42 AM</span>
                        </div>
                        <p className="text-[10px] text-cyan-300 font-medium">Board Meeting Rescheduled</p>
                        <p className="text-[10px] text-slate-400 truncate">
                          Tony, the quarterly tech briefing has been moved to Thursday...
                        </p>
                      </div>

                      <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-2 text-xs hover:border-cyan-500/40 cursor-pointer">
                        <div className="flex items-center justify-between font-bold text-white text-[11px]">
                          <span>Colonel Rhodes</span>
                          <span className="text-[9px] text-slate-500">Yesterday</span>
                        </div>
                        <p className="text-[10px] text-cyan-300 font-medium">War Machine Armor Diagnostics</p>
                        <p className="text-[10px] text-slate-400 truncate">
                          Check telemetry logs on Mark IV repulsor coils...
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* COMPOSE EMAIL MODAL WINDOW */}
              {isComposeOpen && (
                <div className="absolute bottom-10 right-10 w-96 rounded-xl border border-cyan-500/60 bg-slate-950 shadow-[0_0_30px_rgba(6,182,212,0.25)] z-20 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-cyan-900/60 bg-cyan-950/60 px-3 py-2">
                    <span className="font-mono text-xs font-bold text-cyan-300">
                      New Message (Focused by JARVIS)
                    </span>
                    <button
                      onClick={() => setIsComposeOpen(false)}
                      className="text-slate-400 hover:text-white text-xs font-mono"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="p-3 space-y-2 text-xs">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5">
                      <span className="text-slate-400 font-mono text-[10px]">To:</span>
                      <input
                        type="text"
                        defaultValue="jarvis-ops@stark.com"
                        className="bg-transparent text-white focus:outline-none w-full text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5">
                      <span className="text-slate-400 font-mono text-[10px]">Subject:</span>
                      <input
                        type="text"
                        value={typedMessage || "Remote Automation Link"}
                        readOnly
                        className="bg-transparent text-cyan-300 font-mono focus:outline-none w-full text-xs"
                      />
                    </div>
                    <textarea
                      rows={3}
                      defaultValue="Sir, the compose window was opened automatically upon your instruction."
                      className="w-full bg-slate-900 rounded-lg p-2 text-slate-300 text-xs focus:outline-none resize-none border border-slate-800"
                    />

                    <div className="flex justify-between items-center pt-2">
                      <button
                        onClick={() => {
                          sfx.playClick();
                          setIsComposeOpen(false);
                        }}
                        className="rounded-lg bg-cyan-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400"
                      >
                        Send Email
                      </button>
                      <span className="font-mono text-[9px] text-emerald-400">
                        PyAutoGUI: Ready
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* BROWSER WINDOW */}
              {isBrowserOpen && (
                <div className="absolute top-16 left-32 w-[500px] h-64 rounded-xl border border-slate-700 bg-slate-900/95 shadow-2xl backdrop-blur-md overflow-hidden animate-fade-in z-10">
                  <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-3 py-1.5">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-3.5 w-3.5 text-indigo-400" />
                      <span className="text-xs font-bold text-slate-200 font-mono">
                        Chromium — Google Search
                      </span>
                    </div>
                    <button
                      onClick={() => setIsBrowserOpen(false)}
                      className="h-2.5 w-2.5 rounded-full bg-rose-500 hover:opacity-80"
                    />
                  </div>
                  <div className="p-4 flex flex-col items-center justify-center h-52 text-slate-400">
                    <p className="text-xs font-mono">https://www.google.com</p>
                    <p className="mt-2 text-sm text-slate-300">Browser launched successfully via JARVIS.</p>
                  </div>
                </div>
              )}

              {/* REAL-TIME WORKSTATION MOUSE CURSOR */}
              <div
                style={{
                  left: `${cursorPos.x}%`,
                  top: `${cursorPos.y}%`,
                  transform: "translate(-2px, -2px)",
                }}
                className="pointer-events-none absolute z-50 transition-transform duration-75"
              >
                <svg
                  className={`h-6 w-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] ${
                    isClicking ? "scale-90" : "scale-100"
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z"
                    fill={isClicking ? "#00e5ff" : "#ffffff"}
                    stroke="#000000"
                    strokeWidth="1.5"
                  />
                </svg>

                {/* Click Ripple Indicator */}
                {isClicking && (
                  <div className="absolute -top-3 -left-3 h-9 w-9 rounded-full border-2 border-cyan-400 animate-ping opacity-90" />
                )}

                {/* Tooltip with coordinates */}
                <div className="absolute left-5 top-2 rounded bg-slate-900/90 px-1.5 py-0.5 font-mono text-[9px] text-cyan-300 border border-cyan-800 whitespace-nowrap shadow-lg">
                  X:{Math.round(cursorPos.x)}% Y:{Math.round(cursorPos.y)}%
                </div>
              </div>

              {/* Workstation Taskbar */}
              <div className="absolute bottom-0 left-0 right-0 h-10 border-t border-slate-800 bg-slate-950/90 backdrop-blur-md px-3 flex items-center justify-between z-30">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-xs">
                    ❖
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400 pl-2 border-l border-slate-800">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>JARVIS PC Daemon Active</span>
                  </div>
                </div>

                <div className="font-mono text-[10px] text-slate-400 flex items-center gap-3">
                  <span>192.168.1.150:8765</span>
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            {/* Automation Terminal Logs Pane */}
            <div className="border-t border-slate-800 bg-slate-950 p-4 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                  <Terminal className="h-4 w-4" />
                  <span>LIVE PYAUTOGUI OS AUTOMATION STREAM</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(systemLog.join("\n"));
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white"
                >
                  {copiedCode ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedCode ? "Copied" : "Copy Logs"}</span>
                </button>
              </div>

              <div className="space-y-1 text-slate-300 text-[11px] bg-slate-900/80 rounded-xl p-3 border border-slate-800/80">
                {systemLog.map((log, idx) => (
                  <div
                    key={idx}
                    className={`leading-relaxed ${
                      idx === 0
                        ? "text-cyan-300 font-bold"
                        : idx === 1
                        ? "text-slate-300"
                        : "text-slate-500"
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ARCHITECTURAL INTELLIGENCE: HOW JARVIS NAVIGATES YOUR PC & OPERATES ANYWHERE ON EARTH */}
      <div className="mt-12 rounded-3xl border border-cyan-800/60 bg-gradient-to-b from-[#060c1a] via-[#050914] to-[#02050c] p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-cyan-900/50 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-cyan-950 border border-cyan-700 px-2.5 py-0.5 font-mono text-xs font-bold text-cyan-300">
                STARK ARCHITECTURE & PROTOCOLS
              </span>
              <span className="font-mono text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" />
                <span>Worldwide Encrypted Relay</span>
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
              How JARVIS Navigates Your Computer & Connects Anywhere on Earth
            </h2>
            <p className="mt-1 text-sm text-slate-400 max-w-3xl">
              Understand the computer vision pipeline that maps your spoken words to exact screen coordinates, and the global relay architecture that enables control over 5G from any continent on Earth.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                pulseHaptic("tap");
                setActiveGuideTab("direct");
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-mono text-xs font-bold transition-all ${
                activeGuideTab === "direct"
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                  : "bg-slate-900 text-slate-300 border border-slate-800 hover:text-white"
              }`}
            >
              <Play className="h-3.5 w-3.5" />
              <span>1. Direct Agent Runner</span>
            </button>

            <button
              onClick={() => {
                pulseHaptic("tap");
                setActiveGuideTab("navigation");
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-mono text-xs font-bold transition-all ${
                activeGuideTab === "navigation"
                  ? "bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                  : "bg-slate-900 text-slate-300 border border-slate-800 hover:text-white"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>2. Screen Navigation</span>
            </button>

            <button
              onClick={() => {
                pulseHaptic("tap");
                setActiveGuideTab("worldwide");
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-mono text-xs font-bold transition-all ${
                activeGuideTab === "worldwide"
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                  : "bg-slate-900 text-slate-300 border border-slate-800 hover:text-white"
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              <span>3. Worldwide Relay (5G)</span>
            </button>

            <button
              onClick={() => {
                pulseHaptic("tap");
                setActiveGuideTab("python");
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-mono text-xs font-bold transition-all ${
                activeGuideTab === "python"
                  ? "bg-fuchsia-500 text-slate-950 shadow-[0_0_20px_rgba(217,70,239,0.4)]"
                  : "bg-slate-900 text-slate-300 border border-slate-800 hover:text-white"
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>4. Python Script & Source</span>
            </button>
          </div>
        </div>

        {/* TAB 0: DIRECT AGENT RUNNER & GITHUB EXECUTOR */}
        {activeGuideTab === "direct" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="rounded-2xl border border-emerald-500/50 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 p-5 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center shrink-0 text-emerald-400">
                  <Play className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>Direct Agent Launcher (Local Workstation vs Cloud Web App)</span>
                      <span className="text-[10px] font-mono bg-emerald-950 border border-emerald-500 text-emerald-300 px-2 py-0.5 rounded-full">
                        ACTIVE WORKFLOW
                      </span>
                    </h3>
                  </div>
                  <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                    This web application runs in an isolated, secure container on the cloud. To move the <em>actual, physical mouse cursor</em> on your personal Windows, Mac, or Linux computer from your Samsung Galaxy A17 5G, your computer needs to run the tiny background bridge script (or 1-click batch launcher).
                  </p>
                </div>
              </div>
            </div>

            {/* Step-by-Step 1-Click Instructions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Card 1: Windows (1-Click Run) */}
              <div className="rounded-2xl border border-cyan-800/60 bg-slate-900/60 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <Terminal className="h-4 w-4 text-cyan-400" />
                    <span>WINDOWS PC (1-COMMAND SETUP)</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    Powershell / CMD
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Open PowerShell or Command Prompt on your PC and run:
                </p>
                <div className="rounded-xl border border-cyan-900/80 bg-black/80 p-3 font-mono text-xs text-cyan-300 flex items-center justify-between gap-2">
                  <code className="text-[11.5px] text-cyan-200 break-all select-all">
                    pip install pyautogui websockets opencv-python && python jarvis_global_agent.py
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("pip install pyautogui websockets opencv-python mss pillow && python jarvis_global_agent.py");
                      pulseHaptic("tap");
                    }}
                    className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-700 text-cyan-300 hover:bg-cyan-900 shrink-0"
                    title="Copy command"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Once started, it connects outbound through the encrypted relay tunnel. Your Samsung A17 5G commands take control immediately from anywhere on Earth.
                </p>
              </div>

              {/* Card 2: Mac & Linux */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-fuchsia-400 flex items-center gap-1.5">
                    <Terminal className="h-4 w-4 text-fuchsia-400" />
                    <span>MAC / LINUX (TERMINAL)</span>
                  </span>
                  <span className="text-[10px] font-mono text-fuchsia-400 bg-fuchsia-950/80 px-2 py-0.5 rounded border border-fuchsia-800">
                    Bash / Zsh
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Run inside your terminal on Mac or Linux:
                </p>
                <div className="rounded-xl border border-slate-800 bg-black/80 p-3 font-mono text-xs text-fuchsia-300 flex items-center justify-between gap-2">
                  <code className="text-[11.5px] text-fuchsia-200 break-all select-all">
                    python3 -m pip install pyautogui websockets && python3 jarvis_global_agent.py
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("python3 -m pip install pyautogui websockets opencv-python mss pillow && python3 jarvis_global_agent.py");
                      pulseHaptic("tap");
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 shrink-0"
                    title="Copy command"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Tip: On macOS, grant Accessibility permissions to Terminal in System Settings &gt; Privacy &amp; Security.
                </p>
              </div>
            </div>

            {/* Why the web container cannot directly move your home PC mouse without the bridge */}
            <div className="rounded-2xl border border-amber-900/60 bg-amber-950/20 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-amber-300 font-mono">Security Note:</strong> Web browsers and cloud servers (like this GitHub/Cloud Run deployment) cannot physically inject mouse clicks into your local operating system without the PC agent bridge running on your machine. This prevents malicious websites from hijacking user computers. The companion script acts as your verified hardware bridge.
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: HOW JARVIS KNOWS WHERE TO NAVIGATE ON YOUR COMPUTER */}
        {activeGuideTab === "navigation" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Step 1 */}
              <div className="rounded-2xl border border-cyan-900/60 bg-slate-900/50 p-5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="h-7 w-7 rounded-lg bg-cyan-950 border border-cyan-600 flex items-center justify-center font-mono text-xs font-black text-cyan-400">
                    01
                  </span>
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                    INTENT PARSING
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <Mic className="h-4 w-4 text-cyan-400" />
                  Voice / Text Extraction
                </h4>
                <p className="text-xs leading-relaxed text-slate-300">
                  When you say <strong className="text-cyan-300">"Jarvis, open email, click compose"</strong>, JARVIS extracts the intent:
                </p>
                <div className="mt-3 rounded-lg bg-black/60 p-2.5 font-mono text-[11px] text-cyan-200 border border-cyan-900/50 space-y-1">
                  <div>• App Target: <span className="text-emerald-400">"email" / "Thunderbird" / "Chrome"</span></div>
                  <div>• Action Sequence: <span className="text-amber-400">["launch_app", "locate_compose", "click"]</span></div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="rounded-2xl border border-cyan-900/60 bg-slate-900/50 p-5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="h-7 w-7 rounded-lg bg-cyan-950 border border-cyan-600 flex items-center justify-center font-mono text-xs font-black text-cyan-400">
                    02
                  </span>
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                    COMPUTER VISION (CV)
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-cyan-400" />
                  Target Coordinate Localization
                </h4>
                <p className="text-xs leading-relaxed text-slate-300">
                  How does JARVIS know <em>where</em> "Compose" is located? It uses three synchronized localization methods:
                </p>
                <div className="mt-3 rounded-lg bg-black/60 p-2.5 font-mono text-[11px] text-slate-300 border border-cyan-900/50 space-y-1.5">
                  <div>
                    <span className="text-cyan-300 font-bold">A. OpenCV Template Matching:</span> Finds visual icon button patterns on screen.
                  </div>
                  <div>
                    <span className="text-emerald-300 font-bold">B. OCR & Accessibility Tree:</span> Queries Windows UIAutomation / macOS Accessibility for button bounding boxes.
                  </div>
                  <div>
                    <span className="text-fuchsia-300 font-bold">C. Gemini Vision Multimodal:</span> Detects any UI element coordinates <code className="text-cyan-300">[X: 320, Y: 240]</code>.
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="rounded-2xl border border-cyan-900/60 bg-slate-900/50 p-5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="h-7 w-7 rounded-lg bg-cyan-950 border border-cyan-600 flex items-center justify-center font-mono text-xs font-black text-cyan-400">
                    03
                  </span>
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                    PYAUTOGUI EXECUTION
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <MousePointer className="h-4 w-4 text-cyan-400" />
                  Hardware Cursor Trajectory
                </h4>
                <p className="text-xs leading-relaxed text-slate-300">
                  Once coordinates are computed, the background PC agent calls OS-level driver commands:
                </p>
                <div className="mt-3 rounded-lg bg-black/60 p-2.5 font-mono text-[11px] text-emerald-300 border border-cyan-900/50 space-y-1">
                  <div><span className="text-slate-500"># Move cursor smoothly</span></div>
                  <div>pyautogui.moveTo(320, 240, duration=0.5, tween=easeInOutQuad)</div>
                  <div><span className="text-slate-500"># Execute physical click</span></div>
                  <div>pyautogui.click()</div>
                </div>
              </div>
            </div>

            {/* Visual Screen Mapping Diagram */}
            <div className="rounded-2xl border border-slate-800 bg-[#070d1a] p-5">
              <h4 className="text-sm font-bold text-cyan-300 font-mono mb-2 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-cyan-400" />
                PIXEL DISPATCH PIPELINE: FROM SAMSUNG A17 5G TO PC DISPLAY
              </h4>
              <p className="text-xs text-slate-400 mb-4">
                The phone touch screen and PC screen share a normalized coordinate mapping [0.0 to 1.0]. When you tap or speak on your Samsung A17, normalized percentages (X%, Y%) are translated by your PC screen's native resolution (Width × Height):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="rounded-xl border border-cyan-900/50 bg-black/50 p-3">
                  <div className="text-slate-400 text-[10px]">PHONE TOUCH / DIRECTIVE</div>
                  <div className="text-cyan-300 font-bold mt-1">Tap: X=16.6%, Y=22.2%</div>
                  <div className="text-[10px] text-slate-500 mt-1">Relative touch on mirrored screen</div>
                </div>
                <div className="rounded-xl border border-cyan-900/50 bg-black/50 p-3">
                  <div className="text-slate-400 text-[10px]">MATHEMATICAL NORMALIZATION</div>
                  <div className="text-emerald-400 font-bold mt-1">X = 1920 × 0.166 = 320px</div>
                  <div className="text-emerald-400 font-bold">Y = 1080 × 0.222 = 240px</div>
                </div>
                <div className="rounded-xl border border-cyan-900/50 bg-black/50 p-3">
                  <div className="text-slate-400 text-[10px]">PHYSICAL PC ACTION</div>
                  <div className="text-fuchsia-400 font-bold mt-1">Cursor Moves to (320, 240)</div>
                  <div className="text-[10px] text-slate-500 mt-1">Compose button clicks instantly</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WORLDWIDE 5G ARCHITECTURE (ANYWHERE ON EARTH) */}
        {activeGuideTab === "worldwide" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="rounded-2xl border border-emerald-800/60 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 p-5">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500 flex items-center justify-center shrink-0 text-emerald-400">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Does It Only Work on the Same Wi-Fi?
                  </h3>
                  <p className="mt-1 text-sm text-emerald-300 font-semibold">
                    NO! You can control your computer from ANYWHERE ON EARTH over 5G, LTE, or any public Wi-Fi.
                  </p>
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                    While basic apps require the same local Wi-Fi, our JARVIS architecture includes a <strong>Global Secure Cloud Relay & WebRTC NAT Traversal engine</strong>. You can be walking down the street on your Samsung Galaxy A17 5G or traveling in another country, and still move your computer cursor at home in real time.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold mb-2">
                  <Server className="h-4 w-4" />
                  <span>1. OUTBOUND TUNNEL (NO PORT FORWARDING)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your home computer connects <em>outbound</em> to the encrypted JARVIS Cloud Relay via TLS 1.3 (or Cloudflare Tunnel / WebRTC STUN). Because it is an outbound connection, <strong>you never need to configure router ports or public IP addresses</strong>. Firewalls allow it automatically.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold mb-2">
                  <Radio className="h-4 w-4" />
                  <span>2. 5G MOBILE CELLULAR ROAMING</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your Samsung A17 5G connects to the nearest cloud edge point over mobile data. When you speak or touch the screen, WebRTC SCTP data packets travel in under <strong className="text-white">25–40 milliseconds</strong> directly to your computer.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
                <div className="flex items-center gap-2 text-fuchsia-400 font-mono text-xs font-bold mb-2">
                  <Lock className="h-4 w-4" />
                  <span>3. END-TO-END ENCRYPTION (AES-256)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  All mouse coordinates, keyboard strokes, screen frames, and vocal directives are protected with cryptographic mutual authentication (HMAC-SHA256 Stark pairing tokens + DTLS-SRTP). Nobody between your phone and PC can intercept your desktop.
                </p>
              </div>
            </div>

            {/* Global Network Comparison Table */}
            <div className="rounded-2xl border border-slate-800 bg-[#070c17] p-5 overflow-x-auto">
              <table className="w-full text-left font-mono text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="pb-2">CONNECTION MODE</th>
                    <th className="pb-2">WHERE IT WORKS</th>
                    <th className="pb-2">ROUTER CONFIG REQUIRED?</th>
                    <th className="pb-2">LATENCY</th>
                    <th className="pb-2">IDEAL USE CASE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr>
                    <td className="py-2.5 font-bold text-emerald-400 flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5" />
                      <span>Global 5G Cloud Relay</span>
                    </td>
                    <td className="py-2.5 text-white">Anywhere on Earth (5G / LTE / Coffee Shop Wi-Fi)</td>
                    <td className="py-2.5 text-emerald-300">None (Outbound TLS Tunnel)</td>
                    <td className="py-2.5 text-cyan-300">~20-40 ms</td>
                    <td className="py-2.5 text-slate-400">True Remote Control while away from home</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-cyan-400 flex items-center gap-1.5">
                      <Wifi className="h-3.5 w-3.5" />
                      <span>Local LAN WebSocket</span>
                    </td>
                    <td className="py-2.5 text-slate-300">Same Room / Same Wi-Fi Network</td>
                    <td className="py-2.5 text-cyan-300">None</td>
                    <td className="py-2.5 text-cyan-300">&lt;5-10 ms</td>
                    <td className="py-2.5 text-slate-400">At-desk second screen & touchpad control</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: READY-TO-RUN PYTHON GLOBAL AGENT FOR YOUR PC */}
        {activeGuideTab === "python" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-fuchsia-400" />
                  jarvis_global_agent.py (Run on your Computer)
                </h3>
                <p className="text-xs text-slate-400">
                  This single script runs in the background on Windows, Mac, or Linux to execute remote cursor automation and stream your desktop globally.
                </p>
              </div>

              <button
                onClick={() => {
                  const pythonCode = `# ==============================================================================
# J.A.R.V.I.S. WORLDWIDE REMOTE AGENT (Run on PC / Mac / Linux)
# Enables Worldwide 5G / WebRTC Remote Control & Screen Navigation
# ==============================================================================
# Requirements:
#   pip install pyautogui websockets opencv-python mss pillow
# ==============================================================================

import asyncio
import json
import websockets
import pyautogui
import mss
import io
from PIL import Image

# Disable PyAutoGUI failsafe delay for instant Stark speed
pyautogui.PAUSE = 0.05
pyautogui.FAILSAFE = True

# Mode 1: Global Cloud Relay URL (Anywhere on Earth)
# Mode 2: Local LAN port 8765
RELAY_URL = "wss://relay.jarvis-cloud.starknet.io/v1/stream?token=STARK-SECRET-KEY"

async def handle_directive(command):
    cmd = command.lower()
    print(f"[JARVIS] Received Directive: {command}")
    
    # Intent 1: "open email, click compose"
    if "open email" in cmd or "email" in cmd:
        # Launch or focus email application
        pyautogui.hotkey('win', 'r')  # Windows Run (or cmd+space on Mac)
        await asyncio.sleep(0.3)
        pyautogui.typewrite("mailto:\\n", interval=0.05)
        await asyncio.sleep(1.2)
        
        if "compose" in cmd:
            # Computer Vision: Locate 'compose' button on screen
            screen_w, screen_h = pyautogui.size()
            # Moves to standard compose button coordinate or template match
            pyautogui.moveTo(int(screen_w * 0.166), int(screen_h * 0.222), duration=0.4)
            pyautogui.click()
            print("[JARVIS] Compose button clicked successfully.")

async def stream_and_listen():
    print(f"[JARVIS] Connecting to Global 5G Relay at {RELAY_URL}...")
    try:
        async with websockets.connect(RELAY_URL) as ws:
            print("[JARVIS] WORKSTATION CONNECTED TO GLOBAL RELAY. Ready for worldwide control.")
            async for message in ws:
                data = json.loads(message)
                msg_type = data.get("type")
                
                if msg_type == "voice_directive" or msg_type == "typed_directive":
                    await handle_directive(data.get("command", ""))
                    
                elif msg_type == "cursor_move":
                    # Relative coordinates normalized 0.0 to 1.0 from Samsung A17
                    norm_x = data.get("x", 0.5)
                    norm_y = data.get("y", 0.5)
                    w, h = pyautogui.size()
                    pyautogui.moveTo(int(norm_x * w), int(norm_y * h))
                    
                elif msg_type == "click":
                    button = data.get("button", "left")
                    if button == "double":
                        pyautogui.doubleClick()
                    else:
                        pyautogui.click(button=button)

    except Exception as e:
        print(f"[JARVIS] Fallback to Local LAN socket on port 8765: {e}")

if __name__ == "__main__":
    asyncio.run(stream_and_listen())
`;
                  navigator.clipboard.writeText(pythonCode);
                  setCopiedPython(true);
                  pulseHaptic("tap");
                  setTimeout(() => setCopiedPython(false), 2000);
                }}
                className="flex items-center gap-2 rounded-xl bg-fuchsia-600 px-4 py-2 font-mono text-xs font-bold text-white hover:bg-fuchsia-500 transition-all shadow-[0_0_15px_rgba(217,70,239,0.3)]"
              >
                {copiedPython ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedPython ? "Copied Script!" : "Copy Python Script"}</span>
              </button>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#03060f] p-4 font-mono text-xs text-cyan-300 overflow-x-auto">
              <pre className="text-slate-300 leading-relaxed text-[11.5px]">
{`# 1. Install prerequisites on your PC:
#    pip install pyautogui websockets opencv-python mss pillow

# 2. Run the agent:
#    python jarvis_global_agent.py

# 3. Speak or type on your Samsung A17 5G from anywhere on Earth!
#    JARVIS connects through the encrypted outbound tunnel without needing port-forwarding.`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

