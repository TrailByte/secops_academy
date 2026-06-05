import Layout from "@/components/Layout";
import { useChallenges } from "@/hooks/use-challenges";
import { useProgress } from "@/hooks/use-progress";
import { Link, useParams } from "wouter";
import { Flag, Loader2, Zap, CheckCircle2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { LearningPath } from "@shared/schema";

const getDifficultyColor = (diff: string) => {
  switch (diff.toLowerCase()) {
    case "easy":     return "bg-green-500/10 text-green-400 border-green-500/20";
    case "medium":   return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "hard":     return "bg-red-500/10 text-red-400 border-red-500/20";
    case "advanced": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    default:         return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  }
};

export default function ChallengesList() {
  const params = useParams<{ pathSlug: string }>();
  const pathSlug = params?.pathSlug;
  console.log(pathSlug)
  const { data: allChallenges, isLoading } = useChallenges();
  const { data: progress } = useProgress();
  const { data: path } = useQuery<LearningPath>({
    queryKey: ["/api/learning-paths", pathSlug],
    queryFn: async () => {
      const res = await fetch(`/api/learning-paths/${pathSlug}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    enabled: !!pathSlug,
  });

  // Filter challenges for this path
  const challenges = allChallenges?.filter(c => c.learningPathSlug === pathSlug) ?? [];

  const solvedIds = new Set(
    (progress || []).filter(p => p.resourceType === "challenge").map(p => p.resourceId)
  );

  const solvedCount = challenges.filter(c => solvedIds.has(c.id)).length;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Back */}
        <Link href="/learn">
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            All Learning Paths
          </button>
        </Link>

        <div className="text-center mb-12 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
          <p className="text-xs font-mono text-primary uppercase tracking-widest mb-3">
            {path?.title ?? pathSlug}
          </p>
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">
            CTF <span className="text-primary">CHALLENGES</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Analyze real artifacts. Think like an analyst, find the flag.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-mono">
            <Flag className="w-3 h-3" />
            {solvedCount}/{challenges.length} FLAGS CAPTURED
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center h-64 items-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : challenges.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <Flag className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-mono text-sm">No challenges yet for this path.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge, idx) => {
              const isSolved = solvedIds.has(challenge.id);
              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <Link href={`/challenges/${challenge.id}`}>
                    <div className={`group h-full bg-card border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer flex flex-col ${
                      isSolved ? "border-green-500/30" : "border-border hover:border-primary/50"
                    }`}>
                      <div className="p-6 flex-1">
                        <div className="flex justify-between items-start mb-4 gap-2">
                          <Badge variant="outline" className={`text-[10px] font-mono font-bold uppercase ${getDifficultyColor(challenge.difficulty)}`}>
                            {challenge.difficulty}
                          </Badge>
                          {isSolved
                            ? <CheckCircle2 className="w-5 h-5 text-green-400" />
                            : <Flag className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          }
                        </div>
                        <h3 className="text-xl font-bold mb-2 font-display">{challenge.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{challenge.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs font-mono px-2 py-1 rounded bg-secondary text-secondary-foreground">
                            {challenge.category}
                          </span>
                        </div>
                      </div>
                      <div className={`p-4 border-t flex items-center justify-between text-sm font-medium transition-colors ${
                        isSolved
                          ? "bg-green-500/5 border-green-500/20 text-green-400"
                          : "bg-black/20 border-border text-muted-foreground group-hover:text-foreground"
                      }`}>
                        <span className="flex items-center gap-2">
                          {isSolved
                            ? <><CheckCircle2 className="w-4 h-4" /> Solved</>
                            : <><Zap className="w-4 h-4" /> Start Analysis</>
                          }
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
