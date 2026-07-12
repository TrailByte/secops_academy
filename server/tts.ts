import { spawn } from "child_process";
import { readFileSync, unlinkSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import crypto from "crypto";

// Voice models directory — override with PIPER_VOICES_DIR env var
const VOICES_DIR = process.env.PIPER_VOICES_DIR
  || join(process.env.HOME || "/root", "piper-voices");

interface PiperProfile {
  model: string;
  lengthScale: string;
  noiseScale: string;
  noiseW: string;
}

// Per-mascot voice settings
const TTS_PROFILES: Record<string, PiperProfile> = {
  "malware-analysis": {
    model:       join(VOICES_DIR, "en_US-ryan-medium.onnx"),
    lengthScale: "1.3",   // slower/heavier
    noiseScale:  "0.9",   // slightly rougher
    noiseW:      "0.6",
  },
  "android-security": {
    model:       join(VOICES_DIR, "en_US-hfc_male-medium.onnx"),
    lengthScale: "1.05",   // slightly faster
    noiseScale:  "0.5",   // cleaner/smoother
    noiseW:      "0.8",
  },
};

const DEFAULT_PROFILE = TTS_PROFILES["android-security"];

export async function synthesizeSpeech(
  text: string,
  learningPathSlug?: string | null
): Promise<Buffer> {
  const profile =
    (learningPathSlug ? TTS_PROFILES[learningPathSlug] : null) ?? DEFAULT_PROFILE;

  if (!existsSync(profile.model)) {
    throw new Error(
      `Piper model not found: ${profile.model}. ` +
      `Make sure the voice files are in PIPER_VOICES_DIR (${VOICES_DIR}).`
    );
  }

  const outFile = join(
    tmpdir(),
    `tts_${crypto.randomBytes(8).toString("hex")}.wav`
  );

  return new Promise((resolve, reject) => {
    const proc = spawn("python3", [
      "-m", "piper",
      "--model",        profile.model,
      "--length_scale", profile.lengthScale,
      "--noise_scale",  profile.noiseScale,
      "--noise_w",      profile.noiseW,
      "--output_file",  outFile,
    ]);

    let stderr = "";
    proc.stderr.on("data", (d) => { stderr += d.toString(); });

    proc.stdin.on("error", () => {}); // ignore EPIPE
    proc.stdin.write(text);
    proc.stdin.end();

    proc.on("close", (code) => {
      if (code !== 0 || !existsSync(outFile)) {
        return reject(
          new Error(`Piper exited with code ${code}. stderr: ${stderr}`)
        );
      }
      const audio = readFileSync(outFile);
      try { unlinkSync(outFile); } catch {}
      resolve(audio);
    });

    proc.on("error", (err) => {
      reject(new Error(`Failed to spawn piper: ${err.message}`));
    });
  });
}
