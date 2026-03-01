import Layout from "@/components/Layout";
import { useLessons } from "@/hooks/use-lessons";
import { useChallenges } from "@/hooks/use-challenges";
import { useProgress } from "@/hooks/use-progress";
import { Link } from "wouter";
import { Shield, Lock, Activity, ArrowRight, Flag, BookOpen, CheckCircle2, Award, Info } from "lucide-react";
import { motion } from "framer-motion";
import { GlitchHeading } from "@/components/GlitchHeading";
import { Button } from "@/components/ui/button";

const POINTS = {
  lessonComplete: 100,
  challengeEasy: 200,
  challengeMedium: 350,
  challengeHard: 500,
};

function calculateScore(
  completedLessons: number,
  solvedChallenges: Array<{ difficulty: string }>
) {
  let score = completedLessons * POINTS.lessonComplete;
  for (const ch of solvedChallenges) {
    switch (ch.difficulty.toLowerCase()) {
      case 'easy': score += POINTS.challengeEasy; break;
      case 'medium': score += POINTS.challengeMedium; break;
      case 'hard': case 'advanced': score += POINTS.challengeHard; break;
      default: score += POINTS.challengeMedium;
    }
  }
  return score;
}

export default function Home() {
  const { data: lessons } = useLessons();
  const { data: challenges } = useChallenges();
  const { data: progress } = useProgress();

  const completedLessons = (progress || []).filter(p => p.resourceType === 'lesson').length;
  const solvedChallengeIds = new Set(
    (progress || []).filter(p => p.resourceType === 'challenge').map(p => p.resourceId)
  );
  const capturedFlags = solvedChallengeIds.size;
  const totalLessons = lessons?.length || 0;
  const totalChallenges = challenges?.length || 0;

  const solvedChallenges = (challenges || []).filter(c => solvedChallengeIds.has(c.id));
  const score = calculateScore(completedLessons, solvedChallenges);

  const maxScore =
    totalLessons * POINTS.lessonComplete +
    (challenges || []).reduce((sum, ch) => {
      switch (ch.difficulty.toLowerCase()) {
        case 'easy': return sum + POINTS.challengeEasy;
        case 'medium': return sum + POINTS.challengeMedium;
        case 'hard': case 'advanced': return sum + POINTS.challengeHard;
        default: return sum + POINTS.challengeMedium;
      }
    }, 0);

  const features = [
    {
      icon: Shield,
      title: "Static Analysis",
      description: "Learn to analyze malware without executing it. Master PE headers, strings extraction, and YARA rules.",
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      border: "border-blue-400/20"
    },
    {
      icon: Activity,
      title: "Dynamic Analysis",
      description: "Run malware in sandboxed environments. Monitor behavior, network traffic, and file system changes.",
      color: "text-green-400",
      bg: "bg-green-400/10",
      border: "border-green-400/20"
    },
    {
      icon: Lock,
      title: "Advanced Techniques",
      description: "Process injection, anti-analysis evasion, C2 communication, and network forensics.",
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      border: "border-purple-400/20"
    }
  ];

  return (
    <Layout>
      <section className="relative py-12 md:py-24 overflow-hidden">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8 z-10 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-medium tracking-wide" data-testid="text-system-status">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            SYSTEM ONLINE // READY FOR INSTRUCTION
          </div>

          <GlitchHeading
            text="MASTER THE ART OF MALWARE ANALYSIS"
            className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent"
          />

          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
            An interactive platform designed for security researchers. Learn to dissect malicious code, understand attack vectors, and defend critical systems.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/introduction">
              <Button size="lg" data-testid="button-start-learning">
                <Info className="w-4 h-4 mr-2" />
                Read Introduction
              </Button>
            </Link>
            <Link href="/lessons">
              <Button variant="secondary" size="lg" data-testid="button-goto-lessons">
                Start Learning
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/challenges">
              <Button variant="outline" size="lg" data-testid="button-view-challenges">
                <Flag className="w-4 h-4 mr-2" />
                CTF Challenges
              </Button>
            </Link>
          </div>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
      </section>

      <section className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-mono text-sm">
          <div className="bg-card border border-border p-6 rounded-lg" data-testid="card-stat-modules">
            <div className="text-muted-foreground mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> MODULES
            </div>
            <div className="text-2xl font-bold text-primary">{completedLessons}/{totalLessons} COMPLETED</div>
            {totalLessons > 0 && (
              <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(completedLessons / totalLessons) * 100}%` }} />
              </div>
            )}
          </div>
          <div className="bg-card border border-border p-6 rounded-lg" data-testid="card-stat-flags">
            <div className="text-muted-foreground mb-2 flex items-center gap-2">
              <Flag className="w-4 h-4" /> FLAGS CAPTURED
            </div>
            <div className="text-2xl font-bold text-amber-500">{capturedFlags}/{totalChallenges} SOLVED</div>
            {totalChallenges > 0 && (
              <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${(capturedFlags / totalChallenges) * 100}%` }} />
              </div>
            )}
          </div>
          <div className="bg-card border border-border p-6 rounded-lg" data-testid="card-stat-score">
            <div className="text-muted-foreground mb-2 flex items-center gap-2">
              <Award className="w-4 h-4" /> SCORE
            </div>
            <div className="text-2xl font-bold text-purple-400">{score.toLocaleString()} PTS</div>
            {maxScore > 0 && (
              <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-purple-400 rounded-full transition-all" style={{ width: `${(score / maxScore) * 100}%` }} />
              </div>
            )}
          </div>
          <div className="bg-card border border-border p-6 rounded-lg" data-testid="card-stat-overall">
            <div className="text-muted-foreground mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> OVERALL PROGRESS
            </div>
            <div className="text-2xl font-bold text-green-500">
              {totalLessons + totalChallenges > 0
                ? Math.round(((completedLessons + capturedFlags) / (totalLessons + totalChallenges)) * 100)
                : 0}% COMPLETE
            </div>
            {(totalLessons + totalChallenges) > 0 && (
              <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${((completedLessons + capturedFlags) / (totalLessons + totalChallenges)) * 100}%` }} />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24">
        <h2 className="text-3xl font-bold mb-12 text-center">TRAINING MODULES</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className={`p-6 rounded-xl border ${feature.border} bg-card/50 hover:bg-card transition-all group`}
            >
              <div className={`w-12 h-12 rounded-lg ${feature.bg} ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
