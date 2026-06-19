// ── ACHIEVEMENTS SYSTEM ──────────────────────────────────────
// Pure logic, computed from existing progress data (no new DB tables).
// Mirrors the ranks.ts approach: definitions + helpers, evaluated client-side.

import {
  BookOpen,
  Flag,
  Library,
  Medal,
  Skull,
  Layers,
  Route,
  GraduationCap,
  Trophy,
  Star,
  Zap,
  Crown,
  Award,
  Moon,
  type LucideIcon,
} from "lucide-react";

export type AchievementTier = "common" | "rare" | "epic" | "legendary";

export const TIER_COLOR: Record<AchievementTier, string> = {
  common: "#6b7280",
  rare: "#3b82f6",
  epic: "#a855f7",
  legendary: "#eab308",
};

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tier: AchievementTier;
  /** Hidden (shown as "???") until earned */
  secret?: boolean;
  /** Predicate over computed stats */
  check: (s: AchievementStats) => boolean;
}

export interface AchievementStats {
  modulesCompleted: number;
  totalModules: number;
  flagsCaptured: number;
  totalFlags: number;
  difficultyDone: { easy: number; medium: number; hard: number };
  pathsCompleted: number;
  userXP: number;
  rankLevel: number;
  nightOwl: boolean;
}

// ── Inputs (loosely typed to the fields we actually read) ─────
interface LessonLike {
  id: number;
  learningPathSlug?: string | null;
}
interface ChallengeLike {
  id: number;
  difficulty?: string | null;
  learningPathSlug?: string | null;
}
interface ProgressLike {
  resourceType: string;
  resourceId: number;
  completedAt?: string | null;
}

function bucketDifficulty(d?: string | null): "easy" | "medium" | "hard" {
  switch ((d || "").toLowerCase()) {
    case "easy":
      return "easy";
    case "hard":
    case "advanced":
      return "hard";
    default:
      return "medium";
  }
}

/** Build the stats object the achievement predicates run against. */
export function computeAchievementStats(input: {
  lessons: LessonLike[];
  challenges: ChallengeLike[];
  progress: ProgressLike[];
  userXP: number;
  rankLevel: number;
}): AchievementStats {
  const { lessons, challenges, progress, userXP, rankLevel } = input;

  const completedLessonIds = new Set(
    progress.filter((p) => p.resourceType === "lesson").map((p) => p.resourceId),
  );
  const solvedChallengeIds = new Set(
    progress.filter((p) => p.resourceType === "challenge").map((p) => p.resourceId),
  );

  // Difficulty breakdown of solved challenges
  const difficultyDone = { easy: 0, medium: 0, hard: 0 };
  for (const c of challenges) {
    if (solvedChallengeIds.has(c.id)) difficultyDone[bucketDifficulty(c.difficulty)]++;
  }

  // Path completion (all modules + all flags in a path done)
  const paths = new Map<
    string,
    { modulesDone: number; modulesTotal: number; flagsDone: number; flagsTotal: number }
  >();
  const ensure = (slug: string) => {
    if (!paths.has(slug)) paths.set(slug, { modulesDone: 0, modulesTotal: 0, flagsDone: 0, flagsTotal: 0 });
    return paths.get(slug)!;
  };
  for (const l of lessons) {
    if (!l.learningPathSlug) continue;
    const p = ensure(l.learningPathSlug);
    p.modulesTotal++;
    if (completedLessonIds.has(l.id)) p.modulesDone++;
  }
  for (const c of challenges) {
    if (!c.learningPathSlug) continue;
    const p = ensure(c.learningPathSlug);
    p.flagsTotal++;
    if (solvedChallengeIds.has(c.id)) p.flagsDone++;
  }
  let pathsCompleted = 0;
  for (const p of paths.values()) {
    const modulesOk = p.modulesTotal > 0 && p.modulesDone === p.modulesTotal;
    const flagsOk = p.flagsDone === p.flagsTotal; // ok if path has 0 flags
    if (modulesOk && flagsOk) pathsCompleted++;
  }

  // Night owl: anything completed between 00:00 and 04:59 local time
  const nightOwl = progress.some((p) => {
    if (!p.completedAt) return false;
    const h = new Date(p.completedAt).getHours();
    return h >= 0 && h < 5;
  });

  return {
    modulesCompleted: completedLessonIds.size,
    totalModules: lessons.length,
    flagsCaptured: solvedChallengeIds.size,
    totalFlags: challenges.length,
    difficultyDone,
    pathsCompleted,
    userXP,
    rankLevel,
    nightOwl,
  };
}

// ── DEFINITIONS ──────────────────────────────────────────────
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-module",
    title: "First Steps",
    description: "Complete your first training module.",
    icon: BookOpen,
    tier: "common",
    check: (s) => s.modulesCompleted >= 1,
  },
  {
    id: "first-flag",
    title: "First Blood",
    description: "Capture your first flag.",
    icon: Flag,
    tier: "common",
    check: (s) => s.flagsCaptured >= 1,
  },
  {
    id: "modules-5",
    title: "Bookworm",
    description: "Complete 5 training modules.",
    icon: Library,
    tier: "rare",
    check: (s) => s.modulesCompleted >= 5,
  },
  {
    id: "flags-3",
    title: "Flag Collector",
    description: "Capture 3 flags.",
    icon: Medal,
    tier: "rare",
    check: (s) => s.flagsCaptured >= 3,
  },
  {
    id: "hard-challenge",
    title: "Deep Diver",
    description: "Solve a Hard challenge.",
    icon: Skull,
    tier: "rare",
    check: (s) => s.difficultyDone.hard >= 1,
  },
  {
    id: "trifecta",
    title: "Full Spectrum",
    description: "Solve an Easy, a Medium, and a Hard challenge.",
    icon: Layers,
    tier: "rare",
    check: (s) => s.difficultyDone.easy >= 1 && s.difficultyDone.medium >= 1 && s.difficultyDone.hard >= 1,
  },
  {
    id: "xp-1000",
    title: "Grinder",
    description: "Earn 1,000 XP.",
    icon: Zap,
    tier: "rare",
    check: (s) => s.userXP >= 1000,
  },
  {
    id: "path-complete",
    title: "Pathfinder",
    description: "Fully complete a learning path (all modules + challenges).",
    icon: Route,
    tier: "epic",
    check: (s) => s.pathsCompleted >= 1,
  },
  {
    id: "all-modules",
    title: "Scholar",
    description: "Complete every training module.",
    icon: GraduationCap,
    tier: "epic",
    check: (s) => s.totalModules > 0 && s.modulesCompleted === s.totalModules,
  },
  {
    id: "all-flags",
    title: "Flag Master",
    description: "Capture every flag.",
    icon: Trophy,
    tier: "epic",
    check: (s) => s.totalFlags > 0 && s.flagsCaptured === s.totalFlags,
  },
  {
    id: "rank-4",
    title: "Specialist",
    description: "Reach the Forensic Expert rank.",
    icon: Star,
    tier: "epic",
    check: (s) => s.rankLevel >= 4,
  },
  {
    id: "hundred-percent",
    title: "Perfect Run",
    description: "Complete 100% of all available content.",
    icon: Crown,
    tier: "legendary",
    check: (s) =>
      s.totalModules > 0 &&
      s.modulesCompleted === s.totalModules &&
      s.flagsCaptured === s.totalFlags,
  },
  {
    id: "max-rank",
    title: "Cyber Master",
    description: "Reach the maximum rank.",
    icon: Award,
    tier: "legendary",
    check: (s) => s.rankLevel >= 6,
  },
  {
    id: "night-owl",
    title: "Night Owl",
    description: "Complete something between midnight and 5 AM.",
    icon: Moon,
    tier: "rare",
    secret: true,
    check: (s) => s.nightOwl,
  },
];

export interface EvaluatedAchievement {
  achievement: Achievement;
  earned: boolean;
}

/** Evaluate all achievements against stats. Earned first, then locked. */
export function evaluateAchievements(stats: AchievementStats): {
  all: EvaluatedAchievement[];
  earnedCount: number;
  total: number;
} {
  const evaluated = ACHIEVEMENTS.map((a) => ({ achievement: a, earned: a.check(stats) }));
  evaluated.sort((a, b) => Number(b.earned) - Number(a.earned));
  return {
    all: evaluated,
    earnedCount: evaluated.filter((e) => e.earned).length,
    total: ACHIEVEMENTS.length,
  };
}
