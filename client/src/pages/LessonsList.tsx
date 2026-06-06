import Layout from "@/components/Layout";
import { useLessons } from "@/hooks/use-lessons";
import { useProgress } from "@/hooks/use-progress";
import { Link, useParams } from "wouter";
import { BookOpen, ChevronRight, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { LearningPath } from "@shared/schema";

const MASCOT: Record<string, {
  src: string; accent: string; accentDim: string;
  glow: string; border: string; label: string;
  badgeCompleted: string;
}> = {
  "malware-analysis": {
    src: "/images/mascots/quarantine_blob_neutral.png",
    accent: "#e24b4a",
    accentDim: "rgba(226,75,74,0.10)",
    glow: "rgba(220,50,50,0.10)",
    border: "rgba(226,75,74,0.20)",
    label: "// MALWARE ANALYSIS PATH",
    badgeCompleted: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  "android-security": {
    src: "/images/mascots/droidghost_neutral.png",
    accent: "#22c55e",
    accentDim: "rgba(34,197,94,0.10)",
    glow: "rgba(34,197,94,0.10)",
    border: "rgba(34,197,94,0.20)",
    label: "// ANDROID SECURITY PATH",
    badgeCompleted: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  },
};

const difficultyConfig: Record<string, string> = {
  Beginner:     "bg-green-500/10 text-green-400 border-green-500/20",
  Intermediate: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Advanced:     "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function LessonsList() {
  const params = useParams<{ pathSlug: string }>();
  const pathSlug = params?.pathSlug;

  const { data: allLessons, isLoading, error } = useLessons();
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

  const lessons = allLessons?.filter(l => l.learningPathSlug === pathSlug) ?? [];
  const completedIds = new Set(
    (progress || []).filter(p => p.resourceType === "lesson").map(p => p.resourceId)
  );
  const completedCount = lessons.filter(l => completedIds.has(l.id)).length;
  const totalCount = lessons.length;
  const pct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const m = MASCOT[pathSlug ?? ""] ?? MASCOT["malware-analysis"];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <Link href="/learn">
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            All Learning Paths
          </button>
        </Link>

        {/* ── HERO HEADER ── */}
        <div
          className="relative overflow-hidden rounded-xl mb-8 border"
          style={{ borderColor: m.border, background: "#0e1220" }}
        >
          {/* Mascot */}
          <div className="absolute right-0 bottom-0 pointer-events-none select-none">
            <img src={m.src} alt="" style={{ height: "220px", opacity: 0.45 }} />
          </div>
          {/* Glow */}
          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 85% 60%, ${m.glow} 0%, transparent 65%)` }} />

          <div className="relative z-10 p-8" style={{ maxWidth: "62%" }}>
            <p className="text-[9px] font-mono tracking-[3px] uppercase mb-2" style={{ color: m.accent }}>
              {m.label}
            </p>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Training Modules</h1>
            <p className="text-sm text-muted-foreground mb-5">
              Select a module to begin your training sequence.
            </p>
            <div className="flex items-center gap-4">
              <div
                className="text-[11px] font-mono px-3 py-1.5 rounded-full border"
                style={{ background: m.accentDim, borderColor: m.border, color: m.accent }}
              >
                {completedCount}/{totalCount} COMPLETED
              </div>
              <div className="flex-1 max-w-[160px] h-[2px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: m.accent }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── MODULE LIST ── */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: m.accent }} />
          </div>
        ) : error ? (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-center">
            Failed to load modules.
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-mono text-sm">No modules yet for this path.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {lessons.map((lesson, idx) => {
              const isCompleted = completedIds.has(lesson.id);
              const diffClass = difficultyConfig[lesson.difficulty ?? "Beginner"] ?? difficultyConfig.Beginner;

              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <Link href={`/lessons/${lesson.id}`}>
                    <div
                      className="group relative rounded-xl p-5 cursor-pointer transition-all duration-200 border overflow-hidden"
                      style={{
                        background: "#0e1220",
                        borderColor: isCompleted ? `${m.accent}33` : "rgba(255,255,255,0.06)",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = `${m.accent}55`;
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = isCompleted ? `${m.accent}33` : "rgba(255,255,255,0.06)";
                      }}
                    >
                      {/* Left accent bar */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-[2px] rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: m.accent }}
                      />

                      <div className="flex items-center gap-4">
                        {/* Number badge */}
                        <div
                          className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm border transition-transform group-hover:scale-105"
                          style={isCompleted
                            ? { background: `${m.accent}18`, borderColor: `${m.accent}44`, color: m.accent }
                            : { background: `${m.accent}0e`, borderColor: `${m.accent}28`, color: m.accent }
                          }
                        >
                          {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : String(idx + 1).padStart(2, "0")}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                              {lesson.category}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                            <Badge variant="outline" className={`text-[10px] font-mono uppercase ${diffClass}`}>
                              {lesson.difficulty}
                            </Badge>
                            {isCompleted && (
                              <Badge variant="outline" className={`text-[10px] font-mono uppercase ${m.badgeCompleted}`}>
                                Completed
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-base font-semibold transition-colors truncate group-hover:text-white">
                            {lesson.title}
                          </h3>
                        </div>

                        <ChevronRight
                          className="flex-shrink-0 w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-all"
                          style={{ color: undefined }}
                          onMouseEnter={() => {}}
                        />
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
