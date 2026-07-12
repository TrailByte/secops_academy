import { useState, useRef, useCallback, useEffect } from "react";
import { Play, Pause, Square, Loader2, Volume2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { stripMarkdownForSpeech } from "@/lib/textToSpeech";

// All 8 expressions per mascot, in a storytelling sequence
const NARRATING_SEQUENCES: Record<string, string[]> = {
  "android-security": [
    "focused", "curious", "thinking", "happy",
    "surprised", "neutral", "warning", "curious",
  ],
  "malware-analysis": [
    "glitchy", "smug", "surprised", "warning",
    "angry", "neutral", "corrupted_laugh", "smug",
  ],
};

// Static expression for non-narrating states
const STATE_EXPRESSIONS: Record<string, Record<string, string>> = {
  "android-security": {
    idle:    "neutral",
    loading: "neutral",
    paused:  "thinking",
    done:    "happy",
    error:   "neutral",
  },
  "malware-analysis": {
    idle:    "neutral",
    loading: "dormant_idle",
    paused:  "smug",
    done:    "corrupted_laugh",
    error:   "neutral",
  },
};

const MASCOT_PREFIX: Record<string, string> = {
  "android-security": "droidghost",
  "malware-analysis": "quarantine_blob",
};

const DEFAULT_PATH = "android-security";

// Vary timing between expressions so it feels natural, not robotic
const EXPR_TIMINGS = [3200, 4100, 3600, 5000, 3000, 4400, 3800, 4700];

type State = "idle" | "loading" | "speaking" | "paused" | "done" | "error";

interface MascotNarratorProps {
  content: string;
  learningPathSlug?: string | null;
  accent: string;
  accentDim: string;
  border: string;
}

export default function MascotNarrator({
  content,
  learningPathSlug,
  accent,
  accentDim,
  border,
}: MascotNarratorProps) {
  const path    = (learningPathSlug && NARRATING_SEQUENCES[learningPathSlug])
    ? learningPathSlug
    : DEFAULT_PATH;
  const prefix  = MASCOT_PREFIX[path];
  const seq     = NARRATING_SEQUENCES[path];
  const stateEx = STATE_EXPRESSIONS[path];

  const [state,   setState]   = useState<State>("idle");
  const [exprIdx, setExprIdx] = useState(0);
  const audioRef    = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef  = useRef<string | null>(null);
  const exprTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Expression cycling ────────────────────────────────────────────────────
  const stopExprCycle = useCallback(() => {
    if (exprTimer.current) { clearTimeout(exprTimer.current); exprTimer.current = null; }
  }, []);

  const scheduleNextExpr = useCallback((idx: number) => {
    const delay = EXPR_TIMINGS[idx % EXPR_TIMINGS.length];
    exprTimer.current = setTimeout(() => {
      const next = (idx + 1) % seq.length;
      setExprIdx(next);
      scheduleNextExpr(next);
    }, delay);
  }, [seq.length]);

  const startExprCycle = useCallback(() => {
    stopExprCycle();
    setExprIdx(0);
    scheduleNextExpr(0);
  }, [stopExprCycle, scheduleNextExpr]);

  // ── Audio cleanup ─────────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    stopExprCycle();
  }, [stopExprCycle]);

  useEffect(() => { cleanup(); setState("idle"); }, [content, cleanup]);
 useEffect(() => {
  return () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    if (exprTimer.current) {
      clearTimeout(exprTimer.current);
      exprTimer.current = null;
    }
  };
}, []);

  // ── Play ──────────────────────────────────────────────────────────────────
  const handlePlay = useCallback(async () => {
    if (state === "paused" && audioRef.current) {
      audioRef.current.play();
      startExprCycle();
      return;
    }
    cleanup();
    setState("loading");
    try {
      const plain = stripMarkdownForSpeech(content);
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text: plain, learningPathSlug: path }),
      });
      if (!res.ok) { setState("error"); return; }

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      blobUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current  = audio;

      audio.onplay    = () => { setState("speaking"); startExprCycle(); };
      audio.onpause   = () => { setState((s) => s === "done" ? "done" : "paused"); stopExprCycle(); };
      audio.onended   = () => { setState("done"); stopExprCycle(); };
      audio.onerror   = () => { setState("error"); stopExprCycle(); };

      audio.play();
    } catch { setState("error"); }
  }, [state, content, path, cleanup, startExprCycle, stopExprCycle]);

  const handlePause = useCallback(() => {
    audioRef.current?.pause();
    stopExprCycle();
    setState("paused");
  }, [stopExprCycle]);

  const handleStop = useCallback(() => {
    cleanup();
    setState("idle");
  }, [cleanup]);

  // ── Expression image ──────────────────────────────────────────────────────
  const expression =
    state === "speaking"
      ? seq[exprIdx]
      : stateEx[state] ?? "neutral";

  const mascotSrc = `/images/mascots/${prefix}_${expression}.png`;
  const floatVisible = state !== "idle" && state !== "error";

  const floatLabel =
    state === "loading"  ? "Generating audio…" :
    state === "speaking" ? "Narrating…"         :
    state === "paused"   ? "Paused"             :
    state === "done"     ? "Done!"              : "";

  return (
    <>
      {/* ── Inline trigger ────────────────────────────────────────────── */}
      <button
        onClick={
          state === "idle" || state === "error" || state === "done" ? handlePlay :
          state === "speaking" ? handlePause : handlePlay
        }
        disabled={state === "loading"}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all hover:opacity-80 disabled:opacity-40 mb-8"
        style={{ background: accentDim, border: `1px solid ${border}`, color: state === "error" ? "#ef4444" : accent }}
      >
        {state === "loading"
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : <Volume2 className="w-3.5 h-3.5" />}
        {state === "idle"     ? "Listen to module"  :
         state === "loading"  ? "Generating…"       :
         state === "speaking" ? "Pause narration"   :
         state === "paused"   ? "Resume narration"  :
         state === "done"     ? "Play again"        :
         "TTS unavailable"}
      </button>

      {/* ── Floating Clippy mascot ─────────────────────────────────────── */}
      <AnimatePresence>
        {floatVisible && (
          <motion.div
            key="clippy"
            initial={{ opacity: 0, y: 40, scale: 0.85 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{   opacity: 0, y: 40, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
          >
            {/* Speech bubble with controls */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono shadow-lg"
              style={{ background: "#0e1220", border: `1px solid ${border}`, color: accent }}
            >
              {state === "speaking" ? (
                <button
                  onClick={handlePause}
                  className="w-6 h-6 rounded flex items-center justify-center hover:opacity-70"
                  style={{ background: accent }} title="Pause"
                >
                  <Pause className="w-3 h-3" style={{ color: "#0b0d16" }} />
                </button>
              ) : state !== "loading" ? (
                <button
                  onClick={handlePlay}
                  className="w-6 h-6 rounded flex items-center justify-center hover:opacity-70"
                  style={{ background: accent }} title="Play"
                >
                  <Play className="w-3 h-3" style={{ color: "#0b0d16" }} />
                </button>
              ) : (
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: accent }} />
              )}

              <span>{floatLabel}</span>

              {(state === "speaking" || state === "paused") && (
                <button
                  onClick={handleStop}
                  className="w-6 h-6 rounded flex items-center justify-center border hover:border-foreground/40"
                  style={{ borderColor: border }} title="Stop"
                >
                  <Square className="w-3 h-3" style={{ color: accent }} />
                </button>
              )}
            </motion.div>

            {/* Mascot — expression changes while speaking */}
            <div className="relative">
              <motion.img
                key={mascotSrc}
                src={mascotSrc}
                alt="Narrator mascot"
                className="w-44 h-44 object-contain select-none drop-shadow-2xl"
                initial={{ opacity: 0.6, scale: 0.95 }}
                animate={{ opacity: 1,   scale: 1,
                  y: state === "speaking" ? [0, -8, 0] : 0 }}
                transition={state === "speaking"
                  ? { y: { duration: 0.9, repeat: Infinity, ease: "easeInOut" },
                      opacity: { duration: 0.2 }, scale: { duration: 0.2 } }
                  : { duration: 0.25 }}
              />
              {/* Glow under mascot while speaking */}
              {state === "speaking" && (
                <span
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-20 h-5 rounded-full blur-xl opacity-30 animate-pulse"
                  style={{ background: accent }}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
