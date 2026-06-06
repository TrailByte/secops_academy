import Layout from "@/components/Layout";
import { useLesson, useLessonQuizzes, useQuizAnswers, useSubmitQuizAnswer } from "@/hooks/use-lessons";
import { useProgress, useMarkComplete } from "@/hooks/use-progress";
import { useRoute, Link } from "wouter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2, ArrowLeft, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { CodeBlock } from "@/components/CodeBlock";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { playCompletionSound } from "@/lib/sounds";

const difficultyConfig: Record<string, { className: string }> = {
  Beginner:     { className: "bg-green-500/10 text-green-400 border-green-500/20" },
  Intermediate: { className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  Advanced:     { className: "bg-red-500/10 text-red-400 border-red-500/20" },
};

const PATH_THEME: Record<string, { accent: string; accentDim: string; border: string; backHref: string; backLabel: string }> = {
  "malware-analysis": {
    accent: "#e24b4a", accentDim: "rgba(226,75,74,0.10)", border: "rgba(226,75,74,0.20)",
    backHref: "/learn/malware-analysis/lessons", backLabel: "Malware Analysis Modules",
  },
  "android-security": {
    accent: "#22c55e", accentDim: "rgba(34,197,94,0.10)", border: "rgba(34,197,94,0.20)",
    backHref: "/learn/android-security/lessons", backLabel: "Android Security Modules",
  },
};

const DEFAULT_THEME = PATH_THEME["malware-analysis"];

export default function LessonDetail() {
  const [, params] = useRoute("/lessons/:id");
  const id = Number(params?.id);
  const { toast } = useToast();

  const { data: lesson, isLoading: lessonLoading } = useLesson(id);
  const { data: quizzes, isLoading: quizzesLoading } = useLessonQuizzes(id);
  const { data: savedAnswers, isLoading: answersLoading } = useQuizAnswers(id);
  const { data: progress } = useProgress();
  const markComplete = useMarkComplete();
  const submitQuizAnswer = useSubmitQuizAnswer(id);

  const isCompleted = (progress || []).some(p => p.resourceType === 'lesson' && p.resourceId === id);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState<Record<number, boolean>>({});

  // derive theme from lesson's learningPathSlug
  const theme = lesson?.learningPathSlug
    ? (PATH_THEME[lesson.learningPathSlug] ?? DEFAULT_THEME)
    : DEFAULT_THEME;

  const savedAnswerMap = useMemo(() => {
    const map: Record<number, { selectedAnswer: number; isCorrect: boolean }> = {};
    if (savedAnswers) {
      for (const a of savedAnswers) map[a.quizId] = { selectedAnswer: a.selectedAnswer, isCorrect: a.isCorrect };
    }
    return map;
  }, [savedAnswers]);

  useEffect(() => {
    if (savedAnswers && savedAnswers.length > 0) {
      const answers: Record<number, number> = {};
      const results: Record<number, boolean> = {};
      for (const a of savedAnswers) { answers[a.quizId] = a.selectedAnswer; results[a.quizId] = true; }
      setSelectedAnswers(prev => ({ ...answers, ...prev }));
      setShowResults(prev => ({ ...results, ...prev }));
    }
  }, [savedAnswers]);

  const handleSelectOption = (quizId: number, optionIdx: number) => {
    if (showResults[quizId] || savedAnswerMap[quizId]) return;
    setSelectedAnswers(prev => ({ ...prev, [quizId]: optionIdx }));
  };

  const handleSubmitQuiz = (quizId: number) => {
    const selected = selectedAnswers[quizId];
    if (selected === undefined || !quizzes) return;
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) return;
    const isCorrect = selected === quiz.correctAnswer;
    setShowResults(prev => ({ ...prev, [quizId]: true }));
    submitQuizAnswer.mutate({ quizId, selectedAnswer: selected, isCorrect }, {
      onSuccess: (data) => {
        if (data.lessonCompleted) {
          playCompletionSound();
          toast({ title: "Module Completed", description: "All quizzes answered! Module marked as complete." });
        }
      },
    });
  };

  const handleMarkComplete = () => {
    markComplete.mutate({ resourceType: 'lesson', resourceId: id }, {
      onSuccess: () => {
        playCompletionSound();
        toast({ title: "Module Completed", description: "Progress saved. Keep going, analyst." });
      },
    });
  };

  if (lessonLoading || quizzesLoading || answersLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: theme.accent }} />
        </div>
      </Layout>
    );
  }

  if (!lesson) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Lesson not found</h2>
          <Link href="/learn" className="text-primary hover:underline">Return to Learning Paths</Link>
        </div>
      </Layout>
    );
  }

  const diff = difficultyConfig[lesson.difficulty || "Beginner"] || difficultyConfig.Beginner;
  const totalQuizzes = quizzes?.length || 0;
  const answeredCount = Object.keys(showResults).length;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto pb-20">
        {/* Back */}
        <Link href={theme.backHref}>
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {theme.backLabel}
          </button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span
              className="px-2 py-1 rounded text-xs font-mono border uppercase"
              style={{ background: theme.accentDim, borderColor: theme.border, color: theme.accent }}
            >
              {lesson.category}
            </span>
            <Badge variant="outline" className={`text-[10px] font-mono uppercase ${diff.className}`}>
              {lesson.difficulty}
            </Badge>
            {isCompleted && (
              <Badge variant="outline" className="text-[10px] font-mono uppercase bg-green-500/10 text-green-400 border-green-500/20">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">
            {lesson.title}
          </h1>
          {/* Accent underline in path color */}
          <div className="h-1 w-20 rounded-full" style={{ background: theme.accent }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* ── CONTENT ── */}
          <div className="lg:col-span-2">
            <div className="prose prose-invert prose-headings:font-display prose-headings:font-bold prose-pre:bg-transparent prose-pre:p-0 prose-img:rounded-xl prose-img:border prose-img:border-border prose-img:shadow-lg max-w-none"
              style={{
                "--tw-prose-code": theme.accent,
                "--tw-prose-pre-code": theme.accent,
              } as React.CSSProperties}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return match ? (
                      <CodeBlock code={String(children).replace(/\n$/, '')} language={match[1]} />
                    ) : (
                      <code
                        className={className}
                        style={{ color: theme.accent, background: theme.accentDim, padding: "1px 5px", borderRadius: "4px" }}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  p({ children, node, ...props }) {
                    const childArray = Array.isArray(children) ? children : [children];
                    const hasBlock = childArray.some((c: any) => {
                      if (!c || typeof c !== 'object') return false;
                      const typeName = typeof c.type === 'string' ? c.type : c.type?.name || '';
                      return typeName === 'img' || typeName === 'figure';
                    });
                    if (hasBlock || node?.children?.some((c: any) => c.tagName === 'img')) return <div {...props}>{children}</div>;
                    return <p {...props}>{children}</p>;
                  },
                  img({ src, alt, ...props }) {
                    return (
                      <figure className="my-8">
                        <img src={src} alt={alt || ''} className="w-full rounded-xl border border-border shadow-lg" loading="lazy" {...props} />
                        {alt && <figcaption className="text-center text-xs text-muted-foreground mt-3 font-mono">{alt}</figcaption>}
                      </figure>
                    );
                  },
                  a({ href, children, ...props }) {
                    return <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: theme.accent }} className="underline underline-offset-4" {...props}>{children}</a>;
                  },
                  table({ children, ...props }) {
                    return <div className="overflow-x-auto my-6 rounded-lg border border-border"><table className="w-full text-sm" {...props}>{children}</table></div>;
                  },
                  thead({ children, ...props }) {
                    return <thead className="bg-muted/50 border-b border-border" {...props}>{children}</thead>;
                  },
                  th({ children, ...props }) {
                    return <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider" style={{ color: theme.accent }} {...props}>{children}</th>;
                  },
                  td({ children, ...props }) {
                    return <td className="px-4 py-3 border-t border-border/50" {...props}>{children}</td>;
                  },
                  tr({ children, ...props }) {
                    return <tr className="hover:bg-muted/30 transition-colors" {...props}>{children}</tr>;
                  },
                  blockquote({ children, ...props }) {
                    return (
                      <blockquote
                        className="my-4 pl-4 py-3 rounded-r-lg italic text-sm"
                        style={{ borderLeft: `3px solid ${theme.accent}`, background: theme.accentDim }}
                        {...props}
                      >
                        {children}
                      </blockquote>
                    );
                  },
                }}
              >
                {lesson.content}
              </ReactMarkdown>
            </div>

            {/* Mark complete */}
            <div className="mt-12 pt-8 border-t border-border">
              {isCompleted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 p-4 rounded-lg"
                  style={{ background: theme.accentDim, border: `1px solid ${theme.border}`, color: theme.accent }}
                >
                  <CheckCircle2 className="w-6 h-6" />
                  <div>
                    <div className="font-bold">Module Completed</div>
                    <div className="text-xs opacity-80">Your progress has been recorded.</div>
                  </div>
                </motion.div>
              ) : (
                <button
                  onClick={handleMarkComplete}
                  disabled={markComplete.isPending}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: theme.accentDim, border: `1px solid ${theme.border}`, color: theme.accent }}
                >
                  {markComplete.isPending
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <CheckCircle2 className="w-4 h-4" />
                  }
                  Mark Module as Completed
                </button>
              )}
            </div>
          </div>

          {/* ── QUIZ SIDEBAR ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {quizzes && quizzes.length > 0 && (
                <div
                  className="rounded-xl p-6"
                  style={{ background: "#0e1220", border: `1px solid ${theme.border}` }}
                >
                  <div className="flex items-center justify-between gap-2 mb-6">
                    <div className="flex items-center gap-2 text-base font-bold">
                      <HelpCircle className="w-5 h-5" style={{ color: theme.accent }} />
                      Knowledge Check
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">
                      {answeredCount}/{totalQuizzes}
                    </span>
                  </div>

                  <div className="space-y-8">
                    {quizzes.map((quiz, idx) => {
                      const saved = savedAnswerMap[quiz.id];
                      const isAnswered = showResults[quiz.id] || !!saved;
                      const selected = saved ? saved.selectedAnswer : selectedAnswers[quiz.id];
                      const isCorrect = saved ? saved.isCorrect : (selected === quiz.correctAnswer);
                      const options = (quiz.options as string[]) || [];

                      return (
                        <div key={quiz.id} className="space-y-3">
                          <p className="font-medium text-sm text-foreground/90">
                            <span className="mr-2 font-mono" style={{ color: theme.accent }}>{idx + 1}.</span>
                            {quiz.question}
                          </p>

                          <div className="space-y-2">
                            {options.map((option, optIdx) => {
                              let style: React.CSSProperties = {};
                              let className = "p-3 rounded-md text-sm border transition-all duration-200 cursor-pointer";

                              if (isAnswered) {
                                if (optIdx === quiz.correctAnswer) {
                                  className += " border-green-500/50 bg-green-500/10 text-green-400";
                                } else if (optIdx === selected && optIdx !== quiz.correctAnswer) {
                                  className += " border-red-500/50 bg-red-500/10 text-red-400";
                                } else {
                                  className += " border-border opacity-40 cursor-not-allowed";
                                }
                              } else if (selected === optIdx) {
                                className += " border text-sm";
                                style = { borderColor: theme.accent, background: theme.accentDim, color: theme.accent };
                              } else {
                                className += " border-border hover:bg-muted/50";
                              }

                              return (
                                <div
                                  key={optIdx}
                                  onClick={() => handleSelectOption(quiz.id, optIdx)}
                                  className={className}
                                  style={style}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span>{option}</span>
                                    {isAnswered && optIdx === quiz.correctAnswer && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
                                    {isAnswered && optIdx === selected && optIdx !== quiz.correctAnswer && <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {!isAnswered ? (
                            <button
                              onClick={() => handleSubmitQuiz(quiz.id)}
                              disabled={selectedAnswers[quiz.id] === undefined || submitQuizAnswer.isPending}
                              className="w-full mt-2 py-2 px-4 rounded-md text-sm font-medium transition-all hover:opacity-90 disabled:opacity-40"
                              style={{ background: theme.accentDim, border: `1px solid ${theme.border}`, color: theme.accent }}
                            >
                              {submitQuizAnswer.isPending ? <Loader2 className="w-3 h-3 animate-spin inline mr-1" /> : null}
                              Submit Answer
                            </button>
                          ) : (
                            <AnimatePresence>
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className={`text-xs p-3 rounded border ${isCorrect ? 'text-green-400 bg-green-400/10 border-green-500/20' : 'text-red-400 bg-red-400/10 border-red-500/20'}`}
                              >
                                <div className="font-bold mb-1">{isCorrect ? "Correct!" : "Incorrect."}</div>
                                {quiz.explanation && <div className="opacity-90">{quiz.explanation}</div>}
                              </motion.div>
                            </AnimatePresence>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {totalQuizzes > 0 && answeredCount === totalQuizzes && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-3 rounded-lg text-center"
                      style={{ background: theme.accentDim, border: `1px solid ${theme.border}` }}
                    >
                      <p className="text-xs font-mono" style={{ color: theme.accent }}>
                        All quizzes completed ✓
                      </p>
                    </motion.div>
                  )}
                </div>
              )}

              <Link href={theme.backHref}>
                <div
                  className="block w-full p-4 text-center rounded-lg border border-dashed text-muted-foreground transition-all cursor-pointer"
                  style={{ borderColor: theme.border }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = theme.accent; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = ''; }}
                >
                  All Modules
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
