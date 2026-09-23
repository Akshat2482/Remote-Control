import { JarvisIdea } from "../types";

export const JARVIS_IDEAS: JarvisIdea[] = [
  {
    id: "vision-hud",
    title: "Stark Tactical HUD & Real-Time Computer Vision",
    category: "Vision & HUD",
    badge: "Most Requested",
    description: "Transforms the smartphone camera into an augmented reality tactical visor. It scans real-world objects, detects faces, calculates bounding boxes with animated reticles, and displays real-time holographic data overlays.",
    keyCapabilities: [
      "Live CameraX stream rendered with Compose Canvas overlay",
      "On-device ML Kit Object & Text Recognition without internet",
      "Animated target lock-on reticles with coordinate telemetry",
      "Night-vision / thermal false-color shader filters"
    ],
    androidComponents: [
      "androidx.camera:camera-camera2",
      "com.google.mlkit:object-detection",
      "androidx.compose.ui.graphics.Canvas"
    ],
    kotlinSnippet: `// CameraX + ML Kit Object Detection Hook
val analyzer = ImageAnalysis.Analyzer { imageProxy ->
    val mediaImage = imageProxy.image
    if (mediaImage != null) {
        val image = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)
        objectDetector.process(image)
            .addOnSuccessListener { detectedObjects ->
                jarvisViewModel.updateDetectedTargets(detectedObjects)
            }
            .addOnCompleteListener { imageProxy.close() }
    }
}`,
    difficulty: "Advanced"
  },
  {
    id: "voice-hotword",
    title: "Zero-Latency Offline Wake-Word ('Hey JARVIS')",
    category: "Voice & Audio",
    badge: "Core AI",
    description: "Runs a lightweight on-device voice neural network that continuously listens in low-power standby mode for the phrase 'Hey JARVIS' or 'Protocol Override', instantly activating the assistant even when the screen is locked.",
    keyCapabilities: [
      "Ultra-low power on-device keyword spotting (Porcupine / Vosk / TFLite)",
      "Foreground service with persistent tactical notification",
      "Audio visualizer with real-time waveform frequency spectrum",
      "Custom synthesized British speech feedback response"
    ],
    androidComponents: [
      "android.media.AudioRecord",
      "android.app.NotificationChannel",
      "org.tensorflow:tensorflow-lite-audio"
    ],
    kotlinSnippet: `// Foreground Hotword Service with Porcupine
class JarvisHotwordService : Service() {
    private val porcupine = Porcupine.Builder()
        .setKeyword("jarvis")
        .build(applicationContext)

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForeground(JARVIS_NOTIFICATION_ID, buildTacticalNotification())
        startAudioSamplingLoop()
        return START_STICKY
    }
}`,
    difficulty: "Intermediate"
  },
  {
    id: "autonomous-agent",
    title: "Autonomous Device Copilot & App Automator",
    category: "Automation",
    badge: "High Utility",
    description: "Empowers JARVIS to take direct actions on the device using Android Accessibility Services: reading incoming messages, auto-clicking buttons, sending WhatsApp replies, or muting notifications when you say 'JARVIS, focus mode'.",
    keyCapabilities: [
      "Inspect foreground view hierarchy without touching screen",
      "Automate complex multi-step app navigation via voice macro",
      "Summarize incoming notifications and read urgent ones aloud",
      "Automated battery saver and background task killer"
    ],
    androidComponents: [
      "android.accessibilityservice.AccessibilityService",
      "android.service.notification.NotificationListenerService",
      "androidx.work:work-runtime-ktx"
    ],
    kotlinSnippet: `// Android Accessibility Command Dispatcher
class JarvisAccessibilityDispatcher : AccessibilityService() {
    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        val rootNode = rootInActiveWindow ?: return
        if (jarvisCommandQueue.hasPendingAction("CONFIRM_ACTION")) {
            val target = rootNode.findAccessibilityNodeInfosByText("Send").firstOrNull()
            target?.performAction(AccessibilityNodeInfo.ACTION_CLICK)
        }
    }
}`,
    difficulty: "Cutting-Edge"
  },
  {
    id: "sentinel-security",
    title: "Biometric Sentinel & Perimeter Alarm",
    category: "Security",
    badge: "Stark Protocol",
    description: "Arm your phone as a perimeter sentinel. When placed on a desk, accelerometer sensors detect any physical displacement; if moved without authorized fingerprint, it takes a silent front-facing photo and sounds an intruder klaxon.",
    keyCapabilities: [
      "Accelerometer micro-movement detection with low-pass filter",
      "Silent stealth front camera snapshot saved to encrypted vault",
      "BiometricPrompt (Fingerprint / Face Unlock) authorization",
      "Emergency SMS / Telegram webhook trigger with GPS coordinates"
    ],
    androidComponents: [
      "android.hardware.SensorManager",
      "androidx.biometric:biometric",
      "androidx.camera:camera-core"
    ],
    kotlinSnippet: `// Micro-movement Sentinel Tripwire
sensorManager.registerListener(object : SensorEventListener {
    override fun onSensorChanged(event: SensorEvent) {
        val delta = sqrt(event.values[0].pow(2) + event.values[1].pow(2) + event.values[2].pow(2))
        if (delta > THRESHOLD && isSentinelArmed) {
            triggerIntruderAlert()
        }
    }
    override fun onAccuracyChanged(s: Sensor?, a: Int) {}
}, accelerometer, SensorManager.SENSOR_DELAY_UI)`,
    difficulty: "Intermediate"
  },
  {
    id: "iot-matter",
    title: "Stark Smart-Home Matter & BLE Command Hub",
    category: "IoT & Hardware",
    badge: "Home Automation",
    description: "Turns your JARVIS app into a universal commander for your living room or lab. Supports Matter, Zigbee bridges, Philips Hue, Home Assistant webhooks, and PC Wake-On-LAN to boot your desktop when you enter the room.",
    keyCapabilities: [
      "Wake-on-LAN magic packet broadcaster to power on gaming PC",
      "Local HTTP / MQTT webhook dispatch to Home Assistant or ESP32",
      "Bluetooth LE proximity trigger: boots workstation as phone approaches",
      "Voice command macro: 'JARVIS, initiate workshop lighting'"
    ],
    androidComponents: [
      "android.bluetooth.le.BluetoothLeScanner",
      "java.net.DatagramSocket (Wake-On-LAN)",
      "com.squareup.okhttp3:okhttp"
    ],
    kotlinSnippet: `// Wake-On-LAN Magic Packet Broadcaster
suspend fun sendWakeOnLan(macAddress: String) = withContext(Dispatchers.IO) {
    val macBytes = getMacBytes(macAddress)
    val bytes = ByteArray(6 + 16 * macBytes.size)
    for (i in 0..5) bytes[i] = 0xff.toByte()
    for (i in 6 until bytes.size) bytes[i] = macBytes[i % macBytes.size]
    val address = InetAddress.getByName("255.255.255.255")
    val packet = DatagramPacket(bytes, bytes.size, address, 9)
    DatagramSocket().send(packet)
}`,
    difficulty: "Advanced"
  },
  {
    id: "edge-llm",
    title: "Local On-Device Gemini Nano / Gemma LLM",
    category: "Edge AI",
    badge: "100% Offline",
    description: "Equips JARVIS with an on-device Large Language Model (MediaPipe GenAI / Gemma 2B) so complex reasoning, code generation, and personality banter operate without relying on an internet connection or external servers.",
    keyCapabilities: [
      "MediaPipe LLM Inference API running Gemma 2B or Gemini Nano",
      "Sub-second local token generation using Android GPU / NPU acceleration",
      "Zero data leakage: conversation history stays 100% on the device",
      "Seamless cloud fallback to Gemini 3.1 Flash-Lite (cheapest model) when online"
    ],
    androidComponents: [
      "com.google.mediapipe:tasks-genai",
      "android.content.Context",
      "org.jetbrains.kotlinx:kotlinx-coroutines-core"
    ],
    kotlinSnippet: `// MediaPipe On-Device LLM Inference
val options = LlmInferenceOptions.builder()
    .setModelPath("/data/local/tmp/gemma-2b-it-gpu.bin")
    .setMaxTokens(512)
    .build()
val llmInference = LlmInference.createFromOptions(context, options)
val response = llmInference.generateResponse("Sir, instructions for Mark 85?")`,
    difficulty: "Cutting-Edge"
  }
];
