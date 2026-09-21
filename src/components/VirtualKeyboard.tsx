import React from "react";
import { motion } from "motion/react";
import { Keyboard as KeyboardIcon, X, CornerDownLeft } from "lucide-react";

interface VirtualKeyboardProps {
  isOpen: boolean;
  onClose: () => void;
  activeFocusTarget?: string | null;
  buffer: string;
  onBufferChange: (val: string) => void;
  onSendBuffer: () => void;
  onSendKey: (key: string) => void;
  isLandscape?: boolean;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  isOpen,
  onClose,
  activeFocusTarget,
  buffer,
  onBufferChange,
  onSendBuffer,
  onSendKey,
  isLandscape = false,
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className={`relative z-40 rounded-3xl p-3.5 bg-gradient-to-b from-white/[0.1] via-white/[0.04] to-white/[0.06] border border-white/20 backdrop-blur-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_16px_48px_rgba(0,0,0,0.85)] space-y-2.5 ${
        isLandscape
          ? "w-full max-w-3xl mx-auto mt-2 mb-2"
          : "mb-3"
      }`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between text-xs text-cyan-300 font-mono">
        <span className="font-bold flex items-center gap-1.5">
          <KeyboardIcon className="h-3.5 w-3.5 text-cyan-400 drop-shadow-[0_0_6px_#22d3ee]" />
          <span className="tracking-wide">
            PC KEYBOARD {activeFocusTarget ? `(${activeFocusTarget})` : "(WORKSTATION)"}
          </span>
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
          title="Close Virtual Keyboard"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Real-time Typing Input Bar */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={buffer}
          onChange={(e) => onBufferChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSendBuffer();
              onSendKey("enter");
            }
          }}
          placeholder="Type here to stream directly to PC..."
          className="flex-1 bg-black/60 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 border border-cyan-500/30 focus:border-cyan-400 focus:outline-none font-mono shadow-inner transition-colors"
          autoFocus
        />
        <button
          onClick={onSendBuffer}
          disabled={!buffer.trim()}
          className="px-3.5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 active:scale-95 transition-all flex items-center gap-1 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
        >
          <span>Send</span>
          <CornerDownLeft className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Special Keys Rows */}
      <div className="grid grid-cols-6 gap-1 text-[11px] font-mono">
        {["Esc", "Tab", "Win", "Ctrl", "Alt", "Enter"].map((k) => (
          <button
            key={k}
            onClick={() => onSendKey(k)}
            className="py-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-slate-200 hover:border-cyan-400/80 hover:text-cyan-300 hover:bg-white/10 active:scale-95 transition-all text-center font-medium shadow-sm"
          >
            {k}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 text-[11px] font-mono">
        {["Backspace", "Space", "F5", "Delete", "Ctrl+C", "Ctrl+V", "Ctrl+Z", "F11"].map((k) => (
          <button
            key={k}
            onClick={() => onSendKey(k)}
            className="py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-slate-300 hover:border-cyan-400/80 hover:text-cyan-300 hover:bg-white/10 active:scale-95 transition-all text-center text-[10px] sm:text-[11px]"
          >
            {k}
          </button>
        ))}
      </div>

      {/* Arrow navigation keys row */}
      <div className="flex items-center justify-between pt-0.5">
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Keystrokes streamed instantly to PC</span>
        </div>
        <div className="flex items-center gap-1">
          {["←", "↑", "↓", "→"].map((arrow) => (
            <button
              key={arrow}
              onClick={() => onSendKey(arrow)}
              className="h-6 w-8 rounded-lg bg-white/[0.05] border border-white/10 text-slate-300 hover:border-cyan-400/80 hover:text-cyan-300 hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center text-xs"
            >
              {arrow}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
