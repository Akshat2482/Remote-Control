// Android & Web Haptic Vibration Feedback Integration
export type HapticType = "tap" | "success" | "commandRegistered" | "micPress" | "heavy" | "error";

export function triggerHaptic(type: HapticType = "tap"): boolean {
  if (typeof window === "undefined" || !("vibrate" in navigator)) {
    return false;
  }

  try {
    switch (type) {
      case "tap":
        // Light tactile click (15ms)
        return navigator.vibrate(15);

      case "micPress":
        // Crisp microphone activation pulse (25ms)
        return navigator.vibrate(25);

      case "commandRegistered":
        // Double confirmation pulse when command is executed/registered ([20ms pulse, 30ms pause, 25ms pulse])
        return navigator.vibrate([20, 30, 25]);

      case "success":
        // Affirmative completion vibration
        return navigator.vibrate([25, 40, 20]);

      case "heavy":
        return navigator.vibrate(40);

      case "error":
        return navigator.vibrate([30, 50, 30, 50, 30]);

      default:
        return navigator.vibrate(15);
    }
  } catch {
    return false;
  }
}
