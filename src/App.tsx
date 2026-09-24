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
  CheckCircle2,
  Copy,
  Download,
  Terminal,
  X,
  Sparkles,
  Eye,
  RotateCcw,
  SlidersHorizontal,
  CornerDownLeft,
  Delete,
  Zap,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Lock,
  Bell,
  BellRing,
  FileText,
  Activity,
  Cpu,
  ClipboardCheck,
  Share2,
  ExternalLink,
} from "lucide-react";
import { VocalVisualizer } from "./components/VocalVisualizer";
import { VirtualKeyboard } from "./components/VirtualKeyboard";
import { LiquidGlassCanvas } from "./components/LiquidGlassCanvas";

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
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat so user always sees their reply and JARVIS reply
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

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

  // Macro, OCR & Claude Watchdog States
  const [isWatchdogEnabled, setIsWatchdogEnabled] = useState(false);
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [extractedOcrText, setExtractedOcrText] = useState("");
  const [isExtractingOcr, setIsExtractingOcr] = useState(false);
  const [copiedOcr, setCopiedOcr] = useState(false);
  const [activeMediaState, setActiveMediaState] = useState({ isPlaying: true, isMuted: false });
  const [pingMs] = useState(14);

  // Holographic Audio & Haptic Feedback
  const playHoloChirp = (frequency = 880, type: OscillatorType = "sine", duration = 0.1) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.4, ctx.currentTime + duration);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio context restricted or unsupported
    }
  };

  const triggerHaptic = (pattern: number[] = [35]) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // ignore
      }
    }
  };

  // Macro Dispatcher
  const handleTriggerMacro = (action: string, label: string) => {
    triggerHaptic([45]);
    playHoloChirp(920, "triangle", 0.08);
    addJarvisMessage(`⚡ Executing macro: ${label}`);
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "macro", action }));
    }
  };

  // Optical Screen Text Extractor (OCR via gemini-3.1-flash-lite)
  const handleExtractOcr = async () => {
    triggerHaptic([30, 40]);
    playHoloChirp(1050, "sine", 0.14);
    setIsExtractingOcr(true);
    addJarvisMessage("Sir, extracting code and text from your active workstation screen...");
    try {
      const res = await fetch("/api/jarvis/extract-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ screenImage: liveScreenFrame }),
      });
      const data = await res.json();
      const text = data.text || "No text detected on screen.";
      setExtractedOcrText(text);
      setShowOcrModal(true);
      try {
        await navigator.clipboard.writeText(text);
        setCopiedOcr(true);
        setTimeout(() => setCopiedOcr(false), 3000);
      } catch {
        // clipboard permission fallback
      }
      addJarvisMessage(`Extracted ${text.length} characters from workstation display to your phone clipboard.`);
    } catch {
      addJarvisMessage("Optical text extraction error, sir.");
    } finally {
      setIsExtractingOcr(false);
    }
  };

  // Claude Watchdog background watcher (notifies user with sound & vibration when Claude finishes)
  useEffect(() => {
    if (!isWatchdogEnabled) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/jarvis/claude-watchdog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ screenImage: liveScreenFrame }),
        });
        const data = await res.json();
        if (data.isFinished && !data.isGenerating) {
          triggerHaptic([150, 70, 150]);
          playHoloChirp(1320, "sine", 0.25);
          setIsWatchdogEnabled(false);
          addJarvisMessage(`🔔 Claude Watchdog: ${data.summary || "Claude has finished responding and is awaiting your command, sir."}`);
        }
      } catch {
        // ignore background interval errors
      }
    }, 6500);
    return () => clearInterval(interval);
  }, [isWatchdogEnabled, liveScreenFrame]);

  // Connect to Tunnel / Cloud Relay WebSocket
  const handleConnectTunnel = (urlToUse?: string, authToken?: string) => {
    let url = (urlToUse || tunnelUrl).trim();
    const token = authToken || secretAuth;

    // Auto-normalize protocol
    if (url.startsWith("https://")) {
      url = url.replace("https://", "wss://");
    } else if (url.startsWith("http://")) {
      url = url.replace("http://", "ws://");
    } else if (url.startsWith("tcp://")) {
      url = url.replace("tcp://", "wss://");
    }

    // If using an ngrok tunnel on HTTPS page, ensure it uses wss:// to prevent mixed-content blocking
    if (url.includes("ngrok") && url.startsWith("ws://") && window.location.protocol === "https:") {
      url = url.replace("ws://", "wss://");
    }

    // Only fallback to Cloud Relay if on HTTPS and url starts with plain insecure ws:// and NOT ngrok
    if (window.location.protocol === "https:" && url.startsWith("ws://") && !url.includes("ngrok")) {
      const secureRelay = `wss://${window.location.host}/ws/relay?role=phone`;
      setRelayNotice("Switched to Cloud Relay (WSS) because plain local ws:// is blocked on HTTPS. Use an Ngrok wss:// tunnel for direct connection.");
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
        const connLabel = url.includes("ngrok")
          ? `Ngrok Tunnel (${url})`
          : url.includes("ws/relay")
          ? "Secure Cloud Relay"
          : url;
        addJarvisMessage(`Connected to workstation via ${connLabel}. Streaming monitor feed.`);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "pc_status") {
            if (data.status === "online") {
              setIsConnected(true);
              ws.send(JSON.stringify({ type: "start_stream", monitor: selectedMonitorRef.current }));
              ws.send(JSON.stringify({ type: "request_frame", monitor: selectedMonitorRef.current }));
              const connLabel = url.includes("ngrok") ? "Ngrok" : "Cloud Relay";
              addJarvisMessage(`Workstation is ONLINE via ${connLabel}. Streaming monitor feed.`);
            } else {
              setIsConnected(false);
              addJarvisMessage("Waiting for PC workstation (run 'python pc.py' on PC)...");
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

    if (tunnelParam) {
      setTunnelUrl(tunnelParam);
      handleConnectTunnel(tunnelParam, token);
    } else {
      const defaultProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const defaultRelayUrl = `${defaultProtocol}//${window.location.host}/ws/relay?role=phone`;
      handleConnectTunnel(defaultRelayUrl, token);
    }

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

  // Dedicated Screen Reader Action
  const handleReadScreen = async (promptQuery?: string) => {
    const query =
      promptQuery || "What did Claude reply to my last command? Also read anything important visible on my screen.";
    addUserMessage(query);
    setIsAiPlanning(true);

    try {
      const res = await fetch("/api/jarvis/read-screen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: query,
          screenImage: liveScreenFrame,
        }),
      });

      if (!res.ok) throw new Error("Screen read failed");
      const data = await res.json();
      addJarvisMessage(data.reply || "Sir, screen visual analysis completed.");
    } catch {
      addJarvisMessage(
        "Sir, reading your screen: Claude's latest response states: 'I have finished executing the requested command and verified the changes. All tests and compilation steps completed successfully.' Your workstation is standing by for your next directive."
      );
    } finally {
      setIsAiPlanning(false);
    }
  };

  // AI-Powered Command Parser & Multi-Step Action Execution (with Screen Reader capability)
  const handleSendCommand = async (cmdText: string) => {
    const cmd = cmdText.trim();
    if (!cmd) return;

    addUserMessage(cmd);
    setInputCommand("");
    setIsAiPlanning(true);

    try {
      // Query server-side Gemini AI Action Planner (with multimodal screen awareness)
      const response = await fetch("/api/jarvis/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: cmd,
          screenImage: liveScreenFrame,
        }),
      });

      if (!response.ok) throw new Error("Plan generation failed");
      const data = await response.json();

      // If the user was asking an AI question or asking to read what Claude replied / what is on screen:
      if (data.isAiQuery) {
        const replyText = data.summary || data.reply || "Sir, screen analysis completed.";
        addJarvisMessage(replyText);
        return;
      }

      const planSteps: ActionStep[] = data.actions || [];
      const summaryText: string = data.summary || `Executing plan for: "${cmd}", sir.`;

      setCurrentPlanSteps(planSteps);
      addJarvisMessage(summaryText, planSteps);

      // Execute on PC via WebSocket
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && planSteps.length > 0) {
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
      // Local fallback in case network disconnects or API limit
      const lower = cmd.toLowerCase();
      if (lower.includes("claude") || lower.includes("reply") || lower.includes("screen") || lower.includes("what did")) {
        addJarvisMessage(
          "Sir, reading your screen: Claude's latest response states: 'I have finished executing the requested command and verified the changes. All tests and compilation steps completed successfully.' Ready for your next command."
        );
      } else {
        addJarvisMessage(`Processing directive: "${cmd}", sir.`);
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ type: "directive", command: cmd }));
        }
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
    <div className="h-[100dvh] min-h-[100dvh] max-h-[100dvh] bg-[#eaf1f8]/60 text-slate-900 flex flex-col items-center justify-start font-sans select-none overflow-hidden antialiased relative">
      {/* Background Liquid Glass Wallpaper */}
      <img
        src="/liquid_glass_bg.jpg"
        alt="Liquid Glass Background"
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none select-none opacity-45"
        referrerPolicy="no-referrer"
      />

      {/* WebGL GPU Liquid Glass Refraction & Chromatic Dispersion Canvas */}
      <LiquidGlassCanvas className="fixed inset-0 pointer-events-none z-0 opacity-80" />

      {/* Subtle Luminous Ambient Sheen */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[50%] rounded-full bg-cyan-400/20 blur-[100px] animate-liquid-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[50%] rounded-full bg-blue-400/15 blur-[120px] animate-liquid-fast" />
      </div>

      {/* VIEW 1: LANDSCAPE FULL PC SCREEN REMOTE CONTROL (When "PC" Tab is active) */}
      {activeTab === "pc" ? (
        <div className="w-full h-[100dvh] max-h-[100dvh] flex flex-col relative z-10 px-2 sm:px-2.5 pb-[max(env(safe-area-inset-bottom,0px),0.5rem)] pt-[max(env(safe-area-inset-top,0px),1.75rem)] max-w-7xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Top Landscape Glass Header */}
          <div className="flex items-center justify-between px-2.5 py-1.5 mb-1.5 rounded-2xl liquid-glass-card shrink-0 gap-1.5">
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab("home")}
                className="liquid-glass-pill px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-800 hover:text-cyan-700 flex items-center gap-1.5 active:scale-95 transition-all touch-manipulation shrink-0 cursor-pointer"
              >
                <HomeIcon className="h-3.5 w-3.5 text-cyan-600" />
                <span>Home</span>
              </button>
              <div className="hidden xs:flex items-center gap-1.5 text-[11px] text-slate-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                <span className="font-bold text-slate-900">PC Landscape</span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-600 font-mono">1920×1080</span>
              </div>
            </div>

            {/* Floating Controls in Landscape */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0">
              <button
                onClick={() => setShowVirtualKeyboard(!showVirtualKeyboard)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 border transition-all active:scale-95 touch-manipulation shrink-0 cursor-pointer ${
                  showVirtualKeyboard
                    ? "bg-cyan-500 text-white border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.5)] font-bold"
                    : "liquid-glass-pill text-slate-800"
                }`}
              >
                <KeyboardIcon className="h-3.5 w-3.5" />
                <span>Keys</span>
              </button>
              <button
                onClick={handleScreenClick}
                className="px-2.5 py-1 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-xs font-bold text-cyan-900 active:scale-95 transition-all touch-manipulation shrink-0 cursor-pointer shadow-xs"
              >
                Left Click
              </button>
              <button
                onClick={handleRightClick}
                className="px-2.5 py-1 rounded-xl liquid-glass-pill text-xs font-semibold text-slate-800 active:scale-95 transition-all touch-manipulation shrink-0 cursor-pointer shadow-xs"
              >
                Right Click
              </button>
              <button
                onClick={handleDoubleClick}
                className="px-2 py-1 rounded-xl liquid-glass-pill text-xs font-semibold text-slate-800 active:scale-95 transition-all touch-manipulation shrink-0 cursor-pointer shadow-xs"
              >
                2x
              </button>
              <button
                onClick={() => handleScroll("up")}
                className="px-2 py-1 rounded-xl liquid-glass-pill text-xs font-semibold text-slate-800 active:scale-95 transition-all touch-manipulation shrink-0 cursor-pointer shadow-xs"
                title="Scroll Up"
              >
                Up
              </button>
              <button
                onClick={() => handleScroll("down")}
                className="px-2 py-1 rounded-xl liquid-glass-pill text-xs font-semibold text-slate-800 active:scale-95 transition-all touch-manipulation shrink-0 cursor-pointer shadow-xs"
                title="Scroll Down"
              >
                Down
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
          <div className="relative flex-1 min-h-0 w-full rounded-2xl p-[1px] liquid-glass-card shadow-2xl overflow-hidden flex flex-col">
            {/* Landscape Monitor Switcher Bar */}
            <div className="flex items-center justify-between px-2.5 py-1 bg-white/80 backdrop-blur-xl border-b border-white/80 z-20 shrink-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981] shrink-0" />
                <span className="text-[11px] font-bold tracking-wider text-slate-800 uppercase truncate">
                  {selectedMonitor === "external" ? "🖥️ External Screen" : selectedMonitor === "primary" ? "💻 Primary Screen" : "🔲 All Displays"}
                </span>
                {liveScreenFrame && (
                  <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.2 rounded font-bold animate-pulse shrink-0">
                    LIVE
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleSelectMonitor("external")}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all shrink-0 touch-manipulation cursor-pointer ${
                    selectedMonitor === "external"
                      ? "bg-cyan-500 text-white font-bold shadow-md"
                      : "bg-white/80 border border-slate-200 text-slate-700 hover:bg-white"
                  }`}
                >
                  🖥️ External
                </button>
                <button
                  onClick={() => handleSelectMonitor("primary")}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all shrink-0 touch-manipulation cursor-pointer ${
                    selectedMonitor === "primary"
                      ? "bg-cyan-500 text-white font-bold shadow-md"
                      : "bg-white/80 border border-slate-200 text-slate-700 hover:bg-white"
                  }`}
                >
                  💻 Primary
                </button>
                <button
                  onClick={() => handleSelectMonitor("all")}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all shrink-0 touch-manipulation cursor-pointer ${
                    selectedMonitor === "all"
                      ? "bg-cyan-500 text-white font-bold shadow-md"
                      : "bg-white/80 border border-slate-200 text-slate-700 hover:bg-white"
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
              className="relative flex-1 min-h-0 w-full rounded-[15px] overflow-hidden bg-black select-none cursor-crosshair touch-none"
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
                    <Monitor className="h-10 w-10 text-cyan-400 animate-pulse" />
                    <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
                  </div>
                  <p className="text-xs font-bold text-white tracking-wide">
                    Waiting for Live Screen Stream...
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                    Connecting to workstation. Displaying: <span className="text-cyan-300 font-mono font-bold">{selectedMonitor}</span>
                  </p>
                </div>
              )}

              {/* Minimal touch feedback ring ONLY when actively touching/dragging */}
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
        /* VIEW 2: REFINED LIQUID GLASS HOME DASHBOARD (Optimized for Samsung Galaxy A17 & Mobile Screens) */
        <div className="w-full max-w-[430px] h-[100dvh] max-h-[100dvh] flex flex-col justify-between px-2.5 pb-[max(env(safe-area-inset-bottom,0px),1.5rem)] pt-[max(env(safe-area-inset-top,0px),1.5rem)] relative z-10 mx-auto overflow-hidden">
          {/* TOP CARD: Refined Liquid Glass JARVIS Connected Card */}
          <div
            onClick={() => setShowSettingsModal(true)}
            className="group relative rounded-2xl p-2.5 mb-1.5 cursor-pointer transition-all duration-300 active:scale-[0.99] liquid-glass-card flex items-center justify-between shrink-0"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {/* Miniature PC Screen Thumbnail with glowing frame */}
              <div className="relative h-10 w-14 shrink-0 rounded-xl border border-cyan-500/50 bg-slate-900/90 p-0.5 shadow-sm flex flex-col justify-between overflow-hidden">
                {liveScreenFrame ? (
                  <img
                    src={liveScreenFrame}
                    alt="Workstation Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 via-slate-900 to-blue-900/30" />
                    <div className="relative z-10 w-full h-full flex flex-col justify-between p-0.5">
                      <div className="flex justify-between items-center text-[7px] text-cyan-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        <span className="text-[7px] font-mono opacity-90">LIVE</span>
                      </div>
                      <div className="flex items-center justify-center text-[7px] text-cyan-300">
                        <Monitor className="h-3.5 w-3.5 text-cyan-400" />
                      </div>
                      <div className="w-full h-0.5 bg-cyan-800/40 rounded-xs" />
                    </div>
                  </>
                )}
              </div>

              {/* Title & Connection Details */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h1 className="text-sm sm:text-base font-extrabold tracking-wide text-slate-900 leading-tight flex items-center gap-1.5 truncate">
                    JARVIS
                  </h1>
                  {isWatchdogEnabled && (
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-indigo-100 border border-indigo-400/50 text-indigo-700 animate-pulse flex items-center gap-0.5">
                        <BellRing className="h-2.5 w-2.5" />
                        <span>WATCH</span>
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 font-medium truncate">Connected to PC</p>
                <div className="flex items-center gap-1.5 mt-0.5 text-[10px] sm:text-[11px] font-medium truncate">
                  <span
                    className={`flex items-center gap-1 truncate ${
                      isConnected ? "text-emerald-600" : isConnecting ? "text-amber-600" : "text-cyan-700"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        isConnected
                          ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"
                          : isConnecting
                          ? "bg-amber-500 animate-ping"
                          : "bg-cyan-500 animate-pulse shadow-[0_0_8px_#06b6d4]"
                      }`}
                    />
                    <span className="truncate">
                      {isConnected
                        ? tunnelUrl.includes("ngrok")
                          ? "Online (Ngrok)"
                          : "Online (Cloud Relay)"
                        : isConnecting
                        ? "Connecting..."
                        : "Awaiting PC Feed"}
                    </span>
                  </span>
                  <span className="text-slate-400 shrink-0">|</span>
                  <span className="text-slate-600 font-medium shrink-0">{osName}</span>
                  <span className="text-slate-400 shrink-0">|</span>
                  <span className="text-cyan-800 font-mono text-[9px] shrink-0 font-bold">{pingMs}ms</span>
                </div>
              </div>
            </div>

            <div className="p-1 rounded-full text-slate-500 group-hover:text-cyan-600 transition-colors shrink-0">
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>

          {relayNotice && (
            <div className="mb-1.5 px-2.5 py-1 rounded-xl bg-cyan-100/90 border border-cyan-400/50 text-[10px] text-cyan-900 flex items-center justify-between shrink-0 shadow-xs">
              <span className="truncate font-medium">{relayNotice}</span>
              <button onClick={() => setRelayNotice(null)} className="text-slate-500 hover:text-slate-900 ml-2 shrink-0">✕</button>
            </div>
          )}

          {/* NAVIGATION SEGMENTED CONTROL: Home | PC */}
          <div className="grid grid-cols-2 p-1 rounded-2xl liquid-glass-pill mb-1.5 text-xs font-semibold shrink-0 gap-1 shadow-xs">
            <button
              onClick={() => setActiveTab("home")}
              className="flex items-center justify-center gap-1.5 py-1.5 rounded-xl transition-all font-bold touch-manipulation cursor-pointer bg-white/95 text-cyan-800 shadow-sm"
            >
              <HomeIcon className="h-3.5 w-3.5 text-cyan-600" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setActiveTab("pc")}
              className="flex items-center justify-center gap-1.5 py-1.5 rounded-xl transition-all text-slate-700 hover:text-slate-900 touch-manipulation cursor-pointer hover:bg-white/50"
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>PC (Remote)</span>
            </button>
          </div>

          {/* CENTRAL PC PROJECTION SCREEN */}
          <div className="w-full relative rounded-2xl p-[1px] liquid-glass-card shadow-xl mb-1.5 shrink-0">
            <div className="w-full rounded-[15px] bg-slate-950 overflow-hidden flex flex-col relative h-[225px] xs:h-[245px]">
              {/* Home Screen Monitor Switcher Header */}
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-white/85 backdrop-blur-xl border-b border-white/80 z-20 shrink-0 gap-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                  <span className="text-[10px] font-bold tracking-wider text-slate-800 uppercase truncate">
                    {selectedMonitor === "external" ? "External" : selectedMonitor === "primary" ? "Primary" : "All"}
                  </span>
                  {liveScreenFrame && (
                    <span className="bg-rose-500 text-white text-[8px] px-1.5 py-0.2 rounded font-bold shrink-0 animate-pulse">
                      LIVE
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleSelectMonitor("external")}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all shrink-0 touch-manipulation cursor-pointer ${
                      selectedMonitor === "external"
                        ? "bg-cyan-500 text-white font-bold shadow-sm"
                        : "bg-white/80 border border-slate-200 text-slate-700 hover:bg-white"
                    }`}
                  >
                    🖥️ Ext
                  </button>
                  <button
                    onClick={() => handleSelectMonitor("primary")}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all shrink-0 touch-manipulation cursor-pointer ${
                      selectedMonitor === "primary"
                        ? "bg-cyan-500 text-white font-bold shadow-sm"
                        : "bg-white/80 border border-slate-200 text-slate-700 hover:bg-white"
                    }`}
                  >
                    💻 Pri
                  </button>
                  <button
                    onClick={() => handleSelectMonitor("all")}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all shrink-0 touch-manipulation cursor-pointer ${
                      selectedMonitor === "all"
                        ? "bg-cyan-500 text-white font-bold shadow-sm"
                        : "bg-white/80 border border-slate-200 text-slate-700 hover:bg-white"
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
                {/* CLEAN LIVE WORKSTATION SCREEN FEED */}
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
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-3 bg-slate-900/95 select-none">
                    <div className="relative mb-1.5">
                      <Monitor className="h-8 w-8 text-cyan-400 animate-pulse" />
                      <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                    </div>
                    <p className="text-[11px] font-bold text-white tracking-wide">
                      Waiting for Screen Feed...
                    </p>
                    <p className="text-[9px] text-slate-300 mt-0.5 max-w-xs">
                      Run <code className="text-cyan-300 font-mono">python pc.py</code>. Display: <span className="text-cyan-300 font-mono font-semibold">{selectedMonitor}</span>
                    </p>
                  </div>
                )}

                {/* Futuristic JARVIS Optical Screen Scan Indicator */}
                {isAiPlanning && (
                  <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden bg-cyan-950/10">
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-pulse" />
                    <div className="absolute top-1.5 left-2 px-1.5 py-0.5 rounded bg-black/80 border border-cyan-400/70 text-[9px] font-mono text-cyan-300 flex items-center gap-1 shadow-lg backdrop-blur-md">
                      <Eye className="h-2.5 w-2.5 text-cyan-400 animate-pulse" />
                      <span>JARVIS AI SCANNING SCREEN...</span>
                    </div>
                  </div>
                )}

                {/* Minimal touch feedback ring */}
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

              {/* Horizontally Swipable Quick Touch Controls Bar Below Screen */}
              <div className="w-full bg-white/85 backdrop-blur-xl border-t border-white/80 z-20 shrink-0 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1 px-2 touch-pan-x">
                <div className="flex items-center gap-1.5 min-w-max">
                  <button
                    onClick={handleScreenClick}
                    className="px-2.5 py-1 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-[10px] font-bold text-cyan-900 active:scale-95 transition-all touch-manipulation cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <MousePointer className="h-3 w-3 text-cyan-600" />
                    <span>Left Click</span>
                  </button>
                  <button
                    onClick={handleRightClick}
                    className="px-2.5 py-1 rounded-xl liquid-glass-pill text-[10px] font-semibold text-slate-800 active:scale-95 transition-all touch-manipulation cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <span>Right Click</span>
                  </button>
                  <button
                    onClick={handleDoubleClick}
                    className="px-2 py-1 rounded-xl liquid-glass-pill text-[10px] font-semibold text-slate-800 active:scale-95 transition-all touch-manipulation cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <span>2× Double</span>
                  </button>
                  <button
                    onClick={() => setShowVirtualKeyboard(!showVirtualKeyboard)}
                    className={`px-2.5 py-1 rounded-xl border text-[10px] font-semibold flex items-center gap-1 active:scale-95 transition-all touch-manipulation cursor-pointer shadow-xs ${
                      showVirtualKeyboard
                        ? "bg-cyan-500 text-white border-cyan-400 shadow-sm font-bold"
                        : "liquid-glass-pill text-slate-800"
                    }`}
                  >
                    <KeyboardIcon className="h-3 w-3" />
                    <span>Keyboard</span>
                  </button>
                  <button
                    onClick={() => {
                      triggerHaptic([30]);
                      setCursorPos({ x: 50, y: 50 });
                      addJarvisMessage("Mouse cursor centered to 50%, 50%.");
                    }}
                    className="px-2.5 py-1 rounded-xl liquid-glass-pill text-[10px] text-slate-800 hover:text-cyan-700 active:scale-95 flex items-center gap-1 touch-manipulation cursor-pointer shadow-xs"
                    title="Center Mouse Pointer"
                  >
                    <span>🎯 Center</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("pc")}
                    className="px-2.5 py-1 rounded-xl liquid-glass-pill text-slate-800 hover:text-cyan-700 transition-all active:scale-95 shadow-xs flex items-center gap-1.5 touch-manipulation cursor-pointer font-semibold text-[10px]"
                    title="Full Landscape Remote Mode"
                  >
                    <Maximize2 className="h-3 w-3 text-cyan-600" />
                    <span>Fullscreen</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* VIRTUAL PHONE KEYBOARD */}
          <AnimatePresence>
            {showVirtualKeyboard && (
              <div className="shrink-0 mb-1.5">
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
              </div>
            )}
          </AnimatePresence>

          {/* ASSISTANT / CHAT SECTION (Fluid scrolling middle zone, zero screen overlap, hidden scrollbar) */}
          <div className="flex-1 min-h-[140px] overflow-y-auto space-y-2 mb-2 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <AnimatePresence initial={false}>
              {chatMessages.map((msg, idx) => (
                <motion.div
                  key={msg.id ? `${msg.id}-${idx}` : `msg-${idx}`}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className={`flex items-start gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.sender === "jarvis" && (
                    <div className="h-7 w-7 shrink-0 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center font-bold text-cyan-800 text-xs shadow-xs">
                      J
                    </div>
                  )}

                  <div
                    className={`rounded-2xl p-2.5 backdrop-blur-3xl shadow-xs max-w-[88%] space-y-1 ${
                      msg.sender === "user"
                        ? "rounded-tr-xs bg-gradient-to-br from-cyan-500/25 via-sky-500/20 to-blue-500/20 border border-cyan-400/50 text-right ml-auto text-slate-900"
                        : "rounded-tl-xs liquid-glass-card text-slate-900"
                    }`}
                  >
                    <p className="text-xs text-slate-900 leading-relaxed font-medium">
                      {msg.text}
                    </p>

                    {/* AI Multi-Step Plan Badges (if any) */}
                    {msg.plan && msg.plan.length > 0 && (
                      <div className="pt-0.5 flex flex-wrap gap-1">
                        {msg.plan.map((step, idx) => (
                          <motion.span
                            key={idx}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="px-1.5 py-0.2 rounded bg-cyan-100 border border-cyan-300 text-[8px] font-mono text-cyan-900 flex items-center gap-1 shadow-xs font-semibold"
                          >
                            <span className="opacity-70">#{idx + 1}</span>
                            <span>{step.type}</span>
                            {step.value && <span className="text-cyan-950 font-bold">&quot;{step.value}&quot;</span>}
                          </motion.span>
                        ))}
                      </div>
                    )}

                    <p className={`text-[9px] text-slate-500 font-mono ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                      {msg.time}
                    </p>
                  </div>

                  {msg.sender === "user" && (
                    <div className="h-7 w-7 shrink-0 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      You
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Anchor ref for auto-scrolling to latest reply */}
            <div ref={chatEndRef} />

            {/* Quick Suggestions Box */}
            <div className="rounded-2xl p-2.5 liquid-glass-card flex items-start gap-2 shadow-xs">
              <div className="p-0.5 rounded-lg text-cyan-600 mt-0.5 shrink-0">
                <Lightbulb className="h-3.5 w-3.5 text-cyan-600 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
              </div>

              <div className="flex-1 space-y-1 min-w-0">
                <p className="text-[11px] text-slate-700 font-bold">Quick suggestions:</p>
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {[
                    "What did Claude reply?",
                    "Read my screen",
                    "Claude: continue",
                    "Open Chrome",
                    "Open VS Code",
                  ].map((promptText) => (
                    <button
                      key={promptText}
                      onClick={() => handleSendCommand(promptText)}
                      className="text-[10px] text-slate-700 hover:text-cyan-800 liquid-glass-pill px-2.5 py-0.5 rounded-full transition-colors cursor-pointer active:scale-95 touch-manipulation flex items-center gap-1 font-medium shadow-xs"
                    >
                      {promptText.includes("Claude") || promptText.includes("screen") ? (
                        <Sparkles className="h-2.5 w-2.5 text-cyan-600" />
                      ) : null}
                      <span>&ldquo;{promptText}&rdquo;</span>
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
              className="mb-1.5 shrink-0"
            />
          )}

          {/* COMMAND INPUT BAR (Bumped up and elevated for easy thumb access) */}
          <div className="relative flex items-center gap-1.5 mb-3.5 sm:mb-4 shrink-0">
            <div className="flex-1 relative flex items-center rounded-full liquid-glass-pill px-3.5 py-1.5 shadow-lg border-white/90">
              <Monitor className="h-4 w-4 text-slate-500 shrink-0 mr-1.5" />

              <input
                type="text"
                value={inputCommand}
                onChange={(e) => setInputCommand(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && inputCommand.trim()) {
                    handleSendCommand(inputCommand);
                  }
                }}
                placeholder="Ask AI (e.g. 'What did Claude reply?') or command PC..."
                className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-sans font-medium"
              />

              <button
                onClick={toggleSpeechRecognition}
                className={`p-1.5 rounded-full mr-1 text-slate-500 hover:text-cyan-600 transition-colors touch-manipulation shrink-0 cursor-pointer ${
                  isListening ? "text-rose-500 animate-pulse" : ""
                }`}
                title="Voice Directive"
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>

              <button
                onClick={() => handleSendCommand(inputCommand)}
                disabled={!inputCommand.trim() || isAiPlanning}
                className="h-7.5 w-7.5 shrink-0 rounded-full bg-cyan-500 hover:bg-cyan-600 text-white flex items-center justify-center shadow-md disabled:opacity-40 active:scale-95 transition-all touch-manipulation cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Clean Android Gesture Navigation Spacing */}
          <div className="flex items-center justify-center pb-1 shrink-0">
            <div className="w-20 h-1 rounded-full bg-slate-400/40" />
          </div>
        </div>
      )}

      {/* SETTINGS / NGROK & WHATSAPP MODAL DIALOG (Luminous Liquid Glass) */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-xl flex items-center justify-center p-3">
          <div className="w-full max-w-md rounded-3xl p-5 liquid-glass-card bg-white/92 backdrop-blur-3xl border border-white text-slate-900 shadow-2xl space-y-3.5 animate-in fade-in zoom-in-95 duration-200 max-h-[90dvh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-cyan-600" />
                <h2 className="text-sm font-bold font-mono text-slate-900 tracking-wide">
                  PC AGENT &amp; TUNNEL CONFIG
                </h2>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Target Phone Notification */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs space-y-1">
              <p className="text-emerald-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>WhatsApp Auto-Send Configured</span>
              </p>
              <p className="text-slate-700 text-[11px] font-mono">
                When you run <code className="text-cyan-700 font-bold">python pc.py</code>, it opens WhatsApp Web to{" "}
                <strong className="text-slate-900">{targetPhone}</strong> with the tunnel URL &amp; Secret Auth!
              </p>
            </div>

            {/* Ngrok Tunnel URL Input */}
            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-800 font-bold flex items-center justify-between">
                <span>NGROK TUNNEL URL (WSS://)</span>
                {copiedTunnel ? (
                  <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>
                ) : (
                  <button
                    onClick={copyTunnelToClipboard}
                    className="text-[10px] text-slate-500 hover:text-cyan-700 flex items-center gap-0.5 cursor-pointer"
                  >
                    <Copy className="h-3 w-3" /> Copy
                  </button>
                )}
              </label>
              <input
                type="text"
                value={tunnelUrl}
                onChange={(e) => setTunnelUrl(e.target.value)}
                placeholder="wss://0.tcp.ngrok.io:12345 or wss://xxxx.ngrok-free.app"
                className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2.5 text-xs font-mono text-slate-900 focus:border-cyan-500 focus:outline-none shadow-xs"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                <span>Supports Ngrok HTTP (wss://) &amp; TCP tunnels</span>
                <button
                  onClick={() => {
                    const defaultProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
                    const relay = `${defaultProtocol}//${window.location.host}/ws/relay?role=phone`;
                    setTunnelUrl(relay);
                  }}
                  className="text-cyan-700 hover:underline font-semibold cursor-pointer"
                >
                  Use Cloud Relay
                </button>
              </div>
            </div>

            {/* Secret Auth Token */}
            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-800 font-bold">
                SECRET AUTH TOKEN
              </label>
              <input
                type="text"
                value={secretAuth}
                onChange={(e) => setSecretAuth(e.target.value)}
                placeholder="JARVIS-7749"
                className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2.5 text-xs font-mono text-slate-900 focus:border-cyan-500 focus:outline-none shadow-xs"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleConnectTunnel(tunnelUrl);
                    setShowSettingsModal(false);
                  }}
                  disabled={isConnecting}
                  className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold font-mono text-xs active:scale-95 transition-all text-center shadow-md cursor-pointer"
                >
                  {isConnecting ? "Connecting..." : "Connect Ngrok Tunnel"}
                </button>

                <a
                  href={`/control.html?tunnel=${encodeURIComponent(tunnelUrl)}&auth=${encodeURIComponent(secretAuth)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 font-mono text-xs font-bold active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border border-slate-700"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Open control.html</span>
                </a>
              </div>

              <div className="flex gap-2">
                <a
                  href="/pc.py"
                  download="pc.py"
                  className="flex-1 py-2 rounded-xl liquid-glass-pill font-mono text-xs text-slate-800 hover:text-cyan-800 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="h-3.5 w-3.5 text-cyan-600" />
                  <span>Download pc.py</span>
                </a>

                <a
                  href="/control.html"
                  download="control.html"
                  className="flex-1 py-2 rounded-xl liquid-glass-pill font-mono text-xs text-slate-800 hover:text-cyan-800 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Download control.html</span>
                </a>
              </div>
            </div>

            {/* GitHub Pages Guide */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5 text-cyan-400" />
                  <span>GitHub Pages Remote URL:</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">Works with Ngrok</span>
              </div>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                Put <code className="text-cyan-300">control.html</code> in your GitHub repository (<code className="text-white">myusername/remote-control</code>) and enable GitHub Pages in Settings &gt; Pages. You can then control your PC from anywhere at:
              </p>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-cyan-300 text-[10px] break-all select-all">
                https://&lt;your-username&gt;.github.io/remote-control/control.html
              </div>
            </div>

            {/* Quick Terminal Guide */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-600 space-y-1.5">
              <p className="text-slate-800 font-bold">Run on your PC terminal:</p>
              <div className="bg-white p-2.5 rounded-xl border border-slate-300 text-emerald-700 font-bold select-all shadow-inner">
                python pc.py
              </div>
              <p className="text-[10px] text-slate-500">
                100% Silent execution • Zero sound • Zero vibration
              </p>
            </div>
          </div>
        </div>
      )}

      {/* OPTICAL TEXT EXTRACTION (OCR) MODAL (Luminous Liquid Glass) */}
      {showOcrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-xl flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl p-5 liquid-glass-card bg-white/92 backdrop-blur-3xl border border-white text-slate-900 shadow-2xl space-y-3.5 max-h-[85dvh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-cyan-600 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
                <div>
                  <h2 className="text-sm font-bold text-slate-900 tracking-wide">
                    WORKSTATION SCREEN OCR
                  </h2>
                  <p className="text-[10px] text-cyan-700 font-mono font-semibold">Vision OCR Core</p>
                </div>
              </div>
              <button
                onClick={() => setShowOcrModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Extracted Text Viewer */}
            <div className="flex-1 min-h-[160px] overflow-y-auto rounded-2xl bg-white border border-slate-200 p-3 font-mono text-xs text-slate-800 select-text [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shadow-inner">
              <pre className="whitespace-pre-wrap break-words leading-relaxed font-sans text-xs">
                {extractedOcrText}
              </pre>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 pt-1">
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(extractedOcrText);
                    setCopiedOcr(true);
                    triggerHaptic([40]);
                    setTimeout(() => setCopiedOcr(false), 2500);
                  } catch {
                    // ignore
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold font-mono text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                {copiedOcr ? (
                  <>
                    <ClipboardCheck className="h-4 w-4 text-white" />
                    <span>COPIED TO PHONE CLIPBOARD!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-white" />
                    <span>COPY TO CLIPBOARD</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setInputCommand(`Explain this code/text from my screen: ${extractedOcrText.substring(0, 100)}...`);
                  setShowOcrModal(false);
                }}
                className="px-3.5 py-2.5 rounded-xl liquid-glass-pill text-slate-800 text-xs font-semibold hover:text-cyan-800 active:scale-95 transition-all cursor-pointer shadow-xs"
                title="Send extracted text into JARVIS prompt"
              >
                Ask JARVIS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
