import { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@shared/routes";
import { useCreateChallenge, useUpdateChallenge, type ChallengeFormInput } from "@/hooks/use-admin-challenges";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert, Plus, X, ArrowLeft, AlertCircle, Paperclip } from "lucide-react";

function useChallenge(id?: number) {
  return useQuery({
    queryKey: [api.challenges.get.path, id],
    queryFn: async () => {
      const url = api.challenges.get.path.replace(":id", String(id));
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch challenge");
      return res.json() as Promise<{
        id: number; title: string; description: string; difficulty: string; category: string;
        flag: string; hints: string[]; artifact: string | null; technicalContext: string | null;
        fileUrl: string | null; fileName: string | null; learningPathSlug: string | null;
      }>;
    },
    enabled: !!id,
  });
}

const inputClass = "w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors";

export default function AdminChallengeForm() {
  const { user, isLoading: authLoading } = useAuth();
  const [, editParams] = useRoute("/admin/challenges/:id/edit");
  const [, navigate] = useLocation();
  const isEdit = !!editParams?.id;
  const challengeId = isEdit ? Number(editParams!.id) : undefined;

  const { data: existing, isLoading: challengeLoading } = useChallenge(challengeId);
  const { data: learningPaths } = useQuery({
    queryKey: ["/api/learning-paths"],
    queryFn: async () => {
      const res = await fetch("/api/learning-paths");
      if (!res.ok) throw new Error("Failed to fetch learning paths");
      return res.json() as Promise<Array<{ slug: string; title: string }>>;
    },
  });

  const createChallenge = useCreateChallenge();
  const updateChallenge = useUpdateChallenge(challengeId ?? 0);
  const mutation = isEdit ? updateChallenge : createChallenge;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Easy");
  const [category, setCategory] = useState("");
  const [flag, setFlag] = useState("");
  const [hints, setHints] = useState<string[]>([""]);
  const [artifact, setArtifact] = useState("");
  const [technicalContext, setTechnicalContext] = useState("");
  const [learningPathSlug, setLearningPathSlug] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setDescription(existing.description);
      setDifficulty((existing.difficulty as "Easy" | "Medium" | "Hard") || "Easy");
      setCategory(existing.category);
      setFlag(existing.flag);
      setHints(existing.hints && existing.hints.length > 0 ? existing.hints : [""]);
      setArtifact(existing.artifact || "");
      setTechnicalContext(existing.technicalContext || "");
      setLearningPathSlug(existing.learningPathSlug || "");
    }
  }, [existing]);

  const updateHint = (idx: number, value: string) => {
    setHints((prev) => prev.map((h, i) => (i === idx ? value : h)));
  };
  const addHint = () => setHints((prev) => [...prev, ""]);
  const removeHint = (idx: number) => setHints((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: ChallengeFormInput = {
      title, description, difficulty, category, flag, hints,
      artifact: artifact || undefined,
      technicalContext: technicalContext || undefined,
      learningPathSlug: learningPathSlug || undefined,
      file,
    };
    mutation.mutate(payload, {
      onSuccess: () => navigate("/admin/challenges"),
    });
  };

  if (authLoading) {
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

  if (isEdit && challengeLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto pb-20">
        <Link href="/admin/challenges">
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            All Challenges
          </button>
        </Link>

        <h1 className="text-3xl font-display font-bold tracking-tight mb-8">
          {isEdit ? "Edit Challenge" : "New Challenge"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as "Easy" | "Medium" | "Hard")}
                className={inputClass}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Category</label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} required placeholder="e.g. static-analysis" />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Learning Path</label>
            <select
              value={learningPathSlug}
              onChange={(e) => setLearningPathSlug(e.target.value)}
              className={inputClass}
            >
              <option value="">— None —</option>
              {learningPaths?.map((p) => (
                <option key={p.slug} value={p.slug}>{p.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Flag</label>
            <Input value={flag} onChange={(e) => setFlag(e.target.value)} required placeholder="e.g. process_injection" className="font-mono" />
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Hints</label>
            <div className="space-y-2">
              {hints.map((hint, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={hint}
                    onChange={(e) => updateHint(idx, e.target.value)}
                    placeholder={`Hint ${idx + 1}`}
                  />
                  {hints.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeHint(idx)}
                      className="p-2 text-muted-foreground hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addHint}
                className="flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Add hint
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Artifact <span className="normal-case text-muted-foreground/60">(text shown to students — logs, code, dumps, etc.)</span>
            </label>
            <textarea
              value={artifact}
              onChange={(e) => setArtifact(e.target.value)}
              rows={8}
              className={`${inputClass} font-mono text-xs`}
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Technical Context <span className="normal-case text-muted-foreground/60">(shown after solving)</span>
            </label>
            <textarea
              value={technicalContext}
              onChange={(e) => setTechnicalContext(e.target.value)}
              rows={4}
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Attached File <span className="normal-case text-muted-foreground/60">(optional — for offline analysis)</span>
            </label>
            {existing?.fileName && !file && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 bg-muted/30 border border-border rounded-md px-3 py-2">
                <Paperclip className="w-3.5 h-3.5 flex-shrink-0" />
                Current file: <span className="text-foreground">{existing.fileName}</span>
              </div>
            )}
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-sm text-muted-foreground file:mr-3 file:py-2 file:px-3 file:rounded-md file:border file:border-border file:bg-background file:text-foreground file:text-sm hover:file:bg-muted/50 file:cursor-pointer cursor-pointer"
            />
            {existing?.fileName && (
              <p className="text-xs text-muted-foreground/60 mt-1.5">
                Choosing a new file replaces the current one. Leave empty to keep it.
              </p>
            )}
          </div>

          {mutation.isError && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {mutation.error instanceof Error ? mutation.error.message : "Something went wrong"}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : isEdit ? "Save Changes" : "Create Challenge"}
            </Button>
            <Link href="/admin/challenges">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </Layout>
  );
}
