import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Monitor,
  MousePointer,
  Home as HomeIcon,
  Keyboard as KeyboardIcon,
  Lightbulb,
  Send,
  Mic,
  MicOff,
  ChevronRight,
  Maximize2,
  Minimize2,
  Trash2,
  Globe,
  MessageSquare,
  Gamepad2,
  Code2,
  Search,
  CheckCircle2,
  Copy,
  Download,
  Terminal,
  X,
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
  CornerDownLeft,
  Delete,
} from "lucide-react";
import { VocalVisualizer } from "./components/VocalVisualizer";
import { VirtualKeyboard } from "./components/VirtualKeyboard";

interface ActionStep {
  type: string;
  value: string;
  delayMs?: number;
}

export default function App() {
  // Navigation: "home" or "pc" (landscape screen remote)
  const [activeTab, setActiveTab] = useState<"home" | "pc">("home");

  // Landscape View Orientation & Zoom
  const [isLandscapeRotated, setIsLandscapeRotated] = useState(false);

  // Connection & Tunnel State
  const [tunnelUrl, setTunnelUrl] = useState("");
  const [secretAuth, setSecretAuth] = useState("JARVIS-7749");
  const [targetPhone] = useState("+91 99629 19450 (You)");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [relayNotice, setRelayNotice] = useState<string | null>(null);
  const [osName, setOsName] = useState("Windows 11");

  // UI Modals & Keyboard
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(false);
  const [copiedTunnel, setCopiedTunnel] = useState(false);

  // Keyboard typing state
  const [keyboardBuffer, setKeyboardBuffer] = useState("");

  // Directives & AI Chat
  const [inputCommand, setInputCommand] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isAiPlanning, setIsAiPlanning] = useState(false);
  const [currentPlanSteps, setCurrentPlanSteps] = useState<ActionStep[]>([]);
  const [chatMessages, setChatMessages] = useState<
    Array<{ id: string; sender: "jarvis" | "user"; text: string; time: string; plan?: ActionStep[] }>
  >([
    {
      id: "1",
      sender: "jarvis",
      text: "Sir, how can I help you today?",
      time: "4:32 PM",
    },
  ]);

  // Touchpad Mouse Pointer on Screen
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });
  const [isDraggingCursor, setIsDraggingCursor] = useState(false);
  const pointerStartPos = useRef({ x: 0, y: 0, time: 0 });
  const [activeFocusTarget, setActiveFocusTarget] = useState<string | null>(null);
  const screenContainerRef = useRef<HTMLDivElement>(null);
  const landscapeContainerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // Active projection window state
  const [activeWindow, setActiveWindow] = useState<"outlook" | "chrome" | "vscode" | "claude">("outlook");
  const [selectedEmail, setSelectedEmail] = useState(0);

  // Live Screen Projection & External Screen Handling
  const [liveScreenFrame, setLiveScreenFrame] = useState<string | null>(null);
  const [selectedMonitor, setSelectedMonitor] = useState<string>("external");
  const selectedMonitorRef = useRef<string>("external");
  const [availableMonitors, setAvailableMonitors] = useState<
    Array<{ id: string; name: string; width: number; height: number; isExternal: boolean }>
  >([
    { id: "external", name: "External Screen", width: 1920, height: 1080, isExternal: true },
    { id: "primary", name: "Primary Screen", width: 1920, height: 1080, isExternal: false },
    { id: "all", name: "All Displays", width: 3840, height: 1080, isExternal: false },
  ]);

  // Connect to Tunnel / Cloud Relay WebSocket
  const handleConnectTunnel = (urlToUse?: string, authToken?: string) => {
    let url = (urlToUse || tunnelUrl).trim();
    const token = authToken || secretAuth;

    // Secure fallback: if on HTTPS and url starts with insecure ws://, upgrade to Cloud Relay
    if (window.location.protocol === "https:" && url.startsWith("ws://")) {
      const secureRelay = `wss://${window.location.host}/ws/relay?role=phone`;
      setRelayNotice("Switched to Secure Cloud Relay (WSS) to prevent Android mixed-content blocking.");
      url = secureRelay;
    }

    if (!url) {
      const defaultProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      url = `${defaultProtocol}//${window.location.host}/ws/relay?role=phone`;
    }

    setTunnelUrl(url);
    setIsConnecting(true);

    try {
      if (socketRef.current) {
        try {
          socketRef.current.close();
        } catch {
          // ignore close error
        }
      }

      const ws = new WebSocket(url);

      ws.onopen = () => {
        setIsConnecting(false);
        setIsConnected(true);
        ws.send(JSON.stringify({ type: "auth", token }));
        ws.send(JSON.stringify({ type: "start_stream", monitor: selectedMonitorRef.current }));
        ws.send(JSON.stringify({ type: "request_frame", monitor: selectedMonitorRef.current }));
        addJarvisMessage(`Connected to workstation via ${url.includes("ws/relay") ? "Secure Cloud Relay" : url}. Streaming monitor feed.`);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "pc_status") {
            if (data.status === "online") {
              setIsConnected(true);
              ws.send(JSON.stringify({ type: "start_stream", monitor: selectedMonitorRef.current }));
              ws.send(JSON.stringify({ type: "request_frame", monitor: selectedMonitorRef.current }));
              addJarvisMessage("Workstation is ONLINE via Cloud Relay. Streaming monitor feed.");
            } else {
              setIsConnected(false);
              addJarvisMessage("Cloud Relay active. Waiting for PC workstation (run 'python pc.py' on PC)...");
            }
          } else if (data.type === "screen_frame") {
            // Strictly check that the incoming frame matches the user's requested monitor
            if (data.activeMonitor && data.activeMonitor !== selectedMonitorRef.current) {
              return;
            }
            setIsConnected(true);
            setLiveScreenFrame(data.frame);
            if (data.monitors && Array.isArray(data.monitors)) {
              setAvailableMonitors(data.monitors);
            }
          } else if (data.type === "monitors_list") {
            if (data.monitors && Array.isArray(data.monitors)) {
              setAvailableMonitors(data.monitors);
            }
          } else if (data.type === "directive_response") {
            addJarvisMessage(`[PC] ${data.result}`);
          } else if (data.type === "auth_success") {
            setIsConnected(true);
            if (data.os) setOsName(data.os);
            addJarvisMessage("Workstation authentication accepted. Streaming monitor feed.");
            ws.send(JSON.stringify({ type: "start_stream", monitor: selectedMonitorRef.current }));
            ws.send(JSON.stringify({ type: "request_frame", monitor: selectedMonitorRef.current }));
          }
        } catch {
          addJarvisMessage(`[PC] ${event.data}`);
        }
      };

      ws.onerror = () => {
        setIsConnecting(false);
      };

      ws.onclose = () => {
        setIsConnecting(false);
        setIsConnected(false);
      };

      socketRef.current = ws;
    } catch (err) {
      setIsConnecting(false);
      setIsConnected(false);
      setRelayNotice(`Connection attempt notice: ${String(err)}`);
    }
  };

  // Automatically connect on mount & support one-click WhatsApp params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authParam = params.get("auth");
    const tunnelParam = params.get("tunnel");

    const token = authParam || secretAuth;
    if (authParam) setSecretAuth(authParam);

    const defaultProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const defaultRelayUrl = `${defaultProtocol}//${window.location.host}/ws/relay?role=phone`;

    const targetUrl = tunnelParam || defaultRelayUrl;
    handleConnectTunnel(targetUrl, token);

    // Keepalive / frame requester interval if connected
    const keepaliveInterval = setInterval(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: "request_frame", monitor: selectedMonitorRef.current }));
      }
    }, 3000);

    return () => {
      clearInterval(keepaliveInterval);
      if (socketRef.current) {
        try {
          socketRef.current.close();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleSelectMonitor = (monId: string) => {
    setSelectedMonitor(monId);
    selectedMonitorRef.current = monId;
    // Clear live frame so there is no residual artifact from the previous monitor feed
    setLiveScreenFrame(null);
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "set_monitor", monitor: monId }));
      socketRef.current.send(JSON.stringify({ type: "start_stream", monitor: monId }));
      socketRef.current.send(JSON.stringify({ type: "request_frame", monitor: monId }));
    }
  };

  let messageCounter = useRef(0);
  const generateUniqueMsgId = (sender: "jarvis" | "user") => {
    messageCounter.current += 1;
    return `${sender}-${Date.now()}-${messageCounter.current}-${Math.random().toString(36).substring(2, 8)}`;
  };

  const addJarvisMessage = (text: string, plan?: ActionStep[]) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    setChatMessages((prev) => [
      ...prev,
      {
        id: generateUniqueMsgId("jarvis"),
        sender: "jarvis",
        text,
        time: timeStr,
        plan,
      },
    ]);
  };

  const addUserMessage = (text: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    setChatMessages((prev) => [
      ...prev,
      {
        id: generateUniqueMsgId("user"),
        sender: "user",
        text,
        time: timeStr,
      },
    ]);
  };

  // AI-Powered Command Parser & Multi-Step Action Execution
  const handleSendCommand = async (cmdText: string) => {
    const cmd = cmdText.trim();
    if (!cmd) return;

    addUserMessage(cmd);
    setInputCommand("");
    setIsAiPlanning(true);

    try {
      // Query server-side Gemini AI Action Planner
      const response = await fetch("/api/jarvis/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd }),
      });

      if (!response.ok) throw new Error("Plan generation failed");
      const data = await response.json();
      const planSteps: ActionStep[] = data.actions || [];
      const summaryText: string = data.summary || `Executing plan for: "${cmd}", sir.`;

      setCurrentPlanSteps(planSteps);
      addJarvisMessage(summaryText, planSteps);

      // Execute on PC via WebSocket
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: "action_plan",
            actions: planSteps,
            auth: secretAuth,
          })
        );
      }

      // Simulate on screen projection
      const lower = cmd.toLowerCase();
      if (lower.includes("claude")) {
        setActiveWindow("claude");
      } else if (lower.includes("chrome") || lower.includes("youtube") || lower.includes("browser")) {
        setActiveWindow("chrome");
      } else if (lower.includes("code") || lower.includes("vs code")) {
        setActiveWindow("vscode");
      } else if (lower.includes("email") || lower.includes("outlook")) {
        setActiveWindow("outlook");
      }
    } catch {
      // Local fallback in case network disconnects
      addJarvisMessage(`Processing directive: "${cmd}", sir.`);
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: "directive", command: cmd }));
      }
    } finally {
      setIsAiPlanning(false);
    }
  };

  // Voice speech-to-text (100% silent, no sound, no vibration)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      handleSendCommand("open claude and type continue and hit enter");
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

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        handleSendCommand(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
      handleSendCommand("open claude and type continue and hit enter");
    }
  };

  // Touchpad Mouse Pointer interaction on Screen
  const handlePointerInteraction = (
    e: React.PointerEvent<HTMLDivElement>,
    containerRef: React.RefObject<HTMLDivElement | null>
  ) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    setCursorPos({ x, y });

    // Send pointer coordinates to PC mapped to selected monitor
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "mouse_move", x, y, monitor: selectedMonitorRef.current }));
    }
  };

  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    containerRef: React.RefObject<HTMLDivElement | null>
  ) => {
    setIsDraggingCursor(true);
    pointerStartPos.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    try {
      containerRef.current?.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    handlePointerInteraction(e, containerRef);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDraggingCursor(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    const dx = Math.abs(e.clientX - pointerStartPos.current.x);
    const dy = Math.abs(e.clientY - pointerStartPos.current.y);
    const dt = Date.now() - pointerStartPos.current.time;
    // If touched and released quickly with minimal movement, treat as a screen click
    if (dx < 12 && dy < 12 && dt < 400) {
      handleScreenClick();
    }
  };

  const handleScreenClick = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "mouse_click" }));
    }
  };

  const handleRightClick = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "mouse_right_click" }));
    }
  };

  const handleDoubleClick = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "mouse_double_click" }));
    }
  };

  const handleScroll = (direction: "up" | "down") => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({ type: "keyboard_key", key: direction === "up" ? "pageup" : "pagedown" })
      );
    }
  };

  // Keyboard typing to PC
  const sendKeyToPc = (key: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "keyboard_key", key }));
    }
  };

  const sendTextBufferToPc = () => {
    if (!keyboardBuffer) return;
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "keyboard_type", text: keyboardBuffer }));
    }
    addJarvisMessage(`Typed on PC: "${keyboardBuffer}"`);
    setKeyboardBuffer("");
  };

  const copyTunnelToClipboard = () => {
    navigator.clipboard.writeText(tunnelUrl);
    setCopiedTunnel(true);
    setTimeout(() => setCopiedTunnel(false), 2000);
  };

  // Triggers virtual keyboard when user clicks a textbox in the computer projection
  const triggerTextboxFocus = (targetName: string) => {
    setActiveFocusTarget(targetName);
    setShowVirtualKeyboard(true);
  };

  return (
    <div className="min-h-screen bg-[#020611] text-white flex flex-col items-center justify-start font-sans select-none overflow-x-hidden antialiased">
      {/* High-End Liquid Glass Background Ambient Glows & Specular Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[70%] h-[45%] rounded-full bg-cyan-600/12 blur-[140px]" />
        <div className="absolute top-[30%] right-[-15%] w-[65%] h-[50%] rounded-full bg-blue-600/12 blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[15%] w-[70%] h-[45%] rounded-full bg-indigo-600/12 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-transparent via-[#020611]/80 to-[#01040a]" />
      </div>

      {/* VIEW 1: LANDSCAPE FULL PC SCREEN REMOTE CONTROL (When "PC" Tab is active) */}
      {activeTab === "pc" ? (
        <div className="w-full flex-1 flex flex-col min-h-screen relative z-10 p-2 sm:p-4 max-w-6xl animate-in fade-in zoom-in-95 duration-200">
          {/* Top Landscape Glass Header */}
          <div className="flex items-center justify-between px-3 py-2 mb-2 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_12px_40px_rgba(0,0,0,0.8)]">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("home")}
                className="px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 hover:bg-white/10 text-xs font-semibold text-cyan-300 flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <HomeIcon className="h-3.5 w-3.5" />
                <span>Back to Home</span>
              </button>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                <span className="font-bold text-white">PC Landscape Mode</span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400">1920×1080</span>
              </div>
            </div>

            {/* Floating Controls in Landscape */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setShowVirtualKeyboard(!showVirtualKeyboard)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all active:scale-95 ${
                  showVirtualKeyboard
                    ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
                    : "bg-white/[0.06] border-white/10 text-slate-200 hover:bg-white/10"
                }`}
              >
                <KeyboardIcon className="h-3.5 w-3.5" />
                <span>Keyboard</span>
              </button>
              <button
                onClick={handleScreenClick}
                className="px-2.5 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 hover:bg-cyan-500/30 text-xs font-semibold text-cyan-200 active:scale-95 transition-all"
              >
                Left Click
              </button>
              <button
                onClick={handleRightClick}
                className="px-2.5 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 hover:bg-white/10 text-xs font-semibold text-slate-200 active:scale-95 transition-all"
              >
                Right Click
              </button>
              <button
                onClick={handleDoubleClick}
                className="px-2.5 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 hover:bg-white/10 text-xs font-semibold text-slate-200 active:scale-95 transition-all"
              >
                2x Click
              </button>
              <button
                onClick={() => handleScroll("up")}
                className="px-2.5 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 hover:bg-white/10 text-xs font-semibold text-slate-200 active:scale-95 transition-all"
                title="Scroll Up (Page Up)"
              >
                ▲ Scroll
              </button>
              <button
                onClick={() => handleScroll("down")}
                className="px-2.5 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 hover:bg-white/10 text-xs font-semibold text-slate-200 active:scale-95 transition-all"
                title="Scroll Down (Page Down)"
              >
                ▼ Scroll
              </button>
            </div>
          </div>

          {/* Virtual Keyboard in Landscape PC Mode with Framer Motion Fluid Animation */}
          <AnimatePresence>
            {showVirtualKeyboard && (
              <VirtualKeyboard
                isOpen={showVirtualKeyboard}
                onClose={() => setShowVirtualKeyboard(false)}
                activeFocusTarget={activeFocusTarget}
                buffer={keyboardBuffer}
                onBufferChange={setKeyboardBuffer}
                onSendBuffer={sendTextBufferToPc}
                onSendKey={sendKeyToPc}
                isLandscape={true}
              />
            )}
          </AnimatePresence>

          {/* Full Landscape Screen Projection Canvas */}
          <div className="relative flex-1 w-full rounded-3xl p-[1px] bg-gradient-to-b from-white/20 via-cyan-500/20 to-blue-500/30 shadow-[0_16px_48px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
            {/* Landscape Monitor Switcher Bar */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/90 border-b border-white/10 z-20">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                <span className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase">
                  {selectedMonitor === "external" ? "🖥️ External Screen (Active)" : selectedMonitor === "primary" ? "💻 Primary Screen" : "🔲 All Displays"}
                </span>
                {liveScreenFrame && (
                  <span className="bg-rose-950/70 border border-rose-500/50 text-rose-300 text-[9px] px-1.5 py-0.2 rounded font-bold animate-pulse">
                    LIVE
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleSelectMonitor("external")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedMonitor === "external"
                      ? "bg-cyan-400 text-slate-950 font-bold shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  🖥️ External Screen
                </button>
                <button
                  onClick={() => handleSelectMonitor("primary")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedMonitor === "primary"
                      ? "bg-cyan-400 text-slate-950 font-bold shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  💻 Primary
                </button>
                <button
                  onClick={() => handleSelectMonitor("all")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedMonitor === "all"
                      ? "bg-cyan-400 text-slate-950 font-bold shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  🔲 All
                </button>
              </div>
            </div>

            <div
              ref={landscapeContainerRef}
              onPointerDown={(e) => handlePointerDown(e, landscapeContainerRef)}
              onPointerMove={(e) => {
                if (isDraggingCursor) handlePointerInteraction(e, landscapeContainerRef);
              }}
              onPointerUp={handlePointerUp}
              className="relative flex-1 w-full min-h-[420px] sm:min-h-[520px] rounded-[23px] overflow-hidden bg-black select-none cursor-crosshair touch-none"
            >
              {/* CLEAN LIVE WORKSTATION SCREEN FEED (REQUESTED MONITOR ONLY) */}
              {liveScreenFrame ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black select-none">
                  <img
                    src={liveScreenFrame}
                    alt={`Monitor Stream - ${selectedMonitor}`}
                    className="w-full h-full object-contain pointer-events-none select-none"
                    style={{ imageRendering: "auto" }}
                  />
                </div>
              ) : (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-6 bg-slate-950/95 select-none">
                  <div className="relative mb-3">
                    <Monitor className="h-12 w-12 text-cyan-400 animate-pulse" />
                    <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-cyan-400 animate-ping" />
                  </div>
                  <p className="text-sm font-bold text-white tracking-wide">
                    Waiting for Live Screen Stream...
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    Connecting to workstation. Displaying requested feed: <span className="text-cyan-300 font-mono font-bold">{selectedMonitor}</span>.
                  </p>
                </div>
              )}

              {/* Minimal touch feedback ring ONLY when actively touching/dragging - zero overlapping virtual UI badges */}
              {isDraggingCursor && (
                <div
                  className="absolute pointer-events-none transition-transform duration-75 ease-out select-none z-30"
                  style={{
                    left: `${cursorPos.x}%`,
                    top: `${cursorPos.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div className="h-6 w-6 rounded-full border border-cyan-400/80 bg-cyan-400/20 shadow-[0_0_12px_rgba(34,211,238,0.7)]" />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* VIEW 2: REFINED LIQUID GLASS HOME DASHBOARD (Exact mobile phone layout requested) */
        <div className="w-full max-w-[430px] flex-1 flex flex-col min-h-screen relative z-10 px-3 pt-3 pb-2">
          {/* TOP CARD: Refined Liquid Glass JARVIS Connected Card */}
          <div
            onClick={() => setShowSettingsModal(true)}
            className="group relative rounded-3xl p-3.5 mb-3 cursor-pointer transition-all duration-300 active:scale-[0.99] border border-white/15 bg-gradient-to-r from-white/[0.08] via-white/[0.04] to-white/[0.06] backdrop-blur-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_12px_40px_rgba(0,0,0,0.7)] flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              {/* Miniature PC Screen Thumbnail with glowing neon frame */}
              <div className="relative h-12 w-16 rounded-xl border border-cyan-400/60 bg-[#070e1f] p-0.5 shadow-[0_0_16px_rgba(6,182,212,0.4)] flex flex-col justify-between overflow-hidden">
                {liveScreenFrame ? (
                  <img
                    src={liveScreenFrame}
                    alt="Workstation Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/40 via-[#071329] to-blue-950/40" />
                    <div className="relative z-10 w-full h-full flex flex-col justify-between p-1">
                      <div className="flex justify-between items-center text-[7px] text-cyan-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        <span className="text-[7px] font-mono opacity-90">LIVE</span>
                      </div>
                      <div className="flex items-center justify-center text-[7px] text-cyan-200">
                        <Monitor className="h-4 w-4 text-cyan-400" />
                      </div>
                      <div className="w-full h-1 bg-cyan-900/50 rounded-xs" />
                    </div>
                  </>
                )}
              </div>

              {/* Title & Connection Details */}
              <div>
                <h1 className="text-base font-extrabold tracking-wide text-white leading-tight flex items-center gap-1.5">
                  JARVIS
                </h1>
                <p className="text-xs text-slate-300 font-medium">Connected to your PC</p>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] font-medium">
                  <span
                    className={`flex items-center gap-1 ${
                      isConnected ? "text-emerald-400" : isConnecting ? "text-amber-400" : "text-cyan-400"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isConnected
                          ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"
                          : isConnecting
                          ? "bg-amber-400 animate-ping"
                          : "bg-cyan-500 animate-pulse shadow-[0_0_8px_#06b6d4]"
                      }`}
                    />
                    {isConnected ? "Online (Cloud Relay)" : isConnecting ? "Connecting..." : "Awaiting PC Feed"}
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-300 font-normal">{osName}</span>
                </div>
              </div>
            </div>

            <div className="p-1 rounded-full text-slate-400 group-hover:text-cyan-300 transition-colors">
              <ChevronRight className="h-5 w-5" />
            </div>
          </div>

          {relayNotice && (
            <div className="mb-2 px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-[11px] text-cyan-200 flex items-center justify-between">
              <span>{relayNotice}</span>
              <button onClick={() => setRelayNotice(null)} className="text-slate-400 hover:text-white ml-2">✕</button>
            </div>
          )}

          {/* NAVIGATION SEGMENTED CONTROL: Home | PC (Clicking PC switches to Landscape Remote) */}
          <div className="flex items-center justify-around border-b border-cyan-950/80 mb-3 text-sm font-medium">
            <button
              onClick={() => setActiveTab("home")}
              className="flex items-center gap-2 py-2 px-6 relative transition-all text-cyan-400 font-semibold"
            >
              <HomeIcon className="h-4 w-4" />
              <span>Home</span>
              <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            </button>

            <button
              onClick={() => setActiveTab("pc")}
              className="flex items-center gap-2 py-2 px-6 relative transition-all text-slate-400 hover:text-white"
            >
              <Monitor className="h-4 w-4" />
              <span>PC</span>
            </button>
          </div>

          {/* CENTRAL PC PROJECTION SCREEN (Liquid Glass with interactive textbox detection) */}
          <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-white/20 via-cyan-500/20 to-blue-500/30 shadow-[0_16px_48px_rgba(0,0,0,0.8)] mb-3">
            <div className="rounded-[23px] bg-[#070f22] overflow-hidden flex flex-col relative aspect-[16/10] min-h-[220px]">
              {/* Home Screen Monitor Switcher Header */}
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/90 border-b border-white/10 z-20">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                  <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
                    {selectedMonitor === "external" ? "🖥️ External Screen" : selectedMonitor === "primary" ? "💻 Primary" : "🔲 All"}
                  </span>
                  {liveScreenFrame && (
                    <span className="bg-rose-950/70 border border-rose-500/50 text-rose-300 text-[8px] px-1 py-0.2 rounded font-bold animate-pulse">
                      LIVE
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleSelectMonitor("external")}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all ${
                      selectedMonitor === "external"
                        ? "bg-cyan-400 text-slate-950 font-bold shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    🖥️ External
                  </button>
                  <button
                    onClick={() => handleSelectMonitor("primary")}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all ${
                      selectedMonitor === "primary"
                        ? "bg-cyan-400 text-slate-950 font-bold shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    💻 Primary
                  </button>
                  <button
                    onClick={() => handleSelectMonitor("all")}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all ${
                      selectedMonitor === "all"
                        ? "bg-cyan-400 text-slate-950 font-bold shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    🔲 All
                  </button>
                </div>
              </div>

              <div
                ref={screenContainerRef}
                onPointerDown={(e) => handlePointerDown(e, screenContainerRef)}
                onPointerMove={(e) => {
                  if (isDraggingCursor) handlePointerInteraction(e, screenContainerRef);
                }}
                onPointerUp={handlePointerUp}
                className="relative flex-1 w-full h-full cursor-crosshair touch-none select-none overflow-hidden bg-black"
              >
                {/* CLEAN LIVE WORKSTATION SCREEN FEED (REQUESTED MONITOR ONLY) */}
                {liveScreenFrame ? (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black select-none">
                    <img
                      src={liveScreenFrame}
                      alt={`Monitor Stream - ${selectedMonitor}`}
                      className="w-full h-full object-contain pointer-events-none select-none"
                      style={{ imageRendering: "auto" }}
                    />
                  </div>
                ) : (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-4 bg-slate-950/95 select-none">
                    <div className="relative mb-2">
                      <Monitor className="h-9 w-9 text-cyan-400 animate-pulse" />
                      <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
                    </div>
                    <p className="text-xs font-bold text-white tracking-wide">
                      Waiting for Workstation Screen Feed...
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 max-w-xs">
                      Make sure <code className="text-cyan-300 font-mono">python pc.py</code> is running on your PC. Requested display: <span className="text-cyan-300 font-mono font-semibold">{selectedMonitor}</span>.
                    </p>
                  </div>
                )}

                {/* Minimal touch feedback ring ONLY when actively touching/dragging - zero overlapping virtual UI badges */}
                {isDraggingCursor && (
                  <div
                    className="absolute pointer-events-none transition-transform duration-75 ease-out select-none z-30"
                    style={{
                      left: `${cursorPos.x}%`,
                      top: `${cursorPos.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <div className="h-5 w-5 rounded-full border border-cyan-400/80 bg-cyan-400/20 shadow-[0_0_10px_rgba(34,211,238,0.7)]" />
                  </div>
                )}
              </div>

              {/* Quick Touch Controls Bar in Home View */}
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-950/90 border-t border-white/10 z-20">
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleScreenClick}
                    className="px-2 py-1 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-[11px] font-semibold text-cyan-200 active:scale-95 transition-all"
                  >
                    Left Click
                  </button>
                  <button
                    onClick={handleRightClick}
                    className="px-2 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-[11px] font-semibold text-slate-200 active:scale-95 transition-all"
                  >
                    Right Click
                  </button>
                  <button
                    onClick={handleDoubleClick}
                    className="px-2 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-[11px] font-semibold text-slate-200 active:scale-95 transition-all"
                  >
                    2x
                  </button>
                  <button
                    onClick={() => setShowVirtualKeyboard(!showVirtualKeyboard)}
                    className={`px-2 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1 active:scale-95 transition-all ${
                      showVirtualKeyboard
                        ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                        : "bg-white/[0.06] border-white/10 text-slate-200"
                    }`}
                  >
                    <KeyboardIcon className="h-3 w-3" />
                    <span>Keys</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleScroll("up")}
                    className="px-1.5 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-[11px] text-slate-300 hover:text-white active:scale-95"
                    title="Scroll Up"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => handleScroll("down")}
                    className="px-1.5 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-[11px] text-slate-300 hover:text-white active:scale-95"
                    title="Scroll Down"
                  >
                    ▼
                  </button>
                  <button
                    onClick={() => setActiveTab("pc")}
                    className="p-1.5 rounded-lg bg-black/60 border border-cyan-500/40 text-cyan-300 hover:text-white transition-all active:scale-95 shadow-lg ml-1"
                    title="Full Landscape Remote Mode"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* VIRTUAL PHONE KEYBOARD (Pops up with Framer Motion when textbox or keyboard button is tapped) */}
          <AnimatePresence>
            {showVirtualKeyboard && (
              <VirtualKeyboard
                isOpen={showVirtualKeyboard}
                onClose={() => setShowVirtualKeyboard(false)}
                activeFocusTarget={activeFocusTarget}
                buffer={keyboardBuffer}
                onBufferChange={setKeyboardBuffer}
                onSendBuffer={sendTextBufferToPc}
                onSendKey={sendKeyToPc}
                isLandscape={false}
              />
            )}
          </AnimatePresence>

          {/* ASSISTANT / CHAT SECTION (Refined Liquid Glass with Framer Motion animations) */}
          <div className="flex-1 flex flex-col space-y-2.5 mb-3">
            <AnimatePresence initial={false}>
              {chatMessages.slice(-3).map((msg, idx) => (
                <motion.div
                  key={msg.id ? `${msg.id}-${idx}` : `msg-${idx}`}
                  initial={{ opacity: 0, y: 14, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className={`flex items-start gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.sender === "jarvis" && (
                    <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-cyan-950 via-[#0a1835] to-blue-950 border border-cyan-400/80 shadow-[0_0_14px_rgba(6,182,212,0.5)] flex items-center justify-center font-bold text-white text-base">
                      J
                    </div>
                  )}

                  <div
                    className={`rounded-3xl p-3.5 backdrop-blur-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_12px_32px_rgba(0,0,0,0.6)] max-w-[88%] space-y-1.5 ${
                      msg.sender === "user"
                        ? "rounded-tr-sm bg-gradient-to-br from-cyan-900/40 via-blue-900/30 to-indigo-900/40 border border-cyan-400/40 text-right ml-auto"
                        : "rounded-tl-sm bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/15"
                    }`}
                  >
                    <p className="text-xs text-white leading-relaxed font-medium">
                      {msg.text}
                    </p>

                    {/* AI Multi-Step Plan Badges (if any) */}
                    {msg.plan && msg.plan.length > 0 && (
                      <div className="pt-1 flex flex-wrap gap-1">
                        {msg.plan.map((step, idx) => (
                          <motion.span
                            key={idx}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="px-2 py-0.5 rounded-md bg-cyan-950/70 border border-cyan-600/40 text-[9px] font-mono text-cyan-300 flex items-center gap-1 shadow-sm"
                          >
                            <span className="text-[8px] opacity-70">#{idx + 1}</span>
                            <span>{step.type}</span>
                            {step.value && <span className="text-white font-bold">&quot;{step.value}&quot;</span>}
                          </motion.span>
                        ))}
                      </div>
                    )}

                    <p className={`text-[10px] text-slate-400 font-mono ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                      {msg.time}
                    </p>
                  </div>

                  {msg.sender === "user" && (
                    <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-cyan-900 to-blue-950 border border-cyan-500/50 flex items-center justify-center font-bold text-cyan-200 text-xs shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                      You
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Quick Suggestions Box with Lightbulb */}
            <div className="rounded-3xl p-3.5 bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/15 backdrop-blur-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_12px_32px_rgba(0,0,0,0.6)] flex items-start gap-3">
              <div className="p-1 rounded-lg text-cyan-400 mt-0.5">
                <Lightbulb className="h-4 w-4 text-cyan-400 drop-shadow-[0_0_8px_#22d3ee]" />
              </div>

              <div className="flex-1 space-y-1.5">
                <p className="text-xs text-slate-300 font-medium">Try saying:</p>

                <div className="flex flex-wrap gap-2 pt-0.5">
                  {[
                    "open claude and type continue and hit enter",
                    "Open email",
                    "Open Chrome",
                    "Search for latest AI news",
                    "Open VS Code",
                  ].map((promptText) => (
                    <button
                      key={promptText}
                      onClick={() => handleSendCommand(promptText)}
                      className="text-xs text-slate-200 hover:text-cyan-300 transition-colors cursor-pointer active:scale-95"
                    >
                      &ldquo;{promptText}&rdquo;
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Vocal Visualizer */}
          {isListening && (
            <VocalVisualizer
              isListening={isListening}
              onStopListening={() => setIsListening(false)}
              className="mb-2"
            />
          )}

          {/* COMMAND INPUT BAR (Refined Liquid Glass Pill with Monitor Icon & Blue Send Button) */}
          <div className="relative flex items-center gap-2 mb-2">
            <div className="flex-1 relative flex items-center rounded-full bg-gradient-to-r from-white/[0.09] via-white/[0.04] to-white/[0.07] border border-white/20 backdrop-blur-3xl px-3.5 py-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_8px_32px_rgba(0,0,0,0.6)]">
              <Monitor className="h-4 w-4 text-slate-400 shrink-0 mr-2" />

              <input
                type="text"
                value={inputCommand}
                onChange={(e) => setInputCommand(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && inputCommand.trim()) {
                    handleSendCommand(inputCommand);
                  }
                }}
                placeholder="e.g. open claude and type continue and hit enter..."
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-sans"
              />

              <button
                onClick={toggleSpeechRecognition}
                className={`p-1.5 rounded-full mr-1 text-slate-400 hover:text-cyan-300 transition-colors ${
                  isListening ? "text-rose-400 animate-pulse" : ""
                }`}
                title="Voice Directive"
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>

              <button
                onClick={() => handleSendCommand(inputCommand)}
                disabled={!inputCommand.trim() || isAiPlanning}
                className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 text-white flex items-center justify-center shadow-[0_0_14px_rgba(6,182,212,0.6)] disabled:opacity-40 active:scale-95 transition-all"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Clean Android Gesture Navigation Indicator Line */}
          <div className="flex items-center justify-center py-2 px-10">
            <div className="w-24 h-1 rounded-full bg-slate-700/60" />
          </div>
        </div>
      )}

      {/* SETTINGS / NGROK & WHATSAPP MODAL DIALOG (Refined Apple Liquid Glass) */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl p-6 bg-gradient-to-b from-white/[0.09] via-[#070e1e]/95 to-black/95 border border-white/20 backdrop-blur-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_24px_64px_rgba(0,0,0,0.9)] space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-cyan-400" />
                <h2 className="text-sm font-bold font-mono text-white tracking-wide">
                  PC AGENT &amp; TUNNEL CONFIG
                </h2>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Target Phone Notification */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs space-y-1">
              <p className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>WhatsApp Auto-Send Configured</span>
              </p>
              <p className="text-slate-300 text-[11px] font-mono">
                When you run <code className="text-cyan-300">python pc.py</code>, it opens WhatsApp Web to{" "}
                <strong className="text-white">{targetPhone}</strong> with the tunnel URL &amp; Secret Auth!
              </p>
            </div>

            {/* Ngrok Tunnel URL Input */}
            <div className="space-y-1">
              <label className="text-xs font-mono text-cyan-300 font-semibold flex items-center justify-between">
                <span>NGROK TUNNEL URL (WSS://)</span>
                {copiedTunnel ? (
                  <span className="text-[10px] text-emerald-400">Copied!</span>
                ) : (
                  <button
                    onClick={copyTunnelToClipboard}
                    className="text-[10px] text-slate-400 hover:text-cyan-300 flex items-center gap-0.5"
                  >
                    <Copy className="h-3 w-3" /> Copy
                  </button>
                )}
              </label>
              <input
                type="text"
                value={tunnelUrl}
                onChange={(e) => setTunnelUrl(e.target.value)}
                placeholder="wss://0.tcp.ngrok.io:12345"
                className="w-full rounded-xl bg-black/60 border border-white/15 px-3 py-2.5 text-xs font-mono text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* Secret Auth Token */}
            <div className="space-y-1">
              <label className="text-xs font-mono text-cyan-300 font-semibold">
                SECRET AUTH TOKEN
              </label>
              <input
                type="text"
                value={secretAuth}
                onChange={(e) => setSecretAuth(e.target.value)}
                placeholder="JARVIS-7749"
                className="w-full rounded-xl bg-black/60 border border-white/15 px-3 py-2.5 text-xs font-mono text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  handleConnectTunnel(tunnelUrl);
                  setShowSettingsModal(false);
                }}
                disabled={isConnecting}
                className="flex-1 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold font-mono text-xs hover:bg-cyan-400 active:scale-95 transition-all text-center shadow-[0_0_16px_rgba(6,182,212,0.4)]"
              >
                {isConnecting ? "Connecting..." : "Connect Tunnel"}
              </button>

              <a
                href="/pc.py"
                download="pc.py"
                className="px-4 py-2.5 rounded-xl bg-white/[0.07] border border-white/15 font-mono text-xs text-slate-200 hover:border-cyan-400 hover:text-cyan-300 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5 text-cyan-400" />
                <span>Download pc.py</span>
              </a>
            </div>

            {/* Quick Terminal Guide */}
            <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 text-[11px] font-mono text-slate-400 space-y-1.5">
              <p className="text-slate-300 font-semibold">Run on your PC terminal:</p>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-emerald-400 select-all">
                python pc.py
              </div>
              <p className="text-[10px] text-slate-500">
                100% Silent execution • Zero sound • Zero vibration
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
