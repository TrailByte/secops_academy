import Layout from "@/components/Layout";
import { Link } from "wouter";
import { Shield, Target, Users, Award, ArrowRight, Flag, LayoutDashboard, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { RANKS, XP } from "@/lib/ranks";

export default function Introduction() {
  useEffect(() => {
    localStorage.setItem("seenIntro", "true");
  }, []);

  const outcomes = [
    "Analyze malicious artifacts using static and dynamic techniques to extract Indicators of Compromise",
    "Understand how operating systems isolate processes and enforce security policies at the kernel level",
    "Recognize attacker techniques, evasion strategies, and persistence mechanisms across platforms",
    "Apply hands-on CTF methodology - decode payloads, reverse artifacts, capture flags",
    "Progress from Tier 1 SOC Analyst fundamentals to advanced Threat Hunter capabilities",
  ];

const { data: lessons } = useQuery({
    queryKey: ["/api/lessons"],
    queryFn: async () => { const r = await fetch("/api/lessons"); return r.json() as Promise<Array<{ learningPathSlug: string | null }>>; },
  });
  const { data: challenges } = useQuery({
    queryKey: ["/api/challenges"],
    queryFn: async () => { const r = await fetch("/api/challenges"); return r.json() as Promise<Array<{ learningPathSlug: string | null }>>; },
  });

  const countFor = (slug: string, arr?: Array<{ learningPathSlug: string | null }>) =>
    (arr || []).filter((x) => x.learningPathSlug === slug).length;

  const paths = [
    {
      title: "Malware Analysis",
      slug: "malware-analysis",
      accent: "#e24b4a",
      border: "rgba(226,75,74,0.2)",
      bg: "rgba(226,75,74,0.06)",
      desc: "Static PE analysis, dynamic sandbox behavior, process injection, C2 communication, anti-analysis evasion, and YARA rule writing.",
    },
    {
      title: "Android Security",
      slug: "android-security",
      accent: "#22c55e",
      border: "rgba(34,197,94,0.2)",
      bg: "rgba(34,197,94,0.06)",
      desc: "App Sandbox (Linux UID isolation), runtime permissions, SELinux Mandatory Access Control, and a live incident scenario.",
    },
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto pb-20">

        {/* -- HERO -- */}
        <section className="text-center py-8 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10" />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono mb-6">
            <Shield className="w-3.5 h-3.5" />
            CAPACITY BUILDING PROGRAM
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-6">
            SecOps Academy
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            An interactive <strong className="text-foreground">Capacity Building</strong> platform combining
            theory modules and hands-on CTF challenges. Build defensive security skills,
            earn ranks, and capture flags.
          </motion.p>
        </section>

        {/* -- PURPOSE / AUDIENCE / TYPE -- */}
        <section className="mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: Target, color: "text-blue-400", bg: "bg-blue-400/10", title: "Purpose", desc: "Train security professionals and students in practical defensive security techniques through interactive lessons and real-world CTF-style challenges." },
              { icon: Users, color: "text-green-400", bg: "bg-green-400/10", title: "Target Audience", desc: "Cybersecurity students, junior SOC analysts, aspiring malware researchers, and IT professionals building incident response capabilities." },
              { icon: Award, color: "text-amber-400", bg: "bg-amber-400/10", title: "Game Type", desc: "Capacity Building - developing practical analytical skills through guided theory and hands-on artifact analysis challenges." },
            ].map((card, i) => (
              <motion.div key={card.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="bg-card border border-border rounded-xl p-7">
                <div className={`w-10 h-10 rounded-lg ${card.bg} ${card.color} flex items-center justify-center mb-4`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* -- LEARNING OUTCOMES -- */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            What You Will Achieve
          </h2>
          <div className="space-y-3">
            {outcomes.map((outcome, idx) => (
              <motion.div key={idx}
                initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06 }} viewport={{ once: true }}
                className="flex items-start gap-4 p-4 bg-card border border-border rounded-lg"
              >
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-mono font-bold text-xs border border-primary/20">
                  {idx + 1}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed pt-0.5">{outcome}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* -- LEARNING PATHS -- */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-6">Learning Paths</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {paths.map((path, i) => (
              <motion.div key={path.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                className="relative overflow-hidden bg-card rounded-xl p-7 border"
                style={{ borderColor: path.border }}
              >
                <div className="absolute inset-0" style={{ background: path.bg }} />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: path.accent }} />
                    <h3 className="font-bold text-base" style={{ color: path.accent }}>{path.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{path.desc}</p>
                  <div className="flex gap-3">
                    <span className="font-mono text-[10px] px-2 py-1 rounded border"
                      style={{ color: path.accent, borderColor: path.border, background: "rgba(0,0,0,0.2)" }}>
                      {countFor(path.slug, lessons)} {countFor(path.slug, lessons) === 1 ? "module" : "modules"}
                    </span>
                    <span className="font-mono text-[10px] px-2 py-1 rounded border"
                      style={{ color: path.accent, borderColor: path.border, background: "rgba(0,0,0,0.2)" }}>
                      {countFor(path.slug, challenges)} {countFor(path.slug, challenges) === 1 ? "challenge" : "challenges"}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* -- RANK SYSTEM -- */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-3">Rank System</h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Complete modules and capture flags to earn XP and progress through 7 ranks -
            each corresponding to a real-world security job title.
          </p>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {RANKS.map((rank, idx) => (
              <motion.div key={rank.level}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }} viewport={{ once: true }}
                className="bg-card border border-border rounded-xl p-4 flex flex-col items-center text-center gap-3"
              >
                <img src={rank.badge} alt={rank.gameTitle} className="h-16 w-auto" />
                <div className="font-mono text-[10px] font-bold uppercase leading-tight" style={{ color: rank.color }}>
                  {rank.gameTitle}
                </div>
                <div className="text-[9px] text-muted-foreground leading-tight">
                  {rank.realTitle}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* -- SCORING -- */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-6">Scoring</h2>
          <div className="bg-card border border-border rounded-xl p-7">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 font-mono">
              {[
                { label: "Module Complete", val: `${XP.MODULE_COMPLETE} XP`, color: "text-primary" },
                { label: "Quiz (1st try)", val: `${XP.QUIZ_CORRECT_FIRST_TRY} XP`, color: "text-primary" },
                { label: "Challenge Easy / Med / Hard", val: `${XP.CHALLENGE_EASY} / ${XP.CHALLENGE_MEDIUM} / ${XP.CHALLENGE_HARD} XP`, color: "text-amber-400" },
                { label: "Path Completion Bonus", val: `+${XP.PATH_COMPLETE_BONUS} XP`, color: "text-green-400" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">{item.label}</div>
                  <div className={`text-base font-bold ${item.color}`}>{item.val}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-5 pt-5 border-t border-border">
              Unlimited retries on all challenges. No time limits. Ranks scale automatically as new content is added - you never lose your rank.
            </p>
          </div>
        </section>

        {/* -- CTA -- */}
        <section className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/learn">
              <Button size="lg">
                Begin Training <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/challenges">
              <Button variant="outline" size="lg">
                <Flag className="w-4 h-4 mr-2" /> Jump to Challenges
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="lg">
                <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
              </Button>
            </Link>
          </div>
        </section>

      </div>
    </Layout>
  );
}
