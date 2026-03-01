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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagInput.trim()) return;

    submitFlag.mutate(
      { id, flag: flagInput },
      {
        onSuccess: (data) => {
          if (data.correct) {
            setSolved(true);
            playCompletionSound();
            queryClient.invalidateQueries({ queryKey: [api.progress.list.path] });
            toast({
              title: "Flag Captured!",
              description: "Congratulations agent, analysis confirmed.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Access Denied",
              description: "Incorrect flag. Check your analysis.",
            });
          }
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to submit flag. Try again.",
          });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
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

  const getDifficultyColor = (diff: string) => {
    switch(diff.toLowerCase()) {
      case 'easy': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'hard': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'advanced': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
          <div>
            <Link href="/challenges">
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4 group" data-testid="button-back-challenges">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Challenges
              </button>
            </Link>

            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs font-mono uppercase">
                {challenge.category}
              </span>
              <Badge variant="outline" className={`text-[10px] font-mono font-bold uppercase ${getDifficultyColor(challenge.difficulty)}`}>
                {challenge.difficulty}
              </Badge>
            </div>

            <h1 className="text-4xl font-display font-bold tracking-tight mb-4" data-testid="text-challenge-title">
              {challenge.title}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              {challenge.description}
            </p>
          </div>

          <div className="flex-shrink-0">
            {isSolved && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="px-6 py-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3 text-green-500"
              >
                <CheckCircle2 className="w-8 h-8" />
                <div>
                  <div className="font-bold text-lg">SOLVED</div>
                  <div className="text-xs opacity-80">Flag Captured</div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
              <div className="bg-muted/30 px-6 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Terminal className="w-4 h-4 text-primary" />
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

            {(challenge.hints as string[])?.length > 0 && (
              <div className="bg-card/50 border border-border/50 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-yellow-500" />
                  Hints
                </h3>
                <div className="space-y-4">
                  {(challenge.hints as string[]).map((hint, idx) => (
                    <details key={idx} className="group">
                      <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors list-none flex items-center gap-2" data-testid={`button-hint-${idx}`}>
                        <span className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs">{idx + 1}</span>
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

            {isSolved && challenge.technicalContext && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-primary/20 rounded-xl p-6"
              >
                <button
                  onClick={() => setShowContext(!showContext)}
                  className="flex items-center gap-2 text-lg font-bold text-primary w-full text-left"
                  data-testid="button-toggle-context"
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

          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card border border-border rounded-xl p-6 shadow-xl shadow-black/20">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Flag className="w-5 h-5 text-primary" />
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
                    className="w-full bg-background border border-border rounded px-4 py-3 font-mono text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    disabled={isSolved || submitFlag.isPending}
                    data-testid="input-flag"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSolved || submitFlag.isPending || !flagInput.trim()}
                  className="w-full py-3 rounded bg-primary text-primary-foreground font-bold hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  data-testid="button-submit-flag"
                >
                  {submitFlag.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isSolved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Captured
                    </>
                  ) : (
                    <>
                      <Terminal className="w-4 h-4" />
                      Submit
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="text-xs font-bold text-muted-foreground mb-2">INSTRUCTIONS</h4>
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
