import Layout from "@/components/Layout";
import { useLessons } from "@/hooks/use-lessons";
import { useProgress } from "@/hooks/use-progress";
import { Link, useRoute } from "wouter";
import { BookOpen, ChevronRight, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { LearningPath } from "@shared/schema";

const difficultyConfig: Record<string, { className: string }> = {
  Beginner:     { className: "bg-green-500/10 text-green-400 border-green-500/20" },
  Intermediate: { className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  Advanced:     { className: "bg-red-500/10 text-red-400 border-red-500/20" },
};

export default function LessonsList() {
  const [, params] = useRoute("/learn/:pathSlug/lessons");
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

  // Filter lessons for this learning path
  const lessons = allLessons?.filter(l => l.learningPathSlug === pathSlug) ?? [];

  const completedLessonIds = new Set(
    (progress || []).filter(p => p.resourceType === "lesson").map(p => p.resourceId)
  );

  const completedCount = lessons.filter(l => completedLessonIds.has(l.id)).length;
  const totalCount = lessons.length;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link href="/learn">
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            All Learning Paths
          </button>
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <p className="text-xs font-mono text-primary uppercase tracking-widest mb-2">
              {path?.title ?? pathSlug}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight mb-2">
              Training Modules
            </h1>
            <p className="text-muted-foreground">Select a module to begin your training sequence.</p>
          </div>
          <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-mono shrink-0">
            {completedCount}/{totalCount} COMPLETED
          </div>
        </div>

        {completedCount > 0 && totalCount > 0 && (
          <div className="mb-8">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / totalCount) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-center">
            Failed to load modules. Please refresh.
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-mono text-sm">No modules yet for this path.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson, idx) => {
              const isCompleted = completedLessonIds.has(lesson.id);
              const diff = difficultyConfig[lesson.difficulty ?? "Beginner"] ?? difficultyConfig.Beginner;

              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link href={`/lessons/${lesson.id}`}>
                    <div className={`group relative bg-card hover:bg-card/80 border rounded-xl p-6 transition-all cursor-pointer overflow-hidden ${
                      isCompleted ? "border-green-500/30" : "border-border hover:border-primary/50"
                    }`}>
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-mono font-bold text-lg border transition-transform group-hover:scale-105 ${
                          isCompleted
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-primary/10 text-primary border-primary/20"
                        }`}>
                          {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : String(idx + 1).padStart(2, "0")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                              {lesson.category}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                            <Badge variant="outline" className={`text-[10px] font-mono uppercase ${diff.className}`}>
                              {lesson.difficulty}
                            </Badge>
                            {isCompleted && (
                              <Badge variant="outline" className="text-[10px] font-mono uppercase bg-green-500/10 text-green-400 border-green-500/20">
                                Completed
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-xl font-bold group-hover:text-primary transition-colors truncate">
                            {lesson.title}
                          </h3>
                        </div>
                        <ChevronRight className="self-center w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
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
