import Layout from "@/components/Layout";
import { useLessons } from "@/hooks/use-lessons";
import { useChallenges } from "@/hooks/use-challenges";
import { useProgress } from "@/hooks/use-progress";
import { Link } from "wouter";
import { BookOpen, Flag, Zap, ChevronRight, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { getRank, getNextRankXP, getRankProgress, calcMaxXP, XP, RANKS } from "@/lib/ranks";

function isNew(createdAt: string | null | undefined): boolean {
  if (!createdAt) return false;
  const diff = Date.now() - new Date(createdAt).getTime();
  return diff < 30 * 24 * 60 * 60 * 1000; // 30 days
}

export default function Home() {
  const { data: lessons }    = useLessons();
  const { data: challenges } = useChallenges();
  const { data: progress }   = useProgress();

  // Progress sets
  const completedLessonIds   = new Set((progress || []).filter(p => p.resourceType === "lesson").map(p => p.resourceId));
  const solvedChallengeIds   = new Set((progress || []).filter(p => p.resourceType === "challenge").map(p => p.resourceId));

  const completedLessons  = completedLessonIds.size;
  const capturedFlags     = solvedChallengeIds.size;
  const totalLessons      = lessons?.length || 0;
  const totalChallenges   = challenges?.length || 0;
  const overallPct        = totalLessons + totalChallenges > 0
    ? Math.round(((completedLessons + capturedFlags) / (totalLessons + totalChallenges)) * 100)
    : 0;

  // XP
  let userXP = completedLessons * XP.MODULE_COMPLETE;
  for (const c of (challenges || []).filter(c => solvedChallengeIds.has(c.id))) {
    switch (c.difficulty?.toLowerCase()) {
      case "easy":     userXP += XP.CHALLENGE_EASY; break;
      case "medium":   userXP += XP.CHALLENGE_MEDIUM; break;
      case "hard":
      case "advanced": userXP += XP.CHALLENGE_HARD; break;
      default:         userXP += XP.CHALLENGE_MEDIUM;
    }
  }

  const maxXP       = calcMaxXP(totalLessons, challenges || []);
  const rank        = getRank(userXP, maxXP);
  const nextRank    = getNextRankXP(userXP, maxXP);
  const rankProg    = getRankProgress(userXP, maxXP);

  // Resume — last incomplete lesson
  const resumeLesson = (lessons || []).find(l => !completedLessonIds.has(l.id));

  // Next challenge — first unsolved
  const nextChallenge = (challenges || []).find(c => !solvedChallengeIds.has(c.id));

  // New content (< 30 days)
  const newLessons    = (lessons    || []).filter(l => isNew((l as any).createdAt));
  const newChallenges = (challenges || []).filter(c => isNew((c as any).createdAt));
  const newItems      = [
    ...newLessons.map(l => ({ title: l.title, sub: `Module · ${l.category}`, color: "#e24b4a", type: "module" })),
    ...newChallenges.map(c => ({ title: c.title, sub: `Challenge · ${c.difficulty}`, color: "#f59e0b", type: "challenge" })),
  ].slice(0, 4);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">

        {/* ── BRIEFING ── */}
        <div className="flex items-start justify-between gap-6 pb-6 mb-6 border-b border-border">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-mono tracking-widest mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              SYSTEM ONLINE
            </div>
            <p className="font-mono text-[11px] text-muted-foreground/60 tracking-wide mb-2">
              // <span className="text-muted-foreground">Train your defensive instincts. Hunt threats. Defend the perimeter.</span>
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              An interactive training platform combining{" "}
              <span className="text-foreground font-medium">theory modules</span> and hands-on{" "}
              <span className="text-foreground font-medium">CTF challenges</span>. Build your skills, earn ranks, and capture flags.
            </p>
          </div>

          {/* New content panel */}
          {newItems.length > 0 && (
            <div className="flex-shrink-0 w-56 bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">New Content</span>
                <span className="font-mono text-[9px] text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                  {newItems.length} NEW
                </span>
              </div>
              <div className="space-y-2.5">
                {newItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{item.title}</div>
                      <div className="font-mono text-[9px] text-muted-foreground/60 mt-0.5">{item.sub}</div>
                    </div>
                    <span className="font-mono text-[8px] text-primary border border-primary/30 bg-primary/8 px-1.5 py-0.5 rounded flex-shrink-0">NEW</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RANK ── */}
        <div className="bg-card border border-border rounded-xl p-5 mb-4 flex items-center gap-5">
          <img src={rank.badge} alt={rank.gameTitle} className="h-16 w-auto flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Current Rank</div>
            <div className="font-display text-xl font-bold mb-0.5" style={{ color: rank.color }}>
              {rank.gameTitle}
            </div>
            <div className="text-xs text-muted-foreground mb-3">{rank.realTitle}</div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: rank.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${rankProg * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <span className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                {userXP} XP {nextRank ? `→ ${nextRank.rank.gameTitle}` : "· MAX RANK"}
              </span>
            </div>
            {nextRank && (
              <div className="font-mono text-[9px] text-muted-foreground/60 mt-1.5">
                {nextRank.xpNeeded} XP to next rank
              </div>
            )}
          </div>

          {/* Mini rank strip */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0 pl-5 border-l border-border">
            {[0, 1, 2].map((offset) => {
              const lvl = rank.level + offset;
              if (lvl > 6) return null;
              const r = RANKS[lvl];
              return (
                <div key={lvl} className="flex flex-col items-center gap-1">
                  <img
                    src={r.badge}
                    alt={r.gameTitle}
                    className="h-8 w-auto transition-opacity"
                    style={{ opacity: offset === 0 ? 1 : offset === 1 ? 0.4 : 0.15 }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { label: "Modules", val: completedLessons, total: totalLessons, color: "#22c55e" },
            { label: "Flags", val: capturedFlags, total: totalChallenges, color: "#f59e0b" },
            { label: "XP", val: userXP, total: null, color: "#8b78e6" },
            { label: "Overall", val: overallPct, total: null, color: "#22c55e", suffix: "%" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-4"
            >
              <div className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground mb-2">{s.label}</div>
              <div className="font-display text-xl font-bold" style={{ color: s.color }}>
                {s.val}{s.suffix || ""}
                {s.total !== null && (
                  <span className="text-sm font-normal text-muted-foreground/50">/{s.total}</span>
                )}
              </div>
              <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    background: s.color,
                    width: s.total ? `${(s.val / s.total) * 100}%` : s.suffix ? `${s.val}%` : `${Math.min((s.val / (maxXP || 1)) * 100, 100)}%`
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── RESUME + CHALLENGE ── */}
        <div className="grid grid-cols-2 gap-4">
          {/* Resume */}
          <div className="relative bg-card border border-border rounded-xl p-5 overflow-hidden"
            style={{ borderColor: "rgba(226,75,74,0.2)" }}>
            <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl bg-[#e24b4a]" />
            <div className="font-mono text-[9px] uppercase tracking-widest text-[#e24b4a] mb-2">↳ Resume</div>
            {resumeLesson ? (
              <>
                <div className="text-sm font-semibold mb-1">{resumeLesson.title}</div>
                <div className="text-xs text-muted-foreground mb-4">{resumeLesson.category} · {resumeLesson.difficulty}</div>
                <Link href={`/lessons/${resumeLesson.id}`}>
                  <div className="inline-flex items-center gap-2 font-mono text-[10px] text-[#e24b4a] border border-[rgba(226,75,74,0.3)] bg-[rgba(226,75,74,0.08)] px-3 py-1.5 rounded cursor-pointer hover:bg-[rgba(226,75,74,0.15)] transition-colors">
                    CONTINUE <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              </>
            ) : (
              <div className="text-xs text-muted-foreground">All modules completed! 🎉</div>
            )}
          </div>

          {/* Next challenge */}
          <div className="relative bg-card border border-border rounded-xl p-5 overflow-hidden"
            style={{ borderColor: "rgba(245,158,11,0.2)" }}>
            <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl bg-[#f59e0b]" />
            <div className="font-mono text-[9px] uppercase tracking-widest text-[#f59e0b] mb-2">↳ Next Challenge</div>
            {nextChallenge ? (
              <>
                <div className="text-sm font-semibold mb-1">{nextChallenge.title}</div>
                <div className="text-xs text-muted-foreground mb-3">{nextChallenge.category}</div>
                <div className="mb-4">
                  <span className="font-mono text-[9px] text-[#f59e0b] border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.08)] px-2 py-0.5 rounded uppercase">
                    {nextChallenge.difficulty}
                  </span>
                </div>
                <Link href={`/challenges/${nextChallenge.id}`}>
                  <div className="inline-flex items-center gap-2 font-mono text-[10px] text-[#f59e0b] border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.08)] px-3 py-1.5 rounded cursor-pointer hover:bg-[rgba(245,158,11,0.15)] transition-colors">
                    START ANALYSIS <Zap className="w-3 h-3" />
                  </div>
                </Link>
              </>
            ) : (
              <div className="text-xs text-muted-foreground">All challenges solved! 🏆</div>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
}
