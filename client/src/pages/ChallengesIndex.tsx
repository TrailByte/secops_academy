import Layout from "@/components/Layout";
import { useChallenges } from "@/hooks/use-challenges";
import { useProgress } from "@/hooks/use-progress";
import { Link } from "wouter";
import { Flag, Shield, Bug, Smartphone, Network, Lock, Globe, BookOpen, ChevronRight, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { LearningPath } from "@shared/schema";

const ICONS: Record<string, React.ElementType> = {
  Shield, Bug, Smartphone, Network, Lock, Globe, BookOpen, Flag,
};

const COLORS: Record<string, { text: string; bg: string; border: string }> = {
  blue:   { text: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/20" },
  green:  { text: "text-green-400",  bg: "bg-green-400/10",  border: "border-green-400/20" },
  purple: { text: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
  teal:   { text: "text-teal-400",   bg: "bg-teal-400/10",   border: "border-teal-400/20" },
  amber:  { text: "text-amber-400",  bg: "bg-amber-400/10",  border: "border-amber-400/20" },
  red:    { text: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/20" },
};

export default function ChallengesIndex() {
  const { data: paths, isLoading } = useQuery<LearningPath[]>({
    queryKey: ["/api/learning-paths"],
    queryFn: async () => {
      const res = await fetch("/api/learning-paths");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: allChallenges } = useChallenges();
  const { data: progress } = useProgress();

  const solvedIds = new Set(
    (progress || []).filter(p => p.resourceType === "challenge").map(p => p.resourceId)
  );

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">
            CTF <span className="text-primary">CHALLENGES</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hands-on labs and capture-the-flag challenges. Choose a category to begin.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center h-64 items-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paths?.map((path, idx) => {
              const Icon = ICONS[path.icon] || Shield;
              const color = COLORS[path.color] || COLORS.blue;

              const pathChallenges = allChallenges?.filter(c => c.learningPathSlug === path.slug) ?? [];
              const solved = pathChallenges.filter(c => solvedIds.has(c.id)).length;
              const total = pathChallenges.length;

              return (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <Link href={`/challenges/path/${path.slug}`}>
                    <div className={`group bg-card border ${color.border} rounded-xl p-6 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl ${color.bg} ${color.text} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className={`text-xl font-bold mb-1 group-hover:${color.text} transition-colors`}>
                            {path.title}
                          </h2>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                            {path.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Flag className={`w-4 h-4 ${color.text}`} />
                              <span className="text-xs font-mono text-muted-foreground">
                                {solved}/{total} FLAGS CAPTURED
                              </span>
                            </div>
                            {total > 0 && (
                              <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${color.bg} border ${color.border}`}
                                  style={{ width: `${total > 0 ? (solved / total) * 100 : 0}%`, background: 'currentColor' }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors self-center" />
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
