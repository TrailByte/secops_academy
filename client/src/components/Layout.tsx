import { Link, useLocation } from "wouter";
import { Shield, BookOpen, Flag, Menu, X, Info, LogOut } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProgress } from "@/hooks/use-progress";
import { useLessons } from "@/hooks/use-lessons";
import { useChallenges } from "@/hooks/use-challenges";
import { getRank, calcMaxXP } from "@/lib/ranks";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: progress } = useProgress();
  const { data: lessons } = useLessons();
  const { data: challenges } = useChallenges();
  const { user } = useAuth();
  const logout = useLogout();
  const { toast } = useToast();

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
    <div className="relative isolate min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-black">
      <div className="scanline pointer-events-none fixed inset-0 opacity-[0.03]" />
      <div className="grain" />
      <div className="vignette" />
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="w-full px-8 h-16 flex items-center">
          {/* Left — Logo */}
          <div className="flex-1">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer group w-fit">
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <span className="font-display font-bold text-xl tracking-tight group-hover:text-primary transition-colors">
                  SEC<span className="text-primary">OPS</span>_ACADEMY
                </span>
              </div>
            </Link>
          </div>

          {/* Center — Nav links */}
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

          {/* Right — Rank pill + Auth */}
          <div className="flex-1 flex items-center justify-end gap-4">
            <div className="hidden md:flex items-center gap-2.5">
              <img src={rank.badge} alt={rank.gameTitle} className="h-7 w-auto" />
              <div className="flex flex-col">
                <span className="font-mono text-[10px] font-bold tracking-wider leading-none" style={{ color: rank.color }}>
                  {rank.gameTitle}
                </span>
                <span className="font-mono text-[9px] text-muted-foreground/50 leading-none mt-0.5">
                  {userXP} XP
                </span>
              </div>
            </div>
            <div className="hidden md:block w-px h-5 bg-border" />
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <span className="text-xs text-muted-foreground truncate max-w-[140px]">{user.email}</span>
                  <button
                    onClick={() => {
                      if (window.confirm("Sign out of your account?")) {
                        logout.mutate(undefined, {
                          onSuccess: () => {
                            toast({ title: "Signed out", description: "See you next time, agent." });
                            navigate("/introduction");
                          },
                        });
                      }
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <Link href="/login">
                  <span className="text-xs font-medium text-primary hover:underline cursor-pointer">Sign in</span>
                </Link>
              )}
            </div>
            <button
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
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
            <div className="border-t border-border mx-4 pt-3 pb-1">
              {user ? (
                <button
                  onClick={() => {
                    if (window.confirm("Sign out of your account?")) {
                      logout.mutate(undefined, {
                        onSuccess: () => {
                          toast({ title: "Signed out", description: "See you next time, agent." });
                          navigate("/introduction");
                        },
                      });
                      setIsMobileMenuOpen(false);
                    }
                  }}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <LogOut className="w-4 h-4" /> Sign out ({user.email})
                </button>
              ) : (
                <Link href="/login">
                  <span onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-primary cursor-pointer">
                    Sign in
                  </span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="mx-auto px-6 py-8 md:py-12 min-h-[calc(100vh-4rem)] max-w-screen-2xl w-full">
        {children}
      </main>
    </div>
  );
}
