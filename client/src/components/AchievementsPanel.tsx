import { useMemo } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useLessons } from "@/hooks/use-lessons";
import { useChallenges } from "@/hooks/use-challenges";
import { useProgress } from "@/hooks/use-progress";
import {
  computeAchievementStats,
  evaluateAchievements,
  TIER_COLOR,
  type EvaluatedAchievement,
} from "@/lib/achievements";

interface AchievementsPanelProps {
  userXP: number;
  rankLevel: number;
}

export default function AchievementsPanel({ userXP, rankLevel }: AchievementsPanelProps) {
  const { data: lessons } = useLessons();
  const { data: challenges } = useChallenges();
  const { data: progress } = useProgress();

  const { all, earnedCount, total } = useMemo(() => {
    const stats = computeAchievementStats({
      lessons: (lessons || []) as any,
      challenges: (challenges || []) as any,
      progress: (progress || []) as any,
      userXP,
      rankLevel,
    });
    return evaluateAchievements(stats);
  }, [lessons, challenges, progress, userXP, rankLevel]);

  const pct = total > 0 ? Math.round((earnedCount / total) * 100) : 0;

  return (
    <div className="bg-card border border-border rounded-xl p-6 mb-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
            Achievements
          </div>
          <div className="font-display text-xl font-bold">
            {earnedCount}
            <span className="text-sm font-normal text-muted-foreground/50">/{total} unlocked</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3 w-48">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          </div>
          <span className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">{pct}%</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {all.map((item, i) => (
          <AchievementTile key={item.achievement.id} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}

function AchievementTile({ item, index }: { item: EvaluatedAchievement; index: number }) {
  const { achievement, earned } = item;
  const color = TIER_COLOR[achievement.tier];
  const Icon = achievement.icon;
  const hidden = achievement.secret && !earned;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.4) }}
      className={`relative rounded-lg border p-3.5 flex items-start gap-3 overflow-hidden transition-colors ${
        earned ? "" : "border-border"
      }`}
      style={
        earned
          ? {
              borderColor: `${color}55`,
              background: `${color}0d`,
              boxShadow: `0 0 0 1px ${color}22, 0 0 18px -8px ${color}`,
            }
          : undefined
      }
    >
      {/* Icon */}
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-md flex items-center justify-center ${
          earned ? "" : "bg-muted text-muted-foreground"
        }`}
        style={earned ? { background: `${color}1a`, color } : undefined}
      >
        {hidden ? <Lock className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div
          className={`text-sm font-semibold leading-tight truncate ${
            earned ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          {hidden ? "???" : achievement.title}
        </div>
        <div className="text-[11px] text-muted-foreground/70 leading-snug mt-0.5 line-clamp-2">
          {hidden ? "Hidden achievement." : achievement.description}
        </div>
        <div
          className={`font-mono text-[8px] uppercase tracking-widest mt-1.5 ${
            earned ? "" : "text-muted-foreground/50"
          }`}
          style={earned ? { color } : undefined}
        >
          {achievement.tier}
        </div>
      </div>

      {!earned && !hidden && (
        <Lock className="absolute top-2 right-2 w-3 h-3 text-muted-foreground/40" />
      )}
    </motion.div>
  );
}
