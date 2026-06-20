// ── RANK SYSTEM ──────────────────────────────────────────────
// Ranks scale dynamically based on total available XP in the platform.
// Thresholds are percentages of max possible XP.
// Users NEVER lose their rank when new content is added.

export const RANKS = [
  {
    level: 0,
    gameTitle: "ROOKIE",
    realTitle: "Cybersecurity Intern",
    badge: "/images/ranks/rookie.png",
    color: "#6b7280",
    pctThreshold: 0,
  },
  {
    level: 1,
    gameTitle: "CYBER ANALYST",
    realTitle: "Tier 1 SOC Analyst",
    badge: "/images/ranks/cyber_analyst.png",
    color: "#22c55e",
    pctThreshold: 0.10,
  },
  {
    level: 2,
    gameTitle: "INCIDENT HANDLER",
    realTitle: "Tier 2 SOC Analyst",
    badge: "/images/ranks/incident_handler.png",
    color: "#106bac",
    pctThreshold: 0.20,
  },
  {
    level: 3,
    gameTitle: "THREAT HUNTER",
    realTitle: "Threat Hunter",
    badge: "/images/ranks/threat_hunter.png",
    color: "#ad4730",
    pctThreshold: 0.35,
  },
  {
    level: 4,
    gameTitle: "FORENSIC INVESTIGATOR",
    realTitle: "DFIR Analyst",
    badge: "/images/ranks/forensic_investigator.png",
    color: "#f97316",
    pctThreshold: 0.55,
  },
  {
    level: 5,
    gameTitle: "FORENSIC EXPERT",
    realTitle: "Lead DFIR",
    badge: "/images/ranks/forensic_expert.png",
    color: "#a855f7",
    pctThreshold: 0.75,
  },
  {
    level: 6,
    gameTitle: "CYBER MASTER",
    realTitle: "Head of Cyber Defense",
    badge: "/images/ranks/cyber_master.png",
    color: "#eab308",
    pctThreshold: 1.0,
  },
] as const;

// ── XP VALUES ────────────────────────────────────────────────
export const XP = {
  MODULE_COMPLETE: 100,
  QUIZ_CORRECT_FIRST_TRY: 25,
  QUIZ_CORRECT_RETRY: 10,
  CHALLENGE_EASY: 150,
  CHALLENGE_MEDIUM: 300,
  CHALLENGE_HARD: 500,
  PATH_COMPLETE_BONUS: 1000,
  STREAK_7_DAY_BONUS: 200,
} as const;

// ── HELPERS ──────────────────────────────────────────────────

/** Calculate max possible XP given platform content */
export function calcMaxXP(totalModules: number, challenges: Array<{ difficulty: string }>) {
  const moduleXP = totalModules * XP.MODULE_COMPLETE;
  const quizXP = totalModules * 2 * XP.QUIZ_CORRECT_FIRST_TRY; // avg 2 quizzes per module
  const challengeXP = challenges.reduce((sum, c) => {
    switch (c.difficulty.toLowerCase()) {
      case "easy":   return sum + XP.CHALLENGE_EASY;
      case "medium": return sum + XP.CHALLENGE_MEDIUM;
      case "hard":
      case "advanced": return sum + XP.CHALLENGE_HARD;
      default: return sum + XP.CHALLENGE_MEDIUM;
    }
  }, 0);
  const pathBonus = 2 * XP.PATH_COMPLETE_BONUS; // 2 paths currently
  return moduleXP + quizXP + challengeXP + pathBonus;
}

/** Get current rank based on user XP and current max XP */
export function getRank(userXP: number, maxXP: number) {
  const pct = maxXP > 0 ? userXP / maxXP : 0;
  // Find highest rank threshold user has surpassed
  let rank: typeof RANKS[number] = RANKS[0];
  for (const r of RANKS) {
    if (pct >= r.pctThreshold) rank = r;
  }
  return rank;
}

/** Get XP needed for next rank */
export function getNextRankXP(userXP: number, maxXP: number) {
  const pct = maxXP > 0 ? userXP / maxXP : 0;
  const nextRank = RANKS.find(r => r.pctThreshold > pct);
  if (!nextRank) return null; // already max rank
  return {
    rank: nextRank,
    xpNeeded: Math.ceil(nextRank.pctThreshold * maxXP) - userXP,
    xpRequired: Math.ceil(nextRank.pctThreshold * maxXP),
  };
}

/** Progress percentage within current rank (0-1) */
export function getRankProgress(userXP: number, maxXP: number) {
  const currentRank = getRank(userXP, maxXP);
  const nextRankData = getNextRankXP(userXP, maxXP);
  if (!nextRankData) return 1; // max rank

  const currentThresholdXP = Math.ceil(currentRank.pctThreshold * maxXP);
  const nextThresholdXP = nextRankData.xpRequired;
  const rangeXP = nextThresholdXP - currentThresholdXP;
  const progressXP = userXP - currentThresholdXP;

  return rangeXP > 0 ? Math.min(progressXP / rangeXP, 1) : 0;
}
