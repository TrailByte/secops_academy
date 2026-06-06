import { Link, useLocation } from "wouter";
import { Shield, BookOpen, Flag, Menu, X, Info } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProgress } from "@/hooks/use-progress";
import { useLessons } from "@/hooks/use-lessons";
import { useChallenges } from "@/hooks/use-challenges";
import { getRank, calcMaxXP } from "@/lib/ranks";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: progress } = useProgress();
  const { data: lessons } = useLessons();
  const { data: challenges } = useChallenges();

  // Calculate user XP
  const completedLessons = (progress || []).filter(p => p.resourceType === "lesson").length;
  const solvedChallengeIds = new Set((progress || []).filter(p => p.resourceType === "challenge").map(p => p.resourceId));
  const solvedChallenges = (challenges || []).filter(c => solvedChallengeIds.has(c.id));

  let userXP = completedLessons * 100;
  for (const c of solvedChallenges) {
    switch (c.difficulty?.toLowerCase()) {
      case "easy":   userXP += 150; break;
      case "medium": userXP += 300; break;
      case "hard":
      case "advanced": userXP += 500; break;
      default: userXP += 300;
    }
  }

  const maxXP = calcMaxXP(lessons?.length || 14, challenges || []);
  const rank = getRank(userXP, maxXP);

  const navItems = [
    { href: "/", label: "Dashboard", icon: Shield },
    { href: "/introduction", label: "Introduction", icon: Info },
    { href: "/learn", label: "Learning Paths", icon: BookOpen },
    { href: "/challenges", label: "CTF Challenges", icon: Flag },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-black">
      <div className="scanline z-50 pointer-events-none fixed inset-0 opacity-[0.03]" />

      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto px-8 h-14 flex items-center justify-between w-full">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight group-hover:text-primary transition-colors">
                SEC<span className="text-primary">OPS</span>_ACADEMY
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                location === item.href ||
                (item.href === "/learn" && location.startsWith("/learn")) ||
                (item.href === "/challenges" && location.startsWith("/challenges")) ||
                (item.href === "/introduction" && location.startsWith("/introduction"));
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <div className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all cursor-pointer ${
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_10px_-5px_var(--primary)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}>
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Rank pill */}
          <div className="hidden md:flex items-center gap-2.5 ml-4 pl-4 border-l border-border">
            <img
              src={rank.badge}
              alt={rank.gameTitle}
              className="h-8 w-auto"
            />
            <div className="flex flex-col">
              <span className="font-mono text-[10px] font-bold text-muted-foreground tracking-wider leading-none"
                style={{ color: rank.color }}>
                {rank.gameTitle}
              </span>
              <span className="font-mono text-[9px] text-muted-foreground/50 leading-none mt-0.5">
                {userXP} XP
              </span>
            </div>
          </div>

          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-b border-border bg-background overflow-hidden"
          >
            <nav className="flex flex-col p-4 gap-2">
              {navItems.map((item) => {
                const isActive =
                  location === item.href ||
                  (item.href === "/learn" && location.startsWith("/learn")) ||
                  (item.href === "/challenges" && location.startsWith("/challenges")) ||
                  (item.href === "/introduction" && location.startsWith("/introduction"));
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`px-4 py-3 rounded-md text-sm font-medium flex items-center gap-3 transition-colors cursor-pointer ${
                        isActive
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="w-full px-8 py-8 md:py-12 min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  );
}
