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

const MASCOT: Record<string, { src: string; accent: string; glow: string; label: string }> = {
  "malware-analysis": {
    src: "/images/mascots/quarantine_blob_neutral.png",
    accent: "#e24b4a",
    glow: "rgba(220,50,50,0.10)",
    label: "// MALWARE ANALYSIS PATH",
  },
  "android-security": {
    src: "/images/mascots/droidghost_neutral.png",
    accent: "#22c55e",
    glow: "rgba(34,197,94,0.10)",
    label: "// ANDROID SECURITY PATH",
  },
};

export default function ChallengesList() {
  const params = useParams<{ pathSlug: string }>();
  const pathSlug = params?.pathSlug;

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

  const challenges = allChallenges?.filter(c => c.learningPathSlug === pathSlug) ?? [];
  const solvedIds = new Set(
    (progress || []).filter(p => p.resourceType === "challenge").map(p => p.resourceId)
  );
  const solvedCount = challenges.filter(c => solvedIds.has(c.id)).length;
  const mascot = MASCOT[pathSlug ?? ""] ?? MASCOT["malware-analysis"];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Back */}
        <Link href="/challenges">
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            All Challenge Paths
          </button>
        </Link>

        {/* Hero header */}
        <div
          className="relative overflow-hidden rounded-xl mb-10 border"
          style={{ borderColor: `${mascot.accent}22`, background: "#0e1220" }}
        >
          <div className="absolute right-0 bottom-0 pointer-events-none select-none">
            <img
              src={mascot.src}
              alt=""
              className="h-[220px] w-auto"
              style={{ opacity: 0.45 }}
            />
          </div>
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(ellipse at 85% 60%, ${mascot.glow} 0%, transparent 65%)` }}
          />
          <div className="relative z-10 p-8" style={{ maxWidth: "60%" }}>
            <p className="text-[10px] font-mono tracking-[3px] mb-2 uppercase" style={{ color: mascot.accent }}>
              {mascot.label}
            </p>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              CTF <span style={{ color: mascot.accent }}>CHALLENGES</span>
            </h1>
            <p className="text-sm text-muted-foreground mb-5">
              Analyze real artifacts. Think like an analyst, find the flag.
            </p>
            <div
              className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full border"
              style={{
                background: `${mascot.accent}14`,
                borderColor: `${mascot.accent}33`,
                color: mascot.accent,
              }}
            >
              <Flag className="w-3 h-3" />
              {solvedCount}/{challenges.length} FLAGS CAPTURED
            </div>
          </div>
        </div>

        {/* Challenge grid */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {challenges.map((challenge, idx) => {
              const isSolved = solvedIds.has(challenge.id);
              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                >
                  <Link href={`/challenges/${challenge.id}`}>
                    <div className={`group h-full bg-card border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer flex flex-col ${
                      isSolved ? "border-green-500/30" : "border-border hover:border-primary/50"
                    }`}>
                      <div className="p-5 flex-1">
                        <div className="flex justify-between items-start mb-3 gap-2">
                          <Badge variant="outline" className={`text-[10px] font-mono font-bold uppercase ${getDifficultyColor(challenge.difficulty)}`}>
                            {challenge.difficulty}
                          </Badge>
                          {isSolved
                            ? <CheckCircle2 className="w-5 h-5 text-green-400" />
                            : <Flag className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          }
                        </div>
                        <h3 className="text-lg font-bold mb-2 font-display">{challenge.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{challenge.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs font-mono px-2 py-1 rounded bg-secondary text-secondary-foreground">
                            {challenge.category}
                          </span>
                        </div>
                      </div>
                      <div className={`p-4 border-t flex items-center gap-2 text-sm font-medium transition-colors ${
                        isSolved
                          ? "bg-green-500/5 border-green-500/20 text-green-400"
                          : "bg-black/20 border-border text-muted-foreground group-hover:text-foreground"
                      }`}>
                        {isSolved
                          ? <><CheckCircle2 className="w-4 h-4" /> Solved</>
                          : <><Zap className="w-4 h-4" /> Start Analysis</>
                        }
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
