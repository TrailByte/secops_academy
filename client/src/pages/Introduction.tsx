import Layout from "@/components/Layout";
import { useLessons } from "@/hooks/use-lessons";
import { useChallenges } from "@/hooks/use-challenges";
import { useProgress } from "@/hooks/use-progress";
import { Link } from "wouter";
import { Shield, Target, Users, BookOpen, Flag, Award, ArrowRight, Clock, Lightbulb, RotateCcw, Zap, CheckCircle2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const POINTS = {
  lessonComplete: 100,
  quizCorrect: 50,
  challengeEasy: 200,
  challengeMedium: 350,
  challengeHard: 500,
  hintPenalty: -50,
};

export default function Introduction() {
  const { data: lessons } = useLessons();
  const { data: challenges } = useChallenges();
  const { data: progress } = useProgress();

  const completedLessons = (progress || []).filter(p => p.resourceType === 'lesson').length;
  const capturedFlags = (progress || []).filter(p => p.resourceType === 'challenge').length;
  const totalLessons = lessons?.length || 0;
  const totalChallenges = challenges?.length || 0;

  const learningOutcomes = [
    "Identify and classify different types of malware (viruses, trojans, ransomware, rootkits) and their behavior patterns",
    "Perform static analysis on suspicious binaries using strings extraction, PE header inspection, and YARA rules",
    "Conduct dynamic analysis in sandboxed environments to observe runtime behavior, network callbacks, and persistence mechanisms",
    "Recognize and bypass common anti-analysis techniques (anti-debugging, anti-VM, obfuscation)",
    "Analyze real-world artifacts to extract Indicators of Compromise (IoCs) and write detection signatures",
  ];

  const rules = [
    { icon: BookOpen, title: "Training Modules", desc: "Complete lessons at your own pace. Each module covers essential concepts with embedded knowledge-check quizzes.", points: `${POINTS.lessonComplete} pts per module` },
    { icon: Flag, title: "CTF Challenges", desc: "Analyze artifacts, decode payloads, and submit flags. Points vary by difficulty. Unlimited retries allowed.", points: "200-500 pts each" },
    { icon: Lightbulb, title: "Hints", desc: "Each challenge includes hints you can reveal if stuck. Using a hint deducts points from that challenge.", points: `${POINTS.hintPenalty} pts per hint` },
    { icon: Target, title: "Quizzes", desc: "Each lesson has embedded multiple-choice questions. Correct answers earn bonus points.", points: `${POINTS.quizCorrect} pts each` },
    { icon: RotateCcw, title: "Retries", desc: "You can retry challenges as many times as needed. Only the first successful submission counts for scoring.", points: "Unlimited" },
    { icon: Clock, title: "No Time Limit", desc: "There is no time pressure. Take as long as you need to analyze each artifact thoroughly.", points: "Self-paced" },
  ];

  const roadmap = [
    { phase: "Phase 1", title: "Core Concepts", modules: "Modules 01-03", desc: "Foundations of malware analysis, IoC categories, and malware taxonomy. This is your prerequisite knowledge.", color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20" },
    { phase: "Phase 2", title: "Analysis Methods", modules: "Modules 04-05", desc: "Static and dynamic analysis methodologies. Tools, workflows, and techniques.", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
    { phase: "Phase 3", title: "Advanced Techniques", modules: "Modules 06-08", desc: "Anti-analysis evasion, process injection, and lab setup for safe analysis.", color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
    { phase: "Phase 4", title: "Practical Application", modules: "Modules 09-10 + CTF", desc: "Obfuscation, C2 communication, and hands-on CTF challenges using real-world artifacts.", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  ];

  return (
    <Layout>
      <div className="max-w-5xl mx-auto pb-20">
        <section className="text-center py-12 md:py-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono mb-6"
          >
            <Shield className="w-3.5 h-3.5" />
            CAPACITY BUILDING PROGRAM
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-6"
            data-testid="text-intro-title"
          >
            SecOps Academy
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8"
          >
            An interactive <strong className="text-foreground">Capacity Building</strong> platform for malware analysis training.
            Master the skills needed to analyze, detect, and defend against malicious software through structured lessons and hands-on CTF challenges.
          </motion.p>
        </section>

        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-blue-400/10 text-blue-400 flex items-center justify-center mb-4">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg mb-2">Purpose</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Train security professionals and students in practical malware analysis techniques through interactive lessons and real-world CTF-style challenges.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-green-400/10 text-green-400 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg mb-2">Target Audience</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Cybersecurity students, junior SOC analysts, aspiring malware researchers, and IT professionals looking to build incident response capabilities.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg mb-2">Game Type</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Capacity Building</strong> &mdash; focused on developing practical analytical skills through guided theory and hands-on artifact analysis challenges.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-primary" />
            What You Will Achieve
          </h2>
          <div className="space-y-4">
            {learningOutcomes.map((outcome, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                viewport={{ once: true }}
                className="flex items-start gap-4 p-4 bg-card border border-border rounded-lg"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-mono font-bold text-sm border border-primary/20">
                  {idx + 1}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed pt-1" data-testid={`text-outcome-${idx}`}>
                  {outcome}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <Zap className="w-6 h-6 text-amber-400" />
            Learning Roadmap
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roadmap.map((phase, idx) => (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className={`p-6 rounded-xl border ${phase.border} bg-card/50`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="outline" className={`text-[10px] font-mono font-bold uppercase ${phase.bg} ${phase.color} ${phase.border}`}>
                    {phase.phase}
                  </Badge>
                  <span className="text-xs font-mono text-muted-foreground">{phase.modules}</span>
                </div>
                <h3 className={`text-lg font-bold mb-2 ${phase.color}`}>{phase.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{phase.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
            Rules & Scoring
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rules.map((rule, idx) => (
              <motion.div
                key={rule.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                viewport={{ once: true }}
                className="bg-card border border-border rounded-xl p-5"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <rule.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{rule.title}</h4>
                    <span className="text-[10px] font-mono text-primary">{rule.points}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{rule.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-xl">
            <h3 className="font-bold text-lg mb-4 text-primary">Scoring Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-sm">
              <div>
                <div className="text-muted-foreground text-xs mb-1">Module Completion</div>
                <div className="text-foreground font-bold">{POINTS.lessonComplete} pts</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs mb-1">Quiz (Correct)</div>
                <div className="text-foreground font-bold">{POINTS.quizCorrect} pts</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs mb-1">CTF (Easy/Med/Hard)</div>
                <div className="text-foreground font-bold">{POINTS.challengeEasy}/{POINTS.challengeMedium}/{POINTS.challengeHard}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs mb-1">Hint Penalty</div>
                <div className="text-red-400 font-bold">{POINTS.hintPenalty} pts</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4 font-mono">
              Your score on the dashboard reflects module completions and CTF solves. Quiz bonuses and hint penalties are tracked per challenge.
            </p>
          </div>
        </section>

        <section className="mb-16">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-bold text-lg mb-4">Your Current Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-sm">
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="text-muted-foreground text-xs mb-1">MODULES</div>
                <div className="text-xl font-bold text-primary">{completedLessons}/{totalLessons}</div>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="text-muted-foreground text-xs mb-1">FLAGS CAPTURED</div>
                <div className="text-xl font-bold text-amber-500">{capturedFlags}/{totalChallenges}</div>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="text-muted-foreground text-xs mb-1">COMPLETION</div>
                <div className="text-xl font-bold text-green-500">
                  {totalLessons + totalChallenges > 0
                    ? Math.round(((completedLessons + capturedFlags) / (totalLessons + totalChallenges)) * 100)
                    : 0}%
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/lessons">
              <Button size="lg" data-testid="button-begin-training">
                Begin Training
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/challenges">
              <Button variant="outline" size="lg" data-testid="button-goto-challenges">
                <Flag className="w-4 h-4 mr-2" />
                Jump to Challenges
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
