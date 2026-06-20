import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useLessons } from "@/hooks/use-lessons";
import { useDeleteLesson } from "@/hooks/use-admin-lessons";
import { Loader2, Plus, Pencil, Trash2, ShieldAlert, HelpCircle } from "lucide-react";

const difficultyClass: Record<string, string> = {
  Beginner: "bg-green-500/10 text-green-400 border-green-500/20",
  Intermediate: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Advanced: "bg-red-500/10 text-red-400 border-red-500/20",
};

const UNASSIGNED = "__unassigned__";

export default function AdminLessons() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: lessons, isLoading: lessonsLoading } = useLessons();
  const { data: learningPaths } = useQuery({
    queryKey: ["/api/learning-paths"],
    queryFn: async () => {
      const res = await fetch("/api/learning-paths");
      if (!res.ok) throw new Error("Failed to fetch learning paths");
      return res.json() as Promise<Array<{ slug: string; title: string }>>;
    },
  });
  const deleteLesson = useDeleteLesson();
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const groups = useMemo(() => {
    if (!lessons) return [];
    const map = new Map<string, typeof lessons>();
    for (const l of lessons) {
      const key = l.learningPathSlug || UNASSIGNED;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(l);
    }
    for (const arr of map.values()) arr.sort((a, b) => (a.order || 0) - (b.order || 0));
    const pathOrder = (learningPaths || []).map((p) => p.slug);
    const orderedKeys = [
      ...pathOrder.filter((k) => map.has(k)),
      ...Array.from(map.keys()).filter((k) => k !== UNASSIGNED && !pathOrder.includes(k)),
      ...(map.has(UNASSIGNED) ? [UNASSIGNED] : []),
    ];
    return orderedKeys.map((key) => ({
      slug: key,
      title: key === UNASSIGNED ? "Unassigned" : learningPaths?.find((p) => p.slug === key)?.title || key,
      items: map.get(key)!,
    }));
  }, [lessons, learningPaths]);

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

  const handleDelete = (id: number) => {
    setDeleteError(null);
    if (pendingDeleteId !== id) {
      setPendingDeleteId(id);
      return;
    }
    deleteLesson.mutate(id, {
      onError: (err) => setDeleteError(err instanceof Error ? err.message : "Failed to delete"),
      onSettled: () => setPendingDeleteId(null),
    });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6 text-sm">
          <Link href="/admin/challenges">
            <span className="text-muted-foreground hover:text-foreground cursor-pointer">Challenges</span>
          </Link>
          <Link href="/admin/learning-paths">
            <span className="text-muted-foreground hover:text-foreground cursor-pointer">Learning Paths</span>
          </Link>
          <span className="text-foreground font-medium">Lessons</span>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">// Admin</span>
            <h1 className="text-3xl font-display font-bold tracking-tight">Lessons</h1>
          </div>
          <Link href="/admin/lessons/new">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 cursor-pointer transition-opacity">
              <Plus className="w-4 h-4" />
              New Lesson
            </span>
          </Link>
        </div>

        {deleteError && (
          <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {deleteError}
          </div>
        )}

        {lessonsLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : !lessons || lessons.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground text-sm">
            No lessons yet. Create your first one.
          </div>
        ) : (
          <div className="space-y-10">
            {groups.map((group) => (
              <div key={group.slug}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{group.title}</h2>
                  <span className="text-xs font-mono text-muted-foreground/50">{group.items.length}</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="space-y-3">
                  {group.items.map((l) => (
                    <div
                      key={l.id}
                      className="bg-card border border-border rounded-xl p-5 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-[10px] font-mono text-muted-foreground/60">#{l.order}</span>
                          <span className="text-[10px] font-mono uppercase text-muted-foreground">{l.category}</span>
                          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${difficultyClass[l.difficulty || "Beginner"] || ""}`}>
                            {l.difficulty}
                          </span>
                        </div>
                        <h3 className="font-bold truncate">{l.title}</h3>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link href={`/admin/lessons/${l.id}/edit`}>
                          <span className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 cursor-pointer transition-colors inline-flex">
                            <Pencil className="w-4 h-4" />
                          </span>
                        </Link>
                        <button
                          onClick={() => handleDelete(l.id)}
                          disabled={deleteLesson.isPending}
                          className={`p-2 rounded-lg border text-sm transition-colors inline-flex items-center gap-1.5 ${
                            pendingDeleteId === l.id
                              ? "border-red-500/50 bg-red-500/10 text-red-400 px-3"
                              : "border-border text-muted-foreground hover:text-red-400 hover:border-red-500/30"
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                          {pendingDeleteId === l.id && (deleteLesson.isPending ? "Deleting..." : "Confirm?")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
