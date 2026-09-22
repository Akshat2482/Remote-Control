import http from "http";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { WebSocketServer, WebSocket } from "ws";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Global Relay Hub for Cloud WebSocket Bridging (Earth-Wide Connection)
let pcClientSocket: WebSocket | null = null;
const phoneClientSockets: Set<WebSocket> = new Set();
let pcTelemetry = {
  online: false,
  lastPing: 0,
  screenWidth: 1920,
  screenHeight: 1080,
};

// Lazy-initialized Gemini client
let genAI: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!genAI) {
    genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAI;
}

// Health check & PC status endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    pcConnected: !!pcClientSocket && pcClientSocket.readyState === WebSocket.OPEN,
    pcTelemetry,
    timestamp: new Date().toISOString(),
  });
});

// JARVIS AI query endpoint
app.post("/api/jarvis/chat", async (req, res) => {
  const { prompt, systemState } = req.body;
  const userPrompt = prompt || "Report status";

  const ai = getGeminiClient();
  if (!ai) {
    const fallbackResponses: Record<string, string> = {
      default:
        "All systems operational, sir. Holographic HUD, sensor diagnostics, and GitHub build pipelines are synchronized and standing by for your directive.",
      status:
        "Arc Reactor power at 98.4%. Neural engine online. Cloud Relay Hub active. All peripheral protocols are functioning within nominal parameters.",
    };

    const lower = userPrompt.toLowerCase();
    let reply = fallbackResponses.default;
    if (lower.includes("status") || lower.includes("diagnostic") || lower.includes("health")) {
      reply = fallbackResponses.status;
    }

    return res.json({
      text: reply,
      source: "local-jarvis-core",
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: userPrompt,
      config: {
        systemInstruction: `You are J.A.R.V.I.S. (Just A Rather Very Intelligent System). Crisp, concise, polite, loyal.
Current simulated telemetry: ${JSON.stringify(systemState || {})}`,
        temperature: 0.7,
      },
    });

    return res.json({
      text: response.text || "Subsystems ready, sir.",
      source: "gemini-neural-core",
    });
  } catch (error: any) {
    console.error("Gemini query error:", error);
    return res.json({
      text: "Subsystems operating in local redundancy mode, sir.",
      source: "local-redundancy",
      error: error.message,
    });
  }
});

// AI Neural Directive Planner (converts natural language like "open claude and type continue and hit enter" into atomic PC actions)
app.post("/api/jarvis/plan", async (req, res) => {
  const { command } = req.body;
  const userCmd = (command || "").trim();

  if (!userCmd) {
    return res.status(400).json({ error: "Command required" });
  }

  const ai = getGeminiClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `You are the J.A.R.V.I.S. neural workstation AI planner. Translate the user's natural language command into executable computer actions.
User command: "${userCmd}".
Return valid JSON only with this schema:
{
  "summary": "Short, sophisticated, loyal J.A.R.V.I.S. speech response",
  "actions": [
    { "type": "open_url" | "type" | "key" | "wait" | "click" | "app", "value": string, "delayMs"?: number }
  ]
}`,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      if (parsed && parsed.actions && parsed.actions.length > 0) {
        return res.json(parsed);
      }
    } catch (err: any) {
      console.warn("Gemini plan fallback triggered:", err?.message);
    }
  }

  // Intelligent fallback parser for offline/quota resilience
  const lower = userCmd.toLowerCase();
  const actions: Array<{ type: string; value: string; delayMs?: number }> = [];
  let summary = `Executing directive: "${userCmd}", sir.`;

  if (lower.includes("claude")) {
    actions.push({ type: "open_url", value: "https://claude.ai" });
    actions.push({ type: "wait", value: "", delayMs: 2500 });
    let textToType = "continue";
    if (lower.includes("conyonu")) {
      textToType = "continue";
    } else {
      const match = userCmd.match(/type\s+([a-zA-Z0-9_\-\s]+?)(?:\s+and\s+hit|\s+and\s+enter|$)/i);
      if (match) textToType = match[1].trim();
    }
    actions.push({ type: "type", value: textToType });
    if (lower.includes("enter") || lower.includes("hit enter")) {
      actions.push({ type: "key", value: "enter" });
    }
    summary = `Opening Claude, entering '${textToType}', and submitting, sir.`;
  } else if (lower.includes("youtube")) {
    if (lower.includes("search")) {
      const q = lower.split("search")[1]?.trim() || "lofi beats";
      actions.push({ type: "open_url", value: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}` });
      summary = `Searching YouTube for '${q}', sir.`;
    } else {
      actions.push({ type: "open_url", value: "https://www.youtube.com" });
      summary = "Opening YouTube on your PC, sir.";
    }
  } else if (lower.includes("email") || lower.includes("outlook") || lower.includes("compose")) {
    actions.push({ type: "open_url", value: "https://mail.google.com/mail/u/0/#inbox?compose=new" });
    summary = "Opening mail client and initializing compose, sir.";
  } else if (lower.includes("chrome") || lower.includes("browser") || lower.includes("google")) {
    actions.push({ type: "open_url", value: "https://www.google.com" });
    summary = "Launching Google Chrome on your workstation, sir.";
  } else if (lower.includes("code") || lower.includes("vs code") || lower.includes("vscode")) {
    actions.push({ type: "app", value: "code" });
    summary = "Opening Visual Studio Code, sir.";
  } else {
    actions.push({ type: "type", value: userCmd });
    summary = `Directive "${userCmd}" dispatched to workstation, sir.`;
  }

  return res.json({ summary, actions });
});

// Start Server with Vite Middleware & WebSocket Relay
async function startServer() {
  const server = http.createServer(app);

  // Attach WebSocket Relay Server on path /ws/relay
  const wss = new WebSocketServer({ server, path: "/ws/relay" });

  wss.on("connection", (ws, req) => {
    const urlParams = new URL(req.url || "", `http://${req.headers.host}`).searchParams;
    const role = urlParams.get("role") || "phone"; // 'pc' or 'phone'

    ws.on("error", (err) => {
      console.warn(`WebSocket error (${role}):`, err.message);
    });

    if (role === "pc") {
      console.log("⚡ PC Workstation connected to Cloud Relay Hub!");
      pcClientSocket = ws;
      pcTelemetry.online = true;
      pcTelemetry.lastPing = Date.now();

      // Notify all connected phone clients that PC is now ONLINE
      const statusMsg = JSON.stringify({
        type: "pc_status",
        status: "online",
        screenWidth: pcTelemetry.screenWidth,
        screenHeight: pcTelemetry.screenHeight,
      });
      phoneClientSockets.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) client.send(statusMsg);
      });

      ws.on("message", (msg) => {
        try {
          const str = msg.toString();
          const parsed = JSON.parse(str);
          if (parsed.type === "handshake") {
            pcTelemetry.screenWidth = parsed.screenWidth || 1920;
            pcTelemetry.screenHeight = parsed.screenHeight || 1080;
          }
          // Forward responses from PC to all active phone clients
          phoneClientSockets.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) client.send(str);
          });
        } catch {
          phoneClientSockets.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) client.send(msg.toString());
          });
        }
      });

      ws.on("close", () => {
        console.log("PC Workstation disconnected from Cloud Relay.");
        if (pcClientSocket === ws) pcClientSocket = null;
        pcTelemetry.online = false;
        const offlineMsg = JSON.stringify({ type: "pc_status", status: "offline" });
        phoneClientSockets.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) client.send(offlineMsg);
        });
      });
    } else {
      // Role: phone (Samsung Galaxy A17)
      console.log("📱 Phone client connected to Cloud Relay Hub");
      phoneClientSockets.add(ws);

      // Send initial PC status to phone immediately
      ws.send(
        JSON.stringify({
          type: "pc_status",
          status: pcTelemetry.online ? "online" : "offline",
          screenWidth: pcTelemetry.screenWidth,
          screenHeight: pcTelemetry.screenHeight,
        })
      );

      ws.on("message", (msg) => {
        // Forward commands from Phone directly to PC
        if (pcClientSocket && pcClientSocket.readyState === WebSocket.OPEN) {
          pcClientSocket.send(msg.toString());
        }
      });

      ws.on("close", () => {
        phoneClientSockets.delete(ws);
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`JARVIS Global Cloud Hub running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
