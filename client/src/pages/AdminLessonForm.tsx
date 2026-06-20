import { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useLesson, useLessonQuizzes } from "@/hooks/use-lessons";
import { useCreateLesson, useUpdateLesson, type LessonFormInput, type QuizInput } from "@/hooks/use-admin-lessons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert, ArrowLeft, AlertCircle, Plus, X, Trash2, Check, HelpCircle } from "lucide-react";

const inputClass = "w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors";

function emptyQuiz(): QuizInput {
  return { question: "", options: ["", ""], correctAnswer: 0, explanation: "" };
}

export default function AdminLessonForm() {
  const { user, isLoading: authLoading } = useAuth();
  const [, editParams] = useRoute("/admin/lessons/:id/edit");
  const [, navigate] = useLocation();
  const isEdit = !!editParams?.id;
  const lessonId = isEdit ? Number(editParams!.id) : undefined;

  const { data: existingLesson, isLoading: lessonLoading } = useLesson(lessonId ?? 0);
  const { data: existingQuizzes, isLoading: quizzesLoading } = useLessonQuizzes(lessonId ?? 0);
  const { data: learningPaths } = useQuery({
    queryKey: ["/api/learning-paths"],
    queryFn: async () => {
      const res = await fetch("/api/learning-paths");
      if (!res.ok) throw new Error("Failed to fetch learning paths");
      return res.json() as Promise<Array<{ slug: string; title: string }>>;
    },
  });

  const createLesson = useCreateLesson();
  const updateLesson = useUpdateLesson(lessonId ?? 0);
  const mutation = isEdit ? updateLesson : createLesson;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [order, setOrder] = useState(0);
  const [learningPathSlug, setLearningPathSlug] = useState("");
  const [quizzes, setQuizzes] = useState<QuizInput[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (existingLesson && !hydrated) {
      setTitle(existingLesson.title);
      setSlug(existingLesson.slug);
      setContent(existingLesson.content);
      setCategory(existingLesson.category);
      setDifficulty((existingLesson.difficulty as any) || "Beginner");
      setOrder(existingLesson.order);
      setLearningPathSlug(existingLesson.learningPathSlug || "");
    }
  }, [existingLesson, hydrated]);

  useEffect(() => {
    if (existingQuizzes && !hydrated) {
      setQuizzes(
        existingQuizzes.length > 0
          ? existingQuizzes.map((q) => ({
              id: q.id,
              question: q.question,
              options: (q.options as string[]) || ["", ""],
              correctAnswer: q.correctAnswer,
              explanation: q.explanation || "",
            }))
          : []
      );
      setHydrated(true);
    } else if (!isEdit && !hydrated) {
      setHydrated(true);
    }
  }, [existingQuizzes, hydrated, isEdit]);

  const addQuiz = () => setQuizzes((prev) => [...prev, emptyQuiz()]);
  const removeQuiz = (idx: number) => setQuizzes((prev) => prev.filter((_, i) => i !== idx));
  const updateQuizField = (idx: number, field: keyof QuizInput, value: any) =>
    setQuizzes((prev) => prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q)));

  const addOption = (qIdx: number) =>
    setQuizzes((prev) => prev.map((q, i) => (i === qIdx ? { ...q, options: [...q.options, ""] } : q)));

  const updateOption = (qIdx: number, oIdx: number, value: string) =>
    setQuizzes((prev) =>
      prev.map((q, i) => (i === qIdx ? { ...q, options: q.options.map((o, oi) => (oi === oIdx ? value : o)) } : q))
    );

  const removeOption = (qIdx: number, oIdx: number) =>
    setQuizzes((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const newOptions = q.options.filter((_, oi) => oi !== oIdx);
        let newCorrect = q.correctAnswer;
        if (oIdx === q.correctAnswer) newCorrect = 0;
        else if (oIdx < q.correctAnswer) newCorrect = q.correctAnswer - 1;
        return { ...q, options: newOptions, correctAnswer: newCorrect };
      })
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: LessonFormInput = {
      title, slug, content, category, difficulty, order,
      learningPathSlug: learningPathSlug || undefined,
      quizzes: quizzes.filter((q) => q.question.trim().length > 0),
    };
    mutation.mutate(payload, { onSuccess: () => navigate("/admin/lessons") });
  };

  const isLoading = authLoading || (isEdit && (lessonLoading || quizzesLoading || !hydrated));

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!user?.isAdmin) {
    return (
      <Layout>
        <div className="max-w-md mx-auto text-center py-20">
          <ShieldAlert className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-display font-bold mb-2">Admin access required</h1>
          <p className="text-sm text-muted-foreground">You don't have permission to view this page.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto pb-24">
        <Link href="/admin/lessons">
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            All Lessons
          </button>
        </Link>

        <h1 className="text-3xl font-display font-bold tracking-tight mb-8">
          {isEdit ? "Edit Lesson" : "New Lesson"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. 01. Why Malware Analysis?" />
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Slug</label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} required placeholder="e.g. why-malware-analysis" className="font-mono" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Category</label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} required placeholder="e.g. foundations" />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)} className={inputClass}>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Order</label>
              <Input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} required />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Learning Path</label>
            <select value={learningPathSlug} onChange={(e) => setLearningPathSlug(e.target.value)} className={inputClass}>
              <option value="">— None —</option>
              {learningPaths?.map((p) => (
                <option key={p.slug} value={p.slug}>{p.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Content <span className="normal-case text-muted-foreground/60">(Markdown)</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={16}
              className={`${inputClass} font-mono text-xs`}
            />
          </div>

          {/* -- Quiz Builder -- */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-bold">Knowledge Check</h2>
                <span className="text-xs font-mono text-muted-foreground">{quizzes.length}</span>
              </div>
            </div>

            <div className="space-y-4">
              {quizzes.map((quiz, qIdx) => (
                <div key={qIdx} className="bg-card border border-border rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      Question {qIdx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeQuiz(qIdx)}
                      className="text-muted-foreground hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Input
                    value={quiz.question}
                    onChange={(e) => updateQuizField(qIdx, "question", e.target.value)}
                    placeholder="Question text"
                    required
                  />

                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground/60 block">
                      Click the circle to mark the correct answer
                    </label>
                    {quiz.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuizField(qIdx, "correctAnswer", oIdx)}
                          title="Mark as correct answer"
                          className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors ${
                            quiz.correctAnswer === oIdx ? "bg-green-500 border-green-500" : "border-border hover:border-foreground/40"
                          }`}
                        >
                          {quiz.correctAnswer === oIdx && <Check className="w-3 h-3 text-black" />}
                        </button>
                        <Input
                          value={opt}
                          onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                          placeholder={`Option ${oIdx + 1}`}
                          required
                        />
                        {quiz.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(qIdx, oIdx)}
                            className="text-muted-foreground hover:text-red-400 transition-colors flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addOption(qIdx)}
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add option
                    </button>
                  </div>

                  <textarea
                    value={quiz.explanation}
                    onChange={(e) => updateQuizField(qIdx, "explanation", e.target.value)}
                    placeholder="Explanation (shown to students after they answer)"
                    rows={2}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addQuiz}
              className="mt-4 flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Plus className="w-4 h-4" /> Add Question
            </button>
          </div>

          {mutation.isError && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {mutation.error instanceof Error ? mutation.error.message : "Something went wrong"}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : isEdit ? "Save Changes" : "Create Lesson"}
            </Button>
            <Link href="/admin/lessons">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </Layout>
  );
}
