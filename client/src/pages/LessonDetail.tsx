import Layout from "@/components/Layout";
import { useLesson, useLessonQuizzes, useQuizAnswers, useSubmitQuizAnswer } from "@/hooks/use-lessons";
import { useProgress, useMarkComplete } from "@/hooks/use-progress";
import { useRoute, Link } from "wouter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2, ArrowLeft, CheckCircle2, AlertCircle, HelpCircle, BookOpen } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { CodeBlock } from "@/components/CodeBlock";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { playCompletionSound } from "@/lib/sounds";

const difficultyConfig: Record<string, { className: string }> = {
  Beginner: { className: "bg-green-500/10 text-green-400 border-green-500/20" },
  Intermediate: { className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  Advanced: { className: "bg-red-500/10 text-red-400 border-red-500/20" },
};

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

  const savedAnswerMap = useMemo(() => {
    const map: Record<number, { selectedAnswer: number; isCorrect: boolean }> = {};
    if (savedAnswers) {
      for (const a of savedAnswers) {
        map[a.quizId] = { selectedAnswer: a.selectedAnswer, isCorrect: a.isCorrect };
      }
    }
    return map;
  }, [savedAnswers]);

  useEffect(() => {
    if (savedAnswers && savedAnswers.length > 0) {
      const answers: Record<number, number> = {};
      const results: Record<number, boolean> = {};
      for (const a of savedAnswers) {
        answers[a.quizId] = a.selectedAnswer;
        results[a.quizId] = true;
      }
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

    submitQuizAnswer.mutate(
      { quizId, selectedAnswer: selected, isCorrect },
      {
        onSuccess: (data) => {
          if (data.lessonCompleted) {
            playCompletionSound();
            toast({ title: "Module Completed", description: "All quizzes answered! Module marked as complete." });
          }
        },
      }
    );
  };

  const handleMarkComplete = () => {
    markComplete.mutate(
      { resourceType: 'lesson', resourceId: id },
      {
        onSuccess: () => {
          playCompletionSound();
          toast({ title: "Module Completed", description: "Progress saved. Keep going, analyst." });
        },
      }
    );
  };

  if (lessonLoading || quizzesLoading || answersLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!lesson) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Lesson not found</h2>
          <Link href="/lessons" className="text-primary hover:underline">Return to list</Link>
        </div>
      </Layout>
    );
  }

  const diff = difficultyConfig[lesson.difficulty || "Beginner"] || difficultyConfig.Beginner;

  const totalQuizzes = quizzes?.length || 0;
  const answeredCount = Object.keys(showResults).length;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto pb-20">
        <div className="mb-8">
          <Link href="/lessons">
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4 group" data-testid="button-back-lessons">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Modules
            </button>
          </Link>

          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-mono border border-primary/20 uppercase">
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

          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-6" data-testid="text-lesson-title">
            {lesson.title}
          </h1>
          <div className="h-1 w-20 bg-primary rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <div className="prose prose-invert prose-headings:font-display prose-headings:font-bold prose-code:text-primary prose-code:bg-primary/5 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-transparent prose-pre:p-0 prose-img:rounded-xl prose-img:border prose-img:border-border prose-img:shadow-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return match ? (
                      <CodeBlock
                        code={String(children).replace(/\n$/, '')}
                        language={match[1]}
                      />
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  },
                  p({ children, node, ...props }) {
                    const childArray = Array.isArray(children) ? children : [children];
                    const hasBlock = childArray.some((c: any) => {
                      if (!c) return false;
                      if (typeof c === 'object' && c.type) {
                        const typeName = typeof c.type === 'string' ? c.type : c.type?.name || c.type?.displayName || '';
                        return typeName === 'img' || typeName === 'figure';
                      }
                      return false;
                    });
                    const nodeHasImg = node?.children?.some((c: any) => c.tagName === 'img');
                    if (hasBlock || nodeHasImg) return <div {...props}>{children}</div>;
                    return <p {...props}>{children}</p>;
                  },
                  img({ src, alt, ...props }) {
                    return (
                      <figure className="my-8">
                        <img
                          src={src}
                          alt={alt || ''}
                          className="w-full rounded-xl border border-border shadow-lg"
                          loading="lazy"
                          {...props}
                        />
                        {alt && (
                          <figcaption className="text-center text-xs text-muted-foreground mt-3 font-mono">
                            {alt}
                          </figcaption>
                        )}
                      </figure>
                    );
                  },
                  a({ href, children, ...props }) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline underline-offset-4"
                        {...props}
                      >
                        {children}
                      </a>
                    );
                  },
                  table({ children, ...props }) {
                    return (
                      <div className="overflow-x-auto my-6 rounded-lg border border-border">
                        <table className="w-full text-sm" {...props}>{children}</table>
                      </div>
                    );
                  },
                  thead({ children, ...props }) {
                    return <thead className="bg-muted/50 border-b border-border" {...props}>{children}</thead>;
                  },
                  th({ children, ...props }) {
                    return <th className="px-4 py-3 text-left font-bold text-primary text-xs uppercase tracking-wider" {...props}>{children}</th>;
                  },
                  td({ children, ...props }) {
                    return <td className="px-4 py-3 border-t border-border/50" {...props}>{children}</td>;
                  },
                  tr({ children, ...props }) {
                    return <tr className="hover:bg-muted/30 transition-colors" {...props}>{children}</tr>;
                  }
                }}
              >
                {lesson.content}
              </ReactMarkdown>
            </div>

            <div className="mt-12 pt-8 border-t border-border">
              {isCompleted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400"
                >
                  <CheckCircle2 className="w-6 h-6" />
                  <div>
                    <div className="font-bold">Module Completed</div>
                    <div className="text-xs opacity-80">Your progress has been recorded.</div>
                  </div>
                </motion.div>
              ) : (
                <Button
                  onClick={handleMarkComplete}
                  disabled={markComplete.isPending}
                  className="w-full"
                  data-testid="button-mark-complete"
                >
                  {markComplete.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  Mark Module as Completed
                </Button>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {quizzes && quizzes.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-6 shadow-xl shadow-black/20">
                  <div className="flex items-center justify-between gap-2 mb-6">
                    <div className="flex items-center gap-2 text-lg font-bold">
                      <HelpCircle className="w-5 h-5 text-primary" />
                      Knowledge Check
                    </div>
                    <span className="text-xs font-mono text-muted-foreground" data-testid="text-quiz-progress">
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
                        <div key={quiz.id} className="space-y-3" data-testid={`quiz-block-${quiz.id}`}>
                          <p className="font-medium text-sm text-foreground/90">
                            <span className="text-primary mr-2">{idx + 1}.</span>
                            {quiz.question}
                          </p>

                          <div className="space-y-2">
                            {options.map((option, optIdx) => {
                              let itemClass = "border-border hover:bg-muted/50 cursor-pointer";

                              if (isAnswered) {
                                if (optIdx === quiz.correctAnswer) {
                                  itemClass = "border-green-500/50 bg-green-500/10 text-green-400";
                                } else if (optIdx === selected && optIdx !== quiz.correctAnswer) {
                                  itemClass = "border-red-500/50 bg-red-500/10 text-red-400";
                                } else {
                                  itemClass = "border-border opacity-50 cursor-not-allowed";
                                }
                              } else if (selected === optIdx) {
                                itemClass = "border-primary bg-primary/10 text-primary";
                              }

                              return (
                                <div
                                  key={optIdx}
                                  onClick={() => handleSelectOption(quiz.id, optIdx)}
                                  className={`p-3 rounded-md text-sm border transition-all duration-200 ${itemClass}`}
                                  data-testid={`quiz-option-${quiz.id}-${optIdx}`}
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
                            <Button
                              onClick={() => handleSubmitQuiz(quiz.id)}
                              disabled={selectedAnswers[quiz.id] === undefined || submitQuizAnswer.isPending}
                              size="sm"
                              className="w-full mt-2"
                              data-testid={`button-submit-quiz-${quiz.id}`}
                            >
                              {submitQuizAnswer.isPending ? (
                                <Loader2 className="w-3 h-3 animate-spin mr-2" />
                              ) : null}
                              Submit Answer
                            </Button>
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
                      className="mt-6 p-3 bg-primary/10 border border-primary/20 rounded-lg text-center"
                    >
                      <p className="text-xs font-mono text-primary" data-testid="text-all-quizzes-done">
                        All quizzes completed
                      </p>
                    </motion.div>
                  )}
                </div>
              )}

              <Link href="/lessons">
                <div className="block w-full p-4 text-center rounded-lg border border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary/50 cursor-pointer transition-all" data-testid="link-all-modules">
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
