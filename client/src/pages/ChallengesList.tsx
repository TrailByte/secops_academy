import Layout from "@/components/Layout";
import { useChallenges } from "@/hooks/use-challenges";
import { useProgress } from "@/hooks/use-progress";
import { Link } from "wouter";
import { Flag, Loader2, Zap, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function ChallengesList() {
  const { data: challenges, isLoading } = useChallenges();
  const { data: progress } = useProgress();

  const solvedIds = new Set(
    (progress || []).filter(p => p.resourceType === 'challenge').map(p => p.resourceId)
  );

  const getDifficultyColor = (diff: string) => {
    switch(diff.toLowerCase()) {
      case 'easy': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'hard': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'advanced': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  const solvedCount = challenges?.filter(c => solvedIds.has(c.id)).length || 0;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4" data-testid="text-challenges-title">
            CTF <span className="text-primary">CHALLENGES</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Analyze real-world malware artifacts. Think like an analyst, find the answer.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-mono" data-testid="text-challenge-progress">
            <Flag className="w-3 h-3" />
            {solvedCount}/{challenges?.length || 0} FLAGS CAPTURED
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center h-64">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges?.map((challenge, idx) => {
              const isSolved = solvedIds.has(challenge.id);

              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <Link href={`/challenges/${challenge.id}`}>
                    <div
                      className={`group h-full bg-card border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer flex flex-col ${
                        isSolved ? "border-green-500/30" : "border-border hover:border-primary/50"
                      }`}
                      data-testid={`card-challenge-${challenge.id}`}
                    >
                      <div className="p-6 flex-1">
                        <div className="flex justify-between items-start mb-4 gap-2">
                          <Badge variant="outline" className={`text-[10px] font-mono font-bold uppercase ${getDifficultyColor(challenge.difficulty)}`}>
                            {challenge.difficulty}
                          </Badge>
                          {isSolved ? (
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                          ) : (
                            <Flag className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          )}
                        </div>

                        <h3 className="text-xl font-bold mb-2 font-display">{challenge.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {challenge.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-auto">
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
                          {isSolved ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Solved
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4" />
                              Start Analysis
                            </>
                          )}
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
