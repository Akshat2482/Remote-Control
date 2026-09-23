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
      className={`relative z-40 rounded-3xl p-3.5 liquid-glass-card shadow-2xl space-y-2.5 ${
        isLandscape
          ? "w-full max-w-3xl mx-auto mt-2 mb-2"
          : "mb-3"
      }`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between text-xs text-slate-800 font-mono">
        <span className="font-bold flex items-center gap-1.5 truncate">
          <KeyboardIcon className="h-3.5 w-3.5 text-cyan-600 drop-shadow-[0_0_6px_rgba(6,182,212,0.6)] shrink-0" />
          <span className="tracking-wide truncate">
            KEYBOARD {activeFocusTarget ? `(${activeFocusTarget})` : ""}
          </span>
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-slate-500 hover:text-slate-800 hover:bg-white/40 active:scale-95 transition-all touch-manipulation shrink-0 cursor-pointer"
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
          placeholder="Type to send to PC..."
          className="flex-1 bg-white/90 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 border border-slate-300 focus:border-cyan-500 focus:outline-none font-mono shadow-inner transition-colors"
          autoFocus
        />
        <button
          onClick={onSendBuffer}
          disabled={!buffer.trim()}
          className="px-3 py-1.5 rounded-xl bg-cyan-500 text-white font-bold text-xs hover:bg-cyan-600 disabled:opacity-40 disabled:hover:bg-cyan-500 active:scale-95 transition-all flex items-center gap-1 shadow-md touch-manipulation shrink-0 cursor-pointer"
        >
          <span>Send</span>
          <CornerDownLeft className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Special Keys Rows */}
      <div className="grid grid-cols-6 gap-1 text-[10px] sm:text-[11px] font-mono">
        {["Esc", "Tab", "Win", "Ctrl", "Alt", "Enter"].map((k) => (
          <button
            key={k}
            onClick={() => onSendKey(k)}
            className="py-1.5 rounded-lg liquid-glass-pill text-slate-800 hover:text-cyan-700 active:scale-95 transition-all text-center font-semibold shadow-xs touch-manipulation truncate cursor-pointer"
          >
            {k}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 text-[10px] font-mono">
        {[
          { label: "⌫ Bksp", val: "Backspace" },
          { label: "Space", val: "Space" },
          { label: "F5", val: "F5" },
          { label: "Del", val: "Delete" },
          { label: "Ctrl+C", val: "Ctrl+C" },
          { label: "Ctrl+V", val: "Ctrl+V" },
          { label: "Ctrl+Z", val: "Ctrl+Z" },
          { label: "F11", val: "F11" },
        ].map(({ label, val }) => (
          <button
            key={val}
            onClick={() => onSendKey(val)}
            className="py-1.5 rounded-lg liquid-glass-pill text-slate-700 hover:text-cyan-700 active:scale-95 transition-all text-center font-medium shadow-xs touch-manipulation truncate cursor-pointer"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Arrow navigation keys row */}
      <div className="flex items-center justify-between pt-0.5">
        <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-slate-600 truncate font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="truncate">Streams instantly to PC</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {["←", "↑", "↓", "→"].map((arrow) => (
            <button
              key={arrow}
              onClick={() => onSendKey(arrow)}
              className="h-6 w-7 sm:w-8 rounded-lg liquid-glass-pill text-slate-800 hover:text-cyan-700 active:scale-95 transition-all flex items-center justify-center text-xs touch-manipulation font-bold shadow-xs cursor-pointer"
            >
              {arrow}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
