import { useState, useRef, useCallback, useEffect } from "react";
import { Play, Pause, Square } from "lucide-react";
import { stripMarkdownForSpeech } from "@/lib/textToSpeech";

const MASCOTS: Record<string, { idle: string; speaking: string; paused: string; done: string }> = {
  "malware-analysis": {
    idle:     "/images/mascots/quarantine_blob_neutral.png",
    speaking: "/images/mascots/quarantine_blob_glitchy.png",
    paused:   "/images/mascots/quarantine_blob_smug.png",
    done:     "/images/mascots/quarantine_blob_corrupted_laugh.png",
  },
  "android-security": {
    idle:     "/images/mascots/droidghost_neutral.png",
    speaking: "/images/mascots/droidghost_focused.png",
    paused:   "/images/mascots/droidghost_thinking.png",
    done:     "/images/mascots/droidghost_happy.png",
  },
};

const DEFAULT_MASCOT = MASCOTS["malware-analysis"];

type State = "idle" | "speaking" | "paused" | "done" | "unsupported";

interface MascotNarratorProps {
  content: string;
  learningPathSlug?: string | null;
  accent: string;
  accentDim: string;
  border: string;
}

function getVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const immediate = window.speechSynthesis.getVoices();
    if (immediate.length > 0) { resolve(immediate); return; }
    const onChanged = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) {
        window.speechSynthesis.removeEventListener("voiceschanged", onChanged);
        resolve(v);
      }
    };
    window.speechSynthesis.addEventListener("voiceschanged", onChanged);
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 2000);
  });
}

export default function MascotNarrator({
  content,
  learningPathSlug,
  accent,
  accentDim,
  border,
}: MascotNarratorProps) {
  const mascot = (learningPathSlug && MASCOTS[learningPathSlug]) ?? DEFAULT_MASCOT;
  const [state, setState] = useState<State>(
    typeof window !== "undefined" && "speechSynthesis" in window ? "idle" : "unsupported"
  );
  const uttRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    uttRef.current = null;
    setState("idle");
  }, []);

  // Cleanup on unmount or content change
  useEffect(() => () => { window.speechSynthesis.cancel(); }, []);
  useEffect(() => { window.speechSynthesis.cancel(); setState("idle"); }, [content]);

  const handlePlay = useCallback(async () => {
    if (state === "paused" && uttRef.current) {
      window.speechSynthesis.resume();
      setState("speaking");
      return;
    }

    // Fresh start
    window.speechSynthesis.cancel();
    await new Promise((r) => setTimeout(r, 150)); // Firefox needs a moment after cancel

    const voices = await getVoices();

    const plain = stripMarkdownForSpeech(content);
    if (!plain) return;

    const utt = new SpeechSynthesisUtterance(plain);
    utt.rate   = 0.92;
    utt.pitch  = 1;
    utt.volume = 1;

    // Pick the best English voice available
    const preferred =
      voices.find((v) => v.lang === "en-US" && !v.localService === false) ??
      voices.find((v) => v.lang === "en-US") ??
      voices.find((v) => v.lang.startsWith("en")) ??
      voices[0];
    if (preferred) utt.voice = preferred;

    utt.onstart  = () => setState("speaking");
    utt.onpause  = () => setState("paused");
    utt.onresume = () => setState("speaking");
    utt.onend    = () => { uttRef.current = null; setState("done"); };
    utt.onerror  = (e) => {
      if (e.error === "interrupted" || e.error === "canceled") return;
      uttRef.current = null;
      setState("idle");
    };

    uttRef.current = utt;
    setState("speaking"); // optimistic — onstart will confirm
    window.speechSynthesis.speak(utt);
  }, [state, content]);

  const handlePause = useCallback(() => {
    window.speechSynthesis.pause();
    setState("paused");
  }, []);

  if (state === "unsupported") return null;

  const mascotSrc =
    state === "speaking" ? mascot.speaking :
    state === "paused"   ? mascot.paused   :
    state === "done"     ? mascot.done     :
    mascot.idle;

  const label =
    state === "speaking" ? "Narrating…"        :
    state === "paused"   ? "Paused"             :
    state === "done"     ? "Done — play again?" :
    "Listen to this module";

  return (
    <div
      className="flex items-center gap-4 rounded-xl px-4 py-3 mb-8"
      style={{ background: accentDim, border: `1px solid ${border}` }}
    >
      <div className="relative flex-shrink-0">
        <img
          src={mascotSrc}
          alt="Narrator mascot"
          className="w-14 h-14 object-contain select-none"
          style={state === "speaking"
            ? { animation: "mascot-bob 0.6s ease-in-out infinite alternate" }
            : undefined}
        />
        {state === "speaking" && (
          <span
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-ping"
            style={{ background: accent, opacity: 0.75 }}
          />
        )}
      </div>

      <span className="text-xs font-mono flex-1 truncate" style={{ color: accent }}>
        {label}
      </span>

      <div className="flex items-center gap-2 flex-shrink-0">
        {state !== "speaking" ? (
          <button
            onClick={handlePlay}
            title={state === "paused" ? "Resume" : "Play"}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-80"
            style={{ background: accent }}
          >
            <Play className="w-4 h-4" style={{ color: "#0b0d16" }} />
          </button>
        ) : (
          <button
            onClick={handlePause}
            title="Pause"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-80"
            style={{ background: accent }}
          >
            <Pause className="w-4 h-4" style={{ color: "#0b0d16" }} />
          </button>
        )}

        {(state === "speaking" || state === "paused") && (
          <button
            onClick={stop}
            title="Stop"
            className="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors hover:border-foreground/40"
            style={{ borderColor: border }}
          >
            <Square className="w-3.5 h-3.5" style={{ color: accent }} />
          </button>
        )}
      </div>

      <style>{`
        @keyframes mascot-bob {
          from { transform: translateY(0px); }
          to   { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
