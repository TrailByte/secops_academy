import Layout from "@/components/Layout";
import { useChallenge, useSubmitFlag } from "@/hooks/use-challenges";
import { useProgress } from "@/hooks/use-progress";
import { useRoute, Link } from "wouter";
import { CodeBlock } from "@/components/CodeBlock";
import { Loader2, ArrowLeft, Flag, CheckCircle2, Terminal, HelpCircle, Info } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { playCompletionSound } from "@/lib/sounds";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

const PATH_THEME: Record<string, { accent: string; accentDim: string; border: string; backHref: string; backLabel: string }> = {
  "malware-analysis": {
    accent: "#e24b4a", accentDim: "rgba(226,75,74,0.10)", border: "rgba(226,75,74,0.20)",
    backHref: "/challenges/path/malware-analysis", backLabel: "Malware Analysis Challenges",
  },
  "android-security": {
    accent: "#22c55e", accentDim: "rgba(34,197,94,0.10)", border: "rgba(34,197,94,0.20)",
    backHref: "/challenges/path/android-security", backLabel: "Android Security Challenges",
  },
};
const DEFAULT_THEME = PATH_THEME["malware-analysis"];

const getDifficultyColor = (diff: string) => {
  switch(diff.toLowerCase()) {
    case 'easy':     return 'bg-green-500/10 text-green-400 border-green-500/20';
    case 'medium':   return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'hard':     return 'bg-red-500/10 text-red-400 border-red-500/20';
    case 'advanced': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    default:         return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  }
};

export default function ChallengeDetail() {
  const [, params] = useRoute("/challenges/:id");
  const id = Number(params?.id);
  const queryClient = useQueryClient();

  const { data: challenge, isLoading } = useChallenge(id);
  const { data: progress } = useProgress();
  const submitFlag = useSubmitFlag();
  const { toast } = useToast();

  const alreadySolved = (progress || []).some(p => p.resourceType === 'challenge' && p.resourceId === id);
  const [flagInput, setFlagInput] = useState("");
  const [solved, setSolved] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const isSolved = solved || alreadySolved;

  const theme = challenge?.learningPathSlug
    ? (PATH_THEME[challenge.learningPathSlug] ?? DEFAULT_THEME)
    : DEFAULT_THEME;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagInput.trim()) return;
    submitFlag.mutate({ id, flag: flagInput }, {
      onSuccess: (data) => {
        if (data.correct) {
          setSolved(true);
          playCompletionSound();
          queryClient.invalidateQueries({ queryKey: [api.progress.list.path] });
          toast({ title: "Flag Captured!", description: "Congratulations agent, analysis confirmed." });
        } else {
          toast({ variant: "destructive", title: "Access Denied", description: "Incorrect flag. Check your analysis." });
        }
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error", description: "Failed to submit flag. Try again." });
      }
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: theme.accent }} />
        </div>
      </Layout>
    );
  }

  if (!challenge) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Challenge not found</h2>
          <Link href="/challenges" className="text-primary hover:underline">Return to lobby</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
          <div>
            <Link href={theme.backHref}>
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                {theme.backLabel}
              </button>
            </Link>

            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span
                className="px-2 py-1 rounded text-xs font-mono border uppercase"
                style={{ background: theme.accentDim, borderColor: theme.border, color: theme.accent }}
              >
                {challenge.category}
              </span>
              <Badge variant="outline" className={`text-[10px] font-mono font-bold uppercase ${getDifficultyColor(challenge.difficulty)}`}>
                {challenge.difficulty}
              </Badge>
            </div>

            <h1 className="text-4xl font-display font-bold tracking-tight mb-3">{challenge.title}</h1>
            <div className="h-1 w-16 rounded-full mb-4" style={{ background: theme.accent }} />
            <p className="text-muted-foreground text-lg max-w-2xl">{challenge.description}</p>
          </div>

          {isSolved && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex-shrink-0 px-6 py-4 rounded-lg flex items-center gap-3"
              style={{ background: theme.accentDim, border: `1px solid ${theme.border}`, color: theme.accent }}
            >
              <CheckCircle2 className="w-8 h-8" />
              <div>
                <div className="font-bold text-lg">SOLVED</div>
                <div className="text-xs opacity-80">Flag Captured</div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* -- ARTIFACT + HINTS -- */}
          <div className="lg:col-span-2 space-y-6">
            {/* Artifact */}
            <div
              className="rounded-xl overflow-hidden"
              style={{ background: "#0e1220", border: `1px solid ${theme.border}` }}
            >
              <div
                className="px-6 py-3 border-b flex items-center justify-between"
                style={{ borderColor: theme.border, background: theme.accentDim }}
              >
                <div className="flex items-center gap-2 text-sm font-medium" style={{ color: theme.accent }}>
                  <Terminal className="w-4 h-4" />
                  Target Artifact
                </div>
                <div className="text-xs text-muted-foreground font-mono">read-only</div>
              </div>
              <div className="p-6">
                {challenge.artifact ? (
                  <CodeBlock code={challenge.artifact} language="text" filename="artifact.log" />
                ) : (
                  <div className="p-8 border-2 border-dashed border-border rounded-lg text-center text-muted-foreground">
                    No artifact provided for this challenge.
                  </div>
                )}
              </div>
            </div>

            {/* Hints */}
            {(challenge.hints as string[])?.length > 0 && (
              <div
                className="rounded-xl p-6"
                style={{ background: "#0e1220", border: `1px solid rgba(255,255,255,0.06)` }}
              >
                <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-yellow-500" />
                  Hints
                </h3>
                <div className="space-y-3">
                  {(challenge.hints as string[]).map((hint, idx) => (
                    <details key={idx} className="group">
                      <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors list-none flex items-center gap-2">
                        <span
                          className="w-6 h-6 rounded flex items-center justify-center text-xs font-mono font-bold"
                          style={{ background: theme.accentDim, color: theme.accent }}
                        >
                          {idx + 1}
                        </span>
                        <span>Click to reveal hint</span>
                      </summary>
                      <div className="mt-2 pl-8 text-sm text-foreground/90 p-4 bg-muted/20 rounded border border-border">
                        {hint}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* Technical deep dive - unlocked after solving */}
            {isSolved && challenge.technicalContext && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-6"
                style={{ background: "#0e1220", border: `1px solid ${theme.border}` }}
              >
                <button
                  onClick={() => setShowContext(!showContext)}
                  className="flex items-center gap-2 text-base font-bold w-full text-left"
                  style={{ color: theme.accent }}
                >
                  <Info className="w-5 h-5" />
                  Technical Deep Dive
                  <span className="ml-auto text-sm font-normal text-muted-foreground">{showContext ? 'Hide' : 'Show'}</span>
                </button>
                {showContext && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 text-sm text-foreground/80 whitespace-pre-line leading-relaxed"
                  >
                    {challenge.technicalContext}
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>

          {/* -- FLAG SUBMISSION -- */}
          <div className="lg:col-span-1">
            <div
              className="sticky top-24 rounded-xl p-6"
              style={{ background: "#0e1220", border: `1px solid ${theme.border}` }}
            >
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Flag className="w-5 h-5" style={{ color: theme.accent }} />
                Submit Flag
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs uppercase font-bold text-muted-foreground mb-1.5 block">
                    Flag Input
                  </label>
                  <input
                    type="text"
                    value={flagInput}
                    onChange={(e) => setFlagInput(e.target.value)}
                    placeholder="Enter your answer..."
                    className="w-full bg-background border border-border rounded px-4 py-3 font-mono text-sm focus:outline-none transition-all"
                    style={{ ['--tw-ring-color' as any]: theme.accent }}
                    onFocus={e => { e.currentTarget.style.borderColor = theme.accent; }}
                    onBlur={e => { e.currentTarget.style.borderColor = ''; }}
                    disabled={isSolved || submitFlag.isPending}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSolved || submitFlag.isPending || !flagInput.trim()}
                  className="w-full py-3 rounded font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:opacity-90"
                  style={{
                    background: isSolved ? theme.accentDim : theme.accent,
                    color: isSolved ? theme.accent : "#0b0d16",
                    border: isSolved ? `1px solid ${theme.border}` : "none",
                  }}
                >
                  {submitFlag.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isSolved ? (
                    <><CheckCircle2 className="w-4 h-4" /> Captured</>
                  ) : (
                    <><Terminal className="w-4 h-4" /> Submit</>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t" style={{ borderColor: theme.border }}>
                <h4 className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Instructions</h4>
                <ul className="text-xs space-y-2 text-muted-foreground list-disc pl-4">
                  <li>Analyze the artifact carefully.</li>
                  <li>Flags are case-insensitive.</li>
                  <li>Some flags require decoding or analysis skills.</li>
                  <li>Use the hints if you're stuck.</li>
                  <li>After solving, read the Technical Deep Dive to learn more.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
