import Layout from "@/components/Layout";
import { useChallenges } from "@/hooks/use-challenges";
import { useProgress } from "@/hooks/use-progress";
import { Link } from "wouter";
import { Flag, Loader2, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { LearningPath } from "@shared/schema";
import { RadarIllustration } from "@/components/illustrations";

const MASCOT: Record<string, {
  src: string; accent: string; accentDim: string;
  glow: string; border: string; label: string;
}> = {
  "malware-analysis": {
    src: "/images/quarantine_blob_neutral.png",
    accent: "#e24b4a", accentDim: "rgba(226,75,74,0.12)",
    glow: "rgba(220,50,50,0.10)", border: "rgba(226,75,74,0.25)",
    label: "THREAT ANALYSIS",
  },
  "android-security": {
    src: "/images/droidghost_neutral.png",
    accent: "#22c55e", accentDim: "rgba(34,197,94,0.12)",
    glow: "rgba(34,197,94,0.10)", border: "rgba(34,197,94,0.25)",
    label: "MOBILE SECURITY",
  },
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
      <div className="max-w-5xl mx-auto relative">
        {/* Radar illustration — top right ambient */}
        <div className="absolute right-[-60px] top-[-20px] pointer-events-none select-none opacity-[0.12]" style={{width:"340px"}}>
          <RadarIllustration className="w-full" />
        </div>
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
              const m = MASCOT[path.slug] ?? MASCOT["malware-analysis"];
              const pathChallenges = allChallenges?.filter(c => c.learningPathSlug === path.slug) ?? [];
              const solved = pathChallenges.filter(c => solvedIds.has(c.id)).length;
              const total = pathChallenges.length;

              return (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link href={`/challenges/path/${path.slug}`}>
                    <div
                      className="group relative overflow-hidden rounded-xl border cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                      style={{ borderColor: m.border, background: "#0e1220", height: "220px" }}
                    >
                      {/* Mascot */}
                      <div
                        className="absolute bottom-0 right-0 pointer-events-none select-none overflow-hidden"
                        style={{ width: "180px", height: "180px" }}
                      >
                        <img
                          src={m.src}
                          alt=""
                          className="absolute bottom-0 right-0 group-hover:opacity-50 transition-opacity duration-300"
                          style={{ height: "180px", width: "auto", opacity: 0.3 }}
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
                        <div className="flex items-center gap-3 mt-4 mb-3">
                          <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                            <Flag className="w-3.5 h-3.5" style={{ color: m.accent }} />
                            <span>{solved}/{total} flags captured</span>
                          </div>
                          {total > 0 && (
                            <>
                              <div className="w-px h-3 bg-border" />
                              <div className="flex-1 max-w-[80px] h-[2px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                                <motion.div
                                  className="h-full rounded-full"
                                  style={{ background: m.accent }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(solved / total) * 100}%` }}
                                  transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.1 + 0.3 }}
                                />
                              </div>
                            </>
                          )}
                        </div>

                        <div className="inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: m.accent }}>
                          <span>Start Challenges</span>
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
