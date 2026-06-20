import Layout from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { useProgress } from "@/hooks/use-progress";
import { useLessons } from "@/hooks/use-lessons";
import { useChallenges } from "@/hooks/use-challenges";
import { Link } from "wouter";
import { ChevronRight, Loader2, BookOpen, Flag } from "lucide-react";
import { motion } from "framer-motion";
import type { LearningPath } from "@shared/schema";
import { NetworkGraphIllustration } from "@/components/illustrations";

const MASCOT: Record<string, {
  src: string; accent: string; accentDim: string;
  glow: string; border: string; label: string;
}> = {
  "malware-analysis": {
    src: "/images/mascots/quarantine_blob_neutral.png",
    accent: "#e24b4a", accentDim: "rgba(226,75,74,0.12)",
    glow: "rgba(220,50,50,0.10)", border: "rgba(226,75,74,0.25)",
    label: "THREAT ANALYSIS",
  },
  "android-security": {
    src: "/images/mascots/droidghost_neutral.png",
    accent: "#22c55e", accentDim: "rgba(34,197,94,0.12)",
    glow: "rgba(34,197,94,0.10)", border: "rgba(34,197,94,0.25)",
    label: "MOBILE SECURITY",
  },
};

export default function LearningPaths() {
  const { data: paths, isLoading } = useQuery<LearningPath[]>({
    queryKey: ["/api/learning-paths"],
    queryFn: async () => {
      const res = await fetch("/api/learning-paths");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });
  const { data: allLessons } = useLessons();
  const { data: allChallenges } = useChallenges();
  const { data: progress } = useProgress();

  const completedLessonIds = new Set(
    (progress || []).filter(p => p.resourceType === "lesson").map(p => p.resourceId)
  );
  const solvedChallengeIds = new Set(
    (progress || []).filter(p => p.resourceType === "challenge").map(p => p.resourceId)
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto relative">
        {/* Network graph illustration - top right ambient */}
        <div className="absolute right-[-80px] top-[-40px] pointer-events-none select-none opacity-[0.12]" style={{width:"380px"}}>
          <NetworkGraphIllustration className="w-full" />
        </div>
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-3">Learning Paths</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Choose a specialization. Each path contains theory modules and hands-on CTF challenges.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center h-64 items-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paths?.map((path, idx) => {
              const m = MASCOT[path.slug] ?? MASCOT["malware-analysis"];
              const pathLessons = allLessons?.filter(l => l.learningPathSlug === path.slug) ?? [];
              const pathChallenges = allChallenges?.filter(c => c.learningPathSlug === path.slug) ?? [];
              const completedLessons = pathLessons.filter(l => completedLessonIds.has(l.id)).length;
              const solvedChallenges = pathChallenges.filter(c => solvedChallengeIds.has(c.id)).length;

              return (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="h-full"
                >
                  <Link href={`/learn/${path.slug}/lessons`}>
                    {/* Fixed height card so both cards are equal */}
                    <div
                      className="group relative overflow-hidden rounded-xl border cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                      style={{ borderColor: m.border, background: "#0e1220", height: "260px" }}
                    >
                      {/* Mascot - fixed size container bottom-right */}
                      <div
                        className="absolute bottom-0 right-0 pointer-events-none select-none overflow-hidden"
                        style={{ width: "180px", height: "180px" }}
                      >
                        <img
                          src={m.src}
                          alt=""
                          className="absolute bottom-0 right-0 group-hover:opacity-50 transition-opacity duration-300"
                          style={{ height: "180px", width: "auto", opacity: 0.3, objectFit: "contain" }}
                        />
                      </div>

                      {/* Glow */}
                      <div
                        className="absolute inset-0 opacity-50 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background: `radial-gradient(ellipse at 85% 70%, ${m.glow} 0%, transparent 60%)` }}
                      />

                      {/* Content */}
                      <div className="relative z-10 p-6 flex flex-col h-full" style={{ maxWidth: "72%" }}>
                        <p className="text-[9px] font-mono tracking-[3px] uppercase mb-2" style={{ color: m.accent }}>
                          {m.label}
                        </p>
                        <h2 className="text-2xl font-bold mb-2 group-hover:text-white transition-colors">
                          {path.title}
                        </h2>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-auto line-clamp-2">
                          {path.description}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center gap-4 mt-4 mb-3">
                          <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                            <BookOpen className="w-3.5 h-3.5" style={{ color: m.accent }} />
                            <span>{completedLessons}/{pathLessons.length} modules</span>
                          </div>
                          <div className="w-px h-3 bg-border" />
                          <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                            <Flag className="w-3.5 h-3.5" style={{ color: m.accent }} />
                            <span>{solvedChallenges}/{pathChallenges.length} flags</span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        {pathLessons.length > 0 && (
                          <div className="mb-3 h-[2px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: m.accent }}
                              initial={{ width: 0 }}
                              animate={{ width: `${(completedLessons / pathLessons.length) * 100}%` }}
                              transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.1 + 0.3 }}
                            />
                          </div>
                        )}

                        <div className="inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: m.accent }}>
                          <span>View Modules</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
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
