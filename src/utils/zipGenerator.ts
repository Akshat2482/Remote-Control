import JSZip from "jszip";
import confetti from "canvas-confetti";
import { JARVIS_PROJECT_FILES } from "../data/jarvisProjectFiles";
import { AndroidProjectFile } from "../types";

export interface ZipGenerationProgress {
  status: "idle" | "zipping" | "ready" | "error";
  percent: number;
  currentFile: string;
}

export async function generateAndDownloadJarvisZip(
  customFiles?: AndroidProjectFile[],
  onProgress?: (progress: ZipGenerationProgress) => void
): Promise<void> {
  try {
    const filesToPack = customFiles || JARVIS_PROJECT_FILES;
    const zip = new JSZip();

    onProgress?.({
      status: "zipping",
      percent: 10,
      currentFile: "Initializing archive structure...",
    });

    const total = filesToPack.length;
    let count = 0;

    for (const file of filesToPack) {
      count++;
      onProgress?.({
        status: "zipping",
        percent: Math.round((count / total) * 75) + 10,
        currentFile: file.path,
      });

      // Handle file path with folder hierarchy
      zip.file(file.path, file.content);
    }

    onProgress?.({
      status: "zipping",
      percent: 90,
      currentFile: "Compressing JARVIS Android package...",
    });

    const blob = await zip.generateAsync(
      {
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 9 },
      },
      (metadata) => {
        onProgress?.({
          status: "zipping",
          percent: 90 + Math.round(metadata.percent * 0.1),
          currentFile: "Finalizing binary stream...",
        });
      }
    );

    // Trigger instant browser download
    const downloadUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    downloadLink.download = "JARVIS_Android_App.zip";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(downloadUrl);

    onProgress?.({
      status: "ready",
      percent: 100,
      currentFile: "Download started!",
    });

    // Celebratory confetti burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#00E5FF", "#38BDF8", "#0077B6", "#FFB703"],
    });
  } catch (error) {
    console.error("Failed to generate JARVIS ZIP:", error);
    onProgress?.({
      status: "error",
      percent: 0,
      currentFile: "Error generating ZIP archive",
    });
    throw error;
  }
}
