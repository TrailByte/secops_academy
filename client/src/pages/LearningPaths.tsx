import Layout from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { useProgress } from "@/hooks/use-progress";
import { Link } from "wouter";
import {
  Shield, Bug, Smartphone, Network, Lock, Globe,
  ChevronRight, Loader2, BookOpen, Flag, CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import type { LearningPath } from "@shared/schema";

// Map icon name strings to lucide components
const ICONS: Record<string, React.ElementType> = {
  Shield, Bug, Smartphone, Network, Lock, Globe, BookOpen, Flag,
};

// Map color keys to tailwind classes
const COLORS: Record<string, { text: string; bg: string; border: string; glow: string }> = {
  blue:   { text: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/20",   glow: "group-hover:shadow-blue-500/10" },
  green:  { text: "text-green-400",  bg: "bg-green-400/10",  border: "border-green-400/20",  glow: "group-hover:shadow-green-500/10" },
  purple: { text: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20", glow: "group-hover:shadow-purple-500/10" },
  teal:   { text: "text-teal-400",   bg: "bg-teal-400/10",   border: "border-teal-400/20",   glow: "group-hover:shadow-teal-500/10" },
  amber:  { text: "text-amber-400",  bg: "bg-amber-400/10",  border: "border-amber-400/20",  glow: "group-hover:shadow-amber-500/10" },
  red:    { text: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/20",    glow: "group-hover:shadow-red-500/10" },
};

export default function LearningPaths() {
  const { data: paths, isLoading } = useQuery<LearningPath[]>({
    queryKey: ["/api/learning-paths"],
    queryFn: async () => {
      const res = await fetch("/api/learning-paths");
      if (!res.ok) throw new Error("Failed to fetch learning paths");
      return res.json();
    },
  });

  const { data: progress } = useProgress();
  const completedLessonIds = new Set(
    (progress || []).filter(p => p.resourceType === "lesson").map(p => p.resourceId)
  );
  const solvedChallengeIds = new Set(
    (progress || []).filter(p => p.resourceType === "challenge").map(p => p.resourceId)
  );

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">
            Learning Paths
          </h1>
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
              const Icon = ICONS[path.icon] || Shield;
              const color = COLORS[path.color] || COLORS.blue;

              return (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <Link href={`/learn/${path.slug}/lessons`}>
                    <div className={`group bg-card border ${color.border} rounded-xl p-6 cursor-pointer hover:shadow-2xl ${color.glow} transition-all duration-300 hover:-translate-y-1`}>
                      <div className={`w-12 h-12 rounded-xl ${color.bg} ${color.text} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h2 className={`text-2xl font-bold mb-2 group-hover:${color.text} transition-colors`}>
                        {path.title}
                      </h2>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                        {path.description}
                      </p>
                      <div className={`flex items-center gap-2 text-sm font-medium ${color.text}`}>
                        <BookOpen className="w-4 h-4" />
                        <span>View Modules</span>
                        <ChevronRight className="w-4 h-4 ml-auto" />
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
