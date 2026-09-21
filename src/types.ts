export interface AndroidProjectFile {
  path: string;
  name: string;
  category: "workflow" | "gradle" | "kotlin" | "manifest" | "resource" | "docs" | "desktop";
  description: string;
  content: string;
  language: "kotlin" | "groovy" | "yaml" | "xml" | "properties" | "markdown" | "bash" | "python";
}

export interface RemoteCommand {
  action: "mouse_move" | "click" | "double_click" | "right_click" | "type_text" | "open_email" | "click_compose" | "open_browser" | "voice_macro";
  payload?: any;
  description: string;
}

export interface SimulatedPcState {
  cursorX: number; // 0-100 percentage
  cursorY: number; // 0-100 percentage
  activeWindow: "desktop" | "email" | "compose" | "browser";
  isEmailAppOpen: boolean;
  isComposeModalOpen: boolean;
  emailSubject: string;
  emailBody: string;
  isClicking: boolean;
  statusText: string;
  lastCommand: string;
}

export interface JarvisIdea {
  id: string;
  title: string;
  category: "Vision & HUD" | "Voice & Audio" | "Automation" | "Security" | "IoT & Hardware" | "Edge AI";
  badge: string;
  description: string;
  keyCapabilities: string[];
  androidComponents: string[];
  kotlinSnippet: string;
  difficulty: "Intermediate" | "Advanced" | "Cutting-Edge";
}

export interface SystemTelemetry {
  reactorPower: number; // percentage
  coreTemp: number; // Celsius
  neuralLatency: number; // ms
  securityLevel: "Nominal" | "Elevated" | "Lockdown";
  speechState: "Idle" | "Listening" | "Processing" | "Speaking";
  activeProtocol: string;
}

export interface JarvisChatMessage {
  id: string;
  sender: "user" | "jarvis";
  text: string;
  timestamp: string;
  actionTriggered?: string;
}
